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
const COLS = 4;

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
    response: [],
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

// ─── Glitch constants — matching Onboarding exactly ──────────────────────────
const GLITCH_COLORS = ["#c8c8c8", "#e05555", "#00ffff"];
const GLITCH_FONTS = [
  "'Courier New', Courier, monospace",
  "'Jacquard12', serif",
];
const SYMBOLS = "!@#$%^&*()".split("");
const randOf = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randSymbol = () => randOf(SYMBOLS);

// ─── GlitchedText — per-character font/color/symbol (matches Onboarding) ─────
function GlitchedText({ text, glitchLevel, symbolLevel, baseColor }) {
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

// ─── Help line renderer ───────────────────────────────────────────────────────
function HelpLineContent({ raw }) {
  const hashIdx = raw.indexOf(" # ");
  const main = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
  const example = hashIdx >= 0 ? raw.slice(hashIdx + 3) : null;
  const colonIdx = main.indexOf(" : ");
  const cmd = colonIdx >= 0 ? main.slice(0, colonIdx) : main;
  const desc = colonIdx >= 0 ? main.slice(colonIdx + 3) : "";

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

const OLIVIA_ONLY_PIECE_ERRORS = [
  "ERROR: Obituary unfinished.",
  "ERROR: This one is just for you\u2026 and it\u2019s not ready.",
  "ERROR: This one is just for you\u2026 and you\u2019re not ready.",
  "ERROR: Olivia, your obituary is still being written.",
];

// Consistent delay for all error lines
const ERROR_DELAY = 1500;

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
      colors={["red", "cyan", "#999"]}
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

  // ── Glitch state — mirrors Onboarding exactly ──────────────────────────────
  // glitching: enables per-character GlitchedText on all lines
  // glitchLevel/symbolLevel: passed to GlitchedText
  // glitchTick: increments on interval so seeds re-roll → flicker effect
  // overlayOpacity: controls terminal window opacity during stutter-out
  const [glitching, setGlitching] = useState(false);
  const [glitchLevel, setGlitchLevel] = useState(0);
  const [symbolLevel, setSymbolLevel] = useState(0);
  const [glitchTick, setGlitchTick] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(1);

  // symbolsOverlay: full-screen !@#$%^&*() flood (separate from per-char glitch)
  const [symbolsOverlay, setSymbolsOverlay] = useState(false);
  const [symbolsTick, setSymbolsTick] = useState(0);

  const idRef = useRef(0);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const printQueueRef = useRef([]);
  const printBusyRef = useRef(false);
  const oliviaActiveRef = useRef(false);
  const oliviaTimersRef = useRef([]);
  const hasOpenedRef = useRef(false);
  const oliviaOnlyPieceErrorIdxRef = useRef(0);
  const passkeyBuffer = useRef("");
  const passkeyUsed = useRef(false);
  const PASSKEY = "3200";

  const getNextOliviaOnlyPieceError = useCallback(() => {
    const msg =
      OLIVIA_ONLY_PIECE_ERRORS[
        oliviaOnlyPieceErrorIdxRef.current % OLIVIA_ONLY_PIECE_ERRORS.length
      ];
    oliviaOnlyPieceErrorIdxRef.current += 1;
    return msg;
  }, []);

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

  useLayoutEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines, phase]);

  useLayoutEffect(() => {
    if (isOpen && scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isPrinting && inputRef.current)
      setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen, isPrinting]);

  // ── Dev passkey: type "3200" anywhere → instant win state ────────────────
  useEffect(() => {
    const onKey = (e) => {
      passkeyBuffer.current = (passkeyBuffer.current + e.key).slice(
        -PASSKEY.length,
      );
      if (passkeyBuffer.current === PASSKEY) {
        passkeyBuffer.current = "";
        console.log("[Terminal] 🔓 Dev passkey 3200 — forcing win state...");

        // Bypass timer check
        passkeyUsed.current = true;

        // Mark every piece visited + completed
        PIECE_SLUGS.forEach((slug) => {
          game.markVisited(slug);
          game.markCompleted(slug);
        });

        // Satisfy all piece-specific counters
        for (let i = 0; i < 11; i++) game.incrementPiece7();
        ["1920", "2122", "2324", "192123", "202224"].forEach((p) =>
          game.trackPage129(p),
        );
        ["LOF.JPG", "LOF.txt"].forEach((f) => game.trackLofFile(f));
        ["MF.txt", "MF1.png", "MF2.png", "MF3.JPG"].forEach((f) =>
          game.trackMfFile(f),
        );
        game.trackShedLightRotation(Math.PI * 3);

        console.log(
          "[Terminal] ✓ Win state set. Open terminal and type: obit Olivia",
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game]);

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

  // ── Olivia loop ───────────────────────────────────────────────────────────
  const stopOliviaLoop = useCallback(() => {
    oliviaActiveRef.current = false;
    oliviaTimersRef.current.forEach(clearTimeout);
    oliviaTimersRef.current = [];
  }, []);

  const runOliviaLoop = useCallback(async () => {
    oliviaActiveRef.current = true;

    // Print initial acrostic, saving line IDs so we can swap them in-place
    const initialAcrostic = buildAcrostic(exorcismLines);
    const lineIds = [];
    for (const l of initialAcrostic) {
      if (!oliviaActiveRef.current) return;
      const id = nextId();
      lineIds.push(id);
      setLines((prev) => [...prev, { id, text: l, type: "obit-text" }]);
      await new Promise((r) => setTimeout(r, 200));
    }
    const blankId = nextId();
    setLines((prev) => [...prev, { id: blankId, text: "", type: "output" }]);

    // Swap acrostic lines in-place every 300ms
    const loopUpdate = () => {
      if (!oliviaActiveRef.current) return;
      const newAcrostic = buildAcrostic(exorcismLines);
      setLines((prev) =>
        prev.map((line) => {
          const idx = lineIds.indexOf(line.id);
          return idx !== -1 ? { ...line, text: newAcrostic[idx] } : line;
        }),
      );
      const t = setTimeout(loopUpdate, 300);
      oliviaTimersRef.current.push(t);
    };
    const t = setTimeout(loopUpdate, 300);
    oliviaTimersRef.current.push(t);
  }, [exorcismLines]);

  // ── Glitch phase runner — mirrors Onboarding's triggerComplete ────────────
  // phases: [{ glitchLevel, symbolLevel, interval, duration }]
  // If doStutter=true, runs the Onboarding stutter-out sequence afterward
  // and calls onStutterDone when the last stutter frame fires.
  const runGlitchPhases = useCallback(
    (phases, { doStutter = false, onStutterDone = null } = {}) => {
      return new Promise((resolve) => {
        const timers = [];
        let tickInterval = null;
        let elapsed = 0;

        setGlitching(true);
        setOverlayOpacity(1);

        const startTick = (interval) => {
          if (tickInterval) clearInterval(tickInterval);
          tickInterval = setInterval(
            () => setGlitchTick((n) => n + 1),
            interval,
          );
        };

        phases.forEach((p) => {
          timers.push(
            setTimeout(() => {
              setGlitchLevel(p.glitchLevel);
              setSymbolLevel(p.symbolLevel);
              startTick(p.interval);
            }, elapsed),
          );
          elapsed += p.duration;
        });

        if (doStutter) {
          // Stutter sequence identical to Onboarding: [1,0,1,0,0.7,0,0.4,0,1,0] at 80ms steps
          const stutterSeq = [1, 0, 1, 0, 0.7, 0, 0.4, 0, 1, 0];
          stutterSeq.forEach((op, i) => {
            timers.push(
              setTimeout(
                () => {
                  setOverlayOpacity(op);
                  if (i === stutterSeq.length - 1) {
                    clearInterval(tickInterval);
                    setGlitching(false);
                    setGlitchLevel(0);
                    setSymbolLevel(0);
                    setOverlayOpacity(1);
                    onStutterDone?.();
                    resolve();
                  }
                },
                elapsed + i * 80,
              ),
            );
          });
        } else {
          timers.push(
            setTimeout(() => {
              clearInterval(tickInterval);
              resolve();
            }, elapsed),
          );
        }
      });
    },
    [],
  );

  // ── Olivia final sequence ─────────────────────────────────────────────────
  const runOliviaFinalSequence = useCallback(async () => {
    stopOliviaLoop();
    setPhase("olivia-final");

    // 1. Glitch the acrostic lines in-place: sparse fonts+colors → symbols
    //    Same 3-phase ramp as Onboarding's triggerComplete
    await runGlitchPhases([
      { glitchLevel: 0.06, symbolLevel: 0.0, interval: 250, duration: 800 },
      { glitchLevel: 0.35, symbolLevel: 0.12, interval: 140, duration: 1000 },
      { glitchLevel: 0.85, symbolLevel: 0.55, interval: 70, duration: 1200 },
    ]);

    // 2. Switch off per-char glitch and flood with !@#$%^&*() overlay
    setGlitching(false);
    setGlitchLevel(0);
    setSymbolLevel(0);
    setSymbolsOverlay(true);
    const symInterval = setInterval(() => setSymbolsTick((n) => n + 1), 80);
    await new Promise((r) => setTimeout(r, 1500));
    clearInterval(symInterval);
    setSymbolsOverlay(false);

    // 3. Clear lines and print ERROR messages slowly (onboarding-style timing)
    setLines([]);
    for (let i = 0; i < OLIVIA_FINAL_ERRORS.length; i++) {
      await printLine(OLIVIA_FINAL_ERRORS[i], "error", ERROR_DELAY);
    }

    // 4. Pause before final glitch
    await new Promise((r) => setTimeout(r, 1500));

    // 5. Glitch the error lines with same 3-phase ramp, then stutter-out → reload
    await runGlitchPhases(
      [
        { glitchLevel: 0.06, symbolLevel: 0.0, interval: 250, duration: 800 },
        { glitchLevel: 0.35, symbolLevel: 0.12, interval: 140, duration: 1000 },
        { glitchLevel: 0.85, symbolLevel: 0.55, interval: 70, duration: 1200 },
      ],
      {
        doStutter: true,
        onStutterDone: () => {
          try {
            localStorage.clear();
          } catch {}
          window.location.reload();
        },
      },
    );
  }, [stopOliviaLoop, printLine, runGlitchPhases]);

  // ── Open / close ──────────────────────────────────────────────────────────
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    hasOpenedRef.current = true;
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    stopOliviaLoop();
    if (phase === "olivia-loop" || phase === "olivia-final") {
      setGlitching(false);
      setSymbolsOverlay(false);
      setOverlayOpacity(1);
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
      if (phase === "olivia-final") return;
      if (!trimmed) return;

      await printLine(`${PROMPT_PREFIX}${trimmed}`, "committed-prompt", 0);
      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1).join(" ");

      // ── help ──────────────────────────────────────────────────────────────
      if (cmd === "help") {
        await printLine("", "output", 20);
        for (const raw of HELP_LINES_RAW)
          await printLine("", "help-jsx", 30, raw);
        await printLine("", "output", 20);
        return;
      }

      // ── ls ────────────────────────────────────────────────────────────────
      if (cmd === "ls") {
        await printLine("", "output", 20);
        const titles = PIECE_SLUGS.map((slug) => PIECE_TITLES[slug]);
        const colW = Math.max(...titles.map((t) => t.length)) + 3;
        for (let i = 0; i < PIECE_SLUGS.length; i += COLS) {
          const row = PIECE_SLUGS.slice(i, i + COLS);
          await printLine(
            row.map((slug) => PIECE_TITLES[slug].padEnd(colW)).join(""),
            "ls-row",
            22,
            { slugs: row, colW },
          );
        }
        await printLine("", "output", 20);
        return;
      }

      // ── cd ────────────────────────────────────────────────────────────────
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

      // ── find ──────────────────────────────────────────────────────────────
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
        await printLine("", "output", 20);
        const colW = Math.max(...slugs.map((s) => PIECE_TITLES[s].length)) + 3;
        for (let i = 0; i < slugs.length; i += COLS) {
          const row = slugs.slice(i, i + COLS);
          await printLine("", "find-row", 22, { slugs: row, colW });
        }
        await printLine("", "output", 20);
        return;
      }

      // ── obit ──────────────────────────────────────────────────────────────
      if (cmd === "obit") {
        if (!args) {
          await printLine("ERROR: specify a name or piece title", "error");
          return;
        }

        const { ready } = game.checkTimerReady();
        if (!ready && !passkeyUsed.current) {
          await printLine(game.getNextTimerError(), "error");
          return;
        }

        // obit [piece title]
        const slugFromArg = matchSlugFromCd(args);
        if (slugFromArg) {
          const people = Object.entries(PERSON_PIECES)
            .filter(([, pieces]) => pieces.includes(slugFromArg))
            .map(([name]) => name)
            .filter((name) => name !== "Olivia");

          if (people.length === 0) {
            await printLine(getNextOliviaOnlyPieceError(), "error");
            return;
          }

          await printLine("", "output", 20);
          for (const person of people) {
            if (game.isObitUnlocked(person)) {
              for (const l of OBITUARY_TEXT[person])
                await printLine(l, "obit-text", 70);
              await printLine("", "output", 30);
            } else {
              await printLine("", "obit-locked", 40, { name: person });
            }
          }
          return;
        }

        // obit Olivia
        if (args.toLowerCase() === "olivia") {
          if (!game.isObitUnlocked("Olivia")) {
            await printLine(game.getNextObitError("Olivia"), "error");
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
          // After 5s clean loop, transition to final sequence automatically
          const t = setTimeout(() => runOliviaFinalSequence(), 5000);
          oliviaTimersRef.current.push(t);
          return;
        }

        // obit [person name]
        const person = matchPerson(args);
        if (person) {
          if (!game.isObitUnlocked(person)) {
            await printLine(game.getNextObitError(person), "error");
            return;
          }
          await printLine("", "output", 20);
          for (const l of OBITUARY_TEXT[person])
            await printLine(l, "obit-text", 70);
          await printLine("", "output", 20);
          return;
        }

        await printLine("ERROR: answer not found", "error");
        return;
      }

      // ── debug ─────────────────────────────────────────────────────────────
      if (cmd === "debug") {
        const s = game.state;
        console.log("[DEBUG]", JSON.parse(JSON.stringify(s)));
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
      getNextOliviaOnlyPieceError,
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
          {/* Terminal window — overlayOpacity controls stutter-out, matching Onboarding */}
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
              fontSize: "14px",
              fontWeight: 800,
              lineHeight: "1.65",
              overflow: "hidden",
              cursor: "text",
              opacity: glitching ? overlayOpacity : 1,
              transition: "none",
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

            {/* Output area */}
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
              {/* Full !@#$%^&*() flood overlay */}
              {symbolsOverlay && <SymbolsOverlay tick={symbolsTick} />}

              {/* Lines — GlitchedText applied per-char when glitching is active */}
              {lines.map((line) => (
                <LineRow
                  key={line.id}
                  line={line}
                  game={game}
                  glitching={glitching}
                  glitchLevel={glitchLevel}
                  symbolLevel={symbolLevel}
                  glitchTick={glitchTick}
                />
              ))}

              {/* Inline prompt — hidden during symbols overlay */}
              {!isPrinting && !symbolsOverlay && (
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
              {isPrinting && !symbolsOverlay && (
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

// ─── SymbolsOverlay — flood terminal with !@#$%^&*() ─────────────────────────
function SymbolsOverlay({ tick }) {
  const rows = 18;
  const cols = 55;
  // tick prop forces re-render so symbols animate
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
        fontSize: "14px",
        fontWeight: 800,
        lineHeight: "1.65",
        color: "#e05555",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} style={{ whiteSpace: "pre" }}>
          {Array.from({ length: cols }, () => randSymbol()).join("")}
        </div>
      ))}
    </div>
  );
}

// ─── LineRow ──────────────────────────────────────────────────────────────────
function LineRow({
  line,
  game,
  glitching,
  glitchLevel,
  symbolLevel,
  glitchTick,
}) {
  const base = {
    minHeight: "1.65em",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    marginBottom: "1px",
    display: "block",
  };

  if (line.type === "help-jsx" && line.jsxContent) {
    return (
      <div style={base}>
        <HelpLineContent raw={line.jsxContent} />
      </div>
    );
  }

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

  if (line.type === "obit-locked" && line.jsxContent?.name) {
    return (
      <div style={base}>
        <LockedObitName name={line.jsxContent.name} />
      </div>
    );
  }

  // Plain text — apply GlitchedText when glitching (identical to Onboarding's renderLineContent)
  const styles = lineStyle(line.type);
  const baseColor = styles.color ?? "#c8c8c8";
  const text = line.text || "";

  return (
    <div style={{ ...base, ...styles }}>
      {glitching && text.trim() !== "" ? (
        // key={glitchTick} re-rolls seeds every tick → flicker effect
        <GlitchedText
          key={glitchTick}
          text={text}
          glitchLevel={glitchLevel}
          symbolLevel={symbolLevel}
          baseColor={baseColor}
        />
      ) : (
        text || "\u00A0"
      )}
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
