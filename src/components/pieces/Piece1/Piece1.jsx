import React, { useState } from "react";
import styles from "./Piece1.module.css";
import img1Small from "/assets/piece1/IMG_1836_small.JPG";

function Piece1() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.piece1Container}>
      {expanded ? (
        <div className={styles.imageView} onClick={() => setExpanded(false)}>
          <img src={img1Small} alt="justBones" className={styles.expandedImg} />
          <span className={styles.closeHint}>click to close</span>
        </div>
      ) : (
        <button
          className={styles.folderBtn}
          onClick={() => setExpanded(true)}
          aria-label="Open justBones"
        >
          {/* Folder icon built from CSS — no external icon dependency */}
          <span className={styles.folderIcon} aria-hidden="true">
            <svg
              viewBox="0 0 40 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.folderSvg}
            >
              {/* folder tab */}
              <path
                d="M2 8 C2 8 6 4 10 4 L16 4 C18 4 19 5.5 20 7 L38 7 C39.1 7 40 7.9 40 9 L40 28 C40 29.1 39.1 30 38 30 L2 30 C0.9 30 0 29.1 0 28 L0 10 C0 8.9 0.9 8 2 8Z"
                className={styles.folderBody}
              />
            </svg>
          </span>
          <span className={styles.folderLabel}>justBones</span>
        </button>
      )}
    </div>
  );
}

export default Piece1;
