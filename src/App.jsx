import React, { useRef, useState, useEffect } from "react";
import "./App.css";
import ThreeScroll from "./CSSScroll";
import BackgroundCollage from "./BackgroundCollage";
import Search from "./Search";
import { CameraContext } from "./CameraContext";

function App() {
  // We'll use a ref to store the goToPiece function from ThreeScroll
  const goToPieceRef = useRef(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);
  const fullText = "Collected Exorcisms";

  const handleOverlayClick = () => {
    setFadingOut(true);
    setTimeout(() => {
      setShowOverlay(false);
    }, 500); // Match the CSS transition duration
  };

  useEffect(() => {
    // Typing effect
    if (showOverlay && typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 100); // 100ms per character
      return () => clearTimeout(timeout);
    } else if (typedText.length === fullText.length && !typingComplete) {
      setTypingComplete(true);
    }
  }, [typedText, showOverlay, typingComplete]);

  useEffect(() => {
    // Disable scrolling when overlay is visible
    if (showOverlay) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [showOverlay]);

  return (
    <CameraContext.Provider
      value={{
        goToPiece: (idx) => goToPieceRef.current && goToPieceRef.current(idx),
      }}
    >
      {showOverlay && (
        <div
          className={`loadingOverlay ${fadingOut ? "fadeOut" : ""}`}
          onClick={handleOverlayClick}
        >
          <h1 className="loadingTitle">
            {typedText}
            <span className="blinkingCursor">_</span>
          </h1>
          <p className={`byline ${typingComplete ? "show" : ""}`}>
            by Olivia Lee
          </p>
        </div>
      )}
      <div
        style={{
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          pointerEvents: showOverlay ? "none" : "auto",
        }}
      >
        <Search />
        <ThreeScroll setGoToPiece={(fn) => (goToPieceRef.current = fn)} />
        <BackgroundCollage />
      </div>
    </CameraContext.Provider>
  );
}

export default App;
