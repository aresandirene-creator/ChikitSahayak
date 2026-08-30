import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getZai } from "@/lib/zai";
import {
  buildHistorySystemPrompt,
  parseAssistantReply,
} from "@/lib/medical-prompts";

// POST /api/chat — one turn of the AI history-taking conversation.
// Body: { patientId, encounterId?, message }
// TTS is handled client-side via the browser's Web Speech API.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, encounterId, message } = body;
    if (!patientId || !message) {
      return NextResponse.json({ error: "patientId and message required" }, { status: 400 });
    }

    const patient = await db.patient.findUnique({ where: { id: patientId } });
    if (!patient) return NextResponse.json({ error: "patient not found" }, { status: 404 });

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
      language: patient.language || "en",
      ayushMode: patient.ayushMode,
      patientName: patient.name,
      patientAge: patient.age ?? undefined,
      patientGender: patient.gender ?? undefined,
      completedSections,
    });

    // Build messages: system + history + new user message
    const messages: Array<{ role: string; content: string }> = [
      { role: "assistant", content: systemPrompt },
      ...priorTurns.map((t) => ({ role: t.role, content: t.content })),
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
        language: patient.language || "en",
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
        language: patient.language || "en",
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
      language: patient.language || "en",
      done: parsed.done,
      redFlags: savedRedFlags,
      messageId: saved.id,
    });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// GET /api/chat?patientId=xxx&encounterId=yyy — fetch conversation history
export async function GET(req: NextRequest) {
  try {
    const patientId = req.nextUrl.searchParams.get("patientId");
    const encounterId = req.nextUrl.searchParams.get("encounterId");
    if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });
    const turns = await db.chatMessage.findMany({
      where: { patientId, ...(encounterId ? { encounterId } : {}) },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ turns });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
