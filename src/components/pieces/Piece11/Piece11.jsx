import React, { useState, useRef, useCallback } from "react";
import styles from "./Piece11.module.css";
import useTrackPiece from "../../../useTrackPiece";

function SecretRow({ rowIndex, onSecretSubmit, isSubmitted }) {
  const [preposition, setPreposition] = useState("with");
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      setCursorPos(Math.max(0, cursorPos - 1));
    } else if (e.key.length === 1) {
      // Only advance for single character keys, not special keys
      e.preventDefault();
      setCursorPos(cursorPos + 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCursorPos(0);
    if (isSubmitted) return;
    onSecretSubmit(rowIndex);
  };

  const handleInputChange = (e) => {
    // Prevent any actual input
    e.target.value = "";
  };

  return (
    <div className={styles.secretRow}>
      <span className={styles.secretLabel}>secrets</span>
      <select
        value={preposition}
        onChange={(e) => setPreposition(e.target.value)}
        className={styles.prepositionSelect}
      >
        <option value="with">with</option>
        <option value="for">for</option>
        <option value="from">from</option>
      </select>
      <span className={styles.youLabel}>you..</span>
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          className={styles.secretInput}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          value=""
          style={{
            backgroundSize: `${cursorPos * 8}px 100%`,
          }}
        />
        <span className={styles.cursorIndicator}>{cursorPos}</span>
      </div>
      {/* <span className={styles.shhLabel}>shhh</span> */}
      <button onClick={handleSubmit} className={styles.submitButton}>
        shh...
      </button>
    </div>
  );
}

const Piece11 = () => {
  const { markCompleted } = useTrackPiece("secrets");
  const [submittedRows, setSubmittedRows] = useState([false, false, false]);
  const hasOpenedSecretsRef = useRef(false);

  const handleSecretSubmit = useCallback((rowIndex) => {
    setSubmittedRows((prev) => {
      if (prev[rowIndex]) return prev;

      const next = [...prev];
      next[rowIndex] = true;

      // Open the text file once all three unique submit buttons have been pressed.
      if (!hasOpenedSecretsRef.current && next.every(Boolean)) {
        hasOpenedSecretsRef.current = true;
        markCompleted();
        window.open(
          "/assets/piece11/secrets.txt",
          "_blank",
          "noopener,noreferrer",
        );
      }

      return next;
    });
  }, []);

  return (
    <div className={styles.piece11Container}>
      <div className={styles.secretsForm}>
        <SecretRow
          rowIndex={0}
          onSecretSubmit={handleSecretSubmit}
          isSubmitted={submittedRows[0]}
        />
        <SecretRow
          rowIndex={1}
          onSecretSubmit={handleSecretSubmit}
          isSubmitted={submittedRows[1]}
        />
        <SecretRow
          rowIndex={2}
          onSecretSubmit={handleSecretSubmit}
          isSubmitted={submittedRows[2]}
        />
      </div>
    </div>
  );
};

export default Piece11;
