import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export function useWordWrapping(font, text, fontSize, targetWidthMultiplier) {
  const { camera } = useThree();

  return useMemo(() => {
    if (!font) return { lines: [], spaceWidth: 0 };

    const words = text.split(" ");
    const referenceDistance = 25;
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const height = 2 * Math.tan(vFOV / 2) * referenceDistance;
    const width = height * 1.5 * camera.aspect;
    const targetWidth = width * targetWidthMultiplier;

    // Pre-generate all word geometries
    const wordData = words.map((word) => {
      const shapes = font.generateShapes(word, fontSize, 12);
      const geometry = new THREE.ShapeGeometry(shapes);
      geometry.computeBoundingBox();
      const wordWidth = geometry.boundingBox
        ? geometry.boundingBox.max.x - geometry.boundingBox.min.x
        : 0;
      return { word, geometry, width: wordWidth };
    });

    const spaceWidth = fontSize * 0.35;
    const lines = [];
    let currentLine = [];
    let currentLineWidth = 0;

    wordData.forEach((data) => {
      const wordWidthWithSpace =
        data.width + (currentLine.length > 0 ? spaceWidth : 0);

      if (
        currentLineWidth + wordWidthWithSpace > targetWidth &&
        currentLine.length > 0
      ) {
        lines.push(currentLine);
        currentLine = [data];
        currentLineWidth = data.width;
      } else {
        currentLine.push(data);
        currentLineWidth += wordWidthWithSpace;
      }
    });

    if (currentLine.length > 0) lines.push(currentLine);

    return { lines, spaceWidth };
  }, [font, text, fontSize, targetWidthMultiplier, camera]);
}
