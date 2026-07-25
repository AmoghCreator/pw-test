"use client";

import React, { useState, useCallback } from "react";
import { EMOTION_TAPS, DEFAULT_USER_PROFILE } from "@/lib/constants";
import type { EmotionTap, InputType, VoiceMode } from "@/lib/types";
import type { ValidatedGenerateRequest } from "@/lib/validators";

interface SanctuaryInputFormProps {
  onSubmit: (request: ValidatedGenerateRequest) => Promise<void>;
  isLoading: boolean;
  onCrisisTrigger: () => void;
  voiceMode: VoiceMode;
  transcript: string;
  interimTranscript: string;
  canUseVoice: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

/** Renders the animated voice waveform bars */
function VoiceWaveform(): React.JSX.Element {
  return (
    <span aria-hidden="true" className="flex items-end gap-[3px] h-5">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-[3px] bg-teal-400 rounded-full animate-voice-wave"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </span>
  );
}

/** Renders the speaking pulsing indicator */
function SpeakingIndicator(): React.JSX.Element {
  return (
    <span aria-hidden="true" className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-speaker-pulse" />
      <span className="w-2 h-2 rounded-full bg-teal-300 animate-speaker-pulse [animation-delay:0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-teal-200 animate-speaker-pulse [animation-delay:0.3s]" />
    </span>
  );
}

/** Emotion taps fieldset */
function EmotionOrbs({
  selected,
  onSelect,
  disabled,
}: {
  selected: EmotionTap | null;
  onSelect: (tap: EmotionTap) => void;
  disabled: boolean;
}): React.JSX.Element {
  return (
    <fieldset className="border border-slate-800 rounded-2xl p-5 bg-slate-900 shadow-md">
      <legend className="text-xs uppercase font-bold text-slate-400 px-2 tracking-wider">
        One-Tap Emotion Check-in
      </legend>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        {EMOTION_TAPS.map((tap) => {
          const isTapSelected = selected === tap;
          const emoji =
            tap === "Anxious" ? "🌧" :
            tap === "Cravings" ? "⚡" :
            tap === "Restless" ? "🌀" : "💬";
          return (
            <button
              key={tap}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(tap)}
              className={`py-3.5 px-4 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                isTapSelected
                  ? "bg-teal-600 text-white border-2 border-teal-300 shadow-lg shadow-teal-500/20 scale-[1.02]"
                  : "bg-slate-950 text-slate-200 border border-slate-800 hover:bg-slate-800 hover:border-slate-700"
              }`}
            >
              <span aria-hidden="true" className="mr-2 text-base">{emoji}</span>
              {tap}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Tap-to-speak section with live transcript */
function LiveVoiceSection({
  voiceMode,
  transcript,
  interimTranscript,
  canUseVoice,
  onStart,
  onStop,
  disabled,
}: {
  voiceMode: VoiceMode;
  transcript: string;
  interimTranscript: string;
  canUseVoice: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled: boolean;
}): React.JSX.Element {
  const isListening = voiceMode === "listening";
  const isSpeaking = voiceMode === "speaking";
  const isProcessing = voiceMode === "processing";
  const liveText = transcript || interimTranscript;

  function getMicLabel(): string {
    if (isListening) return "Stop listening";
    if (isSpeaking) return "Gemini is speaking...";
    if (isProcessing) return "Processing your check-in...";
    return "Tap to speak";
  }

  function getStatusText(): string {
    if (isListening) return "Listening... speak naturally";
    if (isSpeaking) return "Gemini is responding to you";
    if (isProcessing) return "Analyzing with Gemini...";
    if (liveText) return "Tap again to continue speaking";
    return canUseVoice ? "Tap the mic to speak — no typing needed" : "Hold to record (keyboard shortcut: Spacebar)";
  }

  return (
    <div className="border border-slate-800 rounded-2xl p-5 bg-slate-900 shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>🎙</span> Voice Check-in
            {canUseVoice && (
              <span className="text-[10px] font-normal text-teal-400 bg-teal-950 border border-teal-800 px-2 py-0.5 rounded-full">
                Live Transcription
              </span>
            )}
          </h3>
          <p
            id="voice-status-text"
            role="status"
            aria-live="polite"
            className="text-xs text-slate-400 mt-0.5"
          >
            {getStatusText()}
          </p>
        </div>

        <button
          type="button"
          disabled={disabled || isProcessing}
          onClick={isListening ? onStop : onStart}
          aria-label={getMicLabel()}
          aria-pressed={isListening}
          aria-describedby="voice-status-text"
          className={`relative w-14 h-14 rounded-full font-bold text-sm transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-lg flex-shrink-0 ${
            isListening
              ? "bg-red-600 text-white shadow-red-500/40 ring-4 ring-red-400/30"
              : isSpeaking
              ? "bg-teal-700 text-white shadow-teal-500/30 cursor-not-allowed"
              : isProcessing
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-teal-600 hover:bg-teal-500 text-white shadow-teal-500/20 hover:scale-105 active:scale-95"
          }`}
        >
          {isListening && (
            <span className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping" aria-hidden="true" />
          )}
          <span aria-hidden="true" className="text-xl">
            {isListening ? "⏹" : isSpeaking ? "🔊" : "🎙"}
          </span>
        </button>
      </div>

      {/* Live transcript display */}
      {(isListening || liveText) && (
        <div
          className={`rounded-xl p-3.5 border transition-all ${
            isListening
              ? "bg-slate-950 border-teal-700/60 shadow-inner"
              : "bg-slate-950 border-slate-800"
          }`}
          aria-label="Live transcript"
          role="region"
        >
          <div className="flex items-center gap-2 mb-2">
            {isListening && <VoiceWaveform />}
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
              {isListening ? "Transcribing..." : "Transcript"}
            </span>
          </div>
          <p className="text-sm text-slate-100 leading-relaxed min-h-[1.5rem]">
            {transcript && <span>{transcript} </span>}
            {interimTranscript && (
              <span className="text-slate-400 italic">{interimTranscript}</span>
            )}
            {!liveText && isListening && (
              <span className="text-slate-600 italic">Waiting for speech...</span>
            )}
          </p>
        </div>
      )}

      {/* TTS speaking indicator */}
      {isSpeaking && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 bg-teal-950/50 border border-teal-800/60 rounded-xl px-4 py-3"
        >
          <SpeakingIndicator />
          <span className="text-sm text-teal-300 font-medium">
            Gemini is speaking to you...
          </span>
        </div>
      )}
    </div>
  );
}

/** Image input field */
function ImageSection({
  imageName,
  onImageChange,
  disabled,
}: {
  imageName: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}): React.JSX.Element {
  return (
    <div className="border border-slate-800 rounded-2xl p-5 bg-slate-900 shadow-md">
      <label
        htmlFor="sanctuary-image-upload"
        className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2"
      >
        Webcam / Photo Check-in (Optional)
      </label>
      <input
        id="sanctuary-image-upload"
        type="file"
        accept="image/*"
        disabled={disabled}
        onChange={onImageChange}
        className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-teal-300 hover:file:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-slate-800 rounded-xl p-1 bg-slate-950"
      />
      {imageName && (
        <p className="text-xs text-teal-400 font-semibold mt-2">
          Loaded image: {imageName}
        </p>
      )}
    </div>
  );
}

/** Main Sanctuary Input Form container */
export function SanctuaryInputForm({
  onSubmit,
  isLoading,
  onCrisisTrigger,
  voiceMode,
  transcript,
  interimTranscript,
  canUseVoice,
  onStartListening,
  onStopListening,
}: SanctuaryInputFormProps): React.JSX.Element {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionTap | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [imageName, setImageName] = useState<string | null>(null);

  const isDisabled = isLoading || voiceMode === "processing" || voiceMode === "speaking";

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        setImageBase64(base64);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  async function handleFormSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const inputType: InputType = transcript
      ? "voice"
      : imageBase64
      ? "image"
      : selectedEmotion
      ? "emotion"
      : "emotion"; // Default to general check-in, NOT crisis
    await onSubmit({
      userId: "sanctuary-user-01",
      inputType,
      emotionTap: selectedEmotion ?? undefined,
      audioBase64: undefined,
      imageBase64,
      transcriptText: transcript || undefined,
      userProfile: {
        name: DEFAULT_USER_PROFILE.name,
        substanceType: DEFAULT_USER_PROFILE.substanceType,
        comfortTriggers: [...DEFAULT_USER_PROFILE.comfortTriggers],
        copingMechanisms: [...DEFAULT_USER_PROFILE.copingMechanisms],
        safeContact: DEFAULT_USER_PROFILE.safeContact,
      },
    });
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">The Sanctuary — Check-In</h2>
        <button
          type="button"
          onClick={onCrisisTrigger}
          className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-bold text-xs rounded-lg shadow-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <span aria-hidden="true">🚨</span> Overwhelmed / Crisis Mode
        </button>
      </div>
      <EmotionOrbs
        selected={selectedEmotion}
        onSelect={setSelectedEmotion}
        disabled={isDisabled}
      />
      <LiveVoiceSection
        voiceMode={voiceMode}
        transcript={transcript}
        interimTranscript={interimTranscript}
        canUseVoice={canUseVoice}
        onStart={onStartListening}
        onStop={onStopListening}
        disabled={isDisabled}
      />
      <ImageSection
        imageName={imageName}
        onImageChange={handleImageChange}
        disabled={isDisabled}
      />
      <button
        type="submit"
        disabled={isDisabled}
        aria-busy={isLoading}
        className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
      >
        {isLoading ? "Analyzing with Gemini..." : "Submit Check-in"}
      </button>
    </form>
  );
}
