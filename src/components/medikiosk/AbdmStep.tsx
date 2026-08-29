"use client";

import { useState } from "react";
import { useMediKioskStore } from "@/lib/store";
import { useContinueHandler } from "@/lib/use-continue-handler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Network,
  ShieldCheck,
  FileDown,
  Send,
  Stethoscope,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Fingerprint,
  Database,
  Activity,
  Building2,
  Lock,
  ClipboardCheck,
} from "lucide-react";

const ACTIONS = [
  {
    key: "link_abha",
    icon: Fingerprint,
    title: "Link ABHA",
    desc: "Link or generate the patient's Ayushman Bharat Health Account ID through the ABDM gateway.",
  },
  {
    key: "fetch_records",
    icon: FileDown,
    title: "Fetch prior records",
    desc: "With patient consent, fetch the patient's prior health records from ABDM as FHIR bundles.",
  },
  {
    key: "share_to_his",
    icon: Send,
    title: "Share summary to HIS",
    desc: "Push the confirmed AI clinical summary to the hospital's HIS / EMR system via interoperable FHIR.",
  },
  {
    key: "push_summary",
    icon: Stethoscope,
    title: "Push to physician EMR",
    desc: "Place the summary on the treating physician's consultation screen so it appears when they open the patient.",
  },
] as const;

export function AbdmStep() {
  const patient = useMediKioskStore((s) => s.patient);
  const summaryStatus = useMediKioskStore((s) => s.summaryStatus);
  const abdmRecords = useMediKioskStore((s) => s.abdmRecords);
  const setAbdmRecords = useMediKioskStore((s) => s.setAbdmRecords);
  const addAbdmRecord = useMediKioskStore((s) => s.addAbdmRecord);
  const setPatient = useMediKioskStore((s) => s.setPatient);
  const nextStep = useMediKioskStore((s) => s.nextStep);

  const [busy, setBusy] = useState<string | null>(null);
  const [showFhir, setShowFhir] = useState<string | null>(null);

  const runAction = async (action: string) => {
    if (!patient) return;
    setBusy(action);
    try {
      const res = await fetch("/api/abdm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || data.message || "Action failed");

      addAbdmRecord({
        id: data.record.id,
        action,
        status: data.record.status,
        message: data.record.message,
        createdAt: data.record.createdAt,
      });

      // If link_abha, refresh patient in store with the new ABHA
      if (action === "link_abha" && data.message?.includes("ABHA")) {
        const abhaMatch = data.message.match(/ABHA-[\w]+/);
        if (abhaMatch) {
          setPatient({ ...patient, abhaId: abhaMatch[0] });
        }
      }
      toast.success(data.message ?? `${action} succeeded`);
    } catch (e) {
      toast.error((e as Error).message);
      addAbdmRecord({
        id: `err-${Date.now()}`,
        action,
        status: "failed",
        message: (e as Error).message,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setBusy(null);
    }
  };

  const completedActions = new Set(abdmRecords.filter((r) => r.status === "success").map((r) => r.action));

  // Footer "Continue" → finish intake (go to complete step)
  useContinueHandler(() => {
    nextStep();
  });

  if (!patient) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Please identify the patient first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1">
          <Network className="size-3.5" /> Step 6 · ABDM & Hospital Integration
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-emerald-900">
          Connect to ABHA, ABDM and the hospital HIS
        </h2>
        <p className="mt-1 text-muted-foreground">
          With the patient&apos;s consent, MediKiosk links the ABHA, fetches prior records from ABDM as FHIR bundles,
          and pushes the confirmed summary to the hospital HIS / EMR so the doctor sees it during consultation.
        </p>
      </div>

      {/* Status cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Card className="border-emerald-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <Fingerprint className="size-4" />
              <span className="text-xs font-semibold uppercase">ABHA status</span>
            </div>
            <div className="text-sm font-medium text-emerald-900 truncate">
              {patient.abhaId ? patient.abhaId : "Not linked"}
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <ClipboardCheck className="size-4" />
              <span className="text-xs font-semibold uppercase">Summary status</span>
            </div>
            <div className="text-sm font-medium text-emerald-900">
              {summaryStatus === "confirmed" ? "Confirmed & ready" : summaryStatus === "draft" ? "Draft" : summaryStatus}
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <Activity className="size-4" />
              <span className="text-xs font-semibold uppercase">Integration actions</span>
            </div>
            <div className="text-sm font-medium text-emerald-900">
              {abdmRecords.filter((r) => r.status === "success").length} successful
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {ACTIONS.map(({ key, icon: Icon, title, desc }) => {
          const done = completedActions.has(key);
          const isBusy = busy === key;
          const disabled = isBusy || (key === "share_to_his" && summaryStatus !== "confirmed") || (key === "push_summary" && summaryStatus !== "confirmed");
          return (
            <Card
              key={key}
              className={[
                "border shadow-sm transition-colors",
                done ? "border-emerald-300 bg-emerald-50/30" : "border-emerald-100",
              ].join(" ")}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={[
                    "size-11 rounded-xl flex items-center justify-center shrink-0",
                    done ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700",
                  ].join(" ")}>
                    {done ? <CheckCircle2 className="size-5" /> : <Icon className="size-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-emerald-900">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => runAction(key)}
                        disabled={disabled}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                      >
                        {isBusy ? (
                          <><Loader2 className="size-3.5 animate-spin" /> Running…</>
                        ) : done ? (
                          <><CheckCircle2 className="size-3.5" /> Re-run</>
                        ) : (
                          <><Icon className="size-3.5" /> Run</>
                        )}
                      </Button>
                      {key === "share_to_his" && summaryStatus !== "confirmed" && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                          Confirm summary first
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity log */}
      <Card className="border-emerald-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-emerald-900 flex items-center gap-2">
            <Activity className="size-4 text-emerald-600" /> Integration activity log
          </CardTitle>
          <CardDescription>FHIR exchange & ABDM consent artefact history for this patient.</CardDescription>
        </CardHeader>
        <CardContent>
          {abdmRecords.length === 0 ? (
            <div className="text-sm text-muted-foreground italic py-6 text-center">
              No integration actions yet. Run one of the actions above to begin.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
              {abdmRecords.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border border-emerald-100 bg-white px-3 py-2.5 flex items-start gap-3"
                >
                  <div className={[
                    "size-7 rounded-full flex items-center justify-center shrink-0",
                    r.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700",
                  ].join(" ")}>
                    {r.status === "success" ? <CheckCircle2 className="size-4" /> : <Lock className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        {r.action.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-900 mt-0.5">{r.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy callout */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3 text-sm text-emerald-800">
        <ShieldCheck className="size-5 shrink-0 text-emerald-600" />
        <div>
          <p className="font-semibold">Consent-based data sharing with privacy & security controls</p>
          <p className="text-emerald-700/80 mt-1">
            All ABDM exchanges use the National Health Authority&apos;s consent artefact flow. The patient can revoke
            consent at any time. FHIR R4 is used for interoperability with hospital HIS / EMR systems.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          onClick={nextStep}
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8"
        >
          Finish intake
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
