import React, { useState, useRef, useEffect } from "react";
import styles from "./Piece1.module.css";
import { useCamera } from "../../../CameraContext";
import img1 from "/assets/piece1/IMG_1836.JPG";
import img1Small from "/assets/piece1/IMG_1836_small.JPG";
import img2 from "/assets/piece1/Screenshot 2025-09-08 at 5.39.59 PM.png";
import img3 from "/assets/piece1/Screenshot 2025-09-08 at 5.50.27 PM.png";
import img4 from "/assets/piece1/Screenshot 2025-09-08 at 5.51.29 PM.png";

const PAGES = {
  index: {
    title: "Terminal Story Index",
    sections: [
      { id: "section1", label: "JB_V1" },
      { id: "section2", label: "JB_V2" },
      { id: "section3", label: "JB_V3" },
      { id: "section4", label: "JB_V4" },
    ],
  },
  section1: {
    nextSection: "section2",
    cd: "olivialee@10-08-2001 JB_V1 %",
    img: img3,
    text: [
      <>
        a{" "}
        <a
          href="https://github.com/olivia-em/justBones"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.poetryLink}
        >
          younger version
        </a>{" "}
        of me...
      </>,
    ],
  },
  section2: {
    nextSection: "section3",
    cd: "olivialee@10-08-2001 JB_V2 %",
    img: img4,
    text: [
      <>
        felt what I could only{" "}
        <a
          href="http://justbones.oliviaem.art/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.poetryLink}
        >
          fully describe
        </a>{" "}
        now.
      </>,
    ],
  },
  section3: {
    nextSection: "section4",
    cd: "olivialee@10-08-2001 JB_V3 %",
    img: img2,
    text: [
      <>
        I have been{" "}
        <a
          href="https://olivia-em.github.io/bittersweet/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.poetryLink}
        >
          sitting on
        </a>{" "}
        these feelings for quite some time...
      </>,
    ],
  },
  section4: {
    nextSection: null,
    cd: "olivialee@10-08-2001 JB_V4 %",
    img: img1Small,
    text: [
      <>
        and now{" "}
        <a href={img1} download="IMG_1836.JPG" className={styles.poetryLink}>
          I'm ready
        </a>{" "}
        to move with them beside me.
      </>,
    ],
  },
};

const PROMPT = "olivialee@10-08-2001 justbones % ls";

function Piece1() {
  const [page, setPage] = useState("index");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const terminalWindowRef = useRef(null);
  const { goToPiece } = useCamera();

  useEffect(() => {
    if (terminalWindowRef.current) {
      terminalWindowRef.current.scrollTop =
        terminalWindowRef.current.scrollHeight;
    }
  }, [page, selectedIndex]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore key presses if user is typing in an input or textarea
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (page === "index") {
        const sections = PAGES.index.sections;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : sections.length - 1,
          );
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < sections.length - 1 ? prev + 1 : 0,
          );
        } else if (e.key === "y" || e.key === "Y") {
          e.preventDefault();
          setPage(sections[selectedIndex].id);
          setSelectedIndex(0);
        } else if (e.key === "n" || e.key === "N") {
          e.preventDefault();
          if (goToPiece) {
            goToPiece(2);
          }
        }
      } else {
        // Section page
        if (e.key === "y" || e.key === "Y") {
          e.preventDefault();
          const nextSection = PAGES[page].nextSection;
          if (nextSection) {
            setPage(nextSection);
          } else if (page === "section4" && goToPiece) {
            goToPiece(2);
          }
        } else if (e.key === "n" || e.key === "N") {
          e.preventDefault();
          setPage("index");
          setSelectedIndex(0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [page, selectedIndex, goToPiece]);

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
                  <span
                  // className={
                  //   idx === selectedIndex
                  //     ? styles.terminalLinkSelected
                  //     : styles.terminalLink
                  // }
                  >
                    {section.label}
                  </span>
                  {idx < sections.length - 1 && (
                    <span style={{ margin: "0 1em" }}> </span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className={styles.terminalLine}>
              <span>
                olivialee@10-08-2001 justbones % cd{" "}
                {sections[selectedIndex].label.toLowerCase()} (y/n)
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Section page
  const { cd, img, text, nextSection } = PAGES[page];
  return (
    <div className={styles.piece1Container}>
      <div
        className={styles.terminalBox}
        style={{ backgroundImage: `url(${img})` }}
      >
        <div className={styles.terminalWindow} ref={terminalWindowRef}>
          {/* <div className={styles.terminalLine}>
            <span className={styles.prompt}>{PROMPT}</span>
          </div> */}
          <div className={styles.sectionBlock}>
            <div className={styles.terminalLine}>
              <span className={styles.prompt}>{cd}</span>
            </div>
            {/* <div className={styles.terminalLine}>
              <img src={img} alt={cd} className={styles.terminalImg} />
            </div> */}
            {text.map((line, i) => (
              <div className={styles.terminalLine} key={i}>
                <span>{line}</span>
              </div>
            ))}
            <div className={styles.terminalLine}>
              <span>
                {nextSection
                  ? "cd ../JB_V" +
                    Object.keys(PAGES).indexOf(nextSection) +
                    " (y/n)"
                  : "cd ../../129 (y/n)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Piece1;
