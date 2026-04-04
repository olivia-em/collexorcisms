import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import ThreeScroll from "./CSSScroll";
import BackgroundCollage from "./BackgroundCollage";
import Terminal from "./components/terminal/Terminal";
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

function MuteButton({ onboardingDone }) {
  const { isMuted, toggleMute } = useAmbientAudio();
  const iconSrc = `${import.meta.env.BASE_URL}assets/body/${isMuted ? "muted.png" : "sound.png"}`;

  if (!onboardingDone) return null;

  return (
    <button
      onClick={toggleMute}
      aria-label={isMuted ? "unmute audio" : "mute audio"}
      title={isMuted ? "Unmute" : "Mute"}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: "#000",
        border: "1px solid rgba(255,255,255,0.3)",
        borderRadius: 3,
        padding: "0 8px",
        cursor: "pointer",
        boxShadow: "0 0 8px rgba(255,255,255,0.05)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        width: 28,
        height: 28,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
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
      <img
        src={iconSrc}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{
          width: 10,
          height: 10,
          objectFit: "contain",
          imageRendering: "auto",
        }}
      />
    </button>
  );
}

function AppInner() {
  const goToPieceRef = useRef(null);
  const game = useGame();
  const { startTimer } = game;
  const { startAmbient } = useAmbientAudio();
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [cameraZ, setCameraZ] = useState(-200);
  const [showDesktopOverlay, setShowDesktopOverlay] = useState(false);

  const allPiecesAt100 = PIECE_SLUGS.every(
    (slug) => game.getPieceProgress(slug) >= 100,
  );

  useEffect(() => {
    const updateOverlay = () => {
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      const isNarrow = window.innerWidth < 1024;
      const isMobileLike =
        /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        navigator.maxTouchPoints > 1;
      setShowDesktopOverlay(isPortrait || (isMobileLike && isNarrow));
    };

    updateOverlay();
    window.addEventListener("resize", updateOverlay);
    window.addEventListener("orientationchange", updateOverlay);
    return () => {
      window.removeEventListener("resize", updateOverlay);
      window.removeEventListener("orientationchange", updateOverlay);
    };
  }, []);

  const handleOnboardingComplete = () => {
    startTimer();
    startAmbient();
    setOnboardingDone(true);
  };

  return (
    <CameraContext.Provider
      value={{
        goToPiece: (idx) => goToPieceRef.current && goToPieceRef.current(idx),
      }}
    >
      <Onboarding onComplete={handleOnboardingComplete} />
      <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
        {showDesktopOverlay && <DesktopOnlyOverlay />}
        <MuteButton onboardingDone={onboardingDone} />
        <Terminal onboardingDone={onboardingDone} cameraZ={cameraZ} />
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
