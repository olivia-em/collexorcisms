// Line-by-line diff utility
// Compares two arrays of lines and returns the operations needed to transform from one to the other

export function diffLines(oldLines, newLines) {
  const operations = [];
  const maxLength = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLength; i++) {
    const oldLine = oldLines[i] || "";
    const newLine = newLines[i] || "";

    if (oldLine === newLine) {
      operations.push({ type: "keep", line: newLine, index: i });
    } else if (!oldLine && newLine) {
      operations.push({ type: "add", line: newLine, index: i });
    } else if (oldLine && !newLine) {
      operations.push({ type: "delete", line: oldLine, index: i });
    } else {
      operations.push({
        type: "modify",
        oldLine: oldLine,
        newLine: newLine,
        index: i,
      });
    }
  }

  return operations;
}
