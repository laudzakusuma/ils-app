export class PerformanceMonitor {
  private static metrics: Record<string, number> = {};
  private static observers: PerformanceObserver[] = [];

  static initialize() {
    if (typeof window === 'undefined') return;

    // Core Web Vitals monitoring
    this.observeWebVitals();
    
    // Custom performance metrics
    this.observeCustomMetrics();
    
    // Resource timing
    this.observeResourceTiming();
  }

  private static observeWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.LCP = lastEntry.startTime;
      this.sendMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const firstEntry = entryList.getEntries()[0];
      this.metrics.FID = firstEntry.processingStart - firstEntry.startTime;
      this.sendMetric('FID', this.metrics.FID);
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.metrics.CLS = clsValue;
      this.sendMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private static observeCustomMetrics() {
    // Time to Interactive (TTI)
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const tti = navigationEntry.loadEventEnd - navigationEntry.fetchStart;
        this.metrics.TTI = tti;
        this.sendMetric('TTI', tti);
      }, 0);
    });

    // API Response Times
    this.monitorAPIPerformance();
  }

  private static observeResourceTiming() {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming;
        
        // Monitor slow resources
        if (resourceEntry.duration > 1000) { // > 1 second
          this.sendMetric('slow_resource', resourceEntry.duration, {
            url: resourceEntry.name,
            type: resourceEntry.initiatorType,
          });
        }
      }
    }).observe({ entryTypes: ['resource'] });
  }

  private static monitorAPIPerformance() {
    // Monkey patch fetch to monitor API calls
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Track API performance
        const url = args[0] as string;
        if (url.includes('/api/')) {
          this.sendMetric('api_response_time', duration, {
            endpoint: url,
            status: response.status,
            success: response.ok,
          });
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.sendMetric('api_error', duration, {
          endpoint: args[0] as string,
          error: (error as Error).message,
        });
        
        throw error;
      }
    };
  }

  private static sendMetric(name: string, value: number, metadata?: Record<string, any>) {
    // Send to analytics
    const analytics = AnalyticsService.getInstance();
    analytics.track('performance_metric', {
      metric: name,
      value,
      ...metadata,
    });

    // Send to monitoring service
    this.sendToMonitoringService(name, value, metadata);
  }

  private static async sendToMonitoringService(
    name: string, 
    value: number, 
    metadata?: Record<string, any>
  ) {
    try {
      await fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          value,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          metadata,
        }),
      });
    } catch (error) {
      console.warn('Failed to send performance metric:', error);
    }
  }

  static getMetrics() {
    return { ...this.metrics };
  }

  static measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.sendMetric(`function_${name}`, end - start);
    
    return result;
  }

  static async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.sendMetric(`async_function_${name}`, end - start);
    
    return result;
  }
}