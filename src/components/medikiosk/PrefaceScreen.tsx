"use client";

import { useChikitsaHayakStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { useUiMode } from "@/lib/use-ui-mode";
import { ChikitsaHayakLogo } from "@/components/medikiosk/ChikitsaHayakLogo";
import { LanguageSwitcher } from "@/components/medikiosk/LanguageSwitcher";
import { ModeToggle } from "@/components/medikiosk/ModeToggle";
import {
  UserPlus, LogIn, MessageSquareHeart, FileScan, ClipboardCheck,
  Network, ArrowRight, Stethoscope,
} from "lucide-react";

/**
 * DKMS-style preface screen. The patient picks one of two tabs before any
 * data is collected:
 *
 *   1. "I am a new patient"      → fresh intake
 *   2. "I am returning for a follow-up" → login modal (phone / ABHA)
 *
 * A prominent language grid lets the patient switch the whole UI language
 * before proceeding. A Normal/Graphical mode toggle lets the patient choose
 * a text-heavy or picture-driven interface.
 */
export function PrefaceScreen() {
  const setPrefaceTab = useChikitsaHayakStore((s) => s.setPrefaceTab);
  const setStep = useChikitsaHayakStore((s) => s.setStep);
  const reset = useChikitsaHayakStore((s) => s.reset);
  const { t } = useI18n();
  const { graphical } = useUiMode();

  const FEATURES = [
    { icon: MessageSquareHeart, title: t("prefaceFeature1Title"), desc: t("prefaceFeature1Desc"), color: "bg-rose-50 text-rose-600" },
    { icon: FileScan, title: t("prefaceFeature2Title"), desc: t("prefaceFeature2Desc"), color: "bg-sky-50 text-sky-600" },
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
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center pt-4 sm:pt-8">
        {/* Big ChikitsaHayak logo */}
        <div className="inline-flex items-center justify-center mb-5">
          <ChikitsaHayakLogo iconSize={48} container containerClass="bg-sky-600 text-white rounded-2xl shadow-lg shadow-sky-200" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 border border-sky-200 mb-4">
          <ChikitsaHayakLogo iconSize={14} />
          {t("appName")}
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-sky-900 tracking-tight max-w-3xl mx-auto">
          {t("prefaceWelcome")}
        </h1>
        {!graphical && (
          <p className="mt-4 text-base sm:text-lg text-sky-700/80 max-w-2xl mx-auto leading-relaxed">
            {t("prefaceSubtitle")}
          </p>
        )}
      </section>

      {/* Language picker (full grid) */}
      <section className="max-w-3xl mx-auto">
        <div className="text-center text-sm font-semibold text-sky-700/80 mb-3">
          {t("prefaceLanguagePrompt")}
        </div>
        <LanguageSwitcher />
      </section>

      {/* Normal / Graphical mode toggle */}
      <ModeToggle />

      {/* DKMS-style two-tab choice */}
      <section className="max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-4">
          {/* New patient tab */}
          <button
            onClick={handleNewPatient}
            className={[
              "group text-left rounded-2xl border-2 bg-white transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-sky-200",
              graphical
                ? "border-sky-300 hover:bg-sky-50 hover:border-sky-500 p-8 sm:p-10"
                : "border-sky-300 p-6 hover:bg-sky-50 hover:border-sky-500",
            ].join(" ")}
          >
            <div className={[
              "rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform",
              graphical ? "size-20" : "size-14",
            ].join(" ")}>
              <UserPlus className={graphical ? "size-10" : "size-7"} />
            </div>
            <h3 className={graphical ? "text-2xl font-bold text-sky-900 mb-1" : "text-xl font-bold text-sky-900 mb-1"}>
              {t("prefaceTabNew")}
            </h3>
            {!graphical && (
              <p className="text-sm text-sky-700/80 leading-relaxed">{t("prefaceTabNewDesc")}</p>
            )}
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 group-hover:gap-2 transition-all">
              {t("continue")}
              <ArrowRight className="size-4" />
            </div>
          </button>

          {/* Returning patient tab */}
          <button
            onClick={handleReturning}
            className={[
              "group text-left rounded-2xl border-2 bg-white transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-teal-200",
              graphical
                ? "border-teal-300 hover:bg-teal-50 hover:border-teal-500 p-8 sm:p-10"
                : "border-teal-300 p-6 hover:bg-teal-50 hover:border-teal-500",
            ].join(" ")}
          >
            <div className={[
              "rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform",
              graphical ? "size-20" : "size-14",
            ].join(" ")}>
              <LogIn className={graphical ? "size-10" : "size-7"} />
            </div>
            <h3 className={graphical ? "text-2xl font-bold text-teal-900 mb-1" : "text-xl font-bold text-teal-900 mb-1"}>
              {t("prefaceTabReturning")}
            </h3>
            {!graphical && (
              <p className="text-sm text-teal-700/80 leading-relaxed">{t("prefaceTabReturningDesc")}</p>
            )}
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 group-hover:gap-2 transition-all">
              {t("loginButton")}
              <ArrowRight className="size-4" />
            </div>
          </button>
        </div>
      </section>

      {/* Feature cards — hidden in graphical mode (replaced by the big tab pictures) */}
      {!graphical && (
        <section className="grid sm:grid-cols-2 gap-3 max-w-4xl mx-auto">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-sky-100 bg-white p-4 flex items-start gap-3 shadow-sm">
              <div className={`size-10 rounded-lg ${f.color} flex items-center justify-center shrink-0`}>
                <f.icon className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sky-900 text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Impact callout */}
      {!graphical && (
        <section className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-sky-50 border border-sky-200 p-5 flex items-start gap-3">
            <Stethoscope className="size-6 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-sm text-sky-800 leading-relaxed">
              {t("completeImpactBody")}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
