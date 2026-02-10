// import React, { useRef, useEffect, useState } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { Html } from "@react-three/drei";
// import { useThree } from "@react-three/fiber";

// const pieces = [
//   {
//     id: 1,
//     content: (
//       <div style={{ padding: "2rem" }}>
//         <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Piece 1</h1>
//         <p style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>
//           Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scroll down
//           to see the next piece fade in.
//         </p>
//       </div>
//     ),
//   },
//   {
//     id: 2,
//     content: (
//       <div style={{ padding: "2rem" }}>
//         <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Piece 2</h1>
//         <p style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>
//           This is the second piece. Notice how it fades in as you scroll.
//         </p>
//       </div>
//     ),
//   },
//   {
//     id: 3,
//     content: (
//       <div style={{ padding: "2rem" }}>
//         <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Piece 3</h1>
//         <p style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>
//           The final piece. Each piece can have its own interactive logic.
//         </p>
//       </div>
//     ),
//   },
// ];

// function CameraController({ scroll }) {
//   const { camera } = useThree();
//   useEffect(() => {
//     camera.position.z = 10;
//   }, [camera]);
//   useFrame(() => {
//     camera.position.z += (scroll.current - camera.position.z) * 0.05;
//   });
//   return null;
// }

// function FadePage({ z, scroll, children }) {
//   const groupRef = useRef();
//   const [opacity, setOpacity] = useState(0);
//   useFrame(() => {
//     const cameraZ = scroll.current;
//     const distance = Math.abs(cameraZ - z);
//     const fadeDistance = 3;
//     let newOpacity = 1 - distance / fadeDistance;
//     newOpacity = Math.max(0, Math.min(1, newOpacity));
//     setOpacity(newOpacity);
//   });
//   return (
//     <group ref={groupRef} position={[0, 0, z]}>
//       <Html
//         center
//         distanceFactor={10}
//         style={{
//           width: "80vw",
//           height: "80vh",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           background: `rgba(255, 255, 255, ${opacity * 0.95})`,
//           color: "#000",
//           opacity: opacity,
//           transition: "opacity 0.3s",
//           borderRadius: "16px",
//           boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
//           pointerEvents: opacity > 0.5 ? "auto" : "none",
//         }}
//       >
//         {children}
//       </Html>
//     </group>
//   );
// }

// export default function ThreeScroll() {
//   const scroll = useRef(10); // Start far from pieces
//   const spacing = 5; // Distance between pieces
//   const minZ = pieces[pieces.length - 1].id * -spacing + spacing;
//   const maxZ = 10;

//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     const onWheel = (e) => {
//       e.preventDefault();
//       scroll.current -= e.deltaY * 0.01;
//       scroll.current = Math.max(minZ, Math.min(maxZ, scroll.current));
//     };
//     const onKeyDown = (e) => {
//       if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
//         scroll.current += 0.5;
//       } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
//         scroll.current -= 0.5;
//       }
//       scroll.current = Math.max(minZ, Math.min(maxZ, scroll.current));
//     };
//     window.addEventListener("wheel", onWheel, { passive: false });
//     window.addEventListener("keydown", onKeyDown);
//     return () => {
//       window.removeEventListener("wheel", onWheel);
//       window.removeEventListener("keydown", onKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [minZ, maxZ]);

//   return (
//     <div style={{ width: "100vw", height: "100vh", background: "#1a1a1a" }}>
//       <div
//         style={{
//           position: "fixed",
//           top: "20px",
//           left: "20px",
//           color: "white",
//           fontSize: "14px",
//           zIndex: 1000,
//           background: "rgba(0,0,0,0.5)",
//           padding: "10px",
//           borderRadius: "8px",
//         }}
//       >
//         Scroll or use arrow keys to navigate
//       </div>
//       <Canvas style={{ width: "100%", height: "100%" }}>
//         <CameraController scroll={scroll} />
//         <ambientLight intensity={0.5} />
//         {pieces.map((piece, i) => (
//           <FadePage key={piece.id} z={-i * spacing} scroll={scroll}>
//             {piece.content}
//           </FadePage>
//         ))}
//       </Canvas>
//     </div>
//   );
// }
