import React, { useState } from "react";
import styles from "./Piece1Test.module.css";

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
    text: [
      "Section 1 content.",
      { link: "section2", label: "Go to Section 2" },
    ],
  },
  section2: {
    cd: "olivialee@10-08-2001 cd section 2",
    text: [
      "Section 2 content.",
      { link: "section3", label: "Go to Section 3" },
    ],
  },
  section3: {
    cd: "olivialee@10-08-2001 cd section 3",
    text: [
      "Section 3 content.",
      { link: "section4", label: "Go to Section 4" },
    ],
  },
  section4: {
    cd: "olivialee@10-08-2001 cd section 4",
    text: ["Section 4 content.", { link: "index", label: "Back to Index" }],
  },
};

function renderLine(line, setPage) {
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

export default function Piece1Test() {
  const [page, setPage] = useState("index");

  if (page === "index") {
    const { sections } = PAGES.index;
    return (
      <div className={styles.terminalLinks}>
        {sections.map((section, idx) => (
          <a
            key={section.id}
            href="#"
            className={styles.terminalLink}
            onClick={(e) => {
              e.preventDefault();
              setPage(section.id);
            }}
          >
            {section.label}
          </a>
        ))}
      </div>
    );
  }

  const { cd, text } = PAGES[page];
  return (
    <div>
      <div className={styles.terminalSectionTitle}>{cd}</div>
      <div>
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
              </div>
            );
          }
          if (typeof line === "object" && line.link) {
            return (
              <a
                key={i}
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
          return <div key={i}>{line}</div>;
        })}
      </div>
    </div>
  );
}
