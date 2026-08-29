import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/consent — grant or revoke a consent
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, scope, granted, notes } = body;
    if (!patientId || !scope) {
      return NextResponse.json({ error: "patientId and scope required" }, { status: 400 });
    }

    const existing = await db.consent.findFirst({ where: { patientId, scope } });
    let consent;
    if (existing) {
      consent = await db.consent.update({
        where: { id: existing.id },
        data: { granted: Boolean(granted), grantedAt: granted ? new Date() : null, notes: notes ?? existing.notes },
      });
    } else {
      consent = await db.consent.create({
        data: {
          patientId,
          scope,
          granted: Boolean(granted),
          grantedAt: granted ? new Date() : null,
          notes: notes ?? null,
        },
      });
    }
    return NextResponse.json({ success: true, consent });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// GET /api/consent?patientId=xxx — list consents for a patient
export async function GET(req: NextRequest) {
  try {
    const patientId = req.nextUrl.searchParams.get("patientId");
    if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });
    const consents = await db.consent.findMany({ where: { patientId } });
    return NextResponse.json({ consents });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
