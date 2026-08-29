import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getZai } from "@/lib/zai";
import { buildDocumentAnalysisPrompt } from "@/lib/medical-prompts";
import type { ExtractedDocumentData } from "@/lib/types";

// POST /api/documents/analyze — VLM-powered document digitization.
// Body: { patientId, fileName, mimeType, dataUrl, fileType? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, fileName, mimeType, dataUrl, fileType } = body;
    if (!patientId || !fileName || !dataUrl) {
      return NextResponse.json({ error: "patientId, fileName, dataUrl required" }, { status: 400 });
    }

    const patient = await db.patient.findUnique({ where: { id: patientId } });
    if (!patient) return NextResponse.json({ error: "patient not found" }, { status: 404 });

    // Persist the document immediately in "analyzing" state
    const doc = await db.document.create({
      data: {
        patientId,
        fileName,
        fileType: fileType ?? "other",
        mimeType: mimeType ?? "image/jpeg",
        dataUrl,
        status: "analyzing",
      },
    });

    // Run VLM analysis
    try {
      const zai = await getZai();
      const prompt = buildDocumentAnalysisPrompt({
        fileType: fileType ?? "other",
        ayushMode: patient.ayushMode,
      });

      const response = await zai.chat.completions.createVision({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        thinking: { type: "disabled" },
      });

      const raw = response.choices[0]?.message?.content ?? "";
      // Parse JSON (strip code fences if any)
      let jsonStr = raw.trim();
      const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fenceMatch) jsonStr = fenceMatch[1].trim();
      // Find first { ... }
      const firstBrace = jsonStr.indexOf("{");
      const lastBrace = jsonStr.lastIndexOf("}");
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
      }

      let extracted: ExtractedDocumentData = {};
      try {
        extracted = JSON.parse(jsonStr);
      } catch {
        // Fallback: keep raw text
        extracted = { rawText: raw };
      }

      // Parse record date
      let recordDate: Date | null = null;
      if (extracted.recordDate) {
        const d = new Date(extracted.recordDate);
        if (!isNaN(d.getTime())) recordDate = d;
      }

      const updated = await db.document.update({
        where: { id: doc.id },
        data: {
          status: "completed",
          extractedData: JSON.stringify(extracted),
          recordDate: recordDate ?? null,
        },
      });

      return NextResponse.json({
        id: updated.id,
        extracted,
        status: "completed",
        recordDate: recordDate ? recordDate.toISOString() : null,
      });
    } catch (vlmErr) {
      console.error("VLM analysis failed:", vlmErr);
      await db.document.update({ where: { id: doc.id }, data: { status: "failed" } });
      return NextResponse.json(
        { id: doc.id, extracted: {}, status: "failed", error: (vlmErr as Error).message },
        { status: 200 }
      );
    }
  } catch (err) {
    console.error("POST /api/documents/analyze error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// GET /api/documents?patientId=xxx — list documents for a patient
export async function GET(req: NextRequest) {
  try {
    const patientId = req.nextUrl.searchParams.get("patientId");
    if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });
    const docs = await db.document.findMany({
      where: { patientId },
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
