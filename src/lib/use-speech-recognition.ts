"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useSpeechRecognition — client-side speech-to-text using the browser's
 * SpeechRecognition API. This is the SAME Web Speech API family that powers
 * our TTS (useSpeech). On Chrome/Edge it uses Google's speech recognition,
 * which natively supports all 12 Indian languages (hi-IN, ta-IN, te-IN,
 * bn-IN, etc.) with high accuracy — no Chinese-mismatch problem.
 *
 * Falls back to the server ZAI ASR only if the browser doesn't support
 * SpeechRecognition (e.g. Firefox). The server ASR is Mandarin-focused so
 * it's only used as a last resort.
 *
 * Usage:
 *   const { start, stop, listening, transcript, error, supported } = useSpeechRecognition();
 *   start("hi"); // start listening in Hindi
 *   // when the user stops, `transcript` updates with the recognized text
 */

// Map our 12 Indian language codes to BCP-47 locale tags
const LANG_TO_LOCALE: Record<string, string> = {
  en: "en-IN",
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

// Browser vendors prefix the API differently
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: { results: { 0: { 0: { transcript: string } }[] }[] }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition ??
    null
  );
}

export function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const supported = !!getRecognitionCtor();

  const start = useCallback((lang: string = "en") => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("Speech recognition not supported in this browser");
      return;
    }
    setError(null);
    setTranscript("");

    const recognition = new Ctor();
    recognition.lang = LANG_TO_LOCALE[lang] ?? "en-IN";
    recognition.continuous = false; // single utterance, stops automatically
    recognition.interimResults = false; // only final results
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript ?? "";
      setTranscript(text);
    };

    recognition.onerror = (event) => {
      setError(event.error || "Recognition failed");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      setError((e as Error).message);
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { /* ignore */ }
    }
    setListening(false);
  }, []);

  const clear = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }
    };
  }, []);

  return {
    start,
    stop,
    clear,
    listening,
    transcript,
    error,
    supported,
  };
}
