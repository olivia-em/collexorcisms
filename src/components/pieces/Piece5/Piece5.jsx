import React, { useState, useEffect } from "react";
import styles from "./Piece5.module.css";
import useTrackPiece from "../../../useTrackPiece";

const Piece5 = () => {
  const [question, setQuestion] = useState("");
  const [intro, setIntro] = useState("");
  const [memory, setMemory] = useState("");
  const [outro, setOutro] = useState("");
  const [hallucination, setHallucination] = useState("");
  const { markInteracted } = useTrackPiece("cass_ra");
  const questionSource = {
    origin:
      "#question#<br>recycle old words<br>no longer to read <br>you between lines",
    question: [
      "How many times can I",
      "I guess I'll just",
      "Should I",
      "How long would it take to",
    ],
  };

  const memorySource = {
    origin: "<i>#question#</i>",
    question: [
      "You got played. It wasn't my intention, but you got played.",
      "I missed you.",
      "You have everything.",
      "I feel like you haven't really had a guy be in your corner... I can do that for you.",
      "Are we good or not? Cause I'm cold, I'm going upstairs.",
      "You kinda dress like a whore.",
      "You could have said something.",
      "This conversation isn't productive.",
      "I can't give you what you deserve.",
      "I don't think you want what you think you want.",
      "Well obviously there's something, it's not nothing.",
      "It's gonna be really hard to get drunk around you now.",
      "I don't want to be another guy in a long list of guys who've hurt her.",
    ],
  };

  const introSource = {
    origin: "#objectA#<br>to weigh down<br>#objectB#",
    objectA: ["only a handful", "not much but enough"],
    objectB: ["the pockets of<br>my mind", "my mind<br><br>"],
  };

  const outroSource = {
    origin:
      "heavier is the silence<br>#objectA#<br>I am burdened by quiet<br>#objectB#<br>",
    objectA: [" ", "over self-incrimination"],
    objectB: [" ", "and text-hallucinations"],
  };

  const messageSource = {
    origin: "#object#",
    object: ["I'm sorry.", "I mean it.", "You didn't deserve it."],
  };

  const splitmix32 = (seed) => {
    return function () {
      seed |= 0;
      seed = (seed + 0x9e3779b9) | 0;
      let t = seed ^ (seed >>> 16);
      t = Math.imul(t, 0x21f0aaad);
      t = t ^ (t >>> 15);
      t = Math.imul(t, 0x735a2d97);
      return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
    };
  };

  const expandGrammar = (source, rng) => {
    const pick = (arr) => arr[Math.floor(rng() * arr.length)];

    const expand = (text) => {
      return text.replace(/#(\w+)#/g, (match, key) => {
        if (source[key]) {
          const picked = pick(source[key]);
          return expand(picked);
        }
        return match;
      });
    };

    return expand(source.origin);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `${import.meta.env.BASE_URL}assets/piece5/cass_ra.txt`;
    link.download = "cass_ra.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const seed = 123456;
    const rng = splitmix32(seed);

    const questionInterval = setInterval(() => {
      setQuestion(expandGrammar(questionSource, rng));
    }, 2000);

    const introInterval = setInterval(() => {
      setIntro(expandGrammar(introSource, rng));
    }, 1000);

    const memoryInterval = setInterval(() => {
      setMemory(expandGrammar(memorySource, rng));
    }, 100);

    const outroInterval = setInterval(() => {
      setOutro(expandGrammar(outroSource, rng));
    }, 1000);

    const hallucinationInterval = setInterval(() => {
      setHallucination(expandGrammar(messageSource, rng));
    }, 500);

    return () => {
      clearInterval(questionInterval);
      clearInterval(introInterval);
      clearInterval(memoryInterval);
      clearInterval(outroInterval);
      clearInterval(hallucinationInterval);
    };
  }, []);

  return (
    <div className={styles.piece5Container}>
      <div id="titleDiv" className={styles.titleDiv}>
        <strong>
          CASS
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleDownload();
              markInteracted();
            }}
            className={styles.ampersand}
          >
            &
          </a>
          RA
        </strong>
      </div>
      <div
        id="questionDiv"
        className={styles.questionDiv}
        dangerouslySetInnerHTML={{ __html: question }}
      />
      <div
        id="introDiv"
        className={styles.introDiv}
        dangerouslySetInnerHTML={{ __html: intro }}
      />
      <div
        id="memoryDiv"
        className={styles.memoryDiv}
        dangerouslySetInnerHTML={{ __html: memory }}
      />
      <div
        id="outroDiv"
        className={styles.outroDiv}
        dangerouslySetInnerHTML={{ __html: outro }}
      />
      <div
        id="hallucinationDiv"
        className={styles.hallucinationDiv}
        dangerouslySetInnerHTML={{ __html: hallucination }}
      />
    </div>
  );
};

export default Piece5;
