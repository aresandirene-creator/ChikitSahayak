"use client";

import { create } from "zustand";
import type {
  WorkflowStep,
  PatientInfo,
  ChatTurn,
  ExtractedDocumentData,
  RedFlag,
  ClinicalSummarySections,
} from "./types";
import type { LangCode } from "./i18n";

type PrefaceTab = "new" | "returning" | null;

interface MediKioskState {
  // Workflow
  step: WorkflowStep;
  setStep: (s: WorkflowStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Preface tab (DKMS-style)
  prefaceTab: PrefaceTab;
  setPrefaceTab: (t: PrefaceTab) => void;

  // UI language (i18n) — when changed, the whole UI re-renders
  uiLanguage: LangCode;
  setUiLanguage: (l: LangCode) => void;

  // Patient
  patient: PatientInfo | null;
  setPatient: (p: PatientInfo | null) => void;

  // Encounter (visit) — each new intake gets a fresh encounter so the
  // patient's previous visit data is not loaded for the current session.
  encounterId: string | null;
  setEncounterId: (id: string | null) => void;

  // Consent
  consents: Record<string, boolean>;
  setConsent: (scope: string, granted: boolean) => void;
  retentionDays: number | null;
  setRetentionDays: (d: number | null) => void;

  // Chat
  turns: ChatTurn[];
  setTurns: (t: ChatTurn[]) => void;
  addTurn: (t: ChatTurn) => void;
  isAiThinking: boolean;
  setIsAiThinking: (b: boolean) => void;
  currentSection: string;
  setCurrentSection: (s: string) => void;
  historyComplete: boolean;
  setHistoryComplete: (b: boolean) => void;

  // Voice
  voiceEnabled: boolean;
  setVoiceEnabled: (b: boolean) => void;
  voicePlaying: boolean;
  setVoicePlaying: (b: boolean) => void;

  // Documents
  documents: Array<{
    id: string;
    fileName: string;
    fileType: string;
    status: string;
    extracted: ExtractedDocumentData;
    recordDate?: string;
    createdAt: string;
  }>;
  addDocument: (d: {
    id: string;
    fileName: string;
    fileType: string;
    status: string;
    extracted: ExtractedDocumentData;
    recordDate?: string;
    createdAt: string;
  }) => void;
  updateDocument: (id: string, patch: Partial<{ status: string; extracted: ExtractedDocumentData; recordDate: string }>) => void;

  // Red flags
  redFlags: RedFlag[];
  setRedFlags: (r: RedFlag[]) => void;
  addRedFlags: (r: RedFlag[]) => void;
  acknowledgeRedFlag: (id: string) => void;

  // Summary
  summaryId: string | null;
  summarySections: ClinicalSummarySections;
  summaryFreeText: string;
  summaryStatus: string;
  setSummary: (s: {
    id: string;
    sections: ClinicalSummarySections;
    freeText: string;
    status: string;
  }) => void;
  updateSummarySection: (key: keyof ClinicalSummarySections, value: string) => void;
  setSummaryStatus: (s: string) => void;

  // ABDM
  abdmRecords: Array<{ id: string; action: string; status: string; message?: string; createdAt: string }>;
  setAbdmRecords: (r: MediKioskState["abdmRecords"]) => void;
  addAbdmRecord: (r: { id: string; action: string; status: string; message?: string; createdAt: string }) => void;

  // Auto-reset countdown for privacy (seconds remaining before wipe)
  resetCountdown: number | null;
  setResetCountdown: (n: number | null) => void;

  // Reset full session
  reset: () => void;
}

export const useMediKioskStore = create<MediKioskState>((set, get) => ({
  step: "welcome",
  setStep: (s) => set({ step: s }),
  nextStep: () => {
    const order: WorkflowStep[] = ["identify", "consent", "history", "documents", "summary", "abdm", "complete"];
    const idx = order.indexOf(get().step);
    if (idx >= 0 && idx < order.length - 1) set({ step: order[idx + 1] });
  },
  prevStep: () => {
    const order: WorkflowStep[] = ["identify", "consent", "history", "documents", "summary", "abdm", "complete"];
    const idx = order.indexOf(get().step);
    if (idx > 0) set({ step: order[idx - 1] });
  },

  prefaceTab: null,
  setPrefaceTab: (t) => set({ prefaceTab: t }),

  uiLanguage: "en",
  setUiLanguage: (l) => set({ uiLanguage: l }),

  patient: null,
  setPatient: (p) =>
    set((st) => ({
      patient: p,
      // If patient has a language, also switch UI language to match
      uiLanguage: p ? (p.language as LangCode) : st.uiLanguage,
    })),

  encounterId: null,
  setEncounterId: (id) => set({ encounterId: id }),

  consents: {},
  setConsent: (scope, granted) => set((st) => ({ consents: { ...st.consents, [scope]: granted } })),
  retentionDays: 90,
  setRetentionDays: (d) => set({ retentionDays: d }),

  turns: [],
  setTurns: (t) => set({ turns: t }),
  addTurn: (t) => set((st) => ({ turns: [...st.turns, t] })),
  isAiThinking: false,
  setIsAiThinking: (b) => set({ isAiThinking: b }),
  currentSection: "general",
  setCurrentSection: (s) => set({ currentSection: s }),
  historyComplete: false,
  setHistoryComplete: (b) => set({ historyComplete: b }),

  voiceEnabled: true,
  setVoiceEnabled: (b) => set({ voiceEnabled: b }),
  voicePlaying: false,
  setVoicePlaying: (b) => set({ voicePlaying: b }),

  documents: [],
  addDocument: (d) => set((st) => ({ documents: [...st.documents, d] })),
  updateDocument: (id, patch) =>
    set((st) => ({
      documents: st.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    })),

  redFlags: [],
  setRedFlags: (r) => set({ redFlags: r }),
  addRedFlags: (r) =>
    set((st) => {
      const existing = new Set(st.redFlags.map((f) => f.symptom.toLowerCase()));
      const fresh = r.filter((f) => !existing.has(f.symptom.toLowerCase()));
      return { redFlags: [...st.redFlags, ...fresh] };
    }),
  acknowledgeRedFlag: (id) =>
    set((st) => ({
      redFlags: st.redFlags.map((f) => (f.id === id ? { ...f, acknowledged: true } : f)),
    })),

  summaryId: null,
  summarySections: {},
  summaryFreeText: "",
  summaryStatus: "draft",
  setSummary: (s) =>
    set({
      summaryId: s.id,
      summarySections: s.sections,
      summaryFreeText: s.freeText,
      summaryStatus: s.status,
    }),
  updateSummarySection: (key, value) =>
    set((st) => ({ summarySections: { ...st.summarySections, [key]: value } })),
  setSummaryStatus: (s) => set({ summaryStatus: s }),

  abdmRecords: [],
  setAbdmRecords: (r) => set({ abdmRecords: r }),
  addAbdmRecord: (r) => set((st) => ({ abdmRecords: [...st.abdmRecords, r] })),

  resetCountdown: null,
  setResetCountdown: (n) => set({ resetCountdown: n }),

  reset: () =>
    set({
      step: "welcome",
      prefaceTab: null,
      // keep uiLanguage so the next patient sees the previous language first
      patient: null,
      encounterId: null,
      consents: {},
      retentionDays: 90,
      turns: [],
      isAiThinking: false,
      currentSection: "general",
      historyComplete: false,
      documents: [],
      redFlags: [],
      summaryId: null,
      summarySections: {},
      summaryFreeText: "",
      summaryStatus: "draft",
      abdmRecords: [],
      resetCountdown: null,
    }),
}));
