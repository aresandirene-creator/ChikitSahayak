"use client";

import { useMediKioskStore } from "@/lib/store";
import { WelcomeScreen } from "@/components/medikiosk/WelcomeScreen";
import { IdentifyStep } from "@/components/medikiosk/IdentifyStep";
import { ConsentStep } from "@/components/medikiosk/ConsentStep";
import { HistoryStep } from "@/components/medikiosk/HistoryStep";
import { DocumentsStep } from "@/components/medikiosk/DocumentsStep";
import { SummaryStep } from "@/components/medikiosk/SummaryStep";
import { AbdmStep } from "@/components/medikiosk/AbdmStep";
import { CompleteStep } from "@/components/medikiosk/CompleteStep";
import { WorkflowProgress } from "@/components/medikiosk/WorkflowProgress";
import { PatientHeader } from "@/components/medikiosk/PatientHeader";
import { RedFlagToast } from "@/components/medikiosk/RedFlagToast";

export default function Home() {
  const step = useMediKioskStore((s) => s.step);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 via-white to-teal-50/40 text-foreground">
      {/* Top branding bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
                <circle cx="12" cy="12" r="3.2" />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="font-bold text-lg text-emerald-800 tracking-tight">MediKiosk</div>
              <div className="text-[11px] text-emerald-700/70 -mt-0.5">AI-powered clinical intake</div>
            </div>
          </div>
          <PatientHeader />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-60">
        {step === "welcome" && <WelcomeScreen />}
        {step === "identify" && <IdentifyStep />}
        {step === "consent" && <ConsentStep />}
        {step === "history" && <HistoryStep />}
        {step === "documents" && <DocumentsStep />}
        {step === "summary" && <SummaryStep />}
        {step === "abdm" && <AbdmStep />}
        {step === "complete" && <CompleteStep />}
      </main>

      {/* Sticky footer with workflow progress + nav */}
      <WorkflowProgress />

      {/* Red-flag alert toast (global) */}
      <RedFlagToast />
    </div>
  );
}
