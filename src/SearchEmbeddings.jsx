import React, { useEffect, useState } from "react";

function cosineSimilarity(vecA, vecB) {
  return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}
function dotProduct(vecA, vecB) {
  return vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
}
function magnitude(vec) {
  return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

const Search = () => {
  const [poems, setPoems] = useState([]);
  const [embeddings, setEmbeddings] = useState([]);
  const [extractor, setExtractor] = useState(null);
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
        setStatus(`Loaded ${lines.length} poems. Loading embedding model...`);
      });
  }, []);

  // Load embedding model
  useEffect(() => {
    if (!poems.length) return;
    let isMounted = true;
    (async () => {
      let { pipeline } = await import(
        "https://cdn.jsdelivr.net/npm/@huggingface/transformers"
      );
      const ext = await pipeline(
        "feature-extraction",
        "mixedbread-ai/mxbai-embed-xsmall-v1"
      );
      if (isMounted) {
        setExtractor(() => ext);
        setStatus("Calculating embeddings...");
        // Calculate embeddings for all poems
        let emb = [];
        for (let text of poems) {
          let output = await ext(text, { pooling: "mean", normalize: true });
          emb.push(output.data);
        }
        setEmbeddings(emb);
        setStatus("Ready! Ask a question.");
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [poems]);

  // Handle search
  const handleSearch = async () => {
    if (!extractor || !embeddings.length || !input.trim()) return;
    setStatus("Processing question...");
    let output = await extractor(input, { pooling: "mean", normalize: true });
    let queryEmbedding = output.data;
    // Calculate similarity scores
    let scores = embeddings.map((emb) => cosineSimilarity(queryEmbedding, emb));
    // Find most similar piece
    let maxIdx = scores.indexOf(Math.max(...scores));
    console.log("Most similar piece:", maxIdx + 1, poems[maxIdx]);
    setStatus(`Most similar piece: ${maxIdx + 1}`);
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
      <h2 style={{ fontSize: "1rem", margin: "0 0 8px 0", color: "cyan" }}>
        Semantic Piece Search
      </h2>
      <p style={{ fontSize: "0.9rem", margin: "0 0 8px 0" }}>{status}</p>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question..."
        style={{
          width: 220,
          marginRight: 8,
          fontSize: "1rem",
          background: "#222",
          color: "cyan",
          border: "1px solid cyan",
          borderRadius: 6,
          padding: "4px 8px",
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
