import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Piece21.module.css";
import useTrackPiece from "../../../useTrackPiece";

const LINE_DURATION_MS = 4200;
const HOLD_MARK_MS = Math.round(LINE_DURATION_MS * 0.45);

const Piece21 = () => {
  const { markCompleted, isCompleted } = useTrackPiece("fetish");
  const [lines, setLines] = useState([]);
  const [started, setStarted] = useState(false);
  const markCompletedRef = useRef(markCompleted);
  const isCompletedRef = useRef(isCompleted);
  const holdTimerRef = useRef(null);

  useEffect(() => {
    markCompletedRef.current = markCompleted;
  }, [markCompleted]);

  useEffect(() => {
    isCompletedRef.current = isCompleted;
  }, [isCompleted]);

  useEffect(() => {
    let cancelled = false;

    fetch("/assets/piece21/fetish.txt")
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        const parsed = text.replace(/\r/g, "").split("\n");
        while (parsed.length > 0 && parsed[parsed.length - 1].trim() === "") {
          parsed.pop();
        }
        setLines(parsed);
      })
      .catch((err) => {
        console.error("Piece21 text load failed", err);
      });

    return () => {
      cancelled = true;
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  const lineStyle = useMemo(
    () => (idx) => ({
      animationDuration: `${LINE_DURATION_MS}ms`,
      animationDelay: `${idx * LINE_DURATION_MS}ms`,
    }),
    [],
  );

  const handleLastLineStart = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      if (isCompletedRef.current) return;
      markCompletedRef.current?.();
    }, HOLD_MARK_MS);
  };

  return (
    <div className={styles.piece21Container}>
      <div className={styles.stage}>
        <button
          type="button"
          className={`${styles.titleButton} ${started ? styles.titleExit : ""}`}
          onClick={() => setStarted(true)}
          disabled={started}
        >
          fetish
        </button>

        {started && (
          <div className={styles.linesLayer}>
            {lines.map((line, idx) => (
              <p
                key={idx}
                className={`${styles.line} ${idx === lines.length - 1 ? styles.lineHold : ""}`}
                style={lineStyle(idx)}
                onAnimationStart={
                  idx === lines.length - 1 ? handleLastLineStart : undefined
                }
              >
                {line || "\u00A0"}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Piece21;
