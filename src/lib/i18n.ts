// MediKiosk i18n — UI strings for 12 Indian languages + English.
// Used by the useI18n() hook to render the entire kiosk UI in the patient's
// preferred language. When the patient changes language on the identify step,
// the whole UI re-renders in that language.

export type LangCode =
  | "en" | "hi" | "bn" | "ta" | "te" | "mr"
  | "gu" | "kn" | "ml" | "pa" | "ur" | "or";

export const LANGUAGES: { code: LangCode; name: string; nativeName: string; flag: string }[] = [
  { code: "en", name: "English", nativeName: "English", flag: "EN" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "हि" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "বা" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "த" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "తె" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "म" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "ગુ" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "ಕ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "മ" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "ਪੰ" },
  { code: "ur", name: "Urdu", nativeName: "اُردُو", flag: "اُ" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "ଓ" },
];

export function getLanguageName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name ?? "English";
}
export function getLanguageNativeName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.nativeName ?? "English";
}

// Shape of every language's translations
export interface Translation {
  // App / common
  appName: string;
  tagline: string;
  back: string;
  continue: string;
  newPatient: string;
  skip: string;
  required: string;
  optional: string;
  startOver: string;
  save: string;

  // Workflow steps (short labels for footer pills)
  stepIdentify: string;
  stepConsent: string;
  stepHistory: string;
  stepDocuments: string;
  stepSummary: string;
  stepAbdm: string;
  stepComplete: string;
  stepOf: string; // "Step X of Y"

  // Preface (DKMS-style tab)
  prefaceWelcome: string;
  prefaceSubtitle: string;
  prefaceTabNew: string;
  prefaceTabNewDesc: string;
  prefaceTabReturning: string;
  prefaceTabReturningDesc: string;
  prefaceLanguagePrompt: string;
  prefaceLanguageChanged: string;
  prefaceFeature1Title: string;
  prefaceFeature1Desc: string;
  prefaceFeature2Title: string;
  prefaceFeature2Desc: string;
  prefaceFeature3Title: string;
  prefaceFeature3Desc: string;
  prefaceFeature4Title: string;
  prefaceFeature4Desc: string;
  prefaceWorkflowLabel: string;

  // Returning patient login
  loginTitle: string;
  loginSubtitle: string;
  loginFieldPhone: string;
  loginFieldPhonePlaceholder: string;
  loginFieldAbha: string;
  loginFieldAbhaPlaceholder: string;
  loginOr: string;
  loginButton: string;
  loginSearching: string;
  loginNotFound: string;
  loginFound: string; // "Welcome back, {name}"
  loginError: string;
  loginStartNew: string;
  loginNoRecordKept: string;

  // Identify step
  identifyBadge: string;
  identifyTitle: string;
  identifySubtitle: string;
  identifyCardTitle: string;
  identifyCardDesc: string;
  identifyName: string;
  identifyNamePlaceholder: string;
  identifyAge: string;
  identifyAgePlaceholder: string;
  identifyGender: string;
  identifyGenderMale: string;
  identifyGenderFemale: string;
  identifyGenderOther: string;
  identifyGenderPreferNot: string;
  identifyGenderPlaceholder: string;
  identifyPhone: string;
  identifyPhonePlaceholder: string;
  identifyBloodGroup: string;
  identifyBloodGroupPlaceholder: string;
  identifyLanguage: string;
  identifyAbha: string;
  identifyAbhaPlaceholder: string;
  identifyAbhaHint: string;
  identifyAyush: string;
  identifyAyushDesc: string;
  identifyPrivacyNote: string;
  identifyContinue: string;
  identifySaving: string;
  identifySaved: string;

  // Consent step
  consentBadge: string;
  consentTitle: string;
  consentSubtitle: string;
  consentPrivacyTitle: string;
  consentPrivacyDesc: string;
  consentGranularNote: string;
  consentItemDemographicsTitle: string;
  consentItemDemographicsDesc: string;
  consentItemHistoryTitle: string;
  consentItemHistoryDesc: string;
  consentItemDocumentsTitle: string;
  consentItemDocumentsDesc: string;
  consentItemSummaryTitle: string;
  consentItemSummaryDesc: string;
  consentItemAbdmTitle: string;
  consentItemAbdmDesc: string;
  consentRetentionTitle: string;
  consentRetentionDesc: string;
  consentRetain7: string;
  consentRetain30: string;
  consentRetain90: string;
  consentRetain365: string;
  consentRetainForever: string;
  consentGrantAll: string;
  consentDenyAll: string;
  consentContinue: string;
  consentNeedRequired: string;
  consentGranted: string;

  // History step
  historyBadge: string;
  historyTitle: string;
  historySubtitle: string; // "MediKiosk speaks {lang}. Speak or type…"
  historyCurrentSection: string;
  historyVoiceLabel: string;
  historyVoiceOn: string;
  historyVoiceOff: string;
  historyMicStart: string;
  historyMicStop: string;
  historyTranscribing: string;
  historyInputPlaceholder: string;
  historyInputPlaceholderRecording: string;
  historyInputPlaceholderTranscribing: string;
  historySend: string;
  historyAiSpeaking: string;
  historyAiSpeakingStop: string;
  historyThinking: string;
  historyStarting: string;
  historyDone: string;
  historyDoneDesc: string;
  historyRedFlagTitle: string;
  historyRedFlagEmpty: string;
  historyTipsTitle: string;
  historyTips1: string;
  historyTips2: string;
  historyTips3: string;
  historyTips4: string;
  historyTips5: string;
  historyDisclaimer: string;

  // Documents step
  documentsBadge: string;
  documentsTitle: string;
  documentsSubtitle: string;
  documentsTypeLabel: string;
  documentsTypePrescription: string;
  documentsTypeLab: string;
  documentsTypeDischarge: string;
  documentsTypeOther: string;
  documentsUploadButton: string;
  documentsUploadUploading: string;
  documentsDropzone: string;
  documentsDropzoneHint: string;
  documentsAbnormal: string; // "{n} abnormal value(s)"
  documentsTimeline: string; // "Medical record timeline ({n} document(s))"
  documentsEmpty: string;
  documentsSkip: string;
  documentsContinue: string;
  documentsExtractedDiagnoses: string;
  documentsExtractedMedicines: string;
  documentsExtractedTests: string;
  documentsExtractedProcedures: string;
  documentsExtractedVitals: string;
  documentsExtractedRaw: string;
  documentsExtractedRawShow: string;
  documentsExtractedRawHide: string;
  documentsAbnormalBadge: string;
  documentsStatusAnalyzing: string;
  documentsStatusCompleted: string;
  documentsStatusFailed: string;
  documentsFailedNote: string;
  documentsDigitised: string;

  // Summary step
  summaryBadge: string;
  summaryTitle: string;
  summarySubtitle: string;
  summaryGenerating: string;
  summaryGeneratingDesc: string;
  summaryNoHistory: string;
  summaryTryAnyway: string;
  summaryRedFlagTitle: string;
  summaryStatusDraft: string;
  summaryStatusEdited: string;
  summaryStatusConfirmed: string;
  summaryStatusRejected: string;
  summaryStatusDraftDesc: string;
  summaryStatusEditedDesc: string;
  summaryStatusConfirmedDesc: string;
  summaryStatusRejectedDesc: string;
  summaryRegenerate: string;
  summaryEdit: string;
  summarySaveEdits: string;
  summaryReject: string;
  summaryConfirm: string;
  summaryConfirmed: string;
  summaryViewStructured: string;
  summaryViewMarkdown: string;
  summarySectionHpi: string;
  summarySectionPastHistory: string;
  summarySectionMedications: string;
  summarySectionAllergies: string;
  summarySectionFamily: string;
  summarySectionRos: string;
  summarySectionSocial: string;
  summarySectionAyurvedic: string;
  summarySectionDocuments: string;
  summarySectionAssessment: string;
  summaryNotesTitle: string;
  summaryNotesDesc: string;
  summaryNotesPlaceholder: string;
  summaryDisclaimerTitle: string;
  summaryDisclaimerBody: string;
  summaryConfirmToast: string;
  summaryRejectToast: string;
  summaryEditSavedToast: string;
  summaryContinue: string;
  summaryNeedConfirm: string;

  // ABDM step
  abdmBadge: string;
  abdmTitle: string;
  abdmSubtitle: string;
  abdmStatusAbha: string;
  abdmStatusSummary: string;
  abdmStatusActions: string;
  abdmAbhaLinked: string;
  abdmAbhaNotLinked: string;
  abdmSummaryConfirmed: string;
  abdmSummaryDraft: string;
  abdmSuccessful: string;
  abdmActionLinkAbhaTitle: string;
  abdmActionLinkAbhaDesc: string;
  abdmActionFetchRecordsTitle: string;
  abdmActionFetchRecordsDesc: string;
  abdmActionShareToHisTitle: string;
  abdmActionShareToHisDesc: string;
  abdmActionPushToEmrTitle: string;
  abdmActionPushToEmrDesc: string;
  abdmActionRun: string;
  abdmActionRunning: string;
  abdmActionRerun: string;
  abdmNeedConfirmSummary: string;
  abdmActivityTitle: string;
  abdmActivityDesc: string;
  abdmActivityEmpty: string;
  abdmPrivacyTitle: string;
  abdmPrivacyBody: string;
  abdmFinish: string;

  // Complete step
  completeTitle: string;
  completeSubtitle: string; // "{name}, your history is ready…"
  completeRecapPatient: string;
  completeRecapHistory: string;
  completeRecapDocuments: string;
  completeRecapSummary: string;
  completeRecapAbdm: string;
  completeRecapRedFlags: string;
  completeRecapRedFlagsAllClear: string;
  completeRecapRedFlagsAcknowledged: string;
  completeNextTitle: string;
  completeNext1: string;
  completeNext2: string;
  completeNext3: string;
  completeImpactTitle: string;
  completeImpactBody: string;
  completeViewSummary: string;
  completeNewPatient: string;
  completePrivacyTitle: string;
  completePrivacyBody: string; // "For privacy, this kiosk will reset in {n} seconds…"
  completePrivacyResetNow: string;

  // Red-flag toast
  redFlagAlertTitle: string;
  redFlagAlertTriage: string;
  redFlagDismiss: string;

  // ABDM action messages
  abdmMsgLinked: string; // "Linked ABHA: {id}"
  abdmMsgAlreadyLinked: string;
  abdmMsgFetched: string;
  abdmMsgSharedToHis: string;
  abdmMsgPushedToEmr: string;
  abdmMsgUnknown: string;
  abdmMsgPatientNotFound: string;
}

// Helper: build a translation object with English fallbacks for missing keys
function withFallbacks(t: Partial<Translation>, fallback: Translation): Translation {
  return { ...fallback, ...t } as Translation;
}

