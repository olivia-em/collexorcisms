import React, { useEffect, useRef, useState } from "react";
import p5 from "p5";
import styles from "./Piece4.module.css";

const GROUPS = [
  { min: 10, max: 99 },
  { min: 100, max: 199 },
  { min: 200, max: 299 },
  { min: 300, max: 399 },
  { min: 400, max: 499 },
  { min: 500, max: 599 },
  { min: 600, max: 699 },
  { min: 700, max: 799 },
  { min: 800, max: 899 },
  { min: 900, max: 999 },
];

function tokenize(text) {
  return text.split(/\W+/).filter((w) => w.length >= 3 && !/\d+/.test(w));
}

function groupWords(tokens) {
  const counts = {};
  tokens.forEach((word) => {
    const w = word.toLowerCase();
    counts[w] = (counts[w] || 0) + 1;
  });
  const keys = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const groups = GROUPS.map((g) => []);
  keys.forEach((word) => {
    const count = counts[word];
    for (let i = 0; i < GROUPS.length; i++) {
      if (count >= GROUPS[i].min && count < GROUPS[i].max) {
        groups[i].push({ word, count });
        break;
      }
    }
  });
  return groups;
}

const Piece4P5 = () => {
  const [groups, setGroups] = useState([]);
  const canvasRef = useRef();

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}assets/iliad.txt`)
      .then((res) => res.text())
      .then((text) => {
        const tokens = tokenize(text);
        const grouped = groupWords(tokens);
        setGroups(grouped);
      });
  }, []);

  useEffect(() => {
    if (!groups.length) return;
    let p5Instance;
    const sketch = (p) => {
      let w = 800;
      let h = 400;
      p.setup = () => {
        // Get dimensions from piece4Container
        const parent = canvasRef.current?.parentElement;
        if (parent) {
          w = parent.offsetWidth;
          h = parent.offsetHeight;
        }
        let wordFontSize = h * 0.025; // ~0.8vh
        let firstGridFontSize = h * 0.02; // ~0.58vh
        p.createCanvas(w, h).parent(canvasRef.current);
        p.textAlign(p.CENTER, p.CENTER);
        p.noStroke();
        p.draw = () => {
          p.background(0);
          // Draw static layer (first group)
          if (groups[0]) {
            p.fill(255, 0, 0);
            p.textSize(firstGridFontSize);
            p.textFont("Courier New");
            // Grid layout
            const padding = 0;
            const cellWidth = 15; // px, adjust as needed
            const cellHeight = 10; // px, adjust as needed
            const cols = Math.max(1, Math.floor((w - padding * 2) / cellWidth));
            const rows = Math.ceil(groups[0].length / cols);
            for (let idx = 0; idx < groups[0].length; idx++) {
              const col = idx % cols;
              const row = Math.floor(idx / cols);
              const x = padding + col * cellWidth + cellWidth / 2;
              const y = padding + row * cellHeight + cellHeight / 2;
              // Text shadow effect
              p.push();
              p.fill(0, 0, 0, 80);
              p.text(groups[0][idx].word, x + 0.5, y + 0.5);
              p.pop();
              p.fill(255, 0, 0);
              p.text(groups[0][idx].word, x, y);
            }
          }
          // Draw animated layers
          for (let g = 1; g < groups.length; g++) {
            p.push();
            p.fill(0, 255, 255, 180);
            p.textSize(wordFontSize);
            p.textFont("Courier New");
            const speed = (g + 2) / 10;
            const amplitudeY = h / 4;
            const amplitudeX = w / 2;
            // Animate group together on y
            const groupYOffset =
              Math.sin(p.millis() * 0.001 * speed) * amplitudeY;
            for (let i = 0; i < groups[g].length; i++) {
              // Animate word individually on x
              const x =
                w / 2 + Math.sin(p.millis() * 0.001 * speed + i) * amplitudeX;
              const y = h / 2 + (i - groups[g].length / 2) * 18 + groupYOffset;
              p.push();
              p.fill(0, 255, 255, 80);
              p.text(groups[g][i].word, x + 2, y + 2);
              p.pop();
              p.fill(0, 255, 255, 180);
              p.text(groups[g][i].word, x, y);
            }
            p.pop();
          }
        };
      };
    };
    p5Instance = new p5(sketch);
    return () => {
      if (p5Instance) p5Instance.remove();
    };
  }, [groups]);

  return (
    <div className={styles.piece4Container}>
      <div ref={canvasRef} />
    </div>
  );
};

export default Piece4P5;
