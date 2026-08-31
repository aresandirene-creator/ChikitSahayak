import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getZai } from "@/lib/zai";
import {
  buildHistorySystemPrompt,
  parseAssistantReply,
} from "@/lib/medical-prompts";

// POST /api/chat — one turn of the AI history-taking conversation.
// Body: { patientId, encounterId?, message, language? }
// `language` is the CURRENT UI language (may differ from patient.language if
// the user switched mid-process). TTS is handled client-side via the browser's
// Web Speech API.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, encounterId, message, language } = body;
    if (!patientId || !message) {
      return NextResponse.json({ error: "patientId and message required" }, { status: 400 });
    }

    const patient = await db.patient.findUnique({ where: { id: patientId } });
    if (!patient) return NextResponse.json({ error: "patient not found" }, { status: 404 });

    // Use the current language from the request (so mid-process language
    // switches take effect immediately). Fall back to the patient's stored
    // language if not provided.
    const activeLang = language || patient.language || "en";

    // If the user switched language, update the patient record so future
    // requests (summary generation, etc.) also use the new language.
    if (language && language !== patient.language) {
      await db.patient.update({ where: { id: patientId }, data: { language } });
    }

    // Load prior chat history for THIS encounter (or all-time if no encounter)
    const priorTurns = await db.chatMessage.findMany({
      where: { patientId, ...(encounterId ? { encounterId } : {}) },
      orderBy: { createdAt: "asc" },
    });

    // Build completed-sections list
    const completedSections = Array.from(
      new Set(priorTurns.filter((t) => t.section && t.section !== "general").map((t) => t.section))
    );

    const systemPrompt = buildHistorySystemPrompt({
      language: activeLang,
      ayushMode: patient.ayushMode,
      patientName: patient.name,
      patientAge: patient.age ?? undefined,
      patientGender: patient.gender ?? undefined,
      completedSections,
    });

    // Build messages: system + history + new user message.
    // IMPORTANT: the system prompt uses the CURRENT language, so even if
    // previous turns were in a different language, the AI will switch to
    // the new language from this point on. We inject a short instruction
    // right before the user's message to force the switch.
    const langName = activeLang === "en" ? "English" :
      activeLang === "hi" ? "Hindi (हिन्दी)" :
      activeLang === "bn" ? "Bengali (বাংলা)" :
      activeLang === "ta" ? "Tamil (தமிழ்)" :
      activeLang === "te" ? "Telugu (తెలుగు)" :
      activeLang === "mr" ? "Marathi (मराठी)" :
      activeLang === "gu" ? "Gujarati (ગુજરાતી)" :
      activeLang === "kn" ? "Kannada (ಕನ್ನಡ)" :
      activeLang === "ml" ? "Malayalam (മലയാളം)" :
      activeLang === "pa" ? "Punjabi (ਪੰਜਾਬੀ)" :
      activeLang === "ur" ? "Urdu (اُردُو)" :
      activeLang === "or" ? "Odia (ଓଡ଼ିଆ)" : "English";

    const messages: Array<{ role: string; content: string }> = [
      { role: "assistant", content: systemPrompt },
      ...priorTurns.map((t) => ({ role: t.role, content: t.content })),
      { role: "assistant", content: `[LANGUAGE SWITCH] From this point onward, you MUST respond ONLY in ${langName}. Ignore the language of any previous messages in this conversation. Reply in ${langName} now.` },
      { role: "user", content: message },
    ];

    // Persist the user message
    await db.chatMessage.create({
      data: {
        patientId,
        encounterId: encounterId ?? null,
        role: "user",
        content: message,
        section: body.section ?? "general",
        language: activeLang,
      },
    });

    const zai = await getZai();
    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
    });

    const rawReply = completion.choices[0]?.message?.content ?? "";
    const parsed = parseAssistantReply(rawReply);

    // Persist the assistant reply (clean text only, without internal tags)
    const saved = await db.chatMessage.create({
      data: {
        patientId,
        encounterId: encounterId ?? null,
        role: "assistant",
        content: parsed.cleanText,
        section: parsed.section,
        language: activeLang,
      },
    });

    // Persist any red flags
    let savedRedFlags: Array<{ id: string; symptom: string; severity: string; reasoning: string | null; acknowledged: boolean; createdAt: string }> = [];
    if (parsed.redFlags.length > 0) {
      const created = await Promise.all(
        parsed.redFlags.map((rf) =>
          db.redFlagAlert.create({
            data: {
              patientId,
              encounterId: encounterId ?? null,
              symptom: rf.symptom,
              severity: rf.severity,
              reasoning: rf.reasoning,
            },
          })
        )
      );
      savedRedFlags = created.map((f) => ({
        id: f.id,
        symptom: f.symptom,
        severity: f.severity,
        reasoning: f.reasoning,
        acknowledged: f.acknowledged,
        createdAt: f.createdAt.toISOString(),
      }));
    }

    // TTS is handled entirely client-side via the browser's Web Speech API
    // (Google AI Studio-quality Indian-language voices). No server TTS.

    return NextResponse.json({
      reply: parsed.cleanText,
      section: parsed.section,
      language: activeLang,
      done: parsed.done,
      redFlags: savedRedFlags,
      messageId: saved.id,
    });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
