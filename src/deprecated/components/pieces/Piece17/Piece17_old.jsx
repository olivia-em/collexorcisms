import React from "react";
import styles from "./Piece17.module.css";
import { useCamera } from "../../../CameraContext";
import useTrackPiece from "../../../useTrackPiece";

const Piece17 = () => {
  const { goToPiece } = useCamera();
  const { markInteracted } = useTrackPiece("n23");
  const handleLinkClick = (e, pieceNumber) => {
    e.preventDefault();
    if (goToPiece && typeof goToPiece === "function") {
      goToPiece(pieceNumber);
    }
  };

  return (
    <div className={styles.piece17Container}>
      <p className={styles.poemText}>
        <span className={styles.h2Title}>
          <i>
            {" "}
            I’m angry and I’m bitter, but every time we were together, there
            were always people there.{" "}
            <a
              id="thirty-one"
              className={styles.poetryLink}
              href="#"
              onClick={(e) => {
                handleLinkClick(e, 15);
              }}
            >
              thirty-one
            </a>
            ,{" "}
            <a
              id="my-familiar"
              className={styles.poetryLink}
              href="#"
              onClick={(e) => {
                handleLinkClick(e, 4);
              }}
            >
              my familiar
            </a>
            … sometimes that{" "}
            <a
              id="monster"
              className={styles.poetryLink}
              href="#"
              onClick={(e) => {
                handleLinkClick(e, 18);
                markInteracted();
              }}
            >
              monster
            </a>{" "}
            (but not often) … and the{" "}
            <a
              id="secret"
              className={styles.poetryLink}
              href="#"
              onClick={(e) => {
                handleLinkClick(e, 11);
              }}
            >
              secret
            </a>{" "}
            love affair. I did it and it’s over, nothing can be fixed. We didn’t
            have very much (make that nothing) left to give. I won’t really miss
            you. (we placeholders understand.) Would that I could kiss you. (you
            who held my hand.) I’m a “new woman” now, but I hope she doesn’t
            stick. There are some nothings one would never want to fix. “When
            he’s holding me, I can pretend I have everything I want.”
          </i>
        </span>
        <br />
      </p>
    </div>
  );
};

export default Piece17;
