import React, { useEffect, useState } from "react";
import { useCamera } from "./CameraContext";

const Search = () => {
  const [poems, setPoems] = useState([]);
  const [status, setStatus] = useState("Loading poems...");
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isHover, setIsHover] = useState(false);

  // Load poems
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}assets/poems.txt`)
      .then((res) => res.text())
      .then((text) => {
        const lines = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        setPoems(lines);
        setStatus(`Loaded ${lines.length} poems.`);
      });
  }, []);

  useEffect(() => {
    if (poems.length) setStatus("you can search for answers");
  }, [poems]);

  const { goToPiece } = useCamera();
  // Handle keyword search
  const handleSearch = () => {
    if (!input.trim()) return;
    setStatus("Searching...");
    const keyword = input.trim().toLowerCase();
    const matches = poems
      .map((line, idx) => ({ idx, line }))
      .filter(({ line }) => line.toLowerCase().includes(keyword));
    if (matches.length > 0) {
      matches.forEach(({ idx, line }) => {
        console.log(`Match: Piece ${idx + 1}:`, line);
      });
      setStatus(
        `Found in piece${matches.length > 1 ? "s" : ""}: ${matches
          .map((m) => m.idx + 1)
          .join(", ")}`,
      );
      // Move to the first matching piece in z space
      if (goToPiece && typeof goToPiece === "function") {
        goToPiece(matches[0].idx + 1); // idx is 0-based, piece is 1-based
      }
    } else {
      console.log("No answer found.");
      setStatus("No answer found.");
    }
  };

  return (
    <div>
      {/* Sliding Search Bar, clickable to toggle, always sticks out a bit */}
      <div
        onClick={() => setIsOpen((open) => !open)}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        style={{
          position: "fixed",
          right: -60,
          bottom: 24,
          zIndex: 9999,
          background: "rgba(0,0,0,0.85)",
          color: "cyan",
          padding: "18px 20px",
          borderRadius: "12px",
          boxShadow: isHover
            ? "0 2px 24px 4px cyan, 0 2px 16px rgba(0,0,0,0.3)"
            : "0 2px 16px rgba(0,0,0,0.3)",
          minWidth: 340,
          maxWidth: 400,
          fontFamily: "monospace",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          cursor: "pointer",
          transform: isOpen ? "translateX(-20%)" : "translateX(80%)",
          transition:
            "transform 0.4s cubic-bezier(.7,0,.3,1), box-shadow 0.2s cubic-bezier(.7,0,.3,1)",
          pointerEvents: "auto",
        }}
        title={isOpen ? "Click to hide search" : "Click to show search"}
      >
        <p style={{ fontSize: "0.9rem", margin: "0 0 8px 0" }}>{status}</p>
        <div
          style={{ display: "flex", alignItems: "center" }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="but you may not find them"
            style={{
              width: 220,
              marginRight: 8,
              fontSize: "0.8rem",
              background: "#222",
              color: "cyan",
              border: "1px solid cyan",
              borderRadius: 6,
              padding: "4px 8px",
              letterSpacing: "0.15em",
              lineHeight: 1,
              verticalAlign: "middle",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSearch();
            }}
            style={{
              fontSize: "1rem",
              background: "cyan",
              color: "#222",
              border: "none",
              borderRadius: 6,
              padding: "4px 12px",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default Search;
