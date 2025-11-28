/**
 * Error Handler Utility
 *
 * Centralized error handling utilities for consistent error processing,
 * logging, and user feedback across the Canopi application.
 */
import { Logger } from './Logger.js';
import { APIError, AuthenticationError, StorageError, isCanopiError, getErrorMessage, getErrorStack, toCanopiError, type CanopiError } from './ErrorTypes.js';

/**
 * Error handling context for better debugging
 */
export interface ErrorContext {
  operation?: string;
  component?: string;
  userId?: string;
  pageId?: string;
  communityId?: string;
  [key: string]: unknown;
}

/**
 * Error handling options
 */
export interface ErrorHandlingOptions {
  /** Whether to log the error */
  log?: boolean;
  /** Log level to use */
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
  /** Whether to rethrow the error */
  rethrow?: boolean;
  /** Whether to show user notification */
  showUserNotification?: boolean;
  /** Custom error message for user */
  userMessage?: string;
  /** Additional context */
  context?: ErrorContext;
  /** Whether this is a critical error that should be reported */
  reportToService?: boolean;
}

/**
 * Default error handling options
 */
const DEFAULT_OPTIONS: ErrorHandlingOptions = {
  log: true,
  logLevel: 'error',
  rethrow: false,
  showUserNotification: false,
  userMessage: '',
  context: {},
  reportToService: false
};

/**
 * Handle an error with consistent logging and optional user feedback
 *
 * @param error - The error to handle (can be unknown type)
 * @param options - Error handling options
 * @returns The processed CanopiError (if not rethrown)
 * @throws The error if rethrow is true
 */
export function handleError(error: unknown, options: ErrorHandlingOptions = {}): CanopiError {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  // Convert to CanopiError if needed
  const canopiError = toCanopiError(error, 'UNKNOWN_ERROR', opts.context);
  // Log the error
  if (opts.log) {
    const logData = {
      error: canopiError.toJSON(),
      context: opts.context,
      stack: getErrorStack(error)
    };
    switch (opts.logLevel) {
      case 'warn':
        Logger.warn(opts.userMessage || canopiError.message, logData, opts.context?.component as string || 'error-handler');
        break;
      case 'info':
        Logger.info(opts.userMessage || canopiError.message, logData, opts.context?.component as string || 'error-handler');
        break;
      case 'debug':
        Logger.debug(opts.userMessage || canopiError.message, logData, opts.context?.component as string || 'error-handler');
        break;
      case 'error':
      default:
        Logger.error(opts.userMessage || canopiError.message, logData, opts.context?.component as string || 'error-handler');
        break;
    }
  }
  // Show user notification if requested
  if (opts.showUserNotification) {
    const userMessage = opts.userMessage || getErrorMessage(error);
    showErrorNotification(userMessage, canopiError.code);
  }
  // Report to error service if critical
  if (opts.reportToService) {
    reportErrorToService(canopiError, opts.context);
  }
  // Rethrow if requested
  if (opts.rethrow) {
    throw canopiError;
  }
  return canopiError;
}

/**
 * Handle an error in an async operation with proper error handling
 *
 * @param operation - The async operation to execute
 * @param options - Error handling options
 * @returns The result of the operation or undefined if error occurred
 */
export async function handleAsyncError<T>(operation: () => Promise<T>, options: ErrorHandlingOptions = {}): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    handleError(error, options);
    return undefined;
  }
}

/**
 * Wrap an async function with error handling
 *
 * @param fn - The async function to wrap
 * @param options - Error handling options
 * @returns Wrapped function that handles errors
 */
export function withErrorHandling<T extends unknown[], R>(fn: (...args: T) => Promise<R>, options: ErrorHandlingOptions = {}): (...args: T) => Promise<R | undefined> {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, {
        ...options,
        context: {
          ...options.context,
          functionName: fn.name || 'anonymous'
        }
      });
      return undefined;
    }
  };
}

/**
 * Create an error boundary for async operations
 *
 * @param operation - The async operation
 * @param errorHandler - Custom error handler
 * @returns Result or handled error
 */
export async function errorBoundary<T>(operation: () => Promise<T>, errorHandler?: (error: unknown) => T | Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (errorHandler) {
      return await errorHandler(error);
    }
    // Default handling
    const canopiError = toCanopiError(error);
    handleError(canopiError, {
      log: true,
      rethrow: false,
      context: { operation: 'errorBoundary' }
    });
    throw canopiError;
  }
}

/**
 * Show error notification to user
 */
function showErrorNotification(message: string, code: string): void {
  // Check if NotificationManager is available
  const win = window as Window & { notificationManager?: { show?: (message: string, type: string) => void } };
  if (win.notificationManager?.show) {
    win.notificationManager.show(message, 'error');
  } else {
    // Fallback to console
    Logger.error(`[${code || 'ERROR'}] ${message}`, null, 'error');
  }
}

/**
 * Report error to error reporting service (placeholder for future implementation)
 */
function reportErrorToService(error: CanopiError, context?: ErrorContext): void {
  // TODO: Integrate with error reporting service (e.g., Sentry, LogRocket)
  // For now, just log it
  Logger.error('Error reported to service', {
    error: error.toJSON(),
    context
  }, 'error-reporting');
}

/**
 * Standard error handler for API calls
 */
export function handleAPIError(error: unknown, endpoint?: string, method?: string, context?: ErrorContext): APIError {
  let apiError: APIError;
  if (isCanopiError(error) && error instanceof APIError) {
    apiError = error;
  } else {
    const message = getErrorMessage(error);
    const statusCode = (error as { status?: number; statusCode?: number })?.status ||
      (error as { status?: number; statusCode?: number })?.statusCode;
    apiError = new APIError(message, statusCode, endpoint, method, context || {}, error);
  }
  handleError(apiError, {
    log: true,
    logLevel: 'error',
    context: {
      ...context,
      endpoint: apiError.endpoint,
      method: apiError.method,
      statusCode: apiError.statusCode
    }
  });
  return apiError;
}

/**
 * Standard error handler for storage operations
 */
export function handleStorageError(error: unknown, storageType?: string, key?: string, context?: ErrorContext): StorageError {
  let storageError: StorageError;
  if (isCanopiError(error) && error instanceof StorageError) {
    storageError = error;
  } else {
    const message = getErrorMessage(error);
    storageError = new StorageError(message, storageType, key, context || {}, error);
  }
  handleError(storageError, {
    log: true,
    logLevel: 'warn', // Storage errors are often non-critical
    context: {
      ...context,
      storageType: storageError.storageType,
      key: storageError.key
    }
  });
  return storageError;
}

/**
 * Standard error handler for authentication errors
 */
export function handleAuthError(error: unknown, context?: ErrorContext): AuthenticationError {
  let authError: AuthenticationError;
  if (isCanopiError(error) && error instanceof AuthenticationError) {
    authError = error;
  } else {
    const message = getErrorMessage(error);
    authError = new AuthenticationError(message, context || {}, error);
  }
  handleError(authError, {
    log: true,
    logLevel: 'error',
    showUserNotification: true,
    userMessage: 'Authentication failed. Please try again.',
    context
  });
  return authError;
}

/**
 * Create a safe async wrapper that never throws
 */
export function safeAsync<T>(operation: () => Promise<T>, defaultValue: T, context?: ErrorContext): () => Promise<T> {
  return async (): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      handleError(error, {
        log: true,
        logLevel: 'warn',
        context
      });
      return defaultValue;
    }
  };
}





