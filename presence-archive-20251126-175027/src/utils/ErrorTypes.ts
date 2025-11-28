/**
 * Error Types for Canopi Application
 * 
 * Standardized error types for consistent error handling across the application.
 * All custom errors extend the base CanopiError class for consistent structure.
 */

/**
 * Base error class for all Canopi application errors
 */
export class CanopiError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: string;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'CanopiError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.originalError = originalError;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CanopiError);
    }
  }

  /**
   * Convert error to JSON for logging/transmission
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
      originalError: this.originalError instanceof Error 
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack
          }
        : this.originalError
    };
  }
}

/**
 * API-related errors
 */
export class APIError extends CanopiError {
  public readonly statusCode?: number;
  public readonly endpoint?: string;
  public readonly method?: string;

  constructor(
    message: string,
    statusCode?: number,
    endpoint?: string,
    method?: string,
    context?: Record<string, unknown>,
    originalError?: unknown
  ) {
    super(message, 'API_ERROR', { ...context, statusCode, endpoint, method }, originalError);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.method = method;
  }
}

/**
 * Authentication-related errors
 */
export class AuthenticationError extends CanopiError {
  constructor(
    message: string,
    context?: Record<string, unknown>,
    originalError?: unknown
  ) {
    super(message, 'AUTH_ERROR', context, originalError);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization-related errors (permissions)
 */
export class AuthorizationError extends CanopiError {
  constructor(
    message: string,
    context?: Record<string, unknown>,
    originalError?: unknown
  ) {
    super(message, 'AUTHORIZATION_ERROR', context, originalError);
    this.name = 'AuthorizationError';
  }
}

/**
 * Storage-related errors (localStorage, chrome.storage, etc.)
 */
export class StorageError extends CanopiError {
  public readonly storageType?: string;
  public readonly key?: string;

  constructor(
    message: string,
    storageType?: string,
    key?: string,
    context?: Record<string, unknown>,
    originalError?: unknown
  ) {
    super(message, 'STORAGE_ERROR', { ...context, storageType, key }, originalError);
    this.name = 'StorageError';
    this.storageType = storageType;
    this.key = key;
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends CanopiError {
  public readonly url?: string;

  constructor(
    message: string,
    url?: string,
    context?: Record<string, unknown>,
    originalError?: unknown
  ) {
    super(message, 'NETWORK_ERROR', { ...context, url }, originalError);
    this.name = 'NetworkError';
    this.url = url;
  }
}

/**
 * Validation errors (input validation, data validation)
 */
export class ValidationError extends CanopiError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(
    message: string,
    field?: string,
    value?: unknown,
    context?: Record<string, unknown>,
    originalError?: unknown
  ) {
    super(message, 'VALIDATION_ERROR', { ...context, field, value }, originalError);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Configuration errors (missing env vars, invalid config)
 */
export class ConfigurationError extends CanopiError {
  public readonly configKey?: string;

  constructor(
    message: string,
    configKey?: string,
    context?: Record<string, unknown>,
    originalError?: unknown
  ) {
    super(message, 'CONFIGURATION_ERROR', { ...context, configKey }, originalError);
    this.name = 'ConfigurationError';
    this.configKey = configKey;
  }
}

/**
 * State management errors
 */
export class StateError extends CanopiError {
  public readonly stateKey?: string;

  constructor(
    message: string,
    stateKey?: string,
    context?: Record<string, unknown>,
    originalError?: unknown
  ) {
    super(message, 'STATE_ERROR', { ...context, stateKey }, originalError);
    this.name = 'StateError';
    this.stateKey = stateKey;
  }
}

/**
 * Type guard to check if error is a CanopiError
 */
export function isCanopiError(error: unknown): error is CanopiError {
  return error instanceof CanopiError;
}

/**
 * Type guard to check if error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Type guard to check if error is an AuthenticationError
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * Type guard to check if error is an AuthorizationError
 */
export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Unknown error occurred';
}

/**
 * Extract error stack from unknown error type
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

/**
 * Convert unknown error to CanopiError
 */
export function toCanopiError(
  error: unknown,
  defaultCode: string = 'UNKNOWN_ERROR',
  context?: Record<string, unknown>
): CanopiError {
  if (isCanopiError(error)) {
    return error;
  }
  
  const message = getErrorMessage(error);
  return new CanopiError(message, defaultCode, context, error);
}


