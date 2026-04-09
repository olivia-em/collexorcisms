import React, { useMemo, useState } from "react";
import { PIECE_SLUGS, PIECE_TITLES, useGame } from "../../GameContext";
import useDraggableWindow from "./useDraggableWindow";

const SPACING = 1000;
const MAP_LINE_HEIGHT = 1.15;
const MAP_SWITCH_OFFSET = 0.2;

function buildMapLines({ slugs, game, cameraZ, spacing, markerLabel }) {
  const boxWidth = 22;
  const lines = [];

  const rawPos = (-200 - cameraZ) / spacing;
  const clampedPos = Math.max(0, Math.min(slugs.length - 1, rawPos));
  // Keep the marker on the current row longer; midpoint switching felt early
  // relative to what is still visually dominant in the viewport.
  const dotRow = Math.floor(clampedPos + MAP_SWITCH_OFFSET);

  lines.push("");

  slugs.forEach((slug, i) => {
    const visited = game.state.visitedPieces[slug];
    const pct = game.getPieceProgress(slug);
    const title = visited ? PIECE_TITLES[slug] : "";
    const pctStr = `${pct}%`;

    const pctField = pctStr.padStart(4);
    const titleAvail = boxWidth - pctField.length - 1;
    const titleStr =
      title.length > titleAvail
        ? `${title.slice(0, titleAvail - 1)}…`
        : title.padEnd(titleAvail);
    const inner = `${titleStr} ${pctField}`;

    if (i === 0) {
      lines.push(`┌${"─".repeat(boxWidth + 2)}┐  │`);
    }

    const railChar = i === dotRow ? "●" : "│";
    const labelSuffix = i === dotRow ? ` ← ${markerLabel}` : "";
    lines.push(`│ ${inner} │  ${railChar}${labelSuffix}`);

    if (i < slugs.length - 1) {
      lines.push(`├${"─".repeat(boxWidth + 2)}┤  │`);
    } else {
      lines.push(`└${"─".repeat(boxWidth + 2)}┘  │`);
    }
  });

  lines.push("");
  return lines;
}

function buildFileTreeLines(slugs) {
  const lines = ["", "Olivia", "└── collected exorcisms"];
  slugs.forEach((slug, index) => {
    const branch = index === slugs.length - 1 ? "    └── " : "    ├── ";
    lines.push(`${branch}${PIECE_TITLES[slug] ?? slug}`);
  });
  lines.push("");
  return lines;
}

export default function MapWindow({
  onboardingDone = false,
  cameraZ = -200,
  isOpen: controlledIsOpen,
  onOpenChange,
  hideLauncher = false,
  zIndex = 9998,
  onFocusRequest,
}) {
  const game = useGame();
  const [internalOpen, setInternalOpen] = useState(false);
  const { position, startDragging } = useDraggableWindow({ x: 24, y: 24 });
  const markerLabel = game.state.mapRequestCount >= 5 ? "Olivia" : "you";
  const allPiecesAt100 = PIECE_SLUGS.every(
    (slug) => game.getPieceProgress(slug) >= 100,
  );

  const isControlled = typeof controlledIsOpen === "boolean";
  const isOpen = isControlled ? controlledIsOpen : internalOpen;

  const setOpen = (nextOpen) => {
    if (!isControlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const handleOpen = () => {
    if (!isOpen) game.incrementMapCount();
    onFocusRequest?.();
    setOpen(true);
  };

  const mapLines = useMemo(() => {
    if (allPiecesAt100) {
      return buildFileTreeLines(PIECE_SLUGS);
    }

    return buildMapLines({
      slugs: PIECE_SLUGS,
      game,
      cameraZ,
      spacing: SPACING,
      markerLabel,
    });
  }, [allPiecesAt100, cameraZ, game, game.state, markerLabel]);

  const maxChars = useMemo(
    () => mapLines.reduce((max, line) => Math.max(max, line.length), 1),
    [mapLines],
  );

  const containWheel = (event) => {
    event.stopPropagation();
  };

  if (!onboardingDone) return null;

  return (
    <>
      {!hideLauncher && !isOpen && (
        <button
          onClick={handleOpen}
          style={{
            position: "fixed",
            bottom: 24,
            right: 76,
            zIndex: 9999,
            background: "#000",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 3,
            fontFamily: "'Jacquard12', serif",
            fontSize: "1rem",
            padding: "5px 16px",
            cursor: "pointer",
            letterSpacing: "0.06em",
            boxShadow: "0 0 8px rgba(255,255,255,0.05)",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)";
            e.currentTarget.style.boxShadow = "0 0 14px rgba(255,255,255,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
            e.currentTarget.style.boxShadow = "0 0 8px rgba(255,255,255,0.05)";
          }}
        >
          map
        </button>
      )}

      {isOpen && (
        <div
          onMouseDown={() => onFocusRequest?.()}
          onWheelCapture={containWheel}
          style={{
            position: "fixed",
            left: position.x,
            top: position.y,
            width: `min(90vw, calc(${maxChars}ch + 56px))`,
            height: `min(90vh, calc(${mapLines.length} * ${MAP_LINE_HEIGHT}em + 62px))`,
            background: "#000",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 12px 48px rgba(0,0,0,0.9)",
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: "11px",
            fontWeight: 800,
            lineHeight: MAP_LINE_HEIGHT,
            overflow: "hidden",
            zIndex,
          }}
        >
          <div
            onMouseDown={(event) => {
              onFocusRequest?.();
              startDragging(event);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              flexShrink: 0,
              cursor: "move",
              userSelect: "none",
            }}
          >
            <span
              style={{
                fontFamily: "'Jacquard12', serif",
                fontSize: "0.95rem",
                color: "#fff",
                letterSpacing: "0.05em",
              }}
            >
              {allPiecesAt100 ? "tree" : "map"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.35)",
                cursor: "pointer",
                fontSize: "1.1rem",
                lineHeight: 1,
                padding: "1px 4px",
                fontFamily: "monospace",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
              }
            >
              ×
            </button>
          </div>

          <div
            onWheelCapture={containWheel}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px 20px 10px",
              color: "#c8c8c8",
            }}
          >
            {mapLines.map((line, idx) => (
              <div
                key={`${idx}-${line}`}
                style={{
                  minHeight: `${MAP_LINE_HEIGHT}em`,
                  whiteSpace: "pre",
                  marginBottom: 0,
                }}
              >
                {line || "\u00A0"}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
