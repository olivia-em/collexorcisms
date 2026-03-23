import React, { useCallback, useEffect, useState } from "react";
import styles from "./Piece8.module.css";
import { diffLines } from "./diffLines.js";
import AnimatedLine from "./AnimatedLine.jsx";
import useTrackPiece from "../../../useTrackPiece";
import { useAmbientAudio } from "../../../AmbientAudioContext";

const Piece8 = () => {
  const { getPieceVolume } = useAmbientAudio();
  const { markCompleted, markInteracted, isCompleted } =
    useTrackPiece("objects_in_eleven");

  const [allVersions, setAllVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(-1);
  const [operations, setOperations] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completedLines, setCompletedLines] = useState(new Set());
  const [hasInteracted, setHasInteracted] = useState(false);
  const [audioFinished, setAudioFinished] = useState(false);

  const firstClickAudioPlayedRef = React.useRef(false);
  const lastClickAudioPlayedRef = React.useRef(false);
  const activeAudiosRef = React.useRef([]);
  const completionEmittedRef = React.useRef(false);

  useEffect(() => {
    const loadFiles = async () => {
      const versions = [];
      for (let i = 1; i <= 11; i++) {
        try {
          const response = await fetch(`/assets/piece8/objects${i}.txt`);
          const text = await response.text();
          versions.push(text.split("\n"));
        } catch (error) {
          console.error(`Error loading objects${i}.txt:`, error);
        }
      }
      setAllVersions(versions);
    };
    loadFiles();
  }, []);

  useEffect(() => {
    return () => {
      activeAudiosRef.current.forEach((audio) => {
        audio.onended = null;
        audio.pause();
        audio.currentTime = 0;
        audio.src = "";
      });
      activeAudiosRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (completionEmittedRef.current || isCompleted) return;
    if (currentVersion >= 10 && audioFinished) {
      completionEmittedRef.current = true;
      markCompleted();
    }
  }, [audioFinished, currentVersion, isCompleted, markCompleted]);

  const playObjectsAudio = useCallback(
    (trackCompletion = false) => {
      const audio = new Audio(
        `${import.meta.env.BASE_URL}assets/piece8/objects.mp3`,
      );
      audio.preload = "auto";
      audio.volume = getPieceVolume("piece8");

      const clearAudio = () => {
        activeAudiosRef.current = activeAudiosRef.current.filter(
          (a) => a !== audio,
        );
        audio.onended = null;
        audio.src = "";
      };

      if (trackCompletion) {
        setAudioFinished(false);
        audio.onended = () => {
          setAudioFinished(true);
          clearAudio();
        };
      }

      activeAudiosRef.current.push(audio);

      audio.play().catch(() => {
        clearAudio();
      });

      if (!trackCompletion) {
        audio.onended = clearAudio;
      }
    },
    [getPieceVolume],
  );

  const handleNext = () => {
    if (isAnimating || currentVersion >= 10 || allVersions.length === 0) return;

    const nextVersion = currentVersion + 1;
    const oldLines = currentVersion === -1 ? [] : allVersions[currentVersion];
    const newLines = allVersions[nextVersion];
    if (!newLines) return;

    // First click — mark interacted so non-Olivia obits (Nick, AJ, Michael) unlock
    if (!hasInteracted) {
      setHasInteracted(true);
      markInteracted();
    }

    // Play on first and last clicks. Each trigger creates a new audio instance,
    // so overlapping plays layer instead of restarting.
    if (!firstClickAudioPlayedRef.current && nextVersion === 0) {
      firstClickAudioPlayedRef.current = true;
      playObjectsAudio(false);
    }

    if (!lastClickAudioPlayedRef.current && nextVersion === 10) {
      lastClickAudioPlayedRef.current = true;
      playObjectsAudio(true);
    }

    const diff = diffLines(oldLines, newLines);
    setOperations(diff);
    setCurrentVersion(nextVersion);
    setIsAnimating(true);
    setCompletedLines(new Set());

    // Completion is now gated by BOTH conditions:
    // 1) final version reached (index 10), and 2) audio finished.
  };

  const handleLineComplete = useCallback(
    (index) => {
      setCompletedLines((prev) => {
        const newSet = new Set(prev);
        newSet.add(index);
        if (newSet.size === operations.length) setIsAnimating(false);
        return newSet;
      });
    },
    [operations.length],
  );

  const isDisabled =
    currentVersion >= 10 || isAnimating || allVersions.length === 0;
  const isPrintingLocked = isAnimating;

  return (
    <div className={styles.piece8Container}>
      <div className={styles.poemLayout}>
        <div className={styles.poemHeader}>
          <button
            className={`${styles.titleButton} ${isPrintingLocked ? styles.titleButtonPrinting : ""}`}
            onClick={handleNext}
            disabled={isDisabled}
          >
            objects in eleven
          </button>
        </div>
        <div className={styles.columns}>
          <div className={`${styles.poemText} ${styles.column}`}>
            {operations.slice(0, 30).map((op, index) => (
              <div key={`${currentVersion}-${index}`} className={styles.line}>
                <AnimatedLine
                  operation={op}
                  lineIndex={index}
                  onComplete={handleLineComplete}
                  reverse={true}
                />
              </div>
            ))}
          </div>
          <div className={`${styles.poemText} ${styles.column}`}>
            {operations.slice(30).map((op, index) => {
              const lineIndex = index + 30;
              return (
                <div
                  key={`${currentVersion}-${lineIndex}`}
                  className={styles.line}
                >
                  <AnimatedLine
                    operation={op}
                    lineIndex={lineIndex}
                    onComplete={handleLineComplete}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Piece8;
