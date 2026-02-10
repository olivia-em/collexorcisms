import React from "react";
import "./App.css";

// import ThreeScroll from "./ThreeScroll";
import ThreeScroll from "./CSSScroll";
import BackgroundCollage from "./BackgroundCollage";
import Search from "./Search";

function App() {
  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Search />
      <ThreeScroll />
      <BackgroundCollage />
    </div>
  );
}

export default App;
