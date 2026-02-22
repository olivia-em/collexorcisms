import React, { useCallback, useEffect, useState } from "react";
import styles from "./Piece8.module.css";
import { diffLines } from "./diffLines.js";
import AnimatedLine from "./AnimatedLine.jsx";

const Piece8 = () => {
  const [allVersions, setAllVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(-1); // -1 means nothing displayed yet
  const [operations, setOperations] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completedLines, setCompletedLines] = useState(new Set());

  // Load all 11 text files on mount
  useEffect(() => {
    const loadFiles = async () => {
      const versions = [];
      for (let i = 1; i <= 11; i++) {
        try {
          const response = await fetch(`/assets/piece8/objects${i}.txt`);
          const text = await response.text();
          const lines = text.split("\n");
          versions.push(lines);
        } catch (error) {
          console.error(`Error loading objects${i}.txt:`, error);
        }
      }
      setAllVersions(versions);
    };

    loadFiles();
  }, []);

  const handleNext = () => {
    if (isAnimating || currentVersion >= 10 || allVersions.length === 0) return;

    const nextVersion = currentVersion + 1;
    const oldLines = currentVersion === -1 ? [] : allVersions[currentVersion];
    const newLines = allVersions[nextVersion];

    if (!newLines) return;

    const diff = diffLines(oldLines, newLines);
    setOperations(diff);
    setCurrentVersion(nextVersion);
    setIsAnimating(true);
    setCompletedLines(new Set());
  };

  const handleLineComplete = useCallback(
    (index) => {
      setCompletedLines((prev) => {
        const newSet = new Set(prev);
        newSet.add(index);

        if (newSet.size === operations.length) {
          setIsAnimating(false);
        }

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
            objects
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
