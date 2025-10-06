// PerformanceMonitor/PerformanceMonitor.styles.ts
import styled from '@emotion/styled';

/**
 * Toggle button to show the performance monitor
 */
export const ToggleButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 8px 16px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 1000;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  transition: background-color 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #444;
  }
`;

/**
 * Container for the performance monitor
 */
export const MonitorContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 16px;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  z-index: 1000;
  min-width: 280px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

/**
 * Container for the header section
 */
export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

/**
 * Title of the performance monitor
 */
export const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`;

/**
 * Close button for the performance monitor
 */
export const CloseButton = styled.button`
  background-color: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

/**
 * Grid layout for metrics
 */
export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  align-items: center;
`;

/**
 * Label for each metric
 */
export const MetricLabel = styled.div`
  color: #ccc;
  font-size: 13px;
`;

interface MetricValueProps {
  color?: 'success' | 'warning' | 'error';
}

/**
 * Value display for each metric
 */
export const MetricValue = styled.div<MetricValueProps>`
  font-weight: 500;
  color: ${props => {
    switch(props.color) {
      case 'success': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'error': return '#f44336';
      default: return '#ffffff';
    }
  }};
`;