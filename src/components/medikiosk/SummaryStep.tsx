"use client";

import { useEffect, useState } from "react";
import { useMediKioskStore } from "@/lib/store";
import { useContinueHandler } from "@/lib/use-continue-handler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ClinicalSummarySections, RedFlag } from "@/lib/types";
import {
  ClipboardCheck,
  Sparkles,
  Loader2,
  AlertTriangle,
  Stethoscope,
  Pill,
  ShieldAlert,
  HeartPulse,
  ListTree,
  Activity,
  Leaf,
  FileText,
  CheckCircle2,
  XCircle,
  Pencil,
  ArrowRight,
  RotateCw,
  Lock,
} from "lucide-react";

const SECTION_META: Array<{
  key: keyof ClinicalSummarySections;
  label: string;
  icon: typeof Stethoscope;
}> = [
  { key: "hpi", label: "History of Present Illness", icon: Stethoscope },
  { key: "pastHistory", label: "Past Medical History", icon: HeartPulse },
  { key: "medications", label: "Current Medications", icon: Pill },
  { key: "allergies", label: "Allergies", icon: ShieldAlert },
  { key: "familyHistory", label: "Family History", icon: HeartPulse },
  { key: "ros", label: "Review of Systems", icon: ListTree },
  { key: "socialHistory", label: "Social History", icon: Activity },
  { key: "documents", label: "Significant Findings from Records", icon: FileText },
];

const AYUSH_SECTION: { key: keyof ClinicalSummarySections; label: string; icon: typeof Leaf } = {
  key: "ayurvedic",
  label: "Ayurvedic / AYUSH History",
  icon: Leaf,
};

