"use client";

import { useRef, useState } from "react";
import { useChikitsaHayakStore } from "@/lib/store";
import { useContinueHandler } from "@/lib/use-continue-handler";
import { useI18n } from "@/lib/use-i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { ExtractedDocumentData } from "@/lib/types";
import {
  FileScan, UploadCloud, FileText, Pill, TestTube, Stethoscope, Activity,
  CalendarDays, Building2, AlertCircle, CheckCircle2, Loader2,
  ArrowRight, FilePlus,
} from "lucide-react";

const FILE_TYPE_LABELS_KEYS: Record<string, "documentsTypePrescription" | "documentsTypeLab" | "documentsTypeDischarge" | "documentsTypeOther"> = {
  prescription: "documentsTypePrescription",
  lab_report: "documentsTypeLab",
  discharge_summary: "documentsTypeDischarge",
  other: "documentsTypeOther",
};

interface LocalDoc {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
  extracted: ExtractedDocumentData;
  recordDate?: string;
  createdAt: string;
}

export function DocumentsStep() {
  const patient = useChikitsaHayakStore((s) => s.patient);
  const encounterId = useChikitsaHayakStore((s) => s.encounterId);
  const documents = useChikitsaHayakStore((s) => s.documents);
  const addDocument = useChikitsaHayakStore((s) => s.addDocument);
  const updateDocument = useChikitsaHayakStore((s) => s.updateDocument);
  const nextStep = useChikitsaHayakStore((s) => s.nextStep);
  const { t } = useI18n();

  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState("prescription");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !patient) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name}: image only`);
        continue;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      addDocument({
        id: tempId,
        fileName: file.name,
        fileType: selectedType,
        status: "analyzing",
        extracted: {},
        createdAt: new Date().toISOString(),
      });

      try {
        const res = await fetch("/api/documents/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: patient.id,
            encounterId,
            fileName: file.name,
            mimeType: file.type,
            dataUrl,
            fileType: selectedType,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Analysis failed");

        updateDocument(tempId, {
          status: data.status,
          extracted: data.extracted,
          recordDate: data.recordDate ?? undefined,
        });
        if (data.status === "completed") {
          toast.success(`${file.name}: ${t("documentsDigitised")}`);
        } else {
          toast.error(`${file.name}: ${data.error ?? "failed"}`);
        }
      } catch (e) {
        updateDocument(tempId, { status: "failed" });
        toast.error(`${file.name}: ${(e as Error).message}`);
      }
    }
    setUploading(false);
  };

  const sortedDocs: LocalDoc[] = [...documents].sort((a, b) => {
    const ad = a.recordDate ? new Date(a.recordDate).getTime() : Infinity;
    const bd = b.recordDate ? new Date(b.recordDate).getTime() : Infinity;
    return ad - bd;
  });

  const abnormalCount = sortedDocs.reduce((acc, d) => acc + (d.extracted.tests ?? []).filter((tt) => tt.abnormal).length, 0);

  useContinueHandler(() => {
    nextStep();
  });

  if (!patient) {
    return <div className="text-center py-16 text-muted-foreground">{t("identifyTitle")}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-100 rounded-full px-3 py-1">
          <FileScan className="size-3.5" /> {t("documentsBadge")}
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-red-900">{t("documentsTitle")}</h2>
        <p className="mt-1 text-muted-foreground">{t("documentsSubtitle")}</p>
      </div>

      <Card className="border-red-100 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="space-y-1.5 flex-1">
              <Label className="text-red-900">{t("documentsTypeLabel")}</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prescription">{t("documentsTypePrescription")}</SelectItem>
                  <SelectItem value="lab_report">{t("documentsTypeLab")}</SelectItem>
                  <SelectItem value="discharge_summary">{t("documentsTypeDischarge")}</SelectItem>
                  <SelectItem value="other">{t("documentsTypeOther")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-red-600 hover:bg-red-700 text-white h-11"
            >
              <UploadCloud className="size-4" />
              {uploading ? t("documentsUploadUploading") : t("documentsUploadButton")}
            </Button>
          </div>

          <label
            htmlFor="doc-file-input"
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("border-red-400", "bg-red-50");
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-red-400", "bg-red-50");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-red-400", "bg-red-50");
              handleFiles(e.dataTransfer.files);
            }}
            className="block cursor-pointer rounded-xl border-2 border-dashed border-red-200 hover:border-red-400 hover:bg-red-50/50 transition-colors p-8 text-center"
          >
            <input
              id="doc-file-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <FilePlus className="size-10 text-red-400 mx-auto mb-2" />
            <div className="text-sm font-medium text-red-800">{t("documentsDropzone")}</div>
            <div className="text-xs text-muted-foreground mt-1">{t("documentsDropzoneHint")}</div>
          </label>

          {abnormalCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
              <AlertCircle className="size-4" />
              {t("documentsAbnormal", { n: abnormalCount })}
            </div>
          )}
        </CardContent>
      </Card>

      {sortedDocs.length === 0 ? (
        <Card className="border-dashed border-red-200 bg-red-50/30">
          <CardContent className="py-12 text-center">
            <FileText className="size-12 text-red-300 mx-auto mb-3" />
            <p className="text-muted-foreground">{t("documentsEmpty")}</p>
            <Button variant="outline" onClick={nextStep} className="mt-4 border-red-300 text-red-700 hover:bg-red-50">
              {t("documentsSkip")} <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
            <CalendarDays className="size-4" />
            {t("documentsTimeline", { n: sortedDocs.length })}
          </div>
          <div className="relative pl-6">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-red-200" />
            {sortedDocs.map((doc, idx) => (
              <DocumentCard key={doc.id} doc={doc} index={idx} t={t} />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          onClick={nextStep}
          className="bg-red-600 hover:bg-red-700 text-white h-12 px-8"
        >
          {t("documentsContinue")}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function DocumentCard({
  doc, index, t,
}: {
  doc: LocalDoc;
  index: number;
  t: (k: never, vars?: Record<string, string | number>) => string;
}) {
  const [showRaw, setShowRaw] = useState(false);
  const fileTypeLabel = FILE_TYPE_LABELS_KEYS[doc.fileType] ? t(FILE_TYPE_LABELS_KEYS[doc.fileType] as never) : doc.fileType;

  const tests = doc.extracted.tests ?? [];
  const medicines = doc.extracted.medicines ?? [];
  const diagnoses = doc.extracted.diagnoses ?? [];
  const procedures = doc.extracted.procedures ?? [];
  const vitals = doc.extracted.vitalSigns ?? [];
  const abnormalTests = tests.filter((tt) => tt.abnormal);

  return (
    <div className="relative mb-4">
      <div className={[
        "absolute -left-[19px] top-3 size-5 rounded-full border-2 border-white shadow",
        doc.status === "completed" ? "bg-red-500" : doc.status === "analyzing" ? "bg-amber-400" : "bg-red-400",
      ].join(" ")} />

      <Card className={[
        "border shadow-sm",
        abnormalTests.length > 0 ? "border-amber-200" : "border-red-100",
      ].join(" ")}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <FileText className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-red-900 truncate">{doc.fileName}</h3>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">
                  {fileTypeLabel}
                </Badge>
                {abnormalTests.length > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                    <AlertCircle className="size-3 mr-0.5" /> {abnormalTests.length} {t("documentsAbnormalBadge").toLowerCase()}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
                {doc.recordDate && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3" />
                    {new Date(doc.recordDate).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                )}
                {doc.extracted.facility && (
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="size-3" />
                    {doc.extracted.facility}
                  </span>
                )}
                {doc.extracted.physician && (
                  <span className="inline-flex items-center gap-1">
                    <Stethoscope className="size-3" />
                    {doc.extracted.physician}
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0">
              {doc.status === "analyzing" && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  <Loader2 className="size-3 mr-1 animate-spin" /> {t("documentsStatusAnalyzing")}
                </Badge>
              )}
              {doc.status === "completed" && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <CheckCircle2 className="size-3 mr-1" /> {t("documentsStatusCompleted")}
                </Badge>
              )}
              {doc.status === "failed" && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <AlertCircle className="size-3 mr-1" /> {t("documentsStatusFailed")}
                </Badge>
              )}
            </div>
          </div>

          {doc.status === "completed" && (
            <div className="mt-3 space-y-3">
              {diagnoses.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-red-800 mb-1">{t("documentsExtractedDiagnoses")}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {diagnoses.map((d, i) => (
                      <Badge key={i} variant="outline" className="bg-red-50 text-red-800 border-red-200">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {medicines.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-red-800 mb-1 flex items-center gap-1">
                    <Pill className="size-3" /> {t("documentsExtractedMedicines", { n: medicines.length })}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {medicines.map((m, i) => (
                      <div key={i} className="text-xs rounded-md bg-white border border-red-100 px-2.5 py-1.5">
                        <span className="font-medium text-red-900">{m.name || "—"}</span>
                        {m.dosage && <span className="text-muted-foreground"> · {m.dosage}</span>}
                        {m.frequency && <span className="text-muted-foreground"> · {m.frequency}</span>}
                        {m.duration && <span className="text-muted-foreground"> · {m.duration}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tests.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-red-800 mb-1 flex items-center gap-1">
                    <TestTube className="size-3" /> {t("documentsExtractedTests", { n: tests.length })}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {tests.map((tt, i) => (
                      <div
                        key={i}
                        className={[
                          "text-xs rounded-md px-2.5 py-1.5 border",
                          tt.abnormal
                            ? "bg-amber-50 border-amber-300 text-amber-900"
                            : "bg-white border-red-100 text-red-900",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{tt.name}</span>
                          {tt.abnormal && (
                            <span className="text-[10px] font-bold uppercase text-amber-700">{t("documentsAbnormalBadge")}</span>
                          )}
                        </div>
                        <div className="text-muted-foreground mt-0.5">
                          {tt.value ?? "—"}{tt.unit ? ` ${tt.unit}` : ""}
                          {tt.referenceRange && <span> (ref {tt.referenceRange})</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {procedures.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-red-800 mb-1">{t("documentsExtractedProcedures")}</div>
                  <ul className="text-xs text-red-900 list-disc pl-5">
                    {procedures.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}

              {vitals.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-red-800 mb-1 flex items-center gap-1">
                    <Activity className="size-3" /> {t("documentsExtractedVitals")}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {vitals.map((v, i) => (
                      <Badge key={i} variant="outline" className="bg-white text-red-800 border-red-200">
                        {v.name}: <span className="font-medium ml-1">{v.value}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {doc.extracted.rawText && (
                <div>
                  <button
                    onClick={() => setShowRaw((v) => !v)}
                    className="text-xs text-red-700 font-medium hover:underline"
                  >
                    {showRaw ? t("documentsExtractedRawHide") : t("documentsExtractedRawShow")}
                  </button>
                  {showRaw && (
                    <pre className="mt-1 text-[11px] text-muted-foreground bg-muted/40 rounded-md p-3 max-h-40 overflow-y-auto scrollbar-thin whitespace-pre-wrap">
                      {doc.extracted.rawText}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {doc.status === "failed" && (
            <div className="mt-3 text-xs text-red-700">{t("documentsFailedNote")}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
