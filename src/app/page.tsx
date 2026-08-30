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
        "min-h-screen flex flex-col bg-white text-foreground",
        highContrast ? "ch-high-contrast" : "",
        reduceMotion ? "ch-reduce-motion" : "",
      ].join(" ")}
      style={{
        // Apply the accessibility font scale globally — all rem-based sizes scale with it
        fontSize: `${fontScale}rem`,
      }}
    >
      {/* Top branding bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-red-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ChikitsaHayakLogo size={40} />
            <div className="leading-tight">
              <div className="font-bold text-lg text-red-800 tracking-tight">{t("appName")}</div>
              <div className="text-[11px] text-red-600 -mt-0.5">{t("tagline")}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            {/* Mode toggle: switch between normal (text) and graphical (pictures) */}
            <button
              onClick={() => setUiMode(graphical ? "normal" : "graphical")}
              className={[
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                graphical
                  ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                  : "border-red-200 bg-white hover:bg-red-50 text-red-800",
              ].join(" ")}
              aria-label={graphical ? t("modeNormal") : t("modeGraphical")}
              title={graphical ? t("modeNormal") : t("modeGraphical")}
            >
              {graphical ? <Type className="size-4" /> : <ImageIcon className="size-4" />}
              <span className="hidden sm:inline font-medium">
                {graphical ? t("modeNormal") : t("modeGraphical")}
              </span>
            </button>
            {/* Accessibility settings */}
            <button
              onClick={() => setShowAccessibility(true)}
              className="flex items-center justify-center rounded-full border border-red-200 bg-white hover:bg-red-50 text-red-800 px-3 py-1.5 text-sm transition-colors"
              aria-label="Accessibility settings"
              title="Accessibility settings"
            >
              <Accessibility className="size-4" />
            </button>
            {/* Siri-like voice assistant (only when a patient is loaded) */}
            {patient && (
              <button
                onClick={() => setShowVoiceAssistant(true)}
                className="flex items-center gap-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-sm transition-colors shadow-sm"
                aria-label="Voice assistant"
                title="Talk to ChikitsaHayak (voice assistant)"
              >
                <Mic className="size-4" />
                <span className="hidden sm:inline font-medium">Talk</span>
              </button>
            )}
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

      {/* Accessibility settings modal */}
      {showAccessibility && <AccessibilityPanel onClose={() => setShowAccessibility(false)} />}

      {/* Siri-like voice assistant modal */}
      {showVoiceAssistant && <VoiceAssistant onClose={() => setShowVoiceAssistant(false)} />}
    </div>
  );
}
