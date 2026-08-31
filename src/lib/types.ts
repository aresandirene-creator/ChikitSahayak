// Shared TypeScript types for ChikitSahayak

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

export type WorkflowStep =
  | "welcome"
  | "identify"
  | "consent"
  | "history"
  | "documents"
  | "summary"
  | "abdm"
  | "complete";

export const STEP_ORDER: WorkflowStep[] = [
  "identify",
  "consent",
  "history",
  "documents",
  "summary",
  "abdm",
  "complete",
];
