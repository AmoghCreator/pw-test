"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { VoiceMode } from "@/lib/types";
import { SPEECH_RECOGNITION_LANG } from "@/lib/constants";
import { synthesizeSpeech } from "@/lib/api";

// ── Web Speech API type declarations (not always in dom lib) ──────────────────

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((event: Event) => void) | null;
    onend: ((event: Event) => void) | null;
    onerror: ((event: Event) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
}

export interface UseVoiceConversationReturn {
  voiceMode: VoiceMode;
  transcript: string;
  interimTranscript: string;
  canUseVoice: boolean;
  startListening: () => void;
  stopListening: () => void;
  speakText: (text: string) => Promise<void>;
  resetTranscript: () => void;
}

/** Detects if browser supports the Web Speech API */
function detectSpeechSupport(): boolean {
  return (
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
}

/** Plays a base64-encoded MP3 audio string via Web Audio */
function playBase64Audio(base64: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(`data:audio/mp3;base64,${base64}`);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Audio playback failed"));
    audio.play().catch(reject);
  });
}

/** Fallback speech synthesis using native Web Speech API */
function speakNative(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

/** Parses speech recognition event into final and interim strings */
function parseSpeechResults(event: SpeechRecognitionEvent): { final: string; interim: string } {
  let interim = "";
  let final = "";
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const text = event.results[i][0].transcript;
    if (event.results[i].isFinal) {
      final += text;
    } else {
      interim += text;
    }
  }
  return { final, interim };
}

/**
 * Voice conversation state machine hook.
 * Manages idle → listening → processing → speaking → listening continuous loop.
 */
export function useVoiceConversation(
  onTranscriptComplete: (text: string) => Promise<void>
): UseVoiceConversationReturn {
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [canUseVoice, setCanUseVoice] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const isLoopActiveRef = useRef<boolean>(false);
  const transcriptRef = useRef<string>("");
  const interimRef = useRef<string>("");
  const startRecognitionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanUseVoice(detectSpeechSupport());
    return () => {
      isMountedRef.current = false;
      isLoopActiveRef.current = false;
      recognitionRef.current?.abort();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const updateTranscript = useCallback((final: string, interim: string): void => {
    if (final) {
      setTranscript((prev) => {
        const next = `${prev} ${final}`.trim();
        transcriptRef.current = next;
        return next;
      });
      interimRef.current = "";
      setInterimTranscript("");
    } else if (interim) {
      interimRef.current = interim;
      setInterimTranscript(interim);
    }
  }, []);

  const submitTranscript = useCallback(
    async (finalText: string): Promise<void> => {
      if (!finalText.trim() || !isMountedRef.current) return;
      setVoiceMode("processing");
      transcriptRef.current = finalText;
      interimRef.current = "";
      setTranscript(finalText);
      setInterimTranscript("");
      await onTranscriptComplete(finalText);
    },
    [onTranscriptComplete]
  );

  const startRecognition = useCallback((): void => {
    if (!canUseVoice || !isMountedRef.current || !isLoopActiveRef.current) return;
    if (recognitionRef.current) try { recognitionRef.current.abort(); } catch {}
    const SpeechRecognitionAPI = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = SPEECH_RECOGNITION_LANG;
    recognition.onstart = () => { if (isMountedRef.current) setVoiceMode("listening"); };
    recognition.onerror = () => { if (isMountedRef.current && !isLoopActiveRef.current) setVoiceMode("idle"); };
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      if (!isMountedRef.current) return;
      const { final, interim } = parseSpeechResults(e);
      updateTranscript(final, interim);
    };
    recognition.onend = () => {
      if (!isMountedRef.current) return;
      const finalText = (transcriptRef.current || interimRef.current).trim();
      if (finalText) void submitTranscript(finalText);
      else if (isLoopActiveRef.current) setTimeout(() => { if (isMountedRef.current && isLoopActiveRef.current) startRecognitionRef.current?.(); }, 300);
      else setVoiceMode("idle");
    };
    recognition.start();
  }, [canUseVoice, submitTranscript, updateTranscript]);

  useEffect(() => {
    startRecognitionRef.current = startRecognition;
  }, [startRecognition]);

  const startListening = useCallback((): void => {
    if (!canUseVoice || voiceMode !== "idle") return;
    isLoopActiveRef.current = true;
    startRecognition();
  }, [canUseVoice, voiceMode, startRecognition]);

  const stopListening = useCallback((): void => {
    isLoopActiveRef.current = false;
    recognitionRef.current?.stop();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceMode("idle");
  }, []);

  const speakText = useCallback(async (text: string): Promise<void> => {
    if (!isMountedRef.current || !text) return;
    setVoiceMode("speaking");
    try {
      const audioContent = await synthesizeSpeech(text);
      await playBase64Audio(audioContent);
    } catch (err) {
      console.warn("[TTS] Cloud TTS failed, falling back to browser Web Speech API:", err);
      try { await speakNative(text); } catch {}
    } finally {
      if (isMountedRef.current) {
        if (isLoopActiveRef.current) {
          setTimeout(() => { if (isMountedRef.current && isLoopActiveRef.current) startRecognitionRef.current?.(); }, 300);
        } else {
          setVoiceMode("idle");
        }
      }
    }
  }, []);

  const resetTranscript = useCallback((): void => {
    transcriptRef.current = "";
    interimRef.current = "";
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    voiceMode,
    transcript,
    interimTranscript,
    canUseVoice,
    startListening,
    stopListening,
    speakText,
    resetTranscript,
  };
}
