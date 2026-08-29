import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/patient/lookup — find an existing patient by phone or ABHA
// Body: { phone?, abhaId? }
// Used for returning-patient login on the kiosk preface screen.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, abhaId } = body;
    if (!phone && !abhaId) {
      return NextResponse.json({ error: "phone or abhaId required" }, { status: 400 });
    }

    let patient = null;
    if (abhaId) {
      patient = await db.patient.findUnique({
        where: { abhaId: String(abhaId).trim() },
        include: { encounters: { orderBy: { startedAt: "desc" }, take: 1 } },
      });
    }
    if (!patient && phone) {
      patient = await db.patient.findFirst({
        where: { phone: String(phone).trim() },
        include: { encounters: { orderBy: { startedAt: "desc" }, take: 1 } },
      });
    }

    if (!patient) {
      return NextResponse.json({ found: false, patient: null });
    }

    return NextResponse.json({ found: true, patient });
  } catch (err) {
    console.error("POST /api/patient/lookup error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
