"use client";

import { useMediKioskStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { LanguageSwitcher } from "@/components/medikiosk/LanguageSwitcher";
import {
  UserPlus,
  LogIn,
  MessageSquareHeart,
  FileScan,
  ClipboardCheck,
  Network,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

/**
 * DKMS-style preface screen. The patient picks one of two tabs before any
 * data is collected:
 *
 *   1. "I am a new patient"      → fresh intake
 *   2. "I am returning for a follow-up" → login modal (phone / ABHA)
 *
 * A prominent language grid lets the patient switch the whole UI language
 * before proceeding.
 */
export function PrefaceScreen() {
  const setPrefaceTab = useMediKioskStore((s) => s.setPrefaceTab);
  const setStep = useMediKioskStore((s) => s.setStep);
  const reset = useMediKioskStore((s) => s.reset);
  const { t } = useI18n();

  const FEATURES = [
    { icon: MessageSquareHeart, title: t("prefaceFeature1Title"), desc: t("prefaceFeature1Desc"), color: "bg-rose-50 text-rose-600" },
    { icon: FileScan, title: t("prefaceFeature2Title"), desc: t("prefaceFeature2Desc"), color: "bg-emerald-50 text-emerald-600" },
    { icon: ClipboardCheck, title: t("prefaceFeature3Title"), desc: t("prefaceFeature3Desc"), color: "bg-amber-50 text-amber-600" },
    { icon: Network, title: t("prefaceFeature4Title"), desc: t("prefaceFeature4Desc"), color: "bg-teal-50 text-teal-600" },
  ];

  const handleNewPatient = () => {
    reset();
    setPrefaceTab("new");
    setStep("identify");
  };

  const handleReturning = () => {
    setPrefaceTab("returning");
    // The LoginStep modal is rendered over the preface by the root layout
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 mb-4">
          <ShieldCheck className="size-3.5" />
          {t("appName")}
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-emerald-900 tracking-tight max-w-3xl mx-auto">
          {t("prefaceWelcome")}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-emerald-700/80 max-w-2xl mx-auto leading-relaxed">
          {t("prefaceSubtitle")}
        </p>
      </section>

      {/* Language picker (full grid) */}
      <section className="max-w-3xl mx-auto">
        <div className="text-center text-sm font-semibold text-emerald-700/80 mb-3">
          {t("prefaceLanguagePrompt")}
        </div>
        <LanguageSwitcher />
      </section>

      {/* DKMS-style two-tab choice */}
      <section className="max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-4">
          {/* New patient tab */}
          <button
            onClick={handleNewPatient}
            className="group text-left rounded-2xl border-2 border-emerald-300 bg-white p-6 hover:bg-emerald-50 hover:border-emerald-500 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-200"
          >
            <div className="size-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <UserPlus className="size-7" />
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-1">{t("prefaceTabNew")}</h3>
            <p className="text-sm text-emerald-700/80 leading-relaxed">{t("prefaceTabNewDesc")}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 group-hover:gap-2 transition-all">
              {t("continue")}
              <ArrowRight className="size-4" />
            </div>
          </button>

          {/* Returning patient tab */}
          <button
            onClick={handleReturning}
            className="group text-left rounded-2xl border-2 border-teal-300 bg-white p-6 hover:bg-teal-50 hover:border-teal-500 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-teal-200"
          >
            <div className="size-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <LogIn className="size-7" />
            </div>
            <h3 className="text-xl font-bold text-teal-900 mb-1">{t("prefaceTabReturning")}</h3>
            <p className="text-sm text-teal-700/80 leading-relaxed">{t("prefaceTabReturningDesc")}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 group-hover:gap-2 transition-all">
              {t("loginButton")}
              <ArrowRight className="size-4" />
            </div>
          </button>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid sm:grid-cols-2 gap-3 max-w-4xl mx-auto">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-emerald-100 bg-white p-4 flex items-start gap-3 shadow-sm">
            <div className={`size-10 rounded-lg ${f.color} flex items-center justify-center shrink-0`}>
              <f.icon className="size-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-900 text-sm">{f.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Impact callout */}
      <section className="max-w-4xl mx-auto">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 flex items-start gap-3">
          <Stethoscope className="size-6 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800 leading-relaxed">
            {t("completeImpactBody")}
          </p>
        </div>
      </section>
    </div>
  );
}
