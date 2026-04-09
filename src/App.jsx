import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import ThreeScroll from "./CSSScroll";
import BackgroundCollage from "./BackgroundCollage";
import Terminal from "./components/terminal/Terminal";
import MapWindow from "./components/terminal/MapWindow";
import useDraggableWindow from "./components/terminal/useDraggableWindow";
import Onboarding from "./components/onboarding/Onboarding";
import { CameraContext } from "./CameraContext";
import {
  GameProvider,
  PIECE_SLUGS,
  PIECE_TITLES,
  useGame,
} from "./GameContext";
import { AmbientAudioProvider, useAmbientAudio } from "./AmbientAudioContext";

const SURVEY_URL = "https://forms.gle/Uu7xPm1TriJKTcVUA";
const BOOK_URL =
  "https://www.lulu.com/shop/olivia-lee/collected-exorcisms/paperback/product-kv679gk.html?page=1&pageSize=4";
const TXT_SESSION_KEY = "collex.achievedTxtWindows";
const ONBOARDING_SESSION_KEY = "collex.onboardingComplete";

function normalizeTxtUrlString(rawUrl) {
  const normalized = normalizeTxtUrl(rawUrl);
  return normalized ? normalized.toString() : null;
}

function dedupeTxtEntries(entries) {
  const byUrl = new Map();

  for (const [index, rawEntry] of entries.entries()) {
    if (!rawEntry || typeof rawEntry.url !== "string") continue;
    const normalizedUrl = normalizeTxtUrlString(rawEntry.url);
    if (!normalizedUrl) continue;

    const incoming = {
      id: rawEntry.id || `txt-${index}`,
      url: normalizedUrl,
      title:
        rawEntry.title ||
        decodeURIComponent(normalizedUrl.split("/").pop() || "untitled.txt"),
      isOpen: Boolean(rawEntry.isOpen),
      loading: Boolean(rawEntry.loading),
      content: rawEntry.content || "",
      error: rawEntry.error || "",
      initialX: rawEntry.initialX,
      initialY: rawEntry.initialY,
    };

    const existing = byUrl.get(normalizedUrl);
    if (!existing) {
      byUrl.set(normalizedUrl, incoming);
      continue;
    }

    byUrl.set(normalizedUrl, {
      ...existing,
      ...incoming,
      isOpen: existing.isOpen || incoming.isOpen,
      content: existing.content || incoming.content,
      error: existing.error || incoming.error,
      loading:
        (!existing.content && existing.loading) ||
        (!incoming.content && incoming.loading),
    });
  }

  return Array.from(byUrl.values()).map((entry, index) => ({
    ...entry,
    initialX: 38 + (index % 6) * 22,
    initialY: 38 + (index % 6) * 22,
  }));
}

const ACHIEVED_TXT_SOURCES = [
  {
    url: "/assets/piece3/LOF.txt",
    title: "LOF.txt",
    isAchieved: (state) => (state.lofFilesOpened ?? []).includes("LOF.txt"),
  },
  {
    url: "/assets/piece4/MF.txt",
    title: "MF.txt",
    isAchieved: (state) => (state.mfFilesOpened ?? []).includes("MF.txt"),
  },
  {
    url: "/assets/piece5/cass_ra.txt",
    title: "cass_ra.txt",
    isAchieved: (state) => Boolean(state.completedPieces?.cass_ra),
  },
  {
    url: "/assets/piece11/secrets.txt",
    title: "secrets.txt",
    isAchieved: (state) =>
      (state.secretRowsSubmitted ?? []).length >= 3 &&
      (state.n23LinksClicked ?? []).includes("secret"),
  },
  {
    url: "/assets/piece12/andtheother.txt",
    title: "andtheother.txt",
    isAchieved: (state) =>
      (state.parasiteLinksClicked ?? []).includes("andtheother"),
  },
  {
    url: "/assets/piece12/oneside.txt",
    title: "oneside.txt",
    isAchieved: (state) =>
      (state.parasiteLinksClicked ?? []).includes("oneside"),
  },
  {
    url: "/assets/piece19/between.txt",
    title: "between.txt",
    isAchieved: (state) => Boolean(state.completedPieces?.first_on_first),
  },
];

