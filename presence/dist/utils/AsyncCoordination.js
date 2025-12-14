/**
 * Async Coordination Utility
 * Manages asynchronous operations with coordination and timeouts
 */
export class AsyncCoordination {
    constructor() {
        this.operations = new Map();
    }
    /**
     * Execute an async operation with coordination
     */
    async execute(operationId, operation, options = {}) {
        const startTime = Date.now();
        const { timeout = 30000, retries = 0, retryDelay = 1000, description = operationId } = options;
        let lastError = null;
        let attempts = 0;
        while (attempts <= retries) {
            try {
                // Check if operation is already in progress
                if (this.operations.has(operationId)) {
                    console.warn(`AsyncCoordination: Operation ${operationId} already in progress, waiting...`);
                    const existing = await this.operations.get(operationId).promise;
                    return {
                        success: true,
                        result: existing,
                        duration: Date.now() - startTime,
                        retries: attempts
                    };
                }
                // Create new operation promise
                let resolveOperation;
                let rejectOperation;
                const operationPromise = new Promise((resolve, reject) => {
                    resolveOperation = resolve;
                    rejectOperation = reject;
                });
                // Set timeout
                const timeoutId = setTimeout(() => {
                    if (this.operations.has(operationId)) {
                        const operationData = this.operations.get(operationId);
                        operationData.reject(new Error(`Operation ${description} timed out after ${timeout}ms`));
                        this.operations.delete(operationId);
                    }
                }, timeout);
                this.operations.set(operationId, {
                    promise: operationPromise,
                    resolve: resolveOperation,
                    reject: rejectOperation,
                    timeoutId
                });
                // Execute the operation
                const result = await operation();
                // Clean up and resolve
                if (this.operations.has(operationId)) {
                    const operationData = this.operations.get(operationId);
                    clearTimeout(operationData.timeoutId);
                    operationData.resolve(result);
                    this.operations.delete(operationId);
                }
                return {
                    success: true,
                    result,
                    duration: Date.now() - startTime,
                    retries: attempts
                };
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                attempts++;
                if (attempts <= retries) {
                    console.warn(`AsyncCoordination: Operation ${description} failed (attempt ${attempts}/${retries + 1}), retrying in ${retryDelay}ms...`, error);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
        }
        // All retries exhausted
        return {
            success: false,
            error: lastError || new Error(`Operation ${description} failed after ${retries + 1} attempts`),
            duration: Date.now() - startTime,
            retries: attempts - 1
        };
    }
    /**
     * Wait for an operation to complete
     */
    async waitFor(operationId, timeout = 30000) {
        if (this.operations.has(operationId)) {
            const operationData = this.operations.get(operationId);
            return Promise.race([
                operationData.promise,
                new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`Wait for operation ${operationId} timed out`)), timeout);
                })
            ]);
        }
        throw new Error(`Operation ${operationId} not found`);
    }
    /**
     * Cancel an operation
     */
    cancel(operationId) {
        if (this.operations.has(operationId)) {
            const operationData = this.operations.get(operationId);
            clearTimeout(operationData.timeoutId);
            operationData.reject(new Error(`Operation ${operationId} was cancelled`));
            this.operations.delete(operationId);
            return true;
        }
        return false;
    }
    /**
     * Check if operation is in progress
     */
    isInProgress(operationId) {
        return this.operations.has(operationId);
    }
    /**
     * Get active operations count
     */
    getActiveCount() {
        return this.operations.size;
    }
    /**
     * Wait for a condition to be met
     */
    async waitForCondition(condition, timeout = 30000, interval = 100) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkCondition = async () => {
                try {
                    const result = await condition();
                    if (result) {
                        resolve();
                        return;
                    }
                    if (Date.now() - startTime > timeout) {
                        reject(new Error('Condition not met within timeout'));
                        return;
                    }
                    setTimeout(checkCondition, interval);
                }
                catch (error) {
                    reject(error);
                }
            };
            checkCondition();
        });
    }
}
// Export singleton instance
let asyncCoordinationInstance = null;
export function createAsyncCoordination() {
    if (!asyncCoordinationInstance) {
        asyncCoordinationInstance = new AsyncCoordination();
    }
    return asyncCoordinationInstance;
}
// Export default singleton for convenience
export const asyncCoordination = createAsyncCoordination();
// Export individual functions for convenience
export const waitForCondition = asyncCoordination.waitForCondition.bind(asyncCoordination);
//# sourceMappingURL=AsyncCoordination.js.map