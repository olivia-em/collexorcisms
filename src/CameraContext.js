import React, { createContext, useContext } from "react";

export const CameraContext = createContext({ goToPiece: () => {} });

export function useCamera() {
  return useContext(CameraContext);
}
