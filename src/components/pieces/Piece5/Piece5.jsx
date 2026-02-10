import React, { Suspense, useState, useCallback, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
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
import styles from "./Piece5.module.css";

function ZScrollControl() {
  const { camera } = useThree();
  useEffect(() => {
    const onWheel = (e) => {
      camera.position.z += e.deltaY * 0.1; // Scrolling up zooms in (decreases z)
    };
    window.addEventListener("wheel", onWheel);
    return () => window.removeEventListener("wheel", onWheel);
  }, [camera]);
  return null;
}

export default function Piece5({ ...canvasProps }) {
  // If you want keyboard spotlight toggling, add a KeyboardControls component and state here
  // Example: const [lightVisibility, setLightVisibility] = useState([true, true, true]);

  const [showCanvas, setShowCanvas] = useState(false);

  return (
    <div className={styles.piece5Container}>
      {!showCanvas && (
        <button
          onClick={() => setShowCanvas(true)}
          className={styles.piece5Button}
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
            position: sceneConfig.camera.position, // Start further away
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
          <ZScrollControl />
          <ambientLight
            color={lightConfig.ambient.color}
            intensity={lightConfig.ambient.intensity}
          />
          <group rotation={[0, sceneConfig.rotation, 0]}>
            {/* Spheres */}
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

            {/* Text Layers */}
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

          {/* Spotlights */}
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

          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            enableZoom={false}
          />
        </Canvas>
      )}
    </div>
  );
}
