import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/encounter — create a new encounter (visit) for an existing patient.
// Used when a returning patient logs in for their next appointment.
// Body: { patientId }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId } = body;
    if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });

    const patient = await db.patient.findUnique({ where: { id: patientId } });
    if (!patient) return NextResponse.json({ error: "patient not found" }, { status: 404 });

    // Mark any in-progress encounters as completed (clean up abandoned ones)
    await db.encounter.updateMany({
      where: { patientId, status: "in_progress" },
      data: { status: "completed", completedAt: new Date() },
    });

    const encounter = await db.encounter.create({
      data: { patientId, status: "in_progress" },
    });

    return NextResponse.json({ success: true, encounter, patient });
  } catch (err) {
    console.error("POST /api/encounter error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PATCH /api/encounter?id=xxx — mark an encounter completed (privacy auto-reset)
export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const updated = await db.encounter.update({
      where: { id },
      data: { status: "completed", completedAt: new Date() },
    });
    return NextResponse.json({ success: true, encounter: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
