import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";

// ─── Number-word → person name mapping ───────────────────────────────────────
// Used by Terminal `map` command — real names are replaced with number words
export const NUMBER_WORD_NAMES = {
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

// Reverse lookup: real name → number word (for display in map)
export const NAME_TO_NUMBER_WORD = Object.fromEntries(
  Object.entries(NUMBER_WORD_NAMES).map(([num, name]) => [name, num]),
);

// ─── Per-piece interaction totals ────────────────────────────────────────────
// Max trackable interactions per piece. Used for % progress calculation.
export const PIECE_INTERACTION_TOTALS = {
  justBones: 1,
  129: 5, // 5 page combos
  lack_of_flight: 2, // LOF.JPG + LOF.txt
  my_familiar: 4, // MF.txt + MF1.png + MF2.png + MF3.JPG
  cass_ra: 1,
  cursedVisions: 1,
  untitled: 11,
  objects_in_eleven: 11,
  silhouettes: 1,
  confessions: 1,
  secrets: 3,
  parasite: 2,
  the_empathy_machine: 1,
  s_curves: 1,
  31: 1,
  shedding_light: 1,
  n23: 4,
  i_am_malicious: 1,
  first_on_first: 1,
  teethmarks: 1,
  fetish: 1,
  parthenogenesis: 1,
};

// Pieces that must be fully completed (not just interacted) before they count as
// truly complete for visibility/disappearance logic.
const REQUIRES_FULL_COMPLETION = new Set([
  "objects_in_eleven",
  "n23",
  "parasite",
]);

// Linked-piece requirement: these pieces should not count as complete for
// disappearance until their corresponding link in n23 has been clicked.
const N23_REQUIRED_LINK_BY_SLUG = {
  31: "thirty-one",
  my_familiar: "my-familiar",
  i_am_malicious: "monster",
  secrets: "secret",
};
const N23_REQUIRED_LINKS = ["thirty-one", "my-familiar", "monster", "secret"];

// Number of non-Olivia people who have a piece in their list.
// Used to compute the "remaining %" holdback.
function _nonOliviaPeopleForSlug(slug) {
  return Object.entries(PERSON_PIECES)
    .filter(([name, pieces]) => name !== "Olivia" && pieces.includes(slug))
    .map(([name]) => name);
}

// Tip messages — rotate after 11 pieces completed, gated by `tip` command
export const TIP_MESSAGES = [
  "Inevitably, you\u2019ll lose things and you can\u2019t get them back.",
  "Sometimes you think you\u2019re finished with something when you\u2019ve done everything that\u2019s in front of you \u2014 that\u2019s expected of you. But really you need to look closer elsewhere, experience something new.",
  "And sometimes you need to backtrack, do the same thing over and over again. Have you done that? Exhausted every avenue?",
  "And other times, there\u2019s no such thing as finishing. You\u2019re spending a lot of time in the terminal trying to win\u2026 But who ever said this was a game?",
  "Grief is not a series of boxes to check off. The stages are merely cycles, experienced over and over again with more and more time in between, until suddenly it\u2019s been days, months, years since they have crossed your mind.",
];
export const TIP_UNLOCK_COUNT = 6;

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
export const VISIT_ONLY_PIECES = new Set(["justBones"]);

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
  first_on_first: "first_on_first",
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
    "My ears\u2026 Can you forgive me?",
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
    "Eaten up by guilt\u2026 Does drinking clear the mind?",
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
  "ERROR: Do you think it\u2019s that easy?",
  "ERROR: Do you think this whole thing is something you can win?",
  // index 3+ all return this:
  "ERROR: This isn\u2019t a game, Olivia. This is your life.",
];

