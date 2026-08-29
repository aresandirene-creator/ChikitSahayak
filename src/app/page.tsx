"use client";

import { useMediKioskStore } from "@/lib/store";
import { PrefaceScreen } from "@/components/medikiosk/PrefaceScreen";
import { LoginStep } from "@/components/medikiosk/LoginStep";
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
import { LanguageSwitcher } from "@/components/medikiosk/LanguageSwitcher";
import { useI18n } from "@/lib/use-i18n";

export default function Home() {
  const step = useMediKioskStore((s) => s.step);
  const prefaceTab = useMediKioskStore((s) => s.prefaceTab);
  const { t } = useI18n();

  const showWorkflowFooter = step !== "welcome" && prefaceTab !== null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-foreground">
      {/* Top branding bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                <circle cx="12" cy="12" r="3.2" />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="font-bold text-lg text-emerald-800 tracking-tight">{t("appName")}</div>
              <div className="text-[11px] text-emerald-600 -mt-0.5">{t("tagline")}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <PatientHeader />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-60">
        {step === "welcome" && <PrefaceScreen />}
        {step === "identify" && <IdentifyStep />}
        {step === "consent" && <ConsentStep />}
        {step === "history" && <HistoryStep />}
        {step === "documents" && <DocumentsStep />}
        {step === "summary" && <SummaryStep />}
        {step === "abdm" && <AbdmStep />}
        {step === "complete" && <CompleteStep />}
      </main>

      {/* Login step is a modal overlay on the preface */}
      {prefaceTab === "returning" && step === "welcome" && (
        <LoginStep />
      )}

      {/* Sticky footer with workflow progress + nav */}
      {showWorkflowFooter && <WorkflowProgress />}

      {/* Red-flag alert toast (global) */}
      <RedFlagToast />
    </div>
  );
}
