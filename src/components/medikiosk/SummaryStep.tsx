"use client";

import { useEffect, useState } from "react";
import { useChikitsaHayakStore } from "@/lib/store";
import { useContinueHandler } from "@/lib/use-continue-handler";
import { useI18n } from "@/lib/use-i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ClinicalSummarySections, RedFlag } from "@/lib/types";
import {
  ClipboardCheck, Sparkles, Loader2, AlertTriangle, Stethoscope, Pill,
  ShieldAlert, HeartPulse, ListTree, Activity, Leaf, FileText, CheckCircle2,
  XCircle, Pencil, ArrowRight, RotateCw, Lock,
} from "lucide-react";

const SECTION_META: Array<{
  key: keyof ClinicalSummarySections;
  labelKey: "summarySectionHpi" | "summarySectionPastHistory" | "summarySectionMedications" | "summarySectionAllergies" | "summarySectionFamily" | "summarySectionRos" | "summarySectionSocial" | "summarySectionDocuments";
  icon: typeof Stethoscope;
}> = [
  { key: "hpi", labelKey: "summarySectionHpi", icon: Stethoscope },
  { key: "pastHistory", labelKey: "summarySectionPastHistory", icon: HeartPulse },
  { key: "medications", labelKey: "summarySectionMedications", icon: Pill },
  { key: "allergies", labelKey: "summarySectionAllergies", icon: ShieldAlert },
  { key: "familyHistory", labelKey: "summarySectionFamily", icon: HeartPulse },
  { key: "ros", labelKey: "summarySectionRos", icon: ListTree },
  { key: "socialHistory", labelKey: "summarySectionSocial", icon: Activity },
  { key: "documents", labelKey: "summarySectionDocuments", icon: FileText },
];

const AYUSH_SECTION: {
  key: keyof ClinicalSummarySections;
  labelKey: "summarySectionAyurvedic";
  icon: typeof Leaf;
} = { key: "ayurvedic", labelKey: "summarySectionAyurvedic", icon: Leaf };