export function SummaryStep() {
  const patient = useMediKioskStore((s) => s.patient);
  const summaryId = useMediKioskStore((s) => s.summaryId);
  const summarySections = useMediKioskStore((s) => s.summarySections);
  const summaryFreeText = useMediKioskStore((s) => s.summaryFreeText);
  const summaryStatus = useMediKioskStore((s) => s.summaryStatus);
  const setSummary = useMediKioskStore((s) => s.setSummary);
  const updateSummarySection = useMediKioskStore((s) => s.updateSummarySection);
  const setSummaryStatus = useMediKioskStore((s) => s.setSummaryStatus);
  const redFlags = useMediKioskStore((s) => s.redFlags);
  const nextStep = useMediKioskStore((s) => s.nextStep);
  const turns = useMediKioskStore((s) => s.turns);
  const documents = useMediKioskStore((s) => s.documents);

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
        body: JSON.stringify({ patientId: patient.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setSummary({
        id: data.id,
        sections: data.sections,
        freeText: data.freeText,
        status: data.status,
      });
      toast.success("AI clinical summary generated");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  // Auto-generate on first visit
  useEffect(() => {
    if (patient && !summaryId && !generating && (turns.length > 0 || documents.length > 0)) {
      generate();
    }
  }, [patient?.id]);

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
    toast.success("Summary confirmed — ready for HIS / ABHA integration");
    nextStep();
  };

  // Footer "Continue" only enabled when status === "confirmed" — just navigate
  useContinueHandler(() => {
    if (summaryStatus !== "confirmed") {
      toast.error("Please confirm the summary first");
      return;
    }
    nextStep();
  });

  const handleReject = async () => {
    await persistSummary("rejected");
    toast.error("Summary rejected — please regenerate or edit");
  };

  const handleEditSave = async () => {
    setEditing(false);
    await persistSummary("edited");
    toast.success("Edits saved");
  };

  if (!patient) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Please identify the patient first.</p>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-20">
          <Loader2 className="size-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-emerald-900">Generating AI clinical summary…</h3>
          <p className="text-muted-foreground mt-1">
            Combining {turns.length} conversation turns and {documents.length} document{documents.length !== 1 ? "s" : ""} into a structured, physician-readable history.
          </p>
        </div>
      </div>
    );
  }

  if (!summaryId) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1">
            <ClipboardCheck className="size-3.5" /> Step 5 · AI Clinical Summary
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-emerald-900">AI clinical summary</h2>
        </div>
        <Card className="border-emerald-100 shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No history collected yet. Go back and complete the AI history-taking step first.</p>
            <Button onClick={generate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Sparkles className="size-4" /> Try generating anyway
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1">
          <ClipboardCheck className="size-3.5" /> Step 5 · AI Clinical Summary
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-emerald-900">
          Physician-ready clinical history
        </h2>
        <p className="mt-1 text-muted-foreground">
          MediKiosk has combined the patient&apos;s answers and digitised records into the structured summary below.
          The doctor can <span className="font-medium text-emerald-800">review, edit, confirm or reject</span> this summary.
          The AI does not independently diagnose the patient.
        </p>
      </div>

      {/* Red flags banner */}
      {redFlags.length > 0 && (
        <Card className="border-2 border-red-200 bg-red-50/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Red-flag symptoms flagged for triage</h3>
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 ml-auto">
                {redFlags.length} alert{redFlags.length > 1 ? "s" : ""}
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

      {/* Status & actions bar */}
      <div className="flex items-center gap-3 flex-wrap rounded-xl bg-white border border-emerald-100 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <StatusBadge status={summaryStatus} />
          <span className="text-sm text-muted-foreground">
            {summaryStatus === "draft" && "Awaiting physician review"}
            {summaryStatus === "edited" && "Edited by physician"}
            {summaryStatus === "confirmed" && "Confirmed — ready for HIS integration"}
            {summaryStatus === "rejected" && "Rejected — needs re-generation"}
          </span>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generate}
            disabled={generating}
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <RotateCw className="size-3.5" /> Regenerate
          </Button>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              disabled={summaryStatus === "confirmed"}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Pencil className="size-3.5" /> Edit
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleEditSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="size-3.5" /> Save edits
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            disabled={summaryStatus === "confirmed"}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <XCircle className="size-3.5" /> Reject
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={summaryStatus === "confirmed"}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle2 className="size-3.5" /> {summaryStatus === "confirmed" ? "Confirmed" : "Confirm"}
          </Button>
        </div>
      </div>

      {/* Toggle markdown preview */}
      <div className="flex items-center gap-2">
        <Button
          variant={showMarkdown ? "default" : "outline"}
          size="sm"
          onClick={() => setShowMarkdown(true)}
          className={showMarkdown ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-emerald-300 text-emerald-700"}
        >
          <FileText className="size-3.5" /> Structured sections
        </Button>
        <Button
          variant={!showMarkdown ? "default" : "outline"}
          size="sm"
          onClick={() => setShowMarkdown(false)}
          className={!showMarkdown ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-emerald-300 text-emerald-700"}
        >
          <ListTree className="size-3.5" /> Raw markdown
        </Button>
      </div>

      {/* Structured sections */}
      {showMarkdown ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {sectionsList.map(({ key, label, icon: Icon }) => {
            const value = summarySections[key] ?? "Not reported.";
            return (
              <Card key={key} className="border-emerald-100 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                    <Icon className="size-4 text-emerald-600" />
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <Textarea
                      value={value}
                      onChange={(e) => updateSummarySection(key, e.target.value)}
                      rows={4}
                      className="text-sm border-emerald-200 focus-visible:ring-emerald-500/30"
                    />
                  ) : (
                    <p className="text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed">
                      {value}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-emerald-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
              <FileText className="size-4 text-emerald-600" /> Full AI-generated summary (Markdown)
            </CardTitle>
            <CardDescription>This is the raw output the AI produced for the physician.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-emerald-900 whitespace-pre-wrap leading-relaxed bg-emerald-50/40 rounded-lg p-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {summaryFreeText || "(empty)"}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Physician notes */}
      <Card className="border-emerald-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
            <Pencil className="size-4 text-emerald-600" /> Physician notes (optional)
          </CardTitle>
          <CardDescription>Private notes for the doctor — not shared with the patient.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={physicianNotes}
            onChange={(e) => setPhysicianNotes(e.target.value)}
            placeholder="e.g. Patient anxious about ECG result. Reassure and explain plan during consult."
            rows={3}
            className="border-emerald-200 focus-visible:ring-emerald-500/30"
          />
        </CardContent>
      </Card>

      {/* AI disclaimer */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3 text-sm text-emerald-800">
        <Lock className="size-5 shrink-0 text-emerald-600" />
        <div>
          <p className="font-semibold">MediKiosk does not independently diagnose the patient.</p>
          <p className="text-emerald-700/80 mt-1">
            This summary is an AI-organised draft of the patient&apos;s history and prior records. The treating physician
            remains responsible for clinical reasoning, diagnosis and treatment. Confirm to push to the HIS, or
            reject to regenerate.
          </p>
        </div>
      </div>

      {summaryStatus === "confirmed" && (
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={nextStep}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8"
          >
            Continue to HIS / ABHA integration
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed") {
    return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200"><CheckCircle2 className="size-3 mr-1" /> Confirmed</Badge>;
  }
  if (status === "rejected") {
    return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="size-3 mr-1" /> Rejected</Badge>;
  }
  if (status === "edited") {
    return <Badge className="bg-amber-100 text-amber-800 border-amber-200"><Pencil className="size-3 mr-1" /> Edited</Badge>;
  }
  return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200"><Sparkles className="size-3 mr-1" /> Draft</Badge>;
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
