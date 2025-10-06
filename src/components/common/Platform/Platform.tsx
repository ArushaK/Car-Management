import { Grid } from '@react-three/drei';

type PlatformProps = {
  position?: [number, number, number];
  renderOrder?: number;
  gridConfig?: {
    infiniteGrid?: boolean;
    cellSize?: number;
    cellThickness?: number;
    cellColor?: string;
    sectionSize?: number;
    sectionThickness?: number;
    sectionColor?: string;
    fadeDistance?: number;
    fadeStrength?: number;
  };
};

/**
 * Platform component for creating a grid base in the scene
 * 
 * @param {PlatformProps} props - Configuration for the platform grid
 * @returns {JSX.Element} The platform grid setup
 */
const Platform = ({
  position = [0, -0.01, 0],
  renderOrder = -1,
  gridConfig = {
    infiniteGrid: true,
    cellSize: 1,
    cellThickness: 0.6,
    cellColor: "#6f6f6f",
    sectionSize: 3,
    sectionThickness: 1.5,
    sectionColor: "#9d4b4b",
    fadeDistance: 30,
    fadeStrength: 1
  }
}: PlatformProps) => {
  return (
    <Grid
      renderOrder={renderOrder}
      position={position}
      infiniteGrid={gridConfig.infiniteGrid}
      cellSize={gridConfig.cellSize}
      cellThickness={gridConfig.cellThickness}
      cellColor={gridConfig.cellColor}
      sectionSize={gridConfig.sectionSize}
      sectionThickness={gridConfig.sectionThickness}
      sectionColor={gridConfig.sectionColor}
      fadeDistance={gridConfig.fadeDistance}
      fadeStrength={gridConfig.fadeStrength}
    />
  );
};

export default Platform;