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
export declare function waitForEvent(eventName: string, options?: {
    timeout?: number;
    target?: EventTarget;
}): Promise<void>;
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
export declare function waitForCondition(checkFn: () => boolean, options?: {
    timeout?: number;
    interval?: number;
}): Promise<void>;
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
export declare function waitForDependency(dependency: {
    isReady: () => boolean;
    onReady?: () => Promise<void> | void;
}, options?: {
    timeout?: number;
    interval?: number;
}): Promise<void>;
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
export declare function coordinateDependencies(dependencies: Array<{
    isReady: () => boolean;
}>, options?: {
    timeout?: number;
}): Promise<void>;
//# sourceMappingURL=AsyncCoordination.d.ts.map