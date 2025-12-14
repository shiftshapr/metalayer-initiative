/**
 * Async Coordination Utility
 * Manages asynchronous operations with coordination and timeouts
 */

export interface AsyncOperationOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  description?: string;
}

export interface AsyncOperationResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  duration: number;
  retries: number;
}

export class AsyncCoordination {
  private operations: Map<string, { promise: Promise<any>; resolve: Function; reject: Function; timeoutId?: number }> = new Map();

  /**
   * Execute an async operation with coordination
   */
  async execute<T>(
    operationId: string,
    operation: () => Promise<T>,
    options: AsyncOperationOptions = {}
  ): Promise<AsyncOperationResult<T>> {
    const startTime = Date.now();
    const {
      timeout = 30000,
      retries = 0,
      retryDelay = 1000,
      description = operationId
    } = options;

    let lastError: Error | null = null;
    let attempts = 0;

    while (attempts <= retries) {
      try {
        // Check if operation is already in progress
        if (this.operations.has(operationId)) {
          console.warn(`AsyncCoordination: Operation ${operationId} already in progress, waiting...`);
          const existing = await this.operations.get(operationId)!.promise;
          return {
            success: true,
            result: existing,
            duration: Date.now() - startTime,
            retries: attempts
          };
        }

        // Create new operation promise
        let resolveOperation: Function;
        let rejectOperation: Function;
        const operationPromise = new Promise<T>((resolve, reject) => {
          resolveOperation = resolve;
          rejectOperation = reject;
        });

        // Set timeout
        const timeoutId = setTimeout(() => {
          if (this.operations.has(operationId)) {
            const operationData = this.operations.get(operationId)!;
            operationData.reject(new Error(`Operation ${description} timed out after ${timeout}ms`));
            this.operations.delete(operationId);
          }
        }, timeout);

        this.operations.set(operationId, {
          promise: operationPromise,
          resolve: resolveOperation!,
          reject: rejectOperation!,
          timeoutId
        });

        // Execute the operation
        const result = await operation();

        // Clean up and resolve
        if (this.operations.has(operationId)) {
          const operationData = this.operations.get(operationId)!;
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

      } catch (error) {
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
  async waitFor<T>(operationId: string, timeout = 30000): Promise<T> {
    if (this.operations.has(operationId)) {
      const operationData = this.operations.get(operationId)!;
      return Promise.race([
        operationData.promise,
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Wait for operation ${operationId} timed out`)), timeout);
        })
      ]);
    }

    throw new Error(`Operation ${operationId} not found`);
  }

  /**
   * Cancel an operation
   */
  cancel(operationId: string): boolean {
    if (this.operations.has(operationId)) {
      const operationData = this.operations.get(operationId)!;
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
  isInProgress(operationId: string): boolean {
    return this.operations.has(operationId);
  }

  /**
   * Get active operations count
   */
  getActiveCount(): number {
    return this.operations.size;
  }

  /**
   * Wait for a condition to be met
   */
  async waitForCondition(
    condition: () => boolean | Promise<boolean>,
    timeout = 30000,
    interval = 100
  ): Promise<void> {
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
        } catch (error) {
          reject(error);
        }
      };

      checkCondition();
    });
  }
}

// Export singleton instance
let asyncCoordinationInstance: AsyncCoordination | null = null;

export function createAsyncCoordination(): AsyncCoordination {
  if (!asyncCoordinationInstance) {
    asyncCoordinationInstance = new AsyncCoordination();
  }
  return asyncCoordinationInstance;
}

// Export default singleton for convenience
export const asyncCoordination = createAsyncCoordination();

// Export individual functions for convenience
export const waitForCondition = asyncCoordination.waitForCondition.bind(asyncCoordination);