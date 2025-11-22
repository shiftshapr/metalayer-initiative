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
// Import ThemeChangeTracker to start tracking theme changes (static import ensures it's bundled)
import { themeChangeTracker } from './ThemeChangeTracker';
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
        this.schema = {
            theme: {
                chromeKey: 'theme',
                dbColumn: 'theme',
                defaultValue: 'light',
                validator: (v) => ['light', 'dark', 'auto'].includes(v),
                uiComponents: ['profile', 'settings', 'all']
            },
            auraColor: {
                chromeKey: 'auraColor',
                dbColumn: 'aura_color',
                defaultValue: '#98d416',
                validator: (v) => /^#[0-9A-Fa-f]{6}$/i.test(v),
                uiComponents: ['avatars', 'profile', 'settings']
            },
            auraIntensity: {
                chromeKey: 'auraIntensity',
                dbColumn: 'aura_intensity',
                defaultValue: 0.5,
                validator: (v) => typeof v === 'number' && v >= 0 && v <= 1,
                uiComponents: ['avatars', 'settings']
            },
            isVisible: {
                chromeKey: 'visibilityEnabled',
                dbColumn: 'is_visible',
                defaultValue: true,
                validator: (v) => typeof v === 'boolean',
                uiComponents: ['avatars', 'profile', 'settings', 'visibility']
            },
            globalAvailability: {
                chromeKey: 'availability',
                dbColumn: 'global_availability',
                defaultValue: 'AVAILABLE',
                validator: (v) => ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(v),
                uiComponents: ['profile', 'settings', 'visibility']
            },
            headline: {
                chromeKey: 'settingsHeadline',
                dbColumn: 'headline',
                defaultValue: '',
                validator: (v) => v === '' || (typeof v === 'string' && v.length >= 20 && v.length <= 1000),
                uiComponents: ['profile', 'settings']
            },
            displayName: {
                chromeKey: 'displayName',
                dbColumn: 'displayName', // FIX: Match Prisma schema (camelCase, not snake_case)
                defaultValue: '',
                validator: (v) => v === '' || (typeof v === 'string' && v.length >= 4 && v.length <= 16),
                uiComponents: ['profile', 'settings', 'avatars']
            }
        };
        console.log('✅ USER_PREFERENCES_MANAGER: Initialized');
    }
    /**
     * Initialize preferences manager
     * Must be called after user authentication
     */
    async initialize(userId) {
        console.log('🔍 USER_PREFERENCES_MANAGER: initialize() called with userId:', userId || 'MISSING');
        console.log('🔍 USER_PREFERENCES_MANAGER: Current isInitialized:', this.isInitialized);
        if (this.isInitialized) {
            console.log('⚠️ USER_PREFERENCES_MANAGER: Already initialized');
            return;
        }
        if (!userId) {
            console.warn('⚠️ USER_PREFERENCES_MANAGER: No userId provided, waiting...');
            console.log('🔍 USER_PREFERENCES_MANAGER: Checking window.currentUser?.id:', window.currentUser?.id);
            // Wait for userId with longer timeout and better detection
            return new Promise((resolve) => {
                let attempts = 0;
                const maxAttempts = 50; // 25 seconds (500ms * 50)
                const checkUser = setInterval(() => {
                    attempts++;
                    const currentUserId = window.currentUser?.id;
                    console.log(`🔍 USER_PREFERENCES_MANAGER: Attempt ${attempts}/${maxAttempts}, checking for userId:`, currentUserId || 'NOT FOUND');
                    if (currentUserId) {
                        clearInterval(checkUser);
                        console.log(`✅ USER_PREFERENCES_MANAGER: Found userId after ${attempts} attempts: ${currentUserId}`);
                        this.initialize(currentUserId).then(resolve);
                        return;
                    }
                    // Log progress every 5 seconds
                    if (attempts % 10 === 0) {
                        console.log(`⏳ USER_PREFERENCES_MANAGER: Waiting for userId... (${attempts}/${maxAttempts})`);
                    }
                    if (attempts >= maxAttempts) {
                        clearInterval(checkUser);
                        console.warn('⚠️ USER_PREFERENCES_MANAGER: Timeout waiting for userId - will initialize when userId becomes available');
                        // Don't fail - just return false, initialization will happen when userId is available
                        resolve(false);
                    }
                }, 500);
            });
        }
        this.userId = userId;
        console.log('🔧 USER_PREFERENCES_MANAGER: Initializing for user:', userId);
        try {
            // Load all preferences
            await this.loadAllPreferences();
            // Start retry queue processor
            this.startRetryProcessor();
            // Emit loaded event
            this.emitPreferenceLoaded();
            this.isInitialized = true;
            console.log('✅ USER_PREFERENCES_MANAGER: Initialization complete');
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('❌ USER_PREFERENCES_MANAGER: Initialization failed:', error);
            this.metrics.errors.push({ type: 'initialization', error: errorMessage, timestamp: Date.now() });
            return false;
        }
    }
    /**
     * Load all preferences (Chrome storage → Database fallback)
     */
    async loadAllPreferences() {
        if (this.isLoading) {
            console.log('⚠️ USER_PREFERENCES_MANAGER: Already loading, skipping...');
            return;
        }
        this.isLoading = true;
        const startTime = Date.now();
        try {
            console.log('📖 USER_PREFERENCES_MANAGER: Loading all preferences...');
            // Load from Chrome storage first (fastest)
            const chromePrefs = await this.loadFromChromeStorage();
            console.log('✅ USER_PREFERENCES_MANAGER: Loaded from Chrome storage:', Object.keys(chromePrefs).length, 'preferences');
            // Load from database for any missing values
            const dbPrefs = await this.loadFromDatabase();
            console.log('✅ USER_PREFERENCES_MANAGER: Loaded from database:', Object.keys(dbPrefs).length, 'preferences');
            // Merge: Chrome storage takes precedence (most recent), database fills gaps
            // Database is authoritative source - Chrome storage is cache
            // ROOT CAUSE FIX: For theme, prioritize Chrome storage > DOM > database > default
            // Chrome storage = extension-specific storage (persists across sessions)
            // DOM = current UI state (preserve what user sees)
            // Database = authoritative source (user's saved preference)
            // Default = last resort
            const mergedPrefs = {};
            for (const [key, config] of Object.entries(this.schema)) {
                const chromeValue = chromePrefs[config.chromeKey];
                const dbValue = dbPrefs[key]; // dbPrefs already mapped by key
                // ROOT CAUSE FIX: Comprehensive logging for theme resolution
                if (key === 'theme') {
                    console.log('🔍 THEME_RESOLUTION: === THEME RESOLUTION START ===');
                    console.log('🔍 THEME_RESOLUTION: Chrome storage theme:', chromeValue !== undefined && chromeValue !== null ? chromeValue : 'NOT SET');
                    console.log('🔍 THEME_RESOLUTION: Database theme:', dbValue !== undefined && dbValue !== null ? dbValue : 'NULL/NOT SET');
                    const currentDomTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
                    console.log('🔍 THEME_RESOLUTION: DOM theme:', currentDomTheme || 'NOT SET');
                    console.log('🔍 THEME_RESOLUTION: Default theme:', config.defaultValue);
                }
                // Special handling for theme: Check multiple sources in priority order
                let finalValue;
                if (chromeValue !== undefined && chromeValue !== null) {
                    // Priority 1: Chrome storage (extension-specific, most recent user preference)
                    finalValue = chromeValue;
                    if (key === 'theme') {
                        console.log('🔍 THEME_RESOLUTION: ✅ RESOLVED: Using Chrome storage theme:', finalValue);
                    }
                }
                else if (key === 'theme') {
                    // Priority 2: Check DOM (preserve current UI state - might be set by ProfileManager on startup)
                    const currentDomTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
                    if (currentDomTheme && ['light', 'dark', 'auto'].includes(currentDomTheme)) {
                        finalValue = currentDomTheme;
                        console.log(`🔍 THEME_RESOLUTION: ✅ RESOLVED: Using DOM theme '${currentDomTheme}' (preserving current UI state)`);
                        // Cache it in Chrome storage for next time
                        await chrome.storage.local.set({ [config.chromeKey]: currentDomTheme });
                    }
                    else if (dbValue !== undefined && dbValue !== null) {
                        // Priority 3: Database (authoritative source - user's saved preference)
                        finalValue = dbValue;
                        console.log(`🔍 THEME_RESOLUTION: ✅ RESOLVED: Using database theme '${dbValue}'`);
                        // Cache it in Chrome storage for next time
                        await chrome.storage.local.set({ [config.chromeKey]: dbValue });
                    }
                    else {
                        // Priority 4: Default (last resort - ONLY for local use, NEVER save to database)
                        finalValue = config.defaultValue;
                        console.log(`🔍 THEME_RESOLUTION: ✅ RESOLVED: Using default theme '${config.defaultValue}' (local only, will not save to database)`);
                        // ROOT CAUSE FIX: Mark this as a default value so it doesn't get saved to database
                        // Store in a separate flag to prevent saving defaults
                        this._defaultValues = this._defaultValues || {};
                        this._defaultValues[key] = true;
                    }
                    console.log('🔍 THEME_RESOLUTION: === THEME RESOLUTION END (finalValue:', finalValue, ') ===');
                }
                else if (dbValue !== undefined && dbValue !== null) {
                    // For non-theme preferences, database is fine as fallback
                    finalValue = dbValue;
                }
                else {
                    finalValue = config.defaultValue;
                }
                mergedPrefs[key] = finalValue;
                // If we got a value from database but not Chrome storage, save to Chrome storage (cache)
                if (chromeValue === undefined && dbValue !== undefined && dbValue !== null) {
                    await chrome.storage.local.set({ [config.chromeKey]: dbValue });
                }
            }
            this.preferences = mergedPrefs;
            // Update window.currentUser immediately
            this.updateCurrentUser();
            // Apply preferences to UI immediately
            // ROOT CAUSE FIX: Log what theme will be applied before calling applyPreferencesToUI
            if (this.preferences.theme) {
                console.log('🔍 THEME_APPLY: About to apply theme to UI:', this.preferences.theme);
                const currentDomTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
                console.log('🔍 THEME_APPLY: Current DOM theme before apply:', currentDomTheme || 'NOT SET');
            }
            this.applyPreferencesToUI();
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
        const chromeKeys = Object.values(this.schema).map(c => c.chromeKey).filter(k => k);
        const storageData = await chrome.storage.local.get(chromeKeys);
        // ROOT CAUSE FIX: Log Chrome storage theme value
        const chromeTheme = storageData['theme'];
        console.log('🔍 THEME_CHROME_LOAD: Chrome storage theme value:', chromeTheme !== undefined && chromeTheme !== null ? chromeTheme : 'NOT SET');
        const prefs = {};
        for (const [key, config] of Object.entries(this.schema)) {
            if (config.chromeKey && storageData[config.chromeKey] !== undefined) {
                prefs[key] = storageData[config.chromeKey];
                if (key === 'theme') {
                    console.log('🔍 THEME_CHROME_LOAD: ✅ Theme found in Chrome storage:', storageData[config.chromeKey]);
                }
            }
            else if (key === 'theme') {
                console.log('🔍 THEME_CHROME_LOAD: ⚠️ Theme NOT SET in Chrome storage');
            }
        }
        return prefs;
    }
    /**
     * Load preferences from database (COLUMNS ONLY - no JSON fallback)
     */
    async loadFromDatabase() {
        if (!this.userId || !window.api) {
            console.log('⚠️ USER_PREFERENCES_MANAGER: Cannot load from database (no userId or API)');
            throw new Error('Cannot load preferences: userId or API not available');
        }
        try {
            const response = await window.api.request(`/v1/users/${this.userId}`, {
                method: 'GET'
            });
            if (!response) {
                throw new Error('Empty response from API');
            }
            // ROOT CAUSE FIX: Log database response for theme specifically
            const dbTheme = response?.['theme'];
            console.log('🔍 THEME_DB_LOAD: Database theme value:', dbTheme !== undefined && dbTheme !== null ? dbTheme : 'NULL/NOT SET');
            console.log('🔍 THEME_DB_LOAD: Full database response theme field:', dbTheme);
            const prefs = {};
            for (const [key, config] of Object.entries(this.schema)) {
                const dbValue = response[config.dbColumn];
                if (dbValue !== undefined && dbValue !== null) {
                    prefs[key] = dbValue; // Map by preference key
                    if (key === 'theme') {
                        console.log('🔍 THEME_DB_LOAD: ✅ Theme found in database:', dbValue);
                    }
                }
                else if (key === 'theme') {
                    console.log('🔍 THEME_DB_LOAD: ⚠️ Theme is NULL in database (will not use default, will check other sources)');
                }
                // ROOT CAUSE FIX: Do NOT set default for NULL values - NULL means "not set" and should not be saved back
                // Only use defaults in loadAllPreferences() when all sources are unavailable
            }
            return prefs;
        }
        catch (error) {
            console.error('❌ USER_PREFERENCES_MANAGER: Database load failed:', error);
            throw error; // Don't silently fail - we need database columns
        }
    }
    /**
     * Get a single preference
     */
    async getPreference(key) {
        if (!this.schema[key]) {
            console.warn(`⚠️ USER_PREFERENCES_MANAGER: Unknown preference key: ${key}`);
            return null;
        }
        // If not initialized, initialize first
        if (!this.isInitialized) {
            const userId = this.userId || window.currentUser?.id;
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
            console.error(`❌ USER_PREFERENCES_MANAGER: Unknown preference key: ${key}`);
            return false;
        }
        const config = this.schema[key];
        const oldValue = this.preferences[key];
        // ROOT CAUSE FIX: Never save default values to database - they're only for local fallback
        if (this._defaultValues && this._defaultValues[key] && value === config.defaultValue) {
            console.log(`⚠️ USER_PREFERENCES_MANAGER: Skipping save of default value for ${key} (prevents overwriting database with defaults)`);
            // Clear the default flag since user is explicitly setting it
            delete this._defaultValues[key];
            // Still update local state and Chrome storage, but skip database
            this.preferences[key] = value;
            await chrome.storage.local.set({ [config.chromeKey]: value });
            this.updateCurrentUser();
            return true;
        }
        try {
            // Step 1: Validate
            if (!this.validatePreference(key, value)) {
                console.error(`❌ USER_PREFERENCES_MANAGER: Invalid value for ${key}:`, value);
                return false;
            }
            // Step 2: Update local state immediately
            this.preferences[key] = value;
            // Step 3: Update Chrome storage (fast, always succeeds)
            await chrome.storage.local.set({ [config.chromeKey]: value });
            console.log(`✅ USER_PREFERENCES_MANAGER: Saved ${key} to Chrome storage`);
            // Step 4: Update window.currentUser (immediate)
            this.updateCurrentUser();
            // Step 5: Emit change event (immediate)
            this.emitPreferenceChanged(key, value, oldValue, 'user');
            // Step 6: Apply to UI immediately (CRITICAL FIX: Update UI after save)
            this.applyPreferencesToUI();
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
            console.error(`❌ USER_PREFERENCES_MANAGER: Failed to save preference ${key}:`, error);
            this.metrics.errors.push({ type: 'save', key, error: errorMessage, timestamp: Date.now() });
            this.emitPreferenceSaveFailed(key, value, error instanceof Error ? error : new Error(errorMessage));
            return false;
        }
    }
    /**
     * Save multiple preferences in a batch
     */
    async savePreferences(preferences, options = {}) {
        console.log(`📦 USER_PREFERENCES_MANAGER: Batching ${Object.keys(preferences).length} preferences`);
        const results = {};
        const oldValues = {};
        // Step 1: Validate all preferences
        for (const [key, value] of Object.entries(preferences)) {
            const prefKey = key;
            if (!this.schema[prefKey]) {
                console.error(`❌ USER_PREFERENCES_MANAGER: Unknown preference key: ${key}`);
                results[key] = false;
                continue;
            }
            if (!this.validatePreference(prefKey, value)) {
                console.error(`❌ USER_PREFERENCES_MANAGER: Invalid value for ${key}:`, value);
                results[key] = false;
                continue;
            }
            oldValues[key] = this.preferences[prefKey];
        }
        // Step 2: Update local state immediately
        const chromeUpdates = {};
        for (const [key, value] of Object.entries(preferences)) {
            if (results[key] === false)
                continue;
            const prefKey = key;
            this.preferences[prefKey] = value;
            const config = this.schema[prefKey];
            chromeUpdates[config.chromeKey] = value;
        }
        // Step 3: Update Chrome storage (batch update)
        await chrome.storage.local.set(chromeUpdates);
        console.log(`✅ USER_PREFERENCES_MANAGER: Saved ${Object.keys(chromeUpdates).length} preferences to Chrome storage`);
        // Step 4: Update window.currentUser
        this.updateCurrentUser();
        // Step 5: Emit change events
        for (const [key, value] of Object.entries(preferences)) {
            if (results[key] === false)
                continue;
            this.emitPreferenceChanged(key, value, oldValues[key], 'user');
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
        console.log(`📦 USER_PREFERENCES_MANAGER: Added ${key} to batch (queue size: ${this.batchQueue.length})`);
    }
    /**
     * Flush batch queue to database
     */
    async flushBatch() {
        if (this.batchQueue.length === 0) {
            return;
        }
        const batch = [...this.batchQueue];
        this.batchQueue = [];
        this.batchTimeout = null;
        console.log(`📦 USER_PREFERENCES_MANAGER: Flushing batch (${batch.length} items)`);
        // Convert to preferences object
        const preferences = {};
        for (const item of batch) {
            preferences[item.key] = item.value;
        }
        // Save batch to database
        await this.saveBatchToDatabase(preferences);
    }
    /**
     * Save batch to database
     */
    async saveBatchToDatabase(preferences) {
        if (!this.userId || !window.api) {
            console.warn('⚠️ USER_PREFERENCES_MANAGER: Cannot save batch (no userId or API)');
            return;
        }
        // Check if offline
        if (!this.isOnline) {
            console.log('🌐 USER_PREFERENCES_MANAGER: Offline, queueing batch for sync');
            // Queue each preference for retry when online
            for (const [key, value] of Object.entries(preferences)) {
                this.queueForRetry(key, value);
            }
            return;
        }
        // Build update object with database column names
        const updates = {};
        for (const [key, value] of Object.entries(preferences)) {
            const config = this.schema[key];
            if (config) {
                updates[config.dbColumn] = value;
            }
        }
        if (Object.keys(updates).length === 0) {
            return;
        }
        const startTime = Date.now();
        try {
            const response = await window.api.request(`/v1/users/${this.userId}`, {
                method: 'PATCH',
                body: JSON.stringify(updates)
            });
            if (!response) {
                throw new Error('Empty response from API');
            }
            const duration = Date.now() - startTime;
            this.metrics.saves.success++;
            this.metrics.saves.totalTime += duration;
            this.log('save', 'success', duration);
            console.log(`✅ USER_PREFERENCES_MANAGER: Saved batch (${Object.keys(updates).length} preferences) to database`);
            return response;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.metrics.saves.failure++;
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.metrics.errors.push({ type: 'save', error: errorMessage, timestamp: Date.now() });
            this.log('save', 'failure', duration, error instanceof Error ? error : null);
            console.error(`❌ USER_PREFERENCES_MANAGER: Failed to save batch to database:`, error);
            // Check if error is due to being offline
            const isOfflineError = errorMessage.includes('Failed to fetch') ||
                errorMessage.includes('NetworkError') ||
                errorMessage.includes('network') ||
                !this.isOnline;
            if (isOfflineError) {
                console.log('🌐 USER_PREFERENCES_MANAGER: Network error detected, queueing for sync');
                this.isOnline = false; // Update offline status
            }
            // Queue each preference for individual retry
            for (const [key, value] of Object.entries(preferences)) {
                this.queueForRetry(key, value);
                this.emitPreferenceSaveFailed(key, value, error instanceof Error ? error : new Error(String(error)));
            }
            throw error;
        }
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
            console.log(`✅ USER_PREFERENCES_MANAGER: Saved ${key} to database`);
            return response;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.metrics.saves.failure++;
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.metrics.errors.push({ type: 'save', key, error: errorMessage, timestamp: Date.now() });
            this.log('save', 'failure', duration, error instanceof Error ? error : null);
            console.error(`❌ USER_PREFERENCES_MANAGER: Failed to save ${key} to database:`, error);
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
        if (!this.userId || !window.api) {
            throw new Error('No userId or API available');
        }
        // Check if offline
        if (!this.isOnline) {
            throw new Error('Offline: Cannot save to database');
        }
        const config = this.schema[key];
        const maxRetries = 3;
        let lastError;
        const startTime = Date.now();
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            // Check if still online before each attempt
            if (!this.isOnline) {
                throw new Error('Offline: Cannot save to database');
            }
            try {
                const response = await window.api.request(`/v1/users/${this.userId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        [config.dbColumn]: value
                    })
                });
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
                    console.log(`⚠️ USER_PREFERENCES_MANAGER: Retry ${attempt}/${maxRetries} for ${key} after ${delay}ms`);
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
     * Update window.currentUser with current preferences
     */
    updateCurrentUser() {
        if (!window.currentUser) {
            return;
        }
        // Update direct properties for backward compatibility
        window.currentUser.theme = this.preferences.theme;
        window.currentUser.auraColor = this.preferences.auraColor;
        window.currentUser.auraIntensity = this.preferences.auraIntensity;
        window.currentUser.isVisible = this.preferences.isVisible;
        window.currentUser.visibilityEnabled = this.preferences.isVisible;
        window.currentUser.globalAvailability = this.preferences.globalAvailability;
        window.currentUser.availability = this.preferences.globalAvailability;
        window.currentUser.headline = this.preferences.headline;
        window.currentUser.displayName = this.preferences.displayName;
    }
    /**
     * Apply preferences to UI immediately after loading
     */
    applyPreferencesToUI() {
        // Apply theme to DOM
        // ROOT CAUSE FIX: Never override an existing DOM theme unless the preference is explicitly different and not a default
        // This prevents overriding a user's current theme (set by ProfileManager on startup) with a stale database value
        if (this.preferences.theme) {
            const currentDomTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
            const isDefaultTheme = this.preferences.theme === this.schema.theme.defaultValue;
            // ROOT CAUSE FIX: CRITICAL - If DOM already has a theme set, NEVER override it during preference loading
            // This prevents theme from resetting to light when messages load
            // Only apply theme if DOM has no theme set (first load)
            // ALSO: Never apply default 'light' theme if DOM is already 'dark' - this is the root cause
            if (!currentDomTheme) {
                // No DOM theme - safe to apply preference
                const stack = new Error().stack;
                console.log(`🔍 USER_PREFERENCES_MANAGER: ========================================`);
                console.log(`🔍 USER_PREFERENCES_MANAGER: Applying theme preference '${this.preferences.theme}' (no existing DOM theme)`);
                console.log(`🔍 USER_PREFERENCES_MANAGER: Call stack:`, stack?.split('\n').slice(1, 8).join('\n'));
                console.log(`🔍 USER_PREFERENCES_MANAGER: ========================================`);
                document.documentElement.setAttribute('data-theme', this.preferences.theme);
                document.body.setAttribute('data-theme', this.preferences.theme);
                // Update theme toggle in settings tab if exists
                const themeToggle = document.getElementById('theme-toggle');
                if (themeToggle) {
                    themeToggle.checked = this.preferences.theme === 'dark';
                    if (window.visibilitySettingsManager && typeof window.visibilitySettingsManager.updateThemeStatus === 'function') {
                        window.visibilitySettingsManager.updateThemeStatus();
                    }
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
                // DOM theme exists - preserve it, don't override
                // ROOT CAUSE FIX: CRITICAL - If DOM is 'dark' and preference is 'light' (especially if it's a default), DO NOT override
                if (currentDomTheme === 'dark' && this.preferences.theme === 'light' && isDefaultTheme) {
                    console.warn(`🚫 USER_PREFERENCES_MANAGER: BLOCKING theme override - DOM is 'dark', preference is default 'light' - preserving DOM theme`);
                    // Sync preference to match DOM (DOM is the source of truth here)
                    this.preferences.theme = 'dark';
                    // Update Chrome storage to match DOM (prevent future resets)
                    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                        chrome.storage.local.set({ theme: 'dark' }, () => {
                            if (chrome.runtime?.lastError) {
                                console.warn('⚠️ USER_PREFERENCES_MANAGER: Failed to sync Chrome storage:', chrome.runtime.lastError);
                            }
                        });
                    }
                    return; // Don't apply anything, just exit
                }
                console.log(`🔍 USER_PREFERENCES_MANAGER: Preserving existing DOM theme '${currentDomTheme}' (preference '${this.preferences.theme}' will not override)`);
                // Sync preference to match DOM (in case DOM was set by ProfileManager)
                if (this.preferences.theme !== currentDomTheme) {
                    this.preferences.theme = currentDomTheme;
                }
            }
        }
        // Apply visibility to toggle if exists
        if (this.preferences.isVisible !== undefined) {
            const visibilityToggle = document.getElementById('visibility-toggle');
            if (visibilityToggle) {
                visibilityToggle.checked = this.preferences.isVisible;
                if (window.visibilitySettingsManager && typeof window.visibilitySettingsManager.updateVisibilityStatus === 'function') {
                    window.visibilitySettingsManager.updateVisibilityStatus();
                }
            }
        }
        // Apply headline to input if exists
        if (this.preferences.headline !== undefined) {
            const headlineInput = document.getElementById('settings-headline-input');
            if (headlineInput && headlineInput.value !== this.preferences.headline) {
                headlineInput.value = this.preferences.headline;
                if (window.settingsHeadlineManager && typeof window.settingsHeadlineManager.updateCharCount === 'function') {
                    window.settingsHeadlineManager.updateCharCount();
                }
            }
        }
        // Apply display name to input if exists
        if (this.preferences.displayName !== undefined) {
            const displayNameInput = document.getElementById('display-name-input');
            if (displayNameInput && displayNameInput.value !== this.preferences.displayName) {
                displayNameInput.value = this.preferences.displayName;
                if (window.displayNameManager && typeof window.displayNameManager.updateCharCount === 'function') {
                    window.displayNameManager.updateCharCount();
                }
            }
        }
        // Trigger avatar refresh for aura changes
        if (this.preferences.auraColor || this.preferences.auraIntensity !== undefined) {
            if (typeof window.refreshAllMessageAvatars === 'function') {
                window.refreshAllMessageAvatars();
            }
            if (typeof window.refreshVisibilityAvatars === 'function') {
                window.refreshVisibilityAvatars();
            }
        }
        console.log('✅ USER_PREFERENCES_MANAGER: Applied preferences to UI');
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
        console.log(`📋 USER_PREFERENCES_MANAGER: Queued ${key} for retry (queue size: ${this.retryQueue.length})`);
        // Store in localStorage as backup
        try {
            const storedQueue = JSON.parse(localStorage.getItem('failedPreferenceSaves') || '[]');
            storedQueue.push(failedSave);
            localStorage.setItem('failedPreferenceSaves', JSON.stringify(storedQueue));
        }
        catch (error) {
            console.warn('⚠️ USER_PREFERENCES_MANAGER: Failed to store retry queue:', error);
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
        console.log(`🌐 USER_PREFERENCES_MANAGER: Initial online status: ${this.isOnline}`);
    }
    /**
     * Handle going online
     */
    handleOnline() {
        const wasOffline = !this.isOnline;
        this.isOnline = true;
        console.log('🌐 USER_PREFERENCES_MANAGER: Connection restored, processing sync queue');
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
        console.log('🌐 USER_PREFERENCES_MANAGER: Connection lost, will queue saves for sync');
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
            console.log('🌐 USER_PREFERENCES_MANAGER: Skipping retry queue (offline)');
            return;
        }
        if (this.retryQueue.length === 0) {
            return;
        }
        console.log(`🔄 USER_PREFERENCES_MANAGER: Processing retry queue (${this.retryQueue.length} items)`);
        const queue = [...this.retryQueue];
        this.retryQueue = [];
        for (const item of queue) {
            // Check if still online before each retry
            if (!this.isOnline) {
                console.log('🌐 USER_PREFERENCES_MANAGER: Went offline during retry, re-queuing');
                this.retryQueue.push(item);
                continue;
            }
            try {
                await this.saveToDatabase(item.key, item.value);
                this.metrics.retries.success++;
                console.log(`✅ USER_PREFERENCES_MANAGER: Retry successful for ${item.key}`);
            }
            catch (error) {
                item.attempts++;
                if (item.attempts < 5) {
                    // Re-queue if not too many attempts
                    this.retryQueue.push(item);
                }
                else {
                    this.metrics.retries.failure++;
                    console.error(`❌ USER_PREFERENCES_MANAGER: Retry failed for ${item.key} after ${item.attempts} attempts`);
                }
            }
        }
        // Update localStorage
        try {
            localStorage.setItem('failedPreferenceSaves', JSON.stringify(this.retryQueue));
        }
        catch (error) {
            console.warn('⚠️ USER_PREFERENCES_MANAGER: Failed to update retry queue storage:', error);
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
        // EventBus event
        if (window.eventBus && typeof window.eventBus.emit === 'function') {
            window.eventBus.emit('preference:changed', eventData);
        }
        // DOM event
        window.dispatchEvent(new CustomEvent('preferenceChanged', {
            detail: eventData
        }));
        console.log(`📢 USER_PREFERENCES_MANAGER: Emitted preference changed: ${key}`, eventData);
    }
    /**
     * Emit preference loaded event
     */
    emitPreferenceLoaded() {
        const eventData = {
            preferences: { ...this.preferences },
            timestamp: Date.now()
        };
        // EventBus event
        if (window.eventBus && typeof window.eventBus.emit === 'function') {
            window.eventBus.emit('preference:loaded', eventData);
        }
        // DOM event
        window.dispatchEvent(new CustomEvent('preferenceLoaded', {
            detail: eventData
        }));
        console.log('📢 USER_PREFERENCES_MANAGER: Emitted preference loaded');
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
        // EventBus event
        if (window.eventBus && typeof window.eventBus.emit === 'function') {
            window.eventBus.emit('preference:saveFailed', eventData);
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
        if (window.monitoringService && typeof window.monitoringService.log === 'function') {
            window.monitoringService.log('preference', logEntry);
        }
        // Console log
        const emoji = status === 'success' ? '✅' : '❌';
        console.log(`${emoji} [PREFERENCE_MANAGER] ${operation} ${status} (${duration}ms)`, logEntry);
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
        for (const [key, config] of Object.entries(this.schema)) {
            const prefKey = key;
            const chromeValue = chromePrefs[config.chromeKey];
            const dbValue = dbPrefs[config.dbColumn];
            const currentValue = this.preferences[prefKey];
            if (chromeValue !== undefined && dbValue !== undefined && chromeValue !== dbValue) {
                checks.push({
                    type: 'mismatch',
                    key,
                    chromeValue,
                    dbValue,
                    currentValue
                });
            }
        }
        if (checks.length > 0) {
            console.warn('⚠️ USER_PREFERENCES_MANAGER: Integrity issues found:', checks);
        }
        return checks.length === 0;
    }
}
// Create singleton instance
const userPreferencesManager = new UserPreferencesManager();
// Export for global access
if (typeof window !== 'undefined') {
    // Assign to window using proper typing (no (window as any) - red-line compliance)
    // Use Object.assign to avoid strict type checking issues
    Object.assign(window, { UserPreferencesManager, userPreferencesManager });
    // Convenience functions
    window.getPreference = (key) => userPreferencesManager.getPreference(key);
    window.savePreference = (key, value, options) => userPreferencesManager.savePreference(key, value, options);
}
console.log('✅ USER_PREFERENCES_MANAGER: Module loaded');
// Start theme change tracking immediately
if (typeof window !== 'undefined' && themeChangeTracker) {
    themeChangeTracker.startTracking();
}
export default userPreferencesManager;
