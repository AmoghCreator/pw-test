"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { EMOTION_TAPS, DEFAULT_USER_PROFILE } from "@/lib/constants";
import type { EmotionTap, InputType } from "@/lib/types";

import type { ValidatedGenerateRequest } from "@/lib/validators";

interface SanctuaryInputFormProps {
  onSubmit: (request: ValidatedGenerateRequest) => Promise<void>;
  isLoading: boolean;
  onCrisisTrigger: () => void;
}

/** Render emotion taps fieldset */
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
    <fieldset className="border border-slate-700/60 rounded-xl p-4 bg-slate-900/50">
      <legend className="text-sm font-medium text-slate-300 px-2">
        One-Tap Emotion Check-in
      </legend>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
        {EMOTION_TAPS.map((tap) => {
          const isTapSelected = selected === tap;
          return (
            <button
              key={tap}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(tap)}
              className={`py-3 px-4 rounded-lg font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                isTapSelected
                  ? "bg-teal-600 text-white border-2 border-teal-300 shadow-md"
                  : "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
              }`}
            >
              <span aria-hidden="true" className="mr-1.5">
                {tap === "Anxious" ? "🌧" : tap === "Cravings" ? "⚡" : tap === "Restless" ? "🌀" : "💬"}
              </span>
              {tap}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Voice input section with spacebar listener */
function VoiceSection({
  isRecording,
  onStart,
  onStop,
  disabled,
}: {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled: boolean;
}): React.JSX.Element {
  return (
    <div className="border border-slate-700/60 rounded-xl p-4 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">
          Zero-Typing Voice Check-in
        </h3>
        <p className="text-xs text-slate-400">
          Hold Spacebar or press button below to record voice (10s max)
        </p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onMouseDown={onStart}
        onMouseUp={onStop}
        onTouchStart={onStart}
        onTouchEnd={onStop}
        aria-label={isRecording ? "Recording voice input..." : "Hold spacebar or tap to speak"}
        className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
          isRecording
            ? "bg-red-600 text-white animate-pulse"
            : "bg-teal-700 hover:bg-teal-600 text-white"
        }`}
      >
        <span aria-hidden="true">{isRecording ? "🔴 Recording..." : "🎙 Hold to Speak"}</span>
      </button>
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
    <div className="border border-slate-700/60 rounded-xl p-4 bg-slate-900/50">
      <label htmlFor="sanctuary-image-upload" className="block text-sm font-medium text-slate-300 mb-1">
        Webcam / Photo Check-in (Optional)
      </label>
      <input
        id="sanctuary-image-upload"
        type="file"
        accept="image/*"
        disabled={disabled}
        onChange={onImageChange}
        className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-teal-300 hover:file:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
      {imageName && <p className="text-xs text-teal-400 mt-1">Loaded image: {imageName}</p>}
    </div>
  );
}

/** Main Sanctuary Input Form container */
export function SanctuaryInputForm({
  onSubmit,
  isLoading,
  onCrisisTrigger,
}: SanctuaryInputFormProps): React.JSX.Element {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionTap | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | undefined>(undefined);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [imageName, setImageName] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const processAudioBlob = useCallback(() => {
    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      setAudioBase64(base64);
    };
    reader.readAsDataURL(blob);
  }, []);

  const startRecording = useCallback(() => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    setIsRecording(true);
    audioChunksRef.current = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = processAudioBlob;
      recorder.start();
    }).catch(() => setIsRecording(false));
  }, [processAudioBlob]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.code === "Space" && !isRecording && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        startRecording();
      }
    }
    function handleKeyUp(e: KeyboardEvent): void {
      if (e.code === "Space" && isRecording) {
        e.preventDefault();
        stopRecording();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isRecording, startRecording, stopRecording]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleFormSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const inputType: InputType = audioBase64
      ? "voice"
      : imageBase64
      ? "image"
      : selectedEmotion
      ? "emotion"
      : "crisis";
    await onSubmit({
      userId: "sanctuary-user-01",
      inputType,
      emotionTap: selectedEmotion ?? undefined,
      audioBase64,
      imageBase64,
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
      <EmotionOrbs selected={selectedEmotion} onSelect={setSelectedEmotion} disabled={isLoading} />
      <VoiceSection isRecording={isRecording} onStart={startRecording} onStop={stopRecording} disabled={isLoading} />
      <ImageSection imageName={imageName} onImageChange={handleImageChange} disabled={isLoading} />
      <button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
      >
        {isLoading ? "Analyzing Input with Gemini..." : "Submit Zero-Typing Check-in"}
      </button>
    </form>
  );
}
