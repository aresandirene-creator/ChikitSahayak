"use client";

import { useMediKioskStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Leaf } from "lucide-react";

export function PatientHeader() {
  const patient = useMediKioskStore((s) => s.patient);
  const setStep = useMediKioskStore((s) => s.setStep);
  const { t } = useI18n();

  if (!patient) {
    return null;
  }

  return (
    <button
      onClick={() => setStep("identify")}
      className="flex items-center gap-2 rounded-full bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 transition-colors"
      aria-label="Patient info"
    >
      <div className="size-7 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center">
        {patient.name?.[0]?.toUpperCase() ?? "P"}
      </div>
      <div className="text-left leading-tight">
        <div className="text-sm font-semibold text-sky-900 max-w-[140px] truncate">
          {patient.name}
        </div>
        <div className="text-[10px] text-sky-600 -mt-0.5">
          {patient.age ? `${patient.age}y · ` : ""}{patient.gender ?? "—"}
        </div>
      </div>
      {patient.ayushMode && (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] h-5">
          <Leaf className="size-2.5 mr-0.5" /> AYUSH
        </Badge>
      )}
      {patient.abhaId && (
        <ShieldCheck className="size-4 text-sky-600" />
      )}
    </button>
  );
}
