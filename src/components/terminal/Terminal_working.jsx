import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { useCamera } from "../../CameraContext";
import {
  useGame,
  PIECE_SLUGS,
  PIECE_TITLES,
  CD_ALIASES,
  PERSON_PIECES,
  OBITUARY_TEXT,
  formatRemaining,
} from "../../GameContext";
import GlitchText from "../GlitchText";

const PROMPT_PREFIX = "olivialee@10-08-2001 % ";
const COLS = 4; // grid columns for ls and find

const BOOT_STEPS = [
  {
    command: "questions?",
    hint: "questions?",
    response: [
      { text: "answers? no...", type: "output" },
      { text: "", type: "output" },
      {
        text: "you can always change the directory if you feel lost\u2026",
        type: "output",
      },
      { text: "", type: "output" },
    ],
  },
  {
    command: "help me please",
    hint: "help me please",
    response: [], // help lines rendered specially — built in handleBootSubmit
  },
];

const ALL_PEOPLE = Object.keys(PERSON_PIECES);

function matchPerson(input) {
  const lower = input.toLowerCase();
  return ALL_PEOPLE.find((p) => p.toLowerCase() === lower) ?? null;
}
function matchSlugFromCd(input) {
  return CD_ALIASES[input.toLowerCase()] ?? null;
}

function buildAcrostic(exorcismLines) {
  const target = ["O", "L", "I", "V", "I", "A"];
  return target.map((letter) => {
    const pool = exorcismLines.filter(
      (l) => l.trim().length > 0 && l.trim()[0].toUpperCase() === letter,
    );
    return pool.length
      ? pool[Math.floor(Math.random() * pool.length)]
      : `${letter}\u2026`;
  });
}

// Build grid rows from an array of strings, COLS wide
function toGrid(items, cols = COLS) {
  const colW = Math.max(...items.map((s) => s.length)) + 3;
  const rows = [];
  for (let i = 0; i < items.length; i += cols) {
    rows.push(
      items
        .slice(i, i + cols)
        .map((s) => s.padEnd(colW))
        .join(""),
    );
  }
  return rows;
}

// ─── Help line renderer ───────────────────────────────────────────────────────
// Renders: "ls : show directory contents" with cmd+colon white, desc white,
// "who" struck-through, "# ex. ..." gray italic
function HelpLineContent({ raw }) {
  // Format: "cmd : description # ex. example"
  const hashIdx = raw.indexOf(" # ");
  const main = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
  const example = hashIdx >= 0 ? raw.slice(hashIdx + 3) : null; // "ex. cd justBones"

  // Split "cmd : rest"
  const colonIdx = main.indexOf(" : ");
  const cmd = colonIdx >= 0 ? main.slice(0, colonIdx) : main;
  const desc = colonIdx >= 0 ? main.slice(colonIdx + 3) : "";

  // Handle "who" strikethrough in find line
  const renderDesc = (text) => {
    const whoIdx = text.indexOf("who");
    if (whoIdx === -1) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, whoIdx)}
        <span
          style={{
            textDecoration: "line-through",
            textDecorationColor: "#888",
          }}
        >
          who
        </span>
        {text.slice(whoIdx + 3)}
      </span>
    );
  };

  return (
    <span>
      <span style={{ color: "#c8c8c8" }}>{cmd} : </span>
      <span style={{ color: "#c8c8c8" }}>{renderDesc(desc)}</span>
      {example && (
        <span style={{ color: "#555", fontStyle: "italic" }}>
          {"\u00A0# " + example}
        </span>
      )}
    </span>
  );
}

const HELP_LINES_RAW = [
  "ls : show directory contents",
  "cd : change directory # ex. cd justBones",
  "find : who you're looking for\u2026 # ex. find Olivia",
  "obit : come at the close # ex. obit N23 or obit Olivia",
  "help : show terminal commands",
];

