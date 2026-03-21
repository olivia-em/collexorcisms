import React, { useState } from "react";
import styles from "./Piece13.module.css";
import useTrackPiece from "../../../useTrackPiece";

const Piece13 = () => {
  const [showSkull, setShowSkull] = useState(false);
  const { markCompleted } = useTrackPiece("the_empathy_machine");
  return (
    <div className={styles.piece13Container}>
      <p className={styles.symbolText}>
        .
        <a
          href="/assets/piece13/machine.txt"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.symbolLink}
          onClick={markCompleted}
          aria-label="Open machine text"
        >
          ♱
        </a>
        ˚♰˚⋆
        <span
          className={styles.hoverSymbol}
          onMouseEnter={() => {
            setShowSkull(true);
          }}
          onMouseLeave={() => setShowSkull(false)}
        >
          {showSkull ? "☠︎︎" : "𓉸"}
        </span>
        ⋆˚♰˚♱.
      </p>
    </div>
  );
};

export default Piece13;
