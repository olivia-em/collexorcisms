import React, { useEffect, useRef, useState } from "react";
import p5 from "p5";
import styles from "./Piece6.module.css";
import useTrackPiece from "../../../useTrackPiece";
import GlitchText from "../../GlitchText";
import { useAmbientAudio } from "../../../AmbientAudioContext";
import { createManagedAudio } from "../../../managedAudio";

const GROUPS = [
  { min: 10, max: 99 },
  { min: 100, max: 199 },
  { min: 200, max: 299 },
  { min: 300, max: 399 },
  { min: 400, max: 499 },
  { min: 500, max: 599 },
  { min: 600, max: 699 },
  { min: 700, max: 799 },
  { min: 800, max: 899 },
  { min: 900, max: 999 },
];

function tokenize(text) {
  return text.split(/\W+/).filter((w) => w.length >= 3 && !/\d+/.test(w));
}

function groupWords(tokens) {
  const counts = {};
  tokens.forEach((word) => {
    const w = word.toLowerCase();
    counts[w] = (counts[w] || 0) + 1;
  });
  const keys = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const groups = GROUPS.map((g) => []);
  keys.forEach((word) => {
    const count = counts[word];
    for (let i = 0; i < GROUPS.length; i++) {
      if (count >= GROUPS[i].min && count < GROUPS[i].max) {
        groups[i].push({ word, count });
        break;
      }
    }
  });
  return groups;
}

