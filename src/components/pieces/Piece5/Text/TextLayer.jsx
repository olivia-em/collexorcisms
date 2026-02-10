import { useMemo } from "react";
import { useFont } from "../hooks/useFont";
import { useWordWrapping } from "../hooks/useWordWrapping";
import { useColorGroups } from "../hooks/useColorGroups";
import ColoredWord from "./ColoredWord";

export default function TextLayer({
  text,
  colorGroups,
  position,
  fontSize = 1,
  targetWidthMultiplier = 0.45,
  flipped = false,
}) {
  const font = useFont();
  const { lines, spaceWidth } = useWordWrapping(
    font,
    text,
    fontSize,
    targetWidthMultiplier
  );
  const { getWordColor } = useColorGroups(colorGroups);

  const wordMeshes = useMemo(() => {
    if (!font || lines.length === 0) return [];

    const lineHeight = fontSize * 1.4;
    const totalHeight = lines.length * lineHeight;
    const meshes = [];

    lines.forEach((lineWords, lineIdx) => {
      const yPos = totalHeight / 2 - lineIdx * lineHeight;
      const totalLineWidth = lineWords.reduce(
        (sum, data, idx) => sum + data.width + (idx > 0 ? spaceWidth : 0),
        0
      );

      let xOffset = -totalLineWidth / 2;

      lineWords.forEach((data) => {
        const color = getWordColor(data.word);
        const xPosition = flipped ? -xOffset : xOffset;
        const rotation = flipped ? [0, Math.PI, 0] : [0, 0, 0];

        meshes.push({
          geometry: data.geometry,
          color,
          position: [xPosition, yPos, 0],
          rotation,
        });

        xOffset += data.width + spaceWidth;
      });
    });

    return meshes;
  }, [font, lines, spaceWidth, getWordColor, flipped, fontSize]);

  return (
    <group position={position}>
      {wordMeshes.map((mesh, idx) => (
        <ColoredWord
          key={idx}
          geometry={mesh.geometry}
          color={mesh.color}
          position={mesh.position}
          rotation={mesh.rotation}
        />
      ))}
    </group>
  );
}
