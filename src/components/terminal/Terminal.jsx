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
  NAME_TO_NUMBER_WORD,
  TIP_UNLOCK_COUNT,
} from "../../GameContext";
import GlitchText from "../GlitchText";

const PROMPT_PREFIX = "olivialee@10-08-2001 % ";
const COLS = 4;
const RED_HELP_SEEN_SESSION_KEY = "terminal.redHelpSeen";
const TIMER_GATE_SEEN_SESSION_KEY = "terminal.timerGateSeen";

const OPEN_HINT_SEQUENCE = [
  "welcome back",
  "it's all here, as you left it",
  "help me",
];

const BOOT_STEPS = [
  {
    command: "help me",
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

const BASE_HELP_LINES_RAW = [
  "ls : show directory contents",
  "cd : change directory # ex. cd justBones",
  "map : where you are",
  "obit : come at the close # ex. obit N23 or obit Olivia",
  "help : show terminal commands",
];

function getHelpLinesRaw(completedCount) {
  const lines = [...BASE_HELP_LINES_RAW];
  if (completedCount >= TIP_UNLOCK_COUNT) {
    lines.push("tip : for when you just don't understand");
  }
  return lines;
}

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

// ─── ASCII Map renderer ───────────────────────────────────────────────────────
// Renders the map as JSX lines. Each line is a plain string for the map-row type.
// youLabel: "you" or "Olivia" depending on mapRequestCount.
// cameraZ: used to compute the user's position dot on the vertical axis.
// Returns an array of { text, type } objects to feed into printLines.
function buildMapLines({ slugs, game, youLabel, cameraZ, spacing }) {
  const BOX_W = 22; // inner width of each box
  const lines = [];

  // Header
  lines.push({ text: "", type: "output" });

  // We render each slug as one row: [box][spacer][rail]
  // The rail has a dot (●) at the position corresponding to the camera.
  const numPieces = slugs.length;

  // Compute the user's position in the list (0 = top piece, numPieces-1 = last)
  // cameraZ: piece 1 = -200, piece N = -200 - (N-1)*spacing
  // So pieceZ_i = -200 - i*spacing, i in 0..numPieces-1
  // userPos = (cameraZ - (-200)) / -spacing  = (-200 - cameraZ) / spacing
  const rawPos = (-200 - cameraZ) / spacing;
  const clampedPos = Math.max(0, Math.min(numPieces - 1, rawPos));

  slugs.forEach((slug, i) => {
    const visited = game.state.visitedPieces[slug];
    const pct = game.getPieceProgress(slug);
    const title = visited ? PIECE_TITLES[slug] : "";
    const pctStr = `${pct}%`;

    // Build box content: "title          pct%"
    // Truncate title to fit, right-align pct
    const innerAvail = BOX_W;
    const pctField = pctStr.padStart(4);
    const titleAvail = innerAvail - pctField.length - 1;
    const titleStr =
      title.length > titleAvail
        ? title.slice(0, titleAvail - 1) + "\u2026"
        : title.padEnd(titleAvail);
    const inner = titleStr + " " + pctField;

    // Top border for first box
    if (i === 0) {
      lines.push({
        text: `\u250C${"─".repeat(BOX_W + 2)}\u2510  \u2502`,
        type: "output",
      });
    }

    // Box row — determine if the dot goes on this line
    // dot is placed at the row closest to clampedPos
    const dotRow = Math.round(clampedPos);
    const railChar = i === dotRow ? "●" : "\u2502";
    const labelSuffix = i === dotRow ? ` \u2190 ${youLabel}` : "";

    lines.push({
      text: `\u2502 ${inner} \u2502  ${railChar}${labelSuffix}`,
      type: "output",
    });

    // Separator between boxes, or bottom border
    if (i < slugs.length - 1) {
      lines.push({
        text: `\u251C${"─".repeat(BOX_W + 2)}\u2524  \u2502`,
        type: "output",
      });
    } else {
      lines.push({
        text: `\u2514${"─".repeat(BOX_W + 2)}\u2518  \u2502`,
        type: "output",
      });
    }
  });

  lines.push({ text: "", type: "output" });
  return lines;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Terminal({ onboardingDone = false, cameraZ = -200 }) {
  const { goToPiece } = useCamera();
  const game = useGame();
  const allPiecesAt100 = PIECE_SLUGS.every(
    (slug) => game.getPieceProgress(slug) >= 100,
  );

  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState("boot-prompt");
  const [bootStep, setBootStep] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [exorcismLines, setExorcismLines] = useState([]);

  // ── Glitch state — mirrors Onboarding exactly ──────────────────────────────
  const [glitching, setGlitching] = useState(false);
  const [glitchLevel, setGlitchLevel] = useState(0);
  const [symbolLevel, setSymbolLevel] = useState(0);
  const [glitchTick, setGlitchTick] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [symbolsOverlay, setSymbolsOverlay] = useState(false);
  const [symbolsTick, setSymbolsTick] = useState(0);
  const [openHintText, setOpenHintText] = useState("");
  const [openHintIsRed, setOpenHintIsRed] = useState(false);

  const idRef = useRef(0);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const printQueueRef = useRef([]);
  const printBusyRef = useRef(false);
  const oliviaActiveRef = useRef(false);
  const oliviaTimersRef = useRef([]);
  const hasOpenedRef = useRef(false);
  const bootCompletedRef = useRef(false);
  const oliviaOnlyPieceErrorIdxRef = useRef(0);
  const passkeyBuffer = useRef("");
  const passkeyUsed = useRef(false);
  const openHintTimersRef = useRef([]);
  const openHintPlayedRef = useRef(false);
  const tipHelpAcknowledgedRef = useRef(false);
  const PASSKEY = "3200";
  const timerGateSeenRef = useRef(false);

  const markRedHelpSeen = useCallback(() => {
    tipHelpAcknowledgedRef.current = true;
    try {
      window.sessionStorage.setItem(RED_HELP_SEEN_SESSION_KEY, "1");
    } catch {
      // ignore storage failures
    }
  }, []);

  // spacing must match CSSScroll
  const SPACING = 1000;

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

  const clearOpenHintTimers = useCallback(() => {
    openHintTimersRef.current.forEach(clearTimeout);
    openHintTimersRef.current = [];
  }, []);

  const runOpenHintAnimation = useCallback(() => {
    clearOpenHintTimers();
    setOpenHintText("");
    setOpenHintIsRed(false);

    let elapsed = 0;
    for (let msgIndex = 0; msgIndex < OPEN_HINT_SEQUENCE.length; msgIndex++) {
      const msg = OPEN_HINT_SEQUENCE[msgIndex];
      const isFinal = msgIndex === OPEN_HINT_SEQUENCE.length - 1;
      for (let i = 1; i <= msg.length; i++) {
        const timer = setTimeout(
          () => setOpenHintText(msg.slice(0, i)),
          elapsed,
        );
        openHintTimersRef.current.push(timer);
        elapsed += 28;
      }
      const holdTimer = setTimeout(() => setOpenHintText(msg), elapsed + 420);
      openHintTimersRef.current.push(holdTimer);

      if (isFinal) {
        elapsed += 860;
        break;
      }

      elapsed += 860;
      const clearTimer = setTimeout(() => setOpenHintText(""), elapsed);
      openHintTimersRef.current.push(clearTimer);
      elapsed += 150;
    }
  }, [clearOpenHintTimers]);

  useEffect(() => {
    fetch("/assets/exorcisms.txt")
      .then((r) => r.text())
      .then((text) =>
        setExorcismLines(text.split("\n").filter((l) => l.trim())),
      )
      .catch(console.error);
  }, []);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(RED_HELP_SEEN_SESSION_KEY) === "1") {
        tipHelpAcknowledgedRef.current = true;
      }
    } catch {
      // ignore storage failures
    }
  }, []);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(TIMER_GATE_SEEN_SESSION_KEY) === "1") {
        timerGateSeenRef.current = true;
      }
    } catch {
      // ignore storage failures
    }
  }, []);

  useEffect(() => {
    return () => {
      clearOpenHintTimers();
    };
  }, [clearOpenHintTimers]);

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

  const runDevUnlock = useCallback(() => {
    console.log("[Terminal] 🔓 Dev passkey 3200 — forcing win state...");
    passkeyUsed.current = true;

    PIECE_SLUGS.forEach((slug) => {
      game.markVisited(slug);
      game.markCompleted(slug);
    });

    for (let i = 0; i < 11; i++) game.incrementPiece7();
    ["1920", "2122", "2324", "192123", "202224"].forEach((p) =>
      game.trackPage129(p),
    );
    game.complete129FromHome?.();
    ["LOF.JPG", "LOF.txt"].forEach((f) => game.trackLofFile(f));
    ["MF.txt", "MF1.png", "MF2.png", "MF3.JPG"].forEach((f) =>
      game.trackMfFile(f),
    );
    for (let i = 1; i <= 11; i++) game.trackObjectsInElevenStep(i);
    game.markCompleted("objects_in_eleven");
    ["thirty-one", "my-familiar", "monster", "secret"].forEach((id) =>
      game.trackN23Link(id),
    );
    ["oneside", "andtheother"].forEach((id) => game.trackParasiteLink(id));
    game.trackShedLightRotation(Math.PI * 3);
    console.log(
      "[Terminal] ✓ Win state set. Open terminal and type: obit Olivia",
    );
  }, [game]);

  // ── Dev passkey: type "3200" anywhere → instant win state ────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (!/^\d$/.test(e.key)) return;
      passkeyBuffer.current = (passkeyBuffer.current + e.key).slice(
        -PASSKEY.length,
      );
      if (passkeyBuffer.current === PASSKEY) {
        passkeyBuffer.current = "";
        runDevUnlock();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runDevUnlock]);

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

  // ── Glitch phase runner ───────────────────────────────────────────────────
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

    await runGlitchPhases([
      { glitchLevel: 0.06, symbolLevel: 0.0, interval: 250, duration: 800 },
      { glitchLevel: 0.35, symbolLevel: 0.12, interval: 140, duration: 1000 },
      { glitchLevel: 0.85, symbolLevel: 0.55, interval: 70, duration: 1200 },
    ]);

    setGlitching(false);
    setGlitchLevel(0);
    setSymbolLevel(0);
    setSymbolsOverlay(true);
    const symInterval = setInterval(() => setSymbolsTick((n) => n + 1), 80);
    await new Promise((r) => setTimeout(r, 1500));
    clearInterval(symInterval);
    setSymbolsOverlay(false);

    setLines([]);
    for (let i = 0; i < OLIVIA_FINAL_ERRORS.length; i++) {
      await printLine(OLIVIA_FINAL_ERRORS[i], "error", ERROR_DELAY);
    }

    await new Promise((r) => setTimeout(r, 1500));

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
    if (
      phase === "boot-prompt" &&
      !bootCompletedRef.current &&
      openHintPlayedRef.current
    ) {
      setOpenHintText("help me");
      setOpenHintIsRed(false);
    }
  }, [phase]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    stopOliviaLoop();
    clearOpenHintTimers();
    setOpenHintText("");
    setOpenHintIsRed(false);
    if (phase === "olivia-loop" || phase === "olivia-final") {
      setGlitching(false);
      setSymbolsOverlay(false);
      setOverlayOpacity(1);
      setPhase("open");
    }
  }, [clearOpenHintTimers, phase, stopOliviaLoop]);

  useEffect(() => {
    if (
      !isOpen ||
      phase !== "boot-prompt" ||
      isPrinting ||
      openHintPlayedRef.current
    ) {
      return;
    }

    openHintPlayedRef.current = true;
    runOpenHintAnimation();

    return () => {
      clearOpenHintTimers();
    };
  }, [clearOpenHintTimers, isOpen, isPrinting, phase, runOpenHintAnimation]);

  useEffect(() => {
    if (allPiecesAt100) {
      tipHelpAcknowledgedRef.current = true;
      setOpenHintText("");
      setOpenHintIsRed(false);
      return;
    }

    if (
      !isOpen ||
      phase !== "open" ||
      isPrinting ||
      tipHelpAcknowledgedRef.current
    ) {
      return;
    }

    const tipUnlocked = game.getCompletedPieceCount() >= TIP_UNLOCK_COUNT;
    if (!tipUnlocked) {
      setOpenHintText("");
      setOpenHintIsRed(false);
      return;
    }

    markRedHelpSeen();
    setOpenHintText("help");
    setOpenHintIsRed(true);
  }, [allPiecesAt100, game, isOpen, isPrinting, markRedHelpSeen, phase]);

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

      await printLine("This is all I can give you.", "output", 45);
      await printLine("", "output", 20);
      const helpLines = getHelpLinesRaw(game.getCompletedPieceCount());
      for (const raw of helpLines) {
        await printLine("", "help-jsx", 30, raw);
      }
      await printLine("", "output", 20);

      if (bootStep < BOOT_STEPS.length - 1) {
        setBootStep((n) => n + 1);
      } else {
        bootCompletedRef.current = true;
        clearOpenHintTimers();
        setOpenHintText("");
        setOpenHintIsRed(false);
        setPhase("open");
      }
    },
    [bootStep, clearOpenHintTimers, game, printLine, printLines],
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

      if (trimmed === PASSKEY) {
        runDevUnlock();
        await printLine("[dev] win state forced", "hint", 20);
        return;
      }

      await printLine(`${PROMPT_PREFIX}${trimmed}`, "committed-prompt", 0);
      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1).join(" ");

      // ── help ──────────────────────────────────────────────────────────────
      if (cmd === "help") {
        markRedHelpSeen();
        setOpenHintText("");
        setOpenHintIsRed(false);
        await printLine("This is all I can give you.", "output", 35);
        await printLine("", "output", 20);
        const helpLines = getHelpLinesRaw(game.getCompletedPieceCount());
        for (const raw of helpLines) await printLine("", "help-jsx", 30, raw);
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
        // Auto-close terminal after navigating
        setTimeout(() => {
          setIsOpen(false);
          stopOliviaLoop();
        }, 500);
        return;
      }

      // ── map ───────────────────────────────────────────────────────────────
      if (cmd === "map") {
        const count = game.incrementMapCount();
        // "you" for first two requests, "Olivia" from third onward
        const youLabel = count >= 3 ? "Olivia" : "you";

        const mapLines = buildMapLines({
          slugs: PIECE_SLUGS,
          game,
          youLabel,
          cameraZ,
          spacing: SPACING,
        });

        for (const { text, type } of mapLines) {
          await printLine(text, type, 18);
        }
        return;
      }

      // ── tip ───────────────────────────────────────────────────────────────
      if (cmd === "tip") {
        const completedCount = game.getCompletedPieceCount();
        if (completedCount < TIP_UNLOCK_COUNT) {
          await printLine(
            `ERROR: keep going (${completedCount}/${TIP_UNLOCK_COUNT} pieces)`,
            "error",
          );
          return;
        }
        const msg = game.getNextTip();
        await printLine("", "output", 20);
        await printLine(msg, "output", 40);
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
        if (
          !ready &&
          !passkeyUsed.current &&
          !allPiecesAt100 &&
          !timerGateSeenRef.current
        ) {
          timerGateSeenRef.current = true;
          try {
            window.sessionStorage.setItem(TIMER_GATE_SEEN_SESSION_KEY, "1");
          } catch {
            // ignore storage failures
          }
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
              // Display number word instead of real name
              const numWord = NAME_TO_NUMBER_WORD[person] ?? person;
              await printLine("", "obit-locked", 40, { name: numWord });
            }
          }
          return;
        }

        // obit Olivia (must be checked before generic person path)
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
          const t = setTimeout(() => runOliviaFinalSequence(), 5000);
          oliviaTimersRef.current.push(t);
          return;
        }

        // obit [person name] — also accept number words
        let person = matchPerson(args);
        // If they typed a number word, resolve to real name for lookup
        if (!person) {
          // Check if it's a number word
          const NUMBER_WORD_NAMES_LOCAL = {
            one: "Derek",
            two: "Jake",
            three: "Nick",
            four: "Ari",
            five: "Michael",
            six: "AJ",
            seven: "Mark",
            eight: "Adham",
            nine: "Lee",
            ten: "Scott",
            eleven: "Saf",
          };
          const resolved = NUMBER_WORD_NAMES_LOCAL[args.toLowerCase()];
          if (resolved) person = resolved;
        }

        if (person) {
          if (!game.isObitUnlocked(person)) {
            await printLine(game.getNextObitError(person), "error");
            return;
          }

          // Display number word instead of real name for non-Olivia
          if (person !== "Olivia") {
            const numWord = NAME_TO_NUMBER_WORD[person];
            if (numWord) {
              await printLine("", "output", 20);
              await printLine(`\u2014 ${numWord}`, "obit-name", 40);
            } else {
              await printLine("", "output", 20);
            }
          } else {
            await printLine("", "output", 20);
          }

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
        await printLine(`mapCount:  ${s.mapRequestCount}`, "code", 10);
        await printLine(`jbClosed:  ${s.justBonesClosedAfterOpen}`, "code", 10);
        await printLine("", "output", 10);
        return;
      }

      // ── find (legacy redirect) ────────────────────────────────────────────
      if (cmd === "find") {
        await printLine(
          "ERROR: command not found: find \u2014 try: map",
          "error",
        );
        return;
      }

      await printLine(`ERROR: command not found: ${cmd}`, "error");
    },
    [
      allPiecesAt100,
      game,
      goToPiece,
      phase,
      cameraZ,
      markRedHelpSeen,
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
      if (phase === "boot-prompt" && !bootCompletedRef.current)
        handleBootSubmit(val);
      else handleCommand(val);
    },
    [input, isPrinting, phase, handleBootSubmit, handleCommand],
  );

  const handleWheel = (e) => e.stopPropagation();
  const currentHint =
    phase === "boot-prompt" ? (openHintText ?? "") : (openHintText ?? "");

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
            right: 55,
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
              {symbolsOverlay && <SymbolsOverlay tick={symbolsTick} />}

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

              {/* Inline prompt */}
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
                        color: openHintIsRed ? "#e05555" : "#444",
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

// ─── SymbolsOverlay ───────────────────────────────────────────────────────────
function SymbolsOverlay({ tick }) {
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

  const styles = lineStyle(line.type);
  const baseColor = styles.color ?? "#c8c8c8";
  const text = line.text || "";

  return (
    <div style={{ ...base, ...styles }}>
      {glitching && text.trim() !== "" ? (
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