const Piece6 = () => {
  const { getPieceVolume, registerAudioElement } = useAmbientAudio();
  const [groups, setGroups] = useState([]);
  const [audioStarted, setAudioStarted] = useState(false);
  const canvasRef = useRef();
  const audioRef = useRef(null);
  const cleanupAudioRef = useRef(null);
  const glitchRef = useRef(null);
  const audioStartedRef = useRef(false);
  const audioInitializedRef = useRef(false);
  const { markCompleted } = useTrackPiece("cursedVisions");
  const markCompletedRef = useRef(markCompleted);

  useEffect(() => {
    markCompletedRef.current = markCompleted;
  }, [markCompleted]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}assets/iliad.txt`)
      .then((res) => res.text())
      .then((text) => {
        const tokens = tokenize(text);
        const grouped = groupWords(tokens);
        setGroups(grouped);
      });
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      cleanupAudioRef.current?.();
      cleanupAudioRef.current = null;
      audioRef.current = null;
      audioInitializedRef.current = false;
      audioStartedRef.current = false;
    };
  }, []);

  // Handle title button click
  const handleTitleClick = () => {
    // console.log(
    //   "[Piece6] Title clicked, audioStartedRef.current:",
    //   audioStartedRef.current,
    // );
    if (!audioInitializedRef.current) {
      const audioUrl = `${import.meta.env.BASE_URL}assets/piece6/love_audio_collage.mp3`;
      const managedAudio = createManagedAudio({
        src: audioUrl,
        volume: getPieceVolume("piece6"),
        registerAudioElement: (element) =>
          registerAudioElement("piece6", element),
        onEnded: () => {
          markCompletedRef.current?.();
        },
      });
      cleanupAudioRef.current = managedAudio.cleanup;
      audioRef.current = managedAudio.audio;
      audioInitializedRef.current = true;
    }

    if (!audioStartedRef.current && audioRef.current) {
      // console.log("[Piece6] Starting audio...");
      audioStartedRef.current = true;
      setAudioStarted(true);
      // console.log("[Piece6] audioRef.current.src:", audioRef.current.src);
      // console.log(
      //   "[Piece6] audioRef.current.readyState:",
      //   audioRef.current.readyState,
      // );

      audioRef.current
        .play()
        .then(() => {
          // console.log(
          //   "[Piece6] Audio play() promise resolved - playback started",
          // );
        })
        .catch((err) => {
          // console.error("[Piece6] Audio play failed:", err);
          // console.error("[Piece6] Error name:", err.name);
          // console.error("[Piece6] Error message:", err.message);
        });

      // Trigger glitch effect
      // console.log("[Piece6] Triggering glitch effect");
      if (glitchRef.current) {
        glitchRef.current.triggerGlitch?.();
      }
    } else {
      // console.log("[Piece6] Click ignored - already started or no audio ref");
    }
  };

  useEffect(() => {
    if (!groups.length) return;
    let p5Instance;
    let refreshLayout = null;

    const sketch = (p) => {
      let w = 800;
      let h = 400;
      let wordFontSize = h * 0.025;
      let firstGridFontSize = h * 0.02;
      let animatedLineHeight = 18;
      let firstGridLineHeight = 10;

      const readContainerSize = () => {
        const parent = canvasRef.current?.parentElement;
        if (!parent) return null;
        const nextW = Math.max(1, Math.floor(parent.clientWidth));
        const nextH = Math.max(1, Math.floor(parent.clientHeight));
        return { nextW, nextH };
      };

      const applySize = (force = false) => {
        const next = readContainerSize();
        if (!next) return;
        const { nextW, nextH } = next;
        if (!force && nextW === w && nextH === h) return;

        w = nextW;
        h = nextH;
        wordFontSize = Math.max(10, h * 0.025);
        firstGridFontSize = Math.max(8, h * 0.02);
        animatedLineHeight = Math.max(12, wordFontSize * 1.35);
        firstGridLineHeight = Math.max(8, firstGridFontSize * 1.2);

        if (p.width !== w || p.height !== h) {
          p.resizeCanvas(w, h);
        }
      };

      p.setup = () => {
        p.createCanvas(w, h).parent(canvasRef.current);
        applySize(true);
        refreshLayout = () => applySize();
        p.textAlign(p.CENTER, p.CENTER);
        p.noStroke();
        p.draw = () => {
          applySize();
          p.clear();
          // Draw static layer (first group)
          if (groups[0]?.length) {
            p.fill(255, 0, 0);
            p.textSize(firstGridFontSize);
            p.textFont("Courier New");
            // Grid layout
            const padding = 0;
            const sampleCount = Math.min(12, groups[0].length);
            let sampleWidthTotal = 0;
            for (let idx = 0; idx < sampleCount; idx += 1) {
              sampleWidthTotal += p.textWidth(groups[0][idx].word);
            }
            const avgWordWidth =
              sampleCount > 0
                ? sampleWidthTotal / sampleCount
                : firstGridFontSize;
            const cellWidth = Math.max(
              firstGridFontSize * 2.2,
              avgWordWidth * 0.8,
            );
            const cellHeight = firstGridLineHeight;
            const cols = Math.max(1, Math.floor((w - padding * 2) / cellWidth));
            const rows = Math.max(1, Math.ceil((h - padding * 2) / cellHeight));
            const totalCells = cols * rows;
            for (let idx = 0; idx < totalCells; idx++) {
              const col = idx % cols;
              const row = Math.floor(idx / cols);
              const x = padding + col * cellWidth + cellWidth / 2;
              const y = padding + row * cellHeight + cellHeight / 2;
              const word = groups[0][idx % groups[0].length].word;
              // Text shadow effect
              p.push();
              p.fill(0, 0, 0, 80);
              p.text(word, x + 0.5, y + 0.5);
              p.pop();
              p.fill(255, 0, 0);
              p.text(word, x, y);
            }
          }
          // Draw animated layers
          for (let g = 1; g < groups.length; g++) {
            p.push();
            p.fill(0, 255, 255, 180);
            p.textSize(wordFontSize);
            p.textFont("Courier New");
            const speed = (g + 2) / 10;
            const amplitudeY = h / 4;
            const amplitudeX = w / 2;
            // Animate group together on y
            const groupYOffset =
              Math.sin(p.millis() * 0.001 * speed) * amplitudeY;
            for (let i = 0; i < groups[g].length; i++) {
              // Animate word individually on x
              const x =
                w / 2 + Math.sin(p.millis() * 0.001 * speed + i) * amplitudeX;
              const y =
                h / 2 +
                (i - groups[g].length / 2) * animatedLineHeight +
                groupYOffset;
              p.push();
              p.fill(0, 255, 255, 80);
              p.text(groups[g][i].word, x + 2, y + 2);
              p.pop();
              p.fill(0, 255, 255, 180);
              p.text(groups[g][i].word, x, y);
            }
            p.pop();
          }
        };
      };
    };

    p5Instance = new p5(sketch);

    const runLayoutRefresh = () => {
      if (!refreshLayout) return;
      window.requestAnimationFrame(refreshLayout);
    };

    const resizeObserver = new ResizeObserver(runLayoutRefresh);
    if (canvasRef.current?.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    window.addEventListener("resize", runLayoutRefresh);
    window.addEventListener("orientationchange", runLayoutRefresh);
    document.addEventListener("fullscreenchange", runLayoutRefresh);
    window.visualViewport?.addEventListener("resize", runLayoutRefresh);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", runLayoutRefresh);
      window.removeEventListener("orientationchange", runLayoutRefresh);
      document.removeEventListener("fullscreenchange", runLayoutRefresh);
      window.visualViewport?.removeEventListener("resize", runLayoutRefresh);
      if (p5Instance) p5Instance.remove();
    };
  }, [groups]);

  return (
    <div className={styles.piece6Container}>
      <div ref={canvasRef} />
      {!audioStarted && (
        <div
          className={styles.titleButtonContainer}
          onClick={handleTitleClick}
          style={{ cursor: "pointer" }}
        >
          <GlitchText
            ref={glitchRef}
            text="cursedVisions"
            as="h2"
            mode="hover"
            intensity="medium"
            className={styles.titleButton}
            style={{
              userSelect: "none",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Piece6;
