interface PerformanceMetric {
  type: 'image_load' | 'network_request' | 'render_time';
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isEnabled = __DEV__; // Only enable in development

  startTimer(type: PerformanceMetric['type'], metadata?: Record<string, any>): string {
    if (!this.isEnabled) return '';

    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const metric: PerformanceMetric = {
      type,
      startTime: performance.now(),
      metadata
    };

    this.metrics.push(metric);
    return id;
  }

  endTimer(id: string): void {
    if (!this.isEnabled || !id) return;

    const metric = this.metrics.find(m => 
      m.type === id.split('_')[0] && m.startTime.toString().includes(id.split('_')[1])
    );

    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
    }
  }

  logImageLoadTime(uri: string, duration: number, networkType?: string): void {
    if (!this.isEnabled) return;

    console.log(`🖼️ Image loaded: ${uri}`, {
      duration: `${duration.toFixed(2)}ms`,
      networkType,
      size: this.getImageSizeFromUri(uri)
    });
  }

  logNetworkPerformance(url: string, duration: number, status: number): void {
    if (!this.isEnabled) return;

    console.log(`🌐 Network request: ${url}`, {
      duration: `${duration.toFixed(2)}ms`,
      status,
      timestamp: new Date().toISOString()
    });
  }

  getAverageLoadTime(type: PerformanceMetric['type']): number {
    const relevantMetrics = this.metrics.filter(m => m.type === type && m.duration);
    if (relevantMetrics.length === 0) return 0;

    const totalDuration = relevantMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return totalDuration / relevantMetrics.length;
  }

  getMetricsSummary(): Record<string, any> {
    const imageLoads = this.metrics.filter(m => m.type === 'image_load');
    const networkRequests = this.metrics.filter(m => m.type === 'network_request');
    const renderTimes = this.metrics.filter(m => m.type === 'render_time');

    return {
      totalMetrics: this.metrics.length,
      imageLoads: {
        count: imageLoads.length,
        averageTime: this.getAverageLoadTime('image_load'),
        slowest: Math.max(...imageLoads.map(m => m.duration || 0)),
        fastest: Math.min(...imageLoads.map(m => m.duration || 0))
      },
      networkRequests: {
        count: networkRequests.length,
        averageTime: this.getAverageLoadTime('network_request')
      },
      renderTimes: {
        count: renderTimes.length,
        averageTime: this.getAverageLoadTime('render_time')
      }
    };
  }

  private getImageSizeFromUri(uri: string): string {
    // Extract size from imgix URL if available
    const sizeMatch = uri.match(/w=(\d+)&h=(\d+)/);
    if (sizeMatch) {
      return `${sizeMatch[1]}x${sizeMatch[2]}`;
    }
    return 'unknown';
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper functions for common use cases
export const trackImageLoad = (uri: string, networkType?: string) => {
  const startTime = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - startTime;
      performanceMonitor.logImageLoadTime(uri, duration, networkType);
    }
  };
};

export const trackNetworkRequest = (url: string) => {
  const startTime = performance.now();
  
  return {
    end: (status: number) => {
      const duration = performance.now() - startTime;
      performanceMonitor.logNetworkPerformance(url, duration, status);
    }
  };
}; 