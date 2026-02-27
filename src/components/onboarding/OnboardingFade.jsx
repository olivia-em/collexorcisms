import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── Script Definition ────────────────────────────────────────────────────────
// Step types:
//   'prompt'  — user must type `command` and press Enter
//   'output'  — lines printed automatically, line by line
//   'yn'      — waits for y/n keypress; y=advance, n=reset
//   'link-sequence' — lines printed one at a time, each gated by clicking the link in the previous line

const SCRIPT = [
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 % ",
    command: "cd collected_exorcisms",
  },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 collected_exorcisms % ",
    command: "ls",
  },
  {
    type: "output",
    lines: [
      "justBones         129               lack_of_flight    my_familiar",
      "CASS&RA           cursedVisions     untitled          objects_in_eleven",
      "silhouettes       confessions       secrets           parasite",
      "the_empathy_machine  s_curves      31                shedding_light",
      "N23               i_am_malicious   first_on_first_on_first  teeth_marks",
      "fetish            parthenogenesis  collex.txt",
    ],
  },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 collected_exorcisms % ",
    command: "cat collex.txt",
  },
  {
    // 'timed-output' supports per-line delay and rich jsx content
    // Empty string lines now render with minHeight so they show as real blank lines
    type: "timed-output",
    lines: [
      { text: "", delay: 400 },
      { text: "grief is a process", delay: 900 },
      { text: "you move back to move forward to move back again", delay: 500 },
      { text: "", delay: 1300 }, // stanza break
      { text: "grief is a collection of unrelated things", delay: 1000 },
      { text: "when you put them", delay: 500 },
      { text: "next to each other", delay: 500 },
      { text: "on top of each other", delay: 500 },
      { text: "torn apart, deprecated, and pieced together again", delay: 500 },
      { text: "", delay: 1300 }, // stanza break
      { text: "\u2026there is meaning there", delay: 1000 },
      { text: "there is a processing\u2026", delay: 500 },
      { text: "", delay: 1500 }, // stanza break — longer pause before questions
      { text: "But is there an end?", delay: 1300 },
      { text: "", delay: 1500 },
      { text: "Do you feel lost?", delay: 1300 },
      { text: "", delay: 1500 },
      { text: "You can always change the directory\u2026", delay: 1300 },
      { text: "", delay: 1500 },
      { rich: true, jsx: "but-the-only-way", delay: 1300 },
      { text: "", delay: 1700 },
      {
        text: "Will you begin anyway\u2026 even if you can't finish? (y/n)",
        delay: 1400,
      },
    ],
  },
  {
    type: "yn",
  },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 collected_exorcisms % ",
    command: "cd justBones",
  },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 justBones % ",
    command: "ls",
  },
  {
    // Each entry: text to display. If it has a `url`, render as a clickable link.
    // The NEXT line in the sequence unlocks only after this line's link is clicked.
    type: "link-sequence",
    lines: [
      {
        text: "A younger version of me...",
        url: "https://example.com/younger", // ← replace with real URL
        linkWord: "younger version",
      },
      {
        text: "felt what I could only fully describe now.",
        url: "https://example.com/describe", // ← replace with real URL
        linkWord: "fully describe",
      },
      {
        text: "I have been sitting on these feelings for quite some time...",
        url: "https://example.com/sitting", // ← replace with real URL
        linkWord: "these feelings",
      },
      {
        text: "and now I'm ready to move with them beside me.",
        url: null, // no link — just text, end of sequence
      },
    ],
  },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 justBones % ",
    command: "cat justBones.txt",
  },
  {
    type: "output",
    lines: ["", "justBones", ""],
  },
  {
    // Print the whole poem at once as a single rich block
    type: "timed-output",
    lines: [
      { rich: true, jsx: "justBones-poem", delay: 300 },
      { text: "", delay: 200 },
    ],
  },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 justBones % ",
    command: "cd ..",
  },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 collected_exorcisms % ",
    command: "cat collex.txt",
  },
  {
    type: "output",
    lines: ["", "Are you ready?", ""],
  },
  {
    type: "prompt",
    prefix: "olivialee@10-08-2001 collected_exorcisms % ",
    command: "I'm ready.",
    isFinal: true,
  },
];

