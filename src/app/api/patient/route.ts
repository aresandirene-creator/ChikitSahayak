import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/patient — create a patient AND their first encounter
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, age, gender, phone, email, address, language = "en", ayushMode = false, bloodGroup, abhaId } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
    }

    const patient = await db.patient.create({
      data: {
        name: name.trim(),
        age: age ? Number(age) : null,
        gender: gender ?? null,
        phone: phone ?? null,
        email: email ?? null,
        address: address ?? null,
        language,
        ayushMode: Boolean(ayushMode),
        bloodGroup: bloodGroup ?? null,
        abhaId: abhaId ?? null,
        encounters: { create: [{ status: "in_progress" }] },
      },
      include: { encounters: { orderBy: { startedAt: "desc" }, take: 1 } },
    });

    return NextResponse.json({
      success: true,
      patient,
      encounter: patient.encounters[0],
    });
  } catch (err) {
    console.error("POST /api/patient error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
