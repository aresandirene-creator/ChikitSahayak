import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ClinicalSummarySections } from "@/lib/types";

// GET /api/summary?patientId=xxx — get latest summary
export async function GET(req: NextRequest) {
  try {
    const patientId = req.nextUrl.searchParams.get("patientId");
    if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });

    const summary = await db.clinicalSummary.findFirst({ where: { patientId } });
    if (!summary) return NextResponse.json({ summary: null });

    let sections: ClinicalSummarySections = {};
    try {
      sections = JSON.parse(summary.sections || "{}");
    } catch {
      sections = {};
    }

    return NextResponse.json({
      summary: {
        id: summary.id,
        sections,
        freeText: summary.freeText,
        status: summary.status,
        physicianNotes: summary.physicianNotes,
        createdAt: summary.createdAt.toISOString(),
        updatedAt: summary.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PATCH /api/summary?id=xxx — update status / sections / physician notes
export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const body = await req.json();
    const { status, sections, freeText, physicianNotes } = body;

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (sections !== undefined) data.sections = JSON.stringify(sections);
    if (freeText !== undefined) data.freeText = freeText;
    if (physicianNotes !== undefined) data.physicianNotes = physicianNotes;

    const updated = await db.clinicalSummary.update({ where: { id }, data });
    let parsedSections: ClinicalSummarySections = {};
    try {
      parsedSections = JSON.parse(updated.sections || "{}");
    } catch {
      parsedSections = {};
    }
    return NextResponse.json({
      summary: {
        id: updated.id,
        sections: parsedSections,
        freeText: updated.freeText,
        status: updated.status,
        physicianNotes: updated.physicianNotes,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
