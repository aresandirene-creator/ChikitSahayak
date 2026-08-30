"use client";

import { useState } from "react";
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
import { AccessibilityPanel } from "@/components/medikiosk/AccessibilityPanel";
import { VoiceAssistant } from "@/components/medikiosk/VoiceAssistant";
import { Type, ImageIcon, Accessibility, Mic } from "lucide-react";

export default function Home() {
  const step = useChikitsaHayakStore((s) => s.step);
  const prefaceTab = useChikitsaHayakStore((s) => s.prefaceTab);
  const patient = useChikitsaHayakStore((s) => s.patient);
  const fontScale = useChikitsaHayakStore((s) => s.fontScale);
  const highContrast = useChikitsaHayakStore((s) => s.highContrast);
  const reduceMotion = useChikitsaHayakStore((s) => s.reduceMotion);
  const { t } = useI18n();
  const { graphical, setUiMode } = useUiMode();
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  const showWorkflowFooter = step !== "welcome" && prefaceTab !== null;

  return (
    <div
      className={[
        "min-h-screen flex flex-col bg-background text-foreground",
        highContrast ? "ch-high-contrast" : "",
        reduceMotion ? "ch-reduce-motion" : "",
      ].join(" ")}
      style={{ fontSize: `${fontScale}rem` }}
    >
      {/* OMNI HD-style top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-red-100/80 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ChikitsaHayakLogo size={36} />
            <div className="leading-tight">
              <div className="font-bold text-base text-red-900 tracking-tight">{t("appName")}</div>
              <div className="text-[10px] text-red-500/80 -mt-0.5 font-medium">{t("tagline")}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher compact />
            {/* Mode toggle */}
            <button
              onClick={() => setUiMode(graphical ? "normal" : "graphical")}
              className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white hover:bg-red-50 text-red-700 px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all shadow-soft"
              aria-label={graphical ? t("modeNormal") : t("modeGraphical")}
              title={graphical ? t("modeNormal") : t("modeGraphical")}
            >
              {graphical ? <Type className="size-3.5" /> : <ImageIcon className="size-3.5" />}
              <span className="hidden md:inline">{graphical ? t("modeNormal") : t("modeGraphical")}</span>
            </button>
            {/* Accessibility */}
            <button
              onClick={() => setShowAccessibility(true)}
              className="flex items-center justify-center rounded-full border border-red-200 bg-white hover:bg-red-50 text-red-700 size-9 transition-all shadow-soft"
              aria-label="Accessibility settings"
              title="Accessibility settings"
            >
              <Accessibility className="size-4" />
            </button>
            {/* Voice assistant — Siri-like */}
            {patient && (
              <button
                onClick={() => setShowVoiceAssistant(true)}
                className="flex items-center gap-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all shadow-soft-md hover:shadow-glow-red"
                aria-label="Voice assistant"
                title="Talk to ChikitsaHayak"
              >
                <Mic className="size-3.5" />
                <span className="hidden md:inline">Talk</span>
              </button>
            )}
            <PatientHeader />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-60">
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
      {prefaceTab === "returning" && step === "welcome" && <LoginStep />}

      {/* Sticky footer with workflow progress + nav */}
      {showWorkflowFooter && <WorkflowProgress />}

      {/* Red-flag alert toast (global) */}
      <RedFlagToast />

      {/* Accessibility settings modal */}
      {showAccessibility && <AccessibilityPanel onClose={() => setShowAccessibility(false)} />}

      {/* Siri-like voice assistant modal */}
      {showVoiceAssistant && <VoiceAssistant onClose={() => setShowVoiceAssistant(false)} />}
    </div>
  );
}
