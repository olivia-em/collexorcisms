// A2Z F25 — Daniel Shiffman
// Markov poem generator with scatter fall-in and in-place glitch scramble

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Piece7.module.css";
import MarkovGeneratorWord from "./markov.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const GLITCH_COLORS = ["#c8c8c8", "#e05555", "#00ffff"];
const GLITCH_FONTS = [
  "'Courier New', Courier, monospace",
  "'Jacquard12', serif",
];
const SYMBOLS = "!@#$%^&*()".split("");
const randOf = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Glitch phases ────────────────────────────────────────────────────────────
// Each phase: glitchFrac = fraction of words affected
//             symbolFrac = fraction of those replaced with symbols
//             moveFrac   = fraction that physically jump to random offset
//             interval   = ms between ticks
//             duration   = ms this phase lasts
const GLITCH_PHASES = [
  {
    glitchFrac: 0.08,
    symbolFrac: 0.0,
    moveFrac: 0.0,
    interval: 180,
    duration: 350,
  },
  {
    glitchFrac: 0.5,
    symbolFrac: 0.2,
    moveFrac: 0.15,
    interval: 100,
    duration: 450,
  },
  {
    glitchFrac: 0.9,
    symbolFrac: 0.65,
    moveFrac: 0.4,
    interval: 60,
    duration: 400,
  },
  {
    glitchFrac: 0.15,
    symbolFrac: 0.0,
    moveFrac: 0.0,
    interval: 160,
    duration: 300,
  }, // settle
];

// ─── Build flat word list from 6 generated lines ─────────────────────────────
// Returns array of { word, lineIndex } preserving line membership
function buildWordList(lines) {
  const words = [];
  lines.forEach((line, li) => {
    line
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word) => {
        words.push({ word, lineIndex: li });
      });
  });
  return words;
}

// ─── Single Word ─────────────────────────────────────────────────────────────
// Handles its own scatter-in transform and glitch state
const Word = React.memo(function Word({
  word,
  phase, // 'hidden' | 'scattered' | 'settling' | 'visible' | 'glitching'
  scatterX, // px offset from random scatter origin
  scatterY,
  settleDelay, // ms stagger for settle animation
  glitchSeed, // stable random seed 0–1 for this word
  glitchFrac,
  symbolFrac,
  moveFrac,
  glitchTick, // increments each tick to force re-render
  nextWord, // what this word is transforming into during glitch
}) {
  // Derive per-tick glitch state from seed
  const isActive = glitchSeed < glitchFrac;
  const isSymbol = isActive && (glitchSeed * 13) % 1 < symbolFrac;
  const isMoving = isActive && (glitchSeed * 7) % 1 < moveFrac;

  // During glitch, display either symbols, the next word bleeding through, or original
  let display = word;
  if (phase === "glitching") {
    if (isSymbol) {
      // Replace chars with symbols
      display = word
        .split("")
        .map(() => randOf(SYMBOLS))
        .join("");
    } else if (isActive && glitchFrac > 0.4 && nextWord) {
      // At peak chaos, bleed in the next word
      display = nextWord;
    }
  }

  const color =
    phase === "glitching" && isActive ? randOf(GLITCH_COLORS) : undefined;
  const font =
    phase === "glitching" && isActive ? randOf(GLITCH_FONTS) : undefined;

  // Physical scramble offset during glitch
  const moveX =
    phase === "glitching" && isMoving
      ? Math.sin(glitchSeed * 999 + glitchTick) * 12 + "px"
      : "0px";
  const moveY =
    phase === "glitching" && isMoving
      ? Math.cos(glitchSeed * 777 + glitchTick) * 8 + "px"
      : "0px";

  // Scatter: word starts at random offset, then transitions to 0,0
  let transform = `translate(0px, 0px)`;
  if (phase === "scattered") {
    transform = `translate(${scatterX}px, ${scatterY}px)`;
  }
  if (phase === "glitching" && isMoving) {
    transform = `translate(${moveX}, ${moveY})`;
  }

  const opacity = phase === "hidden" || phase === "scattered" ? 0 : 1;

  const transition =
    phase === "settling"
      ? `transform ${380 + glitchSeed * 200}ms cubic-bezier(0.22,1,0.36,1) ${settleDelay}ms, opacity ${280}ms ease ${settleDelay}ms`
      : phase === "glitching"
        ? "none" // glitch is instant, no easing
        : "transform 0.3s ease, opacity 0.3s ease";

  return (
    <span
      className={styles.word}
      style={{
        transform,
        opacity,
        transition,
        color,
        fontFamily: font,
        display: "inline-block", // required for transform to work inline
      }}
    >
      {display}
      {/* Always render a space after each word */}
      <span
        style={{ fontFamily: "'Courier New', monospace", color: "inherit" }}
      >
        {" "}
      </span>
    </span>
  );
});

