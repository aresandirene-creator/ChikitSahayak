import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const VOICE_BY_LANGUAGE: Record<string, string> = {
  te: "te",
};

async function generateWithElevenLabs(text: string, language: string) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  // This is ElevenLabs' documented premade-voice example. It can be replaced
  // with a preferred voice from the user's account through ELEVENLABS_VOICE_ID.
  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb";
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
        body: JSON.stringify({
          text,
          model_id: process.env.ELEVENLABS_MODEL ?? "eleven_v3",
          language_code: language,
        }),
        signal: AbortSignal.timeout(15_000),
      }
    );
    if (!response.ok || !response.body) {
      console.warn("ElevenLabs TTS unavailable; using offline eSpeak fallback.", response.status);
      return null;
    }
    return response;
  } catch (error) {
    console.warn("ElevenLabs TTS connection failed; using offline eSpeak fallback.", error);
    return null;
  }
}

// POST /api/tts — free, offline eSpeak NG fallback for Telugu speech.
// Body: { text, language }
export async function POST(req: NextRequest) {
  try {
    const { text, language } = await req.json();
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "text required" }, { status: 400 });
    }
    if (text.length > 2500) {
      return NextResponse.json({ error: "Text is too long for speech output." }, { status: 400 });
    }
    const voice = VOICE_BY_LANGUAGE[language];
    if (!voice) {
      return NextResponse.json({ error: "Offline speech is not available for this language." }, { status: 400 });
    }

    const elevenLabsResponse = await generateWithElevenLabs(text, language);
    if (elevenLabsResponse) {
      return new NextResponse(elevenLabsResponse.body, {
        headers: {
          "Content-Type": elevenLabsResponse.headers.get("content-type") ?? "audio/mpeg",
          "Cache-Control": "no-store",
          "X-TTS-Provider": "elevenlabs",
        },
      });
    }

    const { default: ESpeakNg } = await import("espeak-ng");
    const fileName = "speech.wav";
    const engine = await ESpeakNg({
      arguments: ["-v", voice, "-s", "145", "-w", fileName, text],
    });
    const wav = engine.FS.readFile(fileName) as Uint8Array;
    if (!wav.length) throw new Error("eSpeak NG returned no audio");

    return new NextResponse(wav, {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
        "X-TTS-Provider": "espeak-ng",
      },
    });
  } catch (error) {
    console.error("POST /api/tts error:", error);
    return NextResponse.json({ error: "Offline Telugu speech generation failed." }, { status: 500 });
  }
}
