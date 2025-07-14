interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    totalMetrics: number;
    averageDuration: number;
    slowestMetric: PerformanceMetric | null;
    fastestMetric: PerformanceMetric | null;
  };
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = __DEV__; // Only enable in development

  startTimer(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  endTimer(name: string): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`PerformanceMonitor: No timer found for "${name}"`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Log slow operations in development
    if (metric.duration > 100) {
      console.warn(`Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`, metric.metadata);
    }

    return metric.duration;
  }

  measureAsync<T>(name: string, asyncFn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    if (!this.enabled) return asyncFn();

    this.startTimer(name, metadata);
    return asyncFn().finally(() => {
      this.endTimer(name);
    });
  }

  measureSync<T>(name: string, syncFn: () => T, metadata?: Record<string, any>): T {
    if (!this.enabled) return syncFn();

    this.startTimer(name, metadata);
    const result = syncFn();
    this.endTimer(name);
    return result;
  }

  getReport(): PerformanceReport {
    const completedMetrics = Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
    
    if (completedMetrics.length === 0) {
      return {
        metrics: [],
        summary: {
          totalMetrics: 0,
          averageDuration: 0,
          slowestMetric: null,
          fastestMetric: null,
        },
      };
    }

    const sortedMetrics = completedMetrics.sort((a, b) => (b.duration || 0) - (a.duration || 0));
    const totalDuration = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);

    return {
      metrics: completedMetrics,
      summary: {
        totalMetrics: completedMetrics.length,
        averageDuration: totalDuration / completedMetrics.length,
        slowestMetric: sortedMetrics[0],
        fastestMetric: sortedMetrics[sortedMetrics.length - 1],
      },
    };
  }

  clear(): void {
    this.metrics.clear();
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for measuring component render performance
export function usePerformanceMonitor(componentName: string) {
  const startRender = () => {
    performanceMonitor.startTimer(`${componentName}_render`);
  };

  const endRender = () => {
    performanceMonitor.endTimer(`${componentName}_render`);
  };

  return { startRender, endRender };
}

// Higher-order component for measuring component performance
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithPerformanceMonitoring = React.forwardRef<any, P>((props, ref) => {
    const { startRender, endRender } = usePerformanceMonitor(displayName);

    React.useEffect(() => {
      startRender();
      return () => {
        endRender();
      };
    });

    return <WrappedComponent {...props} ref={ref} />;
  });

  WithPerformanceMonitoring.displayName = `withPerformanceMonitoring(${displayName})`;

  return WithPerformanceMonitoring;
}

// Utility for measuring API call performance
export async function measureApiCall<T>(
  name: string,
  apiCall: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return performanceMonitor.measureAsync(name, apiCall, metadata);
}

// Utility for measuring synchronous operations
export function measureSyncOperation<T>(
  name: string,
  operation: () => T,
  metadata?: Record<string, any>
): T {
  return performanceMonitor.measureSync(name, operation, metadata);
}

// Debug function to log performance report
export function logPerformanceReport(): void {
  if (!__DEV__) return;

  const report = performanceMonitor.getReport();
  console.group('🚀 Performance Report');
  console.log('Summary:', report.summary);
  console.log('Metrics:', report.metrics);
  console.groupEnd();
}

// Export the monitor instance and utilities
export default performanceMonitor; 