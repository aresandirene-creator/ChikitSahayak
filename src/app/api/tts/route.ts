import { NextRequest, NextResponse } from "next/server";
import { getZai } from "@/lib/zai";
import { pickTtsVoiceForLanguage } from "@/lib/languages";

// POST /api/tts — synthesize speech and return audio as a base64-encoded WAV
// Body: { text, language?, voice?, speed? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, language = "en", voice, speed = 1.0 } = body;
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "text required" }, { status: 400 });
    }
    if (text.length > 1024) {
      return NextResponse.json({ error: "text exceeds 1024 characters" }, { status: 400 });
    }

    const zai = await getZai();
    const ttsResp = await zai.audio.tts.create({
      input: text.trim(),
      voice: voice ?? pickTtsVoiceForLanguage(language),
      speed,
      response_format: "wav",
      stream: false,
    });

    const arrayBuffer = await ttsResp.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));
    const audioBase64 = buffer.toString("base64");

    return NextResponse.json({
      success: true,
      audioBase64,
      size: buffer.length,
      format: "wav",
    });
  } catch (err) {
    console.error("POST /api/tts error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
