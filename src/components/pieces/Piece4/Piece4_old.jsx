import React from "react";
import styles from "./Piece4.module.css";

const Piece4 = () => {
  const handleImageClick = (filename) => {
    const link = document.createElement("a");
    link.href = `${import.meta.env.BASE_URL}assets/piece4/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
