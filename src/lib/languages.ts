// Shared helpers used by both backend and the chat history UI.
// The full language catalogue lives in src/lib/i18n.ts (used by the UI and
// the i18n hook). This file keeps backend-side helpers (TTS voice picking)
// and the history-section catalogue used by HistoryStep.

// Clinical history sections supported by ChikitsaHayak
export const HISTORY_SECTIONS = [
  { id: "hpi", label: "History of Present Illness (HPI)", short: "HPI" },
  { id: "past_history", label: "Past Medical History", short: "Past History" },
  { id: "medications", label: "Current Medications", short: "Medications" },
  { id: "allergies", label: "Allergies", short: "Allergies" },
  { id: "family_history", label: "Family History", short: "Family History" },
  { id: "ros", label: "Review of Systems (ROS)", short: "ROS" },
  { id: "social_history", label: "Social History", short: "Social" },
  { id: "ayurvedic", label: "Ayurvedic History (AYUSH)", short: "AYUSH" },
] as const;

export type HistorySection = (typeof HISTORY_SECTIONS)[number]["id"];

// Common red-flag symptoms requiring triage attention
export const RED_FLAG_SYMPTOMS = [
  "chest pain",
  "severe breathing difficulty",
  "loss of consciousness",
  "severe bleeding",
  "stroke symptoms",
  "suicidal thoughts",
  "high fever with stiff neck",
  "severe abdominal pain",
  "coughing up blood",
  "severe headache",
  "seizure",
  "paralysis",
];

// NOTE: TTS is handled entirely client-side via the browser's Web Speech API
// (Google AI Studio-quality Indian-language voices). See src/lib/use-speech.ts.
// No server TTS helpers are needed here.
