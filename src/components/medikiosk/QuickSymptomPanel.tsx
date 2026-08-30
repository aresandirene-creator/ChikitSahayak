"use client";

import { useI18n } from "@/lib/use-i18n";

/**
 * Graphical-mode-only quick symptom tap panel. Shows big body-part / symptom
 * icons the patient can tap to quickly tell the AI where the problem is,
 * without having to type or speak. Each tap sends a pre-formed short message
 * to the AI in the patient's preferred language.
 */
import {
  Frown, HeartPulse, Thermometer, Wind, Eye, Ear, Bone,
  Stethoscope, Pill, Activity, Droplet, Brain, Footprints,
} from "lucide-react";

interface QuickSymptomProps {
  onPick: (message: string) => void;
  disabled?: boolean;
}

// Each entry has an icon + a short message sent to the AI in English.
// The AI itself converses in the patient's preferred language; these
// quick-tap messages are kept short and in plain English so the AI can
// immediately understand and continue in the right language.
const SYMPTOMS = [
  { icon: Frown, label: "Head", color: "bg-rose-50 text-rose-600 hover:bg-rose-100", msg: "I have a headache" },
  { icon: HeartPulse, label: "Chest", color: "bg-red-50 text-red-600 hover:bg-red-100", msg: "I have chest pain" },
  { icon: Stethoscope, label: "Stomach", color: "bg-amber-50 text-amber-600 hover:bg-amber-100", msg: "I have stomach pain" },
  { icon: Thermometer, label: "Fever", color: "bg-orange-50 text-orange-600 hover:bg-orange-100", msg: "I have fever" },
  { icon: Wind, label: "Breath", color: "bg-red-50 text-red-600 hover:bg-red-100", msg: "I have difficulty breathing" },
  { icon: Eye, label: "Eye", color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100", msg: "I have an eye problem" },
  { icon: Ear, label: "Ear", color: "bg-purple-50 text-purple-600 hover:bg-purple-100", msg: "I have an ear problem" },
  { icon: Bone, label: "Bones", color: "bg-slate-50 text-slate-600 hover:bg-slate-100", msg: "I have bone or joint pain" },
  { icon: Brain, label: "Mind", color: "bg-pink-50 text-pink-600 hover:bg-pink-100", msg: "I have been feeling very stressed or low" },
  { icon: Droplet, label: "Sugar", color: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100", msg: "I have diabetes / high blood sugar" },
  { icon: Activity, label: "BP", color: "bg-rose-50 text-rose-600 hover:bg-rose-100", msg: "I have high blood pressure" },
  { icon: Pill, label: "Meds", color: "bg-teal-50 text-teal-600 hover:bg-teal-100", msg: "I want to tell you about my medicines" },
  { icon: Footprints, label: "Other", color: "bg-red-50 text-red-600 hover:bg-red-100", msg: "I have a different problem" },
];

export function QuickSymptomPanel({ onPick, disabled }: QuickSymptomProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border-2 border-red-200 bg-red-50/40 p-3">
      <div className="text-xs font-semibold text-red-700 mb-2 text-center">
        {t("historyQuickSymptoms")}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {SYMPTOMS.map((s) => (
          <button
            key={s.label}
            type="button"
            disabled={disabled}
            onClick={() => onPick(s.msg)}
            className={[
              "flex flex-col items-center justify-center gap-1 rounded-xl border p-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              s.color,
              "border-transparent",
            ].join(" ")}
            aria-label={s.label}
          >
            <s.icon className="size-7" />
            <span className="text-[10px] font-semibold leading-none">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
