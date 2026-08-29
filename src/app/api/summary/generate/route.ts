import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getZai } from "@/lib/zai";
import { buildSummarySystemPrompt } from "@/lib/medical-prompts";
import type { ClinicalSummarySections, ExtractedDocumentData } from "@/lib/types";

// Build the conversation + document context we feed the summariser
function buildUserContext(
  turns: Array<{ role: string; content: string; section: string }>,
  documents: Array<{ fileName: string; fileType: string; extractedData: string; recordDate: string | null }>,
  redFlags: Array<{ symptom: string; severity: string; reasoning: string | null }>
): string {
  const transcript = turns
    .map((t) => {
      const who = t.role === "user" ? "Patient" : t.role === "assistant" ? "MediKiosk" : "System";
      return `[${t.section}] ${who}: ${t.content}`;
    })
    .join("\n");

  const docsBlock = documents.length
    ? documents
        .map((d, i) => {
          let parsed: ExtractedDocumentData = {};
          try {
            parsed = JSON.parse(d.extractedData || "{}");
          } catch {
            parsed = {};
          }
          const date = d.recordDate ? ` (${d.recordDate.slice(0, 10)})` : "";
          return `--- Document ${i + 1}: ${d.fileName}${date} (${d.fileType}) ---
Diagnoses: ${(parsed.diagnoses ?? []).join(", ") || "n/a"}
Medicines: ${(parsed.medicines ?? []).map((m) => `${m.name}${m.dosage ? ` ${m.dosage}` : ""}${m.frequency ? ` ${m.frequency}` : ""}`).join("; ") || "n/a"}
Tests: ${(parsed.tests ?? []).map((t) => `${t.name}: ${t.value ?? ""}${t.unit ?? ""} (ref ${t.referenceRange ?? "n/a"})${t.abnormal ? " [ABNORMAL]" : ""}`).join("; ") || "n/a"}
Procedures: ${(parsed.procedures ?? []).join(", ") || "n/a"}
Vitals: ${(parsed.vitalSigns ?? []).map((v) => `${v.name}: ${v.value}`).join("; ") || "n/a"}
Raw: ${(parsed.rawText ?? "").slice(0, 600)}`;
        })
        .join("\n\n")
    : "No previous medical documents uploaded.";

  const redFlagsBlock = redFlags.length
    ? redFlags.map((f) => `- ${f.symptom} (${f.severity}): ${f.reasoning ?? ""}`).join("\n")
    : "None detected.";

  return `CONVERSATION TRANSCRIPT:
${transcript || "(empty)"}

PREVIOUS MEDICAL RECORDS:
${docsBlock}

DETECTED RED-FLAG SYMPTOMS:
${redFlagsBlock}

Now produce the structured clinical summary as instructed.`;
}

