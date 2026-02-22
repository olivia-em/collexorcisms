import React, { useEffect, useRef, useState } from "react";

// Speed configuration (in milliseconds)
export const ANIMATION_SPEED = {
  type: 30, // Time per character when typing
  backspace: 20, // Time per character when deleting
};

const AnimatedLine = ({ operation, lineIndex, onComplete }) => {
  const [displayText, setDisplayText] = useState("");
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let timeoutId;
    let deleteIndex = 0;
    let typeIndex = 0;
    let phase = "type";

    const finish = () => {
      if (onCompleteRef.current) {
        onCompleteRef.current(lineIndex);
      }
    };

    if (operation.type === "keep") {
      setDisplayText(operation.line);
      finish();
      return undefined;
    }

    if (operation.type === "add") {
      typeIndex = 0;
      phase = "type";
    }

    if (operation.type === "delete") {
      deleteIndex = operation.line.length;
      phase = "backspace";
    }

    if (operation.type === "modify") {
      deleteIndex = operation.oldLine.length;
      phase = "backspace";
    }

    const step = () => {
      if (operation.type === "add") {
        if (typeIndex <= operation.line.length) {
          setDisplayText(operation.line.slice(0, typeIndex));
          typeIndex += 1;
          timeoutId = setTimeout(step, ANIMATION_SPEED.type);
        } else {
          finish();
        }
        return;
      }

      if (operation.type === "delete") {
        if (deleteIndex >= 0) {
          setDisplayText(operation.line.slice(0, deleteIndex));
          deleteIndex -= 1;
          timeoutId = setTimeout(step, ANIMATION_SPEED.backspace);
        } else {
          finish();
        }
        return;
      }

      if (operation.type === "modify") {
        if (phase === "backspace") {
          if (deleteIndex >= 0) {
            setDisplayText(operation.oldLine.slice(0, deleteIndex));
            deleteIndex -= 1;
            timeoutId = setTimeout(step, ANIMATION_SPEED.backspace);
          } else {
            phase = "type";
            typeIndex = 0;
            timeoutId = setTimeout(step, ANIMATION_SPEED.type);
          }
        } else {
          if (typeIndex <= operation.newLine.length) {
            setDisplayText(operation.newLine.slice(0, typeIndex));
            typeIndex += 1;
            timeoutId = setTimeout(step, ANIMATION_SPEED.type);
          } else {
            finish();
          }
        }
      }
    };

    step();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [operation, lineIndex]);

  return <>{displayText}</>;
};

export default AnimatedLine;
