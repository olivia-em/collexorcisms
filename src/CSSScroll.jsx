import React, { useRef, useEffect, useState } from "react";
import styles from "./CSSScroll.module.css";

import { Suspense, lazy } from "react";
const Piece1 = lazy(() => import("./components/pieces/Piece1/Piece1"));
const Piece2 = lazy(() => import("./components/pieces/Piece2/Piece2"));
const Piece3 = lazy(() => import("./components/pieces/Piece3/Piece3"));
const Piece4 = lazy(() => import("./components/pieces/Piece4/Piece4"));
const Piece5 = lazy(() => import("./components/pieces/Piece5/Piece5"));
const Piece6 = lazy(() => import("./components/pieces/Piece6/Piece6"));
const Piece7 = lazy(() => import("./components/pieces/Piece7/Piece7"));
const Piece8 = lazy(() => import("./components/pieces/Piece8/Piece8"));
const Piece9 = lazy(() => import("./components/pieces/Piece9/Piece9"));
const Piece10 = lazy(() => import("./components/pieces/Piece10/Piece10"));
const Piece11 = lazy(() => import("./components/pieces/Piece11/Piece11"));
const Piece12 = lazy(() => import("./components/pieces/Piece12/Piece12"));
const Piece13 = lazy(() => import("./components/pieces/Piece13/Piece13"));
const Piece14 = lazy(() => import("./components/pieces/Piece14/Piece14"));
const Piece15 = lazy(() => import("./components/pieces/Piece15/Piece15"));
const Piece16 = lazy(() => import("./components/pieces/Piece16/Piece16"));
const Piece17 = lazy(() => import("./components/pieces/Piece17/Piece17"));
const Piece18 = lazy(() => import("./components/pieces/Piece18/Piece18"));
const Piece19 = lazy(() => import("./components/pieces/Piece19/Piece19"));
const Piece20 = lazy(() => import("./components/pieces/Piece20/Piece20"));
const Piece21 = lazy(() => import("./components/pieces/Piece21/Piece21"));
const Piece22 = lazy(() => import("./components/pieces/Piece22/Piece22"));

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

export default function ThreeScroll({ setGoToPiece }) {
  const [cameraZ, setCameraZ] = useState(-200);
  const scrollRef = useRef(-200);
  const spacing = 1000;
  const numPieces = 22;
  const minZ = -(numPieces - 1) * spacing - 700;
  const maxZ = -200;

  // Piece22 is fully in view when cameraZ is at its position
  const piece22Z = -200 - (numPieces - 1) * spacing;

  // Expose goToPiece to parent via setGoToPiece
  useEffect(() => {
    if (!setGoToPiece) return;
    setGoToPiece((pieceIdx) => {
      // pieceIdx is 1-based
      let z;
      if (pieceIdx === 22) {
        z = piece22Z;
      } else {
        z = -200 - (pieceIdx - 1) * spacing;
      }
      scrollRef.current = z;
      setCameraZ(z);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setGoToPiece, piece22Z, spacing]);

  // (No special logic for Piece5 or Piece22 needed)

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
          <Piece key={5} z={-200 - 4 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 5...</div>}>
              <Piece5 />
            </Suspense>
          </Piece>
          <Piece key={6} z={-200 - 5 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 6...</div>}>
              <Piece6 />
            </Suspense>
          </Piece>
          <Piece key={7} z={-200 - 6 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 7...</div>}>
              <Piece7 />
            </Suspense>
          </Piece>
          <Piece key={8} z={-200 - 7 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 8...</div>}>
              <Piece8 />
            </Suspense>
          </Piece>
          <Piece key={9} z={-200 - 8 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 9...</div>}>
              <Piece9 />
            </Suspense>
          </Piece>
          <Piece key={10} z={-200 - 9 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 10...</div>}>
              <Piece10 />
            </Suspense>
          </Piece>
          <Piece key={11} z={-200 - 10 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 11...</div>}>
              <Piece11 />
            </Suspense>
          </Piece>
          <Piece key={12} z={-200 - 11 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 12...</div>}>
              <Piece12 />
            </Suspense>
          </Piece>
          <Piece key={13} z={-200 - 12 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 13...</div>}>
              <Piece13 />
            </Suspense>
          </Piece>
          <Piece key={14} z={-200 - 13 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 14...</div>}>
              <Piece14 />
            </Suspense>
          </Piece>
          <Piece key={15} z={-200 - 14 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 15...</div>}>
              <Piece15 />
            </Suspense>
          </Piece>
          <Piece key={16} z={-200 - 15 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 16...</div>}>
              <Piece16 />
            </Suspense>
          </Piece>
          <Piece key={17} z={-200 - 16 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 17...</div>}>
              <Piece17 />
            </Suspense>
          </Piece>
          <Piece key={18} z={-200 - 17 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 18...</div>}>
              <Piece18 />
            </Suspense>
          </Piece>
          <Piece key={19} z={-200 - 18 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 19...</div>}>
              <Piece19 />
            </Suspense>
          </Piece>
          <Piece key={20} z={-200 - 19 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 20...</div>}>
              <Piece20 />
            </Suspense>
          </Piece>
          <Piece key={21} z={-200 - 20 * spacing} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 21...</div>}>
              <Piece21 />
            </Suspense>
          </Piece>
          <Piece key={22} z={piece22Z} cameraZ={cameraZ}>
            <Suspense fallback={<div>Loading Piece 22...</div>}>
              <Piece22 />
            </Suspense>
          </Piece>
        </div>
      </div>
    </div>
  );
}
