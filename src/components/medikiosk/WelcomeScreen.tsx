"use client";

import { useMediKioskStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Stethoscope,
  MessageSquareHeart,
  FileScan,
  ClipboardCheck,
  Network,
  ArrowRight,
  ShieldCheck,
  Languages,
  Mic,
} from "lucide-react";

const FEATURES = [
  {
    icon: MessageSquareHeart,
    title: "AI Conversational History",
    desc: "Speaks to patients in 12 Indian languages. Adaptive follow-up questions covering HPI, past history, medications, allergies, family history & ROS — with an AYUSH / Ayurvedic mode.",
    color: "from-rose-500/10 to-rose-500/5 text-rose-600",
  },
  {
    icon: FileScan,
    title: "Medical Document Digitization",
    desc: "Multilingual OCR + AI extracts diagnoses, medicines, test results & procedures from old prescriptions, lab reports and discharge summaries — organised chronologically with abnormal values highlighted.",
    color: "from-emerald-500/10 to-emerald-500/5 text-emerald-600",
  },
  {
    icon: ClipboardCheck,
    title: "AI-Generated Clinical Summary",
    desc: "Combines patient answers and prior records into a concise, physician-readable history. Doctor can review, edit, confirm or reject. AI never independently diagnoses.",
    color: "from-amber-500/10 to-amber-500/5 text-amber-600",
  },
  {
    icon: Network,
    title: "ABDM & Hospital Integration",
    desc: "Consent-based data sharing. Integrates with ABHA, ABDM and hospital HIS / EMR systems using interoperable FHIR standards with privacy & security controls.",
    color: "from-teal-500/10 to-teal-500/5 text-teal-600",
  },
];

const WORKFLOW = [
  "Identify",
  "Consent",
  "AI History",
  "Scan Docs",
  "AI Summary",
  "HIS / ABHA",
  "Consultation",
];

export function WelcomeScreen() {
  const setStep = useMediKioskStore((s) => s.setStep);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 mb-4">
          <ShieldCheck className="size-3.5" />
          Consent-based · ABHA-aligned · FHIR-ready
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-emerald-900 tracking-tight max-w-3xl mx-auto">
          Pre-consultation intake,<br />powered by AI.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-emerald-700/80 max-w-2xl mx-auto">
          MediKiosk collects, organises and summarises a patient&apos;s medical history before they meet the doctor —
          so the consultation goes to examination, reasoning and counselling, not history-taking.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={() => setStep("identify")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-base shadow-lg shadow-emerald-200"
          >
            Begin Patient Intake
            <ArrowRight className="size-5" />
          </Button>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Languages className="size-4 text-emerald-600" /> 12 Indian languages
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mic className="size-4 text-emerald-600" /> Voice or touch
            </span>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="max-w-4xl mx-auto">
        <div className="text-center text-sm font-semibold text-emerald-700/70 mb-3">Patient workflow</div>
        <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2">
          {WORKFLOW.map((w, i) => (
            <div key={w} className="flex items-center gap-1.5 sm:gap-2">
              <div className="rounded-full bg-white border border-emerald-200 px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-800 shadow-sm">
                {w}
              </div>
              {i < WORKFLOW.length - 1 && (
                <ArrowRight className="size-3.5 text-emerald-400 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid sm:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {FEATURES.map((f) => (
          <Card key={f.title} className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`size-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shrink-0`}>
                  <f.icon className="size-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Impact callout */}
      <section className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-0 shadow-xl shadow-emerald-200">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <Stethoscope className="size-7 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-bold">Shifts history-taking from doctor-time to patient-time</h3>
                <p className="mt-2 text-emerald-50/90 leading-relaxed">
                  Instead of the doctor spending several minutes collecting basic history and sorting through papers,
                  the doctor receives a structured, reviewable patient history immediately — allowing more consultation
                  time for <span className="font-semibold">Examination → Clinical reasoning → Diagnosis → Counselling → Treatment.</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
