import { Group, Object3D, Mesh } from 'three';

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  jsHeapSizeLimit?: number;
  totalJSHeapSize?: number;
  usedJSHeapSize?: number;
  modelLoadTime?: number;
  renderTime: number;
  materialCount: number;
  triangleCount: number;
  drawCalls: number;
}

type PerformanceCallback = (metrics: PerformanceMetrics) => void;

class PerformanceMonitorService {
  private static instance: PerformanceMonitorService;
  private metrics: PerformanceMetrics;
  private callbacks: PerformanceCallback[] = [];

  private frameCount: number = 0;
  private lastFpsUpdateTime: number = performance.now();
  private renderStartTime: number = 0;

  private constructor() {
    this.metrics = {
      fps: 0,
      memoryUsage: 0,
      renderTime: 0,
      materialCount: 0,
      triangleCount: 0,
      drawCalls: 0
    };
  }

  public static getInstance(): PerformanceMonitorService {
    if (!PerformanceMonitorService.instance) {
      PerformanceMonitorService.instance = new PerformanceMonitorService();
    }
    return PerformanceMonitorService.instance;
  }

  public startMonitoring(): void {
    this.monitorFrame();
  }

  public stopMonitoring(): void {
    // No cleanup currently needed
  }

  public startRender(): void {
    this.renderStartTime = performance.now();
  }

  public endRender(): void {
    this.metrics.renderTime = performance.now() - this.renderStartTime;
  }

  public addCallback(callback: PerformanceCallback): void {
    this.callbacks.push(callback);
  }

  public removeCallback(callback: PerformanceCallback): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  public updateModelMetrics(model: Group): void {
    let triangleCount = 0;
    let materialCount = 0;
    let drawCalls = 0;

    model.traverse((object: Object3D) => {
      const mesh = object as Mesh;
      if (mesh.isMesh && mesh.geometry) {
        const geometry = mesh.geometry;
        const index = geometry.index;
        const position = geometry.attributes.position;

        triangleCount += index ? index.count / 3 : position.count / 3;
        materialCount += Array.isArray(mesh.material) ? mesh.material.length : 1;
        drawCalls++;
      }
    });

    this.metrics.triangleCount = triangleCount;
    this.metrics.materialCount = materialCount;
    this.metrics.drawCalls = drawCalls;
  }

  private monitorFrame(): void {
    const now = performance.now();
    this.frameCount++;

    const elapsed = now - this.lastFpsUpdateTime;

    if (elapsed >= 1000) {
      const fps = (this.frameCount * 1000) / elapsed;
      this.metrics.fps = Math.round(fps);
      this.frameCount = 0;
      this.lastFpsUpdateTime = now;

      // Memory metrics
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024);
        this.metrics.jsHeapSizeLimit = memory.jsHeapSizeLimit;
        this.metrics.totalJSHeapSize = memory.totalJSHeapSize;
        this.metrics.usedJSHeapSize = memory.usedJSHeapSize;
      }

      this.callbacks.forEach(cb => cb({ ...this.metrics }));
    }

    requestAnimationFrame(() => this.monitorFrame());
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

export default PerformanceMonitorService;
