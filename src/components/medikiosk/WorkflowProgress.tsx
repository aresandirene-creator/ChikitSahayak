"use client";

import { useChikitsaHayakStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { STEP_ORDER, type WorkflowStep } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

const STEP_ICONS: Record<WorkflowStep, string> = {
  welcome: "→",
  identify: "1",
  consent: "2",
  history: "3",
  documents: "4",
  summary: "5",
  abdm: "6",
  complete: "✓",
};

export function WorkflowProgress() {
  const step = useChikitsaHayakStore((s) => s.step);
  const setStep = useChikitsaHayakStore((s) => s.setStep);
  const prevStep = useChikitsaHayakStore((s) => s.prevStep);
  const summaryStatus = useChikitsaHayakStore((s) => s.summaryStatus);
  const { t } = useI18n();

  if (step === "welcome") return null;

  const currentIdx = STEP_ORDER.indexOf(step);

  const STEP_LABELS: Record<WorkflowStep, string> = {
    welcome: "",
    identify: t("stepIdentify"),
    consent: t("stepConsent"),
    history: t("stepHistory"),
    documents: t("stepDocuments"),
    summary: t("stepSummary"),
    abdm: t("stepAbdm"),
    complete: t("stepComplete"),
  };

  const canAdvance = () => {
    switch (step) {
      case "summary":
        return summaryStatus === "confirmed";
      default:
        return true;
    }
  };

  const handleContinue = () => {
    // Tell the active step to run its submit logic (create patient, persist
    // consents, etc.). The step is responsible for calling nextStep on success.
    window.dispatchEvent(new CustomEvent("chikitsahayak-continue"));
  };

  const canGoBack = currentIdx > 0;
  const isLast = step === "complete";

  return (
    <footer className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-red-100 shadow-[0_-4px_20px_-8px_rgba(16,185,129,0.18)]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-2.5 pb-1">
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {STEP_ORDER.map((s, idx) => {
            const active = s === step;
            const done = idx < currentIdx;
            const clickable = done || s === step;
            return (
              <button
                key={s}
                disabled={!clickable}
                onClick={() => clickable && setStep(s)}
                className={[
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap",
                  active
                    ? "bg-red-600 text-white shadow-sm"
                    : done
                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
                ].join(" ")}
                aria-label={STEP_LABELS[s]}
              >
                <span
                  className={[
                    "size-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                    active
                      ? "bg-white text-red-700"
                      : done
                        ? "bg-red-600 text-white"
                        : "bg-muted-foreground/20 text-muted-foreground",
                  ].join(" ")}
                >
                  {done ? <Check className="size-3" /> : STEP_ICONS[s]}
                </span>
                <span className="hidden sm:inline">{STEP_LABELS[s]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={!canGoBack}
          className="text-red-800 hover:text-red-900 hover:bg-red-50"
        >
          <ChevronLeft className="size-4" />
          {t("back")}
        </Button>

        <div className="text-xs text-muted-foreground hidden sm:block">
          {step === "summary" && summaryStatus === "confirmed"
            ? t("summaryStatusConfirmedDesc")
            : step === "summary"
              ? t("summaryNeedConfirm")
              : isLast
                ? t("completeTitle")
                : t("stepOf", { x: currentIdx + 1, y: STEP_ORDER.length }) + ": " + STEP_LABELS[step]}
        </div>

        {!isLast ? (
          <Button
            onClick={handleContinue}
            disabled={!canAdvance()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {t("continue")}
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button
            onClick={() => setStep("welcome")}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {t("newPatient")}
          </Button>
        )}
      </div>
    </footer>
  );
}
