import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide } from "three";
import { useFont } from "../hooks/useFont";

export default function RotatingRing({
  text,
  radius = 25,
  fontSize = 1,
  color = 0xffaa00,
  rotationSpeed = 0.3,
}) {
  const groupRef = useRef();
  const font = useFont();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed;
    }
  });

  if (!font) return null;

  const words = text.split(" ");

  return (
    <group ref={groupRef}>
      {words.map((word, idx) => {
        const shapes = font.generateShapes(word, fontSize, 12);
        const angle = (idx / words.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh
            key={idx}
            position={[x, 0, z]}
            rotation={[0, -angle + Math.PI / 2, 0]}
            castShadow
            receiveShadow
          >
            <shapeGeometry args={[shapes]} />
            <meshStandardMaterial
              color={color}
              side={DoubleSide}
              roughness={0.5}
              metalness={0.0}
            />
          </mesh>
        );
      })}
    </group>
  );
}
