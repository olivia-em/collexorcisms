import React, { useRef, useEffect, useState } from "react";
import styles from "./CSSScroll.module.css";

import { Suspense, lazy } from "react";
const Piece1 = lazy(() => import("./components/pieces/Piece1/Piece1"));
const Piece2 = lazy(() => import("./components/pieces/Piece2/Piece2"));
const Piece3 = lazy(() => import("./components/pieces/Piece3/Piece3"));
const Piece4 = lazy(() => import("./components/pieces/Piece4/Piece4P5"));
const Piece5 = lazy(() => import("./components/pieces/Piece5/Piece5"));

// We'll pass orbitEnabled to Piece5 below

function Piece({ z, cameraZ, children }) {
  const distance = z - cameraZ;

  let opacity = 1;

  // Fade when camera gets close and passes through
  if (distance < 1 && distance > -2) {
    if (distance <= 0) {
      opacity = Math.max(0, 1 - Math.abs(distance) / 2);
    }
  }
  if (distance < -2) {
    opacity = 0;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: "50vw",
        height: "50vh",
        transform: `translate(-50%, -50%) translateZ(${z}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        color: "rgba(255, 255, 255, 0.95)",
        borderRadius: "0px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        opacity: opacity,
        transition: "opacity 0.1s",
      }}
    >
      {children}
    </div>
  );
}

export default function ThreeScroll() {
  const [cameraZ, setCameraZ] = useState(-200);
  const scrollRef = useRef(-200);
  const spacing = 1000;
  const numPieces = 5;
  const minZ = -(numPieces - 1) * spacing - 700;
  const maxZ = -200;

  // Piece5 is fully in view when cameraZ is at its position
  const piece5Z = -200 - (numPieces - 1) * spacing;
  const [isPiece5Active, setIsPiece5Active] = useState(false);

  useEffect(() => {
    setIsPiece5Active(cameraZ <= piece5Z + 50); // 50px threshold for full view
  }, [cameraZ, piece5Z]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const onWheel = (e) => {
      e.preventDefault();
      scrollRef.current -= e.deltaY;
      scrollRef.current = Math.max(minZ, Math.min(maxZ, scrollRef.current));
      setCameraZ(scrollRef.current);
    };

    const onKeyDown = (e) => {
      if (e.key === "ArrowUp") {
        scrollRef.current += 50;
      } else if (e.key === "ArrowDown") {
        scrollRef.current -= 50;
      }
      scrollRef.current = Math.max(minZ, Math.min(maxZ, scrollRef.current));
      setCameraZ(scrollRef.current);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [minZ, maxZ]);

  return (
    <div className={styles.container}>
      {/* <div className={styles.infoBox}>
        Scroll down to move forward through the pieces
        <br />
        Camera Z: {cameraZ.toFixed(0)}
        <br />
        Piece positions: -500, -2500, -4500
      </div> */}

      <div className={styles.perspectiveWrap}>
        <div
          className={styles.preserve3dWrap}
          style={{ transform: `translateZ(${-cameraZ}px)` }}
        >
          <Piece key={1} z={-200} cameraZ={cameraZ}>
            <Suspense fallback={<div></div>}>
              <Piece1 />
            </Suspense>
          </Piece>
          <Piece key={2} z={-200 - 1 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 2...</div>}>
              <Piece2 />
            </Suspense>
          </Piece>
          <Piece key={3} z={-200 - 2 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 3...</div>}>
              <Piece3 />
            </Suspense>
          </Piece>
          <Piece key={4} z={-200 - 3 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 4...</div>}>
              <Piece4 />
            </Suspense>
          </Piece>
          <Piece key={5} z={piece5Z} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 5...</div>}>
              <Piece5 orbitEnabled={isPiece5Active} />
            </Suspense>
          </Piece>
        </div>
      </div>
    </div>
  );
}
