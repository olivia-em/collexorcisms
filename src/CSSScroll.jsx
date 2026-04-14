import React, {
  useRef,
  useEffect,
  useState,
  Suspense,
  lazy,
  createContext,
} from "react";
import styles from "./CSSScroll.module.css";
import { PIECE_TITLES, useGame } from "./GameContext";
import { useAmbientAudio } from "./AmbientAudioContext";

// ─── Visibility context ───────────────────────────────────────────────────────
export const PieceVisibilityContext = createContext(false);
export const PieceInteractionContext = createContext(false);
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
const MOUNT_LOOKAHEAD = 3000;
const UNMOUNT_DISTANCE = 2500;
const PIECE7_MOUNT_LOOKAHEAD = 1300;
const PIECE7_UNMOUNT_DISTANCE = 1100;
const CAMERA_VISIT_THRESHOLD = 500;
const INTERACTION_THRESHOLD = 900;
const STICKY_MOUNT_PIECES = new Set([4]); // Piece5

// ─── Flicker hook ─────────────────────────────────────────────────────────────
// When `shouldDisappear` becomes true, runs a flicker sequence then sets
// `hidden` to true (display: none equivalent via opacity 0 + pointerEvents none).
// Returns { flickering, hidden }.
function useFlickerDisappear(shouldDisappear) {
  const [flickering, setFlickering] = useState(false);
  const [replaced, setReplaced] = useState(false);

  useEffect(() => {
    if (!shouldDisappear || replaced) return;
    setFlickering(true);

    // Finite timer keeps behavior deterministic in React StrictMode.
    const hideTimer = setTimeout(() => {
      setFlickering(false);
      setReplaced(true);
    }, 1150);

    return () => clearTimeout(hideTimer);
  }, [shouldDisappear, replaced]);

  return { flickering, replaced };
}

function FolderPlaceholder({ title }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        pointerEvents: "none",
        userSelect: "none",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 40 32"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "72px", height: "58px", display: "block" }}
      >
        <path
          d="M2 8 C2 8 6 4 10 4 L16 4 C18 4 19 5.5 20 7 L38 7 C39.1 7 40 7.9 40 9 L40 28 C40 29.1 39.1 30 38 30 L2 30 C0.9 30 0 29.1 0 28 L0 10 C0 8.9 0.9 8 2 8Z"
          fill="#b52c2c"
          stroke="#ff4b4b"
          strokeWidth="1.5"
        />
      </svg>
      <span
        style={{
          fontFamily: "'Jacquard12', serif",
          fontSize: "1.1rem",
          color: "#e05555",
          letterSpacing: "1px",
          textDecoration: "line-through",
          textDecorationColor: "#e0555599",
          textDecorationThickness: "1px",
        }}
      >
        {title}
      </span>
    </div>
  );
}

