/**
 * ERROR HANDLER - Centralized Error Handling
 * TypeScript + ES6 Module
 */

interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, unknown>;
}

interface ErrorData {
  context: string;
  message: string;
  stack?: string | null;
  timestamp: string;
  fallback?: unknown;
  code?: string;
  type?: string;
  status?: string | number;
  url?: string;
}

interface ErrorStats {
  total: number;
  byContext: Record<string, number>;
  recent: number;
}

interface SupabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}

interface NetworkError extends Error {
  status?: string | number;
  url?: string;
}

class ErrorHandler {
  /**
   * Handle errors with consistent logging and fallback
   */
  static handle(error: Error | unknown, context: string, fallback: unknown = null, options: Record<string, unknown> = {}): unknown {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : null;
    
    console.error(`Error in ${context}: ${errorMessage}`, {
      context,
      error: errorMessage,
      stack: errorStack,
      fallback: fallback,
      options
    }, 'error');

    // Store error for debugging
    this.storeError({
      context,
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
      fallback
    });

    return fallback;
  }

  /**
   * Handle async operations with error catching
   */
  static async handleAsync<T>(asyncFn: () => Promise<T>, context: string, fallback: T | null = null): Promise<T | null> {
    try {
      return await asyncFn();
    } catch (error) {
      return this.handle(error, context, fallback) as T | null;
    }
  }

  /**
   * Handle promise with error catching
   */
  static handlePromise<T>(promise: Promise<T>, context: string, fallback: T | null = null): Promise<T | null> {
    return promise
      .catch(error => {
        this.handle(error, context, fallback);
        return fallback;
      });
  }

  /**
   * Wrap function with error handling
   */
  static wrap<T extends (...args: unknown[]) => unknown>(
    fn: T,
    context: string,
    fallback: ReturnType<T> | null = null
  ): (...args: Parameters<T>) => ReturnType<T> | null {
    return (...args: Parameters<T>): ReturnType<T> | null => {
      try {
        return fn(...args) as ReturnType<T>;
      } catch (error) {
        return this.handle(error, context, fallback) as ReturnType<T> | null;
      }
    };
  }

  /**
   * Wrap async function with error handling
   */
  static wrapAsync<T extends (...args: unknown[]) => Promise<unknown>>(
    asyncFn: T,
    context: string,
    fallback: Awaited<ReturnType<T>> | null = null
  ): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | null> {
    return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | null> => {
      try {
        return await asyncFn(...args) as Awaited<ReturnType<T>>;
      } catch (error) {
        return this.handle(error, context, fallback) as Awaited<ReturnType<T>> | null;
      }
    };
  }

  /**
   * Store error for debugging
   */
  static storeError(errorData: ErrorData): void {
    if (typeof window === 'undefined') return;
    
    interface WindowWithErrorHistory extends Window {
      errorHistory?: ErrorData[];
    }
    
    const win = window as WindowWithErrorHistory;
    if (!win.errorHistory) {
      win.errorHistory = [];
    }
    
    win.errorHistory.push(errorData);
    
    // Keep only last 100 errors
    if (win.errorHistory.length > 100) {
      win.errorHistory.shift();
    }
  }

  /**
   * Get error history
   */
  static getErrorHistory(context: string | null = null, limit: number = 50): ErrorData[] {
    if (typeof window === 'undefined') return [];
    
    interface WindowWithErrorHistory extends Window {
      errorHistory?: ErrorData[];
    }
    
    const win = window as WindowWithErrorHistory;
    if (!win.errorHistory) return [];
    
    let errors: ErrorData[] = win.errorHistory;
    
    if (context) {
      errors = errors.filter(error => error.context === context);
    }
    
    return errors.slice(-limit);
  }

  /**
   * Clear error history
   */
  static clearErrorHistory(): void {
    if (typeof window === 'undefined') return;
    
    interface WindowWithErrorHistory extends Window {
      errorHistory?: ErrorData[];
    }
    
    const win = window as WindowWithErrorHistory;
    win.errorHistory = [];
    console.log('Error history cleared');
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): ErrorStats {
    if (typeof window === 'undefined') {
      return { total: 0, byContext: {}, recent: 0 };
    }
    
    interface WindowWithErrorHistory extends Window {
      errorHistory?: ErrorData[];
    }
    
    const win = window as WindowWithErrorHistory;
    if (!win.errorHistory) {
      return { total: 0, byContext: {}, recent: 0 };
    }
    
    const errors: ErrorData[] = win.errorHistory;
    const stats: ErrorStats = {
      total: errors.length,
      byContext: {},
      recent: errors.filter(e => {
        const errorTime = new Date(e.timestamp);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return errorTime > oneHourAgo;
      }).length
    };
    
    errors.forEach(error => {
      stats.byContext[error.context] = (stats.byContext[error.context] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Export error history
   */
  static exportErrors(): string {
    if (typeof window === 'undefined') return '[]';
    
    interface WindowWithErrorHistory extends Window {
      errorHistory?: ErrorData[];
    }
    
    const win = window as WindowWithErrorHistory;
    return JSON.stringify(win.errorHistory || [], null, 2);
  }

  /**
   * Handle Supabase errors specifically
   */
  static handleSupabaseError(error: SupabaseError, context: string, fallback: unknown = null): unknown {
    const errorMessage = error.message || 'Unknown Supabase error';
    const errorCode = error.code || 'UNKNOWN';
    
    console.error(`Supabase error in ${context}: ${errorMessage} (Code: ${errorCode})`, {
      context,
      error: errorMessage,
      code: errorCode,
      details: error.details,
      hint: error.hint
    }, 'supabase');

    this.storeError({
      context,
      message: errorMessage,
      code: errorCode,
      type: 'supabase',
      timestamp: new Date().toISOString(),
      fallback
    });

    return fallback;
  }

  /**
   * Handle network errors specifically
   */
  static handleNetworkError(error: NetworkError, context: string, fallback: unknown = null): unknown {
    const errorMessage = error.message || 'Network error';
    const status = error.status || 'UNKNOWN';
    
    console.error(`Network error in ${context}: ${errorMessage} (Status: ${status})`, {
      context,
      error: errorMessage,
      status,
      url: error.url
    }, 'network');

    this.storeError({
      context,
      message: errorMessage,
      status,
      type: 'network',
      timestamp: new Date().toISOString(),
      fallback
    });

    return fallback;
  }

  /**
   * Create error boundary for DOM operations
   */
  static handleDOMOperation<T>(domOperation: () => T, context: string, fallback: T | null = null): T | null {
    try {
      return domOperation();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error(`DOM operation failed in ${context}: ${errorMessage}`, {
        context,
        error: errorMessage,
        stack: errorStack
      }, 'dom');
      
      return this.handle(error, context, fallback) as T | null;
    }
  }
}

export { ErrorHandler };
export default ErrorHandler;

