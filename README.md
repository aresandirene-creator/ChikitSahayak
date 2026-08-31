# ChikitsaHayak — AI-Powered Clinical Intake Kiosk

**ChikitsaHayak** (चिकित्साहायक, "treatment helper") is an AI-powered patient-facing clinical intake kiosk for Indian hospitals/clinics. It collects and organises a patient's medical history **before** the doctor consultation, so the doctor receives a structured, reviewable history immediately.

## Patient workflow
**Identify → Consent → AI History → Scan Documents → AI Summary → HIS/ABHA → Consultation**

## Quick start

```bash
# 1. Install dependencies
bun install        # or: npm install

# 2. Create the .env file (device-specific, NOT included in the repo)
echo 'DATABASE_URL="file:./dev.db"' > .env
# Add one AI-chat provider key (Groq is preferred; Gemini is a fallback):
# GROQ_API_KEY="your-key"
# GEMINI_API_KEY="your-key"
mkdir -p prisma

# 3. Generate Prisma client + create the database
bun run db:generate
bun run db:push

# 4. Start the dev server
bun run dev

# 5. Open http://localhost:3000
```

> **Note:** The `.env` file and SQLite database are gitignored — each device creates its own. AI History uses `GROQ_API_KEY` when available, otherwise `GEMINI_API_KEY`; never expose either key with a `NEXT_PUBLIC_` prefix. Document OCR uses local Tesseract and needs no API key. Its language data is downloaded once and cached in `.tesseract-cache/`.

## Features

- **AI Conversational History** — LLM chat with adaptive questions, red-flag detection, AYUSH mode, 12 Indian languages
- **Document Digitization** — local Tesseract OCR reads prescription/lab-report text without paid API quotas
- **AI Clinical Summary** — structured physician-readable summary (review/edit/confirm)
- **ABDM/HIS Integration** — consent-based FHIR exchange
- **Voice** — browser Web Speech API for both TTS (Google Indian voices) and speech recognition (no Chinese misrecognition)
- **Accessibility** — auto-adapts font size to patient age, high-contrast, reduce-motion, graphical mode for uneducated users
- **Privacy auto-reset** — wipes session 30s after completion

## Tech stack
- Next.js 16 (App Router) + TypeScript 5
- Prisma + SQLite
- Tailwind CSS 4 + shadcn/ui (9 components)
- Zustand (state) + Web Speech API (TTS + STT)
- Groq/Gemini API (AI history assistant) and local Tesseract OCR (document text extraction)

## Project structure

```
prisma/schema.prisma         # 7 models (Patient, Encounter, Consent, ChatMessage, Document, ClinicalSummary, RedFlagAlert, ABDMRecord)
src/app/
  api/                       # 8 backend routes (patient, encounter, consent, chat, asr, documents, summary, abdm)
  layout.tsx                 # Root layout + metadata
  page.tsx                   # The single `/` route
  globals.css                # Design system (medical crimson theme)
src/components/
  medikiosk/                 # 17 kiosk components
  ui/                        # 9 shadcn/ui components (badge, button, card, checkbox, input, label, select, switch, textarea)
src/lib/
  db.ts                      # Prisma client
  zai.ts                     # z-ai-web-dev-sdk singleton
  store.ts                   # Zustand store
  i18n.ts                    # 12 Indian languages + English translations
  use-speech.ts              # Web Speech API TTS hook (Google Indian voices)
  use-speech-recognition.ts  # Web Speech API STT hook (no Chinese misrecognition)
  medical-prompts.ts         # AI system prompts
  types.ts                   # Shared TypeScript interfaces
public/chikitsahayak-logo.png # Official logo
```

## Scripts
- `bun run dev` — start dev server on port 3000
- `bun run lint` — run ESLint
- `bun run db:push` — push schema to SQLite
- `bun run db:generate` — regenerate Prisma client
- `bun run build` — production build
