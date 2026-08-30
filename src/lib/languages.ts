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

// TTS voice selection helper — maps each language to the best available
// ZAI TTS voice. The ZAI SDK voices are mostly Mandarin-focused but several
// are accent-neutral and work well across Indian languages. `jam` (English
// gentleman) is used for Indian English — it has a clear, neutral accent
// that Indian speakers are familiar with from international media.
//
// Available ZAI voices:
//   tongtong  — warm/friendly (default)
//   chuichui  — lively/cute
//   xiaochen  — steady/professional
//   jam       — English gentleman (Indian English accent)
//   kazi      — clear/standard
//   douji     — natural/fluent
//   luodo     — expressive
//
// For Indian languages we use the most neutral/clear voices; the SDK does
// not yet have native Hindi/Tamil/etc. voices, so we pick voices that are
// intelligible and let the LLM handle the actual language text.
export function pickTtsVoiceForLanguage(lang: string): string {
  const map: Record<string, string> = {
    en: "jam",        // Indian English → English gentleman accent
    hi: "tongtong",   // Hindi → warm/friendly default
    bn: "xiaochen",   // Bengali → steady
    ta: "kazi",       // Tamil → clear/standard
    te: "kazi",       // Telugu → clear/standard
    mr: "tongtong",   // Marathi → warm
    gu: "douji",      // Gujarati → natural
    kn: "xiaochen",   // Kannada → steady
    ml: "luodo",      // Malayalam → expressive
    pa: "tongtong",   // Punjabi → warm
    ur: "kazi",       // Urdu → clear
    or: "douji",      // Odia → natural
  };
  return map[lang] ?? "tongtong";
}

// Voice library — full catalogue for the voice settings panel
export const VOICE_LIBRARY = [
  { id: "jam", name: "Indian English", desc: "Clear English gentleman accent — for English-speaking patients", lang: "en" },
  { id: "tongtong", name: "Aarav (Warm)", desc: "Warm, friendly default voice — good for Hindi & most languages", lang: "hi" },
  { id: "xiaochen", name: "Priya (Steady)", desc: "Steady, professional tone — Bengali, Kannada", lang: "multi" },
  { id: "kazi", name: "Ravi (Clear)", desc: "Clear, standard pronunciation — Tamil, Telugu, Urdu", lang: "multi" },
  { id: "douji", name: "Meera (Natural)", desc: "Natural, fluent delivery — Gujarati, Odia", lang: "multi" },
  { id: "chuichui", name: "Lively", desc: "Lively, friendly — for children", lang: "multi" },
  { id: "luodo", name: "Expressive", desc: "Expressive, emotive — Malayalam", lang: "multi" },
] as const;

export type VoiceId = (typeof VOICE_LIBRARY)[number]["id"];
