import React, { useEffect, useRef, useState } from "react";
import styles from "./Piece10.module.css";
import useTrackPiece from "../../../useTrackPiece";

const Piece10 = () => {
  const spokenWordRef = useRef(null);
  const montageRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [spokenWordOpacity, setSpokenWordOpacity] = useState(0);
  const [montageOpacity, setMontageOpacity] = useState(1);
  const { markInteracted } = useTrackPiece("confessions");
  const handlePlay = async () => {
    try {
      setIsPlaying(true);
      markInteracted();
      if (spokenWordRef.current) {
        await spokenWordRef.current.play();
      }
      if (montageRef.current) {
        await montageRef.current.play();
      }
    } catch (error) {
      console.error("Error playing videos:", error);
      setIsPlaying(false);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    const normalizedX = x / width; // 0 to 1
    const normalizedY = y / height; // 0 to 1

    setSpokenWordOpacity(normalizedX);
    setMontageOpacity(1 - normalizedX);

    if (spokenWordRef.current) {
      const muteThreshold = 0.1; // 10% from top
      spokenWordRef.current.volume =
        normalizedY < muteThreshold
          ? 0
          : (normalizedY - muteThreshold) / (1 - muteThreshold);
    }
  };

  useEffect(() => {
    return () => {
      if (spokenWordRef.current) {
        spokenWordRef.current.pause();
        spokenWordRef.current.currentTime = 0;
      }
      if (montageRef.current) {
        montageRef.current.pause();
        montageRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <div className={styles.piece10Container} onMouseMove={handleMouseMove}>
      <button
        className={styles.playButton}
        onClick={handlePlay}
        style={{ display: isPlaying ? "none" : "block" }}
      >
        Confessions
      </button>
      <video
        ref={spokenWordRef}
        className={styles.SpokenWord}
        playsInline
        src="/assets/piece10/confessions.mp4"
        onEnded={handleVideoEnd}
        style={{ opacity: spokenWordOpacity }}
      />
      <video
        ref={montageRef}
        className={styles.Montage}
        muted
        playsInline
        src="/assets/piece10/confessions2.mp4"
        style={{ opacity: montageOpacity }}
      />
    </div>
  );
};

export default Piece10;
