import React, { useCallback, useEffect, useState } from "react";
import styles from "./Piece12.module.css";
import { diffLines } from "../Piece8/diffLines.js";
import AnimatedLine from "../Piece8/AnimatedLine.jsx";

const Piece12 = () => {
  const [allVersions, setAllVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(-1);
  const [operations, setOperations] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completedLines, setCompletedLines] = useState(new Set());

  // Load the two text files on mount
  useEffect(() => {
    const loadFiles = async () => {
      const versions = [];
      const files = ["parasite.txt", "ww2.txt"];

      for (const file of files) {
        try {
          const response = await fetch(`/assets/piece12/${file}`);
          const text = await response.text();
          const lines = text.split("\n");
          versions.push(lines);
        } catch (error) {
          console.error(`Error loading ${file}:`, error);
        }
      }
      setAllVersions(versions);
    };

    loadFiles();
  }, []);

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

  // Automatic cycling with pause
  useEffect(() => {
    if (allVersions.length === 0) return;

    // Start immediately with first version
    if (currentVersion === -1) {
      const timer = setTimeout(() => {
        const nextVersion = 0;
        const diff = diffLines([], allVersions[nextVersion]);
        setOperations(diff);
        setCurrentVersion(nextVersion);
        setIsAnimating(true);
        setCompletedLines(new Set());
      }, 500);
      return () => clearTimeout(timer);
    }

    // Wait for animation to complete, then pause before next version
    if (!isAnimating && currentVersion !== -1) {
      const timer = setTimeout(
        () => {
          const nextVersion = (currentVersion + 1) % allVersions.length;
          const oldLines = allVersions[currentVersion];
          const newLines = allVersions[nextVersion];
          const diff = diffLines(oldLines, newLines);
          setOperations(diff);
          setCurrentVersion(nextVersion);
          setIsAnimating(true);
          setCompletedLines(new Set());
        },
        2000, // 2 second pause between versions
      );
      return () => clearTimeout(timer);
    }
  }, [allVersions, currentVersion, isAnimating]);

  return (
    <div className={styles.piece12Container}>
      <div className={styles.poemLayout}>
        <div className={styles.columns}>
          <div className={`${styles.poemText} ${styles.column}`}>
            {operations.slice(0, 25).map((op, index) => (
              <div
                key={`${currentVersion}-${index}`}
                className={`${styles.line} ${index === 0 ? styles.h2Title : ""}`}
              >
                <AnimatedLine
                  operation={op}
                  lineIndex={index}
                  onComplete={handleLineComplete}
                />
              </div>
            ))}
          </div>
          <div
            className={`${styles.poemText} ${styles.column} ${styles.rightColumn}`}
          >
            {operations.slice(25).map((op, index) => {
              const lineIndex = index + 25;
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

export default Piece12;