// POST /api/summary/generate — generate an AI clinical summary
// Body: { patientId }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId } = body;
    if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });

    const patient = await db.patient.findUnique({ where: { id: patientId } });
    if (!patient) return NextResponse.json({ error: "patient not found" }, { status: 404 });

    const [turns, documents, redFlags] = await Promise.all([
      db.chatMessage.findMany({ where: { patientId }, orderBy: { createdAt: "asc" } }),
      db.document.findMany({ where: { patientId, status: "completed" }, orderBy: { recordDate: "asc" } }),
      db.redFlagAlert.findMany({ where: { patientId }, orderBy: { createdAt: "asc" } }),
    ]);

    const systemPrompt = buildSummarySystemPrompt({
      patientName: patient.name,
      patientAge: patient.age ?? undefined,
      patientGender: patient.gender ?? undefined,
      ayushMode: patient.ayushMode,
    });

    const userContext = buildUserContext(
      turns.map((t) => ({ role: t.role, content: t.content, section: t.section })),
      documents.map((d) => ({
        fileName: d.fileName,
        fileType: d.fileType,
        extractedData: d.extractedData,
        recordDate: d.recordDate ? d.recordDate.toISOString() : null,
      })),
      redFlags.map((f) => ({ symptom: f.symptom, severity: f.severity, reasoning: f.reasoning }))
    );

    const zai = await getZai();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userContext },
      ],
      thinking: { type: "disabled" },
    });

    const freeText = completion.choices[0]?.message?.content ?? "";

    // Try to parse the markdown summary into sections (best-effort)
    const sections: ClinicalSummarySections = {};
    const sectionHeaders: Array<keyof ClinicalSummarySections> = [
      "hpi",
      "pastHistory",
      "medications",
      "allergies",
      "familyHistory",
      "ros",
      "socialHistory",
      "ayurvedic",
      "documents",
    ];
    const headerMap: Record<string, keyof ClinicalSummarySections> = {
      "hpi": "hpi",
      "history of present illness": "hpi",
      "past medical history": "pastHistory",
      "past history": "pastHistory",
      "current medications": "medications",
      "medications": "medications",
      "allergies": "allergies",
      "family history": "familyHistory",
      "review of systems": "ros",
      "ros": "ros",
      "social history": "socialHistory",
      "ayurvedic": "ayurvedic",
      "ayush": "ayurvedic",
      "ayurvedic / ayush history": "ayurvedic",
      "ayurvedic history": "ayurvedic",
      "significant findings from previous records": "documents",
      "previous records": "documents",
      "documents": "documents",
    };

    // Split by markdown headers (## or #)
    const lines = freeText.split("\n");
    let currentKey: keyof ClinicalSummarySections | null = null;
    let buffers: Record<string, string[]> = {};
    for (const line of lines) {
      const headerMatch = line.match(/^#+\s*(.+)$/);
      if (headerMatch) {
        // Normalise: remove parens, brackets, punctuation, lower-case
        const rawHeader = headerMatch[1].trim().toLowerCase();
        const normalised = rawHeader
          .replace(/[()[\]{}]/g, " ")
          .replace(/[.,:;!?]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        // Try exact match first
        let key: keyof ClinicalSummarySections | null = headerMap[normalised] ?? null;
        // Then try substring match against any known header label
        if (!key) {
          for (const hKey of Object.keys(headerMap)) {
            if (normalised === hKey || normalised.includes(hKey) || hKey.includes(normalised)) {
              key = headerMap[hKey];
              break;
            }
          }
        }
        // Special-case: a header containing "hpi" anywhere maps to hpi
        if (!key && /\bhpi\b/i.test(normalised)) key = "hpi";
        if (!key && /\bros\b/i.test(normalised)) key = "ros";
        if (!key && /ayush|ayurvedic/i.test(normalised)) key = "ayurvedic";
        if (key && sectionHeaders.includes(key)) {
          currentKey = key;
          if (!buffers[key]) buffers[key] = [];
          continue;
        }
        // Unknown header — keep collecting under the previous section if any
      }
      if (currentKey) buffers[currentKey].push(line);
    }
    for (const k of Object.keys(buffers)) {
      sections[k as keyof ClinicalSummarySections] = buffers[k].join("\n").trim();
    }

    // Persist or update summary
    const existing = await db.clinicalSummary.findFirst({ where: { patientId } });
    let summary;
    if (existing) {
      summary = await db.clinicalSummary.update({
        where: { id: existing.id },
        data: {
          sections: JSON.stringify(sections),
          freeText,
          status: "draft",
        },
      });
    } else {
      summary = await db.clinicalSummary.create({
        data: {
          patientId,
          sections: JSON.stringify(sections),
          freeText,
          status: "draft",
        },
      });
    }

    return NextResponse.json({
      id: summary.id,
      sections,
      freeText,
      redFlags: redFlags.map((f) => ({
        id: f.id,
        symptom: f.symptom,
        severity: f.severity,
        reasoning: f.reasoning,
        acknowledged: f.acknowledged,
        createdAt: f.createdAt.toISOString(),
      })),
      status: summary.status,
    });
  } catch (err) {
    console.error("POST /api/summary/generate error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
