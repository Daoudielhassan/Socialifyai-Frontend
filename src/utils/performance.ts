import React from 'react';

/**
 * Performance monitoring utilities
 * Provides metrics for tracking application performance
 */

interface PerformanceMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
}

interface ComponentMetrics {
  component: string;
  mountTime: number;
  renderTime: number;
}

class PerformanceMonitor {
  private componentMetrics: ComponentMetrics[] = [];

  /**
   * Get core web vitals and navigation timing
   */
  getPageMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics: PerformanceMetrics = {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      loadComplete: navigation.loadEventEnd - navigation.fetchStart,
    };

    // Try to get paint metrics
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    const lcp = performance.getEntriesByType('largest-contentful-paint')[0];

    if (fcp) metrics.firstContentfulPaint = fcp.startTime;
    if (lcp) metrics.largestContentfulPaint = lcp.startTime;

    return metrics;
  }

  /**
   * Mark component mount start
   */
  markComponentStart(componentName: string): string {
    const markName = `${componentName}-start`;
    performance.mark(markName);
    return markName;
  }

  /**
   * Mark component mount end and calculate metrics
   */
  markComponentEnd(componentName: string, startMark: string): ComponentMetrics {
    const endMarkName = `${componentName}-end`;
    performance.mark(endMarkName);
    
    const measureName = `${componentName}-mount`;
    performance.measure(measureName, startMark, endMarkName);
    
    const measure = performance.getEntriesByName(measureName)[0];
    const metrics: ComponentMetrics = {
      component: componentName,
      mountTime: measure.startTime,
      renderTime: measure.duration,
    };

    this.componentMetrics.push(metrics);
    return metrics;
  }

  /**
   * Get all component metrics
   */
  getComponentMetrics(): ComponentMetrics[] {
    return [...this.componentMetrics];
  }

  /**
   * Clear all performance marks and measures
   */
  clearMetrics(): void {
    performance.clearMarks();
    performance.clearMeasures();
    this.componentMetrics = [];
  }

  /**
   * Log performance summary to console (dev only)
   */
  logPerformanceSummary(): void {
    if (process.env.NODE_ENV !== 'development') return;

    const pageMetrics = this.getPageMetrics();
    console.group('🚀 Performance Metrics');
    console.log('📊 Page Load Times:');
    console.table({
      'DOM Content Loaded': `${pageMetrics.domContentLoaded.toFixed(2)}ms`,
      'Load Complete': `${pageMetrics.loadComplete.toFixed(2)}ms`,
      'First Contentful Paint': pageMetrics.firstContentfulPaint ? `${pageMetrics.firstContentfulPaint.toFixed(2)}ms` : 'N/A',
      'Largest Contentful Paint': pageMetrics.largestContentfulPaint ? `${pageMetrics.largestContentfulPaint.toFixed(2)}ms` : 'N/A',
    });

    if (this.componentMetrics.length > 0) {
      console.log('⚛️ Component Render Times:');
      console.table(
        this.componentMetrics.reduce((acc, metric) => {
          acc[metric.component] = `${metric.renderTime.toFixed(2)}ms`;
          return acc;
        }, {} as Record<string, string>)
      );
    }
    console.groupEnd();
  }

  /**
   * Measure resource loading times
   */
  getResourceMetrics(): Record<string, number> {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources.reduce((acc, resource) => {
      const name = resource.name.split('/').pop() || resource.name;
      acc[name] = resource.duration;
      return acc;
    }, {} as Record<string, number>);
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for component performance tracking
 */
export const useComponentPerformance = (componentName: string) => {
  const [startMark, setStartMark] = React.useState<string | null>(null);

  React.useEffect(() => {
    const mark = performanceMonitor.markComponentStart(componentName);
    setStartMark(mark);

    return () => {
      if (mark) {
        performanceMonitor.markComponentEnd(componentName, mark);
      }
    };
  }, [componentName]);

  return startMark;
};

/**
 * Utility to measure function execution time
 */
export const measureExecutionTime = async <T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
  }
  
  return result;
};

/**
 * Bundle size analysis (dev only)
 */
export const analyzeBundleSize = (): void => {
  if (process.env.NODE_ENV !== 'development') return;

  // Analyze script tags
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  console.group('📦 Bundle Analysis');
  console.log('📄 Loaded Scripts:', scripts.length);
  console.log('🎨 Loaded Stylesheets:', styles.length);
  
  // Get estimated sizes from performance entries
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const jsResources = resources.filter(r => r.name.includes('.js'));

  if (jsResources.length > 0) {
    console.table(
      jsResources.map(r => ({
        file: r.name.split('/').pop(),
        transferSize: r.transferSize ? `${(r.transferSize / 1024).toFixed(2)}KB` : 'N/A',
        loadTime: `${r.duration.toFixed(2)}ms`
      }))
    );
  }

  console.groupEnd();
};

// Auto-log performance on page load (dev only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.logPerformanceSummary();
      analyzeBundleSize();
    }, 1000);
  });
}
