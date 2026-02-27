import React, { useState, useEffect } from "react";
import styles from "./Onboarding.module.css";

function Onboarding() {
  const [showOverlay, setShowOverlay] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);
  const fullText = "Collected Exorcisms";

  const handleOverlayClick = () => {
    setFadingOut(true);
    setTimeout(() => {
      setShowOverlay(false);
    }, 500);
  };

  useEffect(() => {
    // Typing effect
    if (showOverlay && typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 100);
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

  if (!showOverlay) return null;

  return (
    <div
      className={`${styles.loadingOverlay} ${fadingOut ? styles.fadeOut : ""}`}
      onClick={handleOverlayClick}
    >
      <h1 className={styles.loadingTitle}>
        {typedText}
        <span className={styles.blinkingCursor}>_</span>
      </h1>
      <p className={`${styles.byline} ${typingComplete ? styles.show : ""}`}>
        by Olivia Lee
      </p>
    </div>
  );
}

export default Onboarding;
