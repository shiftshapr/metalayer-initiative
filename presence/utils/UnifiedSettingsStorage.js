/**
 * UNIFIED SETTINGS STORAGE - TypeScript Version
 * Unified functions to store and retrieve settings from Chrome local storage AND database
 * Works for: theme, aura, status, visibility, and other user preferences
 */
export class UnifiedSettingsStorage {
    constructor() {
        this.apiBaseUrl = 'http://216.238.91.120:3002';
    }
    /**
     * Get auth token for API calls
     */
    async getAuthToken() {
        try {
            const authData = await chrome.storage.local.get(['authToken', 'googleAccessToken']);
            return authData.authToken || authData.googleAccessToken || '';
        }
        catch (error) {
            console.warn('⚠️ UNIFIED_STORAGE: Failed to get auth token:', error);
            return '';
        }
    }
    /**
     * Save setting to both Chrome storage and database
     */
    async saveSetting(key, value, options = {}) {
        try {
            console.log(`💾 UNIFIED_STORAGE: Saving ${key} =`, value);
            // Step 1: Save to Chrome storage
            await chrome.storage.local.set({ [key]: value });
            console.log(`✅ UNIFIED_STORAGE: Saved ${key} to Chrome storage`);
            // Step 2: Save to database via API (unless skipped)
            if (!options.skipApi && window.currentUser && window.currentUser.id) {
                try {
                    const apiKey = options.apiKey || key;
                    const preferencesKey = this.mapToPreferencesKey(apiKey);
                    const response = await fetch(`${this.apiBaseUrl}/v1/users/${window.currentUser.id}/preferences`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${await this.getAuthToken()}`
                        },
                        body: JSON.stringify({
                            preferences: {
                                [preferencesKey]: value
                            }
                        })
                    });
                    if (response.ok) {
                        console.log(`✅ UNIFIED_STORAGE: Saved ${key} to database`);
                    }
                    else {
                        const errorText = await response.text().catch(() => 'Unknown error');
                        console.warn(`⚠️ UNIFIED_STORAGE: Database save failed for ${key} (${response.status}): ${errorText}, but saved locally`);
                    }
                }
                catch (apiError) {
                    console.warn(`⚠️ UNIFIED_STORAGE: Database save error for ${key}, but saved locally:`, apiError);
                }
            }
            // Step 3: Update window.currentUser if available
            if (window.currentUser) {
                if (key === 'theme' || key === 'auraColor' || key === 'status' || key === 'visibilityEnabled') {
                    if (!window.currentUser.userMetadata) {
                        window.currentUser.userMetadata = {};
                    }
                    window.currentUser.userMetadata.preferences = window.currentUser.userMetadata.preferences || {};
                    window.currentUser.userMetadata.preferences[key] = value;
                }
                // Also update direct properties for backward compatibility
                if (key === 'auraColor') {
                    window.currentUser.auraColor = value;
                }
                if (key === 'status' || key === 'availability') {
                    const statusValue = value;
                    window.currentUser.availability = statusValue;
                    window.currentUser.status = statusValue;
                }
                if (key === 'visibilityEnabled' || key === 'isVisible') {
                    window.currentUser.isVisible = value;
                }
            }
            return true;
        }
        catch (error) {
            console.error(`❌ UNIFIED_STORAGE: Failed to save ${key}:`, error);
            return false;
        }
    }
    /**
     * Get setting from Chrome storage, with fallback to database
     */
    async getSetting(key, defaultValue = null, options = {}) {
        try {
            console.log(`📖 UNIFIED_STORAGE: Getting ${key}...`);
            // Step 1: Try Chrome storage first (fastest) - unless forceDatabase is true
            if (!options.forceDatabase) {
                const storageData = await chrome.storage.local.get([key]);
                if (storageData[key] !== undefined && storageData[key] !== null) {
                    console.log(`✅ UNIFIED_STORAGE: Found ${key} in Chrome storage:`, storageData[key]);
                    return storageData[key];
                }
            }
            else {
                console.log(`🔧 UNIFIED_STORAGE: forceDatabase=true, skipping Chrome storage for ${key}`);
            }
            // Step 2: Try database via API (unless skipped)
            if (!options.skipApi && window.currentUser && window.currentUser.id) {
                try {
                    const response = await fetch(`${this.apiBaseUrl}/v1/users/${window.currentUser.id}/preferences`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${await this.getAuthToken()}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        const apiKey = options.apiKey || key;
                        const preferencesKey = this.mapToPreferencesKey(apiKey);
                        if (data.preferences && data.preferences[preferencesKey] !== undefined) {
                            const value = data.preferences[preferencesKey];
                            console.log(`✅ UNIFIED_STORAGE: Found ${key} in database:`, value);
                            // Save to Chrome storage for faster access next time
                            await chrome.storage.local.set({ [key]: value });
                            return value;
                        }
                    }
                }
                catch (apiError) {
                    console.warn(`⚠️ UNIFIED_STORAGE: API read failed for ${key}, using default:`, apiError);
                }
            }
            // Step 3: Try window.currentUser as fallback
            if (window.currentUser) {
                if (window.currentUser.userMetadata && window.currentUser.userMetadata.preferences) {
                    const prefs = window.currentUser.userMetadata.preferences;
                    if (prefs[key] !== undefined) {
                        const value = prefs[key];
                        console.log(`✅ UNIFIED_STORAGE: Found ${key} in window.currentUser:`, value);
                        return value;
                    }
                }
                // Direct properties for backward compatibility
                if (key === 'auraColor' && window.currentUser.auraColor) {
                    return window.currentUser.auraColor;
                }
                if ((key === 'status' || key === 'availability') && window.currentUser.availability) {
                    return window.currentUser.availability;
                }
                if ((key === 'visibilityEnabled' || key === 'isVisible') && window.currentUser.isVisible !== undefined) {
                    return window.currentUser.isVisible;
                }
            }
            // Step 4: Return default value
            console.log(`ℹ️ UNIFIED_STORAGE: Using default value for ${key}:`, defaultValue);
            return defaultValue;
        }
        catch (error) {
            console.error(`❌ UNIFIED_STORAGE: Failed to get ${key}:`, error);
            return defaultValue;
        }
    }
    /**
     * Map setting key to preferences key in database
     */
    mapToPreferencesKey(key) {
        const mapping = {
            'theme': 'theme',
            'auraColor': 'auraColor',
            'auraIntensity': 'auraIntensity',
            'status': 'status',
            'availability': 'status',
            'visibilityEnabled': 'isVisible',
            'isVisible': 'isVisible',
            'displayName': 'displayName',
            'headline': 'headline'
        };
        return mapping[key] || key;
    }
    /**
     * Save multiple settings at once
     */
    async saveSettings(settings, options = {}) {
        const results = {};
        for (const [key, value] of Object.entries(settings)) {
            results[key] = await this.saveSetting(key, value, options);
        }
        return results;
    }
    /**
     * Get multiple settings at once
     */
    async getSettings(keys, defaults = {}, options = {}) {
        const results = {};
        for (const key of keys) {
            results[key] = await this.getSetting(key, defaults[key], options);
        }
        return results;
    }
}
// Create singleton instance
const unifiedSettingsStorage = new UnifiedSettingsStorage();
// Export for global access
if (typeof window !== 'undefined') {
// Export removed - use ES6 imports instead
    window.unifiedSettingsStorage = unifiedSettingsStorage;
    // Also create convenience functions
    window.saveSetting = (key, value, options) => unifiedSettingsStorage.saveSetting(key, value, options);
    window.getSetting = (key, defaultValue, options) => unifiedSettingsStorage.getSetting(key, defaultValue, options);
    window.saveSettings = (settings, options) => unifiedSettingsStorage.saveSettings(settings, options);
    window.getSettings = (keys, defaults, options) => unifiedSettingsStorage.getSettings(keys, defaults, options);
}
console.log('✅ UNIFIED_STORAGE: UnifiedSettingsStorage loaded');
export default unifiedSettingsStorage;
