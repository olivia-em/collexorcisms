import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  const ambientUnregisterRef = useRef(null);
  const startedRef = useRef(false);
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);
  const entriesByKeyRef = useRef(new Map());
  const nodesByElementRef = useRef(new WeakMap());
  const [audioLevels, setAudioLevels] = useState(DEFAULT_AUDIO_LEVELS);
  const [isMuted, setIsMuted] = useState(false);

  const ensureAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (audioContextRef.current) return audioContextRef.current;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    audioContextRef.current = ctx;
    return ctx;
  }, []);

  const ensureMasterGain = useCallback(() => {
    const ctx = ensureAudioContext();
    if (!ctx) return null;
    const existingGain = masterGainRef.current;
    if (existingGain) {
      if (existingGain.context === ctx) return existingGain;
      try {
        existingGain.disconnect();
      } catch {
        // noop
      }
      masterGainRef.current = null;
    }
    const gain = ctx.createGain();
    gain.gain.value = 1;
    gain.connect(ctx.destination);
    masterGainRef.current = gain;
    return gain;
  }, [ensureAudioContext]);

  const registerAudioElement = useCallback(
    (audioKey, element) => {
      if (!audioKey || !element) return () => {};

      const ctx = ensureAudioContext();
      if (!ctx) return () => {};
      const masterGain = ensureMasterGain();
      if (!masterGain) return () => {};
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {
          // Resume can fail if not in a user gesture.
        });
      }

      let node = nodesByElementRef.current.get(element);
      if (!node) {
        const source = ctx.createMediaElementSource(element);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.82;
        source.connect(analyser);
        analyser.connect(masterGain);
        node = {
          element,
          source,
          analyser,
          data: new Uint8Array(analyser.frequencyBinCount),
        };
        nodesByElementRef.current.set(element, node);
      }

      let keySet = entriesByKeyRef.current.get(audioKey);
      if (!keySet) {
        keySet = new Set();
        entriesByKeyRef.current.set(audioKey, keySet);
      }
      keySet.add(node);

      return () => {
        const setForKey = entriesByKeyRef.current.get(audioKey);
        if (setForKey) setForKey.delete(node);
      };
    },
    [ensureAudioContext, ensureMasterGain],
  );

  const getAudioReactiveLevel = useCallback((audioKey) => {
    const keySet = entriesByKeyRef.current.get(audioKey);
    if (!keySet || keySet.size === 0) return 0;

    let peakLevel = 0;
    for (const entry of keySet) {
      if (!entry?.element || entry.element.paused || entry.element.ended) {
        continue;
      }
      entry.analyser.getByteFrequencyData(entry.data);
      let sum = 0;
      for (let i = 0; i < entry.data.length; i++) {
        sum += entry.data[i];
      }
      const avg = sum / entry.data.length / 255;
      const volume = clampVolume(entry.element.volume ?? 1);
      const weighted = avg * (0.5 + volume * 0.5);
      if (weighted > peakLevel) peakLevel = weighted;
    }
    return peakLevel;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

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
    ambientUnregisterRef.current = registerAudioElement("ambient", audio);

    audio.play().catch(() => {
      // If autoplay is blocked, allow retry on next user gesture.
      startedRef.current = false;
    });
  }, [audioLevels.ambient, registerAudioElement]);

  const stopAmbient = useCallback(() => {
    const audio = ambientRef.current;
    if (!audio) return;
    ambientUnregisterRef.current?.();
    ambientUnregisterRef.current = null;
    audio.pause();
    audio.currentTime = 0;
    audio.src = "";
    ambientRef.current = null;
    startedRef.current = false;
  }, []);

  useEffect(() => {
    const audio = ambientRef.current;
    if (!audio) return;
    audio.volume = clampVolume(audioLevels.ambient);
  }, [audioLevels.ambient]);

  useEffect(() => {
    const gain = ensureMasterGain();
    if (!gain) return;
    gain.gain.value = isMuted ? 0 : 1;
  }, [ensureMasterGain, isMuted]);

  useEffect(() => {
    return () => {
      entriesByKeyRef.current.forEach((entries) => {
        entries.forEach((entry) => {
          try {
            entry.source.disconnect();
            entry.analyser.disconnect();
          } catch {
            // noop
          }
        });
      });
      entriesByKeyRef.current.clear();
      const ctx = audioContextRef.current;
      if (ctx) {
        ctx.close().catch(() => {
          // noop
        });
        audioContextRef.current = null;
      }
      masterGainRef.current = null;
      nodesByElementRef.current = new WeakMap();
    };
  }, []);

  const ctxValue = useMemo(
    () => ({
      startAmbient,
      stopAmbient,
      audioLevels,
      getPieceVolume,
      setAudioLevel,
      registerAudioElement,
      getAudioReactiveLevel,
      isMuted,
      toggleMute,
      entriesByKey: entriesByKeyRef, // ← in the value object
    }),
    [
      audioLevels,
      getAudioReactiveLevel,
      getPieceVolume,
      isMuted,
      registerAudioElement,
      setAudioLevel,
      startAmbient,
      stopAmbient,
      toggleMute,
      // no dep needed — entriesByKeyRef is a stable ref, never changes identity
    ],
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
