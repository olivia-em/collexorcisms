import React, { useState } from "react";
import styles from "./Piece13.module.css";

const Piece13 = () => {
  const [showSkull, setShowSkull] = useState(false);

  return (
    <div className={styles.piece13Container}>
      <p className={styles.symbolText}>
        .♱˚♰˚⋆
        <span
          className={styles.hoverSymbol}
          onMouseEnter={() => setShowSkull(true)}
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
