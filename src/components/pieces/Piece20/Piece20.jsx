import React, { useEffect, useRef, useState } from "react";
import styles from "./Piece20.module.css";
import useTrackPiece from "../../../useTrackPiece";

const Piece20 = () => {
  const { markCompleted, isCompleted } = useTrackPiece("teethmarks");
  const mountRef = useRef(null);
  const markCompletedRef = useRef(markCompleted);
  const isCompletedRef = useRef(isCompleted);
  const hasStartedRef = useRef(false);
  const [words, setWords] = useState([]);

  useEffect(() => {
    markCompletedRef.current = markCompleted;
  }, [markCompleted]);

  useEffect(() => {
    isCompletedRef.current = isCompleted;
  }, [isCompleted]);

  useEffect(() => {
    let cancelled = false;
    fetch("/assets/piece20/marks.txt")
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        const parsed = text
          .split(/\s+/)
          .map((w) => w.trim())
          .filter(Boolean);
        setWords(parsed);
      })
      .catch((err) => {
        console.error("Piece20 marks load failed", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mountRef.current || words.length === 0) return;

    let disposed = false;
    let p5Instance = null;

    const setupSketch = async () => {
      const mod = await import("p5");
      if (disposed || !mountRef.current) return;

      const P5 = mod.default;
      const sketch = (p) => {
        let canvasEl = null;
        let pointerX = -9999;
        let pointerY = -9999;
        let w = 800;
        let h = 400;
        let introSize1 = 180;
        let introSize2 = 140;
        let titleHoverProgress = 0;

        const bruises = [];
        const droppedWords = [];
        let wordIndex = 0;
        let completedEmitted = isCompletedRef.current;

        const getCanvasSize = () => {
          const parent = mountRef.current?.parentElement;
          if (!parent) return { width: 800, height: 400 };
          return {
            width: parent.offsetWidth || 800,
            height: parent.offsetHeight || 400,
          };
        };

        const maybeComplete = () => {
          if (completedEmitted) return;
          if (wordIndex >= words.length) {
            completedEmitted = true;
            markCompletedRef.current?.();
            console.log(
              "[Piece20] Completed after all words were clicked once.",
            );
          }
        };

        const addBruiseAt = (x, y) => {
          const word = words[wordIndex % words.length];
          wordIndex += 1;
          bruises.push({
            x,
            y,
            word,
            size1: p.random(100, 200),
            size2: p.random(100, 200),
            r: p.random(150, 255),
            g: p.random(150, 255),
            b: p.random(150, 255),
            lifespan: 255,
            fadeSpeed: 255 / (60 * 5),
          });
          maybeComplete();
        };

        const pointFromEvent = (clientX, clientY) => {
          const rect = canvasEl?.elt?.getBoundingClientRect();
          if (!rect) return null;
          const scaleX = rect.width > 0 ? p.width / rect.width : 1;
          const scaleY = rect.height > 0 ? p.height / rect.height : 1;
          return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
          };
        };

        const handlePointerDown = (ev) => {
          const point = pointFromEvent(ev.clientX, ev.clientY);
          if (!point) return;
          if (!hasStartedRef.current) {
            hasStartedRef.current = true;
          }
          addBruiseAt(point.x, point.y);
        };

        const handlePointerMove = (ev) => {
          const point = pointFromEvent(ev.clientX, ev.clientY);
          if (!point) return;
          pointerX = point.x;
          pointerY = point.y;
        };

        const handlePointerLeave = () => {
          pointerX = -9999;
          pointerY = -9999;
        };

        p.setup = () => {
          const size = getCanvasSize();
          w = size.width;
          h = size.height;
          canvasEl = p.createCanvas(w, h);
          canvasEl.parent(mountRef.current);
          canvasEl.elt.style.pointerEvents = "auto";
          canvasEl.elt.style.cursor = "crosshair";
          canvasEl.elt.addEventListener("pointerdown", handlePointerDown);
          canvasEl.elt.addEventListener("pointermove", handlePointerMove);
          canvasEl.elt.addEventListener("pointerleave", handlePointerLeave);
          p.colorMode(p.RGB);
          p.textAlign(p.CENTER, p.CENTER);
          p.textFont("Courier New");
          p.textSize(Math.max(12, h * 0.04));
          introSize1 = Math.max(140, Math.min(320, w * 0.28));
          introSize2 = Math.max(90, Math.min(240, h * 0.34));
        };

        p.draw = () => {
          p.background(255);

          for (let i = bruises.length - 1; i >= 0; i -= 1) {
            const b = bruises[i];
            b.lifespan -= b.fadeSpeed;

            p.noStroke();
            p.fill(b.r, b.g, b.b, b.lifespan);
            p.ellipse(b.x, b.y, b.size1, b.size2);

            if (b.lifespan <= 0) {
              droppedWords.push({ word: b.word, x: b.x, y: b.y });
              bruises.splice(i, 1);
            }
          }

          if (!hasStartedRef.current) {
            const cx = w * 0.5;
            const cy = h * 0.5;
            p.noStroke();
            p.fill(245, 235, 205, 255);
            p.ellipse(cx, cy, introSize1, introSize2);
          }

          p.filter(p.BLUR, 20);

          p.fill(100);
          p.noStroke();
          for (const b of bruises) {
            if (b.word) p.text(b.word, b.x, b.y);
          }

          for (const d of droppedWords) {
            p.text(d.word, d.x, d.y);
          }

          if (!hasStartedRef.current) {
            const cx = w * 0.5;
            const cy = h * 0.5;
            const overIntro =
              pointerX >= cx - introSize1 * 0.5 &&
              pointerX <= cx + introSize1 * 0.5 &&
              pointerY >= cy - introSize2 * 0.5 &&
              pointerY <= cy + introSize2 * 0.5;
            const hoverTarget = overIntro ? 1 : 0;
            titleHoverProgress += (hoverTarget - titleHoverProgress) * 0.16;

            p.textFont("Jacquard12");
            p.textStyle(p.NORMAL);
            p.textSize(Math.max(22, Math.min(52, h * 0.12)));
            const titleBase = p.color(190, 190, 190);
            const titleHover = p.color(255, 58, 58);
            const titleColor = p.lerpColor(
              titleBase,
              titleHover,
              titleHoverProgress,
            );
            p.fill(titleColor);
            p.text("teeth marks", cx, cy - 4);

            p.textFont("Courier New");
            p.textStyle(p.BOLD);
            p.textSize(Math.max(10, h * 0.028));
            p.fill(150);
          }
        };

        p.windowResized = () => {
          const size = getCanvasSize();
          w = size.width;
          h = size.height;
          p.resizeCanvas(w, h);
          p.textSize(Math.max(12, h * 0.04));
          introSize1 = Math.max(140, Math.min(320, w * 0.28));
          introSize2 = Math.max(90, Math.min(240, h * 0.34));
        };
      };

      p5Instance = new P5(sketch);
    };

    setupSketch();

    return () => {
      disposed = true;
      if (p5Instance) p5Instance.remove();
    };
  }, [words]);

  return (
    <div className={styles.piece20Container}>
      <div ref={mountRef} className={styles.sketchMount} />
      {words.length === 0 && (
        <p className={styles.loadingText}>loading marks...</p>
      )}
    </div>
  );
};

export default Piece20;
