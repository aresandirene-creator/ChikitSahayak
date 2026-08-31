import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ClinicalSummarySections } from "@/lib/types";

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
