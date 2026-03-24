import React, {
  useRef,
  useEffect,
  useState,
  Suspense,
  lazy,
  createContext,
  useContext,
} from "react";
import styles from "./CSSScroll.module.css";

// ─── Visibility context ───────────────────────────────────────────────────────
// Pieces consume this to know whether they are currently "at the camera"
// (opacity === 1). useTrackPiece gates markVisited on this.
export const PieceVisibilityContext = createContext(false);
// Pieces can also consume this wider range to show UI while still interactable.
export const PieceInteractionContext = createContext(false);
// True only when camera is clamped at the furthest scroll position.
export const ScrollAtEndContext = createContext(false);

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

// ─── Mount distance tuning ────────────────────────────────────────────────────
const MOUNT_LOOKAHEAD = 3000; // load this many px ahead of camera
const UNMOUNT_DISTANCE = 2500; // unmount this many px behind camera
const PIECE7_MOUNT_LOOKAHEAD = 1300; // tighter mount window for Piece7
const PIECE7_UNMOUNT_DISTANCE = 1100; // unmount closer to off-screen
const CAMERA_VISIT_THRESHOLD = 500; // used by PieceVisibilityContext / markVisited
const INTERACTION_THRESHOLD = 900; // used for pointer-events gating
// Piece index (0-based) of pieces that must never be unmounted once loaded.
// WebGL pieces stay mounted to avoid context loss.
const STICKY_MOUNT_PIECES = new Set([4]); // Piece5

