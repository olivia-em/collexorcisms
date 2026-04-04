import React, { useEffect, useRef, useState } from "react";
import styles from "./Piece9.module.css";
import useTrackPiece from "../../../useTrackPiece";
import { useAmbientAudio } from "../../../AmbientAudioContext";

const Piece9 = () => {
  const { getPieceVolume, registerAudioElement } = useAmbientAudio();
  const spokenWordRef = useRef(null);
  const montageRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [spokenWordOpacity, setSpokenWordOpacity] = useState(0);
  const [montageOpacity, setMontageOpacity] = useState(1);
  const spokenWordVolumeCap = getPieceVolume("piece9");
  const { markCompleted } = useTrackPiece("silhouettes");
  const handlePlay = async () => {
    try {
      setIsPlaying(true);
      markCompleted();
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
      ? registerAudioElement("piece9", spokenWordRef.current)
      : null;
    const unregisterMontage = montageRef.current
      ? registerAudioElement("piece9", montageRef.current)
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
    <div className={styles.piece9Container} onMouseMove={handleMouseMove}>
      <button
        className={styles.playButton}
        onClick={handlePlay}
        style={{ display: isPlaying ? "none" : "block" }}
      >
        Silhouettes
      </button>
      <video
        ref={spokenWordRef}
        className={styles.SpokenWord}
        playsInline
        src="/assets/piece9/Silhouettes.mp4"
        onEnded={handleVideoEnd}
        style={{ opacity: spokenWordOpacity }}
      />
      <video
        ref={montageRef}
        className={styles.Montage}
        muted
        playsInline
        src="/assets/piece9/SilhouettesMuted.mp4"
        style={{ opacity: montageOpacity }}
      />
    </div>
  );
};

export default Piece9;
