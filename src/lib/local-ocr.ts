import "server-only";

const LANGUAGE_MODELS: Record<string, string> = {
  en: "eng",
  hi: "hin",
  bn: "ben",
  ta: "tam",
  te: "tel",
  mr: "mar",
  gu: "guj",
  kn: "kan",
  ml: "mal",
  pa: "pan",
  ur: "urd",
  or: "ori",
};

async function prepareDocumentImage(image: Buffer) {
  const { default: sharp } = await import("sharp");
  // Phone photos are commonly dark, rotated, and too low-resolution for
  // printed prescription text. Normalize and enlarge them before recognition.
  return sharp(image)
    .rotate()
    .grayscale()
    .normalize()
    .sharpen({ sigma: 1.1 })
    .resize({ width: 2200, withoutEnlargement: false })
    .png()
    .toBuffer();
}

export async function recognizeDocument(dataUrl: string, language = "en") {
  if (!dataUrl.startsWith("data:image/")) {
    throw new Error("Only image files are supported for OCR.");
  }

  const comma = dataUrl.indexOf(",");
  const image = Buffer.from(dataUrl.slice(comma + 1), "base64");
  if (image.length === 0 || image.length > 12 * 1024 * 1024) {
    throw new Error("Use an image between 1 byte and 12 MB.");
  }

  // Tesseract runs in this server process; it is not a paid third-party OCR
  // API. Language data is downloaded and cached the first time it is needed.
  const preparedImage = await prepareDocumentImage(image);
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(LANGUAGE_MODELS[language] ?? "eng", 1, {
    cachePath: ".tesseract-cache",
  });

  try {
    // Prescriptions and lab reports vary widely in layout. Compare a normal
    // text-block pass with sparse-text mode, then retain the stronger result.
    await worker.setParameters({
      tessedit_pageseg_mode: "6" as Tesseract.PSM,
      preserve_interword_spaces: "1",
    });
    const blockResult = await worker.recognize(preparedImage);

    await worker.setParameters({ tessedit_pageseg_mode: "11" as Tesseract.PSM });
    const sparseResult = await worker.recognize(preparedImage);
    const result = [blockResult, sparseResult].reduce((best, current) =>
      current.data.confidence > best.data.confidence ? current : best
    );

    return {
      rawText: result.data.text.trim(),
      confidence: Math.round(result.data.confidence),
    };
  } finally {
    await worker.terminate();
  }
}
