/**
 * Async Coordination Utilities
 *
 * BEST PRACTICE: Use these utilities instead of setTimeout delays for async coordination.
 *
 * These helpers provide proper event-based and promise-based coordination,
 * eliminating the need for arbitrary setTimeout delays.
 */
/**
 * Wait for a DOM or window event to fire
 *
 * @param eventName - Name of the event to wait for
 * @param options - Options including timeout and target element
 * @returns Promise that resolves when event fires or timeout
 *
 * @example
 * // Wait for TabManager to initialize
 * await waitForEvent('tabManager:initialized', { timeout: 5000 });
 */
export function waitForEvent(eventName, options = {}) {
    const { timeout = 5000, target = typeof document !== 'undefined' ? document : null } = options;
    return new Promise((resolve, reject) => {
        if (!target) {
            resolve();
            return;
        }
        let resolved = false;
        const timeoutId = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                target.removeEventListener(eventName, handler);
                reject(new Error(`Timeout waiting for event: ${eventName}`));
            }
        }, timeout);
        const handler = () => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeoutId);
                target.removeEventListener(eventName, handler);
                resolve();
            }
        };
        target.addEventListener(eventName, handler, { once: true });
    });
}
/**
 * Wait for a condition to become true
 *
 * @param checkFn - Function that returns true when condition is met
 * @param options - Options including timeout and interval
 * @returns Promise that resolves when condition is true or timeout
 *
 * @example
 * // Wait for TabManager to be ready
 * await waitForCondition(() => window.tabContextManager?.getActiveTab !== undefined);
 */
export function waitForCondition(checkFn, options = {}) {
    const { timeout = 5000, interval = 100 } = options;
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const check = () => {
            if (checkFn()) {
                resolve();
                return;
            }
            if (Date.now() - startTime >= timeout) {
                reject(new Error('Timeout waiting for condition'));
                return;
            }
            setTimeout(check, interval);
        };
        // Check immediately
        if (checkFn()) {
            resolve();
            return;
        }
        // Then check periodically
        setTimeout(check, interval);
    });
}
/**
 * Wait for a dependency to be ready
 *
 * @param dependency - Object with isReady() method or getter
 * @param options - Options including timeout
 * @returns Promise that resolves when dependency is ready
 *
 * @example
 * // Wait for communities to be initialized
 * await waitForDependency({
 *   isReady: () => getActiveCommunities().length > 0
 * });
 */
export function waitForDependency(dependency, options = {}) {
    const { timeout = 5000, interval = 100 } = options;
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const check = async () => {
            if (dependency.isReady()) {
                if (dependency.onReady) {
                    await dependency.onReady();
                }
                resolve();
                return;
            }
            if (Date.now() - startTime >= timeout) {
                reject(new Error('Timeout waiting for dependency'));
                return;
            }
            setTimeout(check, interval);
        };
        // Check immediately
        if (dependency.isReady()) {
            if (dependency.onReady) {
                const result = dependency.onReady();
                if (result instanceof Promise) {
                    result.then(() => resolve()).catch(reject);
                }
                else {
                    resolve();
                }
            }
            else {
                resolve();
            }
            return;
        }
        // Then check periodically
        setTimeout(check, interval);
    });
}
/**
 * Coordinate multiple dependencies
 *
 * @param dependencies - Array of dependency checkers
 * @param options - Options including timeout
 * @returns Promise that resolves when all dependencies are ready
 *
 * @example
 * // Wait for multiple dependencies
 * await coordinateDependencies([
 *   { isReady: () => window.tabContextManager !== undefined },
 *   { isReady: () => getActiveCommunities().length > 0 }
 * ]);
 */
export async function coordinateDependencies(dependencies, options = {}) {
    const { timeout = 5000 } = options;
    await Promise.all(dependencies.map(dep => waitForDependency(dep, { timeout })));
}
//# sourceMappingURL=AsyncCoordination.js.map