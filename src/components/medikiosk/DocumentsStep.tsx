"use client";

import { useEffect, useRef, useState } from "react";
import { useMediKioskStore } from "@/lib/store";
import { useContinueHandler } from "@/lib/use-continue-handler";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { ExtractedDocumentData } from "@/lib/types";
import {
  FileScan,
  UploadCloud,
  FileText,
  Pill,
  TestTube,
  Stethoscope,
  Activity,
  CalendarDays,
  Building2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  Sparkles,
  ArrowRight,
  FilePlus,
} from "lucide-react";

const FILE_TYPE_LABELS: Record<string, string> = {
  prescription: "Prescription",
  lab_report: "Lab Report",
  discharge_summary: "Discharge Summary",
  other: "Other",
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
  const patient = useMediKioskStore((s) => s.patient);
  const documents = useMediKioskStore((s) => s.documents);
  const addDocument = useMediKioskStore((s) => s.addDocument);
  const updateDocument = useMediKioskStore((s) => s.updateDocument);
  const nextStep = useMediKioskStore((s) => s.nextStep);

  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState("prescription");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !patient) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name}: only image files are supported for AI analysis`);
        continue;
      }
      // Read as data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Optimistic doc
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
        // Note: the server stores the document under its own generated id; the local
        // store keeps the tempId for display only. The summary API reads from the DB
        // so the real id is used when generating the AI clinical summary.
        if (data.status === "completed") {
          toast.success(`${file.name}: digitised`);
        } else {
          toast.error(`${file.name}: ${data.error ?? "analysis failed"}`);
        }
      } catch (e) {
        updateDocument(tempId, { status: "failed" });
        toast.error(`${file.name}: ${(e as Error).message}`);
      }
    }
    setUploading(false);
  };

  // Sort by record date (chronological) — un-dated at the end
  const sortedDocs: LocalDoc[] = [...documents].sort((a, b) => {
    const ad = a.recordDate ? new Date(a.recordDate).getTime() : Infinity;
    const bd = b.recordDate ? new Date(b.recordDate).getTime() : Infinity;
    return ad - bd;
  });

  // Footer "Continue" → generate AI summary (and proceed)
  useContinueHandler(() => {
    nextStep();
  });

  // Count abnormal tests across all docs
  const abnormalCount = sortedDocs.reduce((acc, d) => acc + (d.extracted.tests ?? []).filter((t) => t.abnormal).length, 0);

  if (!patient) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Please identify the patient first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1">
          <FileScan className="size-3.5" /> Step 4 · Document Digitisation
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-emerald-900">
          Scan your previous medical records
        </h2>
        <p className="mt-1 text-muted-foreground">
          Upload old prescriptions, lab reports and discharge summaries. MediKiosk&apos;s AI reads them in any Indian
          language, extracts diagnoses, medicines, tests and procedures, and organises everything chronologically —
          with abnormal investigation values highlighted for the doctor.
        </p>
      </div>

      {/* Upload area */}
      <Card className="border-emerald-100 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="space-y-1.5 flex-1">
              <Label className="text-emerald-900">Document type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prescription">Prescription</SelectItem>
                  <SelectItem value="lab_report">Lab Report</SelectItem>
                  <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-11"
            >
              <UploadCloud className="size-4" />
              {uploading ? "Uploading…" : "Upload image(s)"}
            </Button>
          </div>

          {/* Drop zone */}
          <label
            htmlFor="doc-file-input"
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("border-emerald-400", "bg-emerald-50");
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-emerald-400", "bg-emerald-50");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-emerald-400", "bg-emerald-50");
              handleFiles(e.dataTransfer.files);
            }}
            className="block cursor-pointer rounded-xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors p-8 text-center"
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
            <FilePlus className="size-10 text-emerald-400 mx-auto mb-2" />
            <div className="text-sm font-medium text-emerald-800">
              Click to upload or drag & drop images here
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP supported · multi-file upload allowed
            </div>
          </label>

          {abnormalCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
              <AlertCircle className="size-4" />
              <span className="font-semibold">{abnormalCount}</span> abnormal investigation value{abnormalCount > 1 ? "s" : ""} detected across uploaded records — highlighted in the timeline below.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents timeline */}
      {sortedDocs.length === 0 ? (
        <Card className="border-dashed border-emerald-200 bg-emerald-50/30">
          <CardContent className="py-12 text-center">
            <FileText className="size-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-muted-foreground">No documents uploaded yet. Upload at least one image to digitise, or skip to continue.</p>
            <Button variant="outline" onClick={nextStep} className="mt-4 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              Skip to summary <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <CalendarDays className="size-4" />
            Medical record timeline ({sortedDocs.length} document{sortedDocs.length > 1 ? "s" : ""})
          </div>
          <div className="relative pl-6">
            {/* vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-emerald-200" />
            {sortedDocs.map((doc, idx) => (
              <DocumentCard key={doc.id} doc={doc} index={idx} />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          onClick={nextStep}
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8"
        >
          Generate AI summary
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function DocumentCard({ doc, index }: { doc: LocalDoc; index: number }) {
  const [expanded, setExpanded] = useState(true);
  const [showRaw, setShowRaw] = useState(false);
  const fileTypeLabel = FILE_TYPE_LABELS[doc.fileType] ?? "Document";

  const tests = doc.extracted.tests ?? [];
  const medicines = doc.extracted.medicines ?? [];
  const diagnoses = doc.extracted.diagnoses ?? [];
  const procedures = doc.extracted.procedures ?? [];
  const vitals = doc.extracted.vitalSigns ?? [];
  const abnormalTests = tests.filter((t) => t.abnormal);

  return (
    <div className="relative mb-4">
      {/* timeline dot */}
      <div className={[
        "absolute -left-[19px] top-3 size-5 rounded-full border-2 border-white shadow",
        doc.status === "completed" ? "bg-emerald-500" : doc.status === "analyzing" ? "bg-amber-400" : "bg-red-400",
      ].join(" ")} />

      <Card className={[
        "border shadow-sm",
        abnormalTests.length > 0 ? "border-amber-200" : "border-emerald-100",
      ].join(" ")}>
        <CardContent className="p-4">
          {/* Header row */}
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FileText className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-emerald-900 truncate">{doc.fileName}</h3>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                  {fileTypeLabel}
                </Badge>
                {abnormalTests.length > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                    <AlertCircle className="size-3 mr-0.5" /> {abnormalTests.length} abnormal
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
                  <Loader2 className="size-3 mr-1 animate-spin" /> Analyzing
                </Badge>
              )}
              {doc.status === "completed" && (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  <CheckCircle2 className="size-3 mr-1" /> Digitised
                </Badge>
              )}
              {doc.status === "failed" && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <AlertCircle className="size-3 mr-1" /> Failed
                </Badge>
              )}
            </div>
          </div>

          {/* Extracted content */}
          {doc.status === "completed" && (
            <div className="mt-3 space-y-3">
              {diagnoses.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-emerald-800 mb-1">Diagnoses</div>
                  <div className="flex flex-wrap gap-1.5">
                    {diagnoses.map((d, i) => (
                      <Badge key={i} variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {medicines.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1">
                    <Pill className="size-3" /> Medicines ({medicines.length})
                  </div>
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {medicines.map((m, i) => (
                      <div key={i} className="text-xs rounded-md bg-white border border-emerald-100 px-2.5 py-1.5">
                        <span className="font-medium text-emerald-900">{m.name || "—"}</span>
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
                  <div className="text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1">
                    <TestTube className="size-3" /> Investigations ({tests.length})
                  </div>
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {tests.map((t, i) => (
                      <div
                        key={i}
                        className={[
                          "text-xs rounded-md px-2.5 py-1.5 border",
                          t.abnormal
                            ? "bg-amber-50 border-amber-300 text-amber-900"
                            : "bg-white border-emerald-100 text-emerald-900",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{t.name}</span>
                          {t.abnormal && (
                            <span className="text-[10px] font-bold uppercase text-amber-700">Abnormal</span>
                          )}
                        </div>
                        <div className="text-muted-foreground mt-0.5">
                          {t.value ?? "—"}{t.unit ? ` ${t.unit}` : ""}
                          {t.referenceRange && <span> (ref {t.referenceRange})</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {procedures.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-emerald-800 mb-1">Procedures</div>
                  <ul className="text-xs text-emerald-900 list-disc pl-5">
                    {procedures.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}

              {vitals.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1">
                    <Activity className="size-3" /> Vital signs
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {vitals.map((v, i) => (
                      <Badge key={i} variant="outline" className="bg-white text-emerald-800 border-emerald-200">
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
                    className="text-xs text-emerald-700 font-medium hover:underline"
                  >
                    {showRaw ? "Hide" : "Show"} raw OCR text
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
            <div className="mt-3 text-xs text-red-700">
              AI could not extract structured data from this image. The doctor can still review the original during consultation.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
