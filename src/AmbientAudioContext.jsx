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

const DISTANCE_FULL_AT = 350;
const DISTANCE_SILENT_AT = 2500;
const AMBIENT_DUCK_FLOOR = 0.18;

function distanceToGain(distance) {
  if (!Number.isFinite(distance)) return 1;
  if (distance <= DISTANCE_FULL_AT) return 1;
  if (distance >= DISTANCE_SILENT_AT) return 0;
  const t =
    (distance - DISTANCE_FULL_AT) / (DISTANCE_SILENT_AT - DISTANCE_FULL_AT);
  return 1 - t;
}

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
  const pieceDistanceByAudioKeyRef = useRef(new Map());
  const ambientDuckFactorRef = useRef(1);
  const ambientBaseLevelRef = useRef(DEFAULT_AUDIO_LEVELS.ambient);
  const [audioLevels, setAudioLevels] = useState(DEFAULT_AUDIO_LEVELS);
  const [isMuted, setIsMuted] = useState(false);
  const [activePieceAudioLevel, setActivePieceAudioLevel] = useState(0);

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
        const gainNode = ctx.createGain();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.82;
        source.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(masterGain);
        node = {
          element,
          source,
          gainNode,
          analyser,
          data: new Uint8Array(analyser.frequencyBinCount),
        };
        nodesByElementRef.current.set(element, node);
      }

      const distanceMultiplier = distanceToGain(
        pieceDistanceByAudioKeyRef.current.get(audioKey),
      );
      node.gainNode.gain.value = clampVolume(distanceMultiplier);

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

  const setPieceDistance = useCallback((audioKey, distance) => {
    if (!audioKey) return;
    pieceDistanceByAudioKeyRef.current.set(audioKey, distance);
  }, []);

  const startAmbient = useCallback(() => {
    if (startedRef.current) return;

    const src = `${import.meta.env.BASE_URL}assets/body/confessions_extended.mp3`;
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = "auto";
    ambientBaseLevelRef.current = clampVolume(audioLevels.ambient);
    audio.volume = clampVolume(
      ambientBaseLevelRef.current * ambientDuckFactorRef.current,
    );

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
    const timer = window.setInterval(() => {
      const ctx = audioContextRef.current;
      const now = ctx?.currentTime ?? 0;
      const ambientAudio = ambientRef.current;
      let anyPiecePlaying = false;
      let confessionsPlaying = false;
      let peakPieceLevel = 0;

      entriesByKeyRef.current.forEach((entries, audioKey) => {
        const distanceMultiplier =
          audioKey === "ambient"
            ? 1
            : distanceToGain(pieceDistanceByAudioKeyRef.current.get(audioKey));

        entries.forEach((entry) => {
          if (!entry?.gainNode) return;

          const targetGain = clampVolume(distanceMultiplier);
          if (ctx) {
            entry.gainNode.gain.setTargetAtTime(targetGain, now, 0.08);
          } else {
            entry.gainNode.gain.value = targetGain;
          }

          if (
            audioKey !== "ambient" &&
            entry.element &&
            !entry.element.paused &&
            !entry.element.ended
          ) {
            anyPiecePlaying = true;
            if (audioKey === "piece10") confessionsPlaying = true;
            entry.analyser.getByteFrequencyData(entry.data);
            let sum = 0;
            for (let i = 0; i < entry.data.length; i++) {
              sum += entry.data[i];
            }
            const avg = sum / entry.data.length / 255;
            const weighted = avg * targetGain;
            if (weighted > peakPieceLevel) peakPieceLevel = weighted;
          }
        });
      });

      const targetDuck = confessionsPlaying
        ? 0
        : anyPiecePlaying
          ? AMBIENT_DUCK_FLOOR
          : 1;
      ambientDuckFactorRef.current +=
        (targetDuck - ambientDuckFactorRef.current) * 0.14;

      const targetAmbientBase = clampVolume(audioLevels.ambient);
      ambientBaseLevelRef.current +=
        (targetAmbientBase - ambientBaseLevelRef.current) * 0.12;

      if (ambientAudio) {
        ambientAudio.volume = clampVolume(
          ambientBaseLevelRef.current * ambientDuckFactorRef.current,
        );
      }

      setActivePieceAudioLevel((prev) => prev + (peakPieceLevel - prev) * 0.25);
    }, 80);

    return () => {
      window.clearInterval(timer);
    };
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
            entry.gainNode.disconnect();
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
      setPieceDistance,
      activePieceAudioLevel,
      isPieceAudioActive: activePieceAudioLevel > 0.02,
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
      setPieceDistance,
      setAudioLevel,
      startAmbient,
      stopAmbient,
      toggleMute,
      activePieceAudioLevel,
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
