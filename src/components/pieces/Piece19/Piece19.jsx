import React, { useEffect, useRef, useState } from "react";
import styles from "./Piece19.module.css";
import useTrackPiece from "../../../useTrackPiece";

const CENTER_GAP = 36;
const HORIZONTAL_MARGIN = 44;
const DEBUG_BETWEEN = true;
const TITLE_TEXT_SIZE = 12;

function splitPreserveLines(text) {
  return text.replace(/\r/g, "").split("\n");
}

const Piece19 = () => {
  const { markCompleted } = useTrackPiece("first_on_first");
  const mountRef = useRef(null);
  const markCompletedRef = useRef(markCompleted);
  const [pairs, setPairs] = useState([]);

  useEffect(() => {
    markCompletedRef.current = markCompleted;
  }, [markCompleted]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/assets/piece19/left.txt").then((r) => r.text()),
      fetch("/assets/piece19/right.txt").then((r) => r.text()),
    ])
      .then(([leftText, rightText]) => {
        if (cancelled) return;
        const leftLines = splitPreserveLines(leftText);
        const rightLines = splitPreserveLines(rightText);
        const lineCount = Math.max(leftLines.length, rightLines.length);
        setPairs(
          Array.from({ length: lineCount }, (_, i) => ({
            left: leftLines[i] ?? "",
            right: rightLines[i] ?? "",
          })),
        );
      })
      .catch((err) => {
        console.error("Piece19 text load failed", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mountRef.current || pairs.length === 0) return;

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
        let lineMetrics = [];
        let yStart = 0;
        let lineHeight = 24;
        let bodyTextSize = 10;
        let betweenTextSize = 12;
        let titleTextSize = 10;
        let titleX = 0;
        let titleY = 0;
        let betweenX = 0;
        let betweenY = 0;
        let betweenW = 0;
        let betweenH = 0;
        let betweenHoverProgress = 0;
        let wasHovering = false;

        const titleLabel = "first on first on first";
        const betweenLabel = "between";
        const betweenHref = "/assets/piece19/between.txt";
        const titleNoiseSeedX = p.random(10, 1000);
        const titleNoiseSeedY = p.random(10, 1000);
        const noiseSeedX = p.random(10, 1000);
        const noiseSeedY = p.random(10, 1000);

        const getCanvasSize = () => {
          const parent = mountRef.current?.parentElement;
          if (!parent) return { width: 800, height: 400 };
          return {
            width: parent.offsetWidth || 800,
            height: parent.offsetHeight || 400,
          };
        };

        const computeLayout = () => {
          const baseLeft = HORIZONTAL_MARGIN;
          const baseRight = p.width - HORIZONTAL_MARGIN;

          const usableHeight = Math.max(80, p.height - 8);
          const rows = Math.max(1, pairs.length);
          const lineHeightTarget = usableHeight / rows;

          bodyTextSize = Math.max(6, Math.min(15, lineHeightTarget - 1));
          titleTextSize = TITLE_TEXT_SIZE;
          betweenTextSize = Math.max(12, Math.min(18, bodyTextSize + 3));

          p.textFont("Courier New");
          p.textStyle(p.BOLD);
          p.textSize(bodyTextSize);

          lineHeight = Math.max(7, lineHeightTarget);
          const totalHeight = pairs.length * lineHeight;
          yStart = totalHeight < p.height ? (p.height - totalHeight) * 0.5 : 2;

          lineMetrics = pairs.map((pair) => {
            const leftWidth = p.textWidth(pair.left || " ");
            const rightWidth = p.textWidth(pair.right || " ");
            const safeTravel =
              (baseRight - rightWidth - CENTER_GAP - baseLeft - leftWidth) / 2;
            return {
              left: pair.left,
              right: pair.right,
              baseLeft,
              baseRight,
              travelMax: Math.max(0, safeTravel),
            };
          });
        };

        const updateBetween = () => {
          const driftTime = p.frameCount * 0.004;
          const dx = p.map(
            p.noise(noiseSeedX + driftTime),
            0,
            1,
            -p.width * 0.18,
            p.width * 0.18,
          );
          const dy = p.map(
            p.noise(noiseSeedY + driftTime),
            0,
            1,
            -p.height * 0.14,
            p.height * 0.14,
          );

          betweenX = p.width * 0.5 + dx;
          betweenY = p.height * 0.5 + dy;

          p.textFont("Courier New");
          p.textStyle(p.BOLD);
          p.textSize(betweenTextSize);
          betweenW = p.textWidth(betweenLabel);
          betweenH = betweenTextSize;
        };

        const updateTitle = () => {
          const driftTime = p.frameCount * 0.0026;
          const dx = p.map(
            p.noise(titleNoiseSeedX + driftTime),
            0,
            1,
            -p.width * 0.15,
            p.width * 0.15,
          );
          const dy = p.map(
            p.noise(titleNoiseSeedY + driftTime),
            0,
            1,
            -p.height * 0.08,
            p.height * 0.08,
          );

          titleX = p.width * 0.5 + dx;
          titleY = p.height * 0.18 + dy;
        };

        const isOverBetweenAt = (x, y) => {
          const hitPaddingX = 42;
          const hitPaddingY = 24;
          return (
            x >= betweenX - betweenW * 0.5 - hitPaddingX &&
            x <= betweenX + betweenW * 0.5 + hitPaddingX &&
            y >= betweenY - betweenH * 0.5 - hitPaddingY &&
            y <= betweenY + betweenH * 0.5 + hitPaddingY
          );
        };

        const openBetweenAt = (x, y) => {
          const hit = isOverBetweenAt(x, y);
          if (DEBUG_BETWEEN) {
            console.log("[Piece19] between pointerdown", {
              x,
              y,
              hit,
              betweenX,
              betweenY,
              betweenW,
              betweenH,
            });
          }
          if (!hit) return false;
          markCompletedRef.current?.();
          if (DEBUG_BETWEEN) {
            console.log("[Piece19] between opened", betweenHref);
          }
          if (
            window.__COLLEX_OPEN_TXT__ &&
            window.__COLLEX_OPEN_TXT__(betweenHref)
          ) {
            return true;
          }
          window.open(betweenHref, "_blank", "noopener,noreferrer");
          return true;
        };

        const getPointInCanvas = (clientX, clientY) => {
          const rect = canvasEl?.elt?.getBoundingClientRect();
          if (!rect) return null;
          const scaleX = rect.width > 0 ? p.width / rect.width : 1;
          const scaleY = rect.height > 0 ? p.height / rect.height : 1;
          return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
          };
        };

        const handlePointerMove = (ev) => {
          const point = getPointInCanvas(ev.clientX, ev.clientY);
          if (!point) return;
          pointerX = point.x;
          pointerY = point.y;
        };

        const handlePointerDown = (ev) => {
          const point = getPointInCanvas(ev.clientX, ev.clientY);
          if (!point) return;
          pointerX = point.x;
          pointerY = point.y;
          openBetweenAt(point.x, point.y);
        };

        const handlePointerLeave = () => {
          pointerX = -9999;
          pointerY = -9999;
        };

        p.setup = () => {
          const { width, height } = getCanvasSize();
          canvasEl = p.createCanvas(width, height);
          canvasEl.parent(mountRef.current);
          canvasEl.elt.style.pointerEvents = "auto";
          canvasEl.elt.addEventListener("pointermove", handlePointerMove);
          canvasEl.elt.addEventListener("pointerdown", handlePointerDown);
          canvasEl.elt.addEventListener("pointerleave", handlePointerLeave);
          computeLayout();
        };

        p.draw = () => {
          p.background("#000");

          p.textFont("Courier New");
          p.textStyle(p.BOLD);
          p.textSize(bodyTextSize);

          const oscillation = (Math.sin(p.frameCount * 0.015) + 1) * 0.5;

          lineMetrics.forEach((line, idx) => {
            const travel = line.travelMax * oscillation * 0.7;
            const xLeft = line.baseLeft + travel;
            const xRight = line.baseRight - travel;
            const y = yStart + idx * lineHeight;

            p.fill("#f2f2f2");
            p.textAlign(p.LEFT, p.TOP);
            p.text(line.left, xLeft, y);

            p.textAlign(p.RIGHT, p.TOP);
            p.text(line.right, xRight, y);
          });

          updateTitle();
          p.textFont("Jacquard12");
          p.textStyle(p.NORMAL);
          p.textSize(titleTextSize);
          p.fill("#00d9d9");
          p.textAlign(p.CENTER, p.CENTER);
          p.text(titleLabel, titleX, titleY);

          updateBetween();
          const hover = isOverBetweenAt(pointerX, pointerY);
          const hoverTarget = hover ? 1 : 0;
          betweenHoverProgress += (hoverTarget - betweenHoverProgress) * 0.16;
          if (hover !== wasHovering && DEBUG_BETWEEN) {
            console.log("[Piece19] between hover", {
              hover,
              pointerX,
              pointerY,
              betweenX,
              betweenY,
              betweenW,
              betweenH,
            });
          }
          wasHovering = hover;
          if (canvasEl?.elt) {
            canvasEl.elt.style.cursor = hover ? "pointer" : "default";
          }

          p.textFont("Courier New");
          p.textStyle(p.BOLD);
          p.textSize(betweenTextSize);
          const betweenBase = p.color("#ff4a4a");
          const betweenHover = p.color("#00ffff");
          const betweenColor = p.lerpColor(
            betweenBase,
            betweenHover,
            betweenHoverProgress,
          );
          p.fill(betweenColor);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(betweenLabel, betweenX, betweenY);
        };

        p.windowResized = () => {
          const { width, height } = getCanvasSize();
          p.resizeCanvas(width, height);
          computeLayout();
        };
      };

      p5Instance = new P5(sketch);
    };

    setupSketch();

    return () => {
      disposed = true;
      if (p5Instance) p5Instance.remove();
    };
  }, [pairs]);

  return (
    <div className={styles.piece19Container}>
      <div ref={mountRef} className={styles.sketchMount} />
      {pairs.length === 0 && <p className={styles.loadingText}>loading...</p>}
    </div>
  );
};

export default Piece19;
