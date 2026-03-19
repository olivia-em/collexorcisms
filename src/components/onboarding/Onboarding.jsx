import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Onboarding.module.css"; // imports Jacquard12 font-face

// ─── Script ──────────────────────────────────────────────────────────────────
const SCRIPT = [
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 % ",
    command: "cd collected_exorcisms",
  },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 collected_exorcisms % ",
    command: "ls",
  },
  {
    type: "output",
    lines: [
      "justBones         129               lack_of_flight    my_familiar",
      "CASS&RA           cursedVisions     untitled          objects_in_eleven",
      "silhouettes       confessions       secrets           parasite",
      "the_empathy_machine  s_curves      31                shedding_light",
      "N23               i_am_malicious   first_on_first_on_first  teeth_marks",
      "fetish            parthenogenesis  collex.txt",
    ],
  },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 collected_exorcisms % ",
    command: "cat collex.txt",
  },
  {
    type: "timed-output",
    lines: [
      { text: "", delay: 400 },
      { text: "grief is a process", delay: 900 },
      { text: "you move back to move forward to move back again", delay: 500 },
      { text: "", delay: 1300 },
      { text: "grief is a collection of unrelated things", delay: 1000 },
      { text: "when you put them", delay: 500 },
      { rich: true, jsx: "stacking-block", delay: 500 },
      { rich: true, jsx: "deprecated-line", delay: 1800 },
      { text: "", delay: 1300 },
      { text: "\u2026there is meaning there", delay: 1000 },
      { text: "there is a processing\u2026", delay: 500 },
      { text: "", delay: 1500 },
      { text: "But is there an end?", delay: 1300 },
      { text: "", delay: 1500 },
      { text: "Do you feel lost?", delay: 1300 },
      { text: "", delay: 1500 },
      { text: "You can always change the directory\u2026", delay: 1300 },
      { text: "", delay: 1500 },
      { rich: true, jsx: "but-the-only-way", delay: 1300 },
      { text: "", delay: 1700 },
      {
        text: "Will you begin anyway\u2026 even if you can't finish? (y/n)",
        delay: 1400,
      },
    ],
  },
  { type: "yn" },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 collected_exorcisms % ",
    command: "cd justBones",
  },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 justBones % ",
    command: "ls",
  },
  {
    type: "link-sequence",
    lines: [
      {
        text: "A younger version of me...",
        url: "https://github.com/olivia-em/justBones",
        linkWord: "younger version",
      },
      {
        text: "felt what I could only fully describe now.",
        url: "http://justbones.oliviaem.art/",
        linkWord: "fully describe",
      },
      {
        text: "I have been sitting on these feelings for quite some time...",
        url: "https://github.com/olivia-em/bittersweet",
        linkWord: "these feelings",
      },
      { text: "and now I'm ready to move with them beside me.", url: null },
    ],
  },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 justBones % ",
    command: "cat justBones.txt",
  },
  { type: "output", lines: ["", "justBones", ""] },
  {
    type: "timed-output",
    lines: [
      { rich: true, jsx: "justBones-poem", delay: 300 },
      { text: "", delay: 200 },
    ],
  },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 justBones % ",
    command: "cd ..",
  },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 collected_exorcisms % ",
    command: "cat collex.txt",
  },
  { type: "output", lines: ["", "Are you ready?", ""] },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 collected_exorcisms % ",
    command: "I'm ready.",
    isFinal: true,
  },
];

const LINE_DELAY = 80;
const LINK_PAUSE = 600;
const GLITCH_COLORS = ["#c8c8c8", "#e05555", "#00ffff"];
const GLITCH_FONTS = [
  "'Courier New', Courier, monospace",
  "'Jacquard12', serif",
];
const SYMBOLS = "!@#$%^&*()".split("");

const randOf = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randSymbol = () => randOf(SYMBOLS);

// ─── Stacking Block ───────────────────────────────────────────────────────────
function StackingBlock() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowTop(true), 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <span style={{ display: "block" }}>
      {showTop && (
        <span
          style={{
            display: "block",
            color: "#999",
            animation: "slideDown 0.45s cubic-bezier(0.22,1,0.36,1) forwards",
          }}
        >
          on top of each other
        </span>
      )}
      <span style={{ display: "block", color: "#999" }}>
        next to each other
      </span>
    </span>
  );
}

