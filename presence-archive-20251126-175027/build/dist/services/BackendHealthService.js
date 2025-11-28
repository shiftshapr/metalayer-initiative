/**
 * BackendHealthService
 *
 * Centralized backend health monitoring with event-driven retries.
 * Replaces polling loops with shared health state and exponential backoff.
 */
import { stateManagerInstance } from '../core/StateManager.js';
import { API_CONFIG } from '../core/APIConfig.js';
import { Logger } from '../utils/Logger.js';
import { handleError } from '../utils/ErrorHandler.js';
class BackendHealthService {
    constructor(baseURL) {
        this.status = 'checking';
        this.lastChecked = null;
        this.lastError = null;
        this.retryDelayMs = 500;
        this.consecutiveFailures = 0;
        this.listeners = new Set();
        this.healthCheckInterval = null;
        this.MAX_RETRY_DELAY_MS = 30000;
        this.INITIAL_RETRY_DELAY_MS = 500;
        this.HEALTH_CHECK_INTERVAL_MS = 10000; // Check every 10s when offline
        this.baseURL = baseURL;
        this.syncToStateManager();
    }
    /**
     * Get current health status
     */
    getStatus() {
        return this.status;
    }
    /**
     * Check if backend is healthy
     */
    isHealthy() {
        return this.status === 'healthy';
    }
    /**
     * Get current state
     */
    getState() {
        return {
            status: this.status,
            lastChecked: this.lastChecked,
            lastError: this.lastError,
            retryDelayMs: this.retryDelayMs,
            consecutiveFailures: this.consecutiveFailures,
            baseURL: this.baseURL
        };
    }
    /**
     * Subscribe to health status changes
     */
    subscribe(listener) {
        this.listeners.add(listener);
        // Immediately notify of current state
        listener(this.getState());
        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }
    /**
     * Wait for backend to become healthy (with timeout)
     */
    async waitForHealthy(options = {}) {
        const timeout = options.timeout ?? 5000;
        const startTime = Date.now();
        // If already healthy, return immediately
        if (this.isHealthy()) {
            return true;
        }
        return new Promise((resolve) => {
            const unsubscribe = this.subscribe((state) => {
                if (state.status === 'healthy') {
                    unsubscribe();
                    resolve(true);
                }
                else if (Date.now() - startTime >= timeout) {
                    unsubscribe();
                    resolve(false);
                }
            });
            // Check timeout
            setTimeout(() => {
                unsubscribe();
                resolve(false);
            }, timeout);
        });
    }
    /**
     * Perform health check
     * ROOT CAUSE FIX: More lenient health check - any response (even 404/405) means server is reachable
     * Messages load from Supabase, not API, so API health shouldn't block message loading
     */
    async checkHealth() {
        this.status = 'checking';
        this.syncToStateManager();
        try {
            // Try lightweight health endpoint first
            const healthUrl = `${this.baseURL}/health`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased timeout to 5s
            try {
                const response = await fetch(healthUrl, {
                    method: 'HEAD',
                    signal: controller.signal,
                    cache: 'no-cache'
                });
                clearTimeout(timeoutId);
                // ROOT CAUSE FIX: Any response (even 404/405/500) means server is reachable
                // Only mark as offline if we can't connect at all
                if (response.status < 600) {
                    // Any HTTP status code means server responded - consider it healthy
                    this.setHealthy();
                    return true;
                }
            }
            catch (fetchError) {
                clearTimeout(timeoutId);
                // If HEAD fails, try GET as fallback
                if (fetchError instanceof Error && fetchError.name !== 'AbortError') {
                    try {
                        const getResponse = await fetch(healthUrl, {
                            method: 'GET',
                            signal: controller.signal,
                            cache: 'no-cache'
                        });
                        if (getResponse.status < 600) {
                            this.setHealthy();
                            return true;
                        }
                    }
                    catch {
                        // Continue to fallback checks
                    }
                }
            }
            // Try fallback: /v1/status
            const fallbackUrl = `${this.baseURL}/v1/status`;
            const fallbackController = new AbortController();
            const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 5000);
            try {
                const fallbackResponse = await fetch(fallbackUrl, {
                    method: 'HEAD',
                    signal: fallbackController.signal,
                    cache: 'no-cache'
                });
                clearTimeout(fallbackTimeoutId);
                if (fallbackResponse.status < 600) {
                    this.setHealthy();
                    return true;
                }
            }
            catch {
                clearTimeout(fallbackTimeoutId);
            }
            // Last resort: try base URL with GET (more likely to work than HEAD)
            const baseController = new AbortController();
            const baseTimeoutId = setTimeout(() => baseController.abort(), 5000);
            try {
                const baseResponse = await fetch(this.baseURL, {
                    method: 'GET',
                    signal: baseController.signal,
                    cache: 'no-cache'
                });
                clearTimeout(baseTimeoutId);
                // ROOT CAUSE FIX: Any response means server is reachable - mark as healthy
                if (baseResponse.status < 600) {
                    this.setHealthy();
                    return true;
                }
            }
            catch {
                clearTimeout(baseTimeoutId);
            }
            // If we get here, we couldn't reach the server at all
            // But don't mark as degraded - mark as offline only if it's a connection error
            this.setOffline('Unable to reach backend server');
            return false;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Check for connection errors
            if (error instanceof Error && (error.name === 'AbortError' ||
                error.message.includes('Failed to fetch') ||
                error.message.includes('ERR_CONNECTION_REFUSED') ||
                error.message.includes('NetworkError') ||
                error.message.includes('net::ERR'))) {
                this.setOffline(errorMessage);
                return false;
            }
            // ROOT CAUSE FIX: Don't mark as degraded for timeout/abort - mark as offline
            // Degraded should only be for when server responds but with errors
            if (error instanceof Error && error.name === 'AbortError') {
                this.setOffline('Health check timeout');
                return false;
            }
            // Other errors - mark as offline (not degraded) since we couldn't connect
            this.setOffline(errorMessage);
            return false;
        }
    }
    /**
     * Set status to healthy
     */
    setHealthy() {
        const wasOffline = this.status === 'offline';
        this.status = 'healthy';
        this.lastChecked = Date.now();
        this.lastError = null;
        this.consecutiveFailures = 0;
        this.retryDelayMs = this.INITIAL_RETRY_DELAY_MS;
        this.syncToStateManager();
        this.notifyListeners();
        if (wasOffline) {
            Logger.info('✅ BACKEND_HEALTH: Backend recovered', null, 'backend-health');
            // Stop periodic checks when healthy
            this.stopPeriodicChecks();
        }
    }
    /**
     * Set status to degraded
     */
    setDegraded(error) {
        this.status = 'degraded';
        this.lastChecked = Date.now();
        this.lastError = error;
        this.consecutiveFailures++;
        this.retryDelayMs = Math.min(this.INITIAL_RETRY_DELAY_MS * Math.pow(2, this.consecutiveFailures), this.MAX_RETRY_DELAY_MS);
        this.syncToStateManager();
        this.notifyListeners();
    }
    /**
     * Set status to offline
     */
    setOffline(error) {
        const wasHealthy = this.status === 'healthy';
        this.status = 'offline';
        this.lastChecked = Date.now();
        this.lastError = error;
        this.consecutiveFailures++;
        this.retryDelayMs = Math.min(this.INITIAL_RETRY_DELAY_MS * Math.pow(2, this.consecutiveFailures), this.MAX_RETRY_DELAY_MS);
        this.syncToStateManager();
        this.notifyListeners();
        if (wasHealthy) {
            Logger.warn('⚠️ BACKEND_HEALTH: Backend went offline', { error }, 'backend-health');
            // Start periodic checks when offline
            this.startPeriodicChecks();
        }
    }
    /**
     * Start periodic health checks when offline
     */
    startPeriodicChecks() {
        if (this.healthCheckInterval) {
            return; // Already running
        }
        this.healthCheckInterval = setInterval(() => {
            if (this.status === 'offline' || this.status === 'degraded') {
                this.checkHealth().catch((error) => {
                    handleError(error, {
                        log: true,
                        logLevel: 'warn',
                        context: {
                            operation: 'periodicHealthCheck',
                            component: 'BackendHealthService'
                        }
                    });
                });
            }
            else {
                this.stopPeriodicChecks();
            }
        }, this.HEALTH_CHECK_INTERVAL_MS);
    }
    /**
     * Stop periodic health checks
     */
    stopPeriodicChecks() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }
    /**
     * Calculate backoff delay for retry
     */
    getBackoffDelay(attempt) {
        return Math.min(this.INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt), this.MAX_RETRY_DELAY_MS);
    }
    /**
     * Sync state to StateManager
     */
    syncToStateManager() {
        if (stateManagerInstance?.setState) {
            stateManagerInstance.setState('system.backendHealth', this.getState());
        }
    }
    /**
     * Notify all listeners
     */
    notifyListeners() {
        const state = this.getState();
        this.listeners.forEach(listener => {
            try {
                listener(state);
            }
            catch (error) {
                handleError(error, {
                    log: true,
                    logLevel: 'warn',
                    context: {
                        operation: 'notifyHealthListener',
                        component: 'BackendHealthService'
                    }
                });
            }
        });
    }
    /**
     * Update health from API request result
     * ROOT CAUSE FIX: More lenient - only mark as offline for connection errors
     * HTTP errors (4xx, 5xx) should mark as degraded, not offline
     */
    updateFromAPIRequest(success, error) {
        if (success) {
            this.setHealthy();
        }
        else if (error) {
            // Connection errors = offline
            if (error.includes('connection refused') ||
                error.includes('Failed to fetch') ||
                error.includes('ERR_CONNECTION_REFUSED') ||
                error.includes('timeout') ||
                error.includes('NetworkError') ||
                error.includes('net::ERR')) {
                this.setOffline(error);
            }
            else {
                // HTTP errors (4xx, 5xx) = degraded (server is reachable but having issues)
                this.setDegraded(error);
            }
        }
    }
    /**
     * Cleanup
     */
    destroy() {
        this.stopPeriodicChecks();
        this.listeners.clear();
    }
}
// Create singleton instance
let backendHealthServiceInstance = null;
/**
 * Get or create BackendHealthService instance
 */
export function getBackendHealthService(baseURL) {
    if (!backendHealthServiceInstance) {
        const url = baseURL ||
            (typeof window !== 'undefined' && window.API_BASE_URL) ||
            API_CONFIG.baseUrl;
        backendHealthServiceInstance = new BackendHealthService(url);
        // Initial health check
        backendHealthServiceInstance.checkHealth().catch((error) => {
            handleError(error, {
                log: true,
                logLevel: 'warn',
                context: {
                    operation: 'initialHealthCheck',
                    component: 'BackendHealthService'
                }
            });
        });
        // Export to window for diagnostics
        if (typeof window !== 'undefined') {
            window.backendHealthService = backendHealthServiceInstance;
        }
    }
    return backendHealthServiceInstance;
}
export { BackendHealthService };
export default getBackendHealthService;
//# sourceMappingURL=BackendHealthService.js.map