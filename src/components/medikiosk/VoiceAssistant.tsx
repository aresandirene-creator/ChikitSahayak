"use client";

import { useEffect, useRef, useState } from "react";
import { useChikitsaHayakStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { toast } from "sonner";
import {
  Mic, X, Sparkles, Volume2, Loader2, Bot,
} from "lucide-react";

/**
 * Siri-like voice assistant — a floating orb that the patient can tap to
 * have a voice-only conversation with the AI. Speech in → ASR → LLM → TTS →
 * audio out, hands-free. Designed for elderly/uneducated users who can't
 * type or read.
 *
 * Uses the same /api/chat endpoint as the text chat so the conversation
 * history is shared with the HistoryStep.
 */
export function VoiceAssistant({ onClose }: { onClose: () => void }) {
  const patient = useChikitsaHayakStore((s) => s.patient);
  const encounterId = useChikitsaHayakStore((s) => s.encounterId);
  const uiLanguage = useChikitsaHayakStore((s) => s.uiLanguage);
  const { t } = useI18n();

  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [lastHeard, setLastHeard] = useState("");
  const [lastReply, setLastReply] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  // Auto-start listening when the panel opens
  useEffect(() => {
    startListening();
    return () => stopAll();
  }, []);

  const stopAll = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    } catch { /* ignore */ }
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
    }
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
    setListening(true);
    setLastHeard("");
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setListening(false);
  };

  const transcribeAndChat = async (blob: Blob) => {
    setThinking(true);
    try {
      // 1. ASR
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const asrRes = await fetch("/api/asr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: base64, mimeType: blob.type }),
      });
      const asrData = await asrRes.json();
      if (!asrRes.ok) throw new Error(asrData.error || "ASR failed");
      const transcript = (asrData.text ?? "").trim();
      if (!transcript || transcript === "#") {
        toast.error("No speech detected");
        setThinking(false);
        return;
      }
      setLastHeard(transcript);

      // 2. Chat with the AI
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient!.id,
          encounterId,
          message: transcript,
          withAudio: true,
        }),
      });
      const chatData = await chatRes.json();
      if (!chatRes.ok) throw new Error(chatData.error || "Chat failed");
      setLastReply(chatData.reply);

      // 3. Play the TTS audio
      if (chatData.audioBase64) {
        setSpeaking(true);
        const audio = audioElRef.current ?? new Audio();
        audioElRef.current = audio;
        audio.src = `data:audio/wav;base64,${chatData.audioBase64}`;
        audio.onended = () => {
          setSpeaking(false);
          // Auto-listen again for a conversational loop
          startListening();
        };
        audio.onpause = () => setSpeaking(false);
        await audio.play();
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setThinking(false);
    }
  };

  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white border border-red-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="size-5" />
            <span className="font-bold">Voice Assistant</span>
          </div>
          <button
            onClick={() => { stopAll(); onClose(); }}
            className="size-8 rounded-full hover:bg-white/20 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Orb */}
        <div className="p-8 flex flex-col items-center gap-4 bg-gradient-to-b from-red-50 to-white">
          <button
            onClick={listening ? stopListening : startListening}
            disabled={thinking || speaking}
            className={[
              "size-32 rounded-full flex items-center justify-center transition-all shadow-lg",
              listening
                ? "bg-red-600 text-white animate-pulse scale-110"
                : speaking
                  ? "bg-red-500 text-white"
                  : thinking
                    ? "bg-red-300 text-white"
                    : "bg-red-600 text-white hover:scale-105",
            ].join(" ")}
            aria-label={listening ? "Stop" : "Talk"}
          >
            {thinking ? (
              <Loader2 className="size-12 animate-spin" />
            ) : listening ? (
              <Mic className="size-12" />
            ) : speaking ? (
              <Volume2 className="size-12" />
            ) : (
              <Mic className="size-12" />
            )}
          </button>

          {/* Status */}
          <div className="text-center min-h-[60px]">
            {listening && (
              <>
                <div className="font-semibold text-red-900">Listening…</div>
                <div className="text-xs text-muted-foreground mt-1">Tap to stop, then I'll reply</div>
              </>
            )}
            {thinking && (
              <>
                <div className="font-semibold text-red-900">Thinking…</div>
                <div className="text-xs text-muted-foreground mt-1">Understanding what you said</div>
              </>
            )}
            {speaking && (
              <>
                <div className="font-semibold text-red-900">Speaking…</div>
                <div className="text-xs text-muted-foreground mt-1">Tap the orb to interrupt</div>
              </>
            )}
            {!listening && !thinking && !speaking && (
              <>
                <div className="font-semibold text-red-900">Tap to talk</div>
                <div className="text-xs text-muted-foreground mt-1">Hold a conversation, hands-free</div>
              </>
            )}
          </div>

          {/* Transcripts */}
          {lastHeard && (
            <div className="w-full rounded-xl bg-red-50 border border-red-200 p-3">
              <div className="text-[10px] font-semibold uppercase text-red-700 mb-1">You said</div>
              <div className="text-sm text-red-900">{lastHeard}</div>
            </div>
          )}
          {lastReply && (
            <div className="w-full rounded-xl bg-white border border-red-100 p-3 shadow-sm">
              <div className="text-[10px] font-semibold uppercase text-red-700 mb-1 flex items-center gap-1">
                <Bot className="size-3" /> ChikitsaHayak replied
              </div>
              <div className="text-sm text-red-900">{lastReply}</div>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="bg-red-50 border-t border-red-100 px-5 py-3 text-center text-xs text-red-700">
          Just talk naturally in your language. I'll listen, think, and reply out loud.
        </div>
      </div>
    </div>
  );
}
