"use client";

import { useEffect, useRef, useState } from "react";
import { useChikitsaHayakStore } from "@/lib/store";
import { useContinueHandler } from "@/lib/use-continue-handler";
import { useI18n } from "@/lib/use-i18n";
import { useUiMode } from "@/lib/use-ui-mode";
import { useSpeech } from "@/lib/use-speech";
import { useSpeechRecognition } from "@/lib/use-speech-recognition";
import { getLanguageNativeName } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { HISTORY_SECTIONS } from "@/lib/languages";
import { QuickSymptomPanel } from "@/components/medikiosk/QuickSymptomPanel";
import type { ChatTurn } from "@/lib/types";
import {
  Mic, StopCircle, Send, Volume2, VolumeX, Sparkles, Bot, User,
  AlertTriangle, Stethoscope, PlayCircle, Hand, CheckCircle2, Leaf,
  MessageSquareHeart, Radio,
} from "lucide-react";

const SECTION_LABELS: Record<string, { label: string; short: string }> = Object.fromEntries(
  HISTORY_SECTIONS.map((s) => [s.id, { label: s.label, short: s.short }])
);

export function HistoryStep() {
  const patient = useChikitsaHayakStore((s) => s.patient);
  const encounterId = useChikitsaHayakStore((s) => s.encounterId);
  const turns = useChikitsaHayakStore((s) => s.turns);
  const addTurn = useChikitsaHayakStore((s) => s.addTurn);
  const isAiThinking = useChikitsaHayakStore((s) => s.isAiThinking);
  const setIsAiThinking = useChikitsaHayakStore((s) => s.setIsAiThinking);
  const currentSection = useChikitsaHayakStore((s) => s.currentSection);
  const setCurrentSection = useChikitsaHayakStore((s) => s.setCurrentSection);
  const historyComplete = useChikitsaHayakStore((s) => s.historyComplete);
  const setHistoryComplete = useChikitsaHayakStore((s) => s.setHistoryComplete);
  const redFlags = useChikitsaHayakStore((s) => s.redFlags);
  const addRedFlags = useChikitsaHayakStore((s) => s.addRedFlags);
  const voiceEnabled = useChikitsaHayakStore((s) => s.voiceEnabled);
  const setVoiceEnabled = useChikitsaHayakStore((s) => s.setVoiceEnabled);
  const voicePlaying = useChikitsaHayakStore((s) => s.voicePlaying);
  const setVoicePlaying = useChikitsaHayakStore((s) => s.setVoicePlaying);
  const nextStep = useChikitsaHayakStore((s) => s.nextStep);
  const { t } = useI18n();
  const { graphical } = useUiMode();
  const { speak, cancel: cancelSpeech, speaking: speechSpeaking } = useSpeech();
  const {
    start: startRecognition,
    stop: stopRecognition,
    listening: recognitionListening,
    transcript: recognitionTranscript,
    error: recognitionError,
    supported: recognitionSupported,
    clear: clearRecognition,
  } = useSpeechRecognition();

  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [turns.length, isAiThinking]);

  // Play AI reply via the browser's Web Speech API — Google AI Studio-quality
  // Indian-language voices (Google हिन्दी, Google தமிழ், etc.) on Chrome/Edge.
  // Server TTS has been removed entirely; this is the only voice output path.
  const playAudio = (replyText: string, lang: string) => {
    if (!voiceEnabled || !replyText) return;
    speak(replyText, lang || patient?.language || "en");
  };

  const stopAudio = () => {
    cancelSpeech();
    setVoicePlaying(false);
  };

  // Sync the Web Speech API speaking state with the store
  useEffect(() => {
    setVoicePlaying(speechSpeaking);
  }, [speechSpeaking]);

  const sendMessage = async (messageText: string) => {
    if (!patient || !messageText.trim() || isAiThinking) return;
    setIsAiThinking(true);
    stopAudio();

    const userTurn: ChatTurn = {
      id: `local-${Date.now()}`,
      role: "user",
      content: messageText,
      section: currentSection || "general",
      language: patient.language,
      createdAt: new Date().toISOString(),
    };
    addTurn(userTurn);
    setText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          encounterId,
          message: messageText,
          // TTS is client-side via the Web Speech API — no server audio needed
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");

      const aiTurn: ChatTurn = {
        id: data.messageId ?? `ai-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        section: data.section || "general",
        language: data.language || patient.language,
        createdAt: new Date().toISOString(),
      };
      addTurn(aiTurn);
      if (data.section) setCurrentSection(data.section);
      if (data.redFlags && data.redFlags.length > 0) {
        addRedFlags(
          data.redFlags.map((r: { symptom: string; severity: string; reasoning?: string; id?: string; acknowledged?: boolean; createdAt?: string }) => ({
            id: r.id ?? `rf-${Date.now()}-${Math.random()}`,
            symptom: r.symptom,
            severity: r.severity as "mild" | "moderate" | "severe" | "critical",
            reasoning: r.reasoning,
            acknowledged: false,
            createdAt: r.createdAt ?? new Date().toISOString(),
          }))
        );
        toast.error(`${t("redFlagAlertTitle")}: ${data.redFlags[0].symptom}`);
      }
      if (data.done) {
        setHistoryComplete(true);
        toast.success(t("historyDone"));
      }
      // Speak the AI reply via the browser's Web Speech API (Google AI Studio voices)
      if (voiceEnabled && data.reply) {
        playAudio(data.reply, data.language || patient.language);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsAiThinking(false);
    }
  };

  const kickOffConversation = async () => {
    if (!patient || turns.length > 0 || isAiThinking) return;
    await sendMessage("Hello, I am ready to begin sharing my health concerns.");
  };

  useContinueHandler(() => {
    nextStep();
  });

  useEffect(() => {
    if (patient && turns.length === 0 && !isAiThinking) {
      kickOffConversation();
    }
  }, [patient?.id, encounterId]);

  // Pick the first audio mimeType the browser supports that ZAI ASR also
  // accepts (WAV and WebM). This prevents browsers that default to audio/ogg
  // or audio/mp4 from sending an unsupported format.
  const pickRecordingMime = (): string => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/wav",
      "audio/wave",
      "audio/x-wav",
    ];
    for (const m of candidates) {
      try {
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) {
          return m;
        }
      } catch {
        /* ignore */
      }
    }
    return "audio/webm"; // fallback
  };

  // Robust base64 of an ArrayBuffer (handles large buffers without stack overflow)
  const arrayBufferToBase64 = (buf: ArrayBuffer): string => {
    const bytes = new Uint8Array(buf);
    const CHUNK = 0x8000; // 32KB chunks
    let binary = "";
    for (let i = 0; i < bytes.length; i += CHUNK) {
      const slice = bytes.subarray(i, i + CHUNK);
      binary += String.fromCharCode.apply(null, Array.from(slice) as number[]);
    }
    return btoa(binary);
  };

  const startRecording = async () => {
    stopAudio();
    clearRecognition();

    // PRIMARY: use the browser's SpeechRecognition API — it natively
    // understands all 12 Indian languages (hi-IN, ta-IN, etc.) with Google's
    // recognition quality on Chrome/Edge. The server ZAI ASR is Mandarin-
    // focused and misrecognizes Indian speech as Chinese, so we only fall
    // back to it when the browser doesn't support SpeechRecognition.
    if (recognitionSupported) {
      setRecording(true);
      startRecognition(patient?.language || "en");
      return;
    }

    // FALLBACK: MediaRecorder + server ZAI ASR (Mandarin-focused — may
    // misrecognize non-English/Chinese speech). Used on Firefox etc.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
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
          toast.error("Recording too short — please hold the mic longer.");
          setTranscribing(false);
          return;
        }
        await transcribeBlob(blob);
      };
      mr.start(250);
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (e) {
      console.error("mic error", e);
      toast.error("Microphone access failed. You can type instead.");
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionSupported) {
      stopRecognition();
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  // When the browser SpeechRecognition produces a transcript, prefill the
  // input box (the user reviews then taps Send).
  useEffect(() => {
    if (recognitionTranscript) {
      setText(recognitionTranscript);
      setRecording(false);
      toast.success("Transcribed");
    }
  }, [recognitionTranscript]);

  // Surface recognition errors
  useEffect(() => {
    if (recognitionError) {
      setRecording(false);
      toast.error(recognitionError === "no-speech" ? "No speech detected" : recognitionError);
    }
  }, [recognitionError]);

  // Sync recognition listening state with the recording flag
  useEffect(() => {
    if (recognitionSupported) setRecording(recognitionListening);
  }, [recognitionListening, recognitionSupported]);

  const transcribeBlob = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const res = await fetch("/api/asr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: base64, mimeType: blob.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ASR failed");
      const transcript = (data.text ?? "").trim();
      // ASR sometimes returns "#" or empty for silence/noise — treat as no speech
      if (transcript && transcript !== "#" && transcript.length > 1) {
        setText(transcript);
        toast.success("Transcribed");
      } else {
        toast.error("No speech detected");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setTranscribing(false);
    }
  };

  if (!patient) {
    return <div className="text-center py-16 text-muted-foreground">{t("identifyTitle")}</div>;
  }

  const sectionInfo = SECTION_LABELS[currentSection] ?? { label: t("historyBadge"), short: "" };

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
      {/* Main chat column */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-100 rounded-full px-3 py-1">
            <Sparkles className="size-3.5" /> {t("historyBadge")}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-red-900">{t("historyTitle")}</h2>
            {patient.ayushMode && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Leaf className="size-3 mr-1" /> AYUSH
              </Badge>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">
            {t("historySubtitle", { lang: getLanguageNativeName(patient.language) })}
          </p>
        </div>

        {/* Section indicator + voice toggle */}
        <div className="flex items-center justify-between gap-3 rounded-xl bg-white border border-red-100 px-4 py-2.5 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <Stethoscope className="size-4 text-red-600 shrink-0" />
            <div className="text-xs text-muted-foreground shrink-0">{t("historyCurrentSection")}:</div>
            <Badge className="bg-red-100 text-red-800 border-red-200 truncate font-medium">
              {sectionInfo.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Label htmlFor="voice-toggle" className="text-xs text-red-800 cursor-pointer hidden sm:flex items-center gap-1">
              {voiceEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
              {t("historyVoiceLabel")}
            </Label>
            <Switch
              id="voice-toggle"
              checked={voiceEnabled}
              onCheckedChange={(c) => {
                setVoiceEnabled(c);
                if (!c) stopAudio();
              }}
            />
          </div>
        </div>

        {/* Chat scroll area */}
        <Card className="border-red-100 shadow-sm flex flex-col">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto scrollbar-thin max-h-[55vh] min-h-[280px] p-4 space-y-3"
          >
            {turns.length === 0 && !isAiThinking && (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Bot className="size-12 text-red-300 mb-3" />
                <p className="text-muted-foreground">{t("historyStarting")}</p>
              </div>
            )}

            {turns.map((turn) => (
              <div
                key={turn.id}
                className={[
                  "flex gap-3 items-start",
                  turn.role === "user" ? "flex-row-reverse" : "",
                ].join(" ")}
              >
                <div
                  className={[
                    "rounded-full flex items-center justify-center shrink-0",
                    graphical ? "size-12" : "size-8",
                    turn.role === "user"
                      ? "bg-red-600 text-white"
                      : "bg-red-100 text-red-700 border border-red-200",
                  ].join(" ")}
                >
                  {turn.role === "user" ? <User className={graphical ? "size-7" : "size-4"} /> : <Bot className={graphical ? "size-7" : "size-4"} />}
                </div>
                <div
                  className={[
                    "rounded-2xl px-4 py-2.5 max-w-[80%] leading-relaxed",
                    graphical ? "text-base" : "text-sm",
                    turn.role === "user"
                      ? "bg-red-600 text-white rounded-tr-sm"
                      : "bg-red-50 text-red-900 border border-red-100 rounded-tl-sm",
                  ].join(" ")}
                >
                  <p className="whitespace-pre-wrap">{turn.content}</p>
                </div>
              </div>
            ))}

            {isAiThinking && (
              <div className="flex gap-3 items-start">
                <div className={["rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center justify-center shrink-0", graphical ? "size-12" : "size-8"].join(" ")}>
                  <Bot className={graphical ? "size-7" : "size-4"} />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-red-50 border border-red-100 rounded-tl-sm">
                  <div className="flex gap-1.5">
                    <span className="size-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="size-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="size-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <CardContent className="border-t border-red-100 p-3 space-y-2">
            {/* Graphical mode: quick-symptom tap panel (shows big body-part
                icons the patient can tap instead of typing) */}
            {graphical && (
              <QuickSymptomPanel
                onPick={(msg) => sendMessage(msg)}
                disabled={isAiThinking || recording || transcribing || historyComplete}
              />
            )}
            <div className="flex items-end gap-2">
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={isAiThinking || transcribing || historyComplete}
                className={[
                  "shrink-0 size-14 rounded-full flex items-center justify-center transition-all shadow-sm",
                  recording
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-red-600 text-white hover:bg-red-700",
                  (isAiThinking || transcribing || historyComplete) ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
                aria-label={recording ? t("historyMicStop") : t("historyMicStart")}
              >
                {transcribing ? (
                  <Sparkles className="size-6 animate-spin" />
                ) : recording ? (
                  <StopCircle className="size-6" />
                ) : (
                  <Mic className="size-6" />
                )}
              </button>

              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(text);
                  }
                }}
                placeholder={
                  recording
                    ? t("historyInputPlaceholderRecording")
                    : transcribing
                      ? t("historyInputPlaceholderTranscribing")
                      : t("historyInputPlaceholder")
                }
                rows={2}
                disabled={isAiThinking || recording || transcribing || historyComplete}
                className="flex-1 resize-none border-red-200 focus-visible:ring-red-500/30"
              />

              <Button
                size="lg"
                onClick={() => sendMessage(text)}
                disabled={!text.trim() || isAiThinking || recording || transcribing || historyComplete}
                className="bg-red-600 hover:bg-red-700 text-white size-14 p-0 shrink-0"
                aria-label={t("historySend")}
              >
                <Send className="size-6" />
              </Button>
            </div>

            {voicePlaying && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-1.5">
                <Volume2 className="size-3.5 animate-pulse" />
                {t("historyAiSpeaking")}
                <button onClick={stopAudio} className="ml-auto font-medium hover:underline">
                  {t("historyAiSpeakingStop")}
                </button>
              </div>
            )}

            {historyComplete && (
              <div className="flex items-center gap-2 rounded-lg bg-red-100 border border-red-300 px-3 py-2 text-sm text-red-800">
                <CheckCircle2 className="size-4" />
                {t("historyDoneDesc")}
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="ml-auto bg-red-600 hover:bg-red-700 text-white h-7"
                >
                  {t("continue")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Side panel */}
      <div className="space-y-4">
        {/* Red flags */}
        <Card className={[
          "border-2 shadow-sm",
          redFlags.length > 0 ? "border-red-200 bg-red-50/30" : "border-red-100",
        ].join(" ")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={["size-5", redFlags.length > 0 ? "text-red-600" : "text-red-600"].join(" ")} />
              <h3 className="font-semibold text-red-900">{t("historyRedFlagTitle")}</h3>
            </div>
            {redFlags.length === 0 ? (
              <div className="text-sm text-red-700/70 italic">{t("historyRedFlagEmpty")}</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
                {redFlags.map((f) => (
                  <div key={f.id} className="rounded-lg bg-white border border-red-200 px-3 py-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-red-700 uppercase">{f.severity}</span>
                      <span className="text-sm font-medium text-red-900">{f.symptom}</span>
                    </div>
                    {f.reasoning && <p className="text-xs text-red-700/80 mt-1">{f.reasoning}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-red-100 bg-red-50/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Hand className="size-5 text-red-700" />
              <h3 className="font-semibold text-red-900">{t("historyTipsTitle")}</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
              <li>{t("historyTips1")}</li>
              <li>{t("historyTips2")}</li>
              <li>{t("historyTips3")}</li>
              <li>{t("historyTips4")}</li>
              <li>{t("historyTips5")}</li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-[11px] text-muted-foreground text-center px-2 flex items-center justify-center gap-1">
          <MessageSquareHeart className="size-3" />
          {t("historyDisclaimer")}
        </div>
      </div>
    </div>
  );
}