// ─── Piece wrapper ────────────────────────────────────────────────────────────
// everMountedRef: a plain Set ref shared from the parent — tracks which piece
// indices have ever been mounted so WebGL pieces stay alive once loaded.
function Piece({ z, cameraZ, pieceIndex, everMountedRef, children }) {
  const distance = z - cameraZ;
  const isPiece7 = pieceIndex === 6;

  let opacity = 1;
  if (distance < 1 && distance > -2) {
    if (distance <= 0) {
      opacity = Math.max(0, 1 - Math.abs(distance) / 2);
    }
  }
  if (distance < -2) {
    opacity = 0;
  }

  const effectiveUnmountDistance = isPiece7
    ? PIECE7_UNMOUNT_DISTANCE
    : UNMOUNT_DISTANCE;
  const effectiveMountLookahead = isPiece7
    ? PIECE7_MOUNT_LOOKAHEAD
    : MOUNT_LOOKAHEAD;
  const inRange =
    distance > -effectiveUnmountDistance && distance < effectiveMountLookahead;

  // A piece is "at camera" when it's close enough to be fully opaque
  // This is what gates useTrackPiece markVisited
  const isAtCamera =
    distance > -CAMERA_VISIT_THRESHOLD && distance < CAMERA_VISIT_THRESHOLD;

  // Interaction can remain active a bit longer than visit tracking
  // so hover/click doesn't drop the moment a piece is slightly past center.
  const isInteractive =
    distance > -INTERACTION_THRESHOLD && distance < INTERACTION_THRESHOLD;

  // Sticky-mounted pieces: once mounted, never unmounted.
  // All other pieces: normal mount/unmount based on distance.
  const isStickyMounted = STICKY_MOUNT_PIECES.has(pieceIndex);
  if (inRange) everMountedRef.current.add(pieceIndex);
  const shouldMount = isStickyMounted
    ? everMountedRef.current.has(pieceIndex)
    : inRange;

  // Sticky-mounted pieces that are far away: keep in DOM but hide with
  // visibility so they don't consume paint/fill unnecessarily.
  const isHidden =
    isStickyMounted && !inRange && everMountedRef.current.has(pieceIndex);

  return (
    <PieceVisibilityContext.Provider value={isAtCamera}>
      <PieceInteractionContext.Provider value={isInteractive}>
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
            pointerEvents: isInteractive ? "auto" : "none",
            // visibility:hidden removes from paint but keeps GL context alive
            visibility: isHidden ? "hidden" : "visible",
          }}
        >
          {shouldMount ? children : null}
        </div>
      </PieceInteractionContext.Provider>
    </PieceVisibilityContext.Provider>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ThreeScroll({ setGoToPiece, onCameraZChange }) {
  const [cameraZ, setCameraZ] = useState(-200);
  const scrollRef = useRef(-200);
  const rafRef = useRef(null);
  const everMountedRef = useRef(new Set()); // plain ref — never triggers renders

  const spacing = 1000;
  const numPieces = 22;
  const minZ = -(numPieces - 1) * spacing - 700;
  const maxZ = -200;
  const piece22Z = -200 - (numPieces - 1) * spacing;
  const isAtFurthestScrollPoint = cameraZ <= minZ + 0.5;

  // Expose goToPiece — identical to original
  useEffect(() => {
    if (!setGoToPiece) return;
    setGoToPiece((pieceIdx) => {
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

  // rAF-batched scroll — only change from original.
  // Raw delta accumulates in scrollRef; setCameraZ fires at most once per frame.
  // This prevents 10-20 queued React re-renders per fast scroll tick.
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const flushScroll = () => {
      setCameraZ(scrollRef.current);
      rafRef.current = null;
    };

    const onWheel = (e) => {
      e.preventDefault();
      scrollRef.current -= e.deltaY;
      scrollRef.current = Math.max(minZ, Math.min(maxZ, scrollRef.current));
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flushScroll);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "ArrowUp")
        scrollRef.current = Math.min(maxZ, scrollRef.current + 50);
      if (e.key === "ArrowDown")
        scrollRef.current = Math.max(minZ, scrollRef.current - 50);
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
  }, [minZ, maxZ]);

  useEffect(() => {
    onCameraZChange?.(cameraZ);
  }, [cameraZ, onCameraZChange]);

  return (
    <ScrollAtEndContext.Provider value={isAtFurthestScrollPoint}>
      <div className={styles.container}>
        <div className={styles.perspectiveWrap}>
          <div
            className={styles.preserve3dWrap}
            style={{ transform: `translateZ(${-cameraZ}px)` }}
          >
            <Piece
              z={-200}
              pieceIndex={0}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece1 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 1 * spacing}
              pieceIndex={1}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece2 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 2 * spacing}
              pieceIndex={2}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece3 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 3 * spacing}
              pieceIndex={3}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece4 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 4 * spacing}
              pieceIndex={4}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece5 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 5 * spacing}
              pieceIndex={5}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece6 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 6 * spacing}
              pieceIndex={6}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece7 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 7 * spacing}
              pieceIndex={7}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece8 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 8 * spacing}
              pieceIndex={8}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece9 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 9 * spacing}
              pieceIndex={9}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece10 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 10 * spacing}
              pieceIndex={10}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece11 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 11 * spacing}
              pieceIndex={11}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece12 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 12 * spacing}
              pieceIndex={12}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece13 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 13 * spacing}
              pieceIndex={13}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece14 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 14 * spacing}
              pieceIndex={14}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece15 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 15 * spacing}
              pieceIndex={15}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece16 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 16 * spacing}
              pieceIndex={16}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece17 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 17 * spacing}
              pieceIndex={17}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece18 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 18 * spacing}
              pieceIndex={18}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece19 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 19 * spacing}
              pieceIndex={19}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece20 />
              </Suspense>
            </Piece>
            <Piece
              z={-200 - 20 * spacing}
              pieceIndex={20}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece21 />
              </Suspense>
            </Piece>
            <Piece
              z={piece22Z}
              pieceIndex={21}
              everMountedRef={everMountedRef}
              cameraZ={cameraZ}
            >
              <Suspense fallback={<div />}>
                <Piece22 />
              </Suspense>
            </Piece>
          </div>
        </div>
      </div>
    </ScrollAtEndContext.Provider>
  );
}