// ─── Deprecated Flicker ───────────────────────────────────────────────────────
function DeprecatedLine() {
  const [opacity, setOpacity] = useState(0.08);
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    let elapsed = 0;
    const totalMs = 2200;
    let t;
    const tick = () => {
      const interval = 60 + Math.random() * 80;
      elapsed += interval;
      if (elapsed >= totalMs) {
        setSolid(true);
        return;
      }
      setOpacity(
        Math.random() < 0.5 ? Math.random() * 0.12 : 0.2 + Math.random() * 0.55,
      );
      t = setTimeout(tick, interval);
    };
    t = setTimeout(tick, 60);
    return () => clearTimeout(t);
  }, []);
  return (
    <span style={{ color: "#999" }}>
      torn apart,{" "}
      <span
        style={{
          opacity: solid ? 1 : opacity,
          transition: solid ? "opacity 0.35s ease" : "none",
        }}
      >
        deprecated
      </span>
      , and pieced together again
    </span>
  );
}

// ─── Rich Content ─────────────────────────────────────────────────────────────
const RICH_CONTENT = {
  "stacking-block": <StackingBlock />,
  "deprecated-line": <DeprecatedLine />,
  "but-the-only-way": (
    <span style={{ color: "#999" }}>
      But the only way{" "}
      <span
        style={{ textDecoration: "line-through", textDecorationColor: "#666" }}
      >
        out
      </span>{" "}
      is through.
    </span>
  ),
  "justBones-poem": (
    <span
      style={{
        display: "block",
        whiteSpace: "pre-wrap",
        lineHeight: "1.6",
        color: "#999",
      }}
    >
      {`pretty please, just let me rot
until I go unknown
ugly breed, so fallen off
what am I when I'm alone?

peel off my skin
and take my eyes;
replace them with
unseeing stones.

slice me open
and feed the flies;
they'll strip me down
til' i'm just bones

and then from there,
we'll go\u2026`}
    </span>
  ),
};

// ─── Link Line ────────────────────────────────────────────────────────────────
function LinkLine({ line, onClick }) {
  const text = line.content ?? line.text ?? "";
  if (!line.url || !line.linkWord)
    return <span style={{ color: "#999" }}>{text}</span>;
  const idx = text.indexOf(line.linkWord);
  if (idx === -1) return <span style={{ color: "#999" }}>{text}</span>;
  return (
    <span style={{ color: "#999" }}>
      {text.slice(0, idx)}
      <span
        onClick={onClick}
        style={{
          color: line.clicked ? "#555" : "#c8c8c8",
          textDecoration: line.clicked ? "line-through" : "underline",
          textUnderlineOffset: "3px",
          cursor: line.clicked ? "default" : "pointer",
          transition: "color 0.3s",
        }}
      >
        {text.slice(idx, idx + line.linkWord.length)}
      </span>
      {text.slice(idx + line.linkWord.length)}
    </span>
  );
}

