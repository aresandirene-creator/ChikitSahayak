"use client";

import { useChikitsaHayakStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { useUiMode } from "@/lib/use-ui-mode";
import { ChikitsaHayakLogo } from "@/components/medikiosk/ChikitsaHayakLogo";
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
import { Type, ImageIcon } from "lucide-react";

export default function Home() {
  const step = useChikitsaHayakStore((s) => s.step);
  const prefaceTab = useChikitsaHayakStore((s) => s.prefaceTab);
  const { t } = useI18n();
  const { graphical, setUiMode } = useUiMode();

  const showWorkflowFooter = step !== "welcome" && prefaceTab !== null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-foreground">
      {/* Top branding bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-sky-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ChikitsaHayakLogo iconSize={24} container />
            <div className="leading-tight">
              <div className="font-bold text-lg text-sky-800 tracking-tight">{t("appName")}</div>
              <div className="text-[11px] text-sky-600 -mt-0.5">{t("tagline")}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            {/* Compact mode toggle: switch between normal (text) and graphical (pictures) */}
            <button
              onClick={() => setUiMode(graphical ? "normal" : "graphical")}
              className={[
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                graphical
                  ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                  : "border-sky-200 bg-white hover:bg-sky-50 text-sky-800",
              ].join(" ")}
              aria-label={graphical ? t("modeNormal") : t("modeGraphical")}
              title={graphical ? t("modeNormal") : t("modeGraphical")}
            >
              {graphical ? <Type className="size-4" /> : <ImageIcon className="size-4" />}
              <span className="hidden sm:inline font-medium">
                {graphical ? t("modeNormal") : t("modeGraphical")}
              </span>
            </button>
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
