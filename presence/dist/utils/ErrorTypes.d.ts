/**
 * Error Types for Canopi Application
 *
 * Standardized error types for consistent error handling across the application.
 * All custom errors extend the base CanopiError class for consistent structure.
 */
/**
 * Base error class for all Canopi application errors
 */
export declare class CanopiError extends Error {
    readonly code: string;
    readonly context?: Record<string, unknown>;
    readonly timestamp: string;
    readonly originalError?: unknown;
    constructor(message: string, code: string, context?: Record<string, unknown>, originalError?: unknown);
    /**
     * Convert error to JSON for logging/transmission
     */
    toJSON(): Record<string, unknown>;
}
/**
 * API-related errors
 */
export declare class APIError extends CanopiError {
    readonly statusCode?: number;
    readonly endpoint?: string;
    readonly method?: string;
    constructor(message: string, statusCode?: number, endpoint?: string, method?: string, context?: Record<string, unknown>, originalError?: unknown);
}
/**
 * Authentication-related errors
 */
export declare class AuthenticationError extends CanopiError {
    constructor(message: string, context?: Record<string, unknown>, originalError?: unknown);
}
/**
 * Authorization-related errors (permissions)
 */
export declare class AuthorizationError extends CanopiError {
    constructor(message: string, context?: Record<string, unknown>, originalError?: unknown);
}
/**
 * Storage-related errors (localStorage, chrome.storage, etc.)
 */
export declare class StorageError extends CanopiError {
    readonly storageType?: string;
    readonly key?: string;
    constructor(message: string, storageType?: string, key?: string, context?: Record<string, unknown>, originalError?: unknown);
}
/**
 * Network-related errors
 */
export declare class NetworkError extends CanopiError {
    readonly url?: string;
    constructor(message: string, url?: string, context?: Record<string, unknown>, originalError?: unknown);
}
/**
 * Validation errors (input validation, data validation)
 */
export declare class ValidationError extends CanopiError {
    readonly field?: string;
    readonly value?: unknown;
    constructor(message: string, field?: string, value?: unknown, context?: Record<string, unknown>, originalError?: unknown);
}
/**
 * Configuration errors (missing env vars, invalid config)
 */
export declare class ConfigurationError extends CanopiError {
    readonly configKey?: string;
    constructor(message: string, configKey?: string, context?: Record<string, unknown>, originalError?: unknown);
}
/**
 * State management errors
 */
export declare class StateError extends CanopiError {
    readonly stateKey?: string;
    constructor(message: string, stateKey?: string, context?: Record<string, unknown>, originalError?: unknown);
}
/**
 * Type guard to check if error is a CanopiError
 */
export declare function isCanopiError(error: unknown): error is CanopiError;
/**
 * Type guard to check if error is an APIError
 */
export declare function isAPIError(error: unknown): error is APIError;
/**
 * Type guard to check if error is an AuthenticationError
 */
export declare function isAuthenticationError(error: unknown): error is AuthenticationError;
/**
 * Type guard to check if error is an AuthorizationError
 */
export declare function isAuthorizationError(error: unknown): error is AuthorizationError;
/**
 * Extract error message from unknown error type
 */
export declare function getErrorMessage(error: unknown): string;
/**
 * Extract error stack from unknown error type
 */
export declare function getErrorStack(error: unknown): string | undefined;
/**
 * Convert unknown error to CanopiError
 */
export declare function toCanopiError(error: unknown, defaultCode?: string, context?: Record<string, unknown>): CanopiError;
//# sourceMappingURL=ErrorTypes.d.ts.map