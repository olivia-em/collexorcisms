import React, { useEffect, useState } from "react";
import styles from "./Piece14.module.css";
import useTrackPiece from "../../../useTrackPiece";

const BLEND_MODES = [
  "difference",
  "multiply",
  "screen",
  "overlay",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
];

const Piece14 = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [blendModeIndex, setBlendModeIndex] = useState(0);
  const { markInteracted } = useTrackPiece("s_curves"); // interaction: hover
  useEffect(() => {
    if (!isHovering) return;

    const interval = setInterval(() => {
      setBlendModeIndex((prev) => (prev + 1) % BLEND_MODES.length);
    }, 50); // Change blend mode every 100ms

    return () => clearInterval(interval);
  }, [isHovering]);

  const blendMode = BLEND_MODES[blendModeIndex];

  return (
    <div className={styles.piece14Container}>
      <img
        className={styles.SpokenWord}
        src="/assets/piece14/IMG_2897.JPEG"
        alt=""
      />
      <img
        className={styles.Montage}
        src="/assets/piece14/IMG_2363.jpg"
        style={{ mixBlendMode: blendMode }}
        onMouseEnter={() => {
          setIsHovering(true);
          markInteracted();
        }}
        onMouseLeave={() => {
          setIsHovering(false);
          setBlendModeIndex(0);
        }}
        alt=""
      />
    </div>
  );
};

export default Piece14;
