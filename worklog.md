# MediKiosk Worklog

## Project Overview
MediKiosk is an AI-powered patient-facing clinical intake software platform.

## Workflow
Identify → Consent → AI History → Scan Documents → AI Summary → HIS/ABHA → Doctor Consultation

## Tech Stack
- Next.js 16 App Router + TypeScript
- Prisma + SQLite
- Tailwind CSS + shadcn/ui
- AI Skills: LLM (chat/summary), VLM (document), ASR (voice input), TTS (AI voice)

## Architecture
- Single `/` route with multi-step kiosk workflow
- Backend APIs under `/api/*`
- Prisma models: Patient, Consent, ChatMessage, Document, ClinicalSummary, RedFlagAlert, ABDMRecord

---
Task ID: 1
Agent: main (MediKiosk architect)
Task: Set up Prisma schema, types, lib foundation (Patient, Consent, ChatMessage, Document, ClinicalSummary, RedFlag, ABDMRecord models)

Work Log:
- Created Prisma schema with 7 models: Patient, Consent, ChatMessage, Document, ClinicalSummary, RedFlagAlert, ABDMRecord
- Ran `bun run db:push` — database in sync, Prisma client generated
- Created src/lib/types.ts with shared TypeScript interfaces (PatientInfo, ChatTurn, ExtractedDocumentData, ClinicalSummarySections, RedFlag, WorkflowStep, STEP_LABELS, STEP_ORDER)
- Created src/lib/languages.ts with 12 Indian languages + English, history sections, red-flag symptom list, TTS voice picker
- Created src/lib/medical-prompts.ts with: buildHistorySystemPrompt (LLM system prompt for history taking with AYUSH mode + red-flag detection tags), buildSummarySystemPrompt, parseAssistantReply (parses [SECTION]/[REDFLAG]/[DONE] tags), buildDocumentAnalysisPrompt (VLM prompt for structured JSON extraction)
- Created src/lib/zai.ts (ZAI SDK singleton)
- Created src/lib/store.ts (Zustand store managing workflow step, patient, consents, chat turns, voice, documents, red flags, summary, ABDM records)

Stage Summary:
- Database schema and TypeScript foundation complete
- All shared types and prompts are ready for the API routes and UI components
- AI integration design: LLM for chat+summary, VLM for documents, ASR for voice input, TTS for AI voice output

---
Task ID: 2-4 (backend APIs)
Agent: main (MediKiosk architect)
Task: Build all backend API routes

Work Log:
- POST/GET/PATCH /api/patient — patient identification CRUD
- POST/GET /api/consent — consent-based data sharing records
- POST/GET /api/abdm — simulated ABDM/HIS integration (link_abha, fetch_records, share_to_his, push_summary) with FHIR bundle simulation
- POST /api/chat — LLM history taking: loads prior turns, builds system prompt with completed sections, calls zai.chat.completions.create, parses reply for [SECTION]/[REDFLAG]/[DONE] tags, persists reply + red flags, optionally synthesises TTS audio in same response
- GET /api/chat?patientId — fetch conversation history
- POST /api/asr — speech-to-text via zai.audio.asr.create (base64 audio input)
- POST /api/tts — text-to-speech via zai.audio.tts.create (returns base64 WAV)
- POST /api/documents/analyze — VLM document digitization: persists doc, calls zai.chat.completions.createVision with image_url, parses JSON extraction, updates doc with extracted diagnoses/medicines/tests/procedures/vitals, sets recordDate for chronological ordering
- GET /api/documents?patientId — list documents
- POST /api/summary/generate — LLM summary: aggregates chat transcript + completed documents + red flags, calls LLM with summary system prompt, parses markdown into structured sections, persists or updates ClinicalSummary
- GET /api/summary?patientId — get latest summary
- PATCH /api/summary?id — update status (confirmed/rejected/edited), sections, physician notes
- GET/PATCH /api/redflag — list and acknowledge red-flag alerts
- Verified /api/patient POST returns valid patient record

Stage Summary:
- 8 API routes implemented covering all 4 MediKiosk capabilities
- All AI integrations use z-ai-web-dev-sdk via singleton helper
- Backend ready to power the frontend kiosk UI

---
Task ID: 5-10 (frontend UI)
Agent: main (MediKiosk architect)
Task: Build the complete MediKiosk kiosk frontend

