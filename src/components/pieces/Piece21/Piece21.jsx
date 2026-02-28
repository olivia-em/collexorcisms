import React from "react";
import styles from "./Piece21.module.css";
import useTrackPiece from "../../../useTrackPiece";

const Piece21 = () => {
  useTrackPiece("fetish"); // visit-only

  return (
    <div className={styles.piece21Container}>
      <p className={styles.poemText}>
        <span className={styles.h2Title}>
          <i>place holder</i>
        </span>
        <br />
        place holder
      </p>
    </div>
  );
};

export default Piece21;
