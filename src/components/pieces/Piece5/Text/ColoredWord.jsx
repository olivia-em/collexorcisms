import { DoubleSide } from "three";

export default function ColoredWord({
  geometry,
  color,
  position,
  rotation = [0, 0, 0],
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        color={color}
        side={DoubleSide}
        roughness={0.5}
        metalness={0.0}
      />
    </mesh>
  );
}
