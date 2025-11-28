/**
 * BackendHealthService
 *
 * Centralized backend health monitoring with event-driven retries.
 * Replaces polling loops with shared health state and exponential backoff.
 */
export type BackendHealthStatus = 'healthy' | 'degraded' | 'offline' | 'checking';
export interface BackendHealthState {
    status: BackendHealthStatus;
    lastChecked: number | null;
    lastError: string | null;
    retryDelayMs: number;
    consecutiveFailures: number;
    baseURL: string;
}
type HealthListener = (state: BackendHealthState) => void;
declare class BackendHealthService {
    private status;
    private lastChecked;
    private lastError;
    private retryDelayMs;
    private consecutiveFailures;
    private baseURL;
    private listeners;
    private healthCheckInterval;
    private readonly MAX_RETRY_DELAY_MS;
    private readonly INITIAL_RETRY_DELAY_MS;
    private readonly HEALTH_CHECK_INTERVAL_MS;
    constructor(baseURL: string);
    /**
     * Get current health status
     */
    getStatus(): BackendHealthStatus;
    /**
     * Check if backend is healthy
     */
    isHealthy(): boolean;
    /**
     * Get current state
     */
    getState(): BackendHealthState;
    /**
     * Subscribe to health status changes
     */
    subscribe(listener: HealthListener): () => void;
    /**
     * Wait for backend to become healthy (with timeout)
     */
    waitForHealthy(options?: {
        timeout?: number;
    }): Promise<boolean>;
    /**
     * Perform health check
     * ROOT CAUSE FIX: More lenient health check - any response (even 404/405) means server is reachable
     * Messages load from Supabase, not API, so API health shouldn't block message loading
     */
    checkHealth(): Promise<boolean>;
    /**
     * Set status to healthy
     */
    private setHealthy;
    /**
     * Set status to degraded
     */
    private setDegraded;
    /**
     * Set status to offline
     */
    private setOffline;
    /**
     * Start periodic health checks when offline
     */
    private startPeriodicChecks;
    /**
     * Stop periodic health checks
     */
    private stopPeriodicChecks;
    /**
     * Calculate backoff delay for retry
     */
    getBackoffDelay(attempt: number): number;
    /**
     * Sync state to StateManager
     */
    private syncToStateManager;
    /**
     * Notify all listeners
     */
    private notifyListeners;
    /**
     * Update health from API request result
     * ROOT CAUSE FIX: More lenient - only mark as offline for connection errors
     * HTTP errors (4xx, 5xx) should mark as degraded, not offline
     */
    updateFromAPIRequest(success: boolean, error?: string): void;
    /**
     * Cleanup
     */
    destroy(): void;
}
/**
 * Get or create BackendHealthService instance
 */
export declare function getBackendHealthService(baseURL?: string): BackendHealthService;
export { BackendHealthService };
export default getBackendHealthService;
//# sourceMappingURL=BackendHealthService.d.ts.map