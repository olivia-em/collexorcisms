import SpotlightRig from "./SpotlightRig";

export default function SpotlightGroup({
  colors,
  radius,
  targetZ,
  rotationSpeed,
  intensity,
  angle,
  penumbra,
  visibilityStates = [true, true, true],
  showHelpers = false,
  sceneRotation = 0, // Add this prop
}) {
  return (
    <>
      {colors.map((color, index) => (
        <SpotlightRig
          key={index}
          color={color}
          index={index}
          radius={radius}
          targetZ={targetZ}
          rotationSpeed={rotationSpeed}
          intensity={intensity}
          angle={angle}
          penumbra={penumbra}
          visible={visibilityStates[index]}
          showHelper={showHelpers}
          sceneRotation={sceneRotation} // Pass it down
        />
      ))}
    </>
  );
}
