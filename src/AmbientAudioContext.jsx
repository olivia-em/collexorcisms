import React, { createContext, useCallback, useContext, useRef } from "react";

const AmbientAudioContext = createContext(null);

const AMBIENT_VOLUME = 0.12;

export function AmbientAudioProvider({ children }) {
  const ambientRef = useRef(null);
  const startedRef = useRef(false);

  const startAmbient = useCallback(() => {
    if (startedRef.current) return;

    const src = `${import.meta.env.BASE_URL}assets/body/confessionsINSTRUMENTAL.mp3`;
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = AMBIENT_VOLUME;

    ambientRef.current = audio;
    startedRef.current = true;

    audio.play().catch(() => {
      // If autoplay is blocked, allow retry on next user gesture.
      startedRef.current = false;
    });
  }, []);

  const stopAmbient = useCallback(() => {
    const audio = ambientRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.src = "";
    ambientRef.current = null;
    startedRef.current = false;
  }, []);

  return (
    <AmbientAudioContext.Provider value={{ startAmbient, stopAmbient }}>
      {children}
    </AmbientAudioContext.Provider>
  );
}

export function useAmbientAudio() {
  const ctx = useContext(AmbientAudioContext);
  if (!ctx)
    throw new Error(
      "useAmbientAudio must be used inside <AmbientAudioProvider>",
    );
  return ctx;
}
