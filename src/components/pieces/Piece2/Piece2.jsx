import React, { useState } from "react";
import styles from "./Piece2.module.css";

const poetryPages = {
  index: {
    title: "129",
    key: [
      "bad_bullet",
      "stay_shielded",
      "shame_remembers",
      "followed_inside",
      "lesson_handled",
    ],
    stars: [
      { id: "1920", label: "19_20.", page: "1920" },
      { id: "2122", label: "21_22.", page: "2122" },
      { id: "2324", label: "23_24.", page: "2324" },
      { id: "192123", label: "19_21_23.", page: "192123" },
      { id: "202224", label: "20_22_24.", page: "202224" },
    ],
  },
  1920: {
    title: "19_20",
    text: [
      ["I took a silver ", { link: "2324", label: "bullet" }],
      "I did it all for you",
      "I knew I wouldn't make it",
      "or get to see me through.",
      "",
      ["I ", { link: "2122", label: "handled" }, " the remains"],
      "as best I thought I could",
      ["followed by the ", { link: "192123", label: "shame" }],
      "no matter where I stood",
    ],
  },
  192123: {
    title: "19_21_23",
    text: [
      "I think I died and",
      "another me gathered",
      "what I left behind",
      "",
      "locked up in a chest",
      "beneath floor-boards in her mind",
      "",
      ["she ", { link: "1920", label: "remembers" }, " me"],
      "she's peeking through the blinds",
      "she is not me",
      "in the memories I left behind",
    ],
  },
  202224: {
    title: "20_22_24",
    text: [
      "not without loss",
      "it's all come to pass",
      ["and now gone ", { link: "2122", label: "inside" }],
      "",
      "sit by the window",
      "peek through the blinds",
      "I can't look at her",
      "or remember why",
      "",
      "carry her with me",
      "hidden within me",
      "heavy is my mind",
    ],
  },
  2122: {
    title: "21_22",
    text: [
      "I wasn't meant to last",
      "I came and went for you",
      ["a ", { link: "1920", label: "lesson" }, " from the past"],
      ["a ", { link: "2324", label: "shielded" }, " point of view"],
      "",
      "I figured out a way",
      "paved it far as I could",
      "careless cleaned the slate",
      ["shame ", { link: "202224", label: "followed" }, " me still through"],
    ],
  },
  2324: {
    title: "23_24",
    text: [
      ["I think I did something ", { link: "1920", label: "bad." }],
      "and brought this on myself",
      "I weathered it, I'm ash",
      "just leave me on the shelf",
      "",
      "a package in your mind",
      ["the bitterness will ", { link: "2122", label: "stay" }],
      "choose to bring her with you",
      "and leave behind the shame",
    ],
  },
};

function Piece2() {
  const [page, setPage] = useState("index");

  const handleStarClick = (pageId) => {
    setPage(pageId);
  };

  if (page === "index") {
    const { key, stars } = poetryPages.index;
    return (
      <div className={styles.skyContainer}>
        <div className={styles.key}>
          <p>
            {key.map((k, i) => (
              <span key={i}>
                {k}
                <br />
              </span>
            ))}
          </p>
        </div>
        <div className={styles.sky}>
          {stars.map((star) => (
            <a
              key={star.id}
              className={`${styles.star} ${styles[`star${star.id}`]}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleStarClick(star.page);
              }}
            >
              {star.label}
            </a>
          ))}
        </div>
      </div>
    );
  }

  const { title, text } = poetryPages[page];
  return (
    <div className={styles.poetryPage}>
      <h1 className={styles.poetryTitle}>{title}</h1>
      <div className={styles.poetryText}>
        {text.map((line, i) => {
          if (Array.isArray(line)) {
            return (
              <div key={i}>
                {line.map((part, j) => {
                  if (typeof part === "object" && part.link) {
                    return (
                      <a
                        key={j}
                        href="#"
                        className={styles.poetryLink}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(part.link);
                        }}
                      >
                        {part.label}
                      </a>
                    );
                  }
                  return <React.Fragment key={j}>{part}</React.Fragment>;
                })}
              </div>
            );
          }
          return <div key={i}>{line || <br />}</div>;
        })}
      </div>
      <a
        href="#"
        className={styles.poetryBack}
        onClick={(e) => {
          e.preventDefault();
          setPage("index");
        }}
      >
        129
      </a>
    </div>
  );
}

export default Piece2;
