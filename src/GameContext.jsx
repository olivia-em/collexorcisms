import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";

// ─── Person → pieces mapping ──────────────────────────────────────────────────
// Slugs must match exactly what pieces pass to useTrackPiece
export const PIECE_SLUGS = [
  "justBones",
  "129",
  "lack_of_flight",
  "my_familiar",
  "cass_ra",
  "cursedVisions",
  "untitled",
  "objects_in_eleven",
  "silhouettes",
  "confessions",
  "secrets",
  "parasite",
  "the_empathy_machine",
  "s_curves",
  "31",
  "shedding_light",
  "n23",
  "i_am_malicious",
  "first_on_first",
  "teethmarks",
  "fetish",
  "parthenogenesis",
];

// Pieces where visiting counts as completion (no interaction required)
export const VISIT_ONLY_PIECES = new Set(["justBones", "parasite"]);

// Display titles matching slug order, used by ls command
export const PIECE_TITLES = {
  justBones: "justBones",
  129: "129",
  lack_of_flight: "lack_of_flight",
  my_familiar: "my_familiar",
  cass_ra: "CASS&RA",
  cursedVisions: "cursedVisions",
  untitled: "untitled",
  objects_in_eleven: "objects_in_eleven",
  silhouettes: "silhouettes",
  confessions: "confessions",
  secrets: "secrets",
  parasite: "parasite",
  the_empathy_machine: "the_empathy_machine",
  s_curves: "s_curves",
  31: "31",
  shedding_light: "shedding_light",
  n23: "N23",
  i_am_malicious: "i_am_malicious",
  first_on_first: "first_on_first_on_first",
  teethmarks: "teethmarks",
  fetish: "fetish",
  parthenogenesis: "parthenogenesis",
};

// cd command aliases → slug (fuzzy display name to slug)
export const CD_ALIASES = {
  justbones: "justBones",
  129: "129",
  lack_of_flight: "lack_of_flight",
  "lack of flight": "lack_of_flight",
  my_familiar: "my_familiar",
  "my familiar": "my_familiar",
  "cass&ra": "cass_ra",
  cass_ra: "cass_ra",
  cursedvisions: "cursedVisions",
  untitled: "untitled",
  objects_in_eleven: "objects_in_eleven",
  "objects in eleven": "objects_in_eleven",
  silhouettes: "silhouettes",
  confessions: "confessions",
  secrets: "secrets",
  parasite: "parasite",
  the_empathy_machine: "the_empathy_machine",
  "the empathy machine": "the_empathy_machine",
  s_curves: "s_curves",
  "s-curves": "s_curves",
  31: "31",
  shedding_light: "shedding_light",
  "shedding light": "shedding_light",
  n23: "n23",
  i_am_malicious: "i_am_malicious",
  "i am malicious": "i_am_malicious",
  "i am malicious because i am miserable": "i_am_malicious",
  first_on_first: "first_on_first",
  first_on_first_on_first: "first_on_first",
  "first on first on first": "first_on_first",
  teethmarks: "teethmarks",
  "teeth marks": "teethmarks",
  fetish: "fetish",
  parthenogenesis: "parthenogenesis",
};

export const PERSON_PIECES = {
  Lee: ["s_curves", "shedding_light"],
  Michael: ["cass_ra", "i_am_malicious", "confessions", "objects_in_eleven"],
  Adham: ["n23"],
  Mark: ["secrets", "confessions"],
  AJ: [
    "my_familiar",
    "first_on_first",
    "confessions",
    "silhouettes",
    "objects_in_eleven",
  ],
  Nick: ["31", "confessions", "objects_in_eleven"],
  Saf: ["teethmarks"],
  Ari: ["the_empathy_machine", "silhouettes"],
  Scott: ["first_on_first"],
  Jake: ["parasite"],
  Derek: ["silhouettes", "lack_of_flight"],
  Olivia: PIECE_SLUGS, // all 22
};

