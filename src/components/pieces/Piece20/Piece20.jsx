import React from "react";
import styles from "./Piece20.module.css";
import useTrackPiece from "../../../useTrackPiece";

const Piece20 = () => {
  const { markInteracted } = useTrackPiece("teethmarks");

  return (
    <div className={styles.piece20Container} onClick={markInteracted}>
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

export default Piece20;
