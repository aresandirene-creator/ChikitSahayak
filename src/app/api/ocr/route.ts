import { NextRequest, NextResponse } from "next/server";
import { recognizeDocument } from "@/lib/local-ocr";

export const runtime = "nodejs";

/**
 * First-party OCR endpoint. It accepts a base64 image data URL and runs
 * Tesseract in this application process—no Gemini key or paid OCR provider.
 */
export async function POST(req: NextRequest) {
  try {
    const { dataUrl, language = "en" } = await req.json();
    if (typeof dataUrl !== "string") {
      return NextResponse.json({ error: "dataUrl is required" }, { status: 400 });
    }
    return NextResponse.json(await recognizeDocument(dataUrl, language));
  } catch (error) {
    console.error("POST /api/ocr error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "OCR failed" },
      { status: 500 }
    );
  }
}
