import React, { useRef, useState } from "react";
import "./App.css";
import ThreeScroll from "./CSSScroll";
import BackgroundCollage from "./BackgroundCollage";
import Terminal from "./components/terminal/Terminal";
import Onboarding from "./components/onboarding/Onboarding";
import { CameraContext } from "./CameraContext";
import { GameProvider, useGame } from "./GameContext";
import { AmbientAudioProvider, useAmbientAudio } from "./AmbientAudioContext";

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
  const { startTimer } = useGame();
  const { startAmbient } = useAmbientAudio();
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [cameraZ, setCameraZ] = useState(-200);

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
        <MuteButton onboardingDone={onboardingDone} />
        {/* Terminal hidden (returns null) until onboarding is complete */}
        <Terminal onboardingDone={onboardingDone} />
        <ThreeScroll
          setGoToPiece={(fn) => (goToPieceRef.current = fn)}
          onCameraZChange={setCameraZ}
        />
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
