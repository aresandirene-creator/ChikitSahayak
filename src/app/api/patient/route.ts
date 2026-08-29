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

// GET /api/patient?id=xxx — fetch a patient with latest encounter
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const patient = await db.patient.findUnique({
      where: { id },
      include: { encounters: { orderBy: { startedAt: "desc" }, take: 5 } },
    });
    if (!patient) return NextResponse.json({ error: "not found" }, { status: 404 });

    return NextResponse.json({ patient });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PATCH /api/patient?id=xxx — update demographics
export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const body = await req.json();
    const { name, age, gender, phone, email, address, language, ayushMode, bloodGroup, abhaId } = body;

    const updated = await db.patient.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(age !== undefined ? { age: Number(age) } : {}),
        ...(gender !== undefined ? { gender } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(language !== undefined ? { language } : {}),
        ...(ayushMode !== undefined ? { ayushMode: Boolean(ayushMode) } : {}),
        ...(bloodGroup !== undefined ? { bloodGroup } : {}),
        ...(abhaId !== undefined ? { abhaId } : {}),
      },
    });

    return NextResponse.json({ success: true, patient: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
