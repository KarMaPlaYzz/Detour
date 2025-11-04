interface PerformanceMetric {
  name: string;
  startTime: number;
  duration?: number;
  threshold?: 'normal' | 'slow' | 'verySlow';
}

/**
 * Performance Monitoring Service
 * Tracks and logs performance metrics for optimization
 */
export class PerformanceMonitor {
  private static metrics: Map<string, PerformanceMetric> = new Map();
  private static thresholds = {
    slow: 300, // 300ms considered slow
    verySlow: 1000, // 1s+ very slow
  };

  /**
   * Start measuring a performance metric
   */
  static start(name: string): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  /**
   * End measuring and log the metric
   */
  static end(name: string): number {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric '${name}' was not started`);
      return 0;
    }

    const duration = performance.now() - metric.startTime;
    let threshold: 'normal' | 'slow' | 'verySlow' = 'normal';

    if (duration > this.thresholds.verySlow) {
      threshold = 'verySlow';
    } else if (duration > this.thresholds.slow) {
      threshold = 'slow';
    }

    const color = threshold === 'normal' ? '✅' : threshold === 'slow' ? '⚠️' : '❌';
    console.log(
      `${color} Performance: ${name} took ${duration.toFixed(2)}ms (${threshold})`
    );

    this.metrics.delete(name);
    return duration;
  }

  /**
   * Measure synchronous function
   */
  static measure<T>(name: string, fn: () => T): T {
    this.start(name);
    const result = fn();
    this.end(name);
    return result;
  }

  /**
   * Measure async function
   */
  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    this.start(name);
    const result = await fn();
    this.end(name);
    return result;
  }

  /**
   * Get memory info (React Native)
   */
  static getMemoryInfo(): {
    nativeHeap: number;
    jsHeapSize: number;
  } | null {
    if ((performance as any).memory) {
      return {
        jsHeapSize: (performance as any).memory.jsHeapSizeLimit,
        nativeHeap: (performance as any).memory.totalJSHeapSize,
      };
    }
    return null;
  }

  /**
   * Clear all metrics
   */
  static clearAll(): void {
    this.metrics.clear();
  }

  /**
   * Get all metrics
   */
  static getAll(): Map<string, PerformanceMetric> {
    return new Map(this.metrics);
  }
}
