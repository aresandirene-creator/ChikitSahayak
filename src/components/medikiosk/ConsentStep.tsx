"use client";

import { useState } from "react";
import { useMediKioskStore } from "@/lib/store";
import { useContinueHandler } from "@/lib/use-continue-handler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ShieldCheck,
  MessageSquareHeart,
  FileScan,
  ClipboardCheck,
  Network,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const CONSENTS = [
  {
    scope: "history",
    icon: MessageSquareHeart,
    title: "AI conversational history taking",
    desc: "I consent to MediKiosk's AI assistant asking me structured clinical questions in my preferred language, recording my answers, and using them to build a history for my doctor.",
  },
  {
    scope: "documents",
    icon: FileScan,
    title: "Digitising my medical documents",
    desc: "I consent to MediKiosk scanning my previous prescriptions, lab reports and discharge summaries, using OCR and AI to extract diagnoses, medicines and test results.",
  },
  {
    scope: "summary",
    icon: ClipboardCheck,
    title: "Generating an AI clinical summary",
    desc: "I consent to MediKiosk combining my answers and my digitised records into a structured clinical summary that my doctor can review, edit, confirm or reject. The AI does not diagnose me.",
  },
  {
    scope: "abdm_share",
    icon: Network,
    title: "Sharing with ABHA / hospital HIS via ABDM",
    desc: "I consent to MediKiosk linking my ABHA, fetching my prior records through ABDM, and sharing the generated summary with the hospital HIS/EMR using interoperable FHIR standards.",
  },
] as const;

export function ConsentStep() {
  const patient = useMediKioskStore((s) => s.patient);
  const consents = useMediKioskStore((s) => s.consents);
  const setConsent = useMediKioskStore((s) => s.setConsent);
  const nextStep = useMediKioskStore((s) => s.nextStep);
  const [saving, setSaving] = useState(false);

  const required = ["history", "documents", "summary"];
  const allRequiredGranted = required.every((s) => consents[s]);
  const allGranted = [...required, "abdm_share"].every((s) => consents[s]);

  const handleToggle = async (scope: string, granted: boolean) => {
    setConsent(scope, granted);
    if (patient) {
      try {
        await fetch("/api/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientId: patient.id, scope, granted }),
        });
      } catch (e) {
        // Non-fatal; we still keep local state
        console.error("consent persist failed", e);
      }
    }
  };

  const grantAll = async () => {
    setSaving(true);
    for (const c of CONSENTS) {
      await handleToggle(c.scope, true);
    }
    setSaving(false);
    toast.success("All consents granted");
  };

  const handleContinue = () => {
    if (!allRequiredGranted) {
      toast.error("Please grant the three required consents to continue");
      return;
    }
    nextStep();
  };

  // Allow the sticky footer's "Continue" to trigger the same validation
  useContinueHandler(handleContinue);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1">
          <ShieldCheck className="size-3.5" /> Step 2 · Consent
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-emerald-900">
          Patient consent for data collection
        </h2>
        <p className="mt-1 text-muted-foreground">
          MediKiosk operates on a consent-based data flow. Please review each permission below with the patient. The
          first three are required to proceed; the fourth (ABDM sharing) is optional but recommended.
        </p>
      </div>

      <Card className="border-emerald-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center gap-2">
            <Lock className="size-4" /> Privacy & security controls
          </CardTitle>
          <CardDescription>
            All data is stored locally on the kiosk for this session and shared only with the treating physician. ABDM
            sharing follows the National Health Authority&apos;s consent artefact standards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {CONSENTS.map((c) => {
            const granted = Boolean(consents[c.scope]);
            const requiredFlag = required.includes(c.scope);
            return (
              <div
                key={c.scope}
                className={[
                  "rounded-xl border p-4 transition-colors",
                  granted
                    ? "border-emerald-300 bg-emerald-50/60"
                    : "border-muted bg-white hover:bg-muted/40",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <div className={[
                    "size-9 rounded-lg flex items-center justify-center shrink-0",
                    granted ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700",
                  ].join(" ")}>
                    {granted ? <CheckCircle2 className="size-5" /> : <c.icon className="size-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Label htmlFor={`consent-${c.scope}`} className="font-semibold text-emerald-900 cursor-pointer">
                        {c.title}
                      </Label>
                      {requiredFlag ? (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          Required
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Optional
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{c.desc}</p>
                  </div>
                  <Checkbox
                    id={`consent-${c.scope}`}
                    checked={granted}
                    onCheckedChange={(v) => handleToggle(c.scope, Boolean(v))}
                    className="size-6 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 mt-1"
                  />
                </div>
              </div>
            );
          })}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={grantAll}
              disabled={saving}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <ShieldCheck className="size-4" /> Grant all permissions
            </Button>
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!allRequiredGranted}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 sm:ml-auto"
            >
              Start AI history taking
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
