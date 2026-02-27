import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import styles from "./Piece18.module.css";

const Piece18 = () => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [visibleMonsters, setVisibleMonsters] = useState([0, 1]);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const quotesRef = useRef(null);

  const tooltips = {
    section1: (
      <>
        doctor doctor
        <br />
        fix me please
        <br />
        craft your misery
        <br />
        in the image of me
      </>
    ),
    section2: (
      <>
        a year and change
        <br />
        a knockoff noose
        <br />
        i feel nothing at all
        <br />
        but i like to bruise
      </>
    ),
    section3: (
      <>
        a year and change
        <br />
        and i am, i am she
        <br />
        i am the creature
        <br />
        you'd made of me
      </>
    ),
  };

  const handleMouseEnter = (e, section) => {
    setTooltipPosition({
      x: e.clientX,
      y: e.clientY,
    });
    setActiveTooltip(section);
  };

  const handleMouseMove = (e) => {
    if (activeTooltip) {
      setTooltipPosition({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  useEffect(() => {
    // Fill container with text
    const fillViewportWithText = () => {
      const p = quotesRef.current;
      if (!p) return;
      const container = p.closest(`.${styles.piece18Container}`);
      if (!container) return;

      const fontSize = parseFloat(window.getComputedStyle(p).fontSize);
      const containerHeight = container.clientHeight;

      // Reset to a known line-height to measure natural text height
      p.style.lineHeight = "1";
      const textHeight = p.scrollHeight;
      const numLines = Math.round(textHeight / fontSize);

      // Calculate new line-height to fill container
      const newLineHeight = containerHeight / numLines / fontSize;
      p.style.lineHeight = newLineHeight.toString();
    };

    // Small delay to ensure container is sized
    const timer = setTimeout(fillViewportWithText, 100);
    window.addEventListener("resize", fillViewportWithText);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", fillViewportWithText);
    };
  }, []);

  useEffect(() => {
    // Cycle through random monster images
    const showTwoRandomMonsters = () => {
      let idx1 = Math.floor(Math.random() * 19);
      let idx2;
      do {
        idx2 = Math.floor(Math.random() * 19);
      } while (idx2 === idx1);
      setVisibleMonsters([idx1, idx2]);
    };

    const interval = setInterval(showTwoRandomMonsters, 2000);
    return () => clearInterval(interval);
  }, []);

  const monsterImages = [
    "monster1.JPG",
    "monster2.jpg",
    "monster3.JPG",
    "monster4.JPG",
    "monster5.JPG",
    "monster6.JPG",
    "monster7.jpg",
    "monster8.jpg",
    "monster9.jpg",
    "monster10.jpg",
    "monster11.jpg",
    "monster12.PNG",
    "monster13.PNG",
    "monster14.jpg",
    "monster15.png",
    "monster16.jpg",
    "monster17.JPG",
    "monster18.JPG",
    "monster19.JPG",
  ];

  return (
    <div className={styles.piece18Container}>
      {showOverlay && (
        <div
          className={styles.preloadOverlay}
          onClick={() => setShowOverlay(false)}
        >
          <span className={styles.preloadText}>
            I am malicious because I am miserable
            <span className={styles.blinkingCursor}>...</span>
          </span>
        </div>
      )}

      {/* Monster background divs */}
      {monsterImages.map((img, idx) => (
        <div
          key={idx}
          className={styles.monsterDiv}
          style={{
            backgroundImage: `url(/assets/piece18/${img})`,
            display: visibleMonsters.includes(idx) ? "block" : "none",
          }}
        />
      ))}

      {/* Frankenstein quotes background */}
      <div className={styles.frankenstein}>
        <p ref={quotesRef} className={styles.quotes}>
          "Nothing is so painful to the human mind as a great and sudden
          change." "Beware; for I am fearless, and therefore powerful." "Life,
          although it may only be an accumulation of anguish, is dear to me, and
          I will defend it." "I do know that for the sympathy of one living
          being, I would make peace with all. I have love in me the likes of
          which you can scarcely imagine and rage the likes of which you would
          not believe. If I cannot satisfy the one, I will indulge the other."
          "There is something at work in my soul, which I do not understand."
          "If I cannot inspire love, I will cause fear!" "I ought to be thy
          Adam, but I am rather the fallen angel..." "Even broken in spirit as
          he is, no one can feel more deeply than he does the beauties of
          nature. The starry sky, the sea, and every sight afforded by these
          wonderful regions, seems still to have the power of elevating his soul
          from earth. Such a man has a double existence: he may suffer misery,
          and be overwhelmed by disappointments; yet, when he has retired into
          himself, he will be like a celestial spirit that has a halo around
          him, within whose circle no grief or folly ventures." "... the
          companions of our childhood always possess a certain power over our
          minds which hardly any later friend can obtain." "How mutable are our
          feelings, and how strange is that clinging love we have of life even
          in the excess of misery!" "It is true, we shall be monsters, cut off
          from all the world; but on that account we shall be more attached to
          one another." "The fallen angel becomes a malignant devil. Yet even
          that enemy of God and man had friends and associates in his
          desolation; I am alone." "I was benevolent and good; misery made me a
          fiend. Make me happy, and I shall again be virtuous." "The world to me
          was a secret, which I desired to discover; to her it was a vacancy,
          which she sought to people with imaginations of her own." "When
          falsehood can look so like the truth, who can assure themselves of
          certain happiness?" "Hateful day when I received life!' I exclaimed in
          agony. 'Accursed creator! Why did you form a monster so hideous that
          even you turned from me in disgust? God, in pity, made man beautiful
          and alluring, after his own image; but my form is a filthy type of
          yours, more horrid even from the very resemblance. Satan had his
          companions, fellow-devils, to admire and encourage him; but I am
          solitary and abhorred.'" "The whole series of my life appeared to me
          as a dream; I sometimes doubted if indeed it were all true, for it
          never presented itself to my mind with the force of reality." "Man," I
          cried, "how ignorant art thou in thy pride of wisdom!" "The world was
          to me a secret which I desired to devine." "Listen to me,
          Frankenstein. You accuse me of murder; and yet you would, with a
          satisfied conscience, destroy your own creature. Oh, praise the
          eternal justice of man!" "I am alone and miserable. Only someone as
          ugly as I am could love me." "I could not understand why men who knew
          all about good and evil could hate and kill each other." "With how
          many things are we on the brink of becoming acquainted, if cowardice
          or carelessness did not restrain our inquiries." "Thus strangely are
          our souls constructed, and by slight ligaments are we bound to
          prosperity and ruin." "Learn from me, if not by my precepts, at least
          by my example, how dangerous is the acquirement of knowledge, and how
          much happier that man is who believes his native town to be his world,
          than he who aspires to become greater than his nature will allow."
          "Nothing is more painful to the human mind than, after the feelings
          have been worked up by a quick succession of events, the dead calmness
          of inaction and certainty which follows and deprives the soul both of
          hope and fear." "It may...be judged indecent in me to come forward on
          this occasion; but when I see a fellow-creature about to perish
          through the cowardice of her pretended friends, I wish to be allowed
          to speak, that I may say what I know of her character." "if I see but
          one smile on your lips when we meet, occasioned by this or any other
          exertion of mine, I shall need no other happiness." "I am malicious
          because I am miserable"
        </p>
      </div>

      {/* Tooltip - rendered outside blend mode context via portal */}
      {activeTooltip &&
        ReactDOM.createPortal(
          <div
            className={styles.tooltip}
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
            }}
          >
            {tooltips[activeTooltip]}
          </div>,
          document.body,
        )}

      {/* Poem */}
      <div className={styles.poem}>
        <div
          id="poemSection1"
          className={styles.poemSection}
          onMouseEnter={(e) => handleMouseEnter(e, "section1")}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <h1>
            doctor doctor
            <br />
            fix me please
            <br />
            craft your misery
            <br />
            in the image of me <br />
          </h1>
        </div>
        <div
          id="poemSection2"
          className={styles.poemSection}
          onMouseEnter={(e) => handleMouseEnter(e, "section2")}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <h1>
            a year and change <br />
            a knockoff noose
            <br />
            i feel nothing at all
            <br />
            but i like to bruise
            <br />
          </h1>
        </div>
        <div
          id="poemSection3"
          className={styles.poemSection}
          onMouseEnter={(e) => handleMouseEnter(e, "section3")}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <h1>
            a year and change
            <br />
            and i am, i am she
            <br />
            i am the creature
            <br />
            you'd made of me
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Piece18;
