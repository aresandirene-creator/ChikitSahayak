"use client";

import { useState } from "react";
import { useChikitsaHayakStore } from "@/lib/store";
import { useContinueHandler } from "@/lib/use-continue-handler";
import { useI18n } from "@/lib/use-i18n";
import { useUiMode } from "@/lib/use-ui-mode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ShieldCheck, Lock, ArrowRight, CheckCircle2, User, MessageSquareHeart,
  FileScan, ClipboardCheck, Network, Clock, X, Info,
} from "lucide-react";

const CONSENT_ITEMS = [
  { scope: "demographics", icon: User, color: "bg-red-50 text-red-700", optional: false, titleKey: "consentItemDemographicsTitle", descKey: "consentItemDemographicsDesc" },
  { scope: "history", icon: MessageSquareHeart, color: "bg-rose-50 text-rose-700", optional: false, titleKey: "consentItemHistoryTitle", descKey: "consentItemHistoryDesc" },
  { scope: "documents", icon: FileScan, color: "bg-red-50 text-red-700", optional: false, titleKey: "consentItemDocumentsTitle", descKey: "consentItemDocumentsDesc" },
  { scope: "summary", icon: ClipboardCheck, color: "bg-amber-50 text-amber-700", optional: false, titleKey: "consentItemSummaryTitle", descKey: "consentItemSummaryDesc" },
  { scope: "abdm_share", icon: Network, color: "bg-teal-50 text-teal-700", optional: true, titleKey: "consentItemAbdmTitle", descKey: "consentItemAbdmDesc" },
] as const;

const RETENTION_OPTIONS = [
  { days: 7, key: "consentRetain7" as const },
  { days: 30, key: "consentRetain30" as const },
  { days: 90, key: "consentRetain90" as const },
  { days: 365, key: "consentRetain365" as const },
  { days: null, key: "consentRetainForever" as const },
];

export function ConsentStep() {
  const patient = useChikitsaHayakStore((s) => s.patient);
  const encounterId = useChikitsaHayakStore((s) => s.encounterId);
  const consents = useChikitsaHayakStore((s) => s.consents);
  const setConsent = useChikitsaHayakStore((s) => s.setConsent);
  const retentionDays = useChikitsaHayakStore((s) => s.retentionDays);
  const setRetentionDays = useChikitsaHayakStore((s) => s.setRetentionDays);
  const nextStep = useChikitsaHayakStore((s) => s.nextStep);
  const { t } = useI18n();
  const { graphical } = useUiMode();
  const [saving, setSaving] = useState(false);

  const required = ["demographics", "history", "documents", "summary"];
  const allRequiredGranted = required.every((s) => consents[s]);
  const allGranted = [...required, "abdm_share"].every((s) => consents[s]);

  const handleToggle = async (scope: string, granted: boolean) => {
    setConsent(scope, granted);
    if (patient) {
      try {
        await fetch("/api/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: patient.id,
            encounterId,
            scope,
            granted,
            retentionDays,
          }),
        });
      } catch (e) {
        console.error("consent persist failed", e);
      }
    }
  };

  const handleRetention = async (days: number | null) => {
    setRetentionDays(days);
    // Re-persist all granted consents with new retention
    if (patient) {
      for (const c of CONSENT_ITEMS) {
        if (consents[c.scope]) {
          try {
            await fetch("/api/consent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                patientId: patient.id,
                encounterId,
                scope: c.scope,
                granted: true,
                retentionDays: days,
              }),
            });
          } catch {
            /* ignore */
          }
        }
      }
    }
  };

  const grantAll = async () => {
    setSaving(true);
    for (const c of CONSENT_ITEMS) {
      await handleToggle(c.scope, true);
    }
    setSaving(false);
    toast.success(t("consentGranted"));
  };

  const denyAllOptional = async () => {
    setSaving(true);
    await handleToggle("abdm_share", false);
    setSaving(false);
  };

  const handleContinue = () => {
    if (!allRequiredGranted) {
      toast.error(t("consentNeedRequired"));
      return;
    }
    nextStep();
  };

  useContinueHandler(handleContinue);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-100 rounded-full px-3 py-1">
          <ShieldCheck className="size-3.5" /> {t("consentBadge")}
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-red-900">{t("consentTitle")}</h2>
        <p className="mt-1 text-muted-foreground">{t("consentSubtitle")}</p>
      </div>

      {/* Privacy & security */}
      <Card className="border-red-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-red-900 flex items-center gap-2 text-base">
            <Lock className="size-4" /> {t("consentPrivacyTitle")}
          </CardTitle>
          <CardDescription>{t("consentPrivacyDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            <Info className="size-4 shrink-0 mt-0.5" />
            <span>{t("consentGranularNote")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Granular consent items */}
      <Card className="border-red-100 shadow-sm">
        <CardContent className="p-4 space-y-3">
          {CONSENT_ITEMS.map((c) => {
            const granted = Boolean(consents[c.scope]);
            return (
              <div
                key={c.scope}
                className={[
                  "rounded-xl border p-4 transition-colors",
                  granted ? "border-red-300 bg-red-50/60" : "border-muted bg-white hover:bg-muted/40",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <div className={[
                    "rounded-lg flex items-center justify-center shrink-0",
                    graphical ? "size-14" : "size-9",
                    granted ? "bg-red-600 text-white" : c.color,
                  ].join(" ")}>
                    {granted ? <CheckCircle2 className={graphical ? "size-8" : "size-5"} /> : <c.icon className={graphical ? "size-8" : "size-5"} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Label htmlFor={`consent-${c.scope}`} className={["font-semibold text-red-900 cursor-pointer", graphical ? "text-lg" : ""].join(" ")}>
                        {t(c.titleKey)}
                      </Label>
                      {c.optional ? (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                          {t("optional")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          {t("required")}
                        </span>
                      )}
                    </div>
                    {!graphical && (
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {t(c.descKey)}
                      </p>
                    )}
                  </div>
                  <Checkbox
                    id={`consent-${c.scope}`}
                    checked={granted}
                    onCheckedChange={(v) => handleToggle(c.scope, Boolean(v))}
                    className="size-6 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 mt-1"
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Retention period */}
      <Card className="border-red-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-red-900 flex items-center gap-2 text-base">
            <Clock className="size-4" /> {t("consentRetentionTitle")}
          </CardTitle>
          <CardDescription>{t("consentRetentionDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {RETENTION_OPTIONS.map((opt) => (
              <button
                key={String(opt.days)}
                type="button"
                onClick={() => handleRetention(opt.days)}
                className={[
                  "rounded-xl border px-3 py-3 text-center transition-all",
                  retentionDays === opt.days
                    ? "border-red-500 bg-red-50 text-red-800 font-semibold shadow-sm"
                    : "border-red-200 bg-white text-red-700 hover:bg-red-50/50",
                ].join(" ")}
              >
                {t(opt.key)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={grantAll}
          disabled={saving}
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <ShieldCheck className="size-4" /> {t("consentGrantAll")}
        </Button>
        <Button
          variant="ghost"
          onClick={denyAllOptional}
          disabled={saving || !consents["abdm_share"]}
          className="text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" /> {t("consentDenyAll")}
        </Button>
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!allRequiredGranted}
          className="bg-red-600 hover:bg-red-700 text-white h-12 px-8 sm:ml-auto"
        >
          {t("consentContinue")}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