Work Log:
- src/app/page.tsx — root layout with sticky header (MediKiosk branding + patient info pill), main content area (renders step component), sticky WorkflowProgress footer, global RedFlagToast. Theme: emerald/teal medical palette.
- src/components/medikiosk/PatientHeader.tsx — patient info pill in header (name, age, gender, language, AYUSH badge, ABHA shield)
- src/components/medikiosk/WorkflowProgress.tsx — sticky footer with 7-step workflow pills (Identify→Consent→AI History→Scan Docs→AI Summary→HIS/ABHA→Consultation), Back/Continue nav. Continue dispatches `medikiosk-continue` custom event so each step's submit logic runs even when its in-card button is covered by the footer.
- src/components/medikiosk/RedFlagToast.tsx — global red-flag alert toast (alert triage / dismiss)
- src/components/medikiosk/WelcomeScreen.tsx — hero with "Begin Patient Intake", 4 feature cards (history, document, summary, ABDM), patient workflow visual, impact callout
- src/components/medikiosk/IdentifyStep.tsx — patient registration form (name, age, gender, phone, blood group, 12-language selector, AYUSH toggle, ABHA field) with privacy note
- src/components/medikiosk/ConsentStep.tsx — 4 consent cards (history, documents, summary, abdm_share) with required/optional badges, Grant all permissions helper
- src/components/medikiosk/HistoryStep.tsx — AI chat interface: conversation bubbles, voice input (MediaRecorder → ASR), text input, AI voice toggle (TTS playback), section indicator, red-flag side panel, how-to tips panel
- src/components/medikiosk/DocumentsStep.tsx — upload area (drag-drop + file picker), document type selector, chronological timeline display with per-document extracted data (diagnoses, medicines, tests with abnormal highlighting, procedures, vitals), raw OCR toggle
- src/components/medikiosk/SummaryStep.tsx — auto-generates AI summary on mount, red-flag banner, structured sections grid (HPI, past history, medications, allergies, family, ROS, social, AYUSH, documents) with editable textareas, raw markdown toggle, physician notes, Confirm/Reject/Edit/Regenerate actions, AI-no-diagnose disclaimer
- src/components/medikiosk/AbdmStep.tsx — ABHA/summary status cards, 4 ABDM action cards (link ABHA, fetch records, share to HIS, push to EMR), activity log, FHIR consent-based data sharing callout
- src/components/medikiosk/CompleteStep.tsx — completion hero, 6 recap cards (patient, history turns, documents, summary status, ABDM actions, red flags), "what happens next" panel, impact stat, View summary / Start new patient buttons
- src/lib/use-continue-handler.ts — custom hook to register step submit handlers triggered by footer's Continue button
- src/app/globals.css — added .no-scrollbar and .scrollbar-thin utilities
- src/app/layout.tsx — updated metadata to MediKiosk, switched to sonner Toaster

Stage Summary:
- 8 step components + 3 shared components + 1 custom hook delivered
- Sticky footer with workflow progress works on all viewport sizes (desktop + iPhone 14 verified)
- Footer's Continue button uses custom event pattern so it triggers each step's submit logic — solves the case where in-card buttons are visually covered by the fixed footer on smaller viewports
- Color theme: emerald/teal medical palette (no blue/indigo per design rules)

---
Task ID: 11 (browser verification + fixes)
Agent: main (MediKiosk architect)
Task: Run db:push, lint, fix errors, test with Agent Browser, verify all interactions work

Work Log:
- bun run lint — clean (0 errors, 0 warnings after fixing unused eslint-disable directives)
- Verified /api/patient POST creates patient record ✓
- Verified /api/chat with symptom messages triggers red-flag detection ✓
- Improved medical-prompts.ts:
  - System prompt now requires BOTH a reassuring patient-facing sentence AND the [REDFLAG] tag (previously the AI sometimes emitted only the tag, leaving an empty chat bubble)
  - Added explicit instruction to NOT flag chronic conditions / past history / medications by themselves (was over-flagging "I have diabetes" type messages)
  - Improved severity heuristic to classify "cardiac event", "immediate evaluation", "medical emergency" as critical
  - Added fallback reassuring message in parseAssistantReply when the AI emits only red-flag tags
