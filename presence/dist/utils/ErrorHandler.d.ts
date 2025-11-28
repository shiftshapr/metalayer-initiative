/**
 * Error Handler Utility
 *
 * Centralized error handling utilities for consistent error processing,
 * logging, and user feedback across the Canopi application.
 */
import { APIError, AuthenticationError, StorageError, type CanopiError as CanopiErrorType } from './ErrorTypes.js';
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
 * Handle an error with consistent logging and optional user feedback
 *
 * @param error - The error to handle (can be unknown type)
 * @param options - Error handling options
 * @returns The processed CanopiError (if not rethrown)
 * @throws The error if rethrow is true
 */
export declare function handleError(error: unknown, options?: ErrorHandlingOptions): CanopiErrorType;
/**
 * Handle an error in an async operation with proper error handling
 *
 * @param operation - The async operation to execute
 * @param options - Error handling options
 * @returns The result of the operation or undefined if error occurred
 */
export declare function handleAsyncError<T>(operation: () => Promise<T>, options?: ErrorHandlingOptions): Promise<T | undefined>;
/**
 * Wrap an async function with error handling
 *
 * @param fn - The async function to wrap
 * @param options - Error handling options
 * @returns Wrapped function that handles errors
 */
export declare function withErrorHandling<T extends unknown[], R>(fn: (...args: T) => Promise<R>, options?: ErrorHandlingOptions): (...args: T) => Promise<R | undefined>;
/**
 * Create an error boundary for async operations
 *
 * @param operation - The async operation
 * @param errorHandler - Custom error handler
 * @returns Result or handled error
 */
export declare function errorBoundary<T>(operation: () => Promise<T>, errorHandler?: (error: unknown) => T | Promise<T>): Promise<T>;
/**
 * Standard error handler for API calls
 */
export declare function handleAPIError(error: unknown, endpoint?: string, method?: string, context?: ErrorContext): APIError;
/**
 * Standard error handler for storage operations
 */
export declare function handleStorageError(error: unknown, storageType?: string, key?: string, context?: ErrorContext): StorageError;
/**
 * Standard error handler for authentication errors
 */
export declare function handleAuthError(error: unknown, context?: ErrorContext): AuthenticationError;
/**
 * Create a safe async wrapper that never throws
 */
export declare function safeAsync<T>(operation: () => Promise<T>, defaultValue: T, context?: ErrorContext): () => Promise<T>;
//# sourceMappingURL=ErrorHandler.d.ts.map