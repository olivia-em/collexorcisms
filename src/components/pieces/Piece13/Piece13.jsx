import React, { useState } from "react";
import styles from "./Piece13.module.css";
import useTrackPiece from "../../../useTrackPiece";

const Piece13 = () => {
  const [showSkull, setShowSkull] = useState(false);
  const { markInteracted } = useTrackPiece("the_empathy_machine"); // interaction: hover
  return (
    <div className={styles.piece13Container}>
      <p className={styles.symbolText}>
        .♱˚♰˚⋆
        <span
          className={styles.hoverSymbol}
          onMouseEnter={() => {
            setShowSkull(true);
            markInteracted();
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
