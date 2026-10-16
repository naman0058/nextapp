"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_SPEECH_RATE } from "@/features/accessibility/constants/screenReaderPreview";
import type { SpeechPlaybackStatus } from "@/features/accessibility/types/screenReaderPreview";

/** Delay between cancel() and speak() — avoids silent failure in Chromium. */
const SPEAK_AFTER_CANCEL_MS = 120;

function resumeSpeechIfPaused(synth: SpeechSynthesis) {
  if (synth.paused) {
    synth.resume();
  }
}

export function useSpeechPreview(speechText: string) {
  const [supported] = useState(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
  );
  const [status, setStatus] = useState<SpeechPlaybackStatus>(() =>
    typeof window !== "undefined" && "speechSynthesis" in window
      ? "idle"
      : "unsupported",
  );
  const [rate, setRate] = useState(DEFAULT_SPEECH_RATE);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceUri, setVoiceUri] = useState<string>("");
  const [liveMessage, setLiveMessage] = useState("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechTextRef = useRef(speechText);
  const prevSpeechTextRef = useRef<string | null>(null);
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!supported) return;
    const refreshVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
    const timer = window.setTimeout(refreshVoices, 0);
    return () => {
      window.clearTimeout(timer);
      window.speechSynthesis.removeEventListener("voiceschanged", refreshVoices);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  useEffect(() => {
    speechTextRef.current = speechText;
    if (!supported) return;
    if (
      prevSpeechTextRef.current !== null &&
      prevSpeechTextRef.current !== speechText
    ) {
      if (speakTimerRef.current) {
        clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      setStatus("stopped");
    }
    prevSpeechTextRef.current = speechText;
  }, [speechText, supported]);

  useEffect(() => {
    return () => {
      if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
    };
  }, []);

  const cancel = useCallback(() => {
    if (!supported) return;
    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setStatus("stopped");
    setLiveMessage("Playback stopped.");
  }, [supported]);

  const speak = useCallback(() => {
    if (!supported || !speechText.trim()) return;

    const textSnapshot = speechText.trim();
    const synth = window.speechSynthesis;

    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
    }
    synth.cancel();

    speakTimerRef.current = setTimeout(() => {
      speakTimerRef.current = null;
      const availableVoices = synth.getVoices();
      const utterance = new SpeechSynthesisUtterance(textSnapshot);
      utterance.rate = rate;
      const voice = availableVoices.find((v) => v.voiceURI === voiceUri);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }

      utterance.onstart = () => {
        setStatus("playing");
        setLiveMessage("Playback started.");
      };
      utterance.onend = () => {
        if (speechTextRef.current.trim() !== textSnapshot) return;
        setStatus("stopped");
        setLiveMessage("Playback stopped.");
      };
      utterance.onerror = (event) => {
        if (event.error === "canceled") return;
        setStatus("stopped");
        setLiveMessage(
          `Speech playback error: ${event.error || "unknown"}. Try another voice or browser.`,
        );
      };

      utteranceRef.current = utterance;
      synth.speak(utterance);
      resumeSpeechIfPaused(synth);
      window.setTimeout(() => resumeSpeechIfPaused(synth), 250);
    }, SPEAK_AFTER_CANCEL_MS);
  }, [supported, speechText, rate, voiceUri]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setStatus("paused");
    setLiveMessage("Playback paused.");
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setStatus("playing");
    setLiveMessage("Playback resumed.");
  }, [supported]);

  return {
    supported,
    status,
    rate,
    setRate,
    voices,
    voiceUri,
    setVoiceUri,
    speak,
    pause,
    resume,
    cancel,
    liveMessage,
  };
}
