"use client";

import { useEffect, useRef, useState } from "react";
import { useMediKioskStore } from "@/lib/store";
import { useContinueHandler } from "@/lib/use-continue-handler";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getLanguageName, getLanguageNativeName, HISTORY_SECTIONS } from "@/lib/languages";
import type { ChatTurn } from "@/lib/types";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  AlertTriangle,
  Stethoscope,
  PlayCircle,
  StopCircle,
  Leaf,
  CheckCircle2,
  Hand,
} from "lucide-react";

const SECTION_LABELS: Record<string, { label: string; short: string }> = Object.fromEntries(
  HISTORY_SECTIONS.map((s) => [s.id, { label: s.label, short: s.short }])
);

export function HistoryStep() {
  const patient = useMediKioskStore((s) => s.patient);
  const turns = useMediKioskStore((s) => s.turns);
  const addTurn = useMediKioskStore((s) => s.addTurn);
  const isAiThinking = useMediKioskStore((s) => s.isAiThinking);
  const setIsAiThinking = useMediKioskStore((s) => s.setIsAiThinking);
  const currentSection = useMediKioskStore((s) => s.currentSection);
  const setCurrentSection = useMediKioskStore((s) => s.setCurrentSection);
  const historyComplete = useMediKioskStore((s) => s.historyComplete);
  const setHistoryComplete = useMediKioskStore((s) => s.setHistoryComplete);
  const redFlags = useMediKioskStore((s) => s.redFlags);
  const addRedFlags = useMediKioskStore((s) => s.addRedFlags);
  const voiceEnabled = useMediKioskStore((s) => s.voiceEnabled);
  const setVoiceEnabled = useMediKioskStore((s) => s.setVoiceEnabled);
  const voicePlaying = useMediKioskStore((s) => s.voicePlaying);
  const setVoicePlaying = useMediKioskStore((s) => s.setVoicePlaying);
  const nextStep = useMediKioskStore((s) => s.nextStep);

  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [turns.length, isAiThinking]);

  // If first time entering and no turns yet, kick off the conversation
  const kickOffConversation = async () => {
    if (!patient || turns.length > 0 || isAiThinking) return;
    await sendMessage("Hello, I am ready to begin sharing my health concerns.");
  };

  // Footer "Continue" → go to documents step (history can be resumed)
  useContinueHandler(() => {
    nextStep();
  });

  useEffect(() => {
    // Auto-start the AI conversation when entering this step
    if (patient && turns.length === 0 && !isAiThinking) {
      kickOffConversation();
    }
  }, [patient?.id]);

  const playAudio = (base64: string) => {
    if (!voiceEnabled || !base64) return;
    try {
      const audio = audioElRef.current ?? new Audio();
      audioElRef.current = audio;
      audio.src = `data:audio/wav;base64,${base64}`;
      audio.onplay = () => setVoicePlaying(true);
      audio.onended = () => setVoicePlaying(false);
      audio.onpause = () => setVoicePlaying(false);
      audio.onerror = () => setVoicePlaying(false);
      audio.play().catch((e) => console.error("audio play failed", e));
    } catch (e) {
      console.error("audio playback error", e);
    }
  };

  const stopAudio = () => {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
    }
    setVoicePlaying(false);
  };

  const sendMessage = async (messageText: string) => {
    if (!patient || !messageText.trim() || isAiThinking) return;
    setIsAiThinking(true);
    stopAudio();

    // Optimistic user turn
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
          message: messageText,
          withAudio: voiceEnabled,
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
        toast.error(`Red-flag detected: ${data.redFlags[0].symptom}`);
      }
      if (data.done) {
        setHistoryComplete(true);
        toast.success("History taking complete — you can proceed to documents");
      }
      if (voiceEnabled && data.audioBase64) {
        playAudio(data.audioBase64);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeBlob(blob);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      stopAudio();
    } catch (e) {
      console.error("mic error", e);
      toast.error("Microphone access failed. You can type instead.");
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const transcribeBlob = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const res = await fetch("/api/asr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: base64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ASR failed");
      const transcript = (data.text ?? "").trim();
      if (transcript) {
        setText(transcript);
        toast.success("Transcribed — review and send");
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
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Please identify the patient first.</p>
      </div>
    );
  }

  const sectionInfo = SECTION_LABELS[currentSection] ?? { label: "General intake", short: "General" };

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
      {/* Main chat column */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1">
            <Sparkles className="size-3.5" /> Step 3 · AI Conversational History
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-900">
              Let&apos;s talk about your health
            </h2>
            {patient.ayushMode && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Leaf className="size-3 mr-1" /> AYUSH mode
              </Badge>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">
            MediKiosk speaks <span className="font-medium text-emerald-800">{getLanguageName(patient.language)}</span>
            <span className="text-emerald-700/60 ml-1">({getLanguageNativeName(patient.language)})</span>. Speak or type —
            the AI asks adaptive follow-up questions to build your history for the doctor.
          </p>
        </div>

        {/* Section indicator + voice toggle */}
        <div className="flex items-center justify-between gap-3 rounded-xl bg-white border border-emerald-100 px-4 py-2.5 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <Stethoscope className="size-4 text-emerald-600 shrink-0" />
            <div className="text-xs text-muted-foreground shrink-0">Current section:</div>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 truncate font-medium">
              {sectionInfo.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Label htmlFor="voice-toggle" className="text-xs text-emerald-800 cursor-pointer hidden sm:flex items-center gap-1">
              {voiceEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
              AI voice
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
        <Card className="border-emerald-100 shadow-sm flex flex-col">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto scrollbar-thin max-h-[55vh] min-h-[280px] p-4 space-y-3"
          >
            {turns.length === 0 && !isAiThinking && (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Bot className="size-12 text-emerald-300 mb-3" />
                <p className="text-muted-foreground">Starting conversation…</p>
              </div>
            )}

            {turns.map((t) => (
              <div
                key={t.id}
                className={[
                  "flex gap-3 items-start",
                  t.role === "user" ? "flex-row-reverse" : "",
                ].join(" ")}
              >
                <div
                  className={[
                    "size-8 rounded-full flex items-center justify-center shrink-0",
                    t.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-100 text-emerald-700 border border-emerald-200",
                  ].join(" ")}
                >
                  {t.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                </div>
                <div
                  className={[
                    "rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed",
                    t.role === "user"
                      ? "bg-emerald-600 text-white rounded-tr-sm"
                      : "bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-tl-sm",
                  ].join(" ")}
                >
                  <p className="whitespace-pre-wrap">{t.content}</p>
                </div>
              </div>
            ))}

            {isAiThinking && (
              <div className="flex gap-3 items-start">
                <div className="size-8 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-tl-sm">
                  <div className="flex gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="size-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="size-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <CardContent className="border-t border-emerald-100 p-3 space-y-2">
            <div className="flex items-end gap-2">
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={isAiThinking || transcribing || historyComplete}
                className={[
                  "shrink-0 size-12 rounded-full flex items-center justify-center transition-all shadow-sm",
                  recording
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-emerald-600 text-white hover:bg-emerald-700",
                  (isAiThinking || transcribing || historyComplete) ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
                aria-label={recording ? "Stop recording" : "Start voice input"}
              >
                {transcribing ? (
                  <Sparkles className="size-5 animate-spin" />
                ) : recording ? (
                  <StopCircle className="size-5" />
                ) : (
                  <Mic className="size-5" />
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
                    ? "Listening… tap the mic to stop"
                    : transcribing
                      ? "Transcribing your speech…"
                      : "Type your answer, or tap the mic to speak"
                }
                rows={2}
                disabled={isAiThinking || recording || transcribing || historyComplete}
                className="flex-1 resize-none border-emerald-200 focus-visible:ring-emerald-500/30"
              />

              <Button
                size="lg"
                onClick={() => sendMessage(text)}
                disabled={!text.trim() || isAiThinking || recording || transcribing || historyComplete}
                className="bg-emerald-600 hover:bg-emerald-700 text-white size-12 p-0 shrink-0"
                aria-label="Send"
              >
                <Send className="size-5" />
              </Button>
            </div>

            {voicePlaying && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-1.5">
                <Volume2 className="size-3.5 animate-pulse" />
                AI is speaking…
                <button onClick={stopAudio} className="ml-auto font-medium hover:underline">
                  Stop
                </button>
              </div>
            )}

            {historyComplete && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-100 border border-emerald-300 px-3 py-2 text-sm text-emerald-800">
                <CheckCircle2 className="size-4" />
                History complete. You can continue the conversation or proceed to scan documents.
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white h-7"
                >
                  Continue
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Side panel: red flags + tips */}
      <div className="space-y-4">
        {/* Red flags */}
        <Card className={[
          "border-2 shadow-sm",
          redFlags.length > 0 ? "border-red-200 bg-red-50/30" : "border-emerald-100",
        ].join(" ")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={["size-5", redFlags.length > 0 ? "text-red-600" : "text-emerald-600"].join(" ")} />
              <h3 className="font-semibold text-emerald-900">Red-flag alerts</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              AI detects potentially urgent symptoms and alerts triage staff.
            </p>
            {redFlags.length === 0 ? (
              <div className="text-sm text-emerald-700/70 italic">No red flags detected yet.</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
                {redFlags.map((f) => (
                  <div key={f.id} className="rounded-lg bg-white border border-red-200 px-3 py-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-red-700 uppercase">{f.severity}</span>
                      <span className="text-sm font-medium text-red-900">{f.symptom}</span>
                    </div>
                    {f.reasoning && (
                      <p className="text-xs text-red-700/80 mt-1">{f.reasoning}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-emerald-100 bg-emerald-50/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Hand className="size-5 text-emerald-700" />
              <h3 className="font-semibold text-emerald-900">How to use this step</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
              <li>Tap <Mic className="inline size-3.5 text-emerald-700" /> to <span className="font-medium text-emerald-800">speak</span> your answer — it is transcribed automatically.</li>
              <li>Or type your answer and press Enter to send.</li>
              <li>The AI asks one short question at a time across HPI, past history, medications, allergies, family history, ROS and social history.</li>
              <li>Toggle the speaker to hear the AI read its questions aloud.</li>
              <li>You can move to the next step at any time — history-taking can continue if you return.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-[11px] text-muted-foreground text-center px-2">
          MediKiosk never diagnoses. The AI only collects history for the doctor to review.
        </div>
      </div>
    </div>
  );
}
