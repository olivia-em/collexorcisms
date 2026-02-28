import React from "react";
import styles from "./Piece3.module.css";

const Piece3 = () => {
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
      // Keep whitespace and line breaks
      if (/\s/.test(char)) {
        return char;
      }
      // Replace letters and punctuation with random emoji
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      return randomEmoji;
    });
  };

  const transformedPoem = replaceLettersWithEmojis(poem);

  const handleBirdClick = (filename) => {
    const link = document.createElement("a");
    link.href = `${import.meta.env.BASE_URL}assets/piece3/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            onClick={() =>
              bird.downloadFile && handleBirdClick(bird.downloadFile)
            }
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
