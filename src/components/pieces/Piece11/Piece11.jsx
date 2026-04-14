import React, { useState, useRef, useCallback } from "react";
import styles from "./Piece11.module.css";
import { useGame } from "../../../GameContext";
import useTrackPiece from "../../../useTrackPiece";

function SecretRow({ rowIndex, onSecretSubmit, onSubmitAttempt, isSubmitted }) {
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
    console.log("[Piece11] secret row submit clicked", {
      rowIndex,
      isSubmitted,
    });
    onSubmitAttempt?.(rowIndex);
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
  const { state, trackSecretSubmit } = useGame();
  const { markInteracted, markCompleted } = useTrackPiece("secrets");
  const interactedOnceRef = useRef(false);
  const secretSubmitAttemptCountRef = useRef(0);
  const submittedSet = new Set(state.secretRowsSubmitted ?? []);
  const submittedRows = [
    submittedSet.has(0),
    submittedSet.has(1),
    submittedSet.has(2),
  ];

  const openSecretsTxtPopup = useCallback(() => {
    const url = "/assets/piece11/secrets.txt";
    console.log("[Piece11] dispatching txt popup event", { url });
    if (window.__COLLEX_OPEN_TXT__?.(url)) {
      return;
    }
    window.dispatchEvent(new CustomEvent("collex:open-txt", { detail: url }));
  }, []);

  const handleSubmitAttempt = useCallback(
    (rowIndex) => {
      const nextCount = secretSubmitAttemptCountRef.current + 1;
      secretSubmitAttemptCountRef.current = nextCount;

      if (nextCount % 3 === 0) {
        openSecretsTxtPopup();
      }
    },
    [openSecretsTxtPopup],
  );

  const handleSecretSubmit = useCallback(
    (rowIndex) => {
      console.log("[Piece11] handleSecretSubmit", {
        rowIndex,
        submittedRows,
        submittedSet: Array.from(submittedSet),
      });
      if (!interactedOnceRef.current) {
        interactedOnceRef.current = true;
        markInteracted();
      }

      if (submittedSet.has(rowIndex)) return;
      trackSecretSubmit(rowIndex);
    },
    [markInteracted, submittedSet, trackSecretSubmit],
  );

  React.useEffect(() => {
    const hasN23Secret = (state.n23LinksClicked ?? []).includes("secret");
    const hasAllRows = (state.secretRowsSubmitted ?? []).length >= 3;
    if (hasN23Secret && hasAllRows) {
      markCompleted();
    }
  }, [markCompleted, state.n23LinksClicked, state.secretRowsSubmitted]);

  return (
    <div className={styles.piece11Container}>
      <div className={styles.secretsForm}>
        <SecretRow
          rowIndex={0}
          onSecretSubmit={handleSecretSubmit}
          onSubmitAttempt={handleSubmitAttempt}
          isSubmitted={submittedRows[0]}
        />
        <SecretRow
          rowIndex={1}
          onSecretSubmit={handleSecretSubmit}
          onSubmitAttempt={handleSubmitAttempt}
          isSubmitted={submittedRows[1]}
        />
        <SecretRow
          rowIndex={2}
          onSecretSubmit={handleSecretSubmit}
          onSubmitAttempt={handleSubmitAttempt}
          isSubmitted={submittedRows[2]}
        />
      </div>
    </div>
  );
};

export default Piece11;
