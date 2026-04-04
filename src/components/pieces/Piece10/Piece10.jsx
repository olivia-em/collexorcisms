import React, { useEffect, useRef, useState } from "react";
import styles from "./Piece10.module.css";
import useTrackPiece from "../../../useTrackPiece";
import { useAmbientAudio } from "../../../AmbientAudioContext";

const Piece10 = () => {
  const { getPieceVolume, registerAudioElement } = useAmbientAudio();
  const spokenWordRef = useRef(null);
  const montageRef = useRef(null);
  const completionEmittedRef = useRef(false);
  const markCompletedRef = useRef(() => {});
  const isCompletedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [spokenWordOpacity, setSpokenWordOpacity] = useState(0);
  const [montageOpacity, setMontageOpacity] = useState(1);
  const spokenWordVolumeCap = getPieceVolume("piece10");
  const { markCompleted, isCompleted } = useTrackPiece("confessions");

  useEffect(() => {
    markCompletedRef.current = markCompleted;
  }, [markCompleted]);

  useEffect(() => {
    isCompletedRef.current = isCompleted;
  }, [isCompleted]);

  const handlePlay = async () => {
    try {
      setIsPlaying(true);
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
    if (!completionEmittedRef.current && !isCompletedRef.current) {
      completionEmittedRef.current = true;
      markCompletedRef.current?.();
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const normalizedX = x / width; // 0 to 1

    setSpokenWordOpacity(normalizedX);
    setMontageOpacity(1 - normalizedX);
  };

  useEffect(() => {
    if (spokenWordRef.current) {
      spokenWordRef.current.volume = spokenWordVolumeCap;
    }

    const unregisterSpoken = spokenWordRef.current
      ? registerAudioElement("piece10", spokenWordRef.current)
      : null;
    const unregisterMontage = montageRef.current
      ? registerAudioElement("piece10", montageRef.current)
      : null;

    return () => {
      unregisterSpoken?.();
      unregisterMontage?.();
      if (spokenWordRef.current) {
        spokenWordRef.current.pause();
        spokenWordRef.current.currentTime = 0;
      }
      if (montageRef.current) {
        montageRef.current.pause();
        montageRef.current.currentTime = 0;
      }
    };
  }, [registerAudioElement, spokenWordVolumeCap]);

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