// Obituary text keyed by person name
export const OBITUARY_TEXT = {
  Lee: [
    "Leave leave behind what I can't keep",
    "Everything I've ever clutched",
    "Everyone I've ever loved",
  ],
  Michael: [
    "My gathering of curated waste",
    "If I stand all statuesque, in contrapasso",
    "Care catches like a cold",
    "He's just a man who feeds in power",
    "And her and him",
    "Enough to put me in my place",
    "Leave leave behind what I can't keep",
  ],
  Adham: [
    "And all all my silhouettes",
    "Disfiguring my face",
    "Heavy is my mind",
    "And joy and love and pain",
    "My ears… Can you forgive me?",
  ],
  Mark: [
    "My familiar",
    "At speed",
    "Regrets, they come to gut you",
    "Kareless cleaned the slate",
  ],
  AJ: ["A cheap antique with not one buyer", "Just leave me on the shelf"],
  Nick: [
    "No matter where I stood",
    "I handled the remains",
    "Carry her with me",
    "Karry her with me",
  ],
  Saf: ["She is not me", "And now gone inside", "Followed by the shame"],
  Ari: [
    "All that exotic wear and tear",
    "Runaway through alleyways",
    "I feel nothing at all",
  ],
  Scott: [
    "She remembers me",
    "Choose to bring her with you",
    "Objects",
    "Teeth marks",
    "The cut-outs and the shadows",
  ],
  Jake: [
    "Just this once, I've let it go",
    "And still I bleed",
    "Kareless cleaned the slate",
    "Eaten up by guilt… Does drinking clear the mind?",
  ],
  Derek: [
    "Doctor doctor",
    "Equal to a god.",
    "Regrets, they come to gut you",
    "Eating up my innocence, I'll cry just one more time",
    "Kovered cracks",
  ],
};

// Olivia escalating errors
export const OLIVIA_ERRORS = [
  "ERROR: Obituaries are written for those done to death",
  "ERROR: Do you think it\'s that easy?",
  "ERROR: Do you think this whole thing is something you can win?",
  // index 3+ all return this:
  "ERROR: This isn\'t a game, Olivia. This is your life.",
];

// Generic name escalating errors
export const NAME_ERRORS = [
  "ERROR: Obituaries are written for those done to death",
  "ERROR: You're not ready.",
  "ERROR: You just can't force these things.",
  "ERROR: If you keep asking about them, I'll make you restart.",
  "ERROR: You've reset your grief, Olivia. Do it all again.", // index 4 → then reset to 0
];

// ─── Timer config ─────────────────────────────────────────────────────────────
// DEV: 30 seconds. To restore production: change TIMER_SECONDS to 11 * 60
const TIMER_SECONDS = 11 * 60; // ← swap to `11 * 60` for production [30s for dev]

export function formatRemaining(secondsLeft) {
  const s = Math.max(0, Math.ceil(secondsLeft));
  if (s >= 60) {
    const m = Math.floor(s / 60);
    const rem = s - m * 60;
    return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
  }
  return `${s}s`;
}

// Timer gate errors — index 0 = first error (no reset), index 1 = second (resets timer)
export const TIMER_ERRORS = [
  (timeStr) =>
    `ERROR: rushing the process will only force you to repeat it (${timeStr} remains)`,
  (timeStr) =>
    `ERROR: rushing the process will only force you to repeat it (${timeStr} remains)`,
];

const STORAGE_KEY = "collex-game";