// Olivia final obituary — prints after the loop + glitch sequence
const OLIVIA_FINAL_ERRORS = [
  "ERROR: I told you this wasn\u2019t some game you could win.",
  "ERROR: You\u2019ve focused too much on the mechanics.",
  "ERROR: Spent too much time focusing on the way out.",
  "ERROR: I told you\u2026 answers aren\u2019t found in the terminal.",
  "ERROR: Why would you even want your own obituary?",
  "ERROR: Versions of you have died.",
  "ERROR: Versions of you have been mourned.",
  "ERROR: But some things stay with you.",
  "ERROR: Maybe you can let go of the eleven, maybe\u2026",
  "ERROR: Maybe not.",
  "ERROR: But those versions of you, you, you, Olivia\u2026",
  "ERROR: As deprecated as they are\u2026",
  "ERROR: As hard as it is to look them in the eye\u2026",
  "ERROR: As much as you think you\u2019re different now\u2026",
  "ERROR: As much as you pity them\u2026",
  "ERROR: And think you know better\u2026",
  "ERROR: They are here.",
  "ERROR: Waiting for you.",
  "ERROR: I told you\u2026 answers aren\u2019t found in the terminal.",
  "ERROR: answer not found.",
  "ERROR: Grief is not a question to be answered.",
  "ERROR: Grief is a process for processing\u2019s sake.",
  "ERROR: Grief is here.",
  "ERROR: She is here.",
  "ERROR: Waiting for you.",
  "ERROR: And you\u2019ll never be finished\u2026",
  "ERROR: It\u2019ll just get easier to do it.",
];

