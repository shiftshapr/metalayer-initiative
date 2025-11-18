/**
 * USER PREFERENCES MANAGER - TypeScript Version
 * Unified preference management system - Single source of truth for all user preferences
 *
 * Handles:
 * - Loading preferences (Chrome storage → Database fallback)
 * - Saving preferences (Chrome storage + Database)
 * - Event emission (EventBus + DOM events)
 * - Error handling and retry logic
 * - Data validation and integrity
 *
 * Based on: PREFERENCE_MANAGEMENT_PLAN.md
 */
type PreferenceKey = 'theme' | 'auraColor' | 'auraIntensity' | 'isVisible' | 'globalAvailability' | 'headline' | 'displayName';
type PreferenceValue = string | number | boolean;
type Theme = 'light' | 'dark' | 'auto';
type Availability = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';
interface Preferences {
    theme: Theme;
    auraColor: string;
    auraIntensity: number;
    isVisible: boolean;
    globalAvailability: Availability;
    headline: string;
    displayName: string;
}
interface SaveOptions {
    skipDatabase?: boolean;
    batch?: boolean;
}
/**
 * USER PREFERENCES MANAGER
 * Unified preference management system - Single source of truth for all user preferences
 *
 * Handles:
 * - Loading preferences (Chrome storage → Database fallback)
 * - Saving preferences (Chrome storage + Database)
 * - Event emission (EventBus + DOM events)
 * - Error handling and retry logic
 * - Data validation and integrity
 *
 * Based on: PREFERENCE_MANAGEMENT_PLAN.md
 */
export declare class UserPreferencesManager {
    private userId;
    private preferences;
    private isInitialized;
    private isLoading;
    private isSaving;
    private metrics;
    private retryQueue;
    private retryInterval;
    private batchQueue;
    private batchTimeout;
    private readonly batchDelay;
    private isOnline;
    private offlineListeners;
    private readonly schema;
    constructor();
    /**
     * Initialize preferences manager
     * Must be called after user authentication
     */
    initialize(userId: string): Promise<unknown>;
    /**
     * Load all preferences (Chrome storage → Database fallback)
     */
    loadAllPreferences(): Promise<Partial<Preferences>>;
    /**
     * Load preferences from Chrome storage
     */
    loadFromChromeStorage(): Promise<Record<string, any>>;
    /**
     * Load preferences from database (COLUMNS ONLY - no JSON fallback)
     */
    loadFromDatabase(): Promise<Record<string, any>>;
    /**
     * Get a single preference
     */
    getPreference(key: PreferenceKey | string): Promise<PreferenceValue>;
    /**
     * Save a single preference (supports batching)
     */
    savePreference(key: PreferenceKey, value: PreferenceValue, options?: SaveOptions): Promise<boolean>;
    /**
     * Save multiple preferences in a batch
     */
    savePreferences(preferences: Partial<Preferences>, options?: SaveOptions): Promise<Record<string, boolean>>;
    /**
     * Add preference to batch queue
     */
    addToBatch(key: PreferenceKey, value: PreferenceValue): void;
    /**
     * Flush batch queue to database
     */
    flushBatch(): Promise<void>;
    /**
     * Save batch to database
     */
    saveBatchToDatabase(preferences: Record<string, any>): Promise<any>;
    /**
     * Save to database immediately (no batching)
     * FIX: Properly await the save to ensure it completes
     */
    saveToDatabaseImmediate(key: PreferenceKey, value: PreferenceValue): Promise<any>;
    /**
     * Save preference to database with retry logic
     */
    saveToDatabase(key: PreferenceKey, value: PreferenceValue): Promise<any>;
    /**
     * Validate preference value
     */
    validatePreference(key: PreferenceKey | string, value: PreferenceValue): boolean;
    /**
     * Update window.currentUser with current preferences
     */
    updateCurrentUser(): void;
    /**
     * Apply preferences to UI immediately after loading
     */
    applyPreferencesToUI(): void;
    /**
     * Queue failed save for retry
     */
    queueForRetry(key: PreferenceKey, value: PreferenceValue): void;
    /**
     * Start retry processor
     */
    startRetryProcessor(): void;
    /**
     * Setup offline detection
     */
    setupOfflineDetection(): void;
    /**
     * Handle going online
     */
    handleOnline(): void;
    /**
     * Handle going offline
     */
    handleOffline(): void;
    /**
     * Add offline status listener
     */
    addOfflineListener(listener: (status: {
        online: boolean;
    }) => void): void;
    /**
     * Remove offline status listener
     */
    removeOfflineListener(listener: (status: {
        online: boolean;
    }) => void): void;
    /**
     * Process retry queue (only if online)
     */
    processRetryQueue(): Promise<void>;
    /**
     * Emit preference changed event
     */
    emitPreferenceChanged(key: PreferenceKey, value: PreferenceValue, oldValue: PreferenceValue | undefined, source?: string): void;
    /**
     * Emit preference loaded event
     */
    emitPreferenceLoaded(): void;
    /**
     * Emit preference save failed event
     */
    emitPreferenceSaveFailed(key: PreferenceKey, value: PreferenceValue, error: Error): void;
    /**
     * Log operation
     */
    log(operation: string, status: string, duration: number, error?: Error | null | undefined): void;
    /**
     * Get metrics
     */
    getMetrics(): {
        retryQueueSize: number;
        isInitialized: boolean;
        isLoading: boolean;
        isSaving: boolean;
        loads: {
            success: number;
            failure: number;
            totalTime: number;
        };
        saves: {
            success: number;
            failure: number;
            totalTime: number;
        };
        retries: {
            success: number;
            failure: number;
        };
        errors: Array<{
            type: string;
            key?: string;
            error: string;
            timestamp: number;
        }>;
    };
    /**
     * Validate preference integrity
     */
    validateIntegrity(): Promise<boolean>;
}
declare const userPreferencesManager: UserPreferencesManager;
export default userPreferencesManager;
//# sourceMappingURL=UserPreferencesManager.d.ts.map