const en: Translation = {
  appName: "MediKiosk",
  tagline: "AI-powered clinical intake",
  back: "Back",
  continue: "Continue",
  newPatient: "New patient",
  skip: "Skip",
  required: "Required",
  optional: "Optional",
  startOver: "Start over",
  save: "Save",

  stepIdentify: "Identify",
  stepConsent: "Consent",
  stepHistory: "AI History",
  stepDocuments: "Scan Docs",
  stepSummary: "AI Summary",
  stepAbdm: "HIS / ABHA",
  stepComplete: "Consultation",
  stepOf: "Step {x} of {y}",

  prefaceWelcome: "Welcome to MediKiosk",
  prefaceSubtitle: "Before you meet the doctor, MediKiosk collects your health history, organises your old medical papers and prepares a summary — so the doctor can spend more time examining you.",
  prefaceTabNew: "I am a new patient",
  prefaceTabNewDesc: "First visit. Start a fresh intake — about 5 minutes.",
  prefaceTabReturning: "I am returning for a follow-up",
  prefaceTabReturningDesc: "Login with your phone or ABHA for your next appointment.",
  prefaceLanguagePrompt: "Choose your language / अपनी भाषा चुनें",
  prefaceLanguageChanged: "Language changed",
  prefaceFeature1Title: "AI history taking",
  prefaceFeature1Desc: "Speak in your own language. The AI asks the right questions.",
  prefaceFeature2Title: "Scan old papers",
  prefaceFeature2Desc: "Prescriptions, lab reports — digitised automatically.",
  prefaceFeature3Title: "Doctor-ready summary",
  prefaceFeature3Desc: "The doctor reviews a clean history before you walk in.",
  prefaceFeature4Title: "ABHA & hospital link",
  prefaceFeature4Desc: "Your records follow you, with your consent.",
  prefaceWorkflowLabel: "Your visit",

  loginTitle: "Welcome back",
  loginSubtitle: "Enter the phone number or ABHA you used last time. We'll fetch your details so you don't have to re-enter them.",
  loginFieldPhone: "Phone number",
  loginFieldPhonePlaceholder: "e.g. 98xxxxxxxx",
  loginFieldAbha: "ABHA ID",
  loginFieldAbhaPlaceholder: "e.g. 12-3456-7890-1234",
  loginOr: "OR",
  loginButton: "Find my record",
  loginSearching: "Searching…",
  loginNotFound: "No record found with those details. Please check and try again, or start as a new patient.",
  loginFound: "Welcome back, {name}",
  loginError: "Could not search records. Please try again.",
  loginStartNew: "Start as new patient instead",
  loginNoRecordKept: "Your previous visit's history is NOT loaded — only your basic details are reused. A fresh intake starts for this appointment.",

  identifyBadge: "Step 1 · Identify",
  identifyTitle: "Who is the patient today?",
  identifySubtitle: "Capture basic details and your preferred language. This stays on the kiosk until your consultation ends.",
  identifyCardTitle: "Patient identification",
  identifyCardDesc: "Fields marked with * are required.",
  identifyName: "Full name",
  identifyNamePlaceholder: "e.g. Aarav Sharma",
  identifyAge: "Age (years)",
  identifyAgePlaceholder: "e.g. 45",
  identifyGender: "Gender",
  identifyGenderMale: "Male",
  identifyGenderFemale: "Female",
  identifyGenderOther: "Other",
  identifyGenderPreferNot: "Prefer not to say",
  identifyGenderPlaceholder: "Select",
  identifyPhone: "Phone (optional)",
  identifyPhonePlaceholder: "e.g. 98xxxxxxxx",
  identifyBloodGroup: "Blood group",
  identifyBloodGroupPlaceholder: "Select",
  identifyLanguage: "Preferred language",
  identifyAbha: "ABHA ID (optional)",
  identifyAbhaPlaceholder: "e.g. 12-3456-7890-1234",
  identifyAbhaHint: "If you already have an ABHA, enter it here. Otherwise MediKiosk can generate one later.",
  identifyAyush: "Enable AYUSH / Ayurvedic history mode",
  identifyAyushDesc: "Adds Ayurvedic questions — Prakriti, Vikriti, Ahara, Vihara, Agni and prior AYUSH treatments.",
  identifyPrivacyNote: "Data privacy: All information stays on this kiosk and is shared with the doctor only after you give consent. MediKiosk uses consent-based ABDM-aligned data flows.",
  identifyContinue: "Continue to consent",
  identifySaving: "Saving…",
  identifySaved: "Patient identified",

  consentBadge: "Step 2 · Consent",
  consentTitle: "What may MediKiosk store and share?",
  consentSubtitle: "You decide what MediKiosk can collect and who it can be shared with. You can change your mind at any time. The first three are required to proceed.",
  consentPrivacyTitle: "Privacy & security controls",
  consentPrivacyDesc: "All data is stored locally on this kiosk for this visit and shared only with the treating physician. ABDM sharing follows the National Health Authority's consent artefact standards.",
  consentGranularNote: "Tick what you are comfortable with. Untick anything you do not want stored or shared.",
  consentItemDemographicsTitle: "Store my basic details",
  consentItemDemographicsDesc: "Name, age, gender, blood group, language and ABHA — so the kiosk recognises you on your next visit.",
  consentItemHistoryTitle: "Record my AI history conversation",
  consentItemHistoryDesc: "The answers you give to MediKiosk's AI assistant about your symptoms and history.",
  consentItemDocumentsTitle: "Digitise my medical documents",
  consentItemDocumentsDesc: "Old prescriptions, lab reports and discharge summaries — read by AI to extract diagnoses, medicines and test results.",
  consentItemSummaryTitle: "Generate an AI clinical summary",
  consentItemSummaryDesc: "Combines your answers and records into a structured summary the doctor can review, edit, confirm or reject. The AI does not diagnose you.",
  consentItemAbdmTitle: "Share with ABHA / hospital HIS via ABDM",
  consentItemAbdmDesc: "Link your ABHA, fetch prior records through ABDM, and share the summary with the hospital's EMR using FHIR standards.",
  consentRetentionTitle: "How long may we keep this data?",
  consentRetentionDesc: "Choose how long MediKiosk may retain this visit's data. After this period it is automatically deleted.",
  consentRetain7: "7 days",
  consentRetain30: "30 days",
  consentRetain90: "90 days",
  consentRetain365: "1 year",
  consentRetainForever: "Until I withdraw consent",
  consentGrantAll: "Allow all",
  consentDenyAll: "Deny all optional",
  consentContinue: "Continue to history",
  consentNeedRequired: "Please allow the three required permissions to continue",
  consentGranted: "Consent saved",

  historyBadge: "Step 3 · AI History",
  historyTitle: "Let's talk about your health",
  historySubtitle: "MediKiosk speaks {lang}. Speak or type — the AI asks short follow-up questions to build your history for the doctor.",
  historyCurrentSection: "Current section",
  historyVoiceLabel: "AI voice",
  historyVoiceOn: "AI voice on",
  historyVoiceOff: "AI voice off",
  historyMicStart: "Start voice input",
  historyMicStop: "Stop recording",
  historyTranscribing: "Transcribing your speech…",
  historyInputPlaceholder: "Type your answer, or tap the mic to speak",
  historyInputPlaceholderRecording: "Listening… tap the mic to stop",
  historyInputPlaceholderTranscribing: "Transcribing your speech…",
  historySend: "Send",
  historyAiSpeaking: "AI is speaking…",
  historyAiSpeakingStop: "Stop",
  historyThinking: "Thinking",
  historyStarting: "Starting conversation…",
  historyDone: "History complete",
  historyDoneDesc: "You can keep talking, or continue to scan your old documents.",
  historyRedFlagTitle: "Red-flag alerts",
  historyRedFlagEmpty: "No red flags detected yet.",
  historyDisclaimer: "MediKiosk never diagnoses. The AI only collects history for the doctor to review.",
  historyTipsTitle: "How to use this step",
  historyTips1: "Tap the mic to speak your answer — it is transcribed automatically.",
  historyTips2: "Or type your answer and press Enter to send.",
  historyTips3: "The AI asks one short question at a time across your symptoms, past history, medicines, allergies, family history and lifestyle.",
  historyTips4: "Toggle the speaker to hear the AI read its questions aloud.",
  historyTips5: "You can move to the next step at any time — history-taking can continue if you return.",

  documentsBadge: "Step 4 · Scan Documents",
  documentsTitle: "Scan your old medical papers",
  documentsSubtitle: "Upload photos of old prescriptions, lab reports and discharge summaries. MediKiosk reads them in any Indian language, extracts the key details, and arranges them in date order — highlighting any abnormal test results for the doctor.",
  documentsTypeLabel: "Document type",
  documentsTypePrescription: "Prescription",
  documentsTypeLab: "Lab report",
  documentsTypeDischarge: "Discharge summary",
  documentsTypeOther: "Other",
  documentsUploadButton: "Upload photo(s)",
  documentsUploadUploading: "Uploading…",
  documentsDropzone: "Tap to upload, or drag & drop photos here",
  documentsDropzoneHint: "JPG, PNG, WebP · multiple files allowed",
  documentsAbnormal: "{n} abnormal test value(s) detected — highlighted in the timeline below.",
  documentsTimeline: "Record timeline ({n} document(s))",
  documentsEmpty: "No documents uploaded yet. Upload a photo to digitise, or skip to continue.",
  documentsSkip: "Skip to summary",
  documentsContinue: "Generate AI summary",
  documentsExtractedDiagnoses: "Diagnoses",
  documentsExtractedMedicines: "Medicines ({n})",
  documentsExtractedTests: "Investigations ({n})",
  documentsExtractedProcedures: "Procedures",
  documentsExtractedVitals: "Vital signs",
  documentsExtractedRaw: "Raw OCR text",
  documentsExtractedRawShow: "Show raw OCR text",
  documentsExtractedRawHide: "Hide raw OCR text",
  documentsAbnormalBadge: "Abnormal",
  documentsStatusAnalyzing: "Analyzing",
  documentsStatusCompleted: "Digitised",
  documentsStatusFailed: "Failed",
  documentsFailedNote: "AI could not extract structured data from this image. The doctor can still review the original during consultation.",
  documentsDigitised: "digitised",

  summaryBadge: "Step 5 · AI Summary",
  summaryTitle: "Doctor-ready clinical history",
  summarySubtitle: "MediKiosk has combined your answers and digitised records into the structured summary below. The doctor can review, edit, confirm or reject this summary. The AI does not independently diagnose you.",
  summaryGenerating: "Generating AI clinical summary…",
  summaryGeneratingDesc: "Combining your conversation and documents into a structured, physician-readable history.",
  summaryNoHistory: "No history collected yet. Go back and complete the AI history step first.",
  summaryTryAnyway: "Try generating anyway",
  summaryRedFlagTitle: "Red-flag symptoms flagged for triage",
  summaryStatusDraft: "Draft",
  summaryStatusEdited: "Edited",
  summaryStatusConfirmed: "Confirmed",
  summaryStatusRejected: "Rejected",
  summaryStatusDraftDesc: "Awaiting physician review",
  summaryStatusEditedDesc: "Edited by physician",
  summaryStatusConfirmedDesc: "Confirmed — ready for HIS integration",
  summaryStatusRejectedDesc: "Rejected — needs re-generation",
  summaryRegenerate: "Regenerate",
  summaryEdit: "Edit",
  summarySaveEdits: "Save edits",
  summaryReject: "Reject",
  summaryConfirm: "Confirm",
  summaryConfirmed: "Confirmed",
  summaryViewStructured: "Structured sections",
  summaryViewMarkdown: "Raw markdown",
  summarySectionHpi: "History of Present Illness",
  summarySectionPastHistory: "Past Medical History",
  summarySectionMedications: "Current Medications",
  summarySectionAllergies: "Allergies",
  summarySectionFamily: "Family History",
  summarySectionRos: "Review of Systems",
  summarySectionSocial: "Social History",
  summarySectionAyurvedic: "Ayurvedic / AYUSH History",
  summarySectionDocuments: "Significant Findings from Records",
  summarySectionAssessment: "Pending physician review.",
  summaryNotesTitle: "Physician notes (optional)",
  summaryNotesDesc: "Private notes for the doctor — not shared with the patient.",
  summaryNotesPlaceholder: "e.g. Patient anxious about ECG result. Reassure and explain plan during consult.",
  summaryDisclaimerTitle: "MediKiosk does not independently diagnose the patient.",
  summaryDisclaimerBody: "This summary is an AI-organised draft of your history and prior records. The treating physician remains responsible for clinical reasoning, diagnosis and treatment. Confirm to push to the HIS, or reject to regenerate.",
  summaryConfirmToast: "Summary confirmed — ready for HIS / ABHA integration",
  summaryRejectToast: "Summary rejected — please regenerate or edit",
  summaryEditSavedToast: "Edits saved",
  summaryContinue: "Continue to HIS / ABHA integration",
  summaryNeedConfirm: "Please confirm the summary first",

  abdmBadge: "Step 6 · ABDM & Hospital",
  abdmTitle: "Connect to ABHA, ABDM and the hospital",
  abdmSubtitle: "With your consent, MediKiosk links your ABHA, fetches prior records from ABDM as FHIR bundles, and pushes the confirmed summary to the hospital HIS / EMR so the doctor sees it during consultation.",
  abdmStatusAbha: "ABHA status",
  abdmStatusSummary: "Summary status",
  abdmStatusActions: "Integration actions",
  abdmAbhaLinked: "Linked",
  abdmAbhaNotLinked: "Not linked",
  abdmSummaryConfirmed: "Confirmed & ready",
  abdmSummaryDraft: "Draft",
  abdmSuccessful: "successful",
  abdmActionLinkAbhaTitle: "Link ABHA",
  abdmActionLinkAbhaDesc: "Link or generate your Ayushman Bharat Health Account ID via the ABDM gateway.",
  abdmActionFetchRecordsTitle: "Fetch prior records",
  abdmActionFetchRecordsDesc: "With your consent, fetch your prior health records from ABDM as FHIR bundles.",
  abdmActionShareToHisTitle: "Share summary to HIS",
  abdmActionShareToHisDesc: "Push the confirmed AI summary to the hospital's HIS / EMR via interoperable FHIR.",
  abdmActionPushToEmrTitle: "Push to physician EMR",
  abdmActionPushToEmrDesc: "Place the summary on the doctor's consultation screen so it appears when they open your record.",
  abdmActionRun: "Run",
  abdmActionRunning: "Running…",
  abdmActionRerun: "Re-run",
  abdmNeedConfirmSummary: "Confirm summary first",
  abdmActivityTitle: "Integration activity log",
  abdmActivityDesc: "FHIR exchange & ABDM consent artefact history for this visit.",
  abdmActivityEmpty: "No integration actions yet. Run one of the actions above to begin.",
  abdmPrivacyTitle: "Consent-based data sharing with privacy & security controls",
  abdmPrivacyBody: "All ABDM exchanges use the National Health Authority's consent artefact flow. You can revoke consent at any time. FHIR R4 is used for interoperability with hospital HIS / EMR systems.",
  abdmFinish: "Finish intake",

  completeTitle: "Patient intake complete",
  completeSubtitle: "{name}, your structured clinical history is now on the doctor's consultation screen. Please wait in the queue — the doctor will call you shortly.",
  completeRecapPatient: "Patient identified",
  completeRecapHistory: "History collected",
  completeRecapDocuments: "Documents digitised",
  completeRecapSummary: "Clinical summary",
  completeRecapAbdm: "HIS / ABDM actions",
  completeRecapRedFlags: "Red-flag alerts",
  completeRecapRedFlagsAllClear: "All clear",
  completeRecapRedFlagsAcknowledged: "{n} acknowledged by triage",
  completeNextTitle: "What happens next",
  completeNext1: "The doctor reviews your AI-generated clinical history on the consultation screen.",
  completeNext2: "The doctor spends the consultation time on examination, clinical reasoning and counselling.",
  completeNext3: "Any new prescriptions or lab orders are added to your ABHA-linked longitudinal health record.",
  completeImpactTitle: "More consultation time for what matters",
  completeImpactBody: "By shifting history-taking and document organisation to before the consultation, MediKiosk frees up doctor time — for examination, clinical reasoning, diagnosis, counselling and treatment.",
  completeViewSummary: "View summary",
  completeNewPatient: "Start new patient intake",
  completePrivacyTitle: "Privacy auto-reset",
  completePrivacyBody: "For your privacy, this kiosk will wipe this session and return to the welcome screen in {n} seconds. Tap to reset now.",
  completePrivacyResetNow: "Reset now",

  redFlagAlertTitle: "Red-flag symptom detected",
  redFlagAlertTriage: "Alert triage",
  redFlagDismiss: "Dismiss",

  abdmMsgLinked: "Linked ABHA: {id}",
  abdmMsgAlreadyLinked: "ABHA already linked: {id}",
  abdmMsgFetched: "Fetched 3 prior records from ABDM (consent-based).",
  abdmMsgSharedToHis: "Clinical summary shared to hospital HIS via FHIR endpoint.",
  abdmMsgPushedToEmr: "Summary pushed to physician's EMR queue. The doctor will review on the consultation screen.",
  abdmMsgUnknown: "Unknown action: {action}",
  abdmMsgPatientNotFound: "Patient not found",
};

// Hindi
const hi: Partial<Translation> = {
  tagline: "एआई-संचालित चिकित्सा इतिहास संग्रह",
  back: "वापस",
  continue: "आगे बढ़ें",
  newPatient: "नया मरीज",
  skip: "छोड़ें",
  required: "आवश्यक",
  optional: "वैकल्पिक",
  startOver: "फिर से शुरू करें",
  save: "सहेजें",
  stepIdentify: "पहचान",
  stepConsent: "सहमति",
  stepHistory: "एआई इतिहास",
  stepDocuments: "दस्तावेज़",
  stepSummary: "एआई सारांश",
  stepAbdm: "एचआईएस / एबीडीएम",
  stepComplete: "परामर्श",
  stepOf: "चरण {x} / {y}",
  prefaceWelcome: "मेडिकियोस्क में आपका स्वागत है",
  prefaceSubtitle: "डॉक्टर से मिलने से पहले, मेडिकियोस्क आपका स्वास्थ्य इतिहास लेता है, आपके पुराने दस्तावेज़ व्यवस्थित करता है और एक सारांश तैयार करता है — ताकि डॉक्टर आपकी जाँच में अधिक समय दे सके।",
  prefaceTabNew: "मैं नया मरीज हूँ",
  prefaceTabNewDesc: "पहली बार। नया इतिहास शुरू करें — लगभग 5 मिनट।",
  prefaceTabReturning: "मैं फॉलो-अप के लिए लौटा/लौटी हूँ",
  prefaceTabReturningDesc: "अपने अगले अपॉइंटमेंट के लिए फ़ोन या एबीएचए से लॉगिन करें।",
  prefaceLanguagePrompt: "अपनी भाषा चुनें / Choose your language",
  prefaceLanguageChanged: "भाषा बदल गई",
  prefaceFeature1Title: "एआई इतिहास लेना",
  prefaceFeature1Desc: "अपनी भाषा में बोलें। एआई सही सवाल पूछता है।",
  prefaceFeature2Title: "पुराने कागज़ स्कैन करें",
  prefaceFeature2Desc: "पर्चे, लैब रिपोर्ट — स्वचालित रूप से डिजिटल।",
  prefaceFeature3Title: "डॉक्टर-तैयार सारांश",
  prefaceFeature3Desc: "डॉक्टर आपके आने से पहले स्वच्छ इतिहास देखता है।",
  prefaceFeature4Title: "एबीएचए और अस्पताल लिंक",
  prefaceFeature4Desc: "आपकी सहमति से आपके रिकॉर्ड आपके साथ।",
  prefaceWorkflowLabel: "आपका दौरा",
  loginTitle: "वापसी पर स्वागत है",
  loginSubtitle: "पिछली बार जो फ़ोन नंबर या एबीएचए इस्तेमाल किया था वह दर्ज करें। हम आपकी जानकारी ला देंगे ताकि आपको फिर से भरनी न पड़े।",
  loginFieldPhone: "फ़ोन नंबर",
  loginFieldPhonePlaceholder: "जैसे 98xxxxxxxx",
  loginFieldAbha: "एबीएचए आईडी",
  loginFieldAbhaPlaceholder: "जैसे 12-3456-7890-1234",
  loginOr: "या",
  loginButton: "मेरा रिकॉर्ड खोजें",
  loginSearching: "खोज जारी…",
  loginNotFound: "इन विवरणों के साथ कोई रिकॉर्ड नहीं मिला। जाँच कर पुनः प्रयास करें, या नए मरीज के रूप में शुरू करें।",
  loginFound: "वापसी पर स्वागत है, {name}",
  loginError: "रिकॉर्ड खोज नहीं सके। पुनः प्रयास करें।",
  loginStartNew: "इसके बजाय नए मरीज के रूप में शुरू करें",
  loginNoRecordKept: "आपके पिछले दौरे का इतिहास लोड नहीं किया जाता — केवल आपके मूल विवरण पुनः उपयोग होते हैं। इस अपॉइंटमेंट के लिए नया इतिहास शुरू होता है।",
  identifyBadge: "चरण 1 · पहचान",
  identifyTitle: "आज मरीज कौन है?",
  identifySubtitle: "मूल जानकारी और अपनी पसंद की भाषा दर्ज करें। यह परामर्श समाप्त होने तक कियोस्क पर रहती है।",
  identifyCardTitle: "मरीज पहचान",
  identifyCardDesc: "* चिह्नित फ़ील्ड आवश्यक हैं।",
  identifyName: "पूरा नाम",
  identifyNamePlaceholder: "जैसे आरव शर्मा",
  identifyAge: "आयु (वर्ष)",
  identifyAgePlaceholder: "जैसे 45",
  identifyGender: "लिंग",
  identifyGenderMale: "पुरुष",
  identifyGenderFemale: "महिला",
  identifyGenderOther: "अन्य",
  identifyGenderPreferNot: "नहीं बताना चाहूँ",
  identifyGenderPlaceholder: "चुनें",
  identifyPhone: "फ़ोन (वैकल्पिक)",
  identifyPhonePlaceholder: "जैसे 98xxxxxxxx",
  identifyBloodGroup: "ब्लड ग्रुप",
  identifyBloodGroupPlaceholder: "चुनें",
  identifyLanguage: "पसंद की भाषा",
  identifyAbha: "एबीएचए आईडी (वैकल्पिक)",
  identifyAbhaPlaceholder: "जैसे 12-3456-7890-1234",
  identifyAbhaHint: "यदि आपके पास एबीएचए है, तो यहाँ दर्ज करें। अन्यथा मेडिकियोस्क बाद में एक जनरेट कर सकता है।",
  identifyAyush: "आयुष / आयुर्वेदिक इतिहास मोड सक्षम करें",
  identifyAyushDesc: "आयुर्वेदिक प्रश्न जोड़ता है — प्रकृति, विकृति, आहार, विहार, अग्नि और पूर्व आयुष उपचार।",
  identifyPrivacyNote: "डेटा गोपनीयता: सभी जानकारी इस कियोस्क पर रहती है और केवल आपकी सहमति के बाद डॉक्टर के साथ साझा की जाती है।",
  identifyContinue: "सहमति पर जारी रखें",
  identifySaving: "सहेज रहे हैं…",
  identifySaved: "मरीज पहचाना गया",
  consentBadge: "चरण 2 · सहमति",
  consentTitle: "मेडिकियोस्क क्या संग्रहीत और साझा कर सकता है?",
  consentSubtitle: "आप तय करते हैं कि मेडिकियोस्क क्या संग्रह कर सकता है और किसके साथ साझा कर सकता है। आप कभी भी अपना निर्णय बदल सकते हैं। आगे बढ़ने के लिए पहले तीन आवश्यक हैं।",
  consentPrivacyTitle: "गोपनीयता और सुरक्षा नियंत्रण",
  consentPrivacyDesc: "इस दौरे का सभी डेटा इस कियोस्क पर स्थानीय रूप से संग्रहीत है और केवल इलाज करने वाले डॉक्टर के साथ साझा किया जाता है। एबीडीएम साझाकरण राष्ट्रीय स्वास्थ्य प्राधिकरण के सहमति मानकों का पालन करता है।",
  consentGranularNote: "जो सहमत हैं वह टिक करें। जो संग्रहीत या साझा नहीं करना चाहते उसका टिक हटाएँ।",
  consentItemDemographicsTitle: "मेरे मूल विवरण संग्रहीत करें",
  consentItemDemographicsDesc: "नाम, आयु, लिंग, ब्लड ग्रुप, भाषा और एबीएचए — ताकि अगली बार कियोस्क आपको पहचाने।",
  consentItemHistoryTitle: "मेरी एआई इतिहास बातचीत दर्ज करें",
  consentItemHistoryDesc: "एआई सहायक को आपके लक्षणों और इतिहास के बारे में दिए गए उत्तर।",
  consentItemDocumentsTitle: "मेरे चिकित्सा दस्तावेज़ डिजिटल करें",
  consentItemDocumentsDesc: "पुराने पर्चे, लैब रिपोर्ट, डिस्चार्ज सारांश — एआई द्वारा निदान, दवाएँ और परीक्षण परिणाम निकाले जाते हैं।",
  consentItemSummaryTitle: "एआई नैदानिक सारांश बनाएँ",
  consentItemSummaryDesc: "आपके उत्तरों और रिकॉर्ड्स को संरचित सारांश में जोड़ता है जिसे डॉक्टर समीक्षा/संपादित/पुष्टि कर सकता है। एआई निदान नहीं करता।",
  consentItemAbdmTitle: "एबीएचए / अस्पताल एचआईएस के साथ एबीडीएम साझाकरण",
  consentItemAbdmDesc: "अपना एबीएचए लिंक करें, एबीडीएम से पूर्व रिकॉर्ड लाएँ, और सारांश को अस्पताल ईएमआर में साझा करें।",
  consentRetentionTitle: "यह डेटा कब तक रख सकते हैं?",
  consentRetentionDesc: "चुनें कि मेडिकियोस्क इस दौरे का डेटा कितने समय तक रख सकता है। इस अवधि के बाद यह स्वचालित रूप से हट जाता है।",
  consentRetain7: "7 दिन",
  consentRetain30: "30 दिन",
  consentRetain90: "90 दिन",
  consentRetain365: "1 वर्ष",
  consentRetainForever: "जब तक मैं सहमति वापस न लूँ",
  consentGrantAll: "सभी अनुमति दें",
  consentDenyAll: "सभी वैकल्पिक अस्वीकारें",
  consentContinue: "इतिहास पर जारी रखें",
  consentNeedRequired: "जारी रखने के लिए तीन आवश्यक अनुमतियाँ दें",
  consentGranted: "सहमति सहेजी गई",
  historyBadge: "चरण 3 · एआई इतिहास",
  historyTitle: "आइए आपके स्वास्थ्य के बारे में बात करें",
  historySubtitle: "मेडिकियोस्क {lang} में बोलता है। बोलें या टाइप करें — एआई डॉक्टर के लिए छोटे फॉलो-अप प्रश्न पूछता है।",
  historyCurrentSection: "वर्तमान अनुभाग",
  historyVoiceLabel: "एआई आवाज़",
  historyVoiceOn: "एआई आवाज़ चालू",
  historyVoiceOff: "एआई आवाज़ बंद",
  historyMicStart: "आवाज़ इनपुट शुरू करें",
  historyMicStop: "रिकॉर्डिंग रोकें",
  historyTranscribing: "आपकी आवाज़ लिखी जा रही है…",
  historyInputPlaceholder: "अपना उत्तर टाइप करें, या बोलने के लिए माइक टैप करें",
  historyInputPlaceholderRecording: "सुन रहा हूँ… रोकने के लिए माइक टैप करें",
  historyInputPlaceholderTranscribing: "आपकी आवाज़ लिखी जा रही है…",
  historySend: "भेजें",
  historyAiSpeaking: "एआई बोल रहा है…",
  historyAiSpeakingStop: "रोकें",
  historyThinking: "सोच रहा है",
  historyStarting: "बातचीत शुरू हो रही है…",
  historyDone: "इतिहास पूर्ण",
  historyDoneDesc: "आप बात करते रह सकते हैं, या दस्तावेज़ स्कैन पर जा सकते हैं।",
  historyRedFlagTitle: "खतरे के लक्षण अलर्ट",
  historyRedFlagEmpty: "अभी कोई खतरे का संकेत नहीं।",
  historyDisclaimer: "मेडिकियोस्क कभी निदान नहीं करता। एआई केवल डॉक्टर की समीक्षा के लिए इतिहास जमा करता है।",
  historyTipsTitle: "इस चरण का उपयोग कैसे करें",
  historyTips1: "अपना उत्तर बोलने के लिए माइक टैप करें — यह स्वचालित लिखा जाता है।",
  historyTips2: "या अपना उत्तर टाइप करें और भेजने के लिए Enter दबाएँ।",
  historyTips3: "एआई लक्षण, पूर्व इतिहास, दवाएँ, एलर्जी, पारिवारिक इतिहास और जीवनशैली में एक समय पर एक सवाल पूछता है।",
  historyTips4: "एआई के प्रश्न सुनने के लिए स्पीकर टॉगल करें।",
  historyTips5: "आप किसी भी समय अगले चरण पर जा सकते हैं — इतिहास लेना आपके लौटने पर जारी रह सकता है।",
  documentsBadge: "चरण 4 · दस्तावेज़ स्कैन",
  documentsTitle: "अपने पुराने चिकित्सा कागज़ स्कैन करें",
  documentsSubtitle: "पुराने पर्चे, लैब रिपोर्ट और डिस्चार्ज सारांश की फ़ोटो अपलोड करें। मेडिकियोस्क किसी भी भारतीय भाषा में उन्हें पढ़ता है, मुख्य जानकारी निकालता है, और तारीख़ क्रम में व्यवस्थित करता है — किसी भी असामान्य परीक्षण परिणाम को डॉक्टर के लिए चिह्नित करता है।",
  documentsTypeLabel: "दस्तावेज़ प्रकार",
  documentsTypePrescription: "पर्चा",
  documentsTypeLab: "लैब रिपोर्ट",
  documentsTypeDischarge: "डिस्चार्ज सारांश",
  documentsTypeOther: "अन्य",
  documentsUploadButton: "फ़ोटो अपलोड करें",
  documentsUploadUploading: "अपलोड हो रहा है…",
  documentsDropzone: "अपलोड करने के लिए टैप करें, या फ़ोटो यहाँ खींचें",
  documentsDropzoneHint: "JPG, PNG, WebP · कई फ़ाइलें अनुमत",
  documentsAbnormal: "{n} असामान्य परीक्षण मान मिले — नीचे टाइमलाइन में चिह्नित।",
  documentsTimeline: "रिकॉर्ड टाइमलाइन ({n} दस्तावेज़)",
  documentsEmpty: "अभी कोई दस्तावेज़ अपलोड नहीं। डिजिटल करने के लिए फ़ोटो अपलोड करें, या जारी रखने के लिए छोड़ें।",
  documentsSkip: "सारांश पर जाएँ",
  documentsContinue: "एआई सारांश बनाएँ",
  documentsExtractedDiagnoses: "निदान",
  documentsExtractedMedicines: "दवाएँ ({n})",
  documentsExtractedTests: "जाँच ({n})",
  documentsExtractedProcedures: "प्रक्रियाएँ",
  documentsExtractedVitals: "महत्वपूर्ण संकेत",
  documentsExtractedRaw: "मूल OCR टेक्स्ट",
  documentsExtractedRawShow: "मूल OCR टेक्स्ट दिखाएँ",
  documentsExtractedRawHide: "मूल OCR टेक्स्ट छिपाएँ",
  documentsAbnormalBadge: "असामान्य",
  documentsStatusAnalyzing: "विश्लेषण",
  documentsStatusCompleted: "डिजिटल",
  documentsStatusFailed: "असफल",
  documentsFailedNote: "एआई इस छवि से संरचित डेटा नहीं निकाल सका। डॉक्टर परामर्श में मूल की समीक्षा कर सकता है।",
  documentsDigitised: "डिजिटल",
  summaryBadge: "चरण 5 · एआई सारांश",
  summaryTitle: "डॉक्टर-तैयार नैदानिक इतिहास",
  summarySubtitle: "मेडिकियोस्क ने आपके उत्तर और डिजिटल रिकॉर्ड्स को नीचे संरचित सारांश में जोड़ा है। डॉक्टर इस सारांश की समीक्षा/संपादन/पुष्टि/अस्वीकृति कर सकता है। एआई स्वतंत्र रूप से निदान नहीं करता।",
  summaryGenerating: "एआई नैदानिक सारांश बन रहा है…",
  summaryGeneratingDesc: "आपकी बातचीत और दस्तावेज़ों को संरचित, डॉक्टर-पठनीय इतिहास में जोड़ रहे हैं।",
  summaryNoHistory: "अभी कोई इतिहास संग्रह नहीं। पहले एआई इतिहास चरण पूरा करें।",
  summaryTryAnyway: "फिर भी बनाने का प्रयास करें",
  summaryRedFlagTitle: "ट्रायेज के लिए चिह्नित खतरे के लक्षण",
  summaryStatusDraft: "प्रारूप",
  summaryStatusEdited: "संपादित",
  summaryStatusConfirmed: "पुष्ट",
  summaryStatusRejected: "अस्वीकृत",
  summaryStatusDraftDesc: "डॉक्टर की समीक्षा की प्रतीक्षा",
  summaryStatusEditedDesc: "डॉक्टर द्वारा संपादित",
  summaryStatusConfirmedDesc: "पुष्ट — एचआईएस एकीकरण के लिए तैयार",
  summaryStatusRejectedDesc: "अस्वीकृत — पुनः बनाना होगा",
  summaryRegenerate: "पुनः बनाएँ",
  summaryEdit: "संपादित करें",
  summarySaveEdits: "संपादन सहेजें",
  summaryReject: "अस्वीकारें",
  summaryConfirm: "पुष्टि करें",
  summaryConfirmed: "पुष्ट",
  summaryViewStructured: "संरचित अनुभाग",
  summaryViewMarkdown: "मूल मार्कडाउन",
  summarySectionHpi: "वर्तमान बीमारी का इतिहास",
  summarySectionPastHistory: "पूर्व चिकित्सा इतिहास",
  summarySectionMedications: "वर्तमान दवाएँ",
  summarySectionAllergies: "एलर्जी",
  summarySectionFamily: "पारिवारिक इतिहास",
  summarySectionRos: "तंत्र समीक्षा",
  summarySectionSocial: "सामाजिक इतिहास",
  summarySectionAyurvedic: "आयुर्वेदिक / आयुष इतिहास",
  summarySectionDocuments: "रिकॉर्ड्स से महत्वपूर्ण निष्कर्ष",
  summarySectionAssessment: "डॉक्टर की समीक्षा की प्रतीक्षा।",
  summaryNotesTitle: "डॉक्टर नोट्स (वैकल्पिक)",
  summaryNotesDesc: "डॉक्टर के लिए निजी नोट्स — मरीज के साथ साझा नहीं।",
  summaryNotesPlaceholder: "जैसे मरीज ईसीजी परिणाम से चिंतित। परामर्श में आश्वस्त करें।",
  summaryDisclaimerTitle: "मेडिकियोस्क स्वतंत्र रूप से निदान नहीं करता।",
  summaryDisclaimerBody: "यह सारांश आपके इतिहास और पूर्व रिकॉर्ड्स का एआई-व्यवस्थित प्रारूप है। इलाज करने वाला डॉक्टर नैदानिक निर्णय, निदान और उपचार के लिए ज़िम्मेदार रहता है।",
  summaryConfirmToast: "सारांश पुष्ट — एचआईएस / एबीडीएम एकीकरण के लिए तैयार",
  summaryRejectToast: "सारांश अस्वीकृत — कृपया पुनः बनाएँ या संपादित करें",
  summaryEditSavedToast: "संपादन सहेजे गए",
  summaryContinue: "एचआईएस / एबीडीएम एकीकरण पर जाएँ",
  summaryNeedConfirm: "कृपया पहले सारांश पुष्ट करें",
  abdmBadge: "चरण 6 · एबीडीएम और अस्पताल",
  abdmTitle: "एबीएचए, एबीडीएम और अस्पताल से जुड़ें",
  abdmSubtitle: "आपकी सहमति से, मेडिकियोस्क आपका एबीएचए लिंक करता है, एबीडीएम से पूर्व रिकॉर्ड लाता है, और पुष्ट सारांश अस्पताल एचआईएस / ईएमआर में भेजता है ताकि डॉक्टर परामर्श में देख सके।",
  abdmStatusAbha: "एबीएचए स्थिति",
  abdmStatusSummary: "सारांश स्थिति",
  abdmStatusActions: "एकीकरण क्रियाएँ",
  abdmAbhaLinked: "लिंक्ड",
  abdmAbhaNotLinked: "लिंक नहीं",
  abdmSummaryConfirmed: "पुष्ट और तैयार",
  abdmSummaryDraft: "प्रारूप",
  abdmSuccessful: "सफल",
  abdmActionLinkAbhaTitle: "एबीएचए लिंक करें",
  abdmActionLinkAbhaDesc: "एबीडीएम गेटवे से अपना आयुष्मान भारत हेल्थ अकाउंट आईडी लिंक या जनरेट करें।",
  abdmActionFetchRecordsTitle: "पूर्व रिकॉर्ड लाएँ",
  abdmActionFetchRecordsDesc: "आपकी सहमति से, एबीडीएम से आपके पूर्व स्वास्थ्य रिकॉर्ड एफएचआईआर बंडल के रूप में लाएँ।",
  abdmActionShareToHisTitle: "सारांश एचआईएस में साझा करें",
  abdmActionShareToHisDesc: "पुष्ट एआई सारांश अस्पताल के एचआईएस / ईएमआर में एफएचआईआर द्वारा भेजें।",
  abdmActionPushToEmrTitle: "डॉक्टर ईएमआर पर भेजें",
  abdmActionPushToEmrDesc: "सारांश डॉक्टर की परामर्श स्क्रीन पर रखें ताकि वे आपका रिकॉर्ड खोलें तो दिखे।",
  abdmActionRun: "चलाएँ",
  abdmActionRunning: "चल रहा है…",
  abdmActionRerun: "पुनः चलाएँ",
  abdmNeedConfirmSummary: "पहले सारांश पुष्ट करें",
  abdmActivityTitle: "एकीकरण गतिविधि लॉग",
  abdmActivityDesc: "इस दौरे के लिए एफएचआईआर विनिमय और एबीडीएम सहमति इतिहास।",
  abdmActivityEmpty: "अभी कोई एकीकरण क्रिया नहीं। शुरू करने के लिए ऊपर क्रियाएँ चलाएँ।",
  abdmPrivacyTitle: "गोपनीयता और सुरक्षा नियंत्रण के साथ सहमति-आधारित साझाकरण",
  abdmPrivacyBody: "सभी एबीडीएम विनिमय राष्ट्रीय स्वास्थ्य प्राधिकरण के सहमति प्रवाह का उपयोग करते हैं। आप कभी भी सहमति वापस ले सकते हैं।",
  abdmFinish: "इतिहास समाप्त करें",
  completeTitle: "मरीज इतिहास संग्रह पूर्ण",
  completeSubtitle: "{name}, आपका संरचित नैदानिक इतिहास अब डॉक्टर की परामर्श स्क्रीन पर है। कृपया कतार में प्रतीक्षा करें — डॉक्टर शीघ्र बुलाएँगे।",
  completeRecapPatient: "मरीज पहचाना",
  completeRecapHistory: "इतिहास संग्रह",
  completeRecapDocuments: "दस्तावेज़ डिजिटल",
  completeRecapSummary: "नैदानिक सारांश",
  completeRecapAbdm: "एचआईएस / एबीडीएम क्रियाएँ",
  completeRecapRedFlags: "खतरे के लक्षण",
  completeRecapRedFlagsAllClear: "सब ठीक",
  completeRecapRedFlagsAcknowledged: "{n} ट्रायेज द्वारा स्वीकृत",
  completeNextTitle: "आगे क्या होगा",
  completeNext1: "डॉक्टर परामर्श स्क्रीन पर आपका एआई-निर्मित इतिहास समीक्षा करता है।",
  completeNext2: "डॉक्टर परामर्श समय जाँच, नैदानिक तर्क और परामर्श में खर्च करता है।",
  completeNext3: "कोई नए पर्चे या लैब आदेश आपके एबीएचए-लिंक्ड स्वास्थ्य रिकॉर्ड में जोड़े जाते हैं।",
  completeImpactTitle: "महत्वपूर्ण कार्यों के लिए अधिक परामर्श समय",
  completeImpactBody: "इतिहास लेने और दस्तावेज़ व्यवस्था को परामर्श से पहले ले जाकर, मेडिकियोस्क डॉक्टर समय खाली करता है — जाँच, तर्क, निदान, परामर्श और उपचार के लिए।",
  completeViewSummary: "सारांश देखें",
  completeNewPatient: "नया मरीज इतिहास शुरू करें",
  completePrivacyTitle: "गोपनीयता स्वतः-रीसेट",
  completePrivacyBody: "आपकी गोपनीयता के लिए, यह कियोस्क इस सत्र को मिटाकर {n} सेकंड में वेलकम स्क्रीन पर लौटेगा। अभी रीसेट करने के लिए टैप करें।",
  completePrivacyResetNow: "अभी रीसेट",
  redFlagAlertTitle: "खतरे का लक्षण पाया",
  redFlagAlertTriage: "ट्रायेज सतर्क",
  redFlagDismiss: "खारिज",
  abdmMsgLinked: "एबीएचए लिंक्ड: {id}",
  abdmMsgAlreadyLinked: "एबीएचए पहले लिंक्ड: {id}",
  abdmMsgFetched: "एबीडीएम से 3 पूर्व रिकॉर्ड लाए (सहमति-आधारित)।",
  abdmMsgSharedToHis: "नैदानिक सारांश एफएचआईआर द्वारा अस्पताल एचआईएस में साझा।",
  abdmMsgPushedToEmr: "सारांश डॉक्टर के ईएमआर कतार में भेजा। डॉक्टर परामर्श स्क्रीन पर समीक्षा करेंगे।",
  abdmMsgUnknown: "अज्ञात क्रिया: {action}",
  abdmMsgPatientNotFound: "मरीज नहीं मिला",
};

// Build the full translation map for every language, using English as fallback
// for any string not translated. This guarantees the UI always shows something
// meaningful even if a translation key is missing for a language.
export const translations: Record<LangCode, Translation> = {
  en,
  hi: withFallbacks(hi, en),
  // For the other 11 languages, fall back to English on missing keys. The
  // patient's chat conversation is still conducted in their language by the
  // LLM/TTS/ASR pipeline regardless of UI translation coverage.
  bn: withFallbacks({
    tagline: "এআই-চালিত রোগী ইতিহাস সংগ্রহ",
    back: "পিছনে", continue: "এগিয়ে যান", newPatient: "নতুন রোগী", skip: "এড়িয়ে যান",
    required: "প্রয়োজন", optional: "ঐচ্ছিক", startOver: "আবার শুরু", save: "সংরক্ষণ",
    stepIdentify: "শনাক্ত", stepConsent: "সম্মতি", stepHistory: "এআই ইতিহাস",
    stepDocuments: "নথি", stepSummary: "এআই সারসংক্ষেপ", stepAbdm: "এইচআইএস / এবিডিএম",
    stepComplete: "পরামর্শ", stepOf: "ধাপ {x} / {y}",
    prefaceWelcome: "মেডিকিয়স্ক-এ স্বাগতম",
    prefaceTabNew: "আমি নতুন রোগী", prefaceTabNewDesc: "প্রথম ভিজিট। নতুন ইতিহাস শুরু — প্রায় ৫ মিনিট।",
    prefaceTabReturning: "আমি ফলো-আপে ফিরে এসেছি", prefaceTabReturningDesc: "পরবর্তী অ্যাপয়েন্টমেন্টের জন্য ফোন বা এবিএইচএ দিয়ে লগইন।",
    prefaceLanguagePrompt: "আপনার ভাষা নির্বাচন করুন",
    identifyTitle: "আজ রোগী কে?", identifySubtitle: "প্রাথমিক তথ্য এবং পছন্দের ভাষা লিখুন।",
    identifyName: "পুরো নাম", identifyAge: "বয়স", identifyGender: "লিঙ্গ",
    identifyGenderMale: "পুরুষ", identifyGenderFemale: "মহিলা", identifyGenderOther: "অন্য",
    identifyGenderPreferNot: "বলতে চাই না", identifyPhone: "ফোন", identifyBloodGroup: "রক্তের গ্রুপ",
    identifyLanguage: "পছন্দের ভাষা", identifyContinue: "সম্মতিতে এগিয়ে যান",
    consentTitle: "মেডিকিয়স্ক কী সংরক্ষণ ও শেয়ার করতে পারে?",
    historyTitle: "আসুন আপনার স্বাস্থ্য নিয়ে কথা বলি", historySend: "পাঠান",
    documentsTitle: "আপনার পুরোনো চিকিৎসা কাগজ স্ক্যান করুন", documentsUploadButton: "ছবি আপলোড",
    summaryTitle: "ডাক্তার-প্রস্তুত ক্লিনিকাল ইতিহাস", summaryConfirm: "নিশ্চিত করুন",
    abdmTitle: "এবিএইচএ, এবিডিএম এবং হাসপাতালের সাথে সংযুক্ত করুন",
    completeTitle: "রোগী ইতিহাস সংগ্রহ সম্পূর্ণ",
  }, en),
  ta: withFallbacks({
    tagline: "செயற்கை நுண்ணறிவு இயக்கப்பட்ட நோயாளி வரலாறு சேகரிப்பு",
    back: "பின்", continue: "தொடரவும்", newPatient: "புதிய நோயாளி", skip: "தவிர்",
    required: "தேவை", optional: "விருப்பத்தேர்வு", startOver: "மீண்டும் தொடங்கு", save: "சேமி",
    stepIdentify: "அடையாளம்", stepConsent: "ஒப்புதல்", stepHistory: "செயற்கை நுண்ணறிவு வரலாறு",
    stepDocuments: "ஆவணங்கள்", stepSummary: "செயற்கை நுண்ணறிவு சுருக்கம்", stepAbdm: "எச்ஐஎஸ் / ஏபிடிஎம்",
    stepComplete: "ஆலோசனை", stepOf: "படி {x} / {y}",
    prefaceWelcome: "மெடிகியோஸ்க்-கிற்கு வரவேற்கிறோம்",
    prefaceTabNew: "நான் புதிய நோயாளி", prefaceTabNewDesc: "முதல் வருகை. புதிய வரலாறு — சுமார் 5 நிமிடம்.",
    prefaceTabReturning: "நான் தொடர் பரிசோதனைக்கு திரும்புகிறேன்", prefaceTabReturningDesc: "அடுத்த சந்திப்புக்கு தொலைபேசி அல்லது ஏபிஎச்ஏ மூலம் உள்நுழையவும்.",
    prefaceLanguagePrompt: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    identifyTitle: "இன்று நோயாளி யார்?", identifySubtitle: "அடிப்படை விவரங்கள் மற்றும் விருப்பப்பட்ட மொழியை உள்ளிடவும்.",
    identifyName: "முழுப்பெயர்", identifyAge: "வயது", identifyGender: "பாலினம்",
    identifyGenderMale: "ஆண்", identifyGenderFemale: "பெண்", identifyGenderOther: "மற்றோர்",
    identifyGenderPreferNot: "கூற விரும்பவில்லை", identifyPhone: "தொலைபேசி", identifyBloodGroup: "இரத்த குழு",
    identifyLanguage: "விருப்பப்பட்ட மொழி", identifyContinue: "ஒப்புதலுக்குத் தொடரவும்",
    consentTitle: "மெடிகியோஸ்க் எதைச் சேமிக்கவும் பகிரவும் முடியும்?",
    historyTitle: "உங்கள் உடல்நலம் பற்றி பேசுவோம்", historySend: "அனுப்பு",
    documentsTitle: "உங்கள் பழைய மருத்துவ ஆவணங்களை ஸ்கேன் செய்யவும்", documentsUploadButton: "படங்களைப் பதிவேற்று",
    summaryTitle: "மருத்துவர்-தயார் க்ளினிக்கல் வரலாறு", summaryConfirm: "உறுதிப்படுத்து",
    abdmTitle: "ஏபிஎச்ஏ, ஏபிடிஎம் மற்றும் மருத்துவமனையுடன் இணைக்கவும்",
    completeTitle: "நோயாளி வரலாறு சேகரிப்பு முடிந்தது",
  }, en),
  te: withFallbacks({
    tagline: "ఏఐ-ఆధారిత రోగి చరిత్ర సేకరణ",
    back: "వెనుకకు", continue: "కొనసాగించు", newPatient: "కొత్త రోగి", skip: "దాటవేయి",
    required: "అవసరం", optional: "ఐచ్ఛిక", startOver: "మళ్లీ మొదలుపెట్టు", save: "సేవ్",
    stepIdentify: "గుర్తింపు", stepConsent: "సమ్మతి", stepHistory: "ఏఐ చరిత్ర",
    stepDocuments: "పత్రాలు", stepSummary: "ఏఐ సారాంశం", stepAbdm: "హెచ్‌ఐఎస్ / ఏబీడీఎం",
    stepComplete: "సంప్రదింపు", stepOf: "దశ {x} / {y}",
    prefaceWelcome: "మెడికియోస్క్‌కు స్వాగతం",
    prefaceTabNew: "నేను కొత్త రోగిని", prefaceTabNewDesc: "మొదటి సందర్శన. కొత్త చరిత్ర — సుమారు 5 నిమిషాలు.",
    prefaceTabReturning: "నేను ఫాలో-అప్‌కు తిరిగి వచ్చాను", prefaceTabReturningDesc: "తదుపరి అపాయింట్‌మెంట్ కోసం ఫోన్ లేదా ఏబీహెచ్‌ఏ ద్వారా లాగిన్.",
    prefaceLanguagePrompt: "మీ భాషను ఎంచుకోండి",
    identifyTitle: "ఈరోజు రోగి ఎవరు?", identifySubtitle: "ప్రాథమిక వివరాలు మరియు ప్రాధాన్య భాషను నమోదు చేయండి.",
    identifyName: "పూర్తి పేరు", identifyAge: "వయస్సు", identifyGender: "లింగం",
    identifyGenderMale: "పురుషుడు", identifyGenderFemale: "స్త్రీ", identifyGenderOther: "ఇతర",
    identifyGenderPreferNot: "చెప్పాలనుకోను", identifyPhone: "ఫోన్", identifyBloodGroup: "రక్త సమూహం",
    identifyLanguage: "ప్రాధాన్య భాష", identifyContinue: "సమ్మతికి కొనసాగించు",
    consentTitle: "మెడికియోస్క్ ఏమి నిల్వ మరియు పంచుకోగలదు?",
    historyTitle: "మన ఆరోగ్యం గురించి మాట్లాడదాం", historySend: "పంపు",
    documentsTitle: "మీ పాత వైద్య పత్రాలను స్కాన్ చేయండి", documentsUploadButton: "ఫోటోలను అప్‌లోడ్ చేయి",
    summaryTitle: "డాక్టర్-సిద్ధ క్లినికల్ చరిత్ర", summaryConfirm: "నిర్ధారించు",
    abdmTitle: "ఏబీహెచ్‌ఏ, ఏబీడీఎం మరియు ఆసుపత్రితో కనెక్ట్ చేయండి",
    completeTitle: "రోగి చరిత్ర సేకరణ పూర్తయింది",
  }, en),
  mr: withFallbacks({
    tagline: "एआय-सक्षम रुग्ण इतिहास संकलन",
    back: "मागे", continue: "पुढे", newPatient: "नवीन रुग्ण", skip: "वगळा",
    required: "आवश्यक", optional: "पर्यायी", startOver: "पुन्हा सुरुवात", save: "जतन करा",
    stepIdentify: "ओळख", stepConsent: "संमती", stepHistory: "एआय इतिहास",
    stepDocuments: "कागदपत्रे", stepSummary: "एआय सारांश", stepAbdm: "एचआयएस / एबीडीएम",
    stepComplete: "सल्लामसलत", stepOf: "पायरी {x} / {y}",
    prefaceWelcome: "मेडिकियोस्कमध्ये आपले स्वागत आहे",
    prefaceTabNew: "मी नवीन रुग्ण आहे", prefaceTabNewDesc: "पहिल्यांदा. नवीन इतिहास सुरू — साधारण ५ मिनिटे.",
    prefaceTabReturning: "मी फॉलो-अपसाठी परत आलो आहे", prefaceTabReturningDesc: "पुढील अपॉइंटमेंटसाठी फोन किंवा एबीएचएने लॉगिन.",
    prefaceLanguagePrompt: "तुमची भाषा निवडा",
    identifyTitle: "आज रुग्ण कोण आहे?", identifySubtitle: "मूलभूत माहिती आणि पसंतीची भाषा नोंदवा.",
    identifyName: "पूर्ण नाव", identifyAge: "वय", identifyGender: "लिंग",
    identifyGenderMale: "पुरुष", identifyGenderFemale: "स्त्री", identifyGenderOther: "इतर",
    identifyGenderPreferNot: "सांगायचे नाही", identifyPhone: "फोन", identifyBloodGroup: "रक्तगट",
    identifyLanguage: "पसंतीची भाषा", identifyContinue: "संमतीवर पुढे",
    consentTitle: "मेडिकियोस्क काय साठवू आणि शेअर करू शकते?",
    historyTitle: "चला तुमच्या आरोग्याबद्दल बोलूया", historySend: "पाठवा",
    documentsTitle: "तुमची जुनी वैद्यकीय कागदपत्रे स्कॅन करा", documentsUploadButton: "फोटो अपलोड",
    summaryTitle: "डॉक्टर-तयार क्लिनिकल इतिहास", summaryConfirm: "पुष्टी करा",
    abdmTitle: "एबीएचए, एबीडीएम आणि रुग्णालयाशी जोडा",
    completeTitle: "रुग्ण इतिहास संकलन पूर्ण",
  }, en),
  gu: withFallbacks({
    tagline: "એઆઈ-સંચાલિત દર્દી ઇતિહાસ સંગ્રહ",
    back: "પાછળ", continue: "ચાલુ રાખો", newPatient: "નવો દર્દી", skip: "છોડો",
    required: "જરૂરી", optional: "વૈકલ્પિક", startOver: "ફરી શરૂ", save: "સાચવો",
    stepIdentify: "ઓળખ", stepConsent: "સંમતિ", stepHistory: "એઆઈ ઇતિહાસ",
    stepDocuments: "દસ્તાવેજ", stepSummary: "એઆઈ સારાંશ", stepAbdm: "એચઆઇએસ / એબીડીએમ",
    stepComplete: "સલાહ", stepOf: "પગલું {x} / {y}",
    prefaceWelcome: "મેડિકિયોસ્કમાં આપનું સ્વાગત છે",
    prefaceTabNew: "હું નવો દર્દી છું", prefaceTabNewDesc: "પ્રથમ મુલાકાત. નવો ઇતિહાસ — લગભગ ૫ મિનિટ.",
    prefaceTabReturning: "હું ફોલો-અપ માટે પાછો આવ્યો", prefaceTabReturningDesc: "આગામી એપોઇન્ટમેન્ટ માટે ફોન અથવા એબીએચએ વડે લોગિન.",
    prefaceLanguagePrompt: "તમારી ભાષા પસંદ કરો",
    identifyTitle: "આજે દર્દી કોણ છે?", identifySubtitle: "મૂળભૂત માહિતી અને પસંદગીની ભાષા દાખલ કરો.",
    identifyName: "પૂરું નામ", identifyAge: "ઉંમર", identifyGender: "લિંગ",
    identifyGenderMale: "પુરુષ", identifyGenderFemale: "સ્ત્રી", identifyGenderOther: "અન્ય",
    identifyGenderPreferNot: "કહેવા નથી માંગતા", identifyPhone: "ફોન", identifyBloodGroup: "બ્લડ ગ્રુપ",
    identifyLanguage: "પસંદગીની ભાષા", identifyContinue: "સંમતિ પર ચાલુ",
    consentTitle: "મેડિકિયોસ્ક શું સાચવી અને શેર કરી શકે?",
    historyTitle: "ચાલો તમારા આરોગ્ય વિશે વાત કરીએ", historySend: "મોકલો",
    documentsTitle: "તમારા જૂના તબીબી કાગદાદો સ્કેન કરો", documentsUploadButton: "ફોટો અપલોડ",
    summaryTitle: "ડોક્ટર-તૈયાર ક્લિનિકલ ઇતિહાસ", summaryConfirm: "પુષ્ટિ કરો",
    abdmTitle: "એબીએચએ, એબીડીએમ અને હોસ્પિટલ સાથે જોડો",
    completeTitle: "દર્દી ઇતિહાસ સંગ્રહ પૂર્ણ",
  }, en),
  kn: withFallbacks({
    tagline: "ಎಐ-ಚಾಲಿತ ರೋಗಿ ಇತಿಹಾಸ ಸಂಗ್ರಹಣೆ",
    back: "ಹಿಂದೆ", continue: "ಮುಂದುವರಿಸಿ", newPatient: "ಹೊಸ ರೋಗಿ", skip: "ಬಿಟ್ಟುಬಿಡಿ",
    required: "ಅಗತ್ಯ", optional: "ಐಚ್ಛಿಕ", startOver: "ಮರುಆರಂಭಿಸಿ", save: "ಉಳಿಸಿ",
    stepIdentify: "ಗುರುತಿಸಿ", stepConsent: "ಒಪ್ಪಿಗೆ", stepHistory: "ಎಐ ಇತಿಹಾಸ",
    stepDocuments: "ದಾಖಲೆಗಳು", stepSummary: "ಎಐ ಸಾರಾಂಶ", stepAbdm: "ಎಚ್‌ಐಎಸ್ / ಎಬಿಡಿಎಂ",
    stepComplete: "ಸಮಾಲೋಚನೆ", stepOf: "ಹಂತ {x} / {y}",
    prefaceWelcome: "ಮೆಡಿಕಿಯೋಸ್ಕ್‌ಗೆ ಸ್ವಾಗತ",
    prefaceTabNew: "ನಾನು ಹೊಸ ರೋಗಿ", prefaceTabNewDesc: "ಮೊದಲ ಭೇಟಿ. ಹೊಸ ಇತಿಹಾಸ — ಸುಮಾರು ೫ ನಿಮಿಷ.",
    prefaceTabReturning: "ನಾನು ಅನುಸರಣೆಗಾಗಿ ಹಿಂದಿರುಗಿದ್ದೇನೆ", prefaceTabReturningDesc: "ಮುಂದಿನ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗೆ ಫೋನ್ ಅಥವಾ ಎಬಿಎಚ್‌ಎ ಲಾಗಿನ್.",
    prefaceLanguagePrompt: "ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
    identifyTitle: "ಇಂದು ರೋಗಿ ಯಾರು?", identifySubtitle: "ಮೂಲಭೂತ ವಿವರಗಳು ಮತ್ತು ಆದ್ಯತೆಯ ಭಾಷೆ ನಮೂದಿಸಿ.",
    identifyName: "ಪೂರ್ಣ ಹೆಸರು", identifyAge: "ವಯಸ್ಸು", identifyGender: "ಲಿಂಗ",
    identifyGenderMale: "ಪುರುಷ", identifyGenderFemale: "ಮಹಿಳೆ", identifyGenderOther: "ಇತರ",
    identifyGenderPreferNot: "ಹೇಳಲು ಇಷ್ಟವಿಲ್ಲ", identifyPhone: "ಫೋನ್", identifyBloodGroup: "ರಕ್ತ ಗುಂಪು",
    identifyLanguage: "ಆದ್ಯತೆಯ ಭಾಷೆ", identifyContinue: "ಒಪ್ಪಿಗೆಗೆ ಮುಂದುವರಿಸಿ",
    consentTitle: "ಮೆಡಿಕಿಯೋಸ್ಕ್ ಏನು ಸಂಗ್ರಹಿಸಿ ಹಂಚಿಕೊಳ್ಳಬಲ್ಲದು?",
    historyTitle: "ನಿಮ್ಮ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಮಾತನಾಡೋಣ", historySend: "ಕಳುಹಿಸಿ",
    documentsTitle: "ನಿಮ್ಮ ಹಳೆಯ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ", documentsUploadButton: "ಫೋಟೋ ಅಪ್‌ಲೋಡ್",
    summaryTitle: "ವೈದ್ಯ-ಸಿದ್ಧ ಕ್ಲಿನಿಕಲ್ ಇತಿಹಾಸ", summaryConfirm: "ದೃಢೀಕರಿಸಿ",
    abdmTitle: "ಎಬಿಎಚ್‌ಎ, ಎಬಿಡಿಎಂ ಮತ್ತು ಆಸ್ಪತ್ರೆಯೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ",
    completeTitle: "ರೋಗಿ ಇತಿಹಾಸ ಸಂಗ್ರಹಣೆ ಪೂರ್ಣ",
  }, en),
  ml: withFallbacks({
    tagline: "എഐ-പ്രവർത്തിത രോഗി ചരിത്ര ശേഖരണം",
    back: "തിരികെ", continue: "തുടരുക", newPatient: "പുതിയ രോഗി", skip: "ഒഴിവാക്കുക",
    required: "ആവശ്യം", optional: "ഓപ്ഷണൽ", startOver: "വീണ്ടും ആരംഭിക്കുക", save: "സംരക്ഷിക്കുക",
    stepIdentify: "തിരിച്ചറിയൽ", stepConsent: "സമ്മതം", stepHistory: "എഐ ചരിത്രം",
    stepDocuments: "രേഖകൾ", stepSummary: "എഐ സംഗ്രഹം", stepAbdm: "എച്ച്ഐഎസ് / എബിഡിഎം",
    stepComplete: "കൂടിയാലോചന", stepOf: "ഘട്ടം {x} / {y}",
    prefaceWelcome: "മെഡികിയോസ്കിലേക്ക് സ്വാഗതം",
    prefaceTabNew: "ഞാൻ പുതിയ രോഗിയാണ്", prefaceTabNewDesc: "ആദ്യ സന്ദർശനം. പുതിയ ചരിത്രം — ഏകദേശം 5 മിനിറ്റ്.",
    prefaceTabReturning: "ഞാൻ ഫോളോ-അപ്പിനായി തിരികെ വന്നു", prefaceTabReturningDesc: "അടുത്ത അപ്പോയിന്റ്മെന്റിനായി ഫോൺ അല്ലെങ്കിൽ എബിഎച്ച്എ വഴി ലോഗിൻ.",
    prefaceLanguagePrompt: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
    identifyTitle: "ഇന്ന് രോഗി ആരാണ്?", identifySubtitle: "അടിസ്ഥാന വിവരങ്ങളും മുൻഗണന ഭാഷയും രേഖപ്പെടുത്തുക.",
    identifyName: "പൂർണ്ണ പേര്", identifyAge: "പ്രായം", identifyGender: "ലിംഗം",
    identifyGenderMale: "പുരുഷൻ", identifyGenderFemale: "സ്ത്രീ", identifyGenderOther: "മറ്റുള്ളവർ",
    identifyGenderPreferNot: "പറയാൻ താത്പര്യമില്ല", identifyPhone: "ഫോൺ", identifyBloodGroup: "രക്തഗ്രൂപ്പ്",
    identifyLanguage: "മുൻഗണന ഭാഷ", identifyContinue: "സമ്മതത്തിലേക്ക് തുടരുക",
    consentTitle: "മെഡികിയോസ്ക് എന്ത് സംരക്ഷിക്കാനും പങ്കിടാനും കഴിയും?",
    historyTitle: "നിങ്ങളുടെ ആരോഗ്യത്തെക്കുറിച്ച് സംസാരിക്കാം", historySend: "അയയ്ക്കുക",
    documentsTitle: "നിങ്ങളുടെ പഴയ മെഡിക്കൽ രേഖകൾ സ്കാൻ ചെയ്യുക", documentsUploadButton: "ഫോട്ടോ അപ്ലോഡ്",
    summaryTitle: "ഡോക്ടർ-തയ്യാർ ക്ലിനിക്കൽ ചരിത്രം", summaryConfirm: "സ്ഥിരീകരിക്കുക",
    abdmTitle: "എബിഎച്ച്എ, എബിഡിഎം, ആശുപത്രിയുമായി ബന്ധിപ്പിക്കുക",
    completeTitle: "രോഗി ചരിത്ര ശേഖരണം പൂർത്തിയായി",
  }, en),
  pa: withFallbacks({
    tagline: "ਏਆਈ-ਚਾਲਿਤ ਮਰੀਜ਼ ਇਤਿਹਾਸ ਇਕੱਠਾ ਕਰਨਾ",
    back: "ਪਿੱਛੇ", continue: "ਜਾਰੀ ਰੱਖੋ", newPatient: "ਨਵਾਂ ਮਰੀਜ਼", skip: "ਛੱਡੋ",
    required: "ਲੋੜੀਂਦਾ", optional: "ਚੋਣਵਾਂ", startOver: "ਮੁੜ ਸ਼ੁਰੂ", save: "ਸੰਭਾਲੋ",
    stepIdentify: "ਪਛਾਣ", stepConsent: "ਸਹਿਮਤੀ", stepHistory: "ਏਆਈ ਇਤਿਹਾਸ",
    stepDocuments: "ਦਸਤਾਵੇਜ਼", stepSummary: "ਏਆਈ ਸੰਖੇਪ", stepAbdm: "ਐਚਆਈਐਸ / ਏਬੀਡੀਐਮ",
    stepComplete: "ਸਲਾਹ", stepOf: "ਕਦਮ {x} / {y}",
    prefaceWelcome: "ਮੇਡੀਕਿਓਸਕ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ",
    prefaceTabNew: "ਮੈਂ ਨਵਾਂ ਮਰੀਜ਼ ਹਾਂ", prefaceTabNewDesc: "ਪਹਿਲੀ ਮੁਲਾਕਾਤ. ਨਵਾਂ ਇਤਿਹਾਸ — ਲਗਭਗ ੫ ਮਿੰਟ.",
    prefaceTabReturning: "ਮੈਂ ਫਾਲੋ-ਅਪ ਲਈ ਵਾਪਸ ਆਇਆ ਹਾਂ", prefaceTabReturningDesc: "ਅਗਲੀ ਅਪੁਆਇੰਟਮੈਂਟ ਲਈ ਫੋਨ ਜਾਂ ਏਬੀਐਚਏ ਨਾਲ ਲੌਗਇਨ.",
    prefaceLanguagePrompt: "ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ",
    identifyTitle: "ਅੱਜ ਮਰੀਜ਼ ਕੌਣ ਹੈ?", identifySubtitle: "ਮੁੱਢਲੀ ਜਾਣਕਾਰੀ ਅਤੇ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਦਰਜ ਕਰੋ.",
    identifyName: "ਪੂਰਾ ਨਾਮ", identifyAge: "ਉਮਰ", identifyGender: "ਲਿੰਗ",
    identifyGenderMale: "ਮਰਦ", identifyGenderFemale: "ਔਰਤ", identifyGenderOther: "ਹੋਰ",
    identifyGenderPreferNot: "ਦੱਸਣਾ ਨਹੀਂ ਚਾਹੁੰਦਾ", identifyPhone: "ਫੋਨ", identifyBloodGroup: "ਖੂਨ ਦੀ ਗਰੁੱਪ",
    identifyLanguage: "ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ", identifyContinue: "ਸਹਿਮਤੀ ਲਈ ਜਾਰੀ",
    consentTitle: "ਮੇਡੀਕਿਓਸਕ ਕੀ ਸੰਭਾਲ ਅਤੇ ਸਾਂਝਾ ਕਰ ਸਕਦਾ ਹੈ?",
    historyTitle: "ਆਓ ਤੁਹਾਡੀ ਸਿਹਤ ਬਾਰੇ ਗੱਲ ਕਰੀਏ", historySend: "ਭੇਜੋ",
    documentsTitle: "ਆਪਣੇ ਪੁਰਾਣੇ ਮੈਡੀਕਲ ਕਾਗਜ਼ ਸਕੈਨ ਕਰੋ", documentsUploadButton: "ਫੋਟੋ ਅੱਪਲੋਡ",
    summaryTitle: "ਡਾਕਟਰ-ਤਿਆਰ ਕਲੀਨਿਕਲ ਇਤਿਹਾਸ", summaryConfirm: "ਪੁਸ਼ਟੀ ਕਰੋ",
    abdmTitle: "ਏਬੀਐਚਏ, ਏਬੀਡੀਐਮ ਅਤੇ ਹਸਪਤਾਲ ਨਾਲ ਜੋੜੋ",
    completeTitle: "ਮਰੀਜ਼ ਇਤਿਹਾਸ ਇਕੱਠਾ ਕਰਨਾ ਮੁਕੰਮਲ",
  }, en),
  ur: withFallbacks({
    tagline: "اے آئی پر چلنے والا مریض کی تاریخ کا جمع",
    back: "پیچھے", continue: "جاری رکھیں", newPatient: "نیا مریض", skip: "چھوڑیں",
    required: "ضروری", optional: "اختیاری", startOver: "دوبارہ شروع", save: "محفوظ کریں",
    stepIdentify: "شناخت", stepConsent: "رضامندی", stepHistory: "اے آئی تاریخ",
    stepDocuments: "دستاویزات", stepSummary: "اے آئی خلاصہ", stepAbdm: "ایچ آئی ایس / اے بی ڈی ایم",
    stepComplete: "مشورہ", stepOf: "مرحلہ {x} / {y}",
    prefaceWelcome: "میڈی کیوسک میں خوش آمدید",
    prefaceTabNew: "میں نیا مریض ہوں", prefaceTabNewDesc: "پہلی بار۔ نیا تاریخ — تقریباً ۵ منٹ.",
    prefaceTabReturning: "میں فالو اپ کے لیے واپس آیا ہوں", prefaceTabReturningDesc: "اگلی اپوائنٹمنٹ کے لیے فون یا اے بی ایچ اے سے لاگ ان.",
    prefaceLanguagePrompt: "اپنی زبان منتخب کریں",
    identifyTitle: "آج مریض کون ہے؟", identifySubtitle: "بنیادی تفصیلات اور پسندیدہ زبان درج کریں.",
    identifyName: "پورا نام", identifyAge: "عمر", identifyGender: "جنس",
    identifyGenderMale: "مرد", identifyGenderFemale: "عورت", identifyGenderOther: "دیگر",
    identifyGenderPreferNot: "بتانا نہیں چاہتا", identifyPhone: "فون", identifyBloodGroup: "خون کا گروپ",
    identifyLanguage: "پسندیدہ زبان", identifyContinue: "رضامندی پر جاری",
    consentTitle: "میڈی کیوسک کیا محفوظ اور شیئر کر سکتا ہے؟",
    historyTitle: "آئیے آپ کی صحت کے بارے میں بات کریں", historySend: "بھیجیں",
    documentsTitle: "اپنے پرانے طبی کاغذات اسکین کریں", documentsUploadButton: "تصاویر اپ لوڈ",
    summaryTitle: "ڈاکٹر کے لیے تیار کلینیکل تاریخ", summaryConfirm: "تصدیق کریں",
    abdmTitle: "اے بی ایچ اے، اے بی ڈی ایم اور ہسپتال سے جوڑیں",
    completeTitle: "مریض کی تاریخ جمع مکمل",
  }, en),
  or: withFallbacks({
    tagline: "ଏଆଇ-ଚାଳିତ ରୋଗୀ ଇତିହାସ ସଂଗ୍ରହ",
    back: "ପଛକୁ", continue: "ଜାରି ରଖନ୍ତୁ", newPatient: "ନୂଆ ରୋଗୀ", skip: "ଏଡ଼ାଇଦିଅନ୍ତୁ",
    required: "ଆବଶ୍ୟକ", optional: "ଐଚ୍ଛିକ", startOver: "ପୁଣି ଆରମ୍ଭ", save: "ସାଇତନ୍ତୁ",
    stepIdentify: "ଚିହ୍ନ", stepConsent: "ସମ୍ମତି", stepHistory: "ଏଆଇ ଇତିହାସ",
    stepDocuments: "ଦଲିଲ", stepSummary: "ଏଆଇ ସାରାଂଶ", stepAbdm: "ଏଚଆଇଏସ୍ / ଏବିଡିଏମ୍",
    stepComplete: "ପରାମର୍ଶ", stepOf: "ଧାପ {x} / {y}",
    prefaceWelcome: "ମେଡିକିଓସ୍କକୁ ସ୍ୱାଗତ",
    prefaceTabNew: "ମୁଁ ନୂଆ ରୋଗୀ", prefaceTabNewDesc: "ପ୍ରଥମ ଭ୍ରମଣ. ନୂଆ ଇତିହାସ — ପ୍ରାୟ ୫ ମିନିଟ୍.",
    prefaceTabReturning: "ମୁଁ ଫଲୋ-ଅପ୍ ପାଇଁ ଫେରିଛି", prefaceTabReturningDesc: "ପରବର୍ତ୍ତୀ ଆପଣ୍ଟମେଣ୍ଟ ପାଇଁ ଫୋନ୍ ବା ଏବିଏଚଏ ଲଗଇନ୍.",
    prefaceLanguagePrompt: "ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ",
    identifyTitle: "ଆଜି ରୋଗୀ କିଏ?", identifySubtitle: "ମୌଳିକ ସୂଚନା ଓ ପସନ୍ଦିତ ଭାଷା ଲେଖନ୍ତୁ.",
    identifyName: "ପୂର୍ଣ୍ଣ ନାମ", identifyAge: "ବୟସ", identifyGender: "ଲିଙ୍ଗ",
    identifyGenderMale: "ପୁରୁଷ", identifyGenderFemale: "ମହିଳା", identifyGenderOther: "ଅନ୍ୟ",
    identifyGenderPreferNot: "କହିବାକୁ ଚାହୁଁନାହିଁ", identifyPhone: "ଫୋନ୍", identifyBloodGroup: "ରକ୍ତ ଗ୍ରୁପ୍",
    identifyLanguage: "ପସନ୍ଦିତ ଭାଷା", identifyContinue: "ସମ୍ମତିକୁ ଜାରି",
    consentTitle: "ମେଡିକିଓସ୍କ କଣ ସାଇତି ଓ ସାଝା କରିପାରେ?",
    historyTitle: "ଆସନ୍ତୁ ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ବିଷୟରେ କଥା ହେବା", historySend: "ପଠାନ୍ତୁ",
    documentsTitle: "ଆପଣଙ୍କ ପୁରୁଣା ଡାକ୍ତରୀ କାଗଜ ସ୍କାନ୍ କରନ୍ତୁ", documentsUploadButton: "ଫଟୋ ଅପଲୋଡ୍",
    summaryTitle: "ଡାକ୍ତର-ପ୍ରସ୍ତୁତ କ୍ଲିନିକାଲ୍ ଇତିହାସ", summaryConfirm: "ନିଶ୍ଚିତ କରନ୍ତୁ",
    abdmTitle: "ଏବିଏଚଏ, ଏବିଡିଏମ୍ ଓ ଡାକ୍ତରଖାନା ସହିତ ସଂଯୋଗ କରନ୍ତୁ",
    completeTitle: "ରୋଗୀ ଇତିହାସ ସଂଗ୍ରହ ସମ୍ପୂର୍ଣ୍ଣ",
  }, en),
};