// ─── Glitched Text ────────────────────────────────────────────────────────────
// Renders a plain string with per-character glitch state applied in-place.
// glitchLevel 0–1: fraction of chars affected. symbolLevel 0–1: fraction replaced w/ symbols.
function GlitchedText({ text, glitchLevel, symbolLevel, baseColor }) {
  // Each char gets a stable random seed so flicker doesn't reassign every render
  const seedsRef = useRef([]);
  if (seedsRef.current.length !== text.length) {
    seedsRef.current = Array.from({ length: text.length }, () => Math.random());
  }
  const seeds = seedsRef.current;

  return (
    <>
      {Array.from(text).map((ch, i) => {
        const isActive = seeds[i] < glitchLevel;
        const isSymbol = isActive && seeds[i] < symbolLevel;
        const color = isActive ? randOf(GLITCH_COLORS) : baseColor;
        const font = isActive
          ? randOf(GLITCH_FONTS)
          : "'Courier New', Courier, monospace";
        const display = isSymbol && ch.trim() !== "" ? randSymbol() : ch;
        return (
          <span key={i} style={{ color, fontFamily: font }}>
            {display}
          </span>
        );
      })}
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildInitialTermState() {
  return {
    lines: [],
    stepIndex: 0,
    phase: "idle",
    outputLineIndex: 0,
    linkLineIndex: 0,
    input: "",
    error: null,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Onboarding({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [glitching, setGlitching] = useState(false);
  // glitchLevel: 0–1 fraction of chars that are active
  // symbolLevel: 0–1 fraction of active chars replaced with symbols
  // overlayOpacity: drives the stutter-out
  const [glitchLevel, setGlitchLevel] = useState(0);
  const [symbolLevel, setSymbolLevel] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  // tick counter: increments on each glitch interval to force re-render of GlitchedText seeds
  const [glitchTick, setGlitchTick] = useState(0);
  const [term, setTerm] = useState(buildInitialTermState);

  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const idCounter = useRef(0);
  const passkeyBuffer = useRef("");
  const PASSKEY = "0114";

  const nextId = () => {
    idCounter.current += 1;
    return idCounter.current;
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [term.lines, term.phase]);
  useEffect(() => {
    if (term.phase === "waiting-input") inputRef.current?.focus();
  }, [term.phase]);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // ── Glitch sequence: ramp up then stutter out
  const triggerComplete = useCallback(() => {
    setGlitching(true);
    const timers = [];

    // Phase 1 (0–800ms): fonts+colors only, sparse, slow tick
    // Phase 2 (800–1800ms): more chars, some symbols, medium tick
    // Phase 3 (1800–3000ms): most chars, heavy symbols, fast tick

    const phases = [
      { glitchLevel: 0.06, symbolLevel: 0.0, interval: 250, duration: 800 },
      { glitchLevel: 0.35, symbolLevel: 0.12, interval: 140, duration: 1000 },
      { glitchLevel: 0.85, symbolLevel: 0.55, interval: 70, duration: 1200 },
    ];

    let elapsed = 0;
    let tickInterval = null;

    const startTick = (interval) => {
      if (tickInterval) clearInterval(tickInterval);
      tickInterval = setInterval(() => setGlitchTick((n) => n + 1), interval);
    };

    phases.forEach((phase) => {
      timers.push(
        setTimeout(() => {
          setGlitchLevel(phase.glitchLevel);
          setSymbolLevel(phase.symbolLevel);
          startTick(phase.interval);
        }, elapsed),
      );
      elapsed += phase.duration;
    });

    // Stutter out after all phases
    const stutterSeq = [1, 0, 1, 0, 0.7, 0, 0.4, 0, 1, 0];
    stutterSeq.forEach((op, i) => {
      timers.push(
        setTimeout(
          () => {
            setOverlayOpacity(op);
            if (i === stutterSeq.length - 1) {
              clearInterval(tickInterval);
              setVisible(false);
              onComplete?.();
            }
          },
          elapsed + i * 80,
        ),
      );
    });

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(tickInterval);
    };
  }, [onComplete]);

  // ── Dev passkey
  useEffect(() => {
    const onKey = (e) => {
      passkeyBuffer.current = (passkeyBuffer.current + e.key).slice(
        -PASSKEY.length,
      );
      if (passkeyBuffer.current === PASSKEY) {
        passkeyBuffer.current = "";
        triggerComplete();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [triggerComplete]);

  // ── Advance step
  const advanceStep = useCallback((fromState) => {
    const nextIndex = fromState.stepIndex + 1;
    if (nextIndex >= SCRIPT.length) return { ...fromState, phase: "done" };
    const step = SCRIPT[nextIndex];
    let s = { ...fromState, stepIndex: nextIndex, error: null };
    if (step.type === "output" || step.type === "timed-output") {
      s.phase = "printing";
      s.outputLineIndex = 0;
    } else if (step.type === "prompt") {
      s.phase = "waiting-input";
      s.input = "";
    } else if (step.type === "yn") {
      s.phase = "waiting-yn";
    } else if (step.type === "link-sequence") {
      s.phase = "printing";
      s.linkLineIndex = 0;
    }
    return s;
  }, []);

  const resetAll = useCallback(() => {
    idCounter.current = 0;
    setTerm({ ...buildInitialTermState(), phase: "waiting-input" });
  }, []);

  // ── Printer
  useEffect(() => {
    if (term.phase !== "printing") return;
    const step = SCRIPT[term.stepIndex];

    if (step.type === "output") {
      if (term.outputLineIndex >= step.lines.length) {
        setTerm((p) => advanceStep(p));
        return;
      }
      const t = setTimeout(() => {
        setTerm((p) => ({
          ...p,
          lines: [
            ...p.lines,
            {
              id: nextId(),
              content: step.lines[term.outputLineIndex],
              lineType: "output",
            },
          ],
          outputLineIndex: p.outputLineIndex + 1,
        }));
      }, LINE_DELAY);
      return () => clearTimeout(t);
    }

    if (step.type === "timed-output") {
      if (term.outputLineIndex >= step.lines.length) {
        setTerm((p) => advanceStep(p));
        return;
      }
      const entry = step.lines[term.outputLineIndex];
      const t = setTimeout(() => {
        setTerm((p) => ({
          ...p,
          lines: [
            ...p.lines,
            {
              id: nextId(),
              content: entry.rich ? entry.jsx : entry.text,
              lineType: entry.rich ? "rich" : "output",
            },
          ],
          outputLineIndex: p.outputLineIndex + 1,
        }));
      }, entry.delay ?? LINE_DELAY);
      return () => clearTimeout(t);
    }

    if (step.type === "link-sequence") {
      if (term.linkLineIndex >= step.lines.length) {
        setTerm((p) => advanceStep(p));
        return;
      }
      const entry = step.lines[term.linkLineIndex];
      const t = setTimeout(() => {
        setTerm((p) => ({
          ...p,
          lines: [
            ...p.lines,
            {
              id: nextId(),
              content: entry.text,
              url: entry.url,
              linkWord: entry.linkWord ?? null,
              lineType: entry.url ? "link" : "output",
              clicked: false,
            },
          ],
          phase: entry.url ? "waiting-link" : "printing",
          linkLineIndex: p.linkLineIndex + 1,
        }));
      }, LINE_DELAY);
      return () => clearTimeout(t);
    }
  }, [
    term.phase,
    term.outputLineIndex,
    term.linkLineIndex,
    term.stepIndex,
    advanceStep,
  ]);

  useEffect(() => {
    if (SCRIPT[0].type === "prompt")
      setTerm((p) => ({ ...p, phase: "waiting-input" }));
  }, []);

  const handleLinkClick = useCallback((lineId, url) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setTerm((p) => ({
      ...p,
      lines: p.lines.map((l) =>
        l.id === lineId ? { ...l, clicked: true } : l,
      ),
    }));
    setTimeout(() => {
      setTerm((p) =>
        p.phase !== "waiting-link" ? p : { ...p, phase: "printing" },
      );
    }, LINK_PAUSE);
  }, []);

  const handleInput = useCallback(
    (e) => {
      if (term.phase !== "waiting-input") return;
      setTerm((p) => ({ ...p, input: e.target.value, error: null }));
    },
    [term.phase],
  );

  const handleKeyDown = useCallback(
    (e) => {
      const step = SCRIPT[term.stepIndex];
      if (term.phase === "waiting-input" && e.key === "Enter") {
        e.preventDefault();
        const typed = term.input.trim();
        const expected = step.command.trim();
        const promptLine = {
          id: nextId(),
          content: step.prefix + typed,
          lineType: "committed-prompt",
        };
        if (typed.toLowerCase() === expected.toLowerCase()) {
          setTerm((p) => {
            if (step.isFinal)
              return { ...p, lines: [...p.lines, promptLine], phase: "done" };
            return advanceStep({
              ...p,
              lines: [...p.lines, promptLine],
              input: "",
              error: null,
            });
          });
          if (step.isFinal) setTimeout(triggerComplete, 400);
        } else {
          const errorLine = {
            id: nextId(),
            content: `ERROR: answer not found — '${typed}'`,
            lineType: "error",
          };
          setTerm((p) => ({
            ...p,
            lines: [...p.lines, promptLine, errorLine],
            input: "",
            error: true,
          }));
        }
      }
      if (term.phase === "waiting-yn") {
        if (e.key === "y" || e.key === "Y") {
          e.preventDefault();
          e.stopPropagation();
          const yLine = {
            id: nextId(),
            content: "olivialee@10-08-2001 collected_exorcisms % y",
            lineType: "committed-prompt",
          };
          setTerm((p) =>
            advanceStep({ ...p, lines: [...p.lines, yLine], input: "" }),
          );
        } else if (e.key === "n" || e.key === "N") {
          e.preventDefault();
          e.stopPropagation();
          resetAll();
        }
      }
    },
    [
      term.phase,
      term.stepIndex,
      term.input,
      advanceStep,
      resetAll,
      triggerComplete,
    ],
  );

  if (!visible) return null;

  const currentStep = SCRIPT[term.stepIndex];
  const showPrompt =
    term.phase === "waiting-input" && currentStep?.type === "prompt";
  const showYN = term.phase === "waiting-yn";

  // ── Renders a line's text content with glitch applied if active
  const renderLineContent = (line) => {
    if (line.lineType === "link") {
      return (
        <LinkLine
          line={line}
          onClick={() => !line.clicked && handleLinkClick(line.id, line.url)}
        />
      );
    }
    if (line.lineType === "rich") {
      return RICH_CONTENT[line.content] ?? null;
    }
    // Plain text — wrap in GlitchedText when glitching is active
    const baseColor =
      line.lineType === "error"
        ? "#e05555"
        : line.lineType === "committed-prompt"
          ? "#c8c8c8"
          : "#999";
    if (
      glitching &&
      typeof line.content === "string" &&
      line.content.trim() !== ""
    ) {
      return (
        // key includes glitchTick so seeds re-roll each tick
        <GlitchedText
          key={glitchTick}
          text={line.content}
          glitchLevel={glitchLevel}
          symbolLevel={symbolLevel}
          baseColor={baseColor}
        />
      );
    }
    return <span style={{ color: baseColor }}>{line.content}</span>;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "15px",
        fontWeight: 800,
        lineHeight: "1.6",
        overflowY: "auto",
        overflowX: "hidden",
        padding: "24px 32px 48px",
        boxSizing: "border-box",
        cursor: "text",
        zIndex: 9999,
        opacity: glitching ? overlayOpacity : 1,
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {term.lines.map((line) => (
        <div
          key={line.id}
          style={{
            marginBottom: "2px",
            minHeight: "1.6em",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {renderLineContent(line)}
        </div>
      ))}

      {showPrompt && (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            position: "relative",
          }}
        >
          <span style={{ color: "#c8c8c8", whiteSpace: "pre" }}>
            {currentStep.prefix}
          </span>
          <span
            style={{
              position: "absolute",
              left: `${currentStep.prefix.length}ch`,
              color: "#444",
              fontStyle: "italic",
              pointerEvents: "none",
              whiteSpace: "pre",
            }}
          >
            {currentStep.command}
          </span>
          <span
            style={{
              color: "#c8c8c8",
              whiteSpace: "pre",
              position: "relative",
              zIndex: 1,
            }}
          >
            {term.input}
          </span>
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "14px",
              backgroundColor: "#c8c8c8",
              marginLeft: "1px",
              verticalAlign: "middle",
              animation: "blink 1s step-end infinite",
            }}
          />
        </div>
      )}

      {showYN && (
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ color: "#c8c8c8", whiteSpace: "pre" }}>
            olivialee@10-08-2001 collected_exorcisms %{" "}
          </span>
          <span style={{ color: "#444", fontStyle: "italic" }}>y/n</span>
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "14px",
              backgroundColor: "#c8c8c8",
              marginLeft: "4px",
              verticalAlign: "middle",
              animation: "blink 1s step-end infinite",
            }}
          />
        </div>
      )}

      <input
        ref={inputRef}
        value={term.input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        autoFocus
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: 0,
          height: 0,
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      <div ref={bottomRef} />

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes slideDown {
          from { transform: translateY(-1.6em); opacity: 0; }
          to   { transform: translateY(0);      opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
      `}</style>
    </div>
  );
}
