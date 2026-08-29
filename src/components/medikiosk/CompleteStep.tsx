"use client";

import { useEffect, useState } from "react";
import { useMediKioskStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2, Stethoscope, MessageSquareHeart, FileScan, ClipboardCheck,
  Network, ArrowRight, Sparkles, Clock, Activity, ShieldCheck, RotateCcw,
} from "lucide-react";

const RESET_SECONDS = 30;

export function CompleteStep() {
  const patient = useMediKioskStore((s) => s.patient);
  const encounterId = useMediKioskStore((s) => s.encounterId);
  const turns = useMediKioskStore((s) => s.turns);
  const documents = useMediKioskStore((s) => s.documents);
  const summaryStatus = useMediKioskStore((s) => s.summaryStatus);
  const redFlags = useMediKioskStore((s) => s.redFlags);
  const abdmRecords = useMediKioskStore((s) => s.abdmRecords);
  const setStep = useMediKioskStore((s) => s.setStep);
  const reset = useMediKioskStore((s) => s.reset);
  const setResetCountdown = useMediKioskStore((s) => s.setResetCountdown);
  const { t } = useI18n();

  const [countdown, setCountdown] = useState(RESET_SECONDS);

  // Mark the encounter as completed on first mount, then start the
  // auto-reset countdown for privacy.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (encounterId) {
        try {
          await fetch(`/api/encounter?id=${encounterId}`, { method: "PATCH" });
        } catch (e) {
          console.error("encounter complete failed", e);
        }
      }
    })();
    return () => { cancelled = true; void cancelled; };
  }, [encounterId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          // Auto-reset for privacy
          reset();
          setStep("welcome");
          setResetCountdown(null);
          return 0;
        }
        setResetCountdown(c - 1);
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const resetNow = () => {
    reset();
    setStep("welcome");
  };

  const successfulAbdm = abdmRecords.filter((r) => r.status === "success").length;
  const acknowledgedFlags = redFlags.filter((f) => f.acknowledged).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero confirmation */}
      <div className="text-center pt-4 sm:pt-8">
        <div className="size-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-100">
          <CheckCircle2 className="size-12" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-emerald-900">
          {t("completeTitle")}
        </h1>
        <p className="mt-3 text-lg text-emerald-700/80 max-w-2xl mx-auto">
          {t("completeSubtitle", { name: patient?.name ?? "" })}
        </p>
      </div>

      {/* Recap cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <RecapCard
          icon={Stethoscope}
          label={t("completeRecapPatient")}
          value={patient?.name ?? "—"}
          subtext={patient ? `${patient.age ? `${patient.age}y · ` : ""}${patient.gender ?? ""}` : ""}
        />
        <RecapCard
          icon={MessageSquareHeart}
          label={t("completeRecapHistory")}
          value={`${turns.length}`}
          subtext={t("historyBadge")}
        />
        <RecapCard
          icon={FileScan}
          label={t("completeRecapDocuments")}
          value={`${documents.length}`}
        />
        <RecapCard
          icon={ClipboardCheck}
          label={t("completeRecapSummary")}
          value={summaryStatus === "confirmed" ? t("summaryStatusConfirmed") : summaryStatus === "draft" ? t("summaryStatusDraft") : summaryStatus}
        />
        <RecapCard
          icon={Network}
          label={t("completeRecapAbdm")}
          value={`${successfulAbdm}`}
          subtext={t("abdmSuccessful")}
        />
        <RecapCard
          icon={Activity}
          label={t("completeRecapRedFlags")}
          value={`${redFlags.length}`}
          subtext={redFlags.length > 0 ? t("completeRecapRedFlagsAcknowledged", { n: acknowledgedFlags }) : t("completeRecapRedFlagsAllClear")}
          highlight={redFlags.length > 0}
        />
      </div>

      {/* What happens next */}
      <Card className="border-emerald-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-5 text-emerald-600" />
            <h3 className="font-semibold text-emerald-900">{t("completeNextTitle")}</h3>
          </div>
          <div className="space-y-3">
            <NextRow num="1" icon={ClipboardCheck} text={t("completeNext1")} />
            <NextRow num="2" icon={Stethoscope} text={t("completeNext2")} />
            <NextRow num="3" icon={Network} text={t("completeNext3")} />
          </div>
        </CardContent>
      </Card>

      {/* Impact stat */}
      <Card className="bg-emerald-600 border-0 text-white shadow-xl shadow-emerald-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Clock className="size-7 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold">{t("completeImpactTitle")}</h3>
              <p className="mt-1 text-emerald-50/90 text-sm leading-relaxed">
                {t("completeImpactBody")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy auto-reset banner */}
      <Card className="border-amber-200 bg-amber-50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-amber-900">{t("completePrivacyTitle")}</div>
              <p className="text-sm text-amber-800 mt-0.5">
                {t("completePrivacyBody", { n: countdown })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="size-12 rounded-full bg-white border-2 border-amber-300 flex items-center justify-center text-amber-800 font-bold text-lg tabular-nums">
                {countdown}
              </div>
              <Button
                onClick={resetNow}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <RotateCcw className="size-4" /> {t("completePrivacyResetNow")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Button
          size="lg"
          variant="outline"
          onClick={() => setStep("summary")}
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-12 px-6"
        >
          {t("completeViewSummary")}
        </Button>
        <Button
          size="lg"
          onClick={resetNow}
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8"
        >
          {t("completeNewPatient")}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function RecapCard({
  icon: Icon,
  label,
  value,
  subtext,
  highlight = false,
}: {
  icon: typeof Stethoscope;
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={[
      "border shadow-sm",
      highlight ? "border-amber-200 bg-amber-50/30" : "border-emerald-100",
    ].join(" ")}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={["size-4", highlight ? "text-amber-600" : "text-emerald-600"].join(" ")} />
          <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wide">
            {label}
          </span>
        </div>
        <div className="text-base font-bold text-emerald-900 truncate">{value}</div>
        {subtext && <div className="text-xs text-muted-foreground mt-0.5">{subtext}</div>}
      </CardContent>
    </Card>
  );
}

function NextRow({ num, icon: Icon, text }: { num: string; icon: typeof Stethoscope; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
        {num}
      </div>
      <div className="flex items-start gap-2 pt-0.5">
        <Icon className="size-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-900">{text}</p>
      </div>
    </div>
  );
}