// ─── LockedName with glitch ───────────────────────────────────────────────────
function LockedObitName({ name }) {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGone(true), 1800);
    return () => clearTimeout(t);
  }, []);
  if (gone) return null;
  return (
    <GlitchText
      text={`\u2014 ${name}`}
      as="span"
      mode="auto"
      autoInterval={200}
      intensity="high"
      colors={["#333", "#222", "#444"]}
      style={{
        textDecoration: "line-through",
        textDecorationColor: "#444",
        color: "#333",
      }}
    />
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Terminal({ onboardingDone = false }) {
  const { goToPiece } = useCamera();
  const game = useGame();

  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState("boot-prompt");
  const [bootStep, setBootStep] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [exorcismLines, setExorcismLines] = useState([]);
  // Glitch overlay: when truthy, shows full-screen glitch-to-symbols effect
  const [glitchOverlay, setGlitchOverlay] = useState(null); // null | "scatter" | "symbols"

  const idRef = useRef(0);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const printQueueRef = useRef([]);
  const printBusyRef = useRef(false);
  const oliviaActiveRef = useRef(false);
  const oliviaTimersRef = useRef([]);
  const hasOpenedRef = useRef(false);

  const nextId = () => {
    idRef.current += 1;
    return idRef.current;
  };

  useEffect(() => {
    fetch("/assets/exorcisms.txt")
      .then((r) => r.text())
      .then((text) =>
        setExorcismLines(text.split("\n").filter((l) => l.trim())),
      )
      .catch(console.error);
  }, []);

  // Scroll to bottom on new content
  useLayoutEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines, phase]);

  // Scroll to bottom when window re-opens
  useLayoutEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isPrinting && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, isPrinting]);

  // ── Queued printer ────────────────────────────────────────────────────────
  const flushQueue = useCallback(() => {
    if (printQueueRef.current.length === 0) {
      printBusyRef.current = false;
      setIsPrinting(false);
      return;
    }
    printBusyRef.current = true;
    setIsPrinting(true);
    const { text, type, jsxContent, delay, resolve } =
      printQueueRef.current.shift();
    setTimeout(() => {
      setLines((prev) => [...prev, { id: nextId(), text, type, jsxContent }]);
      resolve();
      flushQueue();
    }, delay);
  }, []);

  const printLine = useCallback(
    (text, type = "output", delay = 40, jsxContent = null) => {
      return new Promise((resolve) => {
        printQueueRef.current.push({ text, type, delay, jsxContent, resolve });
        if (!printBusyRef.current) flushQueue();
      });
    },
    [flushQueue],
  );

  const printLines = useCallback(
    async (items, defaultDelay = 40) => {
      for (const item of items) {
        const text = typeof item === "string" ? item : (item.text ?? "");
        const type =
          typeof item === "string" ? "output" : (item.type ?? "output");
        const delay =
          typeof item === "object" && item.delay != null
            ? item.delay
            : defaultDelay;
        const jsx = typeof item === "object" ? (item.jsxContent ?? null) : null;
        await printLine(text, type, delay, jsx);
      }
    },
    [printLine],
  );

  // ── Olivia loop (5-second looping acrostic phase) ────────────────────────
  const stopOliviaLoop = useCallback(() => {
    oliviaActiveRef.current = false;
    oliviaTimersRef.current.forEach(clearTimeout);
    oliviaTimersRef.current = [];
  }, []);

  const runOliviaLoop = useCallback(async () => {
    oliviaActiveRef.current = true;

    // Print the initial acrostic
    const initialAcrostic = buildAcrostic(exorcismLines);
    const lineIds = [];
    for (const l of initialAcrostic) {
      if (!oliviaActiveRef.current) return;
      const id = nextId();
      lineIds.push(id);
      setLines((prev) => [...prev, { id, text: l, type: "obit-text" }]);
      await new Promise((r) => setTimeout(r, 200));
    }

    // Add blank line
    const blankId = nextId();
    setLines((prev) => [...prev, { id: blankId, text: "", type: "output" }]);
    await new Promise((r) => setTimeout(r, 100));

    // Now loop: continuously replace those 6 lines with new random selections
    const loopUpdate = () => {
      if (!oliviaActiveRef.current) return;
      const newAcrostic = buildAcrostic(exorcismLines);
      setLines((prev) => {
        return prev.map((line) => {
          const idx = lineIds.indexOf(line.id);
          if (idx !== -1) {
            // This is one of the acrostic lines - replace its text
            return { ...line, text: newAcrostic[idx] };
          }
          return line;
        });
      });

      // Schedule next update
      const t = setTimeout(loopUpdate, 300);
      oliviaTimersRef.current.push(t);
    };

    // Start the loop
    const t = setTimeout(loopUpdate, 300);
    oliviaTimersRef.current.push(t);
  }, [exorcismLines]);

  // ── Olivia final sequence ─────────────────────────────────────────────────
  // Phase: print acrostic → glitch in place 5s → scatter → symbols → ERROR lines → glitch flash → full reset
  const runOliviaFinalSequence = useCallback(async () => {
    // 1. Stop any active timers
    stopOliviaLoop();
    setPhase("olivia-final");

    // 2. Glitch the existing acrostic lines in place with scatter effect
    setGlitchOverlay("scatter");
    await new Promise((r) => setTimeout(r, 2000));

    // 3. Intensify to symbols: all lines become !@#$%^&*()
    setGlitchOverlay("symbols");
    await new Promise((r) => setTimeout(r, 1500));

    // 4. Hide overlay, clear lines, start printing ERROR sequence slowly (onboarding-style timing)
    setGlitchOverlay(null);
    setLines([]);

    // Varied delays like onboarding: 700-1300ms range
    const delays = [
      900, 700, 800, 1000, 1100, 850, 950, 1200, 750, 900, 1000, 850, 950, 800,
      900, 1000, 850, 900, 1100, 800, 1200, 950, 850, 900, 1000, 950, 1100,
    ];
    for (let i = 0; i < OLIVIA_FINAL_ERRORS.length; i++) {
      const delay = delays[i % delays.length];
      await printLine(OLIVIA_FINAL_ERRORS[i], "error", delay);
    }

    // 5. Brief pause, then intense final glitch flash
    await new Promise((r) => setTimeout(r, 1000));
    setGlitchOverlay("symbols");
    await new Promise((r) => setTimeout(r, 400));
    setGlitchOverlay("scatter");
    await new Promise((r) => setTimeout(r, 300));
    setGlitchOverlay("symbols");
    await new Promise((r) => setTimeout(r, 400));
    setGlitchOverlay(null);

    // 6. Clear localStorage and fully reset the website
    await new Promise((r) => setTimeout(r, 500));
    try {
      localStorage.clear();
      console.log("[Terminal] localStorage cleared. Reloading...");
    } catch (e) {
      console.error("[Terminal] Failed to clear localStorage:", e);
    }

    // Full page reload to reset everything
    window.location.reload();
  }, [stopOliviaLoop, printLine]);

  // ── Open / close ──────────────────────────────────────────────────────────
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    hasOpenedRef.current = true;
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    stopOliviaLoop();
    if (phase === "olivia-loop" || phase === "olivia-final") {
      setGlitchOverlay(null);
      setPhase("open");
    }
  }, [phase, stopOliviaLoop]);

  // ── Boot submission ───────────────────────────────────────────────────────
  const handleBootSubmit = useCallback(
    async (typed) => {
      const step = BOOT_STEPS[bootStep];
      await printLine(`${PROMPT_PREFIX}${typed}`, "committed-prompt", 0);

      if (typed.trim().toLowerCase() !== step.command.toLowerCase()) {
        await printLine(
          `ERROR: command not found: ${typed.trim()}`,
          "error",
          30,
        );
        return;
      }

      if (bootStep === 0) {
        await printLines(step.response, 45);
      } else {
        // Boot step 1: "help me please" → print formatted help
        await printLine("This is all I can give you.", "output", 45);
        await printLine("", "output", 20);
        for (const raw of HELP_LINES_RAW) {
          await printLine("", "help-jsx", 30, raw);
        }
        await printLine("", "output", 20);
      }

      if (bootStep < BOOT_STEPS.length - 1) {
        setBootStep((n) => n + 1);
      } else {
        setPhase("open");
        console.log("[Terminal] Boot complete. Free command mode.");
      }
    },
    [bootStep, printLine, printLines],
  );

  // ── Free command ──────────────────────────────────────────────────────────
  const handleCommand = useCallback(
    async (raw) => {
      const trimmed = raw.trim();
      if (oliviaActiveRef.current) {
        stopOliviaLoop();
        setPhase("open");
        if (!trimmed) return;
      }
      if (phase === "olivia-final") return; // can't interrupt final sequence
      if (!trimmed) return;

      console.log(`[Terminal] Command: "${trimmed}"`);
      await printLine(`${PROMPT_PREFIX}${trimmed}`, "committed-prompt", 0);

      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1).join(" ");

      // ── help ────────────────────────────────────────────────────────────────
      if (cmd === "help") {
        await printLine("", "output", 20);
        for (const raw of HELP_LINES_RAW) {
          await printLine("", "help-jsx", 30, raw);
        }
        await printLine("", "output", 20);
        return;
      }

      // ── ls ──────────────────────────────────────────────────────────────────
      if (cmd === "ls") {
        await printLine("", "output", 20);
        const completedMap = Object.fromEntries(
          PIECE_SLUGS.map((s) => [s, game.isTitleComplete(s)]),
        );
        console.log("[Terminal] ls — title completion:", completedMap);
        console.log(
          "[Terminal] ls — completedPieces:",
          game.state.completedPieces,
        );
        console.log(
          "[Terminal] ls — obituariesUnlocked:",
          game.state.obituariesUnlocked,
        );
        const titles = PIECE_SLUGS.map((slug) => PIECE_TITLES[slug]);
        const colW = Math.max(...titles.map((t) => t.length)) + 3;
        for (let i = 0; i < PIECE_SLUGS.length; i += COLS) {
          const row = PIECE_SLUGS.slice(i, i + COLS);
          const rowText = row
            .map((slug) => PIECE_TITLES[slug].padEnd(colW))
            .join("");
          const rowDone = row.every((slug) => game.isTitleComplete(slug));
          const rowType = row.map((slug) => game.isTitleComplete(slug));
          // Print as mixed — use jsxContent for per-cell strikethrough
          await printLine(rowText, "ls-row", 22, { slugs: row, colW });
        }
        await printLine("", "output", 20);
        return;
      }

      // ── cd ──────────────────────────────────────────────────────────────────
      if (cmd === "cd") {
        if (!args) {
          await printLine("ERROR: no directory specified", "error");
          return;
        }
        const slug = matchSlugFromCd(args);
        const pieceIdx = slug ? PIECE_SLUGS.indexOf(slug) + 1 : -1;
        if (!slug || pieceIdx < 1) {
          await printLine(`ERROR: directory not found \u2014 ${args}`, "error");
          return;
        }
        await printLine(
          `changing directory to ${PIECE_TITLES[slug]}\u2026`,
          "output",
        );
        goToPiece(pieceIdx);
        return;
      }

      // ── find ────────────────────────────────────────────────────────────────
      if (cmd === "find") {
        if (!args) {
          await printLine("ERROR: who are you looking for?", "error");
          return;
        }
        const person = matchPerson(args);
        if (!person) {
          await printLine("ERROR: answer not found", "error");
          return;
        }
        const slugs = PERSON_PIECES[person];
        console.log(`[Terminal] find ${person}:`, slugs);
        await printLine("", "output", 20);
        const colW = Math.max(...slugs.map((s) => PIECE_TITLES[s].length)) + 3;
        for (let i = 0; i < slugs.length; i += COLS) {
          const row = slugs.slice(i, i + COLS);
          await printLine("", "find-row", 22, { slugs: row, colW });
        }
        await printLine("", "output", 20);
        return;
      }

      // ── obit ────────────────────────────────────────────────────────────────
      if (cmd === "obit") {
        if (!args) {
          await printLine("ERROR: specify a name or piece title", "error");
          return;
        }

        const { ready, secondsRemaining } = game.checkTimerReady();
        if (!ready) {
          const msg = game.getNextTimerError();
          await printLine(msg, "error");
          return;
        }

        // obit [piece title]
        const slugFromArg = matchSlugFromCd(args);
        if (slugFromArg) {
          const people = Object.entries(PERSON_PIECES)
            .filter(([, pieces]) => pieces.includes(slugFromArg))
            .map(([name]) => name)
            .filter((name) => name !== "Olivia");
          console.log(
            `[Terminal] obit piece "${slugFromArg}" — people:`,
            people,
          );
          await printLine("", "output", 20);
          for (const person of people) {
            if (game.isObitUnlocked(person)) {
              console.log(`[Terminal] Printing obit for ${person}`);
              for (const l of OBITUARY_TEXT[person]) {
                await printLine(l, "obit-text", 70);
              }
              await printLine("", "output", 30);
            } else {
              console.log(`[Terminal] ${person} obit locked`);
              await printLine("", "obit-locked", 40, { name: person });
            }
          }
          return;
        }

        // obit Olivia
        if (args.toLowerCase() === "olivia") {
          if (!game.isObitUnlocked("Olivia")) {
            const msg = game.getNextObitError("Olivia");
            console.log(`[Terminal] Olivia obit locked: "${msg}"`);
            await printLine(msg, "error");
            return;
          }
          await printLine("", "output", 20);
          await printLines([
            {
              text: "for i, ch in enumerate(target):",
              type: "code",
              delay: 35,
            },
            {
              text: '    name_phrase[i] = { "letter": ch, "lines": [] }',
              type: "code",
              delay: 35,
            },
            { text: "", type: "output" },
            { text: "for i in name_phrase:", type: "code", delay: 35 },
            {
              text: '    letter = name_phrase[i]["letter"]',
              type: "code",
              delay: 35,
            },
            { text: "    for line in clean_lines:", type: "code", delay: 35 },
            {
              text: "        if line[0].lower() == letter:",
              type: "code",
              delay: 35,
            },
            {
              text: '            name_phrase[i]["lines"].append(line)',
              type: "code",
              delay: 35,
            },
            { text: "", type: "output" },
            { text: "for i in name_phrase:", type: "code", delay: 35 },
            {
              text: '    print(random.choice(name_phrase[i]["lines"]))',
              type: "code",
              delay: 35,
            },
            { text: "", type: "output" },
          ]);
          setPhase("olivia-loop");
          runOliviaLoop();
          // After 5 seconds, transition to final sequence automatically
          const finalTimer = setTimeout(() => {
            runOliviaFinalSequence();
          }, 5000);
          oliviaTimersRef.current.push(finalTimer);
          return;
        }

        // obit [person name]
        const person = matchPerson(args);
        if (person) {
          if (!game.isObitUnlocked(person)) {
            const msg = game.getNextObitError(person);
            console.log(`[Terminal] ${person} obit locked: "${msg}"`);
            await printLine(msg, "error");
            return;
          }
          console.log(`[Terminal] Printing obit for ${person}`);
          await printLine("", "output", 20);
          for (const l of OBITUARY_TEXT[person]) {
            await printLine(l, "obit-text", 70);
          }
          await printLine("", "output", 20);
          return;
        }

        await printLine("ERROR: answer not found", "error");
        return;
      }

      // ── debug (dev only) ────────────────────────────────────────────────────
      if (cmd === "debug") {
        const s = game.state;
        console.log("[DEBUG] Full game state:", JSON.parse(JSON.stringify(s)));
        await printLine("", "output", 10);
        await printLine(
          `completed: ${Object.keys(s.completedPieces).join(", ") || "none"}`,
          "code",
          10,
        );
        await printLine(
          `visited:   ${Object.keys(s.visitedPieces).join(", ") || "none"}`,
          "code",
          10,
        );
        await printLine(
          `obits:     ${Object.keys(s.obituariesUnlocked).join(", ") || "none"}`,
          "code",
          10,
        );
        await printLine(
          `timer:     ${s.timerStartedAt ? "started" : "not started"}`,
          "code",
          10,
        );
        await printLine("", "output", 10);
        return;
      }

      await printLine(`ERROR: command not found: ${cmd}`, "error");
    },
    [
      game,
      goToPiece,
      phase,
      printLine,
      printLines,
      runOliviaLoop,
      runOliviaFinalSequence,
      stopOliviaLoop,
    ],
  );

  // ── Keydown ───────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (isPrinting) return;
      const val = input.trim();
      setInput("");
      if (phase === "boot-prompt") handleBootSubmit(val);
      else handleCommand(val);
    },
    [input, isPrinting, phase, handleBootSubmit, handleCommand],
  );

  const handleWheel = (e) => e.stopPropagation();

  const currentHint =
    phase === "boot-prompt" ? (BOOT_STEPS[bootStep]?.hint ?? "") : "";

  // Don't render pill at all until onboarding is done
  if (!onboardingDone) return null;

  return (
    <>
      {/* ── Minimized pill ── */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: "#000",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 3,
            fontFamily: "'Jacquard12', serif",
            fontSize: "1rem",
            padding: "5px 16px",
            cursor: "pointer",
            letterSpacing: "0.06em",
            boxShadow: "0 0 8px rgba(255,255,255,0.05)",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)";
            e.currentTarget.style.boxShadow = "0 0 14px rgba(255,255,255,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
            e.currentTarget.style.boxShadow = "0 0 8px rgba(255,255,255,0.05)";
          }}
        >
          terminal
        </button>
      )}

      {/* ── Open window ── */}
      {isOpen && (
        <div
          onWheel={handleWheel}
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9998,
            pointerEvents: "none",
          }}
        >
          <div
            onClick={handleClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              pointerEvents: "auto",
            }}
          />
          <div
            onClick={() => inputRef.current?.focus()}
            style={{
              position: "relative",
              pointerEvents: "auto",
              width: "min(700px, 92vw)",
              height: "min(500px, 78vh)",
              background: "#000",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 4,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 12px 48px rgba(0,0,0,0.9)",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "13px",
              lineHeight: "1.65",
              overflow: "hidden",
              cursor: "text",
            }}
          >
            {/* Title bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                flexShrink: 0,
                cursor: "default",
              }}
            >
              <span
                style={{
                  fontFamily: "'Jacquard12', serif",
                  fontSize: "0.95rem",
                  color: "#fff",
                  letterSpacing: "0.05em",
                }}
              >
                terminal
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  lineHeight: 1,
                  padding: "1px 4px",
                  fontFamily: "monospace",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
                }
              >
                ×
              </button>
            </div>

            {/* Output */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "14px 20px 12px",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.1) transparent",
                position: "relative",
              }}
            >
              {/* Glitch overlay for Olivia final sequence */}
              {glitchOverlay && (
                <GlitchOverlay mode={glitchOverlay} lines={lines} />
              )}

              {lines.map((line) => (
                <LineRow key={line.id} line={line} game={game} />
              ))}

              {/* Inline prompt */}
              {!isPrinting && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    position: "relative",
                    minHeight: "1.65em",
                  }}
                >
                  <span
                    style={{
                      color: "#c8c8c8",
                      whiteSpace: "pre",
                      flexShrink: 0,
                    }}
                  >
                    {PROMPT_PREFIX}
                  </span>
                  {currentHint && !input && (
                    <span
                      style={{
                        position: "absolute",
                        left: `${PROMPT_PREFIX.length}ch`,
                        color: "#444",
                        fontStyle: "italic",
                        pointerEvents: "none",
                        whiteSpace: "pre",
                      }}
                    >
                      {currentHint}
                    </span>
                  )}
                  <span
                    style={{
                      color: "#c8c8c8",
                      whiteSpace: "pre",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {input}
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      width: "7px",
                      height: "13px",
                      backgroundColor: "#c8c8c8",
                      marginLeft: "1px",
                      verticalAlign: "middle",
                      animation: "termBlink 1s step-end infinite",
                    }}
                  />
                </div>
              )}
              {isPrinting && (
                <span
                  style={{
                    display: "inline-block",
                    width: "7px",
                    height: "13px",
                    backgroundColor: "#555",
                    marginLeft: "2px",
                    verticalAlign: "middle",
                    animation: "termBlink 0.5s step-end infinite",
                  }}
                />
              )}
            </div>

            {/* Hidden input */}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => !isPrinting && setInput(e.target.value)}
              onKeyDown={handleKeyDown}
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
              spellCheck={false}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes termBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @font-face {
          font-family: 'Jacquard12';
          src: url('/assets/Jacquard12-Regular.ttf') format('truetype');
        }
      `}</style>
    </>
  );
}

// ─── GlitchOverlay ────────────────────────────────────────────────────────────
// "scatter" mode: existing lines dissolve into random characters
// "symbols" mode: fills the terminal with !@#$%^&*() characters
const SYMBOL_CHARS = "!@#$%^&*()";
function randomSymbol() {
  return SYMBOL_CHARS[Math.floor(Math.random() * SYMBOL_CHARS.length)];
}
function randomGlitch() {
  const chars =
    "!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return chars[Math.floor(Math.random() * chars.length)];
}

function GlitchOverlay({ mode, lines }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => f + 1), 80);
    return () => clearInterval(id);
  }, []);

  if (mode === "symbols") {
    // Fill with a block of symbol characters
    const rows = 18;
    const cols = 55;
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#000",
          zIndex: 10,
          padding: "14px 20px",
          overflow: "hidden",
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "13px",
          lineHeight: "1.65",
          color: "#e05555",
        }}
      >
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} style={{ whiteSpace: "pre" }}>
            {Array.from({ length: cols }, () => randomSymbol()).join("")}
          </div>
        ))}
      </div>
    );
  }

  // "scatter" mode: show existing text but with random character replacements
  const textLines =
    lines.length > 0
      ? lines.map((l) => l.text || "")
      : Array.from({ length: 8 }, () => "");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#000",
        zIndex: 10,
        padding: "14px 20px",
        overflow: "hidden",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "13px",
        lineHeight: "1.65",
        color: "#c8c8c8",
      }}
    >
      {textLines.map((text, i) => (
        <div key={i} style={{ whiteSpace: "pre-wrap", minHeight: "1.65em" }}>
          {text
            .split("")
            .map((ch, j) =>
              ch !== " " && Math.random() < 0.4 ? randomGlitch() : ch,
            )
            .join("")}
        </div>
      ))}
    </div>
  );
}

// ─── LineRow ──────────────────────────────────────────────────────────────────
function LineRow({ line, game }) {
  const base = {
    minHeight: "1.65em",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    marginBottom: "1px",
    display: "block",
  };

  // Help line with JSX rendering
  if (line.type === "help-jsx" && line.jsxContent) {
    return (
      <div style={base}>
        <HelpLineContent raw={line.jsxContent} />
      </div>
    );
  }

  // ls-row and find-row — identical grid renderer, no wrapping
  if (
    (line.type === "ls-row" || line.type === "find-row") &&
    line.jsxContent?.slugs
  ) {
    const { slugs, colW } = line.jsxContent;
    return (
      <div
        style={{
          ...base,
          display: "block",
          whiteSpace: "pre",
          overflow: "visible",
        }}
      >
        {slugs.map((slug) => {
          const done = game.isTitleComplete(slug);
          const title = PIECE_TITLES[slug].padEnd(colW);
          return (
            <span
              key={slug}
              style={{
                color: done ? "#444" : "#c8c8c8",
                textDecoration: done ? "line-through" : "none",
                textDecorationColor: "#444",
                whiteSpace: "pre",
                fontFamily: "inherit",
                display: "inline",
              }}
            >
              {title}
            </span>
          );
        })}
      </div>
    );
  }

  // Locked obit name — GlitchText then vanishes
  if (line.type === "obit-locked" && line.jsxContent?.name) {
    return (
      <div style={base}>
        <LockedObitName name={line.jsxContent.name} />
      </div>
    );
  }

  return (
    <div style={{ ...base, ...lineStyle(line.type) }}>
      {line.text || "\u00A0"}
    </div>
  );
}

function lineStyle(type) {
  switch (type) {
    case "committed-prompt":
      return { color: "#c8c8c8" };
    case "output":
      return { color: "#c8c8c8" };
    case "error":
      return { color: "#e05555" };
    case "ls-item":
      return { color: "#c8c8c8" };
    case "ls-done":
      return {
        color: "#444",
        textDecoration: "line-through",
        textDecorationColor: "#444",
      };
    case "obit-name":
      return { color: "#fff", letterSpacing: "0.03em" };
    case "obit-text":
      return { color: "#c8c8c8", paddingLeft: "1em", fontStyle: "italic" };
    case "code":
      return { color: "#888" };
    case "hint":
      return { color: "#444", fontStyle: "italic" };
    default:
      return { color: "#c8c8c8" };
  }
}
