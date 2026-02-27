import React, { useState, useRef, useEffect, useCallback } from "react";

/**
 * GlitchText
 * ─────────────────────────────────────────────────────────────────────────────
 * Portable word-level glitch with physical scramble, font switching,
 * symbol replacement, and color chaos. Extracted from Piece7.
 *
 * Props:
 *   text         {string}   — text to display (required)
 *   as           {string}   — wrapper tag: "h1", "p", "span", etc. (default: "span")
 *   mode         {string}   — "hover" | "auto" | "both" (default: "hover")
 *   autoInterval {number}   — ms between auto cycles in auto/both mode (default: 3500)
 *   intensity    {string}   — "low" | "medium" | "high" (default: "medium")
 *   colors       {string[]} — glitch colors (default: white/red/cyan)
 *   fonts        {string[]} — glitch fonts (default: Jacquard12 + monospace)
 *   symbols      {string[]} — symbol pool (default: !@#$%^&*())
 *   style        {object}   — extra styles on wrapper
 *   className    {string}   — extra class on wrapper
 *
 * Usage:
 *   <GlitchText text="justBones" as="h2" mode="hover" />
 *   <GlitchText text="Collected Exorcisms" as="h1" mode="auto" autoInterval={4000} intensity="low" />
 *   <GlitchText text="parasite" mode="both" intensity="high" />
 *   <GlitchText text="shedding_light" colors={["#fff","#ff00ff"]} className={styles.title} />
 */

const DEFAULT_COLORS  = ["#c8c8c8", "#e05555", "#00ffff"];
const DEFAULT_FONTS   = ["'Courier New', Courier, monospace", "'Jacquard12', serif"];
const DEFAULT_SYMBOLS = "!@#$%^&*()".split("");

const randOf = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Intensity → phase definitions
// Each phase: { glitchFrac, symbolFrac, moveFrac, interval, duration }
const PROFILES = {
  low: [
    { glitchFrac: 0.05, symbolFrac: 0.00, moveFrac: 0.00, interval: 200, duration: 300 },
    { glitchFrac: 0.25, symbolFrac: 0.10, moveFrac: 0.05, interval: 140, duration: 400 },
    { glitchFrac: 0.05, symbolFrac: 0.00, moveFrac: 0.00, interval: 200, duration: 250 },
  ],
  medium: [
    { glitchFrac: 0.08, symbolFrac: 0.00, moveFrac: 0.00, interval: 180, duration: 350 },
    { glitchFrac: 0.50, symbolFrac: 0.20, moveFrac: 0.15, interval: 100, duration: 450 },
    { glitchFrac: 0.90, symbolFrac: 0.65, moveFrac: 0.40, interval: 60,  duration: 400 },
    { glitchFrac: 0.10, symbolFrac: 0.00, moveFrac: 0.00, interval: 160, duration: 300 },
  ],
  high: [
    { glitchFrac: 0.15, symbolFrac: 0.05, moveFrac: 0.05, interval: 140, duration: 250 },
    { glitchFrac: 0.70, symbolFrac: 0.40, moveFrac: 0.30, interval: 80,  duration: 400 },
    { glitchFrac: 0.95, symbolFrac: 0.80, moveFrac: 0.60, interval: 45,  duration: 500 },
    { glitchFrac: 0.20, symbolFrac: 0.05, moveFrac: 0.00, interval: 140, duration: 250 },
  ],
};

// ─── Single glitching word ────────────────────────────────────────────────────
function GlitchWord({ word, seed, glitchFrac, symbolFrac, moveFrac, glitchTick, colors, fonts, symbols }) {
  const isActive = seed < glitchFrac;
  const isSymbol = isActive && (seed * 13 % 1) < symbolFrac;
  const isMoving = isActive && (seed * 7  % 1) < moveFrac;

  const display = isSymbol
    ? word.split("").map(() => randOf(symbols)).join("")
    : word;

  const color = isActive ? randOf(colors) : undefined;
  const font  = isActive ? randOf(fonts)  : undefined;

  const moveX = isMoving ? (Math.sin(seed * 999 + glitchTick) * 10) + "px" : "0px";
  const moveY = isMoving ? (Math.cos(seed * 777 + glitchTick) * 7)  + "px" : "0px";

  return (
    <span style={{
      display:    "inline-block",
      whiteSpace: "pre",
      color,
      fontFamily: font,
      transform:  `translate(${moveX}, ${moveY})`,
      transition: isMoving ? "none" : "transform 0.3s ease",
      willChange: "transform",
    }}>
      {display}{" "}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GlitchText({
  text,
  as: Tag       = "span",
  mode          = "hover",
  autoInterval  = 3500,
  intensity     = "medium",
  colors        = DEFAULT_COLORS,
  fonts         = DEFAULT_FONTS,
  symbols       = DEFAULT_SYMBOLS,
  style,
  className,
  ...rest
}) {
  const words   = text.split(/\s+/).filter(Boolean);
  const profile = PROFILES[intensity] ?? PROFILES.medium;

  // Stable per-word seeds — generated once, stored in ref so they never
  // cause re-renders or trigger the infinite-update bug
  const seedsRef = useRef(null);
  if (!seedsRef.current || seedsRef.current.length !== words.length) {
    seedsRef.current = words.map(() => Math.random());
  }

  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchFrac,  setGlitchFrac]  = useState(0);
  const [symbolFrac,  setSymbolFrac]  = useState(0);
  const [moveFrac,    setMoveFrac]    = useState(0);
  const [glitchTick,  setGlitchTick]  = useState(0);
  const timers = useRef([]);

  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const triggerGlitch = useCallback(() => {
    if (isGlitching) return;
    clearAll();
    setIsGlitching(true);

    let elapsed   = 0;
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

    profile.forEach((phase) => {
      const t = setTimeout(() => {
        setGlitchFrac(phase.glitchFrac);
        setSymbolFrac(phase.symbolFrac);
        setMoveFrac(phase.moveFrac);
        startTick(phase.interval);
      }, elapsed);
      timers.current.push(t);
      elapsed += phase.duration;
    });

    const done = setTimeout(() => {
      clearAll();
      setGlitchFrac(0); setSymbolFrac(0); setMoveFrac(0);
      setGlitchTick(0); setIsGlitching(false);
    }, elapsed + 100);
    timers.current.push(done);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGlitching, intensity]);

  // Auto mode
  useEffect(() => {
    if (mode !== "auto" && mode !== "both") return;
    const id = setInterval(triggerGlitch, autoInterval);
    return () => clearInterval(id);
  }, [mode, autoInterval, triggerGlitch]);

  // Cleanup
  useEffect(() => () => clearAll(), []);

  // Force re-render on each tick so GlitchWord re-rolls its randomness
  void glitchTick;

  return (
    <Tag
      style={style}
      className={className}
      onMouseEnter={() => { if (mode === "hover" || mode === "both") triggerGlitch(); }}
      {...rest}
    >
      {words.map((word, i) => (
        <GlitchWord
          key={i}
          word={word}
          seed={seedsRef.current[i]}
          glitchFrac={glitchFrac}
          symbolFrac={symbolFrac}
          moveFrac={moveFrac}
          glitchTick={glitchTick}
          colors={colors}
          fonts={fonts}
          symbols={symbols}
        />
      ))}
    </Tag>
  );
}
