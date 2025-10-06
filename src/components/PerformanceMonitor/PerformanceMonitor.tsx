// PerformanceMonitor/PerformanceMonitor.tsx
import React, { useEffect, useState, useCallback } from 'react';
import PerformanceMonitorService, { PerformanceMetrics } from '@services/PerformanceMonitorService';
import * as S from './PerformanceMonitor.styles';

/**
 * PerformanceMonitor Component
 * 
 * A real-time performance monitoring overlay that displays metrics such as FPS,
 * memory usage, render time, and 3D model statistics.
 * 
 * @returns {JSX.Element} The PerformanceMonitor component
 */
const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    materialCount: 0,
    triangleCount: 0,
    drawCalls: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);

  const updateMetrics = useCallback((newMetrics: PerformanceMetrics) => {
    setMetrics(prevMetrics => ({
      ...prevMetrics,
      ...newMetrics
    }));
  }, []);

  useEffect(() => {
    const performanceMonitor = PerformanceMonitorService.getInstance();
    performanceMonitor.startMonitoring();

    // Add callback for metric updates
    performanceMonitor.addCallback(updateMetrics);

    // Set up an interval to force updates
    const updateInterval = setInterval(() => {
      const currentMetrics = performanceMonitor.getMetrics();
      updateMetrics(currentMetrics);
    }, 100); // Update every 100ms

    return () => {
      performanceMonitor.removeCallback(updateMetrics);
      performanceMonitor.stopMonitoring();
      clearInterval(updateInterval);
    };
  }, [updateMetrics]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setIsButtonVisible(prev => !prev);
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Get color based on FPS
  const getFpsColor = (fps: number) => {
    if (fps < 30) return 'error';
    if (fps < 60) return 'warning';
    return 'success';
  };

  if (!isVisible) {
    return isButtonVisible && <S.ToggleButton onClick={toggleVisibility}>Show Performance</S.ToggleButton>;
  }

  return (
    <S.MonitorContainer>
      <S.HeaderContainer>
        <S.Title>Performance Monitor</S.Title>
        <S.CloseButton onClick={toggleVisibility}>×</S.CloseButton>
      </S.HeaderContainer>
      
      <S.MetricsGrid>
        <S.MetricLabel>FPS:</S.MetricLabel>
        <S.MetricValue color={getFpsColor(metrics.fps)}>
          {metrics.fps}
        </S.MetricValue>
        
        <S.MetricLabel>Memory:</S.MetricLabel>
        <S.MetricValue>
          {metrics.memoryUsage.toFixed(2)} MB
        </S.MetricValue>
        
        <S.MetricLabel>Render Time:</S.MetricLabel>
        <S.MetricValue>
          {metrics.renderTime.toFixed(2)} ms
        </S.MetricValue>
        
        <S.MetricLabel>Materials:</S.MetricLabel>
        <S.MetricValue>
          {metrics.materialCount}
        </S.MetricValue>
        
        <S.MetricLabel>Triangles:</S.MetricLabel>
        <S.MetricValue>
          {metrics.triangleCount.toLocaleString()}
        </S.MetricValue>
        
        <S.MetricLabel>Draw Calls:</S.MetricLabel>
        <S.MetricValue>
          {metrics.drawCalls}
        </S.MetricValue>
      </S.MetricsGrid>
    </S.MonitorContainer>
  );
};

export default PerformanceMonitor;