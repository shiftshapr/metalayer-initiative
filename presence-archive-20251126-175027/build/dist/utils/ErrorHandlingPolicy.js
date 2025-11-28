/**
 * Error Handling Policy Helpers
 *
 * Provides shared helpers for enforcing module-level error handling policies,
 * recording boundary results for diagnostics, and ensuring consistent user feedback.
 */
import { handleError } from './ErrorHandler.js';
class ErrorBoundaryRegistry {
    constructor() {
        this.records = [];
        this.maxRecords = 200;
    }
    register(record) {
        this.records.push(record);
        if (this.records.length > this.maxRecords) {
            this.records.shift();
        }
    }
    getRecords() {
        return [...this.records];
    }
}
const boundaryRegistry = (() => {
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
function buildContext(policy) {
    return {
        ...policy.context,
        operation: policy.operation,
        component: policy.component
    };
}
function normalizePolicy(policy) {
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
function recordBoundary(entry) {
    boundaryRegistry.register(entry);
    return entry;
}
function processFailure(error, policy, durationMs) {
    const normalized = normalizePolicy(policy);
    const handledError = handleError(error, normalized);
    const shouldRethrow = normalized.severity === 'fatal' || normalized.rethrow;
    const record = recordBoundary({
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
export async function runWithErrorBoundary(operation, policy) {
    const start = Date.now();
    try {
        const value = await operation();
        return recordBoundary({
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
    }
    catch (error) {
        return processFailure(error, policy, Date.now() - start);
    }
}
export function handleModuleError(error, policy) {
    return processFailure(error, policy, 0);
}
export function getErrorBoundaryRecords() {
    return boundaryRegistry.getRecords();
}
//# sourceMappingURL=ErrorHandlingPolicy.js.map