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
        <span key={i} className="w-[3px] bg-teal-400 rounded-full animate-voice-wave" style={{ animationDelay: `${i * 0.1}s` }} />
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

/** Single emotion orb button */
function EmotionOrbItem({ tap, isSelected, disabled, onClick }: { tap: EmotionTap; isSelected: boolean; disabled: boolean; onClick: () => void }): React.JSX.Element {
  const emoji = tap === "Anxious" ? "🌧" : tap === "Cravings" ? "⚡" : tap === "Restless" ? "🌀" : "💬";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`py-2 px-2.5 sm:py-3 sm:px-3 rounded-xl font-bold text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 flex-1 min-w-[45%] flex items-center justify-center truncate ${
        isSelected
          ? "bg-teal-700 text-white border-2 border-teal-300 shadow-lg shadow-teal-500/20 scale-[1.02]"
          : "bg-slate-950 text-slate-200 border border-slate-800 hover:bg-slate-800 hover:border-slate-700"
      }`}
    >
      <span aria-hidden="true" className="mr-1.5 text-sm sm:text-base">{emoji}</span>
      <span className="truncate">{tap}</span>
    </button>
  );
}

/** Emotion taps fieldset */
function EmotionOrbs({ selected, onSelect, disabled }: { selected: EmotionTap | null; onSelect: (tap: EmotionTap) => void; disabled: boolean }): React.JSX.Element {
  return (
    <fieldset className="border border-slate-800 rounded-2xl p-4 sm:p-5 bg-slate-900 shadow-md">
      <legend className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 px-2 tracking-wider">One-Tap Emotion Check-in</legend>
      <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
        {EMOTION_TAPS.map((tap) => (
          <EmotionOrbItem key={tap} tap={tap} isSelected={selected === tap} disabled={disabled} onClick={() => onSelect(tap)} />
        ))}
      </div>
    </fieldset>
  );
}

/** Live Transcript Box component */
function TranscriptBox({ isListening, transcript, interimTranscript }: { isListening: boolean; transcript: string; interimTranscript: string }): React.JSX.Element {
  const liveText = transcript || interimTranscript;
  if (!isListening && !liveText) return <React.Fragment />;
  return (
    <div className={`rounded-xl p-3.5 border transition-all ${isListening ? "bg-slate-950 border-teal-700/60 shadow-inner" : "bg-slate-950 border-slate-800"}`} aria-label="Live transcript" role="region">
      <div className="flex items-center gap-2 mb-2">
        {isListening && <VoiceWaveform />}
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{isListening ? "Transcribing..." : "Transcript"}</span>
      </div>
      <p className="text-sm text-slate-100 leading-relaxed min-h-[1.5rem]">
        {transcript && <span>{transcript} </span>}
        {interimTranscript && <span className="text-slate-400 italic">{interimTranscript}</span>}
        {!liveText && isListening && <span className="text-slate-600 italic">Waiting for speech...</span>}
      </p>
    </div>
  );
}

/** Resolves status message for voice check-in */
function getVoiceStatusText(mode: VoiceMode, transcript: string, interim: string, canUseVoice: boolean): string {
  if (mode === "listening") return "Listening... speak naturally (Tap ⏹ to stop loop)";
  if (mode === "speaking") return "Gemini is speaking... (Mic will re-open automatically)";
  if (mode === "processing") return "Analyzing your words with Gemini...";
  return transcript || interim ? "Tap mic to resume continuous conversation" : canUseVoice ? "Tap mic for real-time speech interaction" : "Hold to record";
}

