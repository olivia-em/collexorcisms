import React from "react";
import styles from "./Piece4.module.css";
import useTrackPiece from "../../../useTrackPiece";
import { useGame } from "../../../GameContext";

const Piece4 = () => {
  useTrackPiece("my_familiar");
  const { trackMfFile } = useGame();

  const handleImageClick = (filename) => {
    trackMfFile(filename); // track which files have been opened
    const url = `${import.meta.env.BASE_URL}assets/piece4/${filename}`;
    window.open(url, "_blank");
  };

  const images = [
    { src: "IMG_8661.JPG", downloadFile: "MF.txt" },
    { src: "IMG_9109.JPG", downloadFile: "MF1.png" },
    { src: "IMG_8928.JPG", downloadFile: "MF2.png" },
    { src: "IMG_1009.JPG", downloadFile: "MF3.JPG" },
  ];

  return (
    <div className={styles.piece4Container}>
      <div className={styles.imagesRow}>
        {images.map((image, index) => (
          <img
            key={index}
            src={`${import.meta.env.BASE_URL}assets/piece4/${image.src}`}
            alt={`Piece 4 image ${index + 1}`}
            className={styles.image}
            onClick={() => handleImageClick(image.downloadFile)}
          />
        ))}
      </div>
    </div>
  );
};

export default Piece4;