// ─── Piece wrapper ────────────────────────────────────────────────────────────
function Piece({
  z,
  cameraZ,
  pieceIndex,
  everMountedRef,
  children,
  slug,
  isCompleted,
  justBonesReadyToDisappear,
}) {
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

  const isAtCamera =
    distance > -CAMERA_VISIT_THRESHOLD && distance < CAMERA_VISIT_THRESHOLD;
  const isInteractive =
    distance > -INTERACTION_THRESHOLD && distance < INTERACTION_THRESHOLD;

  const isStickyMounted = STICKY_MOUNT_PIECES.has(pieceIndex);
  if (inRange) everMountedRef.current.add(pieceIndex);
  const shouldMount = isStickyMounted
    ? everMountedRef.current.has(pieceIndex)
    : inRange;

  const isHidden =
    isStickyMounted && !inRange && everMountedRef.current.has(pieceIndex);

  // ── Disappear logic ───────────────────────────────────────────────────────
  // justBones (pieceIndex 0): disappears only after justBonesReadyToDisappear.
  // All other completed pieces: disappear when isCompleted is true.
  const isJustBones = pieceIndex === 0;
  const shouldDisappear = isJustBones ? justBonesReadyToDisappear : isCompleted;

  const { flickering, replaced } = useFlickerDisappear(shouldDisappear);

  const finalOpacity = opacity;

  return (
    <PieceVisibilityContext.Provider value={isAtCamera}>
      <PieceInteractionContext.Provider value={isInteractive}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "calc(var(--app-vw, 100vw) * 0.5)",
            height: "calc(var(--app-vh, 100vh) * 0.5)",
            transform: `translate(-50%, -50%) translateZ(${z}px)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            color: "rgba(255, 255, 255, 0.95)",
            borderRadius: "0px",
            opacity: finalOpacity,
            transition: flickering ? "none" : "opacity 0.1s",
            pointerEvents:
              replaced || isHidden ? "none" : isInteractive ? "auto" : "none",
            visibility: isHidden ? "hidden" : "visible",
            animation: flickering
              ? "pieceFlicker 1.15s steps(1, end) 1"
              : "none",
          }}
        >
          {shouldMount ? (
            replaced ? (
              <FolderPlaceholder title={PIECE_TITLES[slug] ?? slug} />
            ) : (
              children
            )
          ) : null}
        </div>
      </PieceInteractionContext.Provider>
    </PieceVisibilityContext.Provider>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ThreeScroll({
  setGoToPiece,
  onCameraZChange,
  invertScroll = false,
}) {
  const [cameraZ, setCameraZ] = useState(-200);
  const scrollRef = useRef(-200);
  const rafRef = useRef(null);
  const everMountedRef = useRef(new Set());
  const game = useGame();
  const { setPieceDistance } = useAmbientAudio();

  const spacing = 1000;
  const numPieces = 22;
  const minZ = -(numPieces - 1) * spacing - 700;
  const maxZ = -200;
  const piece22Z = -200 - (numPieces - 1) * spacing;
  const isAtFurthestScrollPoint = cameraZ <= minZ + 0.5;

  // Read completion state from game
  const { state } = game;
  const justBonesReadyToDisappear = state.justBonesClosedAfterOpen;

  // Expose goToPiece
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

  // rAF-batched scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const flushScroll = () => {
      setCameraZ(scrollRef.current);
      rafRef.current = null;
    };

    const onWheel = (e) => {
      e.preventDefault();
      const wheelDelta = invertScroll ? -e.deltaY : e.deltaY;
      scrollRef.current -= wheelDelta;
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
  }, [invertScroll, minZ, maxZ]);

  useEffect(() => {
    onCameraZChange?.(cameraZ);
  }, [cameraZ, onCameraZChange]);

  // Helper: piece is complete for disappearance only when title-complete
  // (includes shared-obit requirements + piece-specific full completion).
  const isCompleted = (slug) => game.isTitleComplete(slug);

  // Build piece entries: [slug, z, pieceIndex, Component]
  const PIECES = [
    { slug: "justBones", z: -200, Component: Piece1 },
    { slug: "129", z: -200 - 1 * spacing, Component: Piece2 },
    { slug: "lack_of_flight", z: -200 - 2 * spacing, Component: Piece3 },
    { slug: "my_familiar", z: -200 - 3 * spacing, Component: Piece4 },
    { slug: "cass_ra", z: -200 - 4 * spacing, Component: Piece5 },
    { slug: "cursedVisions", z: -200 - 5 * spacing, Component: Piece6 },
    { slug: "untitled", z: -200 - 6 * spacing, Component: Piece7 },
    { slug: "objects_in_eleven", z: -200 - 7 * spacing, Component: Piece8 },
    { slug: "silhouettes", z: -200 - 8 * spacing, Component: Piece9 },
    { slug: "confessions", z: -200 - 9 * spacing, Component: Piece10 },
    { slug: "secrets", z: -200 - 10 * spacing, Component: Piece11 },
    { slug: "parasite", z: -200 - 11 * spacing, Component: Piece12 },
    { slug: "the_empathy_machine", z: -200 - 12 * spacing, Component: Piece13 },
    { slug: "s_curves", z: -200 - 13 * spacing, Component: Piece14 },
    { slug: "31", z: -200 - 14 * spacing, Component: Piece15 },
    { slug: "shedding_light", z: -200 - 15 * spacing, Component: Piece16 },
    { slug: "n23", z: -200 - 16 * spacing, Component: Piece17 },
    { slug: "i_am_malicious", z: -200 - 17 * spacing, Component: Piece18 },
    { slug: "first_on_first", z: -200 - 18 * spacing, Component: Piece19 },
    { slug: "teethmarks", z: -200 - 19 * spacing, Component: Piece20 },
    { slug: "fetish", z: -200 - 20 * spacing, Component: Piece21 },
    { slug: "parthenogenesis", z: piece22Z, Component: Piece22 },
  ];

  useEffect(() => {
    const audioKeyBySlug = {
      cursedVisions: "piece6",
      untitled: "piece7",
      objects_in_eleven: "piece8",
      silhouettes: "piece9",
      confessions: "piece10",
      parthenogenesis: "piece22",
    };

    for (const piece of PIECES) {
      const audioKey = audioKeyBySlug[piece.slug];
      if (!audioKey) continue;
      setPieceDistance(audioKey, Math.abs(piece.z - cameraZ));
    }
  }, [PIECES, cameraZ, setPieceDistance]);

  return (
    <ScrollAtEndContext.Provider value={isAtFurthestScrollPoint}>
      <div className={styles.container}>
        <div className={styles.perspectiveWrap}>
          <div
            className={styles.preserve3dWrap}
            style={{ transform: `translateZ(${-cameraZ}px)` }}
          >
            {PIECES.map(({ slug, z, Component }, pieceIndex) => (
              <Piece
                key={slug}
                z={z}
                pieceIndex={pieceIndex}
                everMountedRef={everMountedRef}
                cameraZ={cameraZ}
                slug={slug}
                isCompleted={isCompleted(slug)}
                justBonesReadyToDisappear={justBonesReadyToDisappear}
              >
                <Suspense fallback={<div />}>
                  <Component />
                </Suspense>
              </Piece>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pieceFlicker {
          0%   { opacity: 1; }
          25%  { opacity: 0; }
          50%  { opacity: 0.8; }
          75%  { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </ScrollAtEndContext.Provider>
  );
}
