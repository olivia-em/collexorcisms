import React from "react";
import styles from "./Piece3.module.css";
import useTrackPiece from "../../../useTrackPiece";
import { useGame } from "../../../GameContext";

const Piece3 = () => {
  useTrackPiece("lack_of_flight");
  const { trackLofFile } = useGame();

  const poem = `lack of flight   

I sit atop the stairs
white carpeted and stained
a place to wait for choices
a subtle space for pain

from here, 	
            I see the foyer
the front and bedroom doors
could go both ways, they say
(make-believe to play past four)

from here, 
              and looking down
I'd hit my head right at the base
I remember needing stitches
and the lies, 	your hidden face

from here, 
                I hear the stones
with two birds dead, I wonder why
they ring against 	      the door
and they echo   in my mind

ten years pass, and I'm still here
they say with everything I need
but I stay, can't move an inch
white carpet stains, 
                and still I bleed`;

  const emojis = [
    "𓅪",
    "𓅫",
    "𓅓",
    "✮",
    "⋆",
    "˚",
    "｡",
    "𓅨",
    "°",
    "✩",
    "☁︎",
    "☾",
    "⁺",
    "₊",
    "✧",
  ];

  const replaceLettersWithEmojis = (text) => {
    return text.split("").map((char) => {
      if (/\s/.test(char)) return char;
      return emojis[Math.floor(Math.random() * emojis.length)];
    });
  };

  const transformedPoem = replaceLettersWithEmojis(poem);

  const handleBirdClick = (filename) => {
    if (!filename) return;
    trackLofFile(filename); // track which files have been opened
    const url = `${import.meta.env.BASE_URL}assets/piece3/${filename}`;
    if (filename.toLowerCase().endsWith(".txt") && window.__COLLEX_OPEN_TXT__) {
      if (window.__COLLEX_OPEN_TXT__(url)) return;
    }
    window.open(url, "_blank");
  };

  const birds = [
    { emoji: "𓅨", downloadFile: "LOF.JPG" },
    { emoji: "𓅩", downloadFile: "LOF.txt" },
    { emoji: "𓅓", downloadFile: null },
  ];

  return (
    <div className={styles.piece3Container}>
      <div className={styles.birdsContainer}>
        {birds.map((bird, index) => (
          <div
            key={index}
            className={styles.bird}
            onClick={() => handleBirdClick(bird.downloadFile)}
          >
            {bird.emoji}
          </div>
        ))}
      </div>
      <pre className={styles.poemText}>{transformedPoem}</pre>
    </div>
  );
};

export default Piece3;
