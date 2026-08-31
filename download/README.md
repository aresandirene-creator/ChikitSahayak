# ChikitsaHayak — Source Code

**AI-powered patient-facing clinical intake kiosk** for Indian hospitals/clinics.

## What's in this archive

```
chikitsahayak-source/
├── src/
│   ├── app/
│   │   ├── api/              # Backend API routes (patient, chat, asr, documents, summary, abdm, consent, encounter, redflag)
│   │   ├── layout.tsx        # Root layout + metadata
│   │   ├── page.tsx          # The single `/` route — kiosk UI
│   │   └── globals.css       # Design system (OMNI HD, medical crimson theme)
│   ├── components/
│   │   ├── medikiosk/        # 17 kiosk components (PrefaceScreen, IdentifyStep, ConsentStep, HistoryStep, DocumentsStep, SummaryStep, AbdmStep, CompleteStep, VoiceAssistant, AccessibilityPanel, etc.)
│   │   └── ui/               # shadcn/ui component library
│   └── lib/
│       ├── db.ts             # Prisma client
│       ├── zai.ts            # z-ai-web-dev-sdk singleton (LLM, VLM, ASR)
│       ├── store.ts          # Zustand store (session state)
│       ├── i18n.ts           # 12 Indian languages + English translations
│       ├── use-speech.ts     # Web Speech API hook (Google AI Studio voices)
│       ├── medical-prompts.ts# AI system prompts (history, summary, document OCR)
│       ├── use-i18n.ts       # i18n hook
│       ├── use-ui-mode.ts    # Normal/Graphical mode hook
│       └── use-continue-handler.ts
├── prisma/
│   └── schema.prisma         # 7 models: Patient, Encounter, Consent, ChatMessage, Document, ClinicalSummary, RedFlagAlert, ABDMRecord
├── public/
│   └── chikitsahayak-logo.png # Official logo
├── package.json              # Dependencies + scripts
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json           # shadcn/ui config
├── eslint.config.mjs
├── Caddyfile                 # Gateway config
└── worklog.md                # Full build history
```

## How to run on another device

### Prerequisites
- **Node.js 18+** or **Bun** (recommended)
- An `.env` file in the project root with:
  ```
  DATABASE_URL="file:./db/custom.db"
  ```
  (a SQLite database — no external DB server needed)

### Steps

```bash
# 1. Extract the archive
tar xzf chikitsahayak-source.tar.gz
cd chikitsahayak-source

# 2. Create the .env file
echo 'DATABASE_URL="file:./db/custom.db"' > .env
mkdir -p db

# 3. Install dependencies (use bun for speed, or npm/yarn)
bun install
# or: npm install

# 4. Generate the Prisma client + push the schema to the DB
bun run db:generate
bun run db:push
# or: npx prisma generate && npx prisma db push

# 5. Start the dev server
bun run dev
# or: npm run dev

# 6. Open http://localhost:3000 in your browser
```

### Production build (optional)
```bash
bun run build
bun run start
```

## Key features

- **AI Conversational History** — LLM chat with adaptive questions, red-flag detection, AYUSH mode
- **Document Digitization** — VLM reads prescriptions/lab reports in any Indian language
- **AI Clinical Summary** — structured physician-readable summary (review/edit/confirm)
- **ABDM/HIS Integration** — consent-based FHIR exchange
- **12 Indian languages** — full UI translation + multilingual AI
- **Normal/Graphical mode** — picture-based UI for uneducated users
- **Web Speech API voices** — Google AI Studio-quality Indian voices (no API key)
- **Accessibility** — auto-adapts font size to patient age, high-contrast, reduce-motion
- **Siri-like voice assistant** — hands-free conversational mode
- **Privacy auto-reset** — wipes session 30s after completion

## Tech stack

- Next.js 16 (App Router) + TypeScript 5
- Prisma + SQLite
- Tailwind CSS 4 + shadcn/ui
- Zustand (state) + Web Speech API (TTS)
- z-ai-web-dev-sdk (LLM, VLM, ASR)

## Notes

- The `node_modules` and `.next` folders are NOT included — run `bun install` to regenerate them.
- The database (`db/custom.db`) is NOT included — `bun run db:push` creates a fresh one.
- TTS uses the browser's Web Speech API (Google Indian voices on Chrome/Edge) — works offline, no API key.
- ASR (speech-to-text) uses the z-ai-web-dev-sdk — needs network access.
- LLM (chat/summary) and VLM (document OCR) use the z-ai-web-dev-sdk.