function readAchievedTxtWindows() {
  try {
    const raw = window.sessionStorage.getItem(TXT_SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const hydrated = parsed
      .map((item) => {
        if (!item || typeof item.url !== "string") return null;
        const url = normalizeTxtUrlString(item.url);
        if (!url) return null;
        return {
          id: item.id || `session-txt-${url}`,
          url,
          title:
            item.title ||
            decodeURIComponent(url.split("/").pop() || "untitled.txt"),
          isOpen: false,
          loading: false,
          content: item.content || "",
          error: "",
          initialX: 38,
          initialY: 38,
        };
      })
      .filter(Boolean);
    return dedupeTxtEntries(hydrated);
  } catch {
    return [];
  }
}

function writeAchievedTxtWindows(entries) {
  try {
    const payload = dedupeTxtEntries(entries).map((entry) => ({
      id: entry.id,
      url: entry.url,
      title: entry.title,
      content: entry.content || "",
    }));
    window.sessionStorage.setItem(TXT_SESSION_KEY, JSON.stringify(payload));
  } catch {
    // ignore session storage failures
  }
}

function deriveAchievedTxtWindows(gameState) {
  if (!gameState) return [];

  return ACHIEVED_TXT_SOURCES.filter((source) =>
    source.isAchieved(gameState),
  ).map((source, index) => ({
    id: `achieved-${index}-${source.url}`,
    url: normalizeTxtUrlString(source.url),
    title: source.title,
    isOpen: false,
    loading: false,
    content: "",
    error: "",
    initialX: 38 + index * 22,
    initialY: 38 + index * 22,
  }));
}

function normalizeTxtUrl(rawUrl) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) return null;
  try {
    const resolved = new URL(rawUrl, window.location.href);
    if (!resolved.pathname.toLowerCase().endsWith(".txt")) return null;
    return resolved;
  } catch {
    return null;
  }
}

function TxtPopupWindow({ entry, onClose, zIndex = 9998, onFocusRequest }) {
  const { position, startDragging } = useDraggableWindow({
    x: entry.initialX,
    y: entry.initialY,
  });

  return (
    <div
      onMouseDown={() => onFocusRequest?.(entry.url)}
      onWheelCapture={(event) => event.stopPropagation()}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: "min(620px, 92vw)",
        height: "min(560px, 78vh)",
        zIndex,
        background: "#000",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 12px 48px rgba(0,0,0,0.9)",
        fontFamily: "'Courier New', Courier, monospace",
        overflow: "hidden",
      }}
    >
      <div
        onMouseDown={(event) => {
          onFocusRequest?.(entry.url);
          startDragging(event);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "7px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          cursor: "move",
          userSelect: "none",
          flexShrink: 0,
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
          {entry.title}
        </span>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onClose(entry.url);
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
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 20px",
          color: "#c8c8c8",
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        {entry.error && entry.error}
        {!entry.loading && !entry.error && entry.content}
      </div>
    </div>
  );
}

