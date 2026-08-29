import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Simulated ABDM / HIS integration. In a real deployment this would call
// the ABHA / ABDM gateway with a consent artefact and exchange FHIR bundles
// with the hospital HIS/EMR. Here we simulate the steps and persist a record.

// POST /api/abdm — perform an ABDM action
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, encounterId, action } = body;
    if (!patientId || !action) {
      return NextResponse.json({ error: "patientId and action required" }, { status: 400 });
    }

    let status: "success" | "failed" = "success";
    let message = "";
    let fhirPayload: string | null = null;

    switch (action) {
      case "link_abha": {
        const patient = await db.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
          status = "failed";
          message = "Patient not found";
        } else {
          if (!patient.abhaId) {
            const simulatedAbha = `ABHA-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
            await db.patient.update({ where: { id: patientId }, data: { abhaId: simulatedAbha } });
            message = `Linked ABHA: ${simulatedAbha}`;
          } else {
            message = `ABHA already linked: ${patient.abhaId}`;
          }
        }
        break;
      }
      case "fetch_records": {
        message = "Fetched 3 prior records from ABDM (consent-based).";
        fhirPayload = JSON.stringify({
          resourceType: "Bundle",
          type: "collection",
          entry: [
            { resource: { resourceType: "Patient", id: patientId } },
            { resource: { resourceType: "Condition", code: { text: "Hypertension (simulated)" } } },
            { resource: { resourceType: "MedicationStatement", medicationCodeableConcept: { text: "Telmisartan 40mg (simulated)" } } },
          ],
        });
        break;
      }
      case "share_to_his": {
        message = "Clinical summary shared to hospital HIS via FHIR endpoint.";
        fhirPayload = JSON.stringify({
          resourceType: "Bundle",
          type: "message",
          entry: [{ resource: { resourceType: "DocumentReference", status: "current" } }],
        });
        break;
      }
      case "push_summary": {
        message = "Summary pushed to physician's EMR queue. Doctor will review on consultation screen.";
        break;
      }
      default: {
        status = "failed";
        message = `Unknown action: ${action}`;
      }
    }

    const record = await db.aBDMRecord.create({
      data: { patientId, encounterId: encounterId ?? null, action, status, message, fhirPayload },
    });

    return NextResponse.json({ success: status === "success", record, message });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// GET /api/abdm?patientId=xxx&encounterId=yyy — list ABDM records
export async function GET(req: NextRequest) {
  try {
    const patientId = req.nextUrl.searchParams.get("patientId");
    const encounterId = req.nextUrl.searchParams.get("encounterId");
    if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });
    const records = await db.aBDMRecord.findMany({
      where: { patientId, ...(encounterId ? { encounterId } : {}) },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ records });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
