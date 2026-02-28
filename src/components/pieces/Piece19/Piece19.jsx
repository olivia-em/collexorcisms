import React from "react";
import styles from "./Piece19.module.css";
import useTrackPiece from "../../../useTrackPiece";

const Piece19 = () => {
  const { markInteracted } = useTrackPiece("first_on_first");

  return (
    <div className={styles.piece19Container} onClick={markInteracted}>
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

export default Piece19;
