import React, { useEffect, useRef, useState } from "react";
import styles from "./BackgroundCollage.module.css";
import { useAmbientAudio } from "./AmbientAudioContext";

const CIRCLE_COUNT = 50;
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

const LAYER_CONFIG = {
  ambient: { h: 220, s: 60, b: 85 },
  piece6: { h: 30, s: 70, b: 95 },
  piece7: { h: 280, s: 55, b: 90 },
  piece8: { h: 160, s: 65, b: 88 },
  piece9: { h: 10, s: 75, b: 92 },
  piece10: { h: 200, s: 50, b: 95 },
  piece22: { h: 345, s: 65, b: 96 },
};

const BG = { h: 230, s: 25, b: 0 };
const LAYER_KEYS = Object.keys(LAYER_CONFIG);

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function hsbToRgba(h, s, b, a = 1) {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp01(s / 100);
  const brightness = clamp01(b / 100);

  const chroma = brightness * saturation;
  const hueSegment = hue / 60;
  const x = chroma * (1 - Math.abs((hueSegment % 2) - 1));
  const match = brightness - chroma;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hueSegment < 1) {
    red = chroma;
    green = x;
  } else if (hueSegment < 2) {
    red = x;
    green = chroma;
  } else if (hueSegment < 3) {
    green = chroma;
    blue = x;
  } else if (hueSegment < 4) {
    green = x;
    blue = chroma;
  } else if (hueSegment < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  const r = Math.round((red + match) * 255);
  const g = Math.round((green + match) * 255);
  const bl = Math.round((blue + match) * 255);
  return `rgba(${r}, ${g}, ${bl}, ${a})`;
}

function getBandLevels(analyserNode, dataArray) {
  analyserNode.getByteFrequencyData(dataArray);
  const binCount = dataArray.length;

  const lowEnd = Math.floor(binCount * 0.15);
  let lowSum = 0;
  for (let i = 0; i < lowEnd; i += 1) lowSum += dataArray[i];
  const low = lowSum / lowEnd / 255;

  const highStart = Math.floor(binCount * 0.65);
  let highSum = 0;
  for (let i = highStart; i < binCount; i += 1) highSum += dataArray[i];
  const high = highSum / (binCount - highStart) / 255;

  return { low: clamp01(low), high: clamp01(high) };
}

export default function BackgroundCollage() {
  const mountRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const circlesRef = useRef([]);
  const hasActivatedAudioLayerRef = useRef(false);
  const [audioLayerVisible, setAudioLayerVisible] = useState(false);
  const [img3BlendMode, setImg3BlendMode] = useState("burn");

  const { entriesByKey, activePieceAudioLevel } = useAmbientAudio();

  useEffect(() => {
    if (hasActivatedAudioLayerRef.current) return;
    if (clamp01(activePieceAudioLevel) > 0.02) {
      hasActivatedAudioLayerRef.current = true;
      setAudioLayerVisible(true);
    }
  }, [activePieceAudioLevel]);

  useEffect(() => {
    if (!audioLayerVisible) {
      setImg3BlendMode("burn");
      return undefined;
    }

    setImg3BlendMode("burn");

    const timers = [
      window.setTimeout(() => setImg3BlendMode("difference"), 110),
      window.setTimeout(() => setImg3BlendMode("burn"), 220),
      window.setTimeout(() => setImg3BlendMode("difference"), 330),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [audioLayerVisible]);

  useEffect(() => {
    if (!audioLayerVisible) return undefined;

    const canvas = canvasRef.current;
    const mount = mountRef.current;
    if (!canvas || !mount) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const resetCircles = () => {
      circlesRef.current = Array.from({ length: CIRCLE_COUNT }, (_, idx) => {
        const key = LAYER_KEYS[idx % LAYER_KEYS.length];
        const cfg = LAYER_CONFIG[key];
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 90 + Math.random() * 120,
          vx: -0.35 + Math.random() * 0.7,
          vy: -0.35 + Math.random() * 0.7,
          key,
          h: cfg.h + (-8 + Math.random() * 16),
          s: cfg.s + (-6 + Math.random() * 12),
          b: cfg.b + (-5 + Math.random() * 10),
        };
      });
    };

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width || window.innerWidth));
      height = Math.max(1, Math.round(rect.height || window.innerHeight));
      pixelRatio = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      resetCircles();
    };

    const drawFrame = (timestamp) => {
      animationFrameRef.current = window.requestAnimationFrame(drawFrame);
      if (timestamp - lastFrameTimeRef.current < FRAME_INTERVAL) return;
      lastFrameTimeRef.current = timestamp;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = hsbToRgba(BG.h, BG.s, BG.b, 1);
      context.fillRect(0, 0, width, height);

      context.save();
      context.filter = "blur(34px)";

      for (const circle of circlesRef.current) {
        let lowLevel = 0;
        let highLevel = 0;

        const keyEntries = entriesByKey?.current?.get(circle.key);
        if (keyEntries?.size) {
          for (const entry of keyEntries) {
            if (!entry.element.paused && !entry.element.ended) {
              const bands = getBandLevels(entry.analyser, entry.data);
              lowLevel = bands.low;
              highLevel = bands.high;
              break;
            }
          }
        }

        const baseAlpha = 2 + lowLevel * 38;
        const shimmer = highLevel * 14;
        const alpha = Math.min(64, baseAlpha + shimmer) / 100;
        const hShift = highLevel * 14;
        const bLift = highLevel * 10;
        const radius = circle.radius * (1 + lowLevel * 0.18);

        context.beginPath();
        context.fillStyle = hsbToRgba(
          circle.h + hShift,
          circle.s,
          circle.b + bLift,
          alpha,
        );
        context.arc(circle.x, circle.y, radius / 2, 0, Math.PI * 2);
        context.fill();

        circle.x += circle.vx;
        circle.y += circle.vy;
        if (
          circle.x < -circle.radius * 0.5 ||
          circle.x > width + circle.radius * 0.5
        ) {
          circle.vx *= -1;
        }
        if (
          circle.y < -circle.radius * 0.5 ||
          circle.y > height + circle.radius * 0.5
        ) {
          circle.vy *= -1;
        }
      }

      context.restore();
    };

    resize();
    animationFrameRef.current = window.requestAnimationFrame(drawFrame);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [audioLayerVisible, entriesByKey]);

  return (
    <div className={styles.backgroundCollage}>
      <div className={styles.img1}></div>
      <div
        ref={mountRef}
        className={`${styles.audioLayer} ${audioLayerVisible ? styles.audioLayerVisible : ""}`}
      >
        <canvas ref={canvasRef} className={styles.audioCanvas} />
      </div>
      <div className={styles.img2}></div>
      <div
        className={`${styles.img3} ${
          img3BlendMode === "difference"
            ? styles.img3AudioDifference
            : styles.img3AudioBurn
        }`}
      ></div>
    </div>
  );
}
