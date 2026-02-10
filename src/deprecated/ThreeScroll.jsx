// Moved to deprecated folder
// Original code has been relocated to a deprecated folder.
// Please refer to the deprecated folder for the original implementation.
import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const pieces = [
  {
    id: 1,
    content: (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>Piece 1</h1>
        <p style={{ fontSize: "1.5rem" }}>
          Scroll forward to approach this piece
        </p>
      </div>
    ),
  },
  {
    id: 2,
    content: (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>Piece 2</h1>
        <p style={{ fontSize: "1.5rem" }}>
          Watch piece 1 fade as this approaches
        </p>
      </div>
    ),
  },
  {
    id: 3,
    content: (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>Piece 3</h1>
        <p style={{ fontSize: "1.5rem" }}>The final piece in the distance</p>
      </div>
    ),
  },
];

function CameraController({ scroll }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.z = 10; // Start far back
  }, [camera]);

  useFrame(() => {
    camera.position.z = scroll.current;
  });

  return null;
}

function FadePage({ z, scroll, children }) {
  const meshRef = useRef();
  const htmlRef = useRef();

  useFrame(({ camera }) => {
    const cameraZ = scroll.current;

    // Calculate distance from camera to this piece
    const distance = Math.abs(cameraZ - z);

    // Fade out only after camera passes the plane
    const fadeStart = z + 2; // Start fading when camera is 2 units past
    const fadeEnd = z + 4; // Fully faded at 4 units past

    let opacity = 1;
    if (cameraZ > fadeStart) {
      opacity = Math.max(0, 1 - (cameraZ - fadeStart) / (fadeEnd - fadeStart));
    }

    // Apply opacity to the HTML element
    if (htmlRef.current) {
      htmlRef.current.style.opacity = opacity;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, z]}>
      {/* Debug plane to see where the piece is in 3D space */}
      <mesh>
        <planeGeometry args={[8, 6]} />
        <meshBasicMaterial color="#444444" transparent opacity={0.3} />
      </mesh>

      <Html
        center
        transform
        sprite
        style={{
          width: "800px",
          height: "600px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255, 255, 255, 0.95)",
          color: "#000",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          pointerEvents: "auto",
        }}
        ref={htmlRef}
      >
        {children}
      </Html>
    </group>
  );
}

export default function ThreeScroll() {
  const scroll = useRef(10); // Start camera far back at z=10
  const spacing = 8; // Distance between pieces
  const minZ = -spacing * 2; // Can go past last piece
  const maxZ = 10; // Start position

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const onWheel = (e) => {
      e.preventDefault();
      // Scrolling down moves camera forward (decreases z)
      scroll.current -= e.deltaY * 0.01;
      scroll.current = Math.max(minZ, Math.min(maxZ, scroll.current));
    };

    const onKeyDown = (e) => {
      if (e.key === "ArrowUp") {
        scroll.current += 0.5;
      } else if (e.key === "ArrowDown") {
        scroll.current -= 0.5;
      }
      scroll.current = Math.max(minZ, Math.min(maxZ, scroll.current));
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [minZ, maxZ]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "white",
          fontSize: "14px",
          zIndex: 1000,
          background: "rgba(0,0,0,0.7)",
          padding: "12px",
          borderRadius: "8px",
        }}
      >
        Scroll down to move forward through the pieces
      </div>

      <Canvas style={{ width: "100%", height: "100%", background: "#1a1a2e" }}>
        <CameraController scroll={scroll} />
        <ambientLight intensity={0.8} />
        {pieces.map((piece, i) => (
          <FadePage key={piece.id} z={-i * spacing} scroll={scroll}>
            {piece.content}
          </FadePage>
        ))}
      </Canvas>
    </div>
  );
}
