"use client";

import { useMediKioskStore } from "@/lib/store";
import { getLanguageNativeName, getLanguageName } from "@/lib/languages";
import { Badge } from "@/components/ui/badge";
import { Languages, ShieldCheck } from "lucide-react";

export function PatientHeader() {
  const patient = useMediKioskStore((s) => s.patient);
  const setStep = useMediKioskStore((s) => s.setStep);

  if (!patient) {
    return (
      <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
        <Languages className="size-4 text-emerald-600" />
        <span className="text-emerald-700/80 font-medium">Ready to begin intake</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep("identify")}
      className="flex items-center gap-2 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 transition-colors"
      aria-label="Patient info"
    >
      <div className="size-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
        {patient.name?.[0]?.toUpperCase() ?? "P"}
      </div>
      <div className="text-left leading-tight">
        <div className="text-sm font-semibold text-emerald-900 max-w-[140px] truncate">
          {patient.name}
        </div>
        <div className="text-[10px] text-emerald-700/70 -mt-0.5">
          {patient.age ? `${patient.age}y` : "—"} · {patient.gender ?? "—"} · {getLanguageName(patient.language)}
        </div>
      </div>
      {patient.ayushMode && (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] h-5">
          AYUSH
        </Badge>
      )}
      {patient.abhaId && (
        <ShieldCheck className="size-4 text-emerald-600" />
      )}
    </button>
  );
}