// ─── Main component ───────────────────────────────────────────────────────────
const Piece7 = () => {
  const [markov, setMarkov] = useState(null);
  const [lines, setLines] = useState([]); // current 6 lines
  const [nextLines, setNextLines] = useState(null); // incoming lines during glitch
  // phase: 'idle' | 'scattered' | 'settling' | 'visible' | 'glitching'
  const [animPhase, setAnimPhase] = useState("idle");
  const [glitchFrac, setGlitchFrac] = useState(0);
  const [symbolFrac, setSymbolFrac] = useState(0);
  const [moveFrac, setMoveFrac] = useState(0);
  const [glitchTick, setGlitchTick] = useState(0);

  const timers = useRef([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Per-word metadata: scatter offsets + glitch seeds.
  // Stored in a ref so it NEVER participates in the render cycle.
  // Regenerated manually whenever new lines are set.
  const wordMetaRef = useRef([]);
  const generateWordMeta = (newLines) => {
    wordMetaRef.current = buildWordList(newLines).map(() => ({
      scatterX: (Math.random() - 0.5) * window.innerWidth * 0.9,
      scatterY: (Math.random() - 0.5) * window.innerHeight * 0.9,
      settleDelay: Math.random() * 600,
      glitchSeed: Math.random(),
    }));
  };

  // Load Markov
  useEffect(() => {
    const generator = new MarkovGeneratorWord(1, 10);
    fetch("/assets/exorcisms.txt")
      .then((r) => r.text())
      .then((text) => {
        text.split("\n").forEach((l) => {
          if (l.trim()) generator.feed(l);
        });
        setMarkov(generator);
      })
      .catch(console.error);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateLines = useCallback(() => {
    if (!markov) return [];
    return Array.from({ length: 6 }, () => markov.generate());
  }, [markov]);

  // ── Scatter fall-in ──────────────────────────────────────────────────────
  const runScatterIn = useCallback((newLines) => {
    clearTimers();
    generateWordMeta(newLines); // generate meta BEFORE setLines so ref is ready on first render
    setLines(newLines);
    setAnimPhase("scattered"); // words placed at random offsets, opacity 0

    // One frame later: make them visible at their scatter positions
    const t1 = setTimeout(() => {
      // transition to opacity 1 but still at scatter position
      setAnimPhase("scattered-visible");
      // Then immediately trigger settle
      const t2 = setTimeout(() => {
        setAnimPhase("settling"); // CSS transition kicks in, words fly to 0,0
        // After longest possible settle (600 stagger + 580 transition)
        const t3 = setTimeout(() => {
          setAnimPhase("visible");
        }, 1400);
        timers.current.push(t3);
      }, 60);
      timers.current.push(t2);
    }, 60);
    timers.current.push(t1);
  }, []);

  // ── Glitch transition ────────────────────────────────────────────────────
  const runGlitch = useCallback((incoming) => {
    clearTimers();
    setNextLines(incoming);
    setAnimPhase("glitching");

    let elapsed = 0;
    let tickTimer = null;

    const startTick = (interval) => {
      clearTimeout(tickTimer);
      const loop = () => {
        setGlitchTick((n) => n + 1);
        tickTimer = setTimeout(loop, interval);
        timers.current.push(tickTimer);
      };
      tickTimer = setTimeout(loop, interval);
      timers.current.push(tickTimer);
    };

    GLITCH_PHASES.forEach((p, pi) => {
      const t = setTimeout(() => {
        setGlitchFrac(p.glitchFrac);
        setSymbolFrac(p.symbolFrac);
        setMoveFrac(p.moveFrac);
        startTick(p.interval);
        // At peak (phase 2), swap the actual words to the new poem
        if (pi === 2) setLines(incoming);
      }, elapsed);
      timers.current.push(t);
      elapsed += p.duration;
    });

    // Wind down — snap to visible, clear glitch
    const done = setTimeout(() => {
      clearTimeout(tickTimer);
      setGlitchFrac(0);
      setSymbolFrac(0);
      setMoveFrac(0);
      setGlitchTick(0);
      setNextLines(null);
      setAnimPhase("visible");
    }, elapsed + 150);
    timers.current.push(done);
  }, []);

  // ── Click handler ────────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (
      !markov ||
      animPhase === "scattered" ||
      animPhase === "settling" ||
      animPhase === "glitching"
    )
      return;
    const newLines = generateLines();
    if (animPhase === "idle") {
      runScatterIn(newLines);
    } else {
      runGlitch(newLines);
    }
  }, [markov, animPhase, generateLines, runScatterIn, runGlitch]);

  // Force re-render on glitch tick
  void glitchTick;

  // Build flat word list for rendering
  const wordList = buildWordList(lines);
  const nextWordList = nextLines ? buildWordList(nextLines) : [];

  // Group words back into lines for display, with line break after line 2 (0-indexed)
  // lines[0..2] = stanza 1, lines[3..5] = stanza 2
  const renderLines = () => {
    let wordIdx = 0;
    return lines.map((line, li) => {
      const lineWords = line.split(/\s+/).filter(Boolean);
      const rendered = lineWords.map((word, wi) => {
        const wi_global = wordIdx;
        wordIdx++;
        const meta = wordMetaRef.current[wi_global] ?? {
          scatterX: 0,
          scatterY: 0,
          settleDelay: 0,
          glitchSeed: Math.random(),
        };

        // Determine per-word phase mapping
        let wordPhase = animPhase;
        if (animPhase === "scattered-visible") wordPhase = "settling"; // start fly-in immediately after visible

        return (
          <Word
            key={`${li}-${wi}-${lines[li]?.slice(0, 4)}`}
            word={word}
            phase={wordPhase}
            scatterX={meta.scatterX}
            scatterY={meta.scatterY}
            settleDelay={meta.settleDelay}
            glitchSeed={meta.glitchSeed}
            glitchFrac={glitchFrac}
            symbolFrac={symbolFrac}
            moveFrac={moveFrac}
            glitchTick={glitchTick}
            nextWord={nextWordList[wi_global]?.word ?? null}
          />
        );
      });

      return (
        <React.Fragment key={li}>
          <div className={styles.poemLine}>{rendered}</div>
          {/* blank line between stanza 1 (lines 0–2) and stanza 2 (lines 3–5) */}
          {li === 2 && <div className={styles.stanzaBreak} />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className={styles.piece7Container}>
      {lines.length > 0 && (
        <div className={styles.poemText}>{renderLines()}</div>
      )}
      <button
        className={`${styles.generateButton} ${animPhase === "glitching" ? styles.buttonGlitching : ""}`}
        onClick={handleClick}
        disabled={!markov}
      >
        untitled
      </button>
    </div>
  );
};

export default Piece7;
