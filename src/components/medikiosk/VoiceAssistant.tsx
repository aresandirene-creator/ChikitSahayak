"use client";

import { useEffect, useRef, useState } from "react";
import { useChikitSahayakStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { useSpeech } from "@/lib/use-speech";
import { useSpeechRecognition } from "@/lib/use-speech-recognition";
import { playOfflineTelugu } from "@/lib/offline-tts";
import { toast } from "sonner";
import {
  Mic, X, Loader2, Volume2, Bot,
} from "lucide-react";

/**
 * Siri-like voice assistant — a floating orb that the patient can tap to
 * have a voice-only conversation with the AI. Speech in (mic → ASR) →
 * LLM chat → speech out via the browser's Web Speech API (Google-quality
 * Indian-language voices). Hands-free, conversational loop.
 */
export function VoiceAssistant({ onClose }: { onClose: () => void }) {
  const patient = useChikitSahayakStore((s) => s.patient);
  const encounterId = useChikitSahayakStore((s) => s.encounterId);
  const uiLanguage = useChikitSahayakStore((s) => s.uiLanguage);
  const { t } = useI18n();
  const { speak, cancel: cancelSpeech, speaking } = useSpeech();
  const {
    start: startRecognition,
    stop: stopRecognition,
    listening: recognitionListening,
    transcript: recognitionTranscript,
    error: recognitionError,
    supported: recognitionSupported,
    clear: clearRecognition,
  } = useSpeechRecognition();

  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [lastHeard, setLastHeard] = useState("");
  const [lastReply, setLastReply] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const forceCloudAsrRef = useRef(false);

  useEffect(() => {
    startListening();
    return () => stopAll();
  }, []);

  useEffect(() => {
    if (!recognitionError) return;
    setListening(false);
    if (recognitionError === "network") {
      // Chromium exposes SpeechRecognition even when its online recognition
      // service is unavailable. Switch to our multilingual Whisper path.
      forceCloudAsrRef.current = true;
      toast.info("Browser voice recognition is unavailable. Switching to cloud transcription.");
      void startListening();
      return;
    }
    const message = recognitionError === "not-allowed" || recognitionError === "service-not-allowed"
      ? "Microphone permission was denied. Allow it in your browser site settings and try again."
      : `Voice input failed: ${recognitionError}`;
    toast.error(message);
  }, [recognitionError]);

  const stopAll = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    } catch { /* ignore */ }
    cancelSpeech();
  };

  const pickRecordingMime = (): string => {
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/wav"];
    for (const m of candidates) {
      try {
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) return m;
      } catch { /* ignore */ }
    }
    return "audio/webm";
  };

  const arrayBufferToBase64 = (buf: ArrayBuffer): string => {
    const bytes = new Uint8Array(buf);
    const CHUNK = 0x8000;
    let binary = "";
    for (let i = 0; i < bytes.length; i += CHUNK) {
      const slice = bytes.subarray(i, i + CHUNK);
      binary += String.fromCharCode.apply(null, Array.from(slice) as number[]);
    }
    return btoa(binary);
  };

  const startListening = async () => {
    if (!patient) return;
    cancelSpeech();
    clearRecognition();
    setLastHeard("");

    if (!window.isSecureContext) {
      toast.error("Microphone access requires HTTPS (or http://localhost during development).");
      return;
    }

    // PRIMARY: browser SpeechRecognition — understands all 12 Indian
    // languages natively (Google-quality on Chrome/Edge). The recognized
    // transcript triggers the chat via the recognitionTranscript effect below.
    if (recognitionSupported && !forceCloudAsrRef.current) {
      setListening(true);
      startRecognition(uiLanguage || "en");
      return;
    }

    // FALLBACK: MediaRecorder + server Groq Whisper (multilingual). Used on
    // Firefox and browsers without SpeechRecognition.
    setListening(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      });
      const mime = pickRecordingMime();
      const mr = new MediaRecorder(stream, { mimeType: mime });
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blobType = mime.startsWith("audio/wav") ? "audio/wav" : "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: blobType });
        if (blob.size < 2000) {
          setListening(false);
          toast.error("Recording too short");
          return;
        }
        await transcribeAndChat(blob);
      };
      mr.start(250);
      mediaRecorderRef.current = mr;
    } catch (e) {
      console.error("mic error", e);
      toast.error("Microphone access failed");
      setListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionSupported && !forceCloudAsrRef.current) {
      stopRecognition();
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setListening(false);
  };

  // When the browser SpeechRecognition produces a transcript, send it to
  // the chat immediately (hands-free conversational mode).
  useEffect(() => {
    if (recognitionTranscript) {
      setListening(false);
      sendToChat(recognitionTranscript);
    }
  }, [recognitionTranscript]);

  useEffect(() => {
    if (recognitionError) {
      setListening(false);
      toast.error(recognitionError === "no-speech" ? "No speech detected" : recognitionError);
    }
  }, [recognitionError]);

  useEffect(() => {
    if (recognitionSupported && !forceCloudAsrRef.current) setListening(recognitionListening);
  }, [recognitionListening, recognitionSupported]);

  // Send a transcript to the AI chat and speak the reply. Shared by both
  // the browser-Speech-recognition path and the Groq Whisper fallback path.
  const sendToChat = async (transcript: string) => {
    if (!patient || !transcript.trim()) return;
    setThinking(true);
    try {
      setLastHeard(transcript);

      // Chat with the AI (no server TTS — we speak it client-side via Web Speech)
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          encounterId,
          message: transcript,
          patient,
          language: uiLanguage, // current UI language so mid-process switches take effect
          withAudio: false, // we use Web Speech API for TTS
        }),
      });
      const contentType = chatRes.headers.get("content-type") ?? "";
      const chatData = contentType.includes("application/json")
        ? await chatRes.json()
        : { error: `The AI service returned an unexpected response (${chatRes.status}).` };
      if (!chatRes.ok) throw new Error(chatData.error || "Chat failed");
      setLastReply(chatData.reply);

      // Speak the reply using the browser's Web Speech API
      // (Google-quality Indian-language voices, client-side, no API key)
      setThinking(false);
      if (chatData.reply) {
        const replyLanguage = chatData.language || uiLanguage || "en";
        if (!(await playOfflineTelugu(chatData.reply, replyLanguage)) && !speak(chatData.reply, replyLanguage) && replyLanguage === "te") {
          toast.error("Telugu speech could not start. Please tap the voice button again.");
        }
      }
    } catch (e) {
      toast.error((e as Error).message);
      setThinking(false);
    }
  };

  // Fallback path: MediaRecorder → Groq Whisper → sendToChat
  const transcribeAndChat = async (blob: Blob) => {
    setThinking(true);
    try {
      // 1. ASR (speech-to-text via multilingual Groq Whisper)
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const asrRes = await fetch("/api/asr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: base64, mimeType: blob.type, language: uiLanguage || "en" }),
      });
      const asrData = await asrRes.json();
      if (!asrRes.ok) throw new Error(asrData.error || "ASR failed");
      const transcript = (asrData.text ?? "").trim();
      if (!transcript || transcript === "#") {
        toast.error("No speech detected");
        setThinking(false);
        return;
      }
      await sendToChat(transcript);
    } catch (e) {
      toast.error((e as Error).message);
      setThinking(false);
    }
  };

  // Auto-listen again when the AI finishes speaking
  useEffect(() => {
    if (!speaking && lastReply && !thinking && !listening) {
      const timer = setTimeout(() => {
        if (patient) startListening();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [speaking]);

  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white border border-red-100 shadow-soft-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="size-5" />
            <span className="font-bold text-base">Voice Assistant</span>
          </div>
          <button
            onClick={() => { stopAll(); onClose(); }}
            className="size-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Orb */}
        <div className="p-8 flex flex-col items-center gap-5 bg-gradient-to-b from-red-50/50 to-white">
          <button
            onClick={listening ? stopListening : startListening}
            disabled={thinking}
            className={[
              "size-36 rounded-full flex items-center justify-center transition-all shadow-soft-lg border-4",
              listening
                ? "bg-red-600 text-white border-red-300 animate-pulse scale-110"
                : speaking
                  ? "bg-red-500 text-white border-red-200"
                  : thinking
                    ? "bg-red-200 text-red-700 border-red-100"
                    : "bg-red-600 text-white border-red-300 hover:scale-105",
            ].join(" ")}
            aria-label={listening ? "Stop" : "Talk"}
          >
            {thinking ? (
              <Loader2 className="size-14 animate-spin" />
            ) : listening ? (
              <Mic className="size-14" />
            ) : speaking ? (
              <Volume2 className="size-14" />
            ) : (
              <Mic className="size-14" />
            )}
          </button>

          {/* Status */}
          <div className="text-center min-h-[56px]">
            {listening && (
              <>
                <div className="font-semibold text-red-900 text-base">Listening…</div>
                <div className="text-xs text-muted-foreground mt-1">Tap to stop, then I'll reply</div>
              </>
            )}
            {thinking && (
              <>
                <div className="font-semibold text-red-900 text-base">Thinking…</div>
                <div className="text-xs text-muted-foreground mt-1">Understanding what you said</div>
              </>
            )}
            {speaking && (
              <>
                <div className="font-semibold text-red-900 text-base">Speaking…</div>
                <div className="text-xs text-muted-foreground mt-1">Tap the orb to interrupt</div>
              </>
            )}
            {!listening && !thinking && !speaking && (
              <>
                <div className="font-semibold text-red-900 text-base">Tap to talk</div>
                <div className="text-xs text-muted-foreground mt-1">Hold a conversation, hands-free</div>
              </>
            )}
          </div>

          {/* Transcripts */}
          {lastHeard && (
            <div className="w-full rounded-xl bg-red-50 border border-red-100 p-3 shadow-soft">
              <div className="text-[10px] font-semibold uppercase text-red-600 mb-1 tracking-wide">You said</div>
              <div className="text-sm text-red-900">{lastHeard}</div>
            </div>
          )}
          {lastReply && (
            <div className="w-full rounded-xl bg-white border border-red-100 p-3 shadow-soft">
              <div className="text-[10px] font-semibold uppercase text-red-600 mb-1 tracking-wide flex items-center gap-1">
                <Bot className="size-3" /> ChikitSahayak replied
              </div>
              <div className="text-sm text-red-900">{lastReply}</div>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="bg-red-50/50 border-t border-red-100 px-5 py-3 text-center text-xs text-red-700/80">
          {!recognitionSupported
            ? "This browser uses cloud transcription for voice input."
            : "Just talk naturally in your language. I'll listen, think, and reply out loud."}
        </div>
      </div>
    </div>
  );
}
