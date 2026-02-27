// A2Z F25
// Daniel Shiffman
// https://github.com/Programming-from-A-to-Z/A2Z-F25

// This is based on Allison Parrish's great RWET examples
// https://github.com/aparrish/rwet-examples

import React, { useState, useEffect } from "react";
import styles from "./Piece7.module.css";
import MarkovGeneratorWord from "./markov.js";

const Piece7 = () => {
  const [generatedLines, setGeneratedLines] = useState([]);
  const [markov, setMarkov] = useState(null);

  useEffect(() => {
    // Initialize Markov generator
    const generator = new MarkovGeneratorWord(1, 10);

    // Load the text file
    fetch("/assets/exorcisms.txt")
      .then((response) => response.text())
      .then((text) => {
        // Split by line and feed each line
        const lines = text.split("\n");
        lines.forEach((line) => {
          if (line.trim()) {
            generator.feed(line);
          }
        });
        setMarkov(generator);
      })
      .catch((error) => console.error("Error loading text:", error));
  }, []);

  const handleGenerate = () => {
    if (!markov) return;

    // Generate 6 lines
    const newLines = [];
    for (let i = 0; i < 6; i++) {
      newLines.push(markov.generate());
    }
    setGeneratedLines(newLines);
  };

  return (
    <div className={styles.piece7Container}>
      {generatedLines.length > 0 && (
        <div className={styles.poemText}>
          {generatedLines.map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < generatedLines.length - 1 && <br />}
              {index === 2 && <br />}
            </React.Fragment>
          ))}
        </div>
      )}
      <button className={styles.generateButton} onClick={handleGenerate}>
        untitled
      </button>
    </div>
  );
};

export default Piece7;
