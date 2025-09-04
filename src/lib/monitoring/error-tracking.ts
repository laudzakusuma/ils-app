export class ErrorTracking {
  private static isInitialized = false;
  private static errorQueue: Error[] = [];

  static initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));

    // React error boundary integration
    this.setupReactErrorBoundary();

    this.isInitialized = true;
  }

  private static handleError(event: ErrorEvent) {
    const error = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.reportError(error);
  }

  private static handlePromiseRejection(event: PromiseRejectionEvent) {
    const error = {
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      type: 'promise_rejection',
    };

    this.reportError(error);
  }

  private static setupReactErrorBoundary() {
    // This would be used in conjunction with React Error Boundaries
    (window as any).__ILS_ERROR_HANDLER__ = this.reportError.bind(this);
  }

  private static async reportError(error: any) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracked:', error);
    }

    // Send to error tracking service
    try {
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(error),
      });
    } catch (reportError) {
      // Store locally if can't send immediately
      this.errorQueue.push(error);
      localStorage.setItem('ils_error_queue', JSON.stringify(this.errorQueue));
    }

    // Send to external error tracking (e.g., Sentry)
    this.sendToSentry(error);
  }

  private static sendToSentry(error: any) {
    // Sentry integration would go here
    if ((window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(error.message));
    }
  }

  static captureException(error: Error, context?: Record<string, any>) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
    };

    this.reportError(errorData);
  }

  static setUser(user: { id: string; email: string }) {
    // Set user context for error tracking
    if ((window as any).Sentry) {
      (window as any).Sentry.setUser(user);
    }
  }

  static addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info') {
    if ((window as any).Sentry) {
      (window as any).Sentry.addBreadcrumb({
        message,
        category,
        level,
        timestamp: Date.now() / 1000,
      });
    }
  }
}