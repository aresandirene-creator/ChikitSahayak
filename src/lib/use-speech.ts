"use client";

import { useEffect, useState, useCallback, useRef } from "react";

/**
 * useSpeech — client-side TTS using the browser's Web Speech API
 * (SpeechSynthesis). This gives access to the OS's native TTS voices,
 * which on Chrome/Edge include Google's high-quality Indian-language
 * voices (Google हिन्दी, Google தமிழ், Google తెలుగు, etc.) — effectively
 * "Google AI Studio" quality voices, with no API key or network call.
 *
 * Usage:
 *   const { speak, cancel, speaking, voices, getBestVoiceForLang } = useSpeech();
 *   speak("नमस्ते", "hi");
 */

export interface SpeechVoice {
  name: string;
  lang: string;
  voiceURI: string;
  isGoogle: boolean;
}

// Map our 12 Indian language codes to BCP-47 locale tags the SpeechSynthesis
// API uses to find the right voice.
const LANG_TO_LOCALE: Record<string, string> = {
  en: "en-IN", // Indian English
  hi: "hi-IN",
  bn: "bn-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  pa: "pa-IN",
  ur: "ur-IN",
  or: "or-IN",
};

export function useSpeech() {
  const [voices, setVoices] = useState<SpeechVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    let mounted = true;
    const loadVoices = () => {
      if (!mounted) return;
      const v = window.speechSynthesis.getVoices();
      const mapped: SpeechVoice[] = v.map((voice) => ({
        name: voice.name,
        lang: voice.lang,
        voiceURI: voice.voiceURI,
        isGoogle: /google/i.test(voice.name),
      }));
      setVoices(mapped);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      mounted = false;
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Find the best voice for a language: prefer Google voices, then any
  // voice matching the locale, then fall back to en-IN / en-US.
  const getBestVoiceForLang = useCallback(
    (lang: string): SpeechSynthesisVoice | null => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
      const all = window.speechSynthesis.getVoices();
      if (all.length === 0) return null;
      const locale = LANG_TO_LOCALE[lang] ?? "en-IN";

      // 1. Google voice for the exact locale
      let v = all.find((x) => /google/i.test(x.name) && x.lang === locale);
      // 2. Any Google voice for the language prefix (e.g. "hi" matches "hi-IN")
      if (!v) v = all.find((x) => /google/i.test(x.name) && x.lang.startsWith(lang + "-"));
      // 3. Any voice for the exact locale
      if (!v) v = all.find((x) => x.lang === locale);
      // 4. Any voice for the language prefix
      if (!v) v = all.find((x) => x.lang.startsWith(lang + "-"));
      // 5. Indian English fallback
      if (!v) v = all.find((x) => x.lang === "en-IN");
      // 6. Any English
      if (!v) v = all.find((x) => x.lang.startsWith("en"));
      // 7. First available
      if (!v) v = all[0];
      return v ?? null;
    },
    []
  );

  const speak = useCallback(
    (text: string, lang: string = "en", opts?: { rate?: number; pitch?: number }) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return;
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      const voice = getBestVoiceForLang(lang);
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        utter.lang = LANG_TO_LOCALE[lang] ?? "en-IN";
      }
      utter.rate = opts?.rate ?? 0.95; // slightly slower for medical clarity
      utter.pitch = opts?.pitch ?? 1.0;
      utter.volume = 1.0;

      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);

      currentUtteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    },
    [getBestVoiceForLang]
  );

  const cancel = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, cancel, speaking, voices, hasVoices: voices.length > 0, getBestVoiceForLang, supported, LANG_TO_LOCALE };
}
