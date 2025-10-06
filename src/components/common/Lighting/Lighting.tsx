import { useRef } from "react";
import { DirectionalLight } from "three";

type LightingProps = {
  ambientIntensity?: number;
  directionalIntensity?: number;
  directionalPosition?: [number, number, number];
  castShadow?: boolean;
  shadowMapSize?: number;
  fillLightIntensity?: number;
  fillLightPosition?: [number, number, number];
  rimLightIntensity?: number;
  rimLightPosition?: [number, number, number];
};

/**
 * Lighting component for setting up scene lighting
 * 
 * @param {LightingProps} props - Configuration for lighting
 * @returns {JSX.Element} The lighting setup
 */
const Lighting = ({
  ambientIntensity = 0.5,
  directionalIntensity = 1.0,
  directionalPosition = [10, 10, 5],
  castShadow = true,
  shadowMapSize = 1024,
  fillLightIntensity = 0.4,
  fillLightPosition = [-5, 5, -5],
  rimLightIntensity = 0.3,
  rimLightPosition = [0, 8, -10]
}: LightingProps) => {
  const mainLightRef = useRef<DirectionalLight>(null);

  return (
    <>
      {/* Ambient light - for overall scene illumination */}
      <ambientLight intensity={ambientIntensity} />
      
      {/* Main directional light - primary light source */}
      <directionalLight
        ref={mainLightRef}
        position={directionalPosition}
        intensity={directionalIntensity}
        castShadow={castShadow}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Fill light - secondary light from opposite direction */}
      <directionalLight
        position={fillLightPosition}
        intensity={fillLightIntensity}
        castShadow={false}
      />

      {/* Rim light - creates highlights around edges */}
      <directionalLight
        position={rimLightPosition}
        intensity={rimLightIntensity}
        castShadow={false}
      />
    </>
  );
};

export default Lighting;