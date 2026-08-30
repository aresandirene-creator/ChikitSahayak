"use client";

import { useState } from "react";
import { useChikitsaHayakStore } from "@/lib/store";
import { useContinueHandler } from "@/lib/use-continue-handler";
import { useI18n } from "@/lib/use-i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Network, ShieldCheck, FileDown, Send, Stethoscope, CheckCircle2,
  Loader2, ArrowRight, Fingerprint, Activity, ClipboardCheck, Lock,
} from "lucide-react";

export function AbdmStep() {
  const patient = useChikitsaHayakStore((s) => s.patient);
  const encounterId = useChikitsaHayakStore((s) => s.encounterId);
  const summaryStatus = useChikitsaHayakStore((s) => s.summaryStatus);
  const abdmRecords = useChikitsaHayakStore((s) => s.abdmRecords);
  const addAbdmRecord = useChikitsaHayakStore((s) => s.addAbdmRecord);
  const setPatient = useChikitsaHayakStore((s) => s.setPatient);
  const nextStep = useChikitsaHayakStore((s) => s.nextStep);
  const { t } = useI18n();

  const [busy, setBusy] = useState<string | null>(null);

  const runAction = async (action: string) => {
    if (!patient) return;
    setBusy(action);
    try {
      const res = await fetch("/api/abdm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, encounterId, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || data.message || "Action failed");

      addAbdmRecord({
        id: data.record.id,
        action,
        status: data.record.status,
        message: data.record.message,
        createdAt: data.record.createdAt,
      });

      if (action === "link_abha" && data.message?.includes("ABHA")) {
        const abhaMatch = data.message.match(/ABHA-[\w]+/);
        if (abhaMatch) {
          setPatient({ ...patient, abhaId: abhaMatch[0] });
        }
      }

      // Localise the toast message based on action
      let toastMsg = data.message ?? "";
      if (action === "link_abha") {
        const abhaMatch = data.message?.match(/ABHA-[\w]+/);
        if (data.message?.startsWith("Linked ABHA")) {
          toastMsg = t("abdmMsgLinked", { id: abhaMatch?.[0] ?? "" });
        } else {
          toastMsg = t("abdmMsgAlreadyLinked", { id: abhaMatch?.[0] ?? patient.abhaId ?? "" });
        }
      } else if (action === "fetch_records") {
        toastMsg = t("abdmMsgFetched");
      } else if (action === "share_to_his") {
        toastMsg = t("abdmMsgSharedToHis");
      } else if (action === "push_summary") {
        toastMsg = t("abdmMsgPushedToEmr");
      }
      toast.success(toastMsg);
    } catch (e) {
      toast.error((e as Error).message);
      addAbdmRecord({
        id: `err-${Date.now()}`,
        action,
        status: "failed",
        message: (e as Error).message,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setBusy(null);
    }
  };

  const completedActions = new Set(abdmRecords.filter((r) => r.status === "success").map((r) => r.action));

  useContinueHandler(() => {
    nextStep();
  });

  if (!patient) {
    return <div className="text-center py-16 text-muted-foreground">{t("identifyTitle")}</div>;
  }

  const ACTIONS = [
    { key: "link_abha", icon: Fingerprint, title: t("abdmActionLinkAbhaTitle"), desc: t("abdmActionLinkAbhaDesc"), color: "bg-sky-100 text-sky-700" },
    { key: "fetch_records", icon: FileDown, title: t("abdmActionFetchRecordsTitle"), desc: t("abdmActionFetchRecordsDesc"), color: "bg-sky-100 text-sky-700" },
    { key: "share_to_his", icon: Send, title: t("abdmActionShareToHisTitle"), desc: t("abdmActionShareToHisDesc"), color: "bg-amber-100 text-amber-700" },
    { key: "push_summary", icon: Stethoscope, title: t("abdmActionPushToEmrTitle"), desc: t("abdmActionPushToEmrDesc"), color: "bg-teal-100 text-teal-700" },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-700 bg-sky-100 rounded-full px-3 py-1">
          <Network className="size-3.5" /> {t("abdmBadge")}
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-sky-900">{t("abdmTitle")}</h2>
        <p className="mt-1 text-muted-foreground">{t("abdmSubtitle")}</p>
      </div>

      {/* Status cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Card className="border-sky-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sky-700 mb-1">
              <Fingerprint className="size-4" />
              <span className="text-xs font-semibold uppercase">{t("abdmStatusAbha")}</span>
            </div>
            <div className="text-sm font-medium text-sky-900 truncate">
              {patient.abhaId ? patient.abhaId : t("abdmAbhaNotLinked")}
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sky-700 mb-1">
              <ClipboardCheck className="size-4" />
              <span className="text-xs font-semibold uppercase">{t("abdmStatusSummary")}</span>
            </div>
            <div className="text-sm font-medium text-sky-900">
              {summaryStatus === "confirmed" ? t("abdmSummaryConfirmed") : t("abdmSummaryDraft")}
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sky-700 mb-1">
              <Activity className="size-4" />
              <span className="text-xs font-semibold uppercase">{t("abdmStatusActions")}</span>
            </div>
            <div className="text-sm font-medium text-sky-900">
              {abdmRecords.filter((r) => r.status === "success").length} {t("abdmSuccessful")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {ACTIONS.map(({ key, icon: Icon, title, desc, color }) => {
          const done = completedActions.has(key);
          const isBusy = busy === key;
          const disabled = isBusy || ((key === "share_to_his" || key === "push_summary") && summaryStatus !== "confirmed");
          return (
            <Card
              key={key}
              className={[
                "border shadow-sm transition-colors",
                done ? "border-sky-300 bg-sky-50/30" : "border-sky-100",
              ].join(" ")}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={[
                    "size-11 rounded-xl flex items-center justify-center shrink-0",
                    done ? "bg-sky-600 text-white" : color,
                  ].join(" ")}>
                    {done ? <CheckCircle2 className="size-5" /> : <Icon className="size-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sky-900">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => runAction(key)}
                        disabled={disabled}
                        className="bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50"
                      >
                        {isBusy ? (
                          <><Loader2 className="size-3.5 animate-spin" /> {t("abdmActionRunning")}</>
                        ) : done ? (
                          <><CheckCircle2 className="size-3.5" /> {t("abdmActionRerun")}</>
                        ) : (
                          <><Icon className="size-3.5" /> {t("abdmActionRun")}</>
                        )}
                      </Button>
                      {(key === "share_to_his" || key === "push_summary") && summaryStatus !== "confirmed" && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                          {t("abdmNeedConfirmSummary")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity log */}
      <Card className="border-sky-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-sky-900 flex items-center gap-2">
            <Activity className="size-4 text-sky-600" /> {t("abdmActivityTitle")}
          </CardTitle>
          <CardDescription>{t("abdmActivityDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {abdmRecords.length === 0 ? (
            <div className="text-sm text-muted-foreground italic py-6 text-center">
              {t("abdmActivityEmpty")}
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
              {abdmRecords.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border border-sky-100 bg-white px-3 py-2.5 flex items-start gap-3"
                >
                  <div className={[
                    "size-7 rounded-full flex items-center justify-center shrink-0",
                    r.status === "success" ? "bg-sky-100 text-sky-700" : "bg-red-100 text-red-700",
                  ].join(" ")}>
                    {r.status === "success" ? <CheckCircle2 className="size-4" /> : <Lock className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-[10px]">
                        {r.action.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-sm text-sky-900 mt-0.5">{r.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-xl bg-sky-50 border border-sky-200 p-4 flex items-start gap-3 text-sm text-sky-800">
        <ShieldCheck className="size-5 shrink-0 text-sky-600" />
        <div>
          <p className="font-semibold">{t("abdmPrivacyTitle")}</p>
          <p className="text-sky-700/80 mt-1">{t("abdmPrivacyBody")}</p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          onClick={nextStep}
          className="bg-sky-600 hover:bg-sky-700 text-white h-12 px-8"
        >
          {t("abdmFinish")}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
