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
// Type definitions
import { handleError } from './ErrorHandler.js';
import { Logger } from './Logger.js';
import { getBackendHealthService } from '../services/BackendHealthService.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { api } from '../features/APIModule.js';
const setPreferenceValue = (target, key, value) => {
    target[key] = value;
};
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
export class UserPreferencesManager {
    constructor() {
        this.userId = null;
        this.preferences = {};
        this.isInitialized = false;
        this.isLoading = false;
        this.isSaving = false;
        this.retryQueue = [];
        this.retryInterval = null;
        this.batchQueue = [];
        this.batchTimeout = null;
        this.batchDelay = 500;
        this.offlineListeners = [];
        this._defaultValues = {};
        // Metrics for monitoring
        this.metrics = {
            loads: { success: 0, failure: 0, totalTime: 0 },
            saves: { success: 0, failure: 0, totalTime: 0 },
            retries: { success: 0, failure: 0 },
            errors: []
        };
        // Offline detection
        this.isOnline = navigator.onLine !== false;
        this.setupOfflineDetection();
        // Preference schema (all as database columns)
        const schema = {
            theme: {
                chromeKey: 'theme',
                dbColumn: 'theme',
                defaultValue: 'light',
                validator: (value) => typeof value === 'string' && ['light', 'dark', 'auto'].includes(value),
                uiComponents: ['profile', 'settings', 'all']
            },
            auraColor: {
                chromeKey: 'auraColor',
                dbColumn: 'aura_color',
                defaultValue: '#98d416',
                validator: (value) => typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/i.test(value),
                uiComponents: ['avatars', 'profile', 'settings']
            },
            auraIntensity: {
                chromeKey: 'auraIntensity',
                dbColumn: 'aura_intensity',
                defaultValue: 0.5,
                validator: (value) => typeof value === 'number' && value >= 0 && value <= 1,
                uiComponents: ['avatars', 'settings']
            },
            isVisible: {
                chromeKey: 'visibilityEnabled',
                dbColumn: 'is_visible',
                defaultValue: true,
                validator: (value) => typeof value === 'boolean',
                uiComponents: ['avatars', 'profile', 'settings', 'visibility']
            },
            globalAvailability: {
                chromeKey: 'availability',
                dbColumn: 'global_availability',
                defaultValue: 'AVAILABLE',
                validator: (value) => typeof value === 'string' && ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(value),
                uiComponents: ['profile', 'settings', 'visibility']
            },
            headline: {
                chromeKey: 'settingsHeadline',
                dbColumn: 'headline',
                defaultValue: '',
                validator: (value) => value === '' || (typeof value === 'string' && value.length >= 20 && value.length <= 1000),
                uiComponents: ['profile', 'settings']
            },
            displayName: {
                chromeKey: 'displayName',
                dbColumn: 'displayName', // FIX: Match Prisma schema (camelCase, not snake_case)
                defaultValue: '',
                validator: (value) => value === '' || (typeof value === 'string' && value.length >= 4 && value.length <= 16),
                uiComponents: ['profile', 'settings', 'avatars']
            },
            tabConfiguration: {
                chromeKey: 'tabConfiguration',
                dbColumn: 'tab_configuration', // Stored as JSON string in database
                defaultValue: '',
                validator: (value) => typeof value === 'string', // Accept any JSON string
                uiComponents: ['tab-manager', 'settings']
            },
            visibilityTraceLimit: {
                chromeKey: 'visibilityTraceLimit',
                dbColumn: 'visibility_trace_limit',
                defaultValue: 30, // Default: 30 days
                validator: (value) => typeof value === 'number' && (value === -1 || value >= 0),
                uiComponents: ['settings', 'visibility']
            },
            primaryCommunity: {
                chromeKey: 'primaryCommunity',
                dbColumn: 'primary_community_id', // Store in AppUser table
                defaultValue: '',
                validator: (value) => {
                    // UUID v4 format validation
                    if (typeof value !== 'string')
                        return false;
                    if (value === '')
                        return true; // Allow empty string as default
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                    return uuidRegex.test(value);
                },
                uiComponents: ['communities', 'header']
            },
            activeCommunities: {
                chromeKey: 'activeCommunities',
                dbColumn: 'active_communities', // Store as JSON string in AppUser table
                defaultValue: '[]',
                validator: (value) => {
                    // Must be a valid JSON array of UUIDs
                    if (typeof value !== 'string')
                        return false;
                    try {
                        const parsed = JSON.parse(value);
                        if (!Array.isArray(parsed))
                            return false;
                        // Validate all items are UUIDs
                        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                        return parsed.every((item) => typeof item === 'string' && uuidRegex.test(item));
                    }
                    catch {
                        return false;
                    }
                },
                uiComponents: ['communities', 'header']
            }
        };
        this.schema = schema;
        Logger.debug('✅ USER_PREFERENCES_MANAGER: Initialized', null, 'preferences');
    }
    /**
     * Initialize preferences manager
     * Must be called after user authentication
     */
    async initialize(userId) {
        Logger.debug('🔍 USER_PREFERENCES_MANAGER: initialize() called with userId:', userId || 'MISSING', 'preferences');
        Logger.debug('🔍 USER_PREFERENCES_MANAGER: Current isInitialized:', this.isInitialized, 'preferences');
        if (this.isInitialized) {
            Logger.warn('⚠️ USER_PREFERENCES_MANAGER: Already initialized', null, 'preferences');
            return true;
        }
        if (!userId) {
            Logger.warn('⚠️ USER_PREFERENCES_MANAGER: No userId provided, waiting...', 'preferences');
            // TypeScript migration: Use stateManager instead of window.currentUser
            const currentUserFromState = stateManagerInstance.getState('currentUser');
            Logger.debug('🔍 USER_PREFERENCES_MANAGER: Checking stateManager currentUser?.id:', currentUserFromState?.id, 'preferences');
            // Wait for userId with longer timeout and better detection
            return new Promise((resolve) => {
                let attempts = 0;
                const maxAttempts = 50; // 25 seconds (500ms * 50)
                const checkUser = setInterval(() => {
                    attempts++;
                    // TypeScript migration: Use stateManager instead of window.currentUser
                    const currentUser = stateManagerInstance.getState('currentUser');
                    const currentUserId = currentUser?.id;
                    Logger.debug(`🔍 USER_PREFERENCES_MANAGER: Attempt ${attempts}/${maxAttempts}, checking for userId:`, currentUserId || 'NOT FOUND', 'preferences');
                    if (currentUserId) {
                        clearInterval(checkUser);
                        Logger.debug(`✅ USER_PREFERENCES_MANAGER: Found userId after ${attempts} attempts: ${currentUserId}`, null, 'preferences');
                        this.initialize(currentUserId).then(resolve);
                        return;
                    }
                    // Log progress every 5 seconds
                    if (attempts % 10 === 0) {
                        Logger.debug(`⏳ USER_PREFERENCES_MANAGER: Waiting for userId... (${attempts}/${maxAttempts})`, null, 'preferences');
                    }
                    if (attempts >= maxAttempts) {
                        clearInterval(checkUser);
                        Logger.warn('⚠️ USER_PREFERENCES_MANAGER: Timeout waiting for userId - will initialize when userId becomes available', null, 'preferences');
                        // Don't fail - just return false, initialization will happen when userId is available
                        resolve(false);
                    }
                }, 500);
            });
        }
        this.userId = userId;
        Logger.debug('🔧 USER_PREFERENCES_MANAGER: Initializing for user:', userId, 'preferences');
        try {
            // Load all preferences
            await this.loadAllPreferences();
            // Start retry queue processor
            this.startRetryProcessor();
            // Emit loaded event
            this.emitPreferenceLoaded();
            this.isInitialized = true;
            Logger.debug('✅ USER_PREFERENCES_MANAGER: Initialization complete', null, 'preferences');
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'UserPreferences'
                }
            });
            ;
            this.metrics.errors.push({ type: 'initialization', error: errorMessage, timestamp: Date.now() });
            return false;
        }
    }
    /**
     * Load all preferences (Chrome storage → Database fallback)
     */
    async loadAllPreferences() {
        if (this.isLoading) {
            Logger.warn('⚠️ USER_PREFERENCES_MANAGER: Already loading, skipping...', 'preferences');
            return;
        }
        this.isLoading = true;
        const startTime = Date.now();
        try {
            Logger.debug('📖 USER_PREFERENCES_MANAGER: Loading all preferences...', null, 'preferences');
            // Load from Chrome storage first (fastest)
            const chromePrefs = await this.loadFromChromeStorage();
            Logger.debug('✅ USER_PREFERENCES_MANAGER: Loaded from Chrome storage:', Object.keys(chromePrefs).length, 'preferences');
            // Load from database for any missing values
            const dbPrefs = await this.loadFromDatabase();
            Logger.debug('✅ USER_PREFERENCES_MANAGER: Loaded from database:', Object.keys(dbPrefs).length, 'preferences');
            // Merge: Chrome storage takes precedence (most recent), database fills gaps
            // Database is authoritative source - Chrome storage is cache
            // ROOT CAUSE FIX: For theme, prioritize Chrome storage > DOM > database > default
            // Chrome storage = extension-specific storage (persists across sessions)
            // DOM = current UI state (preserve what user sees)
            // Database = authoritative source (user's saved preference)
            // Default = last resort
            const mergedPrefs = {};
            const schemaKeys = Object.keys(this.schema);
            for (const prefKey of schemaKeys) {
                const config = this.schema[prefKey];
                const chromeValue = chromePrefs[prefKey];
                const dbValue = dbPrefs[prefKey];
                // ROOT CAUSE FIX: Comprehensive logging for theme resolution
                if (prefKey === 'theme') {
                    Logger.debug('🔍 THEME_RESOLUTION: === THEME RESOLUTION START ===', null, 'preferences');
                    Logger.debug('🔍 THEME_RESOLUTION: Chrome storage theme:', chromeValue !== undefined && chromeValue !== null ? chromeValue : 'NOT SET', 'preferences');
                    Logger.debug('🔍 THEME_RESOLUTION: Database theme:', dbValue !== undefined && dbValue !== null ? dbValue : 'NULL/NOT SET', 'preferences');
                    const currentDomTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
                    Logger.debug('🔍 THEME_RESOLUTION: DOM theme:', currentDomTheme || 'NOT SET', 'preferences');
                    Logger.debug('🔍 THEME_RESOLUTION: Default theme:', config.defaultValue, 'preferences');
                }
                // Special handling for theme: Check multiple sources in priority order
                let finalValue;
                if (chromeValue !== undefined && chromeValue !== null) {
                    // Priority 1: Chrome storage (extension-specific, most recent user preference)
                    finalValue = chromeValue;
                    if (prefKey === 'theme') {
                        Logger.debug('🔍 THEME_RESOLUTION: ✅ RESOLVED: Using Chrome storage theme:', finalValue, 'preferences');
                    }
                }
                else if (prefKey === 'theme') {
                    // Priority 2: Check DOM (preserve current UI state - might be set by ProfileManager on startup)
                    const currentDomTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
                    if (currentDomTheme && ['light', 'dark', 'auto'].includes(currentDomTheme)) {
                        const domTheme = currentDomTheme;
                        finalValue = domTheme;
                        Logger.debug(`🔍 THEME_RESOLUTION: ✅ RESOLVED: Using DOM theme '${currentDomTheme}' (preserving current UI state)`, null, 'preferences');
                        // Cache it in Chrome storage for next time
                        await chrome.storage.local.set({ [config.chromeKey]: currentDomTheme });
                    }
                    else if (dbValue !== undefined && dbValue !== null) {
                        // Priority 3: Database (authoritative source - user's saved preference)
                        finalValue = dbValue;
                        Logger.debug(`🔍 THEME_RESOLUTION: ✅ RESOLVED: Using database theme '${dbValue}'`, null, 'preferences');
                        // Cache it in Chrome storage for next time
                        await chrome.storage.local.set({ [config.chromeKey]: dbValue });
                    }
                    else {
                        // Priority 4: Default (last resort - ONLY for local use, NEVER save to database)
                        finalValue = config.defaultValue;
                        Logger.debug(`🔍 THEME_RESOLUTION: ✅ RESOLVED: Using default theme '${config.defaultValue}' (local only, will not save to database)`, null, 'preferences');
                        // ROOT CAUSE FIX: Mark this as a default value so it doesn't get saved to database
                        // Store in a separate flag to prevent saving defaults
                        this._defaultValues[prefKey] = true;
                    }
                    Logger.debug(`🔍 THEME_RESOLUTION: === THEME RESOLUTION END (finalValue: ${finalValue}) ===`, null, 'preferences');
                }
                else if (dbValue !== undefined && dbValue !== null) {
                    // For non-theme preferences, database is fine as fallback
                    finalValue = dbValue;
                }
                else {
                    finalValue = config.defaultValue;
                }
                setPreferenceValue(mergedPrefs, prefKey, finalValue);
                // If we got a value from database but not Chrome storage, save to Chrome storage (cache)
                if (chromeValue === undefined && dbValue !== undefined && dbValue !== null) {
                    await chrome.storage.local.set({ [config.chromeKey]: dbValue });
                }
            }
            this.preferences = mergedPrefs;
            // Update stateManager currentUser immediately (TypeScript migration)
            this.updateCurrentUser();
            // Apply preferences to UI immediately
            // ROOT CAUSE FIX: Log what theme will be applied before calling applyPreferencesToUI
            if (this.preferences.theme) {
                Logger.debug('🔍 THEME_APPLY: About to apply theme to UI:', this.preferences.theme, 'preferences');
                const currentDomTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
                Logger.debug('🔍 THEME_APPLY: Current DOM theme before apply:', currentDomTheme || 'NOT SET', 'preferences');
            }
            // ROOT CAUSE FIX: Always apply theme during initial load (ProfileManager no longer sets theme on startup)
            // This ensures the correct theme from Chrome storage/Database is applied
            this.applyPreferencesToUI(false); // Always apply theme during initial load
            const duration = Date.now() - startTime;
            this.metrics.loads.success++;
            this.metrics.loads.totalTime += duration;
            this.log('load', 'success', duration);
            return this.preferences;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.metrics.loads.failure++;
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.metrics.errors.push({ type: 'load', error: errorMessage, timestamp: Date.now() });
            this.log('load', 'failure', duration, error instanceof Error ? error : null);
            throw error;
        }
        finally {
            this.isLoading = false;
        }
    }
    /**
     * Load preferences from Chrome storage
     */
    async loadFromChromeStorage() {
        const chromeKeys = Object.values(this.schema).map((config) => config.chromeKey);
        const storageData = (await chrome.storage.local.get(chromeKeys));
        const chromeTheme = storageData['theme'];
        Logger.debug('🔍 THEME_CHROME_LOAD: Chrome storage theme value:', chromeTheme !== undefined && chromeTheme !== null ? chromeTheme : 'NOT SET', 'preferences');
        const prefs = {};
        const schemaEntries = Object.entries(this.schema);
        for (const [prefKey, configEntry] of schemaEntries) {
            const config = configEntry;
            const storedValue = storageData[config.chromeKey];
            if (config.validator(storedValue)) {
                setPreferenceValue(prefs, prefKey, storedValue);
                if (prefKey === 'theme') {
                    Logger.debug('🔍 THEME_CHROME_LOAD: ✅ Theme found in Chrome storage:', storedValue, 'preferences');
                }
            }
            else if (prefKey === 'theme') {
                Logger.debug('🔍 THEME_CHROME_LOAD: ⚠️ Theme NOT SET in Chrome storage', null, 'preferences');
            }
        }
        return prefs;
    }
    /**
     * Load preferences from database (COLUMNS ONLY - no JSON fallback)
     */
    async loadFromDatabase() {
        if (!this.userId || !api) {
            Logger.warn('⚠️ USER_PREFERENCES_MANAGER: Cannot load from database (no userId or API)', null, 'preferences');
            throw new Error('Cannot load preferences: userId or API not available');
        }
        try {
            const apiResponse = await api.request(`/v1/users/${this.userId}`, {
                method: 'GET'
            });
            const response = apiResponse?.data || apiResponse;
            if (!response) {
                throw new Error('Empty response from API');
            }
            const prefs = {};
            const schemaEntries = Object.entries(this.schema);
            for (const [prefKey, config] of schemaEntries) {
                const dbValue = response[config.dbColumn];
                if (config.validator(dbValue)) {
                    setPreferenceValue(prefs, prefKey, dbValue);
                    if (prefKey === 'theme') {
                        Logger.debug('🔍 THEME_DB_LOAD: ✅ Theme found in database:', dbValue, 'preferences');
                    }
                }
                else if (prefKey === 'theme') {
                    Logger.debug('🔍 THEME_DB_LOAD: ⚠️ Theme is NULL in database (will not use default, will check other sources)', null, 'preferences');
                }
                // ROOT CAUSE FIX: Do NOT set default for NULL values - NULL means "not set" and should not be saved back
                // Only use defaults in loadAllPreferences() when all sources are unavailable
            }
            return prefs;
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'UserPreferences'
                }
            });
            ;
            throw error; // Don't silently fail - we need database columns
        }
    }
    /**
     * Get a single preference
     */
    async getPreference(key) {
        if (!this.schema[key]) {
            Logger.warn(`⚠️ USER_PREFERENCES_MANAGER: Unknown preference key: ${key}`, null, 'preferences');
            return null;
        }
        // If not initialized, initialize first
        if (!this.isInitialized) {
            // TypeScript migration: Use stateManager instead of window.currentUser
            const currentUser = stateManagerInstance.getState('currentUser');
            const userId = this.userId || currentUser?.id;
            if (userId) {
                await this.initialize(userId);
            }
        }
        return this.preferences[key] ?? this.schema[key].defaultValue;
    }
    /**
     * Save a single preference (supports batching)
     */
    async savePreference(key, value, options = {}) {
        if (!this.schema[key]) {
            Logger.error(`❌ USER_PREFERENCES_MANAGER: Unknown preference key: ${key}`, null, 'preferences');
            return false;
        }
        const config = this.schema[key];
        const oldValue = this.preferences[key];
        // ROOT CAUSE FIX: Never save default values to database - they're only for local fallback
        if (this._defaultValues[key] && value === config.defaultValue) {
            Logger.debug(`⚠️ USER_PREFERENCES_MANAGER: Skipping save of default value for ${key} (prevents overwriting database with defaults)`, null, 'preferences');
            // Clear the default flag since user is explicitly setting it
            delete this._defaultValues[key];
            // Still update local state and Chrome storage, but skip database
            setPreferenceValue(this.preferences, key, value);
            await chrome.storage.local.set({ [config.chromeKey]: value });
            this.updateCurrentUser();
            return true;
        }
        try {
            // Step 1: Validate
            if (!this.validatePreference(key, value)) {
                Logger.error(`❌ USER_PREFERENCES_MANAGER: Invalid value for ${key}:`, value, 'preferences');
                return false;
            }
            // Step 2: Update local state immediately
            setPreferenceValue(this.preferences, key, value);
            // Step 3: Update Chrome storage (fast, always succeeds)
            await chrome.storage.local.set({ [config.chromeKey]: value });
            Logger.debug(`✅ USER_PREFERENCES_MANAGER: Saved ${key} to Chrome storage`, null, 'preferences');
            // Step 4: Update stateManager currentUser (immediate) - TypeScript migration
            this.updateCurrentUser();
            // Step 5: Emit change event (immediate)
            this.emitPreferenceChanged(key, value, oldValue, 'user');
            // Step 6: Apply to UI immediately (CRITICAL FIX: Update UI after save)
            // ROOT CAUSE FIX: Only apply theme if this is a theme preference change, not other preferences
            // This prevents theme from resetting when saving non-theme preferences (like isVisible) during message loading
            const isThemeChange = key === 'theme';
            if (isThemeChange) {
                this.applyPreferencesToUI();
            }
            // Step 7: Handle database save (with batching support)
            if (!options.skipDatabase) {
                if (options.batch === true || options.batch === undefined) {
                    // Add to batch queue (default behavior)
                    this.addToBatch(key, value);
                }
                else {
                    // Save immediately (no batching) - CRITICAL FIX: Must await to ensure save completes
                    await this.saveToDatabaseImmediate(key, value);
                }
            }
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'UserPreferences'
                }
            });
            ;
            this.metrics.errors.push({ type: 'save', key, error: errorMessage, timestamp: Date.now() });
            this.emitPreferenceSaveFailed(key, value, error instanceof Error ? error : new Error(errorMessage));
            return false;
        }
    }
    /**
     * Save multiple preferences in a batch
     */
    async savePreferences(preferences, options = {}) {
        Logger.debug(`📦 USER_PREFERENCES_MANAGER: Batching ${Object.keys(preferences).length} preferences`, null, 'preferences');
        const results = {};
        const oldValues = {};
        // Step 1: Validate all preferences
        for (const [key, value] of Object.entries(preferences)) {
            const prefKey = key;
            if (value === undefined) {
                results[prefKey] = false;
                continue;
            }
            if (!this.schema[prefKey]) {
                Logger.error(`❌ USER_PREFERENCES_MANAGER: Unknown preference key: ${key}`, null, 'preferences');
                results[prefKey] = false;
                continue;
            }
            if (!this.validatePreference(prefKey, value)) {
                Logger.error(`❌ USER_PREFERENCES_MANAGER: Invalid value for ${key}:`, value, 'preferences');
                results[prefKey] = false;
                continue;
            }
            oldValues[prefKey] = this.preferences[prefKey];
        }
        // Step 2: Update local state immediately
        const chromeUpdates = {};
        for (const [key, value] of Object.entries(preferences)) {
            const prefKey = key;
            if (results[prefKey] === false || value === undefined)
                continue;
            setPreferenceValue(this.preferences, prefKey, value);
            const config = this.schema[prefKey];
            chromeUpdates[config.chromeKey] = value;
        }
        // Step 3: Update Chrome storage (batch update)
        await chrome.storage.local.set(chromeUpdates);
        Logger.debug(`✅ USER_PREFERENCES_MANAGER: Saved ${Object.keys(chromeUpdates).length} preferences to Chrome storage`, null, 'preferences');
        // Step 4: Update stateManager currentUser - TypeScript migration
        this.updateCurrentUser();
        // Step 5: Emit change events
        for (const [key, value] of Object.entries(preferences)) {
            const prefKey = key;
            if (results[prefKey] === false)
                continue;
            this.emitPreferenceChanged(prefKey, value, oldValues[prefKey], 'user');
        }
        // Step 6: Save to database in batch
        if (!options.skipDatabase) {
            await this.saveBatchToDatabase(preferences);
        }
        return results;
    }
    /**
     * Add preference to batch queue
     */
    addToBatch(key, value) {
        // Remove existing entry for this key if present
        this.batchQueue = this.batchQueue.filter(item => item.key !== key);
        // Add new entry
        this.batchQueue.push({ key, value, timestamp: Date.now() });
        // Clear existing timeout
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
        }
        // Set new timeout to flush batch
        this.batchTimeout = setTimeout(() => {
            this.flushBatch();
        }, this.batchDelay);
        Logger.debug(`📦 USER_PREFERENCES_MANAGER: Added ${key} to batch (queue size: ${this.batchQueue.length})`, null, 'preferences');
    }
    /**
     * Flush batch queue to database
     */
    async flushBatch() {
        if (this.batchQueue.length === 0) {
            return;
        }
        // Check backend health before flushing
        try {
            const healthService = getBackendHealthService();
            if (!healthService.isHealthy()) {
                const state = healthService.getState();
                Logger.debug(`📦 USER_PREFERENCES_MANAGER: Backend not healthy (${state.status}), queueing batch for later`, null, 'preferences');
                // Subscribe to health changes to flush when backend recovers
                const unsubscribe = healthService.subscribe((healthState) => {
                    if (healthState.status === 'healthy') {
                        unsubscribe();
                        Logger.info('✅ USER_PREFERENCES_MANAGER: Backend recovered, flushing queued batch', null, 'preferences');
                        this.flushBatch().catch((error) => {
                            Logger.error('❌ USER_PREFERENCES_MANAGER: Failed to flush batch after recovery', error, 'preferences');
                        });
                    }
                });
                // Don't clear the batch - keep it for when backend recovers
                return;
            }
        }
        catch (error) {
            Logger.warn('⚠️ USER_PREFERENCES_MANAGER: Error checking backend health, proceeding with flush', error, 'preferences');
            // Continue with flush if health check fails
        }
        const batch = [...this.batchQueue];
        this.batchQueue = [];
        this.batchTimeout = null;
        Logger.debug(`📦 USER_PREFERENCES_MANAGER: Flushing batch (${batch.length} items)`, null, 'preferences');
        // Convert to preferences object
        const preferences = {};
        for (const item of batch) {
            setPreferenceValue(preferences, item.key, item.value);
        }
        // Save batch to database
        await this.saveBatchToDatabase(preferences);
    }
    /**
     * Save batch to database
     */
    async saveBatchToDatabase(preferences) {
        if (!this.userId || !api) {
            Logger.warn('⚠️ USER_PREFERENCES_MANAGER: Cannot save batch (no userId or API)', null, 'preferences');
            return;
        }
        // Check if offline
        if (!this.isOnline) {
            Logger.debug('🌐 USER_PREFERENCES_MANAGER: Offline, queueing batch for sync', 'preferences');
            // Queue each preference for retry when online
            for (const [key, value] of Object.entries(preferences)) {
                if (value === undefined) {
                    continue;
                }
                this.queueForRetry(key, value);
            }
            return;
        }
        // Build update object with database column names
        const updates = {};
        for (const [key, value] of Object.entries(preferences)) {
            if (value === undefined) {
                continue;
            }
            const config = this.schema[key];
            if (config) {
                // ROOT CAUSE FIX: tab_configuration is stored as JSON string in Chrome storage,
                // but backend expects parsed object. Parse it before sending.
                if (config.dbColumn === 'tab_configuration' && typeof value === 'string') {
                    try {
                        updates[config.dbColumn] = JSON.parse(value);
                    }
                    catch (parseError) {
                        Logger.error('❌ USER_PREFERENCES_MANAGER: Failed to parse tab_configuration JSON', parseError, 'preferences');
                        // Send as-is if parsing fails (backend will handle validation)
                        updates[config.dbColumn] = value;
                    }
                }
                else {
                    updates[config.dbColumn] = value;
                }
            }
        }
        if (Object.keys(updates).length === 0) {
            return;
        }
        const startTime = Date.now();
        try {
            const apiResponse = await api.request(`/v1/users/${this.userId}`, {
                method: 'PATCH',
                body: JSON.stringify(updates)
            });
            const response = apiResponse?.data || apiResponse;
            if (!response) {
                throw new Error('Empty response from API');
            }
            const duration = Date.now() - startTime;
            this.metrics.saves.success++;
            this.metrics.saves.totalTime += duration;
            this.log('save', 'success', duration);
            Logger.debug(`✅ USER_PREFERENCES_MANAGER: Saved batch (${Object.keys(updates).length} preferences) to database`, null, 'preferences');
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.metrics.saves.failure++;
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.metrics.errors.push({ type: 'save', error: errorMessage, timestamp: Date.now() });
            this.log('save', 'failure', duration, error instanceof Error ? error : null);
            // Check if error is due to backend being offline
            const isOfflineError = errorMessage.includes('Failed to fetch') ||
                errorMessage.includes('NetworkError') ||
                errorMessage.includes('network') ||
                errorMessage.includes('connection refused') ||
                errorMessage.includes('ERR_CONNECTION_REFUSED') ||
                !this.isOnline;
            if (isOfflineError) {
                Logger.debug('🌐 USER_PREFERENCES_MANAGER: Network error detected, queueing for sync', 'preferences');
                this.isOnline = false; // Update offline status
                // Update backend health service
                try {
                    const healthService = getBackendHealthService();
                    healthService.updateFromAPIRequest(false, errorMessage);
                }
                catch (healthError) {
                    Logger.debug('⚠️ USER_PREFERENCES_MANAGER: Failed to update health service', healthError, 'preferences');
                }
            }
            // Don't throw error - queue for retry instead
            // Queue each preference for individual retry
            for (const [key, value] of Object.entries(preferences)) {
                this.queueForRetry(key, value);
                this.emitPreferenceSaveFailed(key, value, error instanceof Error ? error : new Error(String(error)));
            }
            // Log error but don't throw - preferences are queued for retry
            handleError(error, {
                log: true,
                logLevel: 'warn',
                context: {
                    operation: 'saveBatchToDatabase',
                    component: 'UserPreferences',
                    note: 'Preferences queued for retry when backend recovers'
                }
            });
            ;
        }
        return;
    }
    /**
     * Save to database immediately (no batching)
     * FIX: Properly await the save to ensure it completes
     */
    async saveToDatabaseImmediate(key, value) {
        const startTime = Date.now();
        try {
            const response = await this.saveToDatabase(key, value);
            const duration = Date.now() - startTime;
            this.metrics.saves.success++;
            this.metrics.saves.totalTime += duration;
            this.log('save', 'success', duration);
            Logger.debug(`✅ USER_PREFERENCES_MANAGER: Saved ${key} to database`, null, 'preferences');
            return response;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.metrics.saves.failure++;
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.metrics.errors.push({ type: 'save', key, error: errorMessage, timestamp: Date.now() });
            this.log('save', 'failure', duration, error instanceof Error ? error : null);
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'UserPreferences'
                }
            });
            ;
            // Queue for retry
            this.queueForRetry(key, value);
            // Emit error event
            const errorObj = error instanceof Error ? error : new Error(String(error));
            this.emitPreferenceSaveFailed(key, value, errorObj);
            throw error;
        }
    }
    /**
     * Save preference to database with retry logic
     */
    async saveToDatabase(key, value) {
        if (!this.userId || !api) {
            throw new Error('No userId or API available');
        }
        // Check if offline
        if (!this.isOnline) {
            throw new Error('Offline: Cannot save to database');
        }
        const config = this.schema[key];
        const maxRetries = 3;
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            // Check if still online before each attempt
            if (!this.isOnline) {
                throw new Error('Offline: Cannot save to database');
            }
            try {
                const apiResponse = await api.request(`/v1/users/${this.userId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        [config.dbColumn]: value
                    })
                });
                const response = apiResponse?.data || apiResponse;
                if (!response) {
                    throw new Error('Empty response from API');
                }
                return response;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                lastError = error instanceof Error ? error : new Error(errorMessage);
                // Check if error is due to being offline
                const isOfflineError = errorMessage.includes('Failed to fetch') ||
                    errorMessage.includes('NetworkError') ||
                    errorMessage.includes('network');
                if (isOfflineError) {
                    this.isOnline = false; // Update offline status
                    throw new Error('Offline: Cannot save to database');
                }
                if (attempt < maxRetries) {
                    // Exponential backoff
                    const delay = Math.pow(2, attempt) * 1000;
                    Logger.warn(`⚠️ USER_PREFERENCES_MANAGER: Retry ${attempt}/${maxRetries} for ${key} after ${delay}ms`, null, 'preferences');
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError;
    }
    /**
     * Validate preference value
     */
    validatePreference(key, value) {
        const config = this.schema[key];
        if (!config) {
            return false;
        }
        if (config.validator) {
            return config.validator(value);
        }
        return true;
    }
    /**
     * Update stateManager currentUser with current preferences (ES6 pattern - no window globals)
     */
    updateCurrentUser() {
        // ES6 pattern: Update stateManager only
        const currentUser = stateManagerInstance.getState('currentUser');
        if (currentUser) {
            // Update stateManager
            const updatedUser = {
                ...currentUser,
                theme: this.preferences.theme,
                auraColor: this.preferences.auraColor,
                auraIntensity: this.preferences.auraIntensity,
                isVisible: this.preferences.isVisible,
                visibilityEnabled: this.preferences.isVisible,
                globalAvailability: this.preferences.globalAvailability,
                availability: this.preferences.globalAvailability,
                headline: this.preferences.headline,
                displayName: this.preferences.displayName,
            };
            stateManagerInstance.setState('currentUser', updatedUser);
        }
    }
    /**
     * Apply preferences to UI immediately after loading
     * ROOT CAUSE FIX: Only apply theme if DOM theme is not set (first load) or if theme preference was explicitly changed
     */
    applyPreferencesToUI(skipTheme = false) {
        // Apply theme to DOM
        // ROOT CAUSE FIX: NEVER override an existing DOM theme - DOM is the source of truth once set
        // This prevents overriding a user's current theme (set by ProfileManager on startup) with a stale database value
        // CRITICAL: Skip theme application if this is called after saving a non-theme preference (like isVisible)
        if (!skipTheme && this.preferences.theme) {
            const currentDomTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
            // ROOT CAUSE FIX: ProfileManager no longer sets theme on startup, so we should always apply the resolved theme
            // Only preserve DOM theme if it's different from the resolved preference AND it's not a default value
            const isDefaultTheme = this.preferences.theme === this.schema.theme.defaultValue;
            const shouldPreserveDom = currentDomTheme &&
                currentDomTheme !== this.preferences.theme &&
                !isDefaultTheme &&
                currentDomTheme === 'dark'; // Only preserve if DOM is 'dark' (user's actual preference)
            if (!shouldPreserveDom) {
                // Apply the resolved theme preference
                const stack = new Error().stack;
                Logger.debug(`🔍 USER_PREFERENCES_MANAGER: ========================================`, null, 'preferences');
                Logger.debug(`🔍 USER_PREFERENCES_MANAGER: Applying theme preference '${this.preferences.theme}' (DOM: '${currentDomTheme || 'NOT SET'}')`, null, 'preferences');
                Logger.debug(`🔍 USER_PREFERENCES_MANAGER: Call stack:`, stack?.split('\n').slice(1, 8).join('\n'), 'preferences');
                Logger.debug(`🔍 USER_PREFERENCES_MANAGER: ========================================`, null, 'preferences');
                document.documentElement.setAttribute('data-theme', this.preferences.theme);
                document.body.setAttribute('data-theme', this.preferences.theme);
                // Update theme toggle in settings tab if exists
                const themeToggle = document.getElementById('theme-toggle');
                if (themeToggle) {
                    themeToggle.checked = this.preferences.theme === 'dark';
                    // Dispatch event for VisibilitySettings (replaces window global pattern)
                    window.dispatchEvent(new CustomEvent('updateVisibilityThemeStatus', {
                        detail: { source: 'UserPreferencesManager', theme: this.preferences.theme }
                    }));
                }
                // Update profile menu theme icon/text
                const themeIconMenu = document.getElementById('theme-icon-menu');
                const themeTextMenu = document.getElementById('theme-text-menu');
                if (themeIconMenu) {
                    themeIconMenu.textContent = this.preferences.theme === 'dark' ? '☀️' : '🌙';
                }
                if (themeTextMenu) {
                    themeTextMenu.textContent = this.preferences.theme === 'dark' ? 'Light mode' : 'Dark mode';
                }
            }
            else {
                // DOM theme is 'dark' and preference is different - preserve DOM (user's actual preference)
                Logger.warn(`🚫 USER_PREFERENCES_MANAGER: Preserving DOM theme '${currentDomTheme}' (user's actual preference), ignoring resolved preference '${this.preferences.theme}'`, null, 'preferences');
                // Sync preference to match DOM
                this.preferences.theme = currentDomTheme;
                // Update Chrome storage to match DOM
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    chrome.storage.local.set({ theme: currentDomTheme }, () => {
                        if (chrome.runtime?.lastError) {
                            Logger.warn('⚠️ USER_PREFERENCES_MANAGER: Failed to sync Chrome storage:', chrome.runtime.lastError, 'preferences');
                        }
                        else {
                            Logger.debug(`✅ USER_PREFERENCES_MANAGER: Synced Chrome storage theme to '${currentDomTheme}' to match DOM`, null, 'preferences');
                        }
                    });
                }
                // Update UI elements to match DOM theme
                const themeToggle = document.getElementById('theme-toggle');
                if (themeToggle) {
                    themeToggle.checked = currentDomTheme === 'dark';
                    // Dispatch event for VisibilitySettings (replaces window global pattern)
                    window.dispatchEvent(new CustomEvent('updateVisibilityThemeStatus', {
                        detail: { source: 'UserPreferencesManager', theme: currentDomTheme }
                    }));
                }
                const themeIconMenu = document.getElementById('theme-icon-menu');
                const themeTextMenu = document.getElementById('theme-text-menu');
                if (themeIconMenu) {
                    themeIconMenu.textContent = currentDomTheme === 'dark' ? '☀️' : '🌙';
                }
                if (themeTextMenu) {
                    themeTextMenu.textContent = currentDomTheme === 'dark' ? 'Light mode' : 'Dark mode';
                }
            }
        }
        else if (skipTheme) {
            Logger.debug(`🔍 USER_PREFERENCES_MANAGER: Skipping theme application (skipTheme=true, called after non-theme preference save)`, null, 'preferences');
        }
        // Apply visibility to toggle if exists
        if (this.preferences.isVisible !== undefined) {
            const visibilityToggle = document.getElementById('visibility-toggle');
            if (visibilityToggle) {
                visibilityToggle.checked = this.preferences.isVisible;
                // Dispatch event for VisibilitySettings (replaces window global pattern)
                window.dispatchEvent(new CustomEvent('updateVisibilityStatus', {
                    detail: { source: 'UserPreferencesManager', isVisible: this.preferences.isVisible }
                }));
            }
        }
        // Apply headline to input if exists
        if (this.preferences.headline !== undefined) {
            const headlineInput = document.getElementById('settings-headline-input');
            if (headlineInput && headlineInput.value !== this.preferences.headline) {
                headlineInput.value = this.preferences.headline;
                // Dispatch event for SettingsHeadlineManager to update char count (ES6 pattern)
                window.dispatchEvent(new CustomEvent('headlineUpdated', {
                    detail: { headline: this.preferences.headline }
                }));
            }
        }
        // Apply display name to input if exists
        if (this.preferences.displayName !== undefined) {
            const displayNameInput = document.getElementById('display-name-input');
            if (displayNameInput && displayNameInput.value !== this.preferences.displayName) {
                displayNameInput.value = this.preferences.displayName;
                // Dispatch event for DisplayNameManager to update char count (ES6 pattern)
                window.dispatchEvent(new CustomEvent('displayNameUpdated', {
                    detail: { displayName: this.preferences.displayName }
                }));
            }
        }
        // Trigger avatar refresh for aura changes
        // Dispatch DOM events for avatar refresh (ES6 pattern)
        if (this.preferences.auraColor || this.preferences.auraIntensity !== undefined) {
            window.dispatchEvent(new CustomEvent('avatarRefreshRequested', {
                detail: {
                    auraColor: this.preferences.auraColor,
                    auraIntensity: this.preferences.auraIntensity
                }
            }));
        }
        Logger.debug('✅ USER_PREFERENCES_MANAGER: Applied preferences to UI', null, 'preferences');
    }
    /**
     * Queue failed save for retry
     */
    queueForRetry(key, value) {
        const failedSave = {
            key,
            value,
            timestamp: Date.now(),
            attempts: 0
        };
        this.retryQueue.push(failedSave);
        Logger.debug(`📋 USER_PREFERENCES_MANAGER: Queued ${key} for retry (queue size: ${this.retryQueue.length})`, null, 'preferences');
        // Store in localStorage as backup
        try {
            const storedQueue = JSON.parse(localStorage.getItem('failedPreferenceSaves') || '[]');
            storedQueue.push(failedSave);
            localStorage.setItem('failedPreferenceSaves', JSON.stringify(storedQueue));
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'warn',
                context: {
                    operation: 'catch',
                    component: 'UserPreferences'
                }
            });
            ;
        }
    }
    /**
     * Start retry processor
     */
    startRetryProcessor() {
        if (this.retryInterval) {
            return;
        }
        // Process retry queue every 30 seconds
        this.retryInterval = setInterval(async () => {
            await this.processRetryQueue();
        }, 30000);
        // Also process on next load
        this.processRetryQueue();
    }
    /**
     * Setup offline detection
     */
    setupOfflineDetection() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.handleOnline();
        });
        window.addEventListener('offline', () => {
            this.handleOffline();
        });
        // Initial check
        this.isOnline = navigator.onLine !== false;
        Logger.debug(`🌐 USER_PREFERENCES_MANAGER: Initial online status: ${this.isOnline}`, null, 'preferences');
    }
    /**
     * Handle going online
     */
    handleOnline() {
        const wasOffline = !this.isOnline;
        this.isOnline = true;
        Logger.debug('🌐 USER_PREFERENCES_MANAGER: Connection restored, processing sync queue', 'preferences');
        // Process retry queue when coming back online
        if (wasOffline) {
            this.processRetryQueue();
            // Flush any pending batch
            if (this.batchQueue.length > 0) {
                this.flushBatch();
            }
        }
        // Notify listeners
        this.offlineListeners.forEach(listener => {
            if (typeof listener === 'function') {
                listener({ online: true });
            }
        });
    }
    /**
     * Handle going offline
     */
    handleOffline() {
        this.isOnline = false;
        Logger.debug('🌐 USER_PREFERENCES_MANAGER: Connection lost, will queue saves for sync', 'preferences');
        // Notify listeners
        this.offlineListeners.forEach(listener => {
            if (typeof listener === 'function') {
                listener({ online: false });
            }
        });
    }
    /**
     * Add offline status listener
     */
    addOfflineListener(listener) {
        this.offlineListeners.push(listener);
    }
    /**
     * Remove offline status listener
     */
    removeOfflineListener(listener) {
        this.offlineListeners = this.offlineListeners.filter(l => l !== listener);
    }
    /**
     * Process retry queue (only if online)
     */
    async processRetryQueue() {
        if (!this.isOnline) {
            Logger.debug('🌐 USER_PREFERENCES_MANAGER: Skipping retry queue (offline)', null, 'preferences');
            return;
        }
        if (this.retryQueue.length === 0) {
            return;
        }
        Logger.debug(`🔄 USER_PREFERENCES_MANAGER: Processing retry queue (${this.retryQueue.length} items)`, null, 'preferences');
        const queue = [...this.retryQueue];
        this.retryQueue = [];
        for (const item of queue) {
            // Check if still online before each retry
            if (!this.isOnline) {
                Logger.debug('🌐 USER_PREFERENCES_MANAGER: Went offline during retry, re-queuing', 'preferences');
                this.retryQueue.push(item);
                continue;
            }
            try {
                await this.saveToDatabase(item.key, item.value);
                this.metrics.retries.success++;
                Logger.debug(`✅ USER_PREFERENCES_MANAGER: Retry successful for ${item.key}`, null, 'preferences');
            }
            catch (error) {
                item.attempts++;
                if (item.attempts < 5) {
                    // Re-queue if not too many attempts
                    this.retryQueue.push(item);
                }
                else {
                    this.metrics.retries.failure++;
                    handleError(error, {
                        log: true,
                        logLevel: 'error',
                        context: {
                            operation: 'catch',
                            component: 'UserPreferences'
                        }
                    });
                    ;
                }
            }
        }
        // Update localStorage
        try {
            localStorage.setItem('failedPreferenceSaves', JSON.stringify(this.retryQueue));
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'warn',
                context: {
                    operation: 'catch',
                    component: 'UserPreferences'
                }
            });
            ;
        }
    }
    /**
     * Emit preference changed event
     */
    emitPreferenceChanged(key, value, oldValue, source = 'user') {
        const eventData = {
            key,
            value,
            oldValue,
            source,
            timestamp: Date.now()
        };
        // EventBus event (optional - for backward compatibility during migration)
        // ES6 pattern: Optional check for eventBus
        const win = window;
        if (win.eventBus && typeof win.eventBus.emit === 'function') {
            win.eventBus.emit('preference:changed', eventData);
        }
        // DOM event
        window.dispatchEvent(new CustomEvent('preferenceChanged', {
            detail: eventData
        }));
        Logger.debug(`📢 USER_PREFERENCES_MANAGER: Emitted preference changed: ${key}`, eventData, 'preferences');
    }
    /**
     * Emit preference loaded event
     */
    emitPreferenceLoaded() {
        const eventData = {
            preferences: { ...this.preferences },
            timestamp: Date.now()
        };
        // EventBus event (optional - for backward compatibility during migration)
        // ES6 pattern: Optional check for eventBus
        const win2 = window;
        if (win2.eventBus && typeof win2.eventBus.emit === 'function') {
            win2.eventBus.emit('preference:loaded', eventData);
        }
        // DOM event
        window.dispatchEvent(new CustomEvent('preferenceLoaded', {
            detail: eventData
        }));
        Logger.debug('📢 USER_PREFERENCES_MANAGER: Emitted preference loaded', null, 'preferences');
    }
    /**
     * Emit preference save failed event
     */
    emitPreferenceSaveFailed(key, value, error) {
        const eventData = {
            key,
            value,
            error: error.message,
            timestamp: Date.now()
        };
        // EventBus event (optional - for backward compatibility during migration)
        // ES6 pattern: Optional check for eventBus
        const win3 = window;
        if (win3.eventBus && typeof win3.eventBus.emit === 'function') {
            win3.eventBus.emit('preference:saveFailed', eventData);
        }
        // DOM event
        window.dispatchEvent(new CustomEvent('preferenceSaveFailed', {
            detail: eventData
        }));
    }
    /**
     * Log operation
     */
    log(operation, status, duration, error = null) {
        const logEntry = {
            operation,
            status,
            duration,
            error: error?.message,
            timestamp: Date.now(),
            userId: this.userId
        };
        // Send to monitoring service if available
        // ES6 pattern: Optional check for monitoringService (for backward compatibility during migration)
        const win4 = window;
        if (win4.monitoringService && typeof win4.monitoringService.log === 'function') {
            win4.monitoringService.log('preference', logEntry);
        }
        // Logger log
        const emoji = status === 'success' ? '✅' : '❌';
        Logger.debug(`${emoji} [PREFERENCE_MANAGER] ${operation} ${status} (${duration}ms)`, logEntry, 'preferences');
    }
    /**
     * Get metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            retryQueueSize: this.retryQueue.length,
            isInitialized: this.isInitialized,
            isLoading: this.isLoading,
            isSaving: this.isSaving
        };
    }
    /**
     * Validate preference integrity
     */
    async validateIntegrity() {
        const checks = [];
        // Check Chrome storage vs Database
        const chromePrefs = await this.loadFromChromeStorage();
        const dbPrefs = await this.loadFromDatabase();
        const schemaKeys = Object.keys(this.schema);
        for (const prefKey of schemaKeys) {
            const chromeValue = chromePrefs[prefKey];
            const dbValue = dbPrefs[prefKey];
            const currentValue = this.preferences[prefKey];
            if (chromeValue !== undefined && dbValue !== undefined && chromeValue !== dbValue) {
                checks.push({
                    type: 'mismatch',
                    key: prefKey,
                    chromeValue,
                    dbValue,
                    currentValue
                });
            }
        }
        if (checks.length > 0) {
            Logger.warn('⚠️ USER_PREFERENCES_MANAGER: Integrity issues found:', checks, 'preferences');
        }
        return checks.length === 0;
    }
}
// Create singleton instance
const userPreferencesManager = new UserPreferencesManager();
// ES6 convenience exports (no window assignment - pure module pattern)
export const getPreference = (key) => userPreferencesManager.getPreference(key);
export const savePreference = (key, value, options) => userPreferencesManager.savePreference(key, value, options);
// Export the instance for advanced usage
export { userPreferencesManager };
Logger.debug('✅ USER_PREFERENCES_MANAGER: Module loaded', null, 'preferences');
// Start theme change tracking immediately (optional - don't block if it fails)
if (typeof window !== 'undefined') {
    // Try to load ThemeChangeTracker dynamically to avoid blocking module load
    import('./ThemeChangeTracker')
        .then((module) => {
        if (module.themeChangeTracker) {
            module.themeChangeTracker.startTracking();
            Logger.debug('✅ USER_PREFERENCES_MANAGER: ThemeChangeTracker loaded and started', null, 'preferences');
        }
    })
        .catch((err) => {
        Logger.warn('⚠️ USER_PREFERENCES_MANAGER: ThemeChangeTracker not available (non-critical):', err, 'preferences');
        // Don't fail - theme tracking is optional for debugging
    });
}
export default userPreferencesManager;