// ─── Default state ────────────────────────────────────────────────────────────
function defaultState() {
  return {
    timerStartedAt: null,
    // justBones pre-completed and visited from the start
    completedPieces: { justBones: true },
    visitedPieces: { justBones: true },
    // fullyCompletedPieces: written only by markCompleted (not markInteracted).
    // Olivia's obit requires every piece here; non-Olivia people only need completedPieces.
    fullyCompletedPieces: { justBones: true },
    piece7ClickCount: 0,
    pagesVisited129: [],
    lofFilesOpened: [],
    mfFilesOpened: [],
    shedLightRotation: 0,
    obitErrorCounts: {},
    oliviaErrorCount: 0,
    obituariesUnlocked: {},
  };
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const saved = JSON.parse(raw);
    const def = defaultState();
    return {
      ...def,
      ...saved,
      // Deep-merge objects so new defaults (e.g. justBones pre-complete)
      // survive even when user already has a saved state from an older build
      completedPieces: {
        ...def.completedPieces,
        ...(saved.completedPieces ?? {}),
      },
      visitedPieces: { ...def.visitedPieces, ...(saved.visitedPieces ?? {}) },
      fullyCompletedPieces: {
        ...def.fullyCompletedPieces,
        ...(saved.fullyCompletedPieces ?? {}),
      },
      obituariesUnlocked: {
        ...def.obituariesUnlocked,
        ...(saved.obituariesUnlocked ?? {}),
      },
    };
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

// ─── External store (no useState so no re-render loops) ──────────────────────
// GameContext uses useSyncExternalStore so consumers re-render only when
// the specific slice of state they read actually changes.
let _state = loadState();
const _listeners = new Set();

function getSnapshot() {
  return _state;
}
function getServerSnapshot() {
  return defaultState();
}

function setState(updater) {
  const next = typeof updater === "function" ? updater(_state) : updater;
  if (next === _state) return;
  _state = next;
  saveState(_state);
  _listeners.forEach((l) => l());
}

function subscribe(listener) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

// ─── Context ──────────────────────────────────────────────────────────────────
// ─── Module-level obit unlock checker ────────────────────────────────────────
// Lives outside GameProvider so it's never redefined on render.
// Uses module-level getSnapshot/setState directly.
function _checkObituaryUnlocks(changedSlug) {
  const affected = Object.entries(PERSON_PIECES)
    .filter(([, pieces]) => pieces.includes(changedSlug))
    .map(([name]) => name);

  affected.forEach((name) => {
    const s = getSnapshot();
    if (s.obituariesUnlocked[name]) return;
    const required = PERSON_PIECES[name];

    // Olivia requires every piece fully completed (markCompleted / markVisited on visit-only).
    // Everyone else unlocks on first meaningful interaction (markInteracted → completedPieces).
    const checkMap =
      name === "Olivia" ? s.fullyCompletedPieces : s.completedPieces;

    const done = required.filter((slug) => checkMap[slug]);
    const missing = required.filter((slug) => !checkMap[slug]);
    const allDone = missing.length === 0;
    console.log(
      `[Obit] Checking ${name} (${name === "Olivia" ? "fullyCompleted" : "completed"}): ${done.length}/${required.length}.`,
      allDone ? "→ UNLOCKED" : `Missing: [${missing.join(", ")}]`,
    );
    if (allDone) {
      setState((prev) => ({
        ...prev,
        obituariesUnlocked: { ...prev.obituariesUnlocked, [name]: true },
        obitErrorCounts: { ...prev.obitErrorCounts, [name]: 0 },
      }));
      console.log(`[Obit] ✓ ${name} obituary unlocked! Error count reset.`);
    }
  });
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // ── Timer ────────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    setState((s) => {
      if (s.timerStartedAt) {
        console.log("[Timer] Already running, not restarting.");
        return s;
      }
      console.log(`[Timer] Started. Will be ready in ${TIMER_SECONDS}s.`);
      return { ...s, timerStartedAt: Date.now() };
    });
  }, []);

  const checkTimerReady = useCallback(() => {
    const s = getSnapshot();
    if (!s.timerStartedAt) {
      console.log("[Timer] Not started yet");
      return { ready: false, secondsRemaining: TIMER_SECONDS };
    }
    const elapsedSeconds = (Date.now() - s.timerStartedAt) / 1000;
    if (elapsedSeconds >= TIMER_SECONDS) {
      console.log("[Timer] Ready ✓");
      return { ready: true, secondsRemaining: 0 };
    }
    const remaining = TIMER_SECONDS - elapsedSeconds;
    console.log(`[Timer] ${formatRemaining(remaining)} remaining`);
    return { ready: false, secondsRemaining: remaining };
  }, []);

  const resetTimer = useCallback(() => {
    setState((s) => ({ ...s, timerStartedAt: Date.now() }));
  }, []);

  // ── Piece tracking ────────────────────────────────────────────────────────
  const markVisited = useCallback((slug) => {
    setState((s) => {
      if (s.visitedPieces[slug]) return s;
      const visitedPieces = { ...s.visitedPieces, [slug]: true };
      const isVisitOnly = VISIT_ONLY_PIECES.has(slug);
      // Visit-only: counts as both interacted AND fully completed
      const completedPieces =
        isVisitOnly && !s.completedPieces[slug]
          ? { ...s.completedPieces, [slug]: true }
          : s.completedPieces;
      const fullyCompletedPieces =
        isVisitOnly && !s.fullyCompletedPieces[slug]
          ? { ...s.fullyCompletedPieces, [slug]: true }
          : s.fullyCompletedPieces;
      console.log(
        `[Game] Visited: ${slug}${isVisitOnly ? " (visit-only → completed+fullyCompleted)" : ""}`,
      );
      if (isVisitOnly && !s.completedPieces[slug]) {
        setTimeout(() => _checkObituaryUnlocks(slug), 0);
      }
      return { ...s, visitedPieces, completedPieces, fullyCompletedPieces };
    });
  }, []);

  const markInteracted = useCallback((slug) => {
    // Writes completedPieces only — enough to unlock non-Olivia obits.
    // Does NOT write fullyCompletedPieces, so Olivia still needs markCompleted.
    setState((s) => {
      if (s.completedPieces[slug]) return s;
      console.log(`[Game] Interacted → completed: ${slug}`);
      return { ...s, completedPieces: { ...s.completedPieces, [slug]: true } };
    });
    setTimeout(() => _checkObituaryUnlocks(slug), 0);
  }, []);

  const markCompleted = useCallback((slug) => {
    // Writes both completedPieces and fullyCompletedPieces.
    // fullyCompletedPieces is what Olivia's obit unlock checks against.
    setState((s) => {
      const completedPieces = s.completedPieces[slug]
        ? s.completedPieces
        : { ...s.completedPieces, [slug]: true };
      const fullyCompletedPieces = s.fullyCompletedPieces[slug]
        ? s.fullyCompletedPieces
        : { ...s.fullyCompletedPieces, [slug]: true };
      if (s.completedPieces[slug] && s.fullyCompletedPieces[slug]) return s;
      console.log(`[Game] Completed: ${slug}`);
      return { ...s, completedPieces, fullyCompletedPieces };
    });
    _checkObituaryUnlocks(slug);
  }, []);

  // ── Piece-specific trackers ───────────────────────────────────────────────
  const incrementPiece7 = useCallback(() => {
    let newCount;
    setState((s) => {
      newCount = s.piece7ClickCount + 1;
      return { ...s, piece7ClickCount: newCount };
    });
    return newCount;
  }, []);

  const trackPage129 = useCallback((pageId) => {
    const ALL_PAGES = ["1920", "2122", "2324", "192123", "202224"];
    setState((s) => {
      if (s.pagesVisited129.includes(pageId)) return s;
      const next = [...s.pagesVisited129, pageId];
      const complete = ALL_PAGES.every((p) => next.includes(p));
      const completedPieces = complete
        ? { ...s.completedPieces, 129: true }
        : s.completedPieces;
      const fullyCompletedPieces = complete
        ? { ...s.fullyCompletedPieces, 129: true }
        : s.fullyCompletedPieces;
      if (complete) _checkObituaryUnlocks("129");
      return {
        ...s,
        pagesVisited129: next,
        completedPieces,
        fullyCompletedPieces,
      };
    });
  }, []);

  const trackLofFile = useCallback((filename) => {
    const ALL_FILES = ["LOF.JPG", "LOF.txt"];
    setState((s) => {
      if (s.lofFilesOpened.includes(filename)) return s;
      const next = [...s.lofFilesOpened, filename];
      const complete = ALL_FILES.every((f) => next.includes(f));
      const completedPieces = complete
        ? { ...s.completedPieces, lack_of_flight: true }
        : s.completedPieces;
      const fullyCompletedPieces = complete
        ? { ...s.fullyCompletedPieces, lack_of_flight: true }
        : s.fullyCompletedPieces;
      if (complete) _checkObituaryUnlocks("lack_of_flight");
      return {
        ...s,
        lofFilesOpened: next,
        completedPieces,
        fullyCompletedPieces,
      };
    });
  }, []);

  const trackMfFile = useCallback((filename) => {
    const ALL_FILES = ["MF.txt", "MF1.png", "MF2.png", "MF3.JPG"];
    setState((s) => {
      if (s.mfFilesOpened.includes(filename)) return s;
      const next = [...s.mfFilesOpened, filename];
      const complete = ALL_FILES.every((f) => next.includes(f));
      const completedPieces = complete
        ? { ...s.completedPieces, my_familiar: true }
        : s.completedPieces;
      const fullyCompletedPieces = complete
        ? { ...s.fullyCompletedPieces, my_familiar: true }
        : s.fullyCompletedPieces;
      if (complete) _checkObituaryUnlocks("my_familiar");
      return {
        ...s,
        mfFilesOpened: next,
        completedPieces,
        fullyCompletedPieces,
      };
    });
  }, []);

  const trackShedLightRotation = useCallback((deltaRadians) => {
    setState((s) => {
      const next = s.shedLightRotation + Math.abs(deltaRadians);
      const complete = next >= Math.PI * 2;
      const completedPieces =
        complete && !s.completedPieces.shedding_light
          ? { ...s.completedPieces, shedding_light: true }
          : s.completedPieces;
      const fullyCompletedPieces =
        complete && !s.fullyCompletedPieces.shedding_light
          ? { ...s.fullyCompletedPieces, shedding_light: true }
          : s.fullyCompletedPieces;
      if (complete && !s.completedPieces.shedding_light) {
        _checkObituaryUnlocks("shedding_light");
      }
      return {
        ...s,
        shedLightRotation: next,
        completedPieces,
        fullyCompletedPieces,
      };
    });
  }, []);

  const isObitUnlocked = useCallback((name) => {
    return !!getSnapshot().obituariesUnlocked[name];
  }, []);

  const isTitleComplete = useCallback((slug) => {
    const s = getSnapshot();

    const nonOliviaPeople = Object.entries(PERSON_PIECES)
      .filter(([name, pieces]) => name !== "Olivia" && pieces.includes(slug))
      .map(([name]) => name);

    // 🩸 Olivia-only pieces:
    // Cross out as soon as the piece itself is completed.
    if (nonOliviaPeople.length === 0) {
      return !!s.completedPieces[slug];
    }

    // 🪦 Shared pieces:
    // Cross out when all non-Olivia obits are unlocked.
    return nonOliviaPeople.every((name) => s.obituariesUnlocked[name]);
  }, []);

  // ── Obit error tracking ───────────────────────────────────────────────────
  // Returns the error message to show and advances the counter.
  // For Olivia: uses oliviaErrorCount with its own escalation.
  // For names: uses obitErrorCounts[name], resets at index 4 (5th error).
  const getNextObitError = useCallback((name) => {
    const s = getSnapshot();

    if (name === "Olivia") {
      const idx = Math.min(s.oliviaErrorCount, OLIVIA_ERRORS.length - 1);
      const msg = OLIVIA_ERRORS[idx];
      console.log(`[Obit] Olivia error #${idx}: "${msg}"`);
      setState((prev) => ({
        ...prev,
        oliviaErrorCount: prev.oliviaErrorCount + 1,
      }));
      return msg;
    }

    const count = s.obitErrorCounts[name] ?? 0;
    console.log(`[Obit] ${name} error count from storage: ${count}`);
    if (count === 4) {
      // 5th error — reset counter
      const msg = NAME_ERRORS[4];
      console.log(`[Obit] ${name} 5th error — resetting count to 0`);
      setState((prev) => ({
        ...prev,
        obitErrorCounts: { ...prev.obitErrorCounts, [name]: 0 },
      }));
      return msg;
    }
    const msg = NAME_ERRORS[Math.min(count, NAME_ERRORS.length - 1)];
    console.log(`[Obit] ${name} error #${count}: "${msg}"`);
    setState((prev) => ({
      ...prev,
      obitErrorCounts: { ...prev.obitErrorCounts, [name]: count + 1 },
    }));
    return msg;
  }, []);

  // Timer error — first error: no reset. Second error: reset timer to full.
  const timerErrorCountRef = useRef(0);
  const getNextTimerError = useCallback(() => {
    const { secondsRemaining } = checkTimerReady();
    const timeStr = formatRemaining(secondsRemaining);
    const count = timerErrorCountRef.current;
    timerErrorCountRef.current += 1;

    if (count === 0) {
      // First error — do NOT reset timer
      console.log(
        `[Timer] First gate error. ${timeStr} remaining. Timer NOT reset.`,
      );
      return TIMER_ERRORS[0](timeStr);
    }
    // Second+ error — reset timer
    console.log(
      `[Timer] Second gate error. Resetting timer to full ${TIMER_SECONDS}s.`,
    );
    resetTimer();
    timerErrorCountRef.current = 0;
    return TIMER_ERRORS[1](formatRemaining(TIMER_SECONDS));
  }, [checkTimerReady, resetTimer]);

  const value = {
    // raw state (read-only via useSyncExternalStore)
    state,
    // timer
    startTimer,
    checkTimerReady,
    // piece tracking
    markVisited,
    markInteracted,
    markCompleted,
    // piece-specific
    incrementPiece7,
    trackPage129,
    trackLofFile,
    trackMfFile,
    trackShedLightRotation,
    // obituary queries
    isObitUnlocked,
    isTitleComplete,
    // error dispensers
    getNextObitError,
    getNextTimerError,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}

export default GameContext;
