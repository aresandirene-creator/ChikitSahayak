"use client";

import { useState } from "react";
import { useChikitsaHayakStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Accessibility, X, Type, Contrast, Sparkles, Eye, User,
} from "lucide-react";

/**
 * Accessibility settings panel. Lets the patient or staff manually tune the
 * UI: font size (compact/normal/large/extra-large), high contrast, reduced
 * motion. Opens as a modal from the header's accessibility button.
 *
 * On patient creation, `autoAdaptAccessibility(age)` sets a sensible default
 * based on age; this panel lets the user override it.
 */
export function AccessibilityPanel({ onClose }: { onClose: () => void }) {
  const fontScale = useChikitsaHayakStore((s) => s.fontScale);
  const setFontScale = useChikitsaHayakStore((s) => s.setFontScale);
  const highContrast = useChikitsaHayakStore((s) => s.highContrast);
  const setHighContrast = useChikitsaHayakStore((s) => s.setHighContrast);
  const reduceMotion = useChikitsaHayakStore((s) => s.reduceMotion);
  const setReduceMotion = useChikitsaHayakStore((s) => s.setReduceMotion);
  const { t } = useI18n();

  const fontOptions = [
    { value: 0.9, label: "Aa", label2: "Compact", desc: "Smaller text" },
    { value: 1.0, label: "Aa", label2: "Normal", desc: "Standard size" },
    { value: 1.15, label: "Aa", label2: "Large", desc: "Bigger text" },
    { value: 1.3, label: "Aa", label2: "X-Large", desc: "Biggest text" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white border border-red-200 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="sticky top-0 bg-white border-b border-red-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <Accessibility className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-red-900">Accessibility</h2>
              <p className="text-xs text-muted-foreground">Make the kiosk easier to see and use</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Font size */}
          <div>
            <Label className="text-red-900 font-semibold flex items-center gap-1.5 mb-2">
              <Type className="size-4" /> Text size
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {fontOptions.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setFontScale(o.value)}
                  className={[
                    "rounded-xl border-2 p-3 flex flex-col items-center gap-0.5 transition-all",
                    fontScale === o.value
                      ? "border-red-500 bg-red-50 text-red-800 shadow-sm"
                      : "border-red-100 bg-white text-red-700 hover:bg-red-50/50",
                  ].join(" ")}
                >
                  <span className="font-bold leading-none" style={{ fontSize: `${o.value * 18}px` }}>
                    {o.label}
                  </span>
                  <span className="text-[10px] font-semibold leading-tight">{o.label2}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Auto-adjusted based on the patient's age. Override anytime.
            </p>
          </div>

          {/* High contrast */}
          <div className="rounded-xl border border-red-100 p-3 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <Contrast className="size-5" />
            </div>
            <div className="flex-1">
              <Label className="text-red-900 font-semibold">High contrast</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Black text, stronger borders</p>
            </div>
            <Switch checked={highContrast} onCheckedChange={setHighContrast} />
          </div>

          {/* Reduce motion */}
          <div className="rounded-xl border border-red-100 p-3 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div className="flex-1">
              <Label className="text-red-900 font-semibold">Reduce motion</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Turn off animations</p>
            </div>
            <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
          </div>

          {/* Tips */}
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-start gap-2">
            <Eye className="size-4 shrink-0 mt-0.5" />
            <span>
              Tip: For elderly patients, the kiosk automatically selects X-Large
              text. For children, Large. Use the mode button in the header to
              switch to graphical (picture-based) mode.
            </span>
          </div>

          <Button onClick={onClose} className="w-full h-11 bg-red-600 hover:bg-red-700 text-white">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