// Generic name escalating errors
export const NAME_ERRORS = [
  "ERROR: Obituaries are written for those done to death",
  "ERROR: You\u2019re not ready.",
  "ERROR: You just can\u2019t force these things.",
  "ERROR: If you keep asking about them, I\u2019ll make you restart.",
  "ERROR: You\u2019ve reset your grief, Olivia. Do it all again.", // index 4 → then reset to 0
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
const DEBUG_LOGS = false;
const debugLog = (...args) => {
  if (DEBUG_LOGS) {
    console.log(...args);
  }
};

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
    // ── New fields ────────────────────────────────────────────────────────────
    // How many times the user has typed `map` — switches "you" → "Olivia" at 3+
    mapRequestCount: 0,
    // True once justBones has been opened AND then closed (triggers disappear)
    justBonesClosedAfterOpen: false,
    // Rotating tip index (increments each time `tip` is used)
    tipIndex: 0,
    // Number of interactions performed in objects_in_eleven
    objectsInElevenInteractions: 0,
    // Submitted row indexes for secrets (0..2)
    secretRowsSubmitted: [],
    // n23 link IDs clicked by the user
    n23LinksClicked: [],
    // parasite links clicked by the user (oneside / andtheother)
    parasiteLinksClicked: [],
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

    // Obituaries unlock only from true completion state.
    // Interactions alone (markInteracted) should never unlock an obituary.
    const checkMap = s.fullyCompletedPieces;

    const done = required.filter((slug) => checkMap[slug]);
    const missing = required.filter((slug) => !checkMap[slug]);
    const allDone = missing.length === 0;
    debugLog(
      `[Obit] Checking ${name} (fullyCompleted): ${done.length}/${required.length}.`,
      allDone ? "\u2192 UNLOCKED" : `Missing: [${missing.join(", ")}]`,
    );
    if (allDone) {
      setState((prev) => ({
        ...prev,
        obituariesUnlocked: { ...prev.obituariesUnlocked, [name]: true },
        obitErrorCounts: { ...prev.obitErrorCounts, [name]: 0 },
      }));
      debugLog(`[Obit] \u2713 ${name} obituary unlocked! Error count reset.`);
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
        debugLog("[Timer] Already running, not restarting.");
        return s;
      }
      debugLog(`[Timer] Started. Will be ready in ${TIMER_SECONDS}s.`);
      return { ...s, timerStartedAt: Date.now() };
    });
  }, []);

  const checkTimerReady = useCallback(() => {
    const s = getSnapshot();
    if (!s.timerStartedAt) {
      debugLog("[Timer] Not started yet");
      return { ready: false, secondsRemaining: TIMER_SECONDS };
    }
    const elapsedSeconds = (Date.now() - s.timerStartedAt) / 1000;
    if (elapsedSeconds >= TIMER_SECONDS) {
      debugLog("[Timer] Ready \u2713");
      return { ready: true, secondsRemaining: 0 };
    }
    const remaining = TIMER_SECONDS - elapsedSeconds;
    debugLog(`[Timer] ${formatRemaining(remaining)} remaining`);
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
      debugLog(
        `[Game] Visited: ${slug}${isVisitOnly ? " (visit-only \u2192 completed+fullyCompleted)" : ""}`,
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
      debugLog(`[Game] Interacted \u2192 completed: ${slug}`);
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
      debugLog(`[Game] Completed: ${slug}`);
      return { ...s, completedPieces, fullyCompletedPieces };
    });
    setTimeout(() => _checkObituaryUnlocks(slug), 0);
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
      return {
        ...s,
        pagesVisited129: next,
      };
    });
  }, []);

  // 129 is intentionally order-sensitive: after visiting all page combos,
  // completion is awarded only when the user clicks the "129" home link.
  const complete129FromHome = useCallback(() => {
    const ALL_PAGES = ["1920", "2122", "2324", "192123", "202224"];
    let shouldCheckUnlock = false;
    setState((s) => {
      if (s.fullyCompletedPieces["129"]) return s;
      const hasAllPages = ALL_PAGES.every((p) => s.pagesVisited129.includes(p));
      if (!hasAllPages) return s;

      shouldCheckUnlock = true;
      return {
        ...s,
        completedPieces: { ...s.completedPieces, 129: true },
        fullyCompletedPieces: { ...s.fullyCompletedPieces, 129: true },
      };
    });
    if (shouldCheckUnlock) {
      setTimeout(() => _checkObituaryUnlocks("129"), 0);
    }
  }, []);

  const trackLofFile = useCallback((filename) => {
    const ALL_FILES = ["LOF.JPG", "LOF.txt"];
    let shouldCheckUnlock = false;
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
      if (complete && !s.fullyCompletedPieces.lack_of_flight) {
        shouldCheckUnlock = true;
      }
      return {
        ...s,
        lofFilesOpened: next,
        completedPieces,
        fullyCompletedPieces,
      };
    });
    if (shouldCheckUnlock) {
      setTimeout(() => _checkObituaryUnlocks("lack_of_flight"), 0);
    }
  }, []);

  const trackMfFile = useCallback((filename) => {
    const ALL_FILES = ["MF.txt", "MF1.png", "MF2.png", "MF3.JPG"];
    let shouldCheckUnlock = false;
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
      if (complete && !s.fullyCompletedPieces.my_familiar) {
        shouldCheckUnlock = true;
      }
      return {
        ...s,
        mfFilesOpened: next,
        completedPieces,
        fullyCompletedPieces,
      };
    });
    if (shouldCheckUnlock) {
      setTimeout(() => _checkObituaryUnlocks("my_familiar"), 0);
    }
  }, []);

  const trackShedLightRotation = useCallback((deltaRadians) => {
    let shouldCheckUnlock = false;
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
        shouldCheckUnlock = true;
      }
      return {
        ...s,
        shedLightRotation: next,
        completedPieces,
        fullyCompletedPieces,
      };
    });
    if (shouldCheckUnlock) {
      // Run unlock check on next tick so the latest completion state is visible.
      setTimeout(() => _checkObituaryUnlocks("shedding_light"), 0);
    }
  }, []);

  // ── New: map request tracking ─────────────────────────────────────────────
  // Returns the new count after incrementing
  const incrementMapCount = useCallback(() => {
    let newCount;
    setState((s) => {
      newCount = s.mapRequestCount + 1;
      return { ...s, mapRequestCount: newCount };
    });
    return newCount;
  }, []);

  // ── New: justBones open→close tracking ────────────────────────────────────
  // Called by Piece1 when the user closes the expanded image.
  // Only has effect once justBones has been visited (which it always is, pre-completed).
  const markJustBonesClosed = useCallback(() => {
    setState((s) => {
      if (s.justBonesClosedAfterOpen) return s;
      debugLog("[Game] justBones closed after open \u2192 will disappear");
      return { ...s, justBonesClosedAfterOpen: true };
    });
  }, []);

  // ── New: tip index advance ────────────────────────────────────────────────
  // Returns the tip message to display and advances the index.
  const getNextTip = useCallback(() => {
    const s = getSnapshot();
    const idx = s.tipIndex % TIP_MESSAGES.length;
    const msg = TIP_MESSAGES[idx];
    setState((prev) => ({ ...prev, tipIndex: prev.tipIndex + 1 }));
    return msg;
  }, []);

  // ── New: objects_in_eleven interaction tracking ─────────────────────────
  const trackObjectsInElevenStep = useCallback((stepCount) => {
    const safeCount = Math.max(
      0,
      Math.min(
        PIECE_INTERACTION_TOTALS.objects_in_eleven,
        Number(stepCount) || 0,
      ),
    );
    setState((s) => {
      if (safeCount <= s.objectsInElevenInteractions) return s;
      return { ...s, objectsInElevenInteractions: safeCount };
    });
  }, []);

  // ── New: secrets submit tracking ────────────────────────────────────────
  const trackSecretSubmit = useCallback((rowIndex) => {
    if (rowIndex == null) return;
    const idx = Number(rowIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx > 2) return;

    setState((s) => {
      if (s.secretRowsSubmitted.includes(idx)) return s;

      const nextRows = [...s.secretRowsSubmitted, idx];
      const hasN23Secret = s.n23LinksClicked.includes("secret");
      const complete = nextRows.length >= 3 && hasN23Secret;

      const completedPieces = complete
        ? { ...s.completedPieces, secrets: true }
        : s.completedPieces;
      const fullyCompletedPieces = complete
        ? { ...s.fullyCompletedPieces, secrets: true }
        : s.fullyCompletedPieces;

      if (complete && !s.fullyCompletedPieces.secrets) {
        setTimeout(() => _checkObituaryUnlocks("secrets"), 0);
      }

      return {
        ...s,
        secretRowsSubmitted: nextRows,
        completedPieces,
        fullyCompletedPieces,
      };
    });
  }, []);

  // ── New: n23 link tracking ───────────────────────────────────────────────
  const trackN23Link = useCallback((linkId) => {
    if (!linkId) return;
    setState((s) => {
      if (s.n23LinksClicked.includes(linkId)) return s;

      const nextLinks = [...s.n23LinksClicked, linkId];

      const n23Complete = N23_REQUIRED_LINKS.every((id) =>
        nextLinks.includes(id),
      );
      const secretsComplete =
        nextLinks.includes("secret") && s.secretRowsSubmitted.length >= 3;

      let completedPieces = s.completedPieces;
      let fullyCompletedPieces = s.fullyCompletedPieces;

      if (n23Complete) {
        completedPieces = { ...completedPieces, n23: true };
        fullyCompletedPieces = { ...fullyCompletedPieces, n23: true };
      }

      if (secretsComplete) {
        completedPieces = { ...completedPieces, secrets: true };
        fullyCompletedPieces = { ...fullyCompletedPieces, secrets: true };
      }

      if (n23Complete && !s.fullyCompletedPieces.n23) {
        setTimeout(() => _checkObituaryUnlocks("n23"), 0);
      }
      if (secretsComplete && !s.fullyCompletedPieces.secrets) {
        setTimeout(() => _checkObituaryUnlocks("secrets"), 0);
      }

      return {
        ...s,
        n23LinksClicked: nextLinks,
        completedPieces,
        fullyCompletedPieces,
      };
    });
  }, []);

  // ── New: parasite link tracking ──────────────────────────────────────────
  // Parasite is complete only after both required links have been opened.
  const trackParasiteLink = useCallback((linkId) => {
    if (!linkId) return;
    const REQUIRED = ["oneside", "andtheother"];
    setState((s) => {
      if (s.parasiteLinksClicked.includes(linkId)) return s;
      const nextLinks = [...s.parasiteLinksClicked, linkId];
      const complete = REQUIRED.every((id) => nextLinks.includes(id));
      const completedPieces = complete
        ? { ...s.completedPieces, parasite: true }
        : s.completedPieces;
      const fullyCompletedPieces = complete
        ? { ...s.fullyCompletedPieces, parasite: true }
        : s.fullyCompletedPieces;
      if (complete) {
        setTimeout(() => _checkObituaryUnlocks("parasite"), 0);
      }
      return {
        ...s,
        parasiteLinksClicked: nextLinks,
        completedPieces,
        fullyCompletedPieces,
      };
    });
  }, []);

  // ── New: completed piece count ────────────────────────────────────────────
  // Counts pieces in completedPieces (excludes justBones pre-completion from count
  // so it doesn't inflate the tip-unlock gate).
  // Returns number of pieces the user has meaningfully completed.
  const getCompletedPieceCount = useCallback(() => {
    const s = getSnapshot();
    return Object.keys(s.completedPieces).length;
  }, []);

  // ── New: per-piece progress percentage ───────────────────────────────────
  // Returns 0–99 (never 100 until all relevant people's obits are unlocked,
  // which keeps 1% per remaining person as a holdback).
  // justBones: always 100% (pre-completed, no holdback).
  const getPieceProgress = useCallback((slug) => {
    const s = getSnapshot();

    // Not visited: 0%
    if (!s.visitedPieces[slug]) return 0;

    const nonOliviaPeople = _nonOliviaPeopleForSlug(slug);
    const peopleTotal = nonOliviaPeople.length;
    const peopleDone = nonOliviaPeople.filter(
      (name) => s.obituariesUnlocked[name],
    ).length;

    const interactionPointsTotal = Math.max(0, 100 - peopleTotal);

    let interactionProgress = 0; // 0..1
    const total = PIECE_INTERACTION_TOTALS[slug] ?? 1;

    if (slug === "129") {
      const ALL_PAGES = ["1920", "2122", "2324", "192123", "202224"];
      const done = ALL_PAGES.filter((p) =>
        s.pagesVisited129.includes(p),
      ).length;
      const baseProgress = Math.min(1, done / total);
      interactionProgress = s.fullyCompletedPieces["129"]
        ? 1
        : Math.min(0.99, baseProgress);
    } else if (slug === "lack_of_flight") {
      const ALL_FILES = ["LOF.JPG", "LOF.txt"];
      const done = ALL_FILES.filter((f) => s.lofFilesOpened.includes(f)).length;
      interactionProgress = Math.min(1, done / total);
    } else if (slug === "my_familiar") {
      const ALL_FILES = ["MF.txt", "MF1.png", "MF2.png", "MF3.JPG"];
      const done = ALL_FILES.filter((f) => s.mfFilesOpened.includes(f)).length;
      interactionProgress = Math.min(1, done / total);
    } else if (slug === "shedding_light") {
      interactionProgress = Math.min(1, s.shedLightRotation / (Math.PI * 2));
    } else if (slug === "untitled") {
      interactionProgress = Math.min(1, s.piece7ClickCount / total);
    } else if (slug === "secrets") {
      const baseProgress = Math.min(1, s.secretRowsSubmitted.length / total);
      interactionProgress = s.fullyCompletedPieces.secrets
        ? 1
        : Math.min(0.99, baseProgress);
    } else if (slug === "parasite") {
      const baseProgress = Math.min(1, s.parasiteLinksClicked.length / total);
      interactionProgress = s.fullyCompletedPieces.parasite
        ? 1
        : Math.min(0.99, baseProgress);
    } else if (slug === "n23") {
      const baseProgress = Math.min(1, s.n23LinksClicked.length / total);
      interactionProgress = s.fullyCompletedPieces.n23
        ? 1
        : Math.min(0.99, baseProgress);
    } else if (slug === "objects_in_eleven") {
      const baseProgress = Math.min(1, s.objectsInElevenInteractions / total);
      interactionProgress = s.fullyCompletedPieces.objects_in_eleven
        ? 1
        : Math.min(0.99, baseProgress);
    } else if (REQUIRES_FULL_COMPLETION.has(slug)) {
      interactionProgress = s.fullyCompletedPieces[slug] ? 1 : 0;
    } else {
      interactionProgress = s.completedPieces[slug] ? 1 : 0;
    }

    const interactionPoints = Math.round(
      interactionProgress * interactionPointsTotal,
    );
    const pct = Math.max(0, Math.min(100, interactionPoints + peopleDone));
    return pct;
  }, []);

  const isObitUnlocked = useCallback((name) => {
    return !!getSnapshot().obituariesUnlocked[name];
  }, []);

  const isTitleComplete = useCallback((slug) => {
    const s = getSnapshot();

    const isFullyCompleteForSlug = REQUIRES_FULL_COMPLETION.has(slug)
      ? !!s.fullyCompletedPieces[slug]
      : !!s.completedPieces[slug] || !!s.fullyCompletedPieces[slug];

    if (!isFullyCompleteForSlug) return false;

    const requiredN23Link = N23_REQUIRED_LINK_BY_SLUG[slug];
    if (requiredN23Link && !s.n23LinksClicked.includes(requiredN23Link)) {
      return false;
    }

    if (
      slug === "parasite" &&
      !(
        s.parasiteLinksClicked.includes("oneside") &&
        s.parasiteLinksClicked.includes("andtheother")
      )
    ) {
      return false;
    }

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
      debugLog(`[Obit] Olivia error #${idx}: "${msg}"`);
      setState((prev) => ({
        ...prev,
        oliviaErrorCount: prev.oliviaErrorCount + 1,
      }));
      return msg;
    }

    const count = s.obitErrorCounts[name] ?? 0;
    debugLog(`[Obit] ${name} error count from storage: ${count}`);
    if (count === 4) {
      // 5th error — reset counter
      const msg = NAME_ERRORS[4];
      debugLog(`[Obit] ${name} 5th error — resetting count to 0`);
      setState((prev) => ({
        ...prev,
        obitErrorCounts: { ...prev.obitErrorCounts, [name]: 0 },
      }));
      return msg;
    }
    const msg = NAME_ERRORS[Math.min(count, NAME_ERRORS.length - 1)];
    debugLog(`[Obit] ${name} error #${count}: "${msg}"`);
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
      debugLog(
        `[Timer] First gate error. ${timeStr} remaining. Timer NOT reset.`,
      );
      return TIMER_ERRORS[0](timeStr);
    }
    // Second+ error — reset timer
    debugLog(
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
    complete129FromHome,
    trackLofFile,
    trackMfFile,
    trackShedLightRotation,
    // obituary queries
    isObitUnlocked,
    isTitleComplete,
    // error dispensers
    getNextObitError,
    getNextTimerError,
    // ── New ──────────────────────────────────────────────────────────────────
    incrementMapCount,
    markJustBonesClosed,
    getNextTip,
    getCompletedPieceCount,
    getPieceProgress,
    trackObjectsInElevenStep,
    trackSecretSubmit,
    trackN23Link,
    trackParasiteLink,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}

export default GameContext;
