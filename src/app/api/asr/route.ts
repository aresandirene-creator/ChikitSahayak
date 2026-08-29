import { NextRequest, NextResponse } from "next/server";
import { getZai } from "@/lib/zai";

// POST /api/asr — transcribe a base64-encoded audio recording
// Body: { audioBase64 }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audioBase64 } = body;
    if (!audioBase64 || typeof audioBase64 !== "string") {
      return NextResponse.json({ error: "audioBase64 required" }, { status: 400 });
    }

    const zai = await getZai();
    const response = await zai.audio.asr.create({
      file_base64: audioBase64,
    });

    return NextResponse.json({ text: response.text ?? "" });
  } catch (err) {
    console.error("POST /api/asr error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
