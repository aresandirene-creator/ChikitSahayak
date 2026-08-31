import { GoogleGenAI } from "@google/genai";

/** Create the client only when a request needs it.
 *
 * Throwing during module import makes Next.js serve an HTML error page, which
 * client-side callers then fail to parse as JSON. Keeping the check here lets
 * API routes respond with an actionable JSON error instead.
 */
export function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Generate a chat reply using Groq when a key is configured. Groq's API is
 * OpenAI-compatible and offers a free tier; Gemini remains a fallback for
 * deployments that only configure GEMINI_API_KEY.
 */
export async function generateChatText(prompt: string) {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 900,
      }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(JSON.stringify(data ?? { code: response.status, message: "Groq request failed" }));
    }
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("Groq returned an empty response");
    }
    return text;
  }

  const gemini = getGemini();
  const response = await gemini.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });
  return response.text ?? "";
}
