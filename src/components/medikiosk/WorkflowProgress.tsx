"use client";

import { useMediKioskStore } from "@/lib/store";
import { STEP_ORDER, STEP_LABELS, type WorkflowStep } from "@/lib/types";
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
  const step = useMediKioskStore((s) => s.step);
  const setStep = useMediKioskStore((s) => s.setStep);
  const prevStep = useMediKioskStore((s) => s.prevStep);
  const summaryStatus = useMediKioskStore((s) => s.summaryStatus);

  if (step === "welcome") return null;

  const currentIdx = STEP_ORDER.indexOf(step);

  // Gate logic: can the user advance from the current step?
  // We keep this permissive — the actual validation happens inside each step's
  // submit handler (which shows a toast error if validation fails). This avoids
  // the case where the in-card Continue button is covered by the sticky footer.
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
    window.dispatchEvent(new CustomEvent("medikiosk-continue"));
  };

  // Can the user go back?
  const canGoBack = currentIdx > 0;

  const isLast = step === "complete";

  return (
    <footer className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-emerald-100 shadow-[0_-4px_20px_-8px_rgba(16,185,129,0.18)]">
      {/* Step pills */}
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
                    ? "bg-emerald-600 text-white shadow-sm"
                    : done
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
                ].join(" ")}
                aria-label={STEP_LABELS[s]}
              >
                <span
                  className={[
                    "size-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                    active
                      ? "bg-white text-emerald-700"
                      : done
                        ? "bg-emerald-600 text-white"
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

      {/* Nav buttons */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={!canGoBack}
          className="text-emerald-800 hover:text-emerald-900 hover:bg-emerald-50"
        >
          <ChevronLeft className="size-4" />
          Back
        </Button>

        <div className="text-xs text-muted-foreground hidden sm:block">
          {step === "summary" && summaryStatus === "confirmed"
            ? "Summary confirmed — continue to integration"
            : step === "summary"
              ? "Review and confirm the AI summary to continue"
              : isLast
                ? "Patient intake complete — ready for consultation"
                : `Step ${currentIdx + 1} of ${STEP_ORDER.length}: ${STEP_LABELS[step]}`}
        </div>

        {!isLast ? (
          <Button
            onClick={handleContinue}
            disabled={!canAdvance()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Continue
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button
            onClick={() => setStep("welcome")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            New Patient
          </Button>
        )}
      </div>
    </footer>
  );
}
