/**
 * ERROR HANDLER - Centralized Error Handling
 * TypeScript + ES6 Module
 */
interface ErrorData {
    context: string;
    message: string;
    stack?: string | null;
    timestamp: string;
    fallback?: any;
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
declare class ErrorHandler {
    /**
     * Handle errors with consistent logging and fallback
     */
    static handle(error: Error | string, context: string, fallback?: any, options?: Record<string, any>): any;
    /**
     * Handle async operations with error catching
     */
    static handleAsync<T>(asyncFn: () => Promise<T>, context: string, fallback?: T | null): Promise<T | null>;
    /**
     * Handle promise with error catching
     */
    static handlePromise<T>(promise: Promise<T>, context: string, fallback?: T | null): Promise<T | null>;
    /**
     * Wrap function with error handling
     */
    static wrap<T extends (...args: any[]) => any>(fn: T, context: string, fallback?: any): (...args: Parameters<T>) => ReturnType<T> | null;
    /**
     * Wrap async function with error handling
     */
    static wrapAsync<T extends (...args: any[]) => Promise<any>>(asyncFn: T, context: string, fallback?: any): (...args: Parameters<T>) => Promise<ReturnType<T> | null>;
    /**
     * Store error for debugging
     */
    static storeError(errorData: ErrorData): void;
    /**
     * Get error history
     */
    static getErrorHistory(context?: string | null, limit?: number): ErrorData[];
    /**
     * Clear error history
     */
    static clearErrorHistory(): void;
    /**
     * Get error statistics
     */
    static getErrorStats(): ErrorStats;
    /**
     * Export error history
     */
    static exportErrors(): string;
    /**
     * Handle Supabase errors specifically
     */
    static handleSupabaseError(error: SupabaseError, context: string, fallback?: any): any;
    /**
     * Handle network errors specifically
     */
    static handleNetworkError(error: NetworkError, context: string, fallback?: any): any;
    /**
     * Create error boundary for DOM operations
     */
    static handleDOMOperation<T>(domOperation: () => T, context: string, fallback?: T | null): T | null;
}
export { ErrorHandler };
export default ErrorHandler;
//# sourceMappingURL=ErrorHandler.d.ts.map