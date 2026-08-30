// Shared TypeScript types for ChikitsaHayak

export interface PatientInfo {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  abhaId?: string;
  language: string;
  ayushMode: boolean;
  bloodGroup?: string;
}

export interface ChatTurn {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  section: string;
  language: string;
  audioPath?: string;
  createdAt: string;
}

export interface ExtractedDocumentData {
  documentType?: string;
  recordDate?: string;
  diagnoses?: string[];
  medicines?: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
  }>;
  tests?: Array<{
    name: string;
    value?: string;
    unit?: string;
    referenceRange?: string;
    abnormal?: boolean;
  }>;
  procedures?: string[];
  vitalSigns?: Array<{ name: string; value: string }>;
  physician?: string;
  facility?: string;
  rawText?: string;
}

export interface ClinicalSummarySections {
  hpi?: string;
  pastHistory?: string;
  medications?: string;
  allergies?: string;
  familyHistory?: string;
  ros?: string;
  socialHistory?: string;
  ayurvedic?: string;
  documents?: string;
  assessment?: string;
}

export interface RedFlag {
  id: string;
  symptom: string;
  severity: "mild" | "moderate" | "severe" | "critical";
  reasoning?: string;
  acknowledged: boolean;
  createdAt: string;
}

export interface ABDMRecord {
  id: string;
  action: string;
  status: string;
  message?: string;
  createdAt: string;
}

export interface ConsentRecord {
  id: string;
  scope: string;
  granted: boolean;
  grantedAt?: string;
}

// API request/response shapes
export interface ChatRequest {
  patientId: string;
  message: string;
  language?: string;
  ayushMode?: boolean;
  section?: string;
}

export interface ChatResponse {
  reply: string;
  section: string;
  language: string;
  redFlags?: Array<{ symptom: string; severity: string; reasoning?: string }>;
  suggestedNextSections?: string[];
  audioBase64?: string; // optional TTS audio (base64 wav)
}

export interface SummaryRequest {
  patientId: string;
}

export interface SummaryResponse {
  id: string;
  sections: ClinicalSummarySections;
  freeText: string;
  redFlags: RedFlag[];
  status: string;
}

export interface DocumentAnalyzeRequest {
  patientId: string;
  fileName: string;
  mimeType: string;
  dataUrl: string; // base64 data URL
  fileType?: string;
}

export interface DocumentAnalyzeResponse {
  id: string;
  extracted: ExtractedDocumentData;
  status: string;
}

export type WorkflowStep =
  | "welcome"
  | "identify"
  | "consent"
  | "history"
  | "documents"
  | "summary"
  | "abdm"
  | "complete";

export const STEP_LABELS: Record<WorkflowStep, string> = {
  welcome: "Welcome",
  identify: "Identify",
  consent: "Consent",
  history: "AI History",
  documents: "Scan Docs",
  summary: "AI Summary",
  abdm: "HIS / ABHA",
  complete: "Consultation",
};

export const STEP_ORDER: WorkflowStep[] = [
  "identify",
  "consent",
  "history",
  "documents",
  "summary",
  "abdm",
  "complete",
];
