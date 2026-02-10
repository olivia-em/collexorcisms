import React, { useEffect, useState } from "react";

const Search = () => {
  const [poems, setPoems] = useState([]);
  const [status, setStatus] = useState("Loading poems...");
  const [input, setInput] = useState("");

  // Load poems
  useEffect(() => {
    fetch("/assets/poems.txt")
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
          .join(", ")}`
      );
    } else {
      console.log("No answer found.");
      setStatus("No answer found.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        color: "cyan",
        padding: "18px 20px",
        borderRadius: "12px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
        minWidth: 340,
        maxWidth: 400,
        fontFamily: "monospace",
      }}
    >
      <p style={{ fontSize: "0.9rem", margin: "0 0 8px 0" }}>{status}</p>
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
      />
      <button
        onClick={handleSearch}
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
  );
};

export default Search;
