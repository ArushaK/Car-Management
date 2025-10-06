// Environment-specific configurations for car positioning and camera settings
export interface EnvironmentConfig {
  carPosition: [number, number, number];
  carRotation?: [number, number, number]; // Optional rotation property
  cameraPosition: [number, number, number];
  platformVisible: boolean;
  lightingProps: {
    ambientIntensity: number;
    directionalIntensity: number;
    fillLightIntensity: number;
    rimLightIntensity: number;
  };
  groundHeight: number;
  groundRadius: number;
  groundScale: number; // Scale of the environment ground projection
  minDistance: number;
  maxDistance: number;
  target: [number, number, number];
  polarAngle: [number, number];
}

export const environmentConfigs: Record<string, EnvironmentConfig> = {
  shop: {
    carPosition: [0, 0, 0] as [number, number, number],
    cameraPosition: [5, 2.5, 5] as [number, number, number],
    platformVisible: false,
    lightingProps: {
      ambientIntensity: 0.6,
      directionalIntensity: 1.0,
      fillLightIntensity: 0.4,
      rimLightIntensity: 0.3,
    },
    groundHeight: 8,  // Controls how high up the environment is projected
    groundRadius: 60, // Controls the size of the ground projection
    groundScale: 10,  // Controls the scale of the ground texture
    minDistance: 3,   // Minimum zoom distance
    maxDistance: 20,  // Maximum zoom distance
    target: [0, 1, 0] as [number, number, number], // Look at the center of the car
    polarAngle: [Math.PI / 6, Math.PI / 2], // Limit vertical rotation
  },
  footprint_court: {
    carPosition: [0, 0, 0] as [number, number, number],
    cameraPosition: [5, 2, 5] as [number, number, number],
    platformVisible: false,
    lightingProps: {
      ambientIntensity: 0.8,
      directionalIntensity: 1.5,
      fillLightIntensity: 0.6,
      rimLightIntensity: 0.4,
    },
    groundHeight: 15,
    groundRadius: 80,
    groundScale: 10,
    minDistance: 3,
    maxDistance: 20,
    target: [0, 1, 0] as [number, number, number],
    polarAngle: [Math.PI / 6, Math.PI / 2],
  },
  reflection_map_01: {
    carPosition: [0, 0, 0] as [number, number, number],
    cameraPosition: [5, 2, 5] as [number, number, number],
    platformVisible: false,
    lightingProps: {
      ambientIntensity: 0.7,
      directionalIntensity: 1.2,
      fillLightIntensity: 0.5,
      rimLightIntensity: 0.4,
    },
    groundHeight: 10,
    groundRadius: 70,
    groundScale: 10,
    minDistance: 3,
    maxDistance: 20,
    target: [0, 1, 0] as [number, number, number],
    polarAngle: [Math.PI / 6, Math.PI / 2],
  },
  reflection_map_v2: {
    carPosition: [0, 0, 0] as [number, number, number],
    cameraPosition: [5, 2, 5] as [number, number, number],
    platformVisible: false,
    lightingProps: {
      ambientIntensity: 0.7,
      directionalIntensity: 1.2,
      fillLightIntensity: 0.5,
      rimLightIntensity: 0.4,
    },
    groundHeight: 10,
    groundRadius: 70,
    groundScale: 10,
    minDistance: 3,
    maxDistance: 20,
    target: [0, 1, 0] as [number, number, number],
    polarAngle: [Math.PI / 6, Math.PI / 2],
  },
  // New environment configurations
  racetrack: {
    carPosition: [0, 0, 2] as [number, number, number],
    carRotation: [0, 1.2, 0] as [number, number, number], // Rotate 90 degrees (facing left)
    cameraPosition: [5, 2.5, 5] as [number, number, number],
    platformVisible: false,
    lightingProps: {
      ambientIntensity: 0.7,
      directionalIntensity: 1.1,
      fillLightIntensity: 0.5,
      rimLightIntensity: 0.4,
    },
    groundHeight: 12,
    groundRadius: 75,
    groundScale: 10,
    minDistance: 3,
    maxDistance: 20,
    target: [0, 1, 0] as [number, number, number],
    polarAngle: [Math.PI / 6, Math.PI / 2],
  },
  gokarting: {
    carPosition: [-3, 0, 0] as [number, number, number],
    carRotation: [0, 1.2, 0] as [number, number, number], // About 72 degrees rotation
    cameraPosition: [6, 3, 6] as [number, number, number],
    platformVisible: false,
    lightingProps: {
      ambientIntensity: 0.75,
      directionalIntensity: 1.2,
      fillLightIntensity: 0.55,
      rimLightIntensity: 0.45,
    },
    groundHeight: 11,
    groundRadius: 70,
    groundScale: 10,
    minDistance: 3,
    maxDistance: 18,
    target: [0, 1, 0] as [number, number, number],
    polarAngle: [Math.PI / 6, Math.PI / 2],
  },
  desert: {
    carPosition: [-2.5, 0, 1] as [number, number, number],
    carRotation: [0, Math.PI * 0.6, 0] as [number, number, number], // About 108 degrees rotation
    cameraPosition: [5, 2.3, 5] as [number, number, number],
    platformVisible: false,
    lightingProps: {
      ambientIntensity: 0.65,
      directionalIntensity: 1.0,
      fillLightIntensity: 0.5,
      rimLightIntensity: 0.4,
    },
    groundHeight: 10,
    groundRadius: 65,
    groundScale: 10,
    minDistance: 3,
    maxDistance: 20,
    target: [0, 1, 0] as [number, number, number],
    polarAngle: [Math.PI / 6, Math.PI / 2],
  }
};