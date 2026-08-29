// Supported languages for MediKiosk (Indian languages + English)
export const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "EN" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "HI" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "BN" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "TA" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "TE" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "MR" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "GU" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "KN" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "ML" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "PA" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "UR" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "OR" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export function getLanguageName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name ?? "English";
}

export function getLanguageNativeName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.nativeName ?? "English";
}

// Clinical history sections supported by MediKiosk
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

// TTS voice selection helper
export function pickTtsVoiceForLanguage(lang: string): string {
  // The SDK voices are mostly neutral; we keep one reliable voice across languages.
  // jam = English gentleman, tongtong = warm/friendly default
  if (lang === "en") return "jam";
  return "tongtong";
}
