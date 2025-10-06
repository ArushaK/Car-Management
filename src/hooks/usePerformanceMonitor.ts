import { useEffect } from 'react';
import PerformanceMonitorService from '@services/PerformanceMonitorService';
import { Group } from 'three';

export function usePerformanceMonitor(groupRef: React.RefObject<Group>, scene: any) {
  useEffect(() => {
    if (scene && groupRef.current) {
      const monitor = PerformanceMonitorService.getInstance();
      monitor.updateModelMetrics(groupRef.current);
    }
  }, [scene, groupRef]);
}