export function SummaryStep() {
  const patient = useChikitsaHayakStore((s) => s.patient);
  const encounterId = useChikitsaHayakStore((s) => s.encounterId);
  const summaryId = useChikitsaHayakStore((s) => s.summaryId);
  const summarySections = useChikitsaHayakStore((s) => s.summarySections);
  const summaryFreeText = useChikitsaHayakStore((s) => s.summaryFreeText);
  const summaryStatus = useChikitsaHayakStore((s) => s.summaryStatus);
  const setSummary = useChikitsaHayakStore((s) => s.setSummary);
  const updateSummarySection = useChikitsaHayakStore((s) => s.updateSummarySection);
  const setSummaryStatus = useChikitsaHayakStore((s) => s.setSummaryStatus);
  const redFlags = useChikitsaHayakStore((s) => s.redFlags);
  const nextStep = useChikitsaHayakStore((s) => s.nextStep);
  const turns = useChikitsaHayakStore((s) => s.turns);
  const documents = useChikitsaHayakStore((s) => s.documents);
  const { t } = useI18n();

  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [physicianNotes, setPhysicianNotes] = useState("");
  const [showMarkdown, setShowMarkdown] = useState(true);

  const sectionsList = patient?.ayushMode
    ? [...SECTION_META, AYUSH_SECTION]
    : SECTION_META;

  const generate = async () => {
    if (!patient) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/summary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, encounterId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setSummary({
        id: data.id,
        sections: data.sections,
        freeText: data.freeText,
        status: data.status,
      });
      toast.success(t("summaryConfirmToast"));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (patient && !summaryId && !generating && (turns.length > 0 || documents.length > 0)) {
      generate();
    }
  }, [patient?.id, encounterId]);

  const persistSummary = async (status: string) => {
    if (!summaryId) return;
    try {
      await fetch(`/api/summary?id=${summaryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          sections: summarySections,
          freeText: summaryFreeText,
          physicianNotes,
        }),
      });
      setSummaryStatus(status);
    } catch (e) {
      console.error("summary persist failed", e);
    }
  };

  const handleConfirm = async () => {
    await persistSummary("confirmed");
    toast.success(t("summaryConfirmToast"));
    nextStep();
  };

  const handleReject = async () => {
    await persistSummary("rejected");
    toast.error(t("summaryRejectToast"));
  };

  const handleEditSave = async () => {
    setEditing(false);
    await persistSummary("edited");
    toast.success(t("summaryEditSavedToast"));
  };

  useContinueHandler(() => {
    if (summaryStatus !== "confirmed") {
      toast.error(t("summaryNeedConfirm"));
      return;
    }
    nextStep();
  });

  if (!patient) {
    return <div className="text-center py-16 text-muted-foreground">{t("identifyTitle")}</div>;
  }

  if (generating) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-20">
          <Loader2 className="size-12 text-sky-500 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-sky-900">{t("summaryGenerating")}</h3>
          <p className="text-muted-foreground mt-1">
            {t("summaryGeneratingDesc")}
          </p>
        </div>
      </div>
    );
  }

  if (!summaryId) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-700 bg-sky-100 rounded-full px-3 py-1">
            <ClipboardCheck className="size-3.5" /> {t("summaryBadge")}
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-sky-900">{t("summaryTitle")}</h2>
        </div>
        <Card className="border-sky-100 shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">{t("summaryNoHistory")}</p>
            <Button onClick={generate} className="bg-sky-600 hover:bg-sky-700 text-white">
              <Sparkles className="size-4" /> {t("summaryTryAnyway")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-700 bg-sky-100 rounded-full px-3 py-1">
          <ClipboardCheck className="size-3.5" /> {t("summaryBadge")}
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-sky-900">{t("summaryTitle")}</h2>
        <p className="mt-1 text-muted-foreground">{t("summarySubtitle")}</p>
      </div>

      {redFlags.length > 0 && (
        <Card className="border-2 border-red-200 bg-red-50/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-5 text-red-600" />
              <h3 className="font-semibold text-red-900">{t("summaryRedFlagTitle")}</h3>
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 ml-auto">
                {redFlags.length}
              </Badge>
            </div>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {redFlags.map((f) => (
                <RedFlagPill key={f.id} flag={f} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3 flex-wrap rounded-xl bg-white border border-sky-100 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <StatusBadge status={summaryStatus} t={t} />
          <span className="text-sm text-muted-foreground">
            {summaryStatus === "draft" && t("summaryStatusDraftDesc")}
            {summaryStatus === "edited" && t("summaryStatusEditedDesc")}
            {summaryStatus === "confirmed" && t("summaryStatusConfirmedDesc")}
            {summaryStatus === "rejected" && t("summaryStatusRejectedDesc")}
          </span>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generate}
            disabled={generating}
            className="border-sky-300 text-sky-700 hover:bg-sky-50"
          >
            <RotateCw className="size-3.5" /> {t("summaryRegenerate")}
          </Button>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              disabled={summaryStatus === "confirmed"}
              className="border-sky-300 text-sky-700 hover:bg-sky-50"
            >
              <Pencil className="size-3.5" /> {t("summaryEdit")}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleEditSave}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              <CheckCircle2 className="size-3.5" /> {t("summarySaveEdits")}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            disabled={summaryStatus === "confirmed"}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <XCircle className="size-3.5" /> {t("summaryReject")}
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={summaryStatus === "confirmed"}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            <CheckCircle2 className="size-3.5" />
            {summaryStatus === "confirmed" ? t("summaryConfirmed") : t("summaryConfirm")}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={showMarkdown ? "default" : "outline"}
          size="sm"
          onClick={() => setShowMarkdown(true)}
          className={showMarkdown ? "bg-sky-600 hover:bg-sky-700 text-white" : "border-sky-300 text-sky-700"}
        >
          <FileText className="size-3.5" /> {t("summaryViewStructured")}
        </Button>
        <Button
          variant={!showMarkdown ? "default" : "outline"}
          size="sm"
          onClick={() => setShowMarkdown(false)}
          className={!showMarkdown ? "bg-sky-600 hover:bg-sky-700 text-white" : "border-sky-300 text-sky-700"}
        >
          <ListTree className="size-3.5" /> {t("summaryViewMarkdown")}
        </Button>
      </div>

      {showMarkdown ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {sectionsList.map(({ key, labelKey, icon: Icon }) => {
            const value = summarySections[key] ?? "Not reported.";
            return (
              <Card key={key} className="border-sky-100 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-sky-900 flex items-center gap-2">
                    <Icon className="size-4 text-sky-600" />
                    {t(labelKey)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <Textarea
                      value={value}
                      onChange={(e) => updateSummarySection(key, e.target.value)}
                      rows={4}
                      className="text-sm border-sky-200 focus-visible:ring-sky-500/30"
                    />
                  ) : (
                    <p className="text-sm text-sky-900 whitespace-pre-wrap leading-relaxed">
                      {value}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-sky-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-sky-900 flex items-center gap-2">
              <FileText className="size-4 text-sky-600" /> {t("summaryViewMarkdown")}
            </CardTitle>
            <CardDescription>{t("summarySubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-sky-900 whitespace-pre-wrap leading-relaxed bg-sky-50/40 rounded-lg p-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {summaryFreeText || t("summarySectionAssessment")}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card className="border-sky-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-sky-900 flex items-center gap-2">
            <Pencil className="size-4 text-sky-600" /> {t("summaryNotesTitle")}
          </CardTitle>
          <CardDescription>{t("summaryNotesDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={physicianNotes}
            onChange={(e) => setPhysicianNotes(e.target.value)}
            placeholder={t("summaryNotesPlaceholder")}
            rows={3}
            className="border-sky-200 focus-visible:ring-sky-500/30"
          />
        </CardContent>
      </Card>

      <div className="rounded-xl bg-sky-50 border border-sky-200 p-4 flex items-start gap-3 text-sm text-sky-800">
        <Lock className="size-5 shrink-0 text-sky-600" />
        <div>
          <p className="font-semibold">{t("summaryDisclaimerTitle")}</p>
          <p className="text-sky-700/80 mt-1">{t("summaryDisclaimerBody")}</p>
        </div>
      </div>

      {summaryStatus === "confirmed" && (
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={nextStep}
            className="bg-sky-600 hover:bg-sky-700 text-white h-12 px-8"
          >
            {t("summaryContinue")}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, t }: { status: string; t: (k: never) => string }) {
  if (status === "confirmed") {
    return <Badge className="bg-sky-100 text-sky-800 border-sky-200"><CheckCircle2 className="size-3 mr-1" /> {t("summaryStatusConfirmed")}</Badge>;
  }
  if (status === "rejected") {
    return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="size-3 mr-1" /> {t("summaryStatusRejected")}</Badge>;
  }
  if (status === "edited") {
    return <Badge className="bg-amber-100 text-amber-800 border-amber-200"><Pencil className="size-3 mr-1" /> {t("summaryStatusEdited")}</Badge>;
  }
  return <Badge className="bg-sky-50 text-sky-700 border-sky-200"><Sparkles className="size-3 mr-1" /> {t("summaryStatusDraft")}</Badge>;
}

function RedFlagPill({ flag }: { flag: RedFlag }) {
  return (
    <div className="rounded-md bg-white border border-red-200 px-2.5 py-1.5 flex items-start gap-2">
      <span className={[
        "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0",
        flag.severity === "critical" ? "bg-red-600 text-white"
          : flag.severity === "severe" ? "bg-red-500 text-white"
            : flag.severity === "moderate" ? "bg-amber-500 text-white"
              : "bg-yellow-400 text-yellow-900",
      ].join(" ")}>
        {flag.severity}
      </span>
      <div className="text-xs text-red-900">
        <div className="font-medium">{flag.symptom}</div>
        {flag.reasoning && <div className="text-red-700/70 mt-0.5">{flag.reasoning}</div>}
      </div>
    </div>
  );
}
