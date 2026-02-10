import { useLoader } from "@react-three/fiber";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { fontUrl } from "../config/sceneConfig";

export function useFont() {
  const font = useLoader(FontLoader, fontUrl);
  return font;
}
