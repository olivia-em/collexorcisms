import React, { useCallback, useEffect, useState } from "react";
import styles from "./Piece8.module.css";
import { diffLines } from "./diffLines.js";
import AnimatedLine from "./AnimatedLine.jsx";
import useTrackPiece from "../../../useTrackPiece";
import { useGame } from "../../../GameContext";
import { useAmbientAudio } from "../../../AmbientAudioContext";
import { createManagedAudio } from "../../../managedAudio";

const Piece8 = () => {
  const { trackObjectsInElevenStep, state } = useGame();
  const { getPieceVolume, registerAudioElement } = useAmbientAudio();
  const { markCompleted, markInteracted, isCompleted } =
    useTrackPiece("objects_in_eleven");

  const [allVersions, setAllVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(-1);
  const [operations, setOperations] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completedLines, setCompletedLines] = useState(new Set());
  const [hasInteracted, setHasInteracted] = useState(false);
  const hydratedFromStateRef = React.useRef(false);

  const firstClickAudioPlayedRef = React.useRef(false);
  const lastClickAudioPlayedRef = React.useRef(false);
  const activeAudioCleanupsRef = React.useRef([]);
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
      activeAudioCleanupsRef.current.forEach((cleanup) => cleanup?.());
      activeAudioCleanupsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (completionEmittedRef.current || isCompleted) return;
    if (currentVersion >= 10) {
      completionEmittedRef.current = true;
      markCompleted();
    }
  }, [currentVersion, isCompleted, markCompleted]);

  useEffect(() => {
    if (hydratedFromStateRef.current || allVersions.length === 0) return;

    const savedSteps = Math.max(
      0,
      Math.min(11, Number(state.objectsInElevenInteractions) || 0),
    );

    if (savedSteps > 0) {
      const savedVersion = savedSteps - 1;
      const savedLines = allVersions[savedVersion] ?? [];
      setCurrentVersion(savedVersion);
      setOperations(diffLines([], savedLines));
      setIsAnimating(true);
      setCompletedLines(new Set());
      setHasInteracted(true);
      firstClickAudioPlayedRef.current = true;
      if (savedVersion >= 10) {
        lastClickAudioPlayedRef.current = true;
      }
    }

    hydratedFromStateRef.current = true;
  }, [allVersions, state.objectsInElevenInteractions]);

  const playObjectsAudio = useCallback(() => {
    const { audio, cleanup } = createManagedAudio({
      src: `${import.meta.env.BASE_URL}assets/piece8/objects.mp3`,
      volume: getPieceVolume("piece8"),
      registerAudioElement: (element) =>
        registerAudioElement("piece8", element),
      onEnded: () => {
        clearAudio();
      },
    });

    const clearAudio = () => {
      activeAudioCleanupsRef.current = activeAudioCleanupsRef.current.filter(
        (fn) => fn !== cleanup,
      );
      cleanup();
    };

    activeAudioCleanupsRef.current.push(cleanup);

    audio.play().catch(() => {
      clearAudio();
    });
  }, [getPieceVolume, registerAudioElement]);

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
      playObjectsAudio();
    }

    if (!lastClickAudioPlayedRef.current && nextVersion === 10) {
      lastClickAudioPlayedRef.current = true;
      playObjectsAudio();
    }

    const diff = diffLines(oldLines, newLines);
    setOperations(diff);
    setCurrentVersion(nextVersion);
    trackObjectsInElevenStep(nextVersion + 1);
    setIsAnimating(true);
    setCompletedLines(new Set());
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
