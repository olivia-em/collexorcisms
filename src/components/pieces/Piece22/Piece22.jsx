import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./Piece22.module.css";
import useTrackPiece from "../../../useTrackPiece";
import { ScrollAtEndContext } from "../../../CSSScroll";
import { useAmbientAudio } from "../../../AmbientAudioContext";

// parthenogenesis — audio plays on hover, completes on audio end
const CITE_LINK_URL = "https://example.com";

const Piece22 = () => {
  const { getPieceVolume } = useAmbientAudio();
  const { markCompleted } = useTrackPiece("parthenogenesis");
  const isAtFurthestScrollPoint = useContext(ScrollAtEndContext);
  const markCompletedRef = useRef(markCompleted);
  const mountRef = useRef(null);
  const [lines, setLines] = useState([]);
  const audioRef = useRef(null);
  const audioStartedRef = useRef(false);
  const audioInitializedRef = useRef(false);

  useEffect(() => {
    markCompletedRef.current = markCompleted;
  }, [markCompleted]);

  useEffect(() => {
    let cancelled = false;

    fetch("/assets/piece22/parthenogenesis.txt")
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        setLines(text.replace(/\r/g, "").split("\n"));
      })
      .catch((err) => {
        console.error("Piece22 text load failed", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.onended = null;
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
      audioRef.current = null;
      audioInitializedRef.current = false;
      audioStartedRef.current = false;
    };
  }, []);

  // Function to play audio on hover
  const playAudio = () => {
    // console.log(
    //   "[Piece22] playAudio called, audioStartedRef.current:",
    //   audioStartedRef.current,
    // );
    if (!audioInitializedRef.current) {
      const audioUrl = `${import.meta.env.BASE_URL}assets/piece22/parthenogenesis.mp3`;
      const audio = new Audio(audioUrl);
      audio.preload = "auto";
      audio.volume = getPieceVolume("piece22");
      audio.onended = () => {
        markCompletedRef.current?.();
      };
      audioRef.current = audio;
      audioInitializedRef.current = true;
    }

    if (!audioStartedRef.current && audioRef.current) {
      // console.log("[Piece22] Starting audio...");
      audioStartedRef.current = true;
      // console.log("[Piece22] audioRef.current.src:", audioRef.current.src);
      // console.log(
      //   "[Piece22] audioRef.current.readyState:",
      //   audioRef.current.readyState,
      // );

      audioRef.current
        .play()
        .then(() => {
          // console.log(
          //   "[Piece22] Audio play() promise resolved - playback started",
          // );
        })
        .catch((err) => {
          // console.error("[Piece22] Audio play failed:", err);
          // console.error("[Piece22] Error name:", err.name);
          // console.error("[Piece22] Error message:", err.message);
        });
    } else {
      // console.log(
      //   "[Piece22] playAudio ignored - already started or no audio ref",
      // );
    }
  };

  useEffect(() => {
    if (!mountRef.current || lines.length === 0) return;

    let disposed = false;
    let p5Instance = null;

    const setupSketch = async () => {
      const mod = await import("p5");
      if (disposed || !mountRef.current) return;

      const P5 = mod.default;
      const sketch = (p) => {
        let canvasEl = null;
        let w = 800;
        let h = 400;
        let hovered = false;
        let chars = [];

        const getCanvasSize = () => {
          const parent = mountRef.current?.parentElement;
          if (!parent) return { width: 800, height: 400 };
          return {
            width: parent.offsetWidth || 800,
            height: parent.offsetHeight || 400,
          };
        };

        const setFontForChar = (isTitle, titleSize, bodySize) => {
          if (isTitle) {
            p.textFont("Jacquard12");
            p.textStyle(p.NORMAL);
            p.textSize(titleSize);
          } else {
            p.textFont("Courier New");
            p.textStyle(p.BOLD);
            p.textSize(bodySize);
          }
        };

        const charAdvance = (ch, isTitle, titleSize, bodySize) => {
          setFontForChar(isTitle, titleSize, bodySize);
          const em = p.textWidth("M");
          if (ch === " ") return Math.max(3, em * 0.56);
          if (ch === "\t") return Math.max(6, em * 2.2);
          return p.textWidth(ch);
        };

        const rebuildLayout = () => {
          const titleSize = Math.max(20, Math.min(44, h * 0.1));
          const bodySize = Math.max(10, Math.min(18, h * 0.036));
          const titleLineHeight = Math.round(titleSize * 1.12);
          const bodyLineHeight = Math.round(bodySize * 1.55);

          const heights = lines.map((_, idx) =>
            idx === 0 ? titleLineHeight : bodyLineHeight,
          );
          const totalHeight = heights.reduce((a, b) => a + b, 0);
          let y = Math.max(14, (h - totalHeight) * 0.5);

          const leftPad = Math.max(24, w * 0.12);
          chars = [];

          lines.forEach((line, lineIdx) => {
            const isTitle = lineIdx === 0;
            const lineHeight = heights[lineIdx];
            const display = line ?? "";
            let x = leftPad;

            setFontForChar(isTitle, titleSize, bodySize);
            for (const ch of Array.from(display)) {
              const chWidth = charAdvance(
                ch || " ",
                isTitle,
                titleSize,
                bodySize,
              );
              chars.push({
                ch,
                isTitle,
                homeX: x,
                homeY: y,
                x,
                y,
                vx: 0,
                vy: 0,
              });
              x += chWidth;
            }

            y += lineHeight;
          });
        };

        const explodeChars = () => {
          for (const c of chars) {
            const speed = c.isTitle ? 3.1 : 2.2;
            c.vx = p.random(-speed, speed);
            c.vy = p.random(-speed, speed);
          }
        };

        const onPointerEnter = () => {
          hovered = true;
          explodeChars();
          playAudio();
        };

        const onPointerLeave = () => {
          hovered = false;
        };

        p.setup = () => {
          const size = getCanvasSize();
          w = size.width;
          h = size.height;
          canvasEl = p.createCanvas(w, h);
          canvasEl.parent(mountRef.current);
          canvasEl.elt.style.pointerEvents = "auto";
          canvasEl.elt.addEventListener("pointerenter", onPointerEnter);
          canvasEl.elt.addEventListener("pointerleave", onPointerLeave);
          p.colorMode(p.RGB);
          p.textAlign(p.LEFT, p.TOP);
          p.noStroke();
          rebuildLayout();
        };

        p.draw = () => {
          p.background("#000");

          for (const c of chars) {
            if (hovered) {
              c.x += c.vx;
              c.y += c.vy;
              c.vx *= 0.992;
              c.vy *= 0.992;
            } else {
              c.x = p.lerp(c.x, c.homeX, 0.14);
              c.y = p.lerp(c.y, c.homeY, 0.14);
              c.vx *= 0.9;
              c.vy *= 0.9;
            }

            if (c.isTitle) {
              p.textFont("Jacquard12");
              p.textStyle(p.NORMAL);
              p.textSize(Math.max(20, Math.min(44, h * 0.1)));
              p.fill("#00e8e8");
            } else {
              p.textFont("Courier New");
              p.textStyle(p.BOLD);
              p.textSize(Math.max(10, Math.min(18, h * 0.036)));
              p.fill("#d0d0d0");
            }

            p.text(c.ch, c.x, c.y);
          }
        };

        p.windowResized = () => {
          const size = getCanvasSize();
          w = size.width;
          h = size.height;
          p.resizeCanvas(w, h);
          rebuildLayout();
        };
      };

      p5Instance = new P5(sketch);
    };

    setupSketch();

    return () => {
      disposed = true;
      if (p5Instance) p5Instance.remove();
    };
  }, [lines]);

  return (
    <div className={styles.piece22Container}>
      {isAtFurthestScrollPoint && (
        <a
          href={"https://forms.gle/Uu7xPm1TriJKTcVUA"}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.citeLink}
          aria-label="Open citation"
        >
          ^C
        </a>
      )}
      <div ref={mountRef} className={styles.sketchMount} />
      {lines.length === 0 && <p className={styles.loadingText}>loading...</p>}
    </div>
  );
};

export default Piece22;
