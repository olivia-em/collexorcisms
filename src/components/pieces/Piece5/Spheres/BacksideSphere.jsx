import { BackSide } from "three";

export default function BacksideSphere({
  radius,
  opacity = 1,
  color = "white",
}) {
  return (
    <mesh receiveShadow position={[0, 0, 0]}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={color}
        side={BackSide}
        roughness={0.5}
        metalness={0.0}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}
