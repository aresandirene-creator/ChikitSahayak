"use client";

import { useEffect, useState } from "react";
import { useMediKioskStore } from "@/lib/store";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RedFlagToast() {
  const redFlags = useMediKioskStore((s) => s.redFlags);
  const acknowledgeRedFlag = useMediKioskStore((s) => s.acknowledgeRedFlag);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  // Show only unacknowledged, undismissed red flags
  const visible = redFlags.filter((f) => !f.acknowledged && !dismissed[f.id]);

  if (visible.length === 0) return null;

  const top = visible[0];

  const dismiss = () => {
    setDismissed((d) => ({ ...d, [top.id]: true }));
  };

  const acknowledge = () => {
    acknowledgeRedFlag(top.id);
    setDismissed((d) => ({ ...d, [top.id]: true }));
  };

  return (
    <div className="fixed bottom-28 sm:bottom-32 right-4 z-50 max-w-sm animate-in slide-in-from-right">
      <div className="rounded-xl border-2 border-red-300 bg-red-50 shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-red-800">Red-flag symptom detected</div>
            <div className="text-xs text-red-700 mt-0.5">
              <span className="font-semibold">{top.symptom}</span>
              {top.reasoning && <div className="mt-0.5">{top.reasoning}</div>}
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={acknowledge}
                className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                Alert triage
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={dismiss}
                className="h-7 text-xs border-red-300 text-red-700 hover:bg-red-100"
              >
                <X className="size-3" /> Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
