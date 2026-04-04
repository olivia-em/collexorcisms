import React, { useEffect, useMemo, useRef } from "react";
import p5 from "p5";
import styles from "../BackgroundCollage.module.css";
import { useAmbientAudio } from "../AmbientAudioContext";

const CIRCLE_COUNT = 50;

// ─── Easy to edit: one entry per audio key ────────────────────────────────────
const LAYER_CONFIG = {
  ambient: { h: 220, s: 60, b: 85 },
  piece6: { h: 30, s: 70, b: 95 },
  piece7: { h: 280, s: 55, b: 90 },
  piece8: { h: 160, s: 65, b: 88 },
  piece9: { h: 10, s: 75, b: 92 },
  piece10: { h: 200, s: 50, b: 95 },
  piece22: { h: 345, s: 65, b: 96 },
};

// ─── Background color ─────────────────────────────────────────────────────────
const BG = { h: 230, s: 25, b: 0 };

const LAYER_KEYS = Object.keys(LAYER_CONFIG);

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function getBandLevels(analyserNode, dataArray) {
  analyserNode.getByteFrequencyData(dataArray);
  const binCount = dataArray.length;

  const lowEnd = Math.floor(binCount * 0.15);
  let lowSum = 0;
  for (let i = 0; i < lowEnd; i++) lowSum += dataArray[i];
  const low = lowSum / lowEnd / 255;

  const highStart = Math.floor(binCount * 0.65);
  let highSum = 0;
  for (let i = highStart; i < binCount; i++) highSum += dataArray[i];
  const high = highSum / (binCount - highStart) / 255;

  return { low: clamp01(low), high: clamp01(high) };
}

export default function BackgroundCollage() {
  const mountRef = useRef(null);
  const p5Ref = useRef(null);
  const circlesRef = useRef([]);
  const hasActivatedAudioLayerRef = useRef(false);
  const [audioLayerVisible, setAudioLayerVisible] = React.useState(false);

  // ✅ Hook called inside the component body
  const { entriesByKey, activePieceAudioLevel } = useAmbientAudio();

  useEffect(() => {
    if (hasActivatedAudioLayerRef.current) return;
    if (clamp01(activePieceAudioLevel) > 0.02) {
      hasActivatedAudioLayerRef.current = true;
      setAudioLayerVisible(true);
    }
  }, [activePieceAudioLevel]);

  useEffect(() => {
    const sketch = (p) => {
      let w = window.innerWidth;
      let h = window.innerHeight;

      const resetCircles = () => {
        circlesRef.current = Array.from({ length: CIRCLE_COUNT }, (_, idx) => {
          const key = LAYER_KEYS[idx % LAYER_KEYS.length];
          const cfg = LAYER_CONFIG[key];
          return {
            x: p.random(0, w),
            y: p.random(0, h),
            radius: p.random(90, 210),
            vx: p.random(-0.35, 0.35),
            vy: p.random(-0.35, 0.35),
            key,
            h: cfg.h + p.random(-8, 8),
            s: cfg.s + p.random(-6, 6),
            b: cfg.b + p.random(-5, 5),
          };
        });
      };

      p.setup = () => {
        const canvas = p.createCanvas(w, h);
        canvas.parent(mountRef.current);
        p.colorMode(p.HSB, 360, 100, 100, 100);
        p.noStroke();
        resetCircles();
      };

      p.draw = () => {
        if (!hasActivatedAudioLayerRef.current) return;

        p.background(BG.h, BG.s, BG.b);

        p.drawingContext.save();
        p.drawingContext.filter = "blur(34px)";

        for (const c of circlesRef.current) {
          let lowLevel = 0;
          let highLevel = 0;

          const keyEntries = entriesByKey?.current?.get(c.key);
          if (keyEntries?.size) {
            for (const entry of keyEntries) {
              if (!entry.element.paused) {
                const bands = getBandLevels(entry.analyser, entry.data);
                lowLevel = bands.low;
                highLevel = bands.high;
                break;
              }
            }
          }

          const baseAlpha = 2 + lowLevel * 38;
          const shimmer = highLevel * 14;
          const alpha = Math.min(64, baseAlpha + shimmer);

          const hShift = highLevel * 14;
          const bLift = highLevel * 10;

          p.fill(c.h + hShift, c.s, c.b + bLift, alpha);

          const r = c.radius * (1 + lowLevel * 0.18);
          p.ellipse(c.x, c.y, r, r);

          c.x += c.vx;
          c.y += c.vy;
          if (c.x < -c.radius * 0.5 || c.x > w + c.radius * 0.5) c.vx *= -1;
          if (c.y < -c.radius * 0.5 || c.y > h + c.radius * 0.5) c.vy *= -1;
        }

        p.drawingContext.restore();
      };

      p.windowResized = () => {
        w = window.innerWidth;
        h = window.innerHeight;
        p.resizeCanvas(w, h);
        resetCircles();
      };
    };

    p5Ref.current = new p5(sketch);
    return () => {
      if (p5Ref.current) {
        p5Ref.current.remove();
        p5Ref.current = null;
      }
    };
  }, [entriesByKey]);

  return (
    <div className={styles.backgroundCollage}>
      <div className={styles.img1}></div>
      <div
        ref={mountRef}
        className={`${styles.audioLayer} ${audioLayerVisible ? styles.audioLayerVisible : ""}`}
      ></div>
      <div className={styles.img2}></div>
      <div
        className={`${styles.img3} ${audioLayerVisible ? styles.img3AudioActive : ""}`}
      ></div>
    </div>
  );
}
