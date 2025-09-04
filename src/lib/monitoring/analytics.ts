export class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  initialize(config: {
    userId?: string;
    sessionId?: string;
    environment: 'development' | 'production';
  }) {
    if (this.isInitialized) return;

    // Initialize analytics providers
    if (typeof window !== 'undefined' && config.environment === 'production') {
      // Google Analytics 4
      this.initializeGA4();
      
      // Custom analytics
      this.initializeCustomAnalytics(config);
    }

    this.isInitialized = true;
  }

  track(event: string, properties?: Record<string, any>) {
    if (!this.isInitialized) return;

    const eventData = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
    };

    // Send to multiple providers
    this.sendToGA4(eventData);
    this.sendToCustomAnalytics(eventData);
    this.sendToServer(eventData);
  }

  trackPageView(path: string, title?: string) {
    this.track('page_view', {
      path,
      title: title || document.title,
    });
  }

  trackUserAction(action: string, category: string, label?: string, value?: number) {
    this.track('user_action', {
      action,
      category,
      label,
      value,
    });
  }

  trackHealthMetric(metric: string, value: number, unit?: string) {
    this.track('health_metric', {
      metric,
      value,
      unit,
    });
  }

  trackAIOptimization(type: string, result: any) {
    this.track('ai_optimization', {
      type,
      result,
      efficiency_score: result.efficiencyScore,
    });
  }

  private initializeGA4() {
    // GA4 initialization
    const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
    if (!GA4_ID) return;

    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', GA4_ID);
  }

  private initializeCustomAnalytics(config: any) {
    // Custom analytics initialization
    localStorage.setItem('ils_session', JSON.stringify({
      sessionId: config.sessionId,
      startTime: Date.now(),
    }));
  }

  private sendToGA4(eventData: any) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventData.event, eventData.properties);
    }
  }

  private sendToCustomAnalytics(eventData: any) {
    // Store in IndexedDB for offline support
    this.storeEventLocally(eventData);
  }

  private async sendToServer(eventData: any) {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      console.warn('Failed to send analytics to server:', error);
    }
  }

  private storeEventLocally(eventData: any) {
    // Store in IndexedDB for offline analytics
    if ('indexedDB' in window) {
      const request = indexedDB.open('ILSAnalytics', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['events'], 'readwrite');
        const store = transaction.objectStore('events');
        store.add({
          ...eventData,
          id: Date.now(),
          synced: false,
        });
      };
    }
  }
}

// Hook for React components
export const useAnalytics = () => {
  const analytics = AnalyticsService.getInstance();

  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackHealthMetric: analytics.trackHealthMetric.bind(analytics),
    trackAIOptimization: analytics.trackAIOptimization.bind(analytics),
  };
};