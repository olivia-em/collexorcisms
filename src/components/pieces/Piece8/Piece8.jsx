import React, { useCallback, useEffect, useState } from "react";
import styles from "./Piece8.module.css";
import { diffLines } from "./diffLines.js";
import AnimatedLine from "./AnimatedLine.jsx";
import useTrackPiece from "../../../useTrackPiece";

const Piece8 = () => {
  const { markCompleted, markInteracted, isCompleted } =
    useTrackPiece("objects_in_eleven");

  const [allVersions, setAllVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(-1);
  const [operations, setOperations] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completedLines, setCompletedLines] = useState(new Set());
  const [hasInteracted, setHasInteracted] = useState(false);
  const [audioFinished, setAudioFinished] = useState(false);

  const audioRef = React.useRef(null);
  const audioStartedRef = React.useRef(false);
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
      const audio = audioRef.current;
      if (!audio) return;
      audio.onended = null;
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
      audioRef.current = null;
      audioStartedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (completionEmittedRef.current || isCompleted) return;
    if (currentVersion >= 10 && audioFinished) {
      completionEmittedRef.current = true;
      markCompleted();
    }
  }, [audioFinished, currentVersion, isCompleted, markCompleted]);

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

    // Second click — start audio once
    if (!audioStartedRef.current && nextVersion >= 1) {
      const audio = new Audio(
        `${import.meta.env.BASE_URL}assets/piece8/olivia.love.mp3`,
      );
      audio.preload = "auto";
      audio.onended = () => {
        setAudioFinished(true);
      };
      audioRef.current = audio;
      audioStartedRef.current = true;
      audio.play().catch(() => {
        audioStartedRef.current = false;
      });
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

  return (
    <div className={styles.piece8Container}>
      <div className={styles.poemLayout}>
        <div className={styles.poemHeader}>
          <button
            className={styles.titleButton}
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
