import React, { useState, useRef, useEffect, useCallback } from "react";

/**
 * ScatterText
 * ─────────────────────────────────────────────────────────────────────────────
 * Words start scattered at random positions across the screen, then fly
 * into place at individual speeds and stagger delays. Extracted from Piece7.
 *
 * Props:
 *   text         {string}  — text to display (required)
 *   as           {string}  — wrapper tag: "h1", "p", "div", etc. (default: "div")
 *   mode         {string}  — "mount" | "hover" | "auto" | "trigger"
 *                              mount   — plays once on mount (default)
 *                              hover   — replays on each hover
 *                              auto    — replays on interval
 *                              trigger — controlled externally via the `trigger` prop
 *   trigger      {number}  — increment this value to fire an animation (use with mode="trigger")
 *   autoInterval {number}  — ms between auto cycles (default: 4000)
 *   spreadX      {number}  — horizontal scatter radius as fraction of viewport width (default: 0.9)
 *   spreadY      {number}  — vertical scatter radius as fraction of viewport height (default: 0.9)
 *   minDelay     {number}  — minimum settle stagger delay per word in ms (default: 0)
 *   maxDelay     {number}  — maximum settle stagger delay per word in ms (default: 600)
 *   minDuration  {number}  — minimum word flight duration in ms (default: 380)
 *   maxDuration  {number}  — maximum word flight duration in ms (default: 680)
 *   style        {object}  — styles on the wrapper element
 *   className    {string}  — class on the wrapper element
 *   wordStyle    {object}  — styles applied to every word span
 *   wordClassName{string}  — class applied to every word span
 *
 * Usage:
 *   // Plays once on mount
 *   <ScatterText text="Collected Exorcisms" as="h1" />
 *
 *   // Re-scatters on hover
 *   <ScatterText text="justBones" as="h2" mode="hover" />
 *
 *   // Auto-repeating every 5s
 *   <ScatterText text="parasite" mode="auto" autoInterval={5000} />
 *
 *   // Externally triggered (e.g. on button click)
 *   const [t, setT] = useState(0);
 *   <button onClick={() => setT(n => n + 1)}>scatter</button>
 *   <ScatterText text="shedding_light" mode="trigger" trigger={t} />
 *
 *   // Tight scatter (words come from nearby) with slower settle
 *   <ScatterText text="N23" spreadX={0.3} spreadY={0.3} maxDelay={1200} maxDuration={900} />
 */

// ─── Single word ──────────────────────────────────────────────────────────────
function ScatterWord({ word, scatterX, scatterY, settleDelay, duration, phase }) {
  // phase: "scattered" | "settling" | "visible" | "reset"
  let transform = "translate(0px, 0px)";
  let opacity   = 1;

  if (phase === "reset" || phase === "scattered") {
    transform = `translate(${scatterX}px, ${scatterY}px)`;
    opacity   = 0;
  }

  const transition = phase === "settling"
    ? `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${settleDelay}ms,
       opacity   ${Math.round(duration * 0.7)}ms ease ${settleDelay}ms`
    : "none";

  return (
    <span style={{
      display:    "inline-block",
      whiteSpace: "pre",
      transform,
      opacity,
      transition,
      willChange: "transform, opacity",
    }}>
      {word}{" "}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ScatterText({
  text,
  as: Tag       = "div",
  mode          = "mount",
  trigger,
  autoInterval  = 4000,
  spreadX       = 0.9,
  spreadY       = 0.9,
  minDelay      = 0,
  maxDelay      = 600,
  minDuration   = 380,
  maxDuration   = 680,
  style,
  className,
  wordStyle,
  wordClassName,
  ...rest
}) {
  const words = text.split(/\s+/).filter(Boolean);

  // Per-word random values stored in a ref — never causes re-renders
  const metaRef = useRef(null);
  const buildMeta = useCallback(() => {
    metaRef.current = words.map(() => ({
      scatterX:    (Math.random() - 0.5) * window.innerWidth  * spreadX * 2,
      scatterY:    (Math.random() - 0.5) * window.innerHeight * spreadY * 2,
      settleDelay: minDelay + Math.random() * (maxDelay - minDelay),
      duration:    minDuration + Math.random() * (maxDuration - minDuration),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.length, spreadX, spreadY, minDelay, maxDelay, minDuration, maxDuration]);

  // phase: "reset" | "scattered" | "settling" | "visible"
  const [phase, setPhase]       = useState("visible"); // start visible, animate on trigger
  const [ready, setReady]       = useState(false);     // false until first meta is built
  const timers = useRef([]);
  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const runScatter = useCallback(() => {
    clearAll();
    buildMeta();                          // fresh random positions each time
    setPhase("reset");                    // snap words to scatter positions, invisible

    const t1 = setTimeout(() => {
      setPhase("scattered");              // still at scatter position, still invisible
      const t2 = setTimeout(() => {
        setPhase("settling");             // CSS transition fires, words fly home
        const longestSettle = (metaRef.current
          ? Math.max(...metaRef.current.map((m) => m.settleDelay + m.duration))
          : maxDelay + maxDuration) + 100;
        const t3 = setTimeout(() => setPhase("visible"), longestSettle);
        timers.current.push(t3);
      }, 40);
      timers.current.push(t2);
    }, 20);
    timers.current.push(t1);
    setReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildMeta, maxDelay, maxDuration]);

  // Mount mode — fire once on mount
  useEffect(() => {
    if (mode === "mount") runScatter();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger mode — fire when trigger increments
  const prevTrigger = useRef(trigger);
  useEffect(() => {
    if (mode !== "trigger") return;
    if (trigger !== prevTrigger.current) {
      prevTrigger.current = trigger;
      runScatter();
    }
  }, [mode, trigger, runScatter]);

  // Auto mode
  useEffect(() => {
    if (mode !== "auto") return;
    runScatter(); // fire immediately on mount too
    const id = setInterval(runScatter, autoInterval);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, autoInterval]);

  // Cleanup
  useEffect(() => () => clearAll(), []);

  // Build initial meta on first render so words have positions even before animation
  if (!metaRef.current) buildMeta();

  const meta = metaRef.current;

  return (
    <Tag
      style={style}
      className={className}
      onMouseEnter={() => { if (mode === "hover") runScatter(); }}
      {...rest}
    >
      {words.map((word, i) => (
        <ScatterWord
          key={i}
          word={word}
          scatterX={meta[i]?.scatterX ?? 0}
          scatterY={meta[i]?.scatterY ?? 0}
          settleDelay={meta[i]?.settleDelay ?? 0}
          duration={meta[i]?.duration ?? minDuration}
          phase={ready ? phase : "visible"}
        />
      ))}
    </Tag>
  );
}
