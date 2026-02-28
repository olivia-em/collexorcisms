import { useEffect, useContext } from "react";
import { useGame } from "./GameContext";
import { PieceVisibilityContext } from "./CSSScroll";

/**
 * useTrackPiece
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop into any piece component. Marks the piece as visited on mount and
 * returns helpers for signalling interaction and completion.
 *
 * @param {string} slug - must match the slug in PIECE_SLUGS (e.g. "justBones")
 *
 * Usage:
 *   const { markInteracted, markCompleted, isCompleted, isVisited } = useTrackPiece("justBones");
 *
 * For visit-only pieces (justBones, parasite):
 *   useTrackPiece("parasite"); // just call it, no need to destructure
 *
 * For any-interact pieces:
 *   const { markInteracted } = useTrackPiece("silhouettes");
 *   // call markInteracted() on first meaningful click
 *
 * For specific completion pieces, use the specialized GameContext helpers instead:
 *   - 129:              trackPage129(pageId)
 *   - lack_of_flight:   trackLofFile(filename)
 *   - my_familiar:      trackMfFile(filename)
 *   - untitled:         incrementPiece7()
 *   - objects_in_eleven: markCompleted("objects_in_eleven") when currentVersion >= 10
 *   - shedding_light:   trackShedLightRotation(deltaRadians) each frame
 */
export default function useTrackPiece(slug) {
  const {
    markVisited,
    markInteracted: _markInteracted,
    markCompleted: _markCompleted,
    state,
  } = useGame();

  // Only true when this piece is within 500px of camera (fully/nearly visible)
  const isAtCamera = useContext(PieceVisibilityContext);

  // Mark visited only when piece is actually at the camera
  useEffect(() => {
    if (isAtCamera) {
      markVisited(slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAtCamera, slug]);

  const markInteracted = () => _markInteracted(slug);
  const markCompleted = () => _markCompleted(slug);
  const isCompleted = !!state.completedPieces[slug];
  const isVisited = !!state.visitedPieces[slug];

  return { markInteracted, markCompleted, isCompleted, isVisited };
}
