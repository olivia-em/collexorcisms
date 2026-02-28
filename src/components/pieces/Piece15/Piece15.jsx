import React, { useCallback, useEffect, useState } from "react";
import styles from "./Piece15.module.css";
import { diffLines } from "../Piece8/diffLines.js";
import AnimatedLine from "../Piece8/AnimatedLine.jsx";
import useTrackPiece from "../../../useTrackPiece";

const Piece15 = () => {
  const [allVersions, setAllVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(-1);
  const [operations, setOperations] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completedLines, setCompletedLines] = useState(new Set());
  const { markInteracted } = useTrackPiece("31");
  // Load the three text files on mount
  useEffect(() => {
    const loadFiles = async () => {
      const versions = [];
      const files = ["sappho31.txt", "31.txt", "fragment.txt"];

      for (const file of files) {
        try {
          const response = await fetch(`/assets/piece15/${file}`);
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

  const isSappho31 = currentVersion === 0;
  const lastLineIndex = operations.length - 1;

  return (
    <div className={styles.piece15Container}>
      <div className={styles.poemLayout}>
        <div className={styles.columns}>
          <div className={`${styles.poemText} ${styles.column}`}>
            {operations.slice(0, 19).map((op, index) => {
              const isLastLine = index === lastLineIndex;
              return (
                <div
                  key={`${currentVersion}-${index}`}
                  className={`${styles.line} ${index === 0 ? styles.h2Title : ""}`}
                >
                  {isLastLine && isSappho31 ? (
                    <a
                      href="https://www.uh.edu/~cldue/texts/sappho.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.inlineLink}
                      onClick={markInteracted}
                    >
                      <AnimatedLine
                        operation={op}
                        lineIndex={index}
                        onComplete={handleLineComplete}
                      />
                    </a>
                  ) : (
                    <AnimatedLine
                      operation={op}
                      lineIndex={index}
                      onComplete={handleLineComplete}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div
            className={`${styles.poemText} ${styles.column} ${styles.rightColumn}`}
          >
            {operations.slice(19).map((op, index) => {
              const lineIndex = index + 19;
              const isLastLine = lineIndex === lastLineIndex;
              return (
                <div
                  key={`${currentVersion}-${lineIndex}`}
                  className={styles.line}
                >
                  {isLastLine && isSappho31 ? (
                    <a
                      href="https://www.uh.edu/~cldue/texts/sappho.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.inlineLink}
                      onClick={markInteracted}
                    >
                      <AnimatedLine
                        operation={op}
                        lineIndex={lineIndex}
                        onComplete={handleLineComplete}
                      />
                    </a>
                  ) : (
                    <AnimatedLine
                      operation={op}
                      lineIndex={lineIndex}
                      onComplete={handleLineComplete}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Piece15;
