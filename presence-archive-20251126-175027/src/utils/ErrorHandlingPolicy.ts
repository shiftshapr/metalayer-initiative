/**
 * Error Handling Policy Helpers
 *
 * Provides shared helpers for enforcing module-level error handling policies,
 * recording boundary results for diagnostics, and ensuring consistent user feedback.
 */

import { handleError, type ErrorHandlingOptions, type ErrorContext } from './ErrorHandler.js';
import type { CanopiError as CanopiErrorType } from './ErrorTypes.js';

export type ModuleErrorSeverity = 'fatal' | 'recoverable';

export interface ModuleErrorPolicy extends ErrorHandlingOptions {
  component: string;
  operation: string;
  severity?: ModuleErrorSeverity;
  /**
   * Optional value returned when severity is recoverable
   */
  fallbackValue?: unknown;
  /**
   * Custom hook executed after the error has been processed
   */
  onError?: (error: CanopiErrorType) => void | Promise<void>;
}

export interface ErrorBoundaryResult<T> {
  id: string;
  component: string;
  operation: string;
  severity: ModuleErrorSeverity;
  success: boolean;
  value?: T;
  fallbackValue?: unknown;
  error?: CanopiErrorType;
  timestamp: string;
  durationMs: number;
  notifiedUser: boolean;
  rethrown: boolean;
}

class ErrorBoundaryRegistry {
  private records: ErrorBoundaryResult<unknown>[] = [];
  private maxRecords = 200;

  register(record: ErrorBoundaryResult<unknown>): void {
    this.records.push(record);
    if (this.records.length > this.maxRecords) {
      this.records.shift();
    }
  }

  getRecords(): ErrorBoundaryResult<unknown>[] {
    return [...this.records];
  }
}

declare global {
  interface Window {
    __canopiErrorBoundaries?: ErrorBoundaryRegistry;
  }
}

const boundaryRegistry: ErrorBoundaryRegistry = (() => {
  if (typeof window !== 'undefined') {
    if (window.__canopiErrorBoundaries) {
      return window.__canopiErrorBoundaries;
    }
    const registry = new ErrorBoundaryRegistry();
    window.__canopiErrorBoundaries = registry;
    return registry;
  }
  return new ErrorBoundaryRegistry();
})();

function buildContext(policy: ModuleErrorPolicy): ErrorContext {
  return {
    ...policy.context,
    operation: policy.operation,
    component: policy.component
  };
}

function normalizePolicy(policy: ModuleErrorPolicy): Required<ModuleErrorPolicy> {
  return {
    log: policy.log ?? true,
    logLevel: policy.logLevel ?? 'error',
    rethrow: policy.rethrow ?? false,
    showUserNotification: policy.showUserNotification ?? false,
    userMessage: policy.userMessage ?? '',
    context: buildContext(policy),
    reportToService: policy.reportToService ?? false,
    component: policy.component,
    operation: policy.operation,
    severity: policy.severity ?? 'recoverable',
    fallbackValue: policy.fallbackValue,
    onError: policy.onError ?? (() => undefined)
  };
}

function recordBoundary<T>(entry: ErrorBoundaryResult<T>): ErrorBoundaryResult<T> {
  boundaryRegistry.register(entry as ErrorBoundaryResult<unknown>);
  return entry;
}

function processFailure<T>(
  error: unknown,
  policy: ModuleErrorPolicy,
  durationMs: number
): never | ErrorBoundaryResult<T> {
  const normalized = normalizePolicy(policy);
  const handledError = handleError(error, normalized);
  const shouldRethrow = normalized.severity === 'fatal' || normalized.rethrow;

  const record = recordBoundary<T>({
    id: `${normalized.component}:${normalized.operation}:${Date.now()}`,
    component: normalized.component,
    operation: normalized.operation,
    severity: normalized.severity,
    success: false,
    error: handledError,
    fallbackValue: normalized.fallbackValue,
    timestamp: new Date().toISOString(),
    durationMs,
    notifiedUser: Boolean(normalized.showUserNotification && normalized.userMessage),
    rethrown: shouldRethrow
  });

  if (normalized.onError) {
    void normalized.onError(handledError);
  }

  if (shouldRethrow) {
    throw handledError;
  }

  return record;
}

export async function runWithErrorBoundary<T>(
  operation: () => Promise<T>,
  policy: ModuleErrorPolicy
): Promise<ErrorBoundaryResult<T>> {
  const start = Date.now();
  try {
    const value = await operation();
    return recordBoundary<T>({
      id: `${policy.component}:${policy.operation}:${start}`,
      component: policy.component,
      operation: policy.operation,
      severity: policy.severity ?? 'recoverable',
      success: true,
      value,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - start,
      notifiedUser: Boolean(policy.showUserNotification && policy.userMessage),
      rethrown: false
    });
  } catch (error: unknown) {
    return processFailure<T>(error, policy, Date.now() - start);
  }
}

export function handleModuleError<T = never>(
  error: unknown,
  policy: ModuleErrorPolicy
): never | ErrorBoundaryResult<T> {
  return processFailure<T>(error, policy, 0);
}

export function getErrorBoundaryRecords(): ErrorBoundaryResult<unknown>[] {
  return boundaryRegistry.getRecords();
}