/** Mic Button component */
function VoiceMicButton({ isListening, isSpeaking, isProcessing, disabled, onClick }: { isListening: boolean; isSpeaking: boolean; isProcessing: boolean; disabled: boolean; onClick: () => void }): React.JSX.Element {
  const isVoiceActive = isListening || isSpeaking || isProcessing;
  const micLabel = isVoiceActive ? "Stop real-time speech interaction" : "Start real-time speech interaction";
  return (
    <button
      type="button"
      disabled={!isVoiceActive && disabled}
      onClick={onClick}
      aria-label={micLabel}
      aria-pressed={isVoiceActive}
      aria-describedby="voice-status-text"
      className={`relative w-14 h-14 rounded-full font-bold text-sm transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-lg flex-shrink-0 ${
        isVoiceActive ? "bg-red-600 hover:bg-red-500 text-white shadow-red-500/40 ring-4 ring-red-400/30" : "bg-teal-700 hover:bg-teal-600 text-white shadow-teal-500/20 hover:scale-105 active:scale-95"
      }`}
    >
      {isListening && <span className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping" aria-hidden="true" />}
      <span aria-hidden="true" className="text-xl">{isVoiceActive ? "⏹" : "🎙"}</span>
    </button>
  );
}

/** Tap-to-speak section with live transcript */
function LiveVoiceSection({ voiceMode, transcript, interimTranscript, canUseVoice, onStart, onStop, disabled }: { voiceMode: VoiceMode; transcript: string; interimTranscript: string; canUseVoice: boolean; onStart: () => void; onStop: () => void; disabled: boolean }): React.JSX.Element {
  const isListening = voiceMode === "listening";
  const isSpeaking = voiceMode === "speaking";
  const isProcessing = voiceMode === "processing";
  const isVoiceActive = isListening || isSpeaking || isProcessing;
  const statusText = getVoiceStatusText(voiceMode, transcript, interimTranscript, canUseVoice);

  return (
    <div className="border border-slate-800 rounded-2xl p-5 bg-slate-900 shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>🎙</span> Voice Check-in
            {canUseVoice && <span className="text-[10px] font-normal text-teal-400 bg-teal-950 border border-teal-800 px-2 py-0.5 rounded-full">Live Transcription</span>}
          </h3>
          <p id="voice-status-text" role="status" aria-live="polite" className="text-xs text-slate-400 mt-0.5">{statusText}</p>
        </div>
        <VoiceMicButton isListening={isListening} isSpeaking={isSpeaking} isProcessing={isProcessing} disabled={disabled} onClick={isVoiceActive ? onStop : onStart} />
      </div>
      <TranscriptBox isListening={isListening} transcript={transcript} interimTranscript={interimTranscript} />
      {isSpeaking && (
        <div role="status" aria-live="polite" className="flex items-center gap-3 bg-teal-950/50 border border-teal-800/60 rounded-xl px-4 py-3">
          <SpeakingIndicator />
          <span className="text-sm text-teal-300 font-medium">Gemini is speaking to you...</span>
        </div>
      )}
    </div>
  );
}

/** Image input field */
function ImageSection({ imageName, onImageChange, disabled }: { imageName: string | null; onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled: boolean }): React.JSX.Element {
  return (
    <div className="border border-slate-800 rounded-2xl p-5 bg-slate-900 shadow-md">
      <label htmlFor="sanctuary-image-upload" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Webcam / Photo Check-in (Optional)</label>
      <input id="sanctuary-image-upload" type="file" accept="image/*" disabled={disabled} onChange={onImageChange} className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-teal-300 hover:file:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-slate-800 rounded-xl p-1 bg-slate-950" />
      {imageName && <p className="text-xs text-teal-400 font-semibold mt-2">Loaded image: {imageName}</p>}
    </div>
  );
}

/** Form header with title and emergency button */
function SanctuaryFormHeader({ onCrisisTrigger }: { onCrisisTrigger: () => void }): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg sm:text-xl font-semibold text-white">The Sanctuary — Check-In</h2>
      <button type="button" onClick={onCrisisTrigger} className="px-3 py-2 sm:px-4 sm:py-2 bg-red-700 hover:bg-red-600 text-white font-bold text-[10px] sm:text-xs rounded-lg shadow-lg flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-red-400 ml-auto">
        <span aria-hidden="true">🚨</span> Overwhelmed / Crisis Mode
      </button>
    </div>
  );
}

/** Main Sanctuary Input Form container */
export function SanctuaryInputForm({ onSubmit, isLoading, onCrisisTrigger, voiceMode, transcript, interimTranscript, canUseVoice, onStartListening, onStopListening }: SanctuaryInputFormProps): React.JSX.Element {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionTap | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [imageName, setImageName] = useState<string | null>(null);

  const isDisabled = isLoading || voiceMode === "processing" || voiceMode === "speaking";

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => { setImageBase64((reader.result as string).split(",")[1]); };
    reader.readAsDataURL(file);
  }, []);

  const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const inputType: InputType = transcript ? "voice" : imageBase64 ? "image" : selectedEmotion ? "emotion" : "emotion";
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
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <SanctuaryFormHeader onCrisisTrigger={onCrisisTrigger} />
      <EmotionOrbs selected={selectedEmotion} onSelect={setSelectedEmotion} disabled={isDisabled} />
      <LiveVoiceSection voiceMode={voiceMode} transcript={transcript} interimTranscript={interimTranscript} canUseVoice={canUseVoice} onStart={onStartListening} onStop={onStopListening} disabled={isDisabled} />
      <ImageSection imageName={imageName} onImageChange={handleImageChange} disabled={isDisabled} />
      <button type="submit" disabled={isDisabled} aria-busy={isLoading} className="w-full py-3.5 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400">
        {isLoading ? "Analyzing with Gemini..." : "Submit Check-in"}
      </button>
    </form>
  );
}
