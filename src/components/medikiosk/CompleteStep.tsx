"use client";

import { useMediKioskStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Stethoscope,
  MessageSquareHeart,
  FileScan,
  ClipboardCheck,
  Network,
  ArrowRight,
  Sparkles,
  Clock,
  Activity,
} from "lucide-react";

export function CompleteStep() {
  const patient = useMediKioskStore((s) => s.patient);
  const turns = useMediKioskStore((s) => s.turns);
  const documents = useMediKioskStore((s) => s.documents);
  const summaryStatus = useMediKioskStore((s) => s.summaryStatus);
  const redFlags = useMediKioskStore((s) => s.redFlags);
  const abdmRecords = useMediKioskStore((s) => s.abdmRecords);
  const reset = useMediKioskStore((s) => s.reset);
  const setStep = useMediKioskStore((s) => s.setStep);

  const successfulAbdm = abdmRecords.filter((r) => r.status === "success").length;
  const acknowledgedFlags = redFlags.filter((f) => f.acknowledged).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero confirmation */}
      <div className="text-center pt-4 sm:pt-8">
        <div className="size-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-100">
          <CheckCircle2 className="size-12" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-emerald-900">
          Patient intake complete
        </h1>
        <p className="mt-3 text-lg text-emerald-700/80 max-w-2xl mx-auto">
          {patient?.name ?? "Patient"}, your structured clinical history is now ready on the doctor&apos;s consultation
          screen. Please wait in the queue — the doctor will call you shortly.
        </p>
      </div>

      {/* Recap cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <RecapCard
          icon={Stethoscope}
          label="Patient identified"
          value={patient?.name ?? "—"}
          subtext={patient ? `${patient.age ? `${patient.age}y · ` : ""}${patient.gender ?? ""}` : ""}
        />
        <RecapCard
          icon={MessageSquareHeart}
          label="History collected"
          value={`${turns.length} turn${turns.length !== 1 ? "s" : ""}`}
          subtext="AI adaptive history-taking"
        />
        <RecapCard
          icon={FileScan}
          label="Documents digitised"
          value={`${documents.length} doc${documents.length !== 1 ? "s" : ""}`}
          subtext="Chronologically organised"
        />
        <RecapCard
          icon={ClipboardCheck}
          label="Clinical summary"
          value={summaryStatus === "confirmed" ? "Confirmed" : summaryStatus === "draft" ? "Draft" : summaryStatus}
          subtext="AI-generated, physician-reviewed"
        />
        <RecapCard
          icon={Network}
          label="HIS / ABDM actions"
          value={`${successfulAbdm} successful`}
          subtext="FHIR-based data sharing"
        />
        <RecapCard
          icon={Activity}
          label="Red-flag alerts"
          value={`${redFlags.length} detected`}
          subtext={redFlags.length > 0 ? `${acknowledgedFlags} acknowledged by triage` : "All clear"}
          highlight={redFlags.length > 0}
        />
      </div>

      {/* What happens next */}
      <Card className="border-emerald-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-5 text-emerald-600" />
            <h3 className="font-semibold text-emerald-900">What happens next</h3>
          </div>
          <div className="space-y-3">
            <NextRow num="1" icon={ClipboardCheck} text="Doctor reviews your AI-generated clinical history on the consultation screen." />
            <NextRow num="2" icon={Stethoscope} text="Doctor spends the consultation time on examination, clinical reasoning and counselling." />
            <NextRow num="3" icon={Network} text="Any new prescriptions or lab orders are added to your ABHA-linked longitudinal health record." />
          </div>
        </CardContent>
      </Card>

      {/* Impact stat */}
      <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-0 shadow-xl shadow-emerald-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Clock className="size-7 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold">More consultation time for what matters</h3>
              <p className="mt-1 text-emerald-50/90 text-sm leading-relaxed">
                By shifting history-taking and document organisation to the pre-consultation stage, MediKiosk frees up
                significant doctor time — used for examination, clinical reasoning, diagnosis, counselling and
                treatment, not for re-collecting basic history.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Button
          size="lg"
          variant="outline"
          onClick={() => setStep("summary")}
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-12 px-6"
        >
          View summary
        </Button>
        <Button
          size="lg"
          onClick={reset}
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8"
        >
          Start new patient intake
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function RecapCard({
  icon: Icon,
  label,
  value,
  subtext,
  highlight = false,
}: {
  icon: typeof Stethoscope;
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={[
      "border shadow-sm",
      highlight ? "border-amber-200 bg-amber-50/30" : "border-emerald-100",
    ].join(" ")}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={["size-4", highlight ? "text-amber-600" : "text-emerald-600"].join(" ")} />
          <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wide">
            {label}
          </span>
        </div>
        <div className="text-base font-bold text-emerald-900 truncate">{value}</div>
        {subtext && <div className="text-xs text-muted-foreground mt-0.5">{subtext}</div>}
      </CardContent>
    </Card>
  );
}

function NextRow({ num, icon: Icon, text }: { num: string; icon: typeof Stethoscope; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
        {num}
      </div>
      <div className="flex items-start gap-2 pt-0.5">
        <Icon className="size-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-900">{text}</p>
      </div>
    </div>
  );
}
