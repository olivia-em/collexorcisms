import React, { useEffect, useRef, useState } from "react";
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

const Piece4 = () => {
  const [groups, setGroups] = useState([]);
  const animRef = useRef();
  const containerRefs = useRef([]); // for animated containers
  const wordRefs = useRef([]); // for animated words
  const piece4ContainerRef = useRef();

  useEffect(() => {
    fetch("/assets/iliad.txt")
      .then((res) => res.text())
      .then((text) => {
        console.log("Loaded text:", text.slice(0, 200)); // Show first 200 chars
        const tokens = tokenize(text);
        console.log("Tokens:", tokens.slice(0, 20)); // Show first 20 tokens
        const grouped = groupWords(tokens);
        console.log("Groups:", grouped);
        setGroups(grouped);
      });
  }, []);

  useEffect(() => {
    function animate() {
      const now = performance.now();
      // Animate all containers except the first (groups[1] and up)
      const piece4Container = piece4ContainerRef.current;
      const containerWidth = piece4Container
        ? piece4Container.offsetWidth
        : window.innerWidth;
      const containerHeight = piece4Container
        ? piece4Container.offsetHeight
        : window.innerHeight;
      console.log(
        `Animation bounds: width=${containerWidth} (${
          piece4Container ? "piece4Container" : "window"
        }), height=${containerHeight} (${
          piece4Container ? "piece4Container" : "window"
        })`
      );
      containerRefs.current.forEach((containerEl, i) => {
        if (!containerEl) return;
        const zIndex = i + 2; // matches zIndex in render
        const speed = zIndex / 8;
        // Amplitude: max bounce without leaving parent
        const amplitude = Math.max(
          (containerHeight - containerEl.offsetHeight) / 2,
          0
        );
        // Bounce from center
        const yOffset = Math.sin(now * speed * 0.001) * amplitude;
        containerEl.style.transform = `translateY(${yOffset}px)`;
        // Animate words inside container horizontally
        const words = wordRefs.current[i] || [];
        const xBounceAmount = containerWidth / 8;
        words.forEach((wordEl, j) => {
          if (!wordEl) return;
          const xOffset =
            (Math.sin(now * speed * 0.001 + j * 0.5) * xBounceAmount) / 2 +
            xBounceAmount / 2;
          wordEl.style.transform = `translateX(${xOffset}px)`;
        });
      });
      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [groups]);

  return (
    <div className={styles.piece4Container} ref={piece4ContainerRef}>
      {/* First group (10–99): static words */}
      {groups[0] && (
        <div className={styles.gridContainer} style={{ zIndex: 1 }}>
          {groups[0].map((item) => (
            <span
              key={item.word}
              className={`${styles.word} ${styles.firstGridWord}`}
            >
              {item.word}
            </span>
          ))}
        </div>
      )}
      {/* Animated containers wrapped in a div matching the first grid container */}
      <div className={styles.animatedWrapper}>
        {groups.slice(1).map((group, i) => (
          <div
            key={i}
            className={styles.gridContainer}
            ref={(el) => (containerRefs.current[i + 1] = el)}
            style={{ zIndex: i + 2 }}
          >
            {group.map((item, j) => (
              <span
                key={item.word}
                className={styles.word}
                ref={(el) => {
                  if (!wordRefs.current[i + 1]) wordRefs.current[i + 1] = [];
                  wordRefs.current[i + 1][j] = el;
                }}
              >
                {item.word}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Piece4;