function CompletionDesktop() {
  const folders = PIECE_SLUGS.map((slug) => PIECE_TITLES[slug] ?? slug);

  return (
    <div className="completionDesktopRoot" aria-label="Collected desktop">
      <div className="completionGrid" role="list" aria-label="Cleaned folders">
        {folders.map((label, idx) => (
          <div
            key={label}
            role="listitem"
            className="desktopFolderTile"
            style={{ animationDelay: `${idx * 28}ms` }}
          >
            <svg
              viewBox="0 0 40 32"
              xmlns="http://www.w3.org/2000/svg"
              className="desktopFolderIcon"
              aria-hidden="true"
            >
              <path
                d="M2 8 C2 8 6 4 10 4 L16 4 C18 4 19 5.5 20 7 L38 7 C39.1 7 40 7.9 40 9 L40 28 C40 29.1 39.1 30 38 30 L2 30 C0.9 30 0 29.1 0 28 L0 10 C0 8.9 0.9 8 2 8Z"
                fill="#b52c2c"
                stroke="#ff5b5b"
                strokeWidth="1.4"
              />
            </svg>
            <span className="desktopFolderName desktopFolderLabel">
              {label}
            </span>
          </div>
        ))}

        <a
          href={SURVEY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="desktopAppTile"
          aria-label="Open survey"
        >
          <div className="appIcon appIconSurvey">
            <span className="appIconSurveyGlyph">^C</span>
          </div>
          <span className="desktopFolderName desktopLinkLabel">
            survey.html
          </span>
        </a>

        <a
          href={BOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="desktopAppTile"
          aria-label="Open collected exorcisms pdf"
        >
          <div className="appIcon appIconPdf">
            <img
              src={`${import.meta.env.BASE_URL}assets/body/collex_cover.png`}
              alt="Collected Exorcisms cover"
              className="bookCoverThumb"
            />
          </div>
          <span className="desktopFolderName desktopLinkLabel">
            collected_exorcisms.pdf
          </span>
        </a>
      </div>
    </div>
  );
}

function DesktopOnlyOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        background: "rgba(0, 0, 0, 0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "min(620px, 92vw)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 4,
          background: "#000",
          color: "#c8c8c8",
          fontFamily: "'Courier New', Courier, monospace",
          lineHeight: 1.55,
          boxShadow: "0 12px 48px rgba(0,0,0,0.9)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "7px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
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
        </div>

        <div style={{ padding: "20px 18px 18px" }}>
          <div
            style={{ fontSize: "0.96rem", marginBottom: 12, color: "#d2d2d2" }}
          >
            Collected Exorcisms is best experienced on desktop.
          </div>
          <div style={{ fontSize: "0.96rem", color: "#fff" }}>
            Check out the{" "}
            <a
              href={BOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#e05555", textDecoration: "none" }}
            >
              book
            </a>{" "}
            instead.
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "12px 14px 14px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <span style={{ fontFamily: "'Jacquard12', serif", color: "#e05555" }}>
            - Olivia
          </span>
        </div>
      </div>
    </div>
  );
}

function AppInner() {
  const goToPieceRef = useRef(null);
  const game = useGame();
  const { startTimer } = game;
  const { startAmbient, isMuted, toggleMute } = useAmbientAudio();
  const [onboardingDone, setOnboardingDone] = useState(() => {
    try {
      return window.sessionStorage.getItem(ONBOARDING_SESSION_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [cameraZ, setCameraZ] = useState(-200);
  const [showDesktopOverlay, setShowDesktopOverlay] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [txtWindows, setTxtWindows] = useState(() =>
    dedupeTxtEntries(readAchievedTxtWindows()),
  );
  const [terminalZIndex, setTerminalZIndex] = useState(9998);
  const [mapZIndex, setMapZIndex] = useState(9998);
  const [txtZByUrl, setTxtZByUrl] = useState({});
  const txtWindowIdRef = useRef(0);
  const txtFetchInFlightRef = useRef(new Set());
  const zCounterRef = useRef(10000);
  const appStartedRef = useRef(false);

  const getNextZIndex = useCallback(() => {
    zCounterRef.current += 1;
    return zCounterRef.current;
  }, []);

  const bringTerminalToFront = useCallback(() => {
    setTerminalZIndex(getNextZIndex());
  }, [getNextZIndex]);

  const bringMapToFront = useCallback(() => {
    setMapZIndex(getNextZIndex());
  }, [getNextZIndex]);

  const bringTxtToFront = useCallback(
    (url) => {
      const normalizedUrl = normalizeTxtUrlString(url);
      if (!normalizedUrl) return;
      const nextZ = getNextZIndex();
      setTxtZByUrl((prev) => ({
        ...prev,
        [normalizedUrl]: nextZ,
      }));
    },
    [getNextZIndex],
  );

  const allPiecesAt100 = PIECE_SLUGS.every(
    (slug) => game.getPieceProgress(slug) >= 100,
  );

  const openTxtWindow = useCallback(
    (rawUrl) => {
      console.log("[App] openTxtWindow called", { rawUrl });
      const resolvedUrl = normalizeTxtUrlString(rawUrl);
      if (!resolvedUrl) {
        console.log("[App] openTxtWindow rejected non-txt url", { rawUrl });
        return false;
      }

      const fileName = decodeURIComponent(
        resolvedUrl.split("/").pop() || "untitled.txt",
      );

      setTxtWindows((prev) => {
        const existing = prev.find((entry) => entry.url === resolvedUrl);
        if (existing) {
          const next = dedupeTxtEntries(
            prev.map((entry) =>
              entry.url === resolvedUrl
                ? { ...entry, isOpen: true, loading: !entry.content }
                : entry,
            ),
          );
          writeAchievedTxtWindows(next);
          return next;
        }

        const offset = (prev.length % 6) * 22;
        const nextEntry = {
          id: `${Date.now()}-${txtWindowIdRef.current++}`,
          url: resolvedUrl,
          title: fileName,
          isOpen: true,
          loading: true,
          content: "",
          error: "",
          initialX: 38 + offset,
          initialY: 38 + offset,
        };
        const next = dedupeTxtEntries([...prev, nextEntry]);
        writeAchievedTxtWindows(next);
        return next;
      });

      bringTxtToFront(resolvedUrl);

      return true;
    },
    [bringTxtToFront],
  );

  const closeTxtWindow = useCallback((url) => {
    setTxtWindows((prev) => {
      const next = dedupeTxtEntries(
        prev.map((entry) =>
          entry.url === url ? { ...entry, isOpen: false } : entry,
        ),
      );
      writeAchievedTxtWindows(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const pending = txtWindows.filter(
      (entry) => entry.loading && !entry.content && !entry.error,
    );

    for (const entry of pending) {
      if (txtFetchInFlightRef.current.has(entry.url)) continue;
      txtFetchInFlightRef.current.add(entry.url);

      const fileName = decodeURIComponent(
        entry.url.split("/").pop() || "untitled.txt",
      );
      console.log("[App] fetching txt popup content", {
        resolvedUrl: entry.url,
        fileName,
      });

      fetch(entry.url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Unable to load ${fileName}`);
          }
          return response.text();
        })
        .then((text) => {
          setTxtWindows((prev) => {
            const next = dedupeTxtEntries(
              prev.map((item) =>
                item.url === entry.url
                  ? { ...item, loading: false, content: text, error: "" }
                  : item,
              ),
            );
            writeAchievedTxtWindows(next);
            return next;
          });
        })
        .catch(() => {
          setTxtWindows((prev) => {
            const next = dedupeTxtEntries(
              prev.map((item) =>
                item.url === entry.url
                  ? {
                      ...item,
                      loading: false,
                      error: `ERROR: could not open ${fileName}`,
                    }
                  : item,
              ),
            );
            writeAchievedTxtWindows(next);
            return next;
          });
        })
        .finally(() => {
          txtFetchInFlightRef.current.delete(entry.url);
        });
    }
  }, [txtWindows]);

  const openMapWindow = useCallback(() => {
    if (!isMapOpen) game.incrementMapCount();
    setIsMapOpen(true);
    bringMapToFront();
  }, [bringMapToFront, game, isMapOpen]);

  useEffect(() => {
    if (!onboardingDone) return undefined;

    console.log("[App] enabling txt popup manager");
    const originalOpen = window.open.bind(window);
    window.__COLLEX_OPEN_TXT__ = openTxtWindow;
    const handleOpenTxtEvent = (event) => {
      const url = event?.detail;
      console.log("[App] collex:open-txt event received", { url, event });
      if (typeof url === "string") {
        openTxtWindow(url);
      }
    };
    const patchedOpen = (url, target, features) => {
      if (openTxtWindow(url)) return null;
      return originalOpen(url, target, features);
    };

    window.open = patchedOpen;
    window.addEventListener("collex:open-txt", handleOpenTxtEvent);

    const onDocumentClickCapture = (event) => {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || anchor.href;
      if (!openTxtWindow(href)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener("click", onDocumentClickCapture, true);

    return () => {
      document.removeEventListener("click", onDocumentClickCapture, true);
      window.removeEventListener("collex:open-txt", handleOpenTxtEvent);
      window.open = originalOpen;
      delete window.__COLLEX_OPEN_TXT__;
    };
  }, [onboardingDone, openTxtWindow]);

  const dockButtonStyle = {
    background: "#000",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 3,
    fontFamily: "'Jacquard12', serif",
    fontSize: "1rem",
    padding: "0 12px",
    cursor: "pointer",
    letterSpacing: "0.06em",
    boxShadow: "0 0 8px rgba(255,255,255,0.05)",
    transition: "border-color 0.2s, box-shadow 0.2s",
    width: "fit-content",
    flex: "0 0 auto",
    textAlign: "center",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    boxSizing: "border-box",
    lineHeight: 1,
  };

  const dockButtonHoverIn = (event) => {
    event.currentTarget.style.borderColor = "rgba(255,255,255,0.7)";
    event.currentTarget.style.boxShadow = "0 0 14px rgba(255,255,255,0.15)";
  };

  const dockButtonHoverOut = (event) => {
    event.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
    event.currentTarget.style.boxShadow = "0 0 8px rgba(255,255,255,0.05)";
  };

  const closedTxtWindows = txtWindows.filter((entry) => !entry.isOpen);
  const openTxtWindows = txtWindows.filter((entry) => entry.isOpen);
  const audioIconSrc = `${import.meta.env.BASE_URL}assets/body/${isMuted ? "muted.png" : "sound.png"}`;

  useEffect(() => {
    const derived = deriveAchievedTxtWindows(game.state);
    if (derived.length === 0) return;

    setTxtWindows((prev) => {
      const merged = dedupeTxtEntries([...prev, ...derived]);
      writeAchievedTxtWindows(merged);
      return merged;
    });
  }, [game.state]);

  useEffect(() => {
    const updateViewportState = () => {
      const visualViewport = window.visualViewport;
      const viewportWidth = visualViewport?.width ?? window.innerWidth;
      const viewportHeight = visualViewport?.height ?? window.innerHeight;

      document.documentElement.style.setProperty(
        "--app-vw",
        `${viewportWidth}px`,
      );
      document.documentElement.style.setProperty(
        "--app-vh",
        `${viewportHeight}px`,
      );

      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      const isNarrow = viewportWidth < 1024;
      const isMobileLike =
        /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        navigator.maxTouchPoints > 1;
      setShowDesktopOverlay(isPortrait || (isMobileLike && isNarrow));
    };

    updateViewportState();

    window.addEventListener("resize", updateViewportState);
    window.addEventListener("orientationchange", updateViewportState);
    document.addEventListener("fullscreenchange", updateViewportState);
    window.visualViewport?.addEventListener("resize", updateViewportState);
    window.visualViewport?.addEventListener("scroll", updateViewportState);

    return () => {
      window.removeEventListener("resize", updateViewportState);
      window.removeEventListener("orientationchange", updateViewportState);
      document.removeEventListener("fullscreenchange", updateViewportState);
      window.visualViewport?.removeEventListener("resize", updateViewportState);
      window.visualViewport?.removeEventListener("scroll", updateViewportState);
    };
  }, []);

  const handleOnboardingComplete = () => {
    try {
      window.sessionStorage.setItem(ONBOARDING_SESSION_KEY, "1");
    } catch {
      // ignore session storage failures
    }
    setOnboardingDone(true);
  };

  useEffect(() => {
    if (!onboardingDone || appStartedRef.current) return;
    appStartedRef.current = true;
    startTimer();
    startAmbient();
  }, [onboardingDone, startAmbient, startTimer]);

  return (
    <CameraContext.Provider
      value={{
        goToPiece: (idx) => goToPieceRef.current && goToPieceRef.current(idx),
      }}
    >
      {!onboardingDone && <Onboarding onComplete={handleOnboardingComplete} />}
      <div
        style={{
          height: "var(--app-vh, 100vh)",
          width: "var(--app-vw, 100vw)",
          overflow: "hidden",
        }}
      >
        {showDesktopOverlay && <DesktopOnlyOverlay />}
        <Terminal
          onboardingDone={onboardingDone}
          isOpen={isTerminalOpen}
          onOpenChange={setIsTerminalOpen}
          hideLauncher
          zIndex={terminalZIndex}
          onFocusRequest={bringTerminalToFront}
        />
        <MapWindow
          onboardingDone={onboardingDone}
          cameraZ={cameraZ}
          isOpen={isMapOpen}
          onOpenChange={setIsMapOpen}
          hideLauncher
          zIndex={mapZIndex}
          onFocusRequest={bringMapToFront}
        />
        {openTxtWindows.map((entry) => (
          <TxtPopupWindow
            key={entry.id}
            entry={entry}
            onClose={closeTxtWindow}
            zIndex={txtZByUrl[entry.url] ?? 9998}
            onFocusRequest={bringTxtToFront}
          />
        ))}

        {onboardingDone && (
          <div
            style={{
              position: "fixed",
              right: 24,
              bottom: 24,
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {closedTxtWindows.map((entry) => (
              <button
                key={entry.id}
                onClick={() => openTxtWindow(entry.url)}
                style={dockButtonStyle}
                onMouseEnter={dockButtonHoverIn}
                onMouseLeave={dockButtonHoverOut}
                title={entry.title}
              >
                {entry.title}
              </button>
            ))}

            <button
              onClick={openMapWindow}
              style={dockButtonStyle}
              onMouseEnter={dockButtonHoverIn}
              onMouseLeave={dockButtonHoverOut}
            >
              map
            </button>

            <button
              onClick={() => {
                setIsTerminalOpen(true);
                bringTerminalToFront();
              }}
              style={dockButtonStyle}
              onMouseEnter={dockButtonHoverIn}
              onMouseLeave={dockButtonHoverOut}
            >
              terminal
            </button>

            <button
              onClick={toggleMute}
              style={dockButtonStyle}
              onMouseEnter={dockButtonHoverIn}
              onMouseLeave={dockButtonHoverOut}
              aria-label={isMuted ? "unmute audio" : "mute audio"}
              title={isMuted ? "Unmute" : "Mute"}
            >
              <img
                src={audioIconSrc}
                alt=""
                aria-hidden="true"
                draggable={false}
                style={{
                  width: 12,
                  height: 12,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </button>
          </div>
        )}

        {!allPiecesAt100 ? (
          <ThreeScroll
            setGoToPiece={(fn) => (goToPieceRef.current = fn)}
            onCameraZChange={setCameraZ}
          />
        ) : (
          <CompletionDesktop />
        )}
        <BackgroundCollage cameraZ={cameraZ} />
      </div>
    </CameraContext.Provider>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AmbientAudioProvider>
        <AppInner />
      </AmbientAudioProvider>
    </GameProvider>
  );
}