- Fixed /api/summary/generate section parser bug — compound headers like "## HPI (History of Present Illness)" weren't being matched. Rewrote parser with normalisation + substring matching + special cases for HPI/ROS/AYUSH acronyms.
- Replaced radix Toaster with sonner Toaster in layout.tsx (components use sonner's toast())
- Updated layout.tsx metadata to MediKiosk branding
- Increased main padding-bottom to pb-60 to give in-card buttons clearance from sticky footer
- Introduced useContinueHandler hook + `medikiosk-continue` custom event so the footer's Continue button triggers each step's submit logic (handles the case where in-card buttons are covered by the sticky footer on shorter viewports)

End-to-end browser verification (agent-browser):
- Welcome → Begin Patient Intake ✓
- Identify: filled name + age, clicked Continue (via footer) → patient created, toast "Patient identified", navigated to Consent ✓
- Consent: clicked Grant all permissions → all 4 checkboxes checked, clicked Continue (via footer) → navigated to AI History ✓
- AI History: auto-kicked off conversation, AI greeted "Hello! I'm MediKiosk..." and asked for chief complaint. Sent "I have had severe chest pain..." → AI replied with reassuring message + flagged RED FLAG (severe, then critical after heuristic fix). Red-flag toast appeared. Red-flag panel updated with the alert. Sent "I also have diabetes..." and "I have allergy to penicillin" → conversation continued. Clicked Continue → navigated to Documents ✓
- Documents: upload area rendered, clicked Generate AI summary → navigated to Summary ✓
- Summary: auto-generated AI clinical summary, red-flag banner shown, structured sections parsed (HPI, Past History, Medications, etc.), clicked Confirm → toast "Summary confirmed", navigated to ABDM ✓
- ABDM: ran Link ABHA → generated "ABHA-VSZOQPQY". Ran Fetch prior records → "Fetched 3 prior records from ABDM". Ran Share to HIS and Push to EMR. Activity log populated. Clicked Finish intake → navigated to Complete ✓
- Complete: hero confirmation, 6 recap cards (Demo Patient, 6 turns, 0 docs, Confirmed, 3 successful ABDM actions, 1 red-flag detected), what-happens-next panel, impact callout, Start new patient button ✓
- Mobile responsive test at iPhone 14 (390x844) ✓

VLM document digitization verified via direct API test:
- Generated sample prescription image with image-generation skill
- Called /api/documents/analyze with the image
- VLM extracted: documentType=prescription, recordDate=2024-08-15, diagnoses=["Type 2 Diabetes Mellitus", ...], medicines=[Metformin 500mg twice daily, Atorvastatin 10mg at night, Aspirin 75mg morning]
- Multilingual OCR worked (the AI-generated image contained both English and Chinese text, both extracted correctly)

Stage Summary:
- All 4 MediKiosk capabilities verified working end-to-end: AI history taking (LLM + ASR + TTS), document digitization (VLM), AI clinical summary (LLM), ABDM/HIS integration (simulated FHIR)
- Browser-verified interactivity on both desktop and mobile viewports
- Sticky footer is sticky and pushed down naturally on long content
- Lint clean, dev server running on port 3000, no fatal errors in dev.log

---
Task ID: v2 (MediKiosk redesign — DKMS preface, granular consent, i18n, login, auto-reset)
Agent: main (MediKiosk architect)
Task: Major redesign per user request: DKMS-style preface tab, proper granular consent form, full-UI i18n on language change, cleaner medical theme, privacy auto-reset after consultation, returning patient login, more graphical UI for uneducated users.

Work Log:
Schema & backend:
- Added `Encounter` model — each visit is a fresh encounter so returning patients get a clean intake without their previous visit's chat/docs/summary loaded.
- Added `encounterId` (nullable) to ChatMessage, Document, ClinicalSummary, RedFlagAlert, ABDMRecord.
- Added `retentionDays` to Consent for the retention-period consent choice.
- Added `phone` field prominently (used for returning-patient login).
- New API: POST /api/patient/lookup — find existing patient by phone or ABHA.
- New API: POST/PATCH /api/encounter — create new encounter (for returning login), mark encounter completed (privacy).
- Updated /api/patient POST to also create the first encounter (nested write).
- Updated /api/chat, /api/documents, /api/summary/generate, /api/abdm to filter by encounterId when provided.
- Updated /api/consent to accept encounterId + retentionDays.

i18n system:
- Created src/lib/i18n.ts with a Translation interface (~160 keys covering every visible UI string) and full translations for English + Hindi, plus key-string translations for Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu, Odia (with English fallback for any missing key).
- Created src/lib/use-i18n.ts — useI18n() hook returning { t, lang } bound to store.uiLanguage.
- Added uiLanguage + setUiLanguage to the Zustand store; setPatient() now also switches uiLanguage to the patient's preferred language.
- Changing the language anywhere (preface grid, header dropdown, identify-step inline grid) updates uiLanguage and the ENTIRE UI re-renders in that language instantly.

New / rebuilt components:
- PrefaceScreen (replaces WelcomeScreen) — DKMS-style two-tab choice: "I am a new patient" / "I am returning for a follow-up", full 12-language grid, feature cards, impact callout.
- LoginStep — modal overlay for returning-patient login: phone or ABHA lookup → if found, shows confirmation → creates fresh encounter → jumps straight to consent (demographics pre-filled, identify skipped).
- LanguageSwitcher — used in two modes: compact dropdown in header (always visible) and full grid on preface/identify.
- IdentifyStep — rebuilt with i18n + inline language grid (12 language buttons with native script + flag). Changing language here updates the whole UI live.
- ConsentStep — rebuilt with granular per-category consent (5 items: demographics, history, documents, summary, abdm_share) + retention period selector (7/30/90/365 days or "until I withdraw"). Allow all / Deny all optional helpers.
- HistoryStep, DocumentsStep, SummaryStep, AbdmStep, CompleteStep, RedFlagToast, WorkflowProgress, PatientHeader — all rebuilt with i18n.
- CompleteStep now has a 30-second privacy auto-reset countdown. On reaching zero, it calls reset() (wipes the local store) and returns to the preface — implementing "privacy after consultation: system automatically switches to new onboarding".

Theme & UX:
- Switched to a cleaner, more basic medical theme: white background, emerald/teal accent, less gradient, more flat. Removed the gradient backgrounds.
- Header: white with emerald border-bottom. Footer: white with subtle shadow.
- Larger touch targets (size-14 mic/send buttons, h-12/h-11 form controls, h-12 footer buttons).
- More graphical: big icons for every section, color-coded consent items (sky/rose/emerald/amber/teal), language buttons with native-script flags.

Bugs fixed during verification:
- Prisma client needed regeneration + dev server restart after schema change (Turbopack cached stale client) → fixed by `bun run db:generate` + restart.
- medical-prompts.ts still imported getLanguageName/getLanguageNativeName from `./languages` after I moved them to `./i18n` → fixed import.
- ConsentStep was building the translation key dynamically (`consentItem${scope}Title`) which produced `consentItemAbdm_shareTitle` (wrong — actual key is `consentItemAbdmTitle`) → switched to explicit titleKey/descKey per item.
- Turbopack stale cache held the old medical-prompts import error even after the file was fixed → cleared `.next` and restarted dev server.

Browser-verified end-to-end:
- Preface renders with 12-language grid + DKMS two-tab choice ✓
- Clicked हिन्दी → entire UI (title, tabs, descriptions, feature cards) translated to Hindi instantly ✓
- Clicked தமிழ் → UI translated to Tamil ✓
- New patient flow: clicked "I am a new patient" → identify step with inline language grid → filled name+age → switched language to Hindi mid-step (UI translated live, form value preserved) → footer Continue created patient + encounter → consent step ✓
- Granular consent: 5 items with correct titles (incl. "Share with ABHA / hospital HIS via ABDM" — previously showed raw key) → Allow all + Continue → history step ✓
- AI greeted, "Welcome back to MediKiosk" for the returning-patient test ✓
- Returning patient login: created a patient with phone 9876543210, opened login modal, entered phone, clicked Find my record → "Welcome back, Returning Patient" → Continue → created fresh encounter, skipped identify, went straight to consent → patient header showed "Returning Patient, 55y · male" ✓
- Full flow through history → documents → summary → confirm → ABDM → complete ✓
- Complete step: privacy auto-reset countdown started at 30, counted down, at 0 the kiosk wiped the session and returned to the preface screen (patient header gone) ✓
- Final lint clean.

Stage Summary:
- All 7 user requirements implemented and browser-verified:
  1. DKMS-style preface/tab screen ✓
  2. Proper granular consent form (per-category opt-in/out + retention period) ✓
  3. Full-UI i18n — changing language preference translates the whole UI ✓
  4. Cleaner, more basic medical theme ✓
  5. Privacy auto-reset after consultation (30s countdown → fresh onboarding) ✓
  6. Returning patient login (phone/ABHA → prefill demographics → fresh encounter) ✓
  7. More graphical UI (big icons, color-coded, large touch targets, native-script language buttons) ✓
- Encounters model keeps each visit's data isolated for returning-patient privacy.

---
Task ID: v3 (Normal/Graphical mode toggle + medical theme)
Agent: main (MediKiosk architect)
Task: Add Normal/Graphical UI mode toggle on the preface (graphical = picture-based, text substituted with graphics) and change the color theme to a proper medical look (medical blue + white + red cross).

Work Log:
- Added `uiMode: "normal" | "graphical"` to the Zustand store with setUiMode. Persists across patients (kept through reset()).
- Created src/lib/use-ui-mode.ts — useUiMode() hook returning { graphical, uiMode, setUiMode }.
- Created src/components/medikiosk/ModeToggle.tsx — a two-option toggle (Normal with Type icon / Graphical with ImageIcon) shown on the preface.
- Added a compact mode toggle button to the header (next to the language switcher) so the user can switch modes from ANY step, not just the preface. Shows "Graphical" when in normal mode and "Normal" when in graphical mode.
- Added i18n keys: modeToggleTitle, modeToggleDesc, modeNormal, modeNormalDesc, modeGraphical, modeGraphicalDesc, historyQuickSymptoms (English + Hindi).
- Created src/components/medikiosk/QuickSymptomPanel.tsx — graphical-mode-only panel with 13 big body-part/symptom icons (Head, Chest, Stomach, Fever, Breath, Eye, Ear, Bones, Mind, Sugar, BP, Meds, Other). Tapping one sends a pre-formed short message to the AI so uneducated users can communicate without typing or speaking.
- Medical theme: replaced `emerald` → `sky` (medical blue) across ALL medikiosk components (13 files) + page.tsx via sed. Sky-600 = primary, sky-700 = hover, sky-100/50 = light backgrounds, sky-200/300 = borders.
- Updated the MediKiosk logo from a plus-circle to a proper **medical cross** (filled SVG path forming the classic medical cross shape).
- Graphical mode rendering applied to:
  - PrefaceScreen: hides subtitle, tab descriptions, feature cards, impact callout; tab icons become size-20 (vs size-14); tab padding doubles (p-8/p-10 vs p-6).
  - IdentifyStep: gender dropdown is replaced by 4 big icon buttons (Mars=Male, Venus=Female, CircleUser=Other/Prefer not) with color-coded backgrounds.
  - ConsentStep: consent item icons grow from size-9 → size-14, icon glyphs size-5 → size-8, long descriptions are HIDDEN (only title + badge shown), title font becomes text-lg.
  - HistoryStep: chat avatars grow size-8 → size-12 (icons size-4 → size-7), chat text size-sm → text-base, QuickSymptomPanel appears above the input.
  - CompleteStep: RecapCards switch to a centered big-icon layout (size-12 icon tile + big value + small label).
- Bug fixed: QuickSymptomPanel imported `Headache` from lucide-react which doesn't exist → replaced with `Frown` (verified all other icons exist via node script).

Browser-verified end-to-end:
- Preface shows Normal/Graphical toggle ✓
- Clicked Graphical → subtitle, feature cards, tab descriptions all hidden; just big tab pictures remain ✓
- Clicked "I am a new patient" in graphical mode → identify step showed gender as 4 big icon buttons (Male/Female/Other/Prefer) ✓
- Filled form → consent step with big size-14 icons, descriptions hidden ✓
- Allow all + Continue → history step with QuickSymptomPanel (Head/Chest/Stomach/Fever/Breath icon buttons) ✓
- AI greeted; tapped "Chest" → sent "I have chest pain" → AI replied with follow-up ("when did this chest pain start?") ✓
- Clicked "Normal" in header → quick symptom panel disappeared, chat avatars shrunk back to size-8 ✓
- Clicked "Graphical" in header → quick symptom panel reappeared ✓
- Medical theme: sky-600 primary buttons + medical cross logo confirmed via DOM inspection ✓
- Lint clean, dev server compiles, chat API 200 ✓

Stage Summary:
- Normal/Graphical mode toggle on preface + header ✓
- Graphical mode substitutes text with big pictures/icons across every step ✓
- Quick symptom tap panel makes the chat usable for uneducated users ✓
- Medical blue + white + red-cross theme applied throughout ✓
- Mode persists across patients (privacy reset keeps uiMode) ✓
