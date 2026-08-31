import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

const SUPPORTED_AUDIO_TYPES = new Set([
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/wav",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
]);

const ELEVENLABS_LANGUAGE_CODES: Record<string, string> = {
  te: "tel",
};

// POST /api/asr — transcribe a base64-encoded recording with Groq Whisper.
// Body: { audioBase64, mimeType?, language? }
export async function POST(req: NextRequest) {
  try {
    const { audioBase64, mimeType, language } = await req.json();
    if (!audioBase64 || typeof audioBase64 !== "string") {
      return NextResponse.json({ error: "audioBase64 required" }, { status: 400 });
    }

    const key = process.env.GROQ_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "Voice transcription is not configured. Set GROQ_API_KEY on the server." },
        { status: 503 }
      );
    }
    const safeMimeType = typeof mimeType === "string" && SUPPORTED_AUDIO_TYPES.has(mimeType)
      ? mimeType
      : "audio/webm";
    const audio = Buffer.from(audioBase64.replace(/^data:.*;base64,/, ""), "base64");
    if (audio.byteLength === 0 || audio.byteLength > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio must be between 1 byte and 25 MB." }, { status: 400 });
    }

    const audioFile = new Blob([audio], { type: safeMimeType });

    // Scribe v2 explicitly supports Telugu and provides higher-quality
    // multilingual transcription. Keep Groq Whisper as a no-extra-config
    // fallback if ElevenLabs is unavailable or out of credits.
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (elevenLabsKey && language === "te") {
      try {
        const elevenLabsForm = new FormData();
        elevenLabsForm.append("file", audioFile, "recording.webm");
        elevenLabsForm.append("model_id", "scribe_v2");
        elevenLabsForm.append("language_code", ELEVENLABS_LANGUAGE_CODES[language]);
        elevenLabsForm.append("tag_audio_events", "false");
        elevenLabsForm.append("diarize", "false");
        const elevenLabsResponse = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
          method: "POST",
          headers: { "xi-api-key": elevenLabsKey },
          body: elevenLabsForm,
          signal: AbortSignal.timeout(20_000),
        });
        const elevenLabsData = await elevenLabsResponse.json().catch(() => null);
        if (elevenLabsResponse.ok && typeof elevenLabsData?.text === "string") {
          return NextResponse.json({ text: elevenLabsData.text, provider: "elevenlabs" });
        }
        console.warn("ElevenLabs ASR unavailable; using Groq Whisper fallback.", elevenLabsResponse.status);
      } catch (error) {
        console.warn("ElevenLabs ASR connection failed; using Groq Whisper fallback.", error);
      }
    }

    const form = new FormData();
    form.append("file", audioFile, "recording.webm");
    form.append("model", process.env.GROQ_ASR_MODEL ?? "whisper-large-v3");
    form.append("response_format", "json");
    form.append("temperature", "0");
    if (typeof language === "string" && /^[a-z]{2}$/.test(language)) form.append("language", language);

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      console.error("Groq ASR failed:", response.status, data);
      return NextResponse.json(
        { error: "Voice transcription failed. Please try again or type your response." },
        { status: response.status >= 500 ? 503 : 502 }
      );
    }
    return NextResponse.json({ text: typeof data?.text === "string" ? data.text : "", provider: "groq" });
  } catch (err) {
    console.error("POST /api/asr error:", err);
    return NextResponse.json({ error: "Voice transcription failed. Please try again." }, { status: 500 });
  }
}