const LINE_DELAY = 80; // ms between output lines (plain output steps)
const LINK_PAUSE = 600; // ms pause after clicking a link before next line prints

// Rich JSX content keyed by id — rendered inline in committed lines
const RICH_CONTENT = {
  "but-the-only-way": (
    <span>
      But the only way{" "}
      <span
        style={{ textDecoration: "line-through", textDecorationColor: "#999" }}
      >
        out
      </span>{" "}
      is through.
    </span>
  ),
  "justBones-poem": (
    <span
      style={{ display: "block", whiteSpace: "pre-wrap", lineHeight: "1.6" }}
    >
      {`pretty please, just let me rot
until I go unknown
ugly breed, so fallen off
what am I when I'm alone?

peel off my skin
and take my eyes;
replace them with
unseeing stones.

slice me open
and feed the flies;
they'll strip me down
til' i'm just bones

and then from there,
we'll go…`}
    </span>
  ),
};

// Render a link-sequence line: wraps only the linkWord in an anchor, rest is plain text
function LinkLine({ line, onClick }) {
  const text = line.content ?? line.text ?? "";
  if (!line.url || !line.linkWord) {
    return <span style={{ color: "#999" }}>{text}</span>;
  }
  const idx = text.indexOf(line.linkWord);
  if (idx === -1) return <span style={{ color: "#999" }}>{text}</span>;
  const before = text.slice(0, idx);
  const word = text.slice(idx, idx + line.linkWord.length);
  const after = text.slice(idx + line.linkWord.length);
  return (
    <span style={{ color: "#999" }}>
      {before}
      <span
        onClick={onClick}
        style={{
          color: line.clicked ? "#555" : "#c8c8c8",
          textDecoration: line.clicked ? "line-through" : "underline",
          textUnderlineOffset: "3px",
          cursor: line.clicked ? "default" : "pointer",
          transition: "color 0.3s",
        }}
      >
        {word}
      </span>
      {after}
    </span>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildInitialTermState() {
  return {
    // Array of rendered line objects:
    // { id, content: string | jsx, type: 'output'|'prompt'|'yn-prompt'|'link' }
    lines: [],
    stepIndex: 0,
    // sub-state for current step
    phase: "idle", // 'printing' | 'waiting-input' | 'waiting-yn' | 'waiting-link' | 'done'
    outputLineIndex: 0, // for output steps
    linkLineIndex: 0, // for link-sequence steps
    input: "",
    error: null,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Onboarding({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const [term, setTerm] = useState(buildInitialTermState);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const idCounter = useRef(0);
  const passkeyBuffer = useRef("");
  const PASSKEY = "0114";

  const nextId = () => {
    idCounter.current += 1;
    return idCounter.current;
  };

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [term.lines, term.phase]);

  // Focus input
  useEffect(() => {
    if (term.phase === "waiting-input") {
      inputRef.current?.focus();
    }
  }, [term.phase]);

  // ── Trigger fade-out and complete
  const triggerComplete = useCallback(() => {
    setFadingOut(true);
    setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 800);
  }, [onComplete]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // ── Dev passkey: typing "0114" at any point triggers immediate fade
  useEffect(() => {
    const handlePasskey = (e) => {
      passkeyBuffer.current = (passkeyBuffer.current + e.key).slice(
        -PASSKEY.length,
      );
      if (passkeyBuffer.current === PASSKEY) {
        passkeyBuffer.current = "";
        triggerComplete();
      }
    };
    window.addEventListener("keydown", handlePasskey);
    return () => window.removeEventListener("keydown", handlePasskey);
  }, [triggerComplete]);

  // ── Advance to next step
  const advanceStep = useCallback((fromState) => {
    const nextIndex = fromState.stepIndex + 1;
    if (nextIndex >= SCRIPT.length) {
      return { ...fromState, phase: "done" };
    }
    const step = SCRIPT[nextIndex];
    let newState = { ...fromState, stepIndex: nextIndex, error: null };

    if (step.type === "output") {
      newState.phase = "printing";
      newState.outputLineIndex = 0;
    } else if (step.type === "timed-output") {
      newState.phase = "printing";
      newState.outputLineIndex = 0;
    } else if (step.type === "prompt") {
      newState.phase = "waiting-input";
      newState.input = "";
    } else if (step.type === "yn") {
      newState.phase = "waiting-yn";
    } else if (step.type === "link-sequence") {
      newState.phase = "printing"; // print first line immediately
      newState.linkLineIndex = 0;
    }

    return newState;
  }, []);

  // ── Reset everything (n pressed)
  const resetAll = useCallback(() => {
    idCounter.current = 0;
    setTerm({ ...buildInitialTermState(), phase: "waiting-input" });
  }, []);

  // ── Output line printer
  useEffect(() => {
    if (term.phase !== "printing") return;
    const step = SCRIPT[term.stepIndex];

    if (step.type === "output") {
      if (term.outputLineIndex >= step.lines.length) {
        // Done printing — advance
        setTerm((prev) => advanceStep(prev));
        return;
      }
      const timer = setTimeout(() => {
        const lineText = step.lines[term.outputLineIndex];
        setTerm((prev) => ({
          ...prev,
          lines: [
            ...prev.lines,
            { id: nextId(), content: lineText, lineType: "output" },
          ],
          outputLineIndex: prev.outputLineIndex + 1,
        }));
      }, LINE_DELAY);
      return () => clearTimeout(timer);
    }

    if (step.type === "timed-output") {
      if (term.outputLineIndex >= step.lines.length) {
        setTerm((prev) => advanceStep(prev));
        return;
      }
      const entry = step.lines[term.outputLineIndex];
      const timer = setTimeout(() => {
        setTerm((prev) => ({
          ...prev,
          lines: [
            ...prev.lines,
            {
              id: nextId(),
              content: entry.rich ? entry.jsx : entry.text,
              lineType: entry.rich ? "rich" : "output",
            },
          ],
          outputLineIndex: prev.outputLineIndex + 1,
        }));
      }, entry.delay ?? LINE_DELAY);
      return () => clearTimeout(timer);
    }

    if (step.type === "link-sequence") {
      if (term.linkLineIndex >= step.lines.length) {
        setTerm((prev) => advanceStep(prev));
        return;
      }
      const entry = step.lines[term.linkLineIndex];
      const timer = setTimeout(() => {
        setTerm((prev) => ({
          ...prev,
          lines: [
            ...prev.lines,
            {
              id: nextId(),
              content: entry.text,
              url: entry.url,
              linkWord: entry.linkWord ?? null,
              lineType: entry.url ? "link" : "output",
              clicked: false,
            },
          ],
          phase: entry.url ? "waiting-link" : "printing",
          linkLineIndex: prev.linkLineIndex + 1,
        }));
      }, LINE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [
    term.phase,
    term.outputLineIndex,
    term.linkLineIndex,
    term.stepIndex,
    advanceStep,
  ]);

  // ── Init: start first step
  useEffect(() => {
    const step = SCRIPT[0];
    if (step.type === "prompt") {
      setTerm((prev) => ({ ...prev, phase: "waiting-input" }));
    }
  }, []);

  // ── Handle link click
  const handleLinkClick = useCallback((lineId, url) => {
    window.open(url, "_blank", "noopener,noreferrer");
    // Mark link as clicked and wait, then print next line
    setTerm((prev) => {
      const updatedLines = prev.lines.map((l) =>
        l.id === lineId ? { ...l, clicked: true } : l,
      );
      return { ...prev, lines: updatedLines };
    });
    setTimeout(() => {
      setTerm((prev) => {
        if (prev.phase !== "waiting-link") return prev;
        return { ...prev, phase: "printing" };
      });
    }, LINK_PAUSE);
  }, []);

  // ── Handle text input
  const handleInput = useCallback(
    (e) => {
      if (term.phase !== "waiting-input") return;
      setTerm((prev) => ({ ...prev, input: e.target.value, error: null }));
    },
    [term.phase],
  );

  const handleKeyDown = useCallback(
    (e) => {
      const step = SCRIPT[term.stepIndex];

      if (term.phase === "waiting-input" && e.key === "Enter") {
        e.preventDefault();
        const typed = term.input.trim();
        const expected = step.command.trim();

        // Echo the prompt line as committed output
        const promptLine = {
          id: nextId(),
          content: step.prefix + typed,
          lineType: "committed-prompt",
        };

        if (typed.toLowerCase() === expected.toLowerCase()) {
          // Correct
          setTerm((prev) => {
            const newState = advanceStep({
              ...prev,
              lines: [...prev.lines, promptLine],
              input: "",
              error: null,
            });

            // If this was the final step
            if (step.isFinal) {
              return {
                ...prev,
                lines: [...prev.lines, promptLine],
                phase: "done",
              };
            }
            return newState;
          });

          if (step.isFinal) {
            setTimeout(triggerComplete, 400);
          }
        } else {
          // Wrong — show error
          const errorLine = {
            id: nextId(),
            content: `ERROR: answer not found — '${typed}'`,
            lineType: "error",
          };
          setTerm((prev) => ({
            ...prev,
            lines: [...prev.lines, promptLine, errorLine],
            input: "",
            error: true,
          }));
        }
      }

      if (term.phase === "waiting-yn") {
        if (e.key === "y" || e.key === "Y") {
          e.preventDefault();
          e.stopPropagation();
          const yLine = {
            id: nextId(),
            content: "olivialee@10-08-2001 collected_exorcisms % y",
            lineType: "committed-prompt",
          };
          setTerm((prev) =>
            advanceStep({ ...prev, lines: [...prev.lines, yLine], input: "" }),
          );
        } else if (e.key === "n" || e.key === "N") {
          e.preventDefault();
          e.stopPropagation();
          resetAll();
        }
      }
    },
    [
      term.phase,
      term.stepIndex,
      term.input,
      advanceStep,
      resetAll,
      triggerComplete,
    ],
  );

  if (!visible) return null;

  const currentStep = SCRIPT[term.stepIndex];
  const showPrompt =
    term.phase === "waiting-input" && currentStep?.type === "prompt";
  const showYN = term.phase === "waiting-yn";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000",
        color: "#c8c8c8",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "14px",
        lineHeight: "1.6",
        overflowY: "auto",
        overflowX: "hidden",
        padding: "24px 32px 48px",
        boxSizing: "border-box",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.8s ease",
        cursor: "text",
        zIndex: 9999,
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Committed lines */}
      {term.lines.map((line) => (
        <div
          key={line.id}
          style={{
            marginBottom: "2px",
            minHeight: "1.6em",
            color:
              line.lineType === "error"
                ? "#e05555"
                : line.lineType === "committed-prompt"
                  ? "#c8c8c8"
                  : "#999",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {line.lineType === "link" ? (
            <LinkLine
              line={line}
              onClick={() =>
                !line.clicked && handleLinkClick(line.id, line.url)
              }
            />
          ) : line.lineType === "rich" ? (
            (RICH_CONTENT[line.content] ?? null)
          ) : (
            line.content
          )}
        </div>
      ))}

      {/* Active prompt line */}
      {showPrompt && (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            position: "relative",
          }}
        >
          <span style={{ color: "#c8c8c8", whiteSpace: "pre" }}>
            {currentStep.prefix}
          </span>
          {/* Ghost hint */}
          <span
            style={{
              position: "absolute",
              left: `${currentStep.prefix.length}ch`,
              color: "#444",
              fontStyle: "italic",
              pointerEvents: "none",
              whiteSpace: "pre",
            }}
          >
            {currentStep.command}
          </span>
          {/* Actual typed text */}
          <span
            style={{
              color: "#c8c8c8",
              whiteSpace: "pre",
              position: "relative",
              zIndex: 1,
            }}
          >
            {term.input}
          </span>
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "14px",
              backgroundColor: "#c8c8c8",
              marginLeft: "1px",
              verticalAlign: "middle",
              animation: "blink 1s step-end infinite",
            }}
          />
        </div>
      )}

      {/* y/n prompt indicator */}
      {showYN && (
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ color: "#c8c8c8", whiteSpace: "pre" }}>
            olivialee@10-08-2001 collected_exorcisms %{" "}
          </span>
          <span style={{ color: "#444", fontStyle: "italic" }}>y/n</span>
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "14px",
              backgroundColor: "#c8c8c8",
              marginLeft: "4px",
              verticalAlign: "middle",
              animation: "blink 1s step-end infinite",
            }}
          />
        </div>
      )}

      {/* Hidden input to capture keystrokes */}
      <input
        ref={inputRef}
        value={term.input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        autoFocus
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: 0,
          height: 0,
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      <div ref={bottomRef} />

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
      `}</style>
    </div>
  );
}
