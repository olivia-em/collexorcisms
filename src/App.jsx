import React, { useRef } from "react";
import "./App.css";
import ThreeScroll from "./CSSScroll";
import BackgroundCollage from "./BackgroundCollage";
import Search from "./Search";
import { CameraContext } from "./CameraContext";

function App() {
  // We'll use a ref to store the goToPiece function from ThreeScroll
  const goToPieceRef = useRef(null);

  return (
    <CameraContext.Provider
      value={{
        goToPiece: (idx) => goToPieceRef.current && goToPieceRef.current(idx),
      }}
    >
      <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
        <Search />
        <ThreeScroll setGoToPiece={(fn) => (goToPieceRef.current = fn)} />
        <BackgroundCollage />
      </div>
    </CameraContext.Provider>
  );
}

export default App;
