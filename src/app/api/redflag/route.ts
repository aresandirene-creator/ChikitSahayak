import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/redflag?patientId=xxx — list red-flag alerts
export async function GET(req: NextRequest) {
  try {
    const patientId = req.nextUrl.searchParams.get("patientId");
    if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });
    const flags = await db.redFlagAlert.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ redFlags: flags });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PATCH /api/redflag?id=xxx — acknowledge a red-flag alert
export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const updated = await db.redFlagAlert.update({ where: { id }, data: { acknowledged: true } });
    return NextResponse.json({ success: true, redFlag: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
