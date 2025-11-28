/**
 * Error Handling Policy Helpers
 *
 * Provides shared helpers for enforcing module-level error handling policies,
 * recording boundary results for diagnostics, and ensuring consistent user feedback.
 */
import { type ErrorHandlingOptions } from './ErrorHandler.js';
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
declare class ErrorBoundaryRegistry {
    private records;
    private maxRecords;
    register(record: ErrorBoundaryResult<unknown>): void;
    getRecords(): ErrorBoundaryResult<unknown>[];
}
declare global {
    interface Window {
        __canopiErrorBoundaries?: ErrorBoundaryRegistry;
    }
}
export declare function runWithErrorBoundary<T>(operation: () => Promise<T>, policy: ModuleErrorPolicy): Promise<ErrorBoundaryResult<T>>;
export declare function handleModuleError<T = never>(error: unknown, policy: ModuleErrorPolicy): never | ErrorBoundaryResult<T>;
export declare function getErrorBoundaryRecords(): ErrorBoundaryResult<unknown>[];
export {};
//# sourceMappingURL=ErrorHandlingPolicy.d.ts.map