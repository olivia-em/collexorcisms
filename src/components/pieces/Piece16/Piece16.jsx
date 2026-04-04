import React, { Suspense, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import BacksideSphere from "./Spheres/BacksideSphere";
import SpotlightGroup from "./Lights/SpotlightGroup";
import TextLayer from "./Text/TextLayer";
import RotatingRing from "./Text/RotatingRing";
import {
  sceneConfig,
  sphereConfig,
  lightConfig,
  textConfig,
} from "./config/sceneConfig";
import styles from "./Piece16.module.css";
import useTrackPiece from "../../../useTrackPiece";
import { useGame } from "../../../GameContext";

// RotationTracker sits inside the Canvas so it can access OrbitControls events
function RotationTracker({ onDelta }) {
  const prevAzimuth = useRef(null);

  const handleChange = (e) => {
    // OrbitControls passes its own instance as the event target
    const controls = e.target;
    const azimuth = controls.getAzimuthalAngle(); // radians, wraps -π to π

    if (prevAzimuth.current !== null) {
      let delta = azimuth - prevAzimuth.current;
      // Handle wrap-around: if jump > π, user crossed the ±π boundary
      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;
      onDelta(Math.abs(delta));
    }
    prevAzimuth.current = azimuth;
  };

  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.05}
      enableZoom={false}
      enablePan={false}
      onChange={handleChange}
    />
  );
}

export default function Piece16({ ...canvasProps }) {
  const [showCanvas, setShowCanvas] = useState(false);
  useTrackPiece("shedding_light");
  const { trackShedLightRotation, state } = useGame();
  const completedRef = useRef(state.completedPieces?.shedding_light ?? false);

  const handleRotationDelta = (delta) => {
    if (completedRef.current) return; // already done, stop tracking
    trackShedLightRotation(delta);
    // Check if cumulative rotation has now reached 2π
    // GameContext handles the actual completion flag internally,
    // but we mirror it here for the ref so we stop calling trackShed
    if (state.completedPieces?.shedding_light) {
      completedRef.current = true;
    }
  };

  return (
    <div className={styles.piece16Container}>
      {!showCanvas && (
        <button
          onClick={() => setShowCanvas(true)}
          className={styles.piece16Button}
        >
          light <i>light</i>{" "}
          <strong>
            <i>light</i>
          </strong>
        </button>
      )}
      {showCanvas && (
        <Canvas
          camera={{
            position: sceneConfig.camera.position,
            fov: sceneConfig.camera.fov,
          }}
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            alpha: false,
            stencil: false,
            depth: true,
          }}
          {...canvasProps}
        >
          <ambientLight
            color={lightConfig.ambient.color}
            intensity={lightConfig.ambient.intensity}
          />
          <group rotation={[0, sceneConfig.rotation, 0]}>
            <BacksideSphere
              radius={sphereConfig.inner.radius}
              opacity={sphereConfig.inner.opacity}
              color={sphereConfig.inner.color}
            />
            <BacksideSphere
              radius={sphereConfig.outer.radius}
              opacity={sphereConfig.outer.opacity}
              color={sphereConfig.outer.color}
            />
            <Suspense fallback={null}>
              <TextLayer
                text={sceneConfig.text.inner}
                colorGroups={sceneConfig.colorGroups.inner}
                position={textConfig.inner.position}
                fontSize={textConfig.inner.fontSize}
                targetWidthMultiplier={textConfig.inner.targetWidthMultiplier}
                flipped={textConfig.inner.flipped}
              />
              <TextLayer
                text={sceneConfig.text.outer}
                colorGroups={sceneConfig.colorGroups.outer}
                position={textConfig.outer.position}
                fontSize={textConfig.outer.fontSize}
                targetWidthMultiplier={textConfig.outer.targetWidthMultiplier}
                flipped={textConfig.outer.flipped}
              />
              <RotatingRing
                text={sceneConfig.text.ring}
                radius={textConfig.ring?.radius || 25}
                fontSize={textConfig.ring?.fontSize || 1}
                color={textConfig.ring?.color || 0xffaa00}
                rotationSpeed={textConfig.ring?.rotationSpeed || 0.3}
              />
            </Suspense>
          </group>
          <SpotlightGroup
            colors={lightConfig.inner.colors}
            radius={lightConfig.inner.radius}
            targetZ={lightConfig.inner.targetZ}
            rotationSpeed={lightConfig.inner.rotationSpeed}
            intensity={lightConfig.inner.intensity}
            angle={lightConfig.inner.angle}
            penumbra={lightConfig.inner.penumbra}
            visibilityStates={[true, true, true]}
            showHelpers={false}
            sceneRotation={sceneConfig.rotation}
          />
          <SpotlightGroup
            colors={lightConfig.outer.colors}
            radius={lightConfig.outer.radius}
            targetZ={lightConfig.outer.targetZ}
            rotationSpeed={lightConfig.outer.rotationSpeed}
            intensity={lightConfig.outer.intensity}
            angle={lightConfig.outer.angle}
            penumbra={lightConfig.outer.penumbra}
            visibilityStates={[true, true, true]}
            showHelpers={false}
            sceneRotation={sceneConfig.rotation}
          />
          {/* RotationTracker replaces the plain OrbitControls — same props, adds onChange */}
          <RotationTracker onDelta={handleRotationDelta} />
        </Canvas>
      )}
    </div>
  );
}
