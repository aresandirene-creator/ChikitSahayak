"use client";

import { useChikitsaHayakStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { useUiMode } from "@/lib/use-ui-mode";
import { ChikitsaHayakLogo } from "@/components/medikiosk/ChikitsaHayakLogo";
import { LanguageSwitcher } from "@/components/medikiosk/LanguageSwitcher";
import { ModeToggle } from "@/components/medikiosk/ModeToggle";
import {
  UserPlus, LogIn, MessageSquareHeart, FileScan, ClipboardCheck,
  Network, ArrowRight, ShieldCheck, Stethoscope, Sparkles,
} from "lucide-react";

/**
 * OMNI HD-style preface screen. Clean, professional medical SaaS hero with
 * the brand logo, a welcome headline, language picker, mode toggle, and two
 * big choice cards (New patient / Returning patient).
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
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center pt-6 sm:pt-12 relative">
        <div className="bg-omni-hero rounded-3xl py-12 px-6 sm:px-12 relative overflow-hidden">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <div className="size-20 sm:size-24 rounded-2xl bg-white shadow-soft-lg p-2">
              <ChikitsaHayakLogo size={72} rounded={false} />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-700 mb-5">
            <ShieldCheck className="size-3.5" />
            {t("appName")} · Digital Bharat
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-red-950 tracking-tight max-w-3xl mx-auto leading-tight">
            {t("prefaceWelcome")}
          </h1>
          {!graphical && (
            <p className="mt-4 text-base sm:text-lg text-red-700/70 max-w-2xl mx-auto leading-relaxed">
              {t("prefaceSubtitle")}
            </p>
          )}
        </div>
      </section>

      {/* Language picker */}
      <section className="max-w-3xl mx-auto">
        <div className="text-center text-sm font-semibold text-red-800/80 mb-3 flex items-center justify-center gap-2">
          <Sparkles className="size-4 text-red-500" />
          {t("prefaceLanguagePrompt")}
        </div>
        <LanguageSwitcher />
      </section>

      {/* Mode toggle */}
      {!graphical && <ModeToggle />}

      {/* Two choice cards — OMNI HD style */}
      <section className="max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {/* New patient */}
          <button
            onClick={handleNewPatient}
            className="group relative text-left rounded-2xl border-2 border-red-200 bg-white p-6 sm:p-7 hover:border-red-500 hover:shadow-soft-lg transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 size-32 bg-red-50 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="size-16 rounded-2xl bg-red-600 text-white flex items-center justify-center mb-4 shadow-soft-md group-hover:scale-105 transition-transform">
                <UserPlus className="size-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-red-950 mb-1.5">{t("prefaceTabNew")}</h3>
              {!graphical && <p className="text-sm text-red-700/70 leading-relaxed mb-4">{t("prefaceTabNewDesc")}</p>}
              <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 group-hover:gap-2.5 transition-all">
                {t("continue")}
                <ArrowRight className="size-4" />
              </div>
            </div>
          </button>

          {/* Returning patient */}
          <button
            onClick={handleReturning}
            className="group relative text-left rounded-2xl border-2 border-teal-200 bg-white p-6 sm:p-7 hover:border-teal-500 hover:shadow-soft-lg transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 size-32 bg-teal-50 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="size-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-4 shadow-soft-md group-hover:scale-105 transition-transform">
                <LogIn className="size-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-teal-950 mb-1.5">{t("prefaceTabReturning")}</h3>
              {!graphical && <p className="text-sm text-teal-700/70 leading-relaxed mb-4">{t("prefaceTabReturningDesc")}</p>}
              <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 group-hover:gap-2.5 transition-all">
                {t("loginButton")}
                <ArrowRight className="size-4" />
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Feature cards */}
      {!graphical && (
        <section className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-red-100 bg-white p-4 shadow-soft hover:shadow-soft-md transition-shadow"
              >
                <div className={`size-11 rounded-xl ${f.color} flex items-center justify-center mb-3`}>
                  <f.icon className="size-5.5" />
                </div>
                <h3 className="font-semibold text-sm text-red-950 mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Impact callout */}
      {!graphical && (
        <section className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white p-6 shadow-soft-lg flex items-start gap-4">
            <Stethoscope className="size-7 shrink-0 mt-0.5 opacity-90" />
            <div>
              <h3 className="font-bold text-lg mb-1">{t("completeImpactTitle")}</h3>
              <p className="text-sm text-red-50/90 leading-relaxed">{t("completeImpactBody")}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
