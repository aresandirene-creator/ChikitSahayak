import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recognizeDocument } from "@/lib/local-ocr";
import type { ExtractedDocumentData } from "@/lib/types";

function firstJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\\\") escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "{") depth += 1;
    else if (char === "}" && --depth === 0) return text.slice(start, index + 1);
  }
  return null;
}

function normalizeRecordDate(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parts = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/);
  if (!parts) return undefined;
  const [, day, month, year] = parts;
  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function normalizeExtractedDocument(data: ExtractedDocumentData): ExtractedDocumentData {
  const recordDate = normalizeRecordDate(data.recordDate);
  return { ...data, ...(recordDate ? { recordDate } : {}) };
}

async function recognizeHandwritingWithGroq(
  dataUrl: string,
  fileType: string,
  ayushMode: boolean
): Promise<ExtractedDocumentData> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured");

  const prompt = `Extract this ${fileType} image into one JSON object only. Do not explain your work.
Use exactly these keys: documentType, recordDate, facility, physician, diagnoses, medicines, tests, procedures, vitalSigns, rawText.
Use null for absent scalar values and [] for absent arrays. medicines must be an array of {name,dosage,frequency,duration}; vitalSigns must be an array of {name,value}.
Transcribe only visually supported text. Mark unclear text in rawText as [unclear], and omit uncertain structured medical values. This extraction is for clinician review.${ayushMode ? " The document may use AYUSH terminology." : ""}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.GROQ_VISION_MODEL ?? "qwen/qwen3.6-27b",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      }],
      temperature: 0,
      max_completion_tokens: 1800,
      reasoning_effort: "none",
    }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(JSON.stringify(result ?? { status: response.status }));
  const content = result?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Groq Vision returned an empty response");
  const json = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1] ?? content;
  try {
    return normalizeExtractedDocument(JSON.parse(json.trim()) as ExtractedDocumentData);
  } catch {
    // Vision models occasionally add a short introduction despite the prompt.
    // Recover the first JSON object instead of showing a generic OCR failure.
    const object = firstJsonObject(json);
    if (object) {
      return normalizeExtractedDocument(JSON.parse(object) as ExtractedDocumentData);
    }
    throw new Error("Groq Vision returned non-JSON OCR output");
  }
}

// POST /api/documents/analyze — VLM-powered document digitization.
// Body: { patientId, encounterId?, fileName, mimeType, dataUrl, fileType? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, encounterId, fileName, mimeType, dataUrl, fileType } = body;
    if (!patientId || !fileName || !dataUrl) {
      return NextResponse.json({ error: "patientId, fileName, dataUrl required" }, { status: 400 });
    }
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Only image uploads are supported" }, { status: 400 });
    }

    let patient = null as Awaited<ReturnType<typeof db.patient.findUnique>> | null;
    let canPersist = true;
    try {
      patient = await db.patient.findUnique({ where: { id: patientId } });
    } catch {
      canPersist = false;
    }
    if (!patient && body.patient) patient = body.patient;
    if (!patient) return NextResponse.json({ error: "patient not found" }, { status: 404 });

    const doc = canPersist
      ? await db.document.create({
          data: { patientId, encounterId: encounterId ?? null, fileName, fileType: fileType ?? "other", mimeType: mimeType ?? "image/jpeg", dataUrl, status: "analyzing" },
        })
      : null;

    // Run local OCR first. For low-confidence handwritten documents, use the
    // configured Groq vision model as a precise fallback.
    try {
      const ocr = await recognizeDocument(dataUrl, patient.language);
      let extracted: ExtractedDocumentData = { rawText: ocr.rawText };
      if (ocr.confidence < 70 && process.env.GROQ_API_KEY) {
        extracted = await recognizeHandwritingWithGroq(
          dataUrl,
          fileType ?? "other",
          patient.ayushMode
        );
      }

      // Parse record date
      let recordDate: Date | null = null;
      if (extracted.recordDate) {
        const d = new Date(extracted.recordDate);
        if (!isNaN(d.getTime())) recordDate = d;
      }

      const updated = doc
        ? await db.document.update({
            where: { id: doc.id },
            data: { status: "completed", extractedData: JSON.stringify(extracted), recordDate: recordDate ?? null },
          })
        : null;

      return NextResponse.json({
        id: updated?.id ?? `temporary-document-${Date.now()}`,
        extracted,
        status: "completed",
        recordDate: recordDate ? recordDate.toISOString() : null,
      });
    } catch (ocrErr) {
      console.error("Document OCR failed:", ocrErr);
      if (doc) await db.document.update({ where: { id: doc.id }, data: { status: "failed" } });
      return NextResponse.json(
        { id: doc?.id ?? `temporary-document-${Date.now()}`, extracted: {}, status: "failed", error: "Document OCR failed. Please try a clearer image." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("POST /api/documents/analyze error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// GET /api/documents?patientId=xxx&encounterId=yyy — list documents
export async function GET(req: NextRequest) {
  try {
    const patientId = req.nextUrl.searchParams.get("patientId");
    const encounterId = req.nextUrl.searchParams.get("encounterId");
    if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });
    const docs = await db.document.findMany({
      where: { patientId, ...(encounterId ? { encounterId } : {}) },
      orderBy: { recordDate: "asc" },
    });
    return NextResponse.json({
      documents: docs.map((d) => ({
        id: d.id,
        fileName: d.fileName,
        fileType: d.fileType,
        mimeType: d.mimeType,
        status: d.status,
        extractedData: d.extractedData,
        recordDate: d.recordDate ? d.recordDate.toISOString() : null,
        createdAt: d.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
