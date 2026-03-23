import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const AmbientAudioContext = createContext(null);

const DEFAULT_AUDIO_LEVELS = {
  ambient: 0.5,
  piece6: 0.9,
  piece7: 0.9,
  piece8: 1,
  piece9: 0.5,
  piece10: 0.7,
  piece22: 0.9,
};

function clampVolume(value) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(0, Math.min(1, value));
}

export function AmbientAudioProvider({ children }) {
  const ambientRef = useRef(null);
  const startedRef = useRef(false);
  const [audioLevels, setAudioLevels] = useState(DEFAULT_AUDIO_LEVELS);

  const getPieceVolume = useCallback(
    (pieceKey) => clampVolume(audioLevels[pieceKey] ?? 1),
    [audioLevels],
  );

  const setAudioLevel = useCallback((audioKey, volume) => {
    setAudioLevels((prev) => ({
      ...prev,
      [audioKey]: clampVolume(volume),
    }));
  }, []);

  const startAmbient = useCallback(() => {
    if (startedRef.current) return;

    const src = `${import.meta.env.BASE_URL}assets/body/confessions_extended.mp3`;
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = clampVolume(audioLevels.ambient);

    ambientRef.current = audio;
    startedRef.current = true;

    audio.play().catch(() => {
      // If autoplay is blocked, allow retry on next user gesture.
      startedRef.current = false;
    });
  }, [audioLevels.ambient]);

  const stopAmbient = useCallback(() => {
    const audio = ambientRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.src = "";
    ambientRef.current = null;
    startedRef.current = false;
  }, []);

  const ctxValue = useMemo(
    () => ({
      startAmbient,
      stopAmbient,
      audioLevels,
      getPieceVolume,
      setAudioLevel,
    }),
    [audioLevels, getPieceVolume, setAudioLevel, startAmbient, stopAmbient],
  );

  return (
    <AmbientAudioContext.Provider value={ctxValue}>
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
