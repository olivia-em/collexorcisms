import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SpotLightHelper } from "three";
import { useHelper } from "@react-three/drei";

export default function SpotlightRig({
  color,
  index,
  radius,
  targetZ,
  rotationSpeed,
  intensity = 900,
  angle = Math.PI / 2.5,
  penumbra = 0.7,
  visible = true,
  showHelper = false,
  sceneRotation = 0, // Pass in the scene rotation
}) {
  const spotRef = useRef();

  // Use drei's helper instead of manual management
  useHelper(showHelper && spotRef, SpotLightHelper, color);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const rotationAngle = time * rotationSpeed;
    let x, y, z;

    // Calculate position relative to targetZ (in rotated space)
    if (index === 0) {
      x = 0;
      y = Math.cos(rotationAngle) * radius;
      z = targetZ + Math.sin(rotationAngle) * radius;
    } else if (index === 1) {
      x = 0;
      y = Math.cos(rotationAngle) * -radius;
      z = targetZ + Math.sin(rotationAngle) * radius;
    } else {
      x = Math.cos(rotationAngle) * radius;
      y = 0;
      z = targetZ + Math.sin(rotationAngle) * radius;
    }

    // Transform position to world space (apply scene rotation)
    const worldX = x * Math.cos(sceneRotation) - z * Math.sin(sceneRotation);
    const worldY = y;
    const worldZ = x * Math.sin(sceneRotation) + z * Math.cos(sceneRotation);

    if (spotRef.current) {
      spotRef.current.position.set(worldX, worldY, worldZ);
    }
  });

  // Calculate target position accounting for scene rotation
  // The text is at [0, 0, targetZ] in the ROTATED coordinate system
  // We need to convert this to world coordinates
  const targetX = Math.sin(sceneRotation) * targetZ;
  const targetY = 0;
  const targetZWorld = Math.cos(sceneRotation) * targetZ;

  return (
    <spotLight
      ref={spotRef}
      color={color}
      intensity={intensity}
      angle={angle}
      penumbra={penumbra}
      distance={200}
      castShadow
      visible={visible}
      target-position={[targetX, targetY, targetZWorld]}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-bias={-0.0005}
      shadow-camera-near={0.5}
      shadow-camera-far={100}
    />
  );
}
