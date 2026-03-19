import React, { useRef, useState } from "react";
import "./App.css";
import ThreeScroll from "./CSSScroll";
import BackgroundCollage from "./BackgroundCollage";
import Terminal from "./components/terminal/Terminal";
import Onboarding from "./components/onboarding/Onboarding";
import { CameraContext } from "./CameraContext";
import { GameProvider, useGame } from "./GameContext";
import { AmbientAudioProvider, useAmbientAudio } from "./AmbientAudioContext";

function AppInner() {
  const goToPieceRef = useRef(null);
  const { startTimer } = useGame();
  const { startAmbient } = useAmbientAudio();
  const [onboardingDone, setOnboardingDone] = useState(false);

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
        {/* Terminal hidden (returns null) until onboarding is complete */}
        <Terminal onboardingDone={onboardingDone} />
        <ThreeScroll setGoToPiece={(fn) => (goToPieceRef.current = fn)} />
        <BackgroundCollage />
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
