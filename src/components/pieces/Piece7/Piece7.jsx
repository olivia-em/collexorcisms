import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Piece7.module.css";
import MarkovGeneratorWord from "./markov.js";
import useTrackPiece from "../../../useTrackPiece";
import { useGame } from "../../../GameContext";
import { useAmbientAudio } from "../../../AmbientAudioContext";

const GLITCH_COLORS = ["#c8c8c8", "#e05555", "#00ffff"];
const GLITCH_FONTS = [
  "'Courier New', Courier, monospace",
  "'Jacquard12', serif",
];
const SYMBOLS = "!@#$%^&*()".split("");
const randOf = (arr) => arr[Math.floor(Math.random() * arr.length)];

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
  },
];

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

const Word = React.memo(function Word({
  word,
  phase,
  scatterX,
  scatterY,
  settleDelay,
  glitchSeed,
  glitchFrac,
  symbolFrac,
  moveFrac,
  glitchTick,
  nextWord,
}) {
  const isActive = glitchSeed < glitchFrac;
  const isSymbol = isActive && (glitchSeed * 13) % 1 < symbolFrac;
  const isMoving = isActive && (glitchSeed * 7) % 1 < moveFrac;

  let display = word;
  if (phase === "glitching") {
    if (isSymbol) {
      display = word
        .split("")
        .map(() => randOf(SYMBOLS))
        .join("");
    } else if (isActive && glitchFrac > 0.4 && nextWord) {
      display = nextWord;
    }
  }

  const color =
    phase === "glitching" && isActive ? randOf(GLITCH_COLORS) : undefined;
  const font =
    phase === "glitching" && isActive ? randOf(GLITCH_FONTS) : undefined;
  const moveX =
    phase === "glitching" && isMoving
      ? Math.sin(glitchSeed * 999 + glitchTick) * 12 + "px"
      : "0px";
  const moveY =
    phase === "glitching" && isMoving
      ? Math.cos(glitchSeed * 777 + glitchTick) * 8 + "px"
      : "0px";

  let transform = "translate(0px, 0px)";
  if (phase === "scattered")
    transform = `translate(${scatterX}px, ${scatterY}px)`;
  if (phase === "glitching" && isMoving)
    transform = `translate(${moveX}, ${moveY})`;

  const opacity = phase === "hidden" || phase === "scattered" ? 0 : 1;
  const transition =
    phase === "settling"
      ? `transform ${380 + glitchSeed * 200}ms cubic-bezier(0.22,1,0.36,1) ${settleDelay}ms, opacity 280ms ease ${settleDelay}ms`
      : phase === "glitching"
        ? "none"
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
        display: "inline-block",
      }}
    >
      {display}
      <span
        style={{ fontFamily: "'Courier New', monospace", color: "inherit" }}
      >
        {" "}
      </span>
    </span>
  );
});

const Piece7 = () => {
  const { getPieceVolume, registerAudioElement } = useAmbientAudio();
  const { markCompleted, isCompleted } = useTrackPiece("untitled");
  const { incrementPiece7, state } = useGame();

  const [markov, setMarkov] = useState(null);
  const [lines, setLines] = useState([]);
  const [nextLines, setNextLines] = useState(null);
  const [animPhase, setAnimPhase] = useState("idle");
  const [glitchFrac, setGlitchFrac] = useState(0);
  const [symbolFrac, setSymbolFrac] = useState(0);
  const [moveFrac, setMoveFrac] = useState(0);
  const [glitchTick, setGlitchTick] = useState(0);

  const timers = useRef([]);
  const wordMetaRef = useRef([]);
  const audioRef = useRef(null);
  const unregisterAudioRef = useRef(null);
  const audioStartedRef = useRef(false);
  const completionEmittedRef = useRef(false);
  const [audioFinished, setAudioFinished] = useState(false);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.onended = null;
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
      unregisterAudioRef.current?.();
      unregisterAudioRef.current = null;
      audioRef.current = null;
      audioStartedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (completionEmittedRef.current || isCompleted) return;
    if (state.piece7ClickCount >= 11 && audioFinished) {
      completionEmittedRef.current = true;
      markCompleted();
    }
  }, [audioFinished, isCompleted, markCompleted, state.piece7ClickCount]);

  const generateWordMeta = (newLines) => {
    wordMetaRef.current = buildWordList(newLines).map(() => ({
      scatterX: (Math.random() - 0.5) * window.innerWidth * 0.9,
      scatterY: (Math.random() - 0.5) * window.innerHeight * 0.9,
      settleDelay: Math.random() * 600,
      glitchSeed: Math.random(),
    }));
  };

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

  const runScatterIn = useCallback((newLines) => {
    clearTimers();
    generateWordMeta(newLines);
    setLines(newLines);
    setAnimPhase("scattered");
    const t1 = setTimeout(() => {
      setAnimPhase("scattered-visible");
      const t2 = setTimeout(() => {
        setAnimPhase("settling");
        const t3 = setTimeout(() => setAnimPhase("visible"), 1400);
        timers.current.push(t3);
      }, 60);
      timers.current.push(t2);
    }, 60);
    timers.current.push(t1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        if (pi === 2) setLines(incoming);
      }, elapsed);
      timers.current.push(t);
      elapsed += p.duration;
    });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = useCallback(() => {
    if (
      !markov ||
      animPhase === "scattered" ||
      animPhase === "settling" ||
      animPhase === "glitching"
    )
      return;
    if (!audioStartedRef.current) {
      const audio = new Audio(
        `${import.meta.env.BASE_URL}assets/piece7/untitled.mp3`,
      );
      audio.preload = "auto";
      audio.volume = getPieceVolume("piece7");
      unregisterAudioRef.current = registerAudioElement("piece7", audio);
      audio.onended = () => {
        setAudioFinished(true);
      };
      audioRef.current = audio;
      audioStartedRef.current = true;
      audio.play().catch(() => {
        audioStartedRef.current = false;
      });
    }

    incrementPiece7(); // increments global click counter for untitled
    const newLines = generateLines();
    if (animPhase === "idle") {
      runScatterIn(newLines);
    } else {
      runGlitch(newLines);
    }
  }, [
    markov,
    animPhase,
    generateLines,
    runScatterIn,
    runGlitch,
    incrementPiece7,
  ]);

  void glitchTick;

  const nextWordList = nextLines ? buildWordList(nextLines) : [];

  const renderLines = () => {
    let wordIdx = 0;
    return lines.map((line, li) => {
      const lineWords = line.split(/\s+/).filter(Boolean);
      const rendered = lineWords.map((word, wi) => {
        const wi_global = wordIdx++;
        const meta = wordMetaRef.current[wi_global] ?? {
          scatterX: 0,
          scatterY: 0,
          settleDelay: 0,
          glitchSeed: Math.random(),
        };
        let wordPhase = animPhase;
        if (animPhase === "scattered-visible") wordPhase = "settling";
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
