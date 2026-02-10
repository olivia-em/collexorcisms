import React, { useRef, useEffect, useState } from "react";
import styles from "./BackgroundCollage.module.css";

export default function BackgroundCollage() {
  return (
    <div className={styles.backgroundCollage}>
      <div className={styles.img1}></div>
      <div className={styles.img2}></div>
      <div className={styles.img3}></div>
    </div>
  );
}
