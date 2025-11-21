/**
 * ERROR HANDLER - Centralized Error Handling
 * TypeScript + ES6 Module
 */
class ErrorHandler {
    /**
     * Handle errors with consistent logging and fallback
     */
    static handle(error, context, fallback = null, options = {}) {
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
    static async handleAsync(asyncFn, context, fallback = null) {
        try {
            return await asyncFn();
        }
        catch (error) {
            return this.handle(error, context, fallback);
        }
    }
    /**
     * Handle promise with error catching
     */
    static handlePromise(promise, context, fallback = null) {
        return promise
            .catch(error => {
            this.handle(error, context, fallback);
            return fallback;
        });
    }
    /**
     * Wrap function with error handling
     */
    static wrap(fn, context, fallback = null) {
        return (...args) => {
            try {
                return fn(...args);
            }
            catch (error) {
                return this.handle(error, context, fallback);
            }
        };
    }
    /**
     * Wrap async function with error handling
     */
    static wrapAsync(asyncFn, context, fallback = null) {
        return async (...args) => {
            try {
                return await asyncFn(...args);
            }
            catch (error) {
                return this.handle(error, context, fallback);
            }
        };
    }
    /**
     * Store error for debugging
     */
    static storeError(errorData) {
        if (typeof window === 'undefined')
            return;
        const win = window;
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
    static getErrorHistory(context = null, limit = 50) {
        if (typeof window === 'undefined')
            return [];
        const win = window;
        if (!win.errorHistory)
            return [];
        let errors = win.errorHistory;
        if (context) {
            errors = errors.filter(error => error.context === context);
        }
        return errors.slice(-limit);
    }
    /**
     * Clear error history
     */
    static clearErrorHistory() {
        if (typeof window === 'undefined')
            return;
        const win = window;
        win.errorHistory = [];
        console.log('Error history cleared');
    }
    /**
     * Get error statistics
     */
    static getErrorStats() {
        if (typeof window === 'undefined') {
            return { total: 0, byContext: {}, recent: 0 };
        }
        const win = window;
        if (!win.errorHistory) {
            return { total: 0, byContext: {}, recent: 0 };
        }
        const errors = win.errorHistory;
        const stats = {
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
    static exportErrors() {
        if (typeof window === 'undefined')
            return '[]';
        const win = window;
        return JSON.stringify(win.errorHistory || [], null, 2);
    }
    /**
     * Handle Supabase errors specifically
     */
    static handleSupabaseError(error, context, fallback = null) {
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
    static handleNetworkError(error, context, fallback = null) {
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
    static handleDOMOperation(domOperation, context, fallback = null) {
        try {
            return domOperation();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            console.error(`DOM operation failed in ${context}: ${errorMessage}`, {
                context,
                error: errorMessage,
                stack: errorStack
            }, 'dom');
            return this.handle(error, context, fallback);
        }
    }
}
export { ErrorHandler };
export default ErrorHandler;
