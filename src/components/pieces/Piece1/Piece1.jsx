import React, { useState, useRef, useEffect } from "react";
import styles from "./Piece1.module.css";
import img1 from "/assets/piece1/IMG_1836.JPG";
import img2 from "/assets/piece1/Screenshot 2025-09-08 at 5.39.59 PM.png";
import img3 from "/assets/piece1/Screenshot 2025-09-08 at 5.50.27 PM.png";
import img4 from "/assets/piece1/Screenshot 2025-09-08 at 5.51.29 PM.png";

const PAGES = {
  index: {
    title: "Terminal Story Index",
    sections: [
      { id: "section1", label: "Section 1" },
      { id: "section2", label: "Section 2" },
      { id: "section3", label: "Section 3" },
      { id: "section4", label: "Section 4" },
    ],
  },
  section1: {
    cd: "olivialee@10-08-2001 cd section 1",
    img: img1,
    text: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      { link: "section2", label: "Go to Section 2" },
    ],
  },
  section2: {
    cd: "olivialee@10-08-2001 cd section 2",
    img: img2,
    text: [
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      { link: "section3", label: "Go to Section 3" },
    ],
  },
  section3: {
    cd: "olivialee@10-08-2001 cd section 3",
    img: img3,
    text: [
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
      { link: "section4", label: "Go to Section 4" },
    ],
  },
  section4: {
    cd: "olivialee@10-08-2001 cd section 4",
    img: img4,
    text: [
      "Duis aute irure dolor in reprehenderit in voluptate velit esse.",
      { link: "index", label: "Back to Index" },
    ],
  },
};

const PROMPT = "olivialee@10-08-2001 justbones % ls";

function renderLine(line, setPage, styles) {
  if (Array.isArray(line)) {
    return (
      <span>
        {line.map((part, j) => {
          if (typeof part === "object" && part.link) {
            return (
              <a
                key={j}
                href="#"
                className={styles.terminalLink}
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
      </span>
    );
  }
  if (typeof line === "object" && line.link) {
    return (
      <a
        href="#"
        className={styles.terminalLink}
        onClick={(e) => {
          e.preventDefault();
          setPage(line.link);
        }}
      >
        {line.label}
      </a>
    );
  }
  return <span>{line}</span>;
}

function Piece1() {
  const [page, setPage] = useState("index");
  const terminalWindowRef = useRef(null);

  useEffect(() => {
    if (terminalWindowRef.current) {
      terminalWindowRef.current.scrollTop =
        terminalWindowRef.current.scrollHeight;
    }
  }, [page]);

  if (page === "index") {
    const { sections } = PAGES.index;
    return (
      <div className={styles.piece1Container}>
        <div className={styles.terminalBox}>
          <div className={styles.terminalWindow} ref={terminalWindowRef}>
            <div className={styles.terminalLine}>
              <span className={styles.prompt}>{PROMPT}</span>
            </div>
            <div className={styles.terminalLine}>
              {sections.map((section, idx) => (
                <React.Fragment key={section.id}>
                  <a
                    href="#"
                    className={styles.terminalLink}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(section.id);
                    }}
                  >
                    {section.label}
                  </a>
                  {idx < sections.length - 1 && (
                    <span style={{ margin: "0 1em" }}> </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Section page
  const { cd, img, text } = PAGES[page];
  return (
    <div className={styles.piece1Container}>
      <div className={styles.terminalBox}>
        <div className={styles.terminalWindow} ref={terminalWindowRef}>
          <div className={styles.terminalLine}>
            <span className={styles.prompt}>{PROMPT}</span>
          </div>
          <div className={styles.sectionBlock}>
            <div className={styles.terminalLine}>
              <span className={styles.prompt}>{cd}</span>
            </div>
            <div className={styles.terminalLine}>
              <img src={img} alt={cd} className={styles.terminalImg} />
            </div>
            {/* Render each line of text, supporting arrays and links */}
            {text.map((line, i) => (
              <div className={styles.terminalLine} key={i}>
                {renderLine(line, setPage, styles)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Piece1;
