import React, {
  useRef,
  useEffect,
  useState,
  memo,
  Suspense,
  lazy,
} from "react";
import styles from "./CSSScroll.module.css";

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

const spacing = 1000;
const numPieces = 22;
const MAX_Z = -200;
const MIN_Z = -(numPieces - 1) * spacing - 700;

// Pre-compute each piece's Z position once — never recalculated
const PIECE_ZS = Array.from({ length: numPieces }, (_, i) =>
  i === numPieces - 1
    ? MAX_Z - (numPieces - 1) * spacing // Piece22 special case
    : MAX_Z - i * spacing,
);

const PIECE_COMPONENTS = [
  Piece1,
  Piece2,
  Piece3,
  Piece4,
  Piece5,
  Piece6,
  Piece7,
  Piece8,
  Piece9,
  Piece10,
  Piece11,
  Piece12,
  Piece13,
  Piece14,
  Piece15,
  Piece16,
  Piece17,
  Piece18,
  Piece19,
  Piece20,
  Piece21,
  Piece22,
];

// ─── Piece wrapper — memo'd so it only re-renders when cameraZ changes enough
// to affect THIS piece's opacity or mount state
const Piece = memo(function Piece({ z, cameraZ, children }) {
  const distance = z - cameraZ;

  let opacity = 1;
  if (distance < 1 && distance > -2) {
    if (distance <= 0) opacity = Math.max(0, 1 - Math.abs(distance) / 2);
  }
  if (distance < -2) opacity = 0;

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
        opacity,
        transition: "opacity 0.1s",
      }}
    >
      {children}
    </div>
  );
});

// ─── Mount controller — keeps children mounted once they've been loaded,
// and starts loading earlier (3000px lookahead) so lazy imports resolve
// well before the piece scrolls into view.
const MOUNT_LOOKAHEAD = 3000; // start loading this many px before piece enters view
const UNMOUNT_DISTANCE = 4000; // unmount pieces this far behind camera

function useMountedPieces(cameraZ) {
  // Once a piece is mounted we keep it mounted (within unmount threshold)
  // to prevent remount-freeze on scroll-back
  const [mounted, setMounted] = useState(() => new Set());

  useEffect(() => {
    setMounted((prev) => {
      const next = new Set(prev);
      let changed = false;
      PIECE_ZS.forEach((z, i) => {
        const distance = z - cameraZ;
        const shouldMount =
          distance > -UNMOUNT_DISTANCE && distance < MOUNT_LOOKAHEAD;
        const alreadyMounted = prev.has(i);
        if (shouldMount && !alreadyMounted) {
          next.add(i);
          changed = true;
        }
        if (!shouldMount && alreadyMounted) {
          next.delete(i);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [cameraZ]);

  return mounted;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ThreeScroll({ setGoToPiece }) {
  const [cameraZ, setCameraZ] = useState(MAX_Z);
  const scrollRef = useRef(MAX_Z);
  const rafRef = useRef(null);

  // Expose goToPiece
  useEffect(() => {
    if (!setGoToPiece) return;
    setGoToPiece((pieceIdx) => {
      const z = PIECE_ZS[pieceIdx - 1] ?? MAX_Z;
      scrollRef.current = z;
      setCameraZ(z);
    });
  }, [setGoToPiece]);

  // rAF-batched scroll: raw scroll delta accumulates into scrollRef,
  // setCameraZ only fires once per animation frame — not on every wheel tick
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const flushScroll = () => {
      setCameraZ(scrollRef.current);
      rafRef.current = null;
    };

    const onWheel = (e) => {
      e.preventDefault();
      scrollRef.current = Math.max(
        MIN_Z,
        Math.min(MAX_Z, scrollRef.current - e.deltaY),
      );
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flushScroll);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "ArrowUp")
        scrollRef.current = Math.min(MAX_Z, scrollRef.current + 50);
      if (e.key === "ArrowDown")
        scrollRef.current = Math.max(MIN_Z, scrollRef.current - 50);
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flushScroll);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.body.style.overflow = "";
    };
  }, []);

  const mounted = useMountedPieces(cameraZ);

  return (
    <div className={styles.container}>
      <div className={styles.perspectiveWrap}>
        <div
          className={styles.preserve3dWrap}
          style={{ transform: `translateZ(${-cameraZ}px)` }}
        >
          {PIECE_ZS.map((z, i) => {
            const PieceComponent = PIECE_COMPONENTS[i];
            return (
              <Piece key={i} z={z} cameraZ={cameraZ}>
                {mounted.has(i) ? (
                  <Suspense fallback={<div />}>
                    <PieceComponent />
                  </Suspense>
                ) : null}
              </Piece>
            );
          })}
        </div>
      </div>
    </div>
  );
}
