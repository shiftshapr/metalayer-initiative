/**
 * VISIBILITY STORAGE SERVICE - Storage Abstraction Layer
 *
 * Abstracts storage operations for visibility settings.
 * Handles UserPreferencesManager, UnifiedSettingsStorage, and Chrome storage fallbacks.
 * Phase 2: Core Logic Separation - Service Abstraction
 */
/**
 * VisibilityStorage service implementation
 * Provides unified storage interface with fallback chain
 */
export class VisibilityStorage {
    constructor(dependencies) {
        this.dependencies = dependencies;
    }
    /**
     * Get visibility setting
     * Priority: UserPreferencesManager > UnifiedSettingsStorage > Chrome Storage
     */
    async getVisibility() {
        const { userPreferencesManager, unifiedSettingsStorage } = this.dependencies;
        // Priority 1: UserPreferencesManager
        if (userPreferencesManager?.isInitialized) {
            const pref = await userPreferencesManager.getPreference('isVisible');
            if (typeof pref === 'boolean')
                return pref;
            if (pref === 'true' || pref === 1)
                return true;
            if (pref === 'false' || pref === 0 || pref === null)
                return false;
        }
        // Priority 2: UnifiedSettingsStorage
        if (unifiedSettingsStorage?.getSetting) {
            const dbValue = await unifiedSettingsStorage.getSetting('visibilityEnabled', null, {
                apiKey: 'isVisible',
                forceDatabase: true
            });
            if (typeof dbValue === 'boolean')
                return dbValue;
        }
        // Priority 3: Chrome Storage
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            const storage = await chrome.storage.local.get(['visibilityEnabled']);
            if (storage.visibilityEnabled !== undefined) {
                return storage.visibilityEnabled === true;
            }
        }
        // Default: visible
        return true;
    }
    /**
     * Save visibility setting
     */
    async saveVisibility(value) {
        const { userPreferencesManager, saveSetting } = this.dependencies;
        // Priority 1: UserPreferencesManager
        if (userPreferencesManager?.isInitialized) {
            await userPreferencesManager.savePreference('isVisible', value);
            return;
        }
        // Priority 2: saveSetting function
        if (saveSetting) {
            await saveSetting('visibilityEnabled', value, { apiKey: 'isVisible' });
            return;
        }
        // Priority 3: Chrome Storage
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            await chrome.storage.local.set({ visibilityEnabled: value });
        }
    }
    /**
     * Get status setting
     */
    async getStatus() {
        const { userPreferencesManager, unifiedSettingsStorage, getSetting } = this.dependencies;
        // Priority 1: UserPreferencesManager
        if (userPreferencesManager?.isInitialized) {
            const pref = await userPreferencesManager.getPreference('globalAvailability');
            if (typeof pref === 'string')
                return pref;
        }
        // Priority 2: UnifiedSettingsStorage or getSetting
        if (unifiedSettingsStorage?.getSetting) {
            const status = await unifiedSettingsStorage.getSetting('status', 'AVAILABLE', { apiKey: 'status' });
            if (typeof status === 'string')
                return status;
        }
        else if (getSetting) {
            const status = await getSetting('status', 'AVAILABLE', { apiKey: 'status' });
            if (typeof status === 'string')
                return status;
        }
        // Priority 3: Chrome Storage
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            const storage = await chrome.storage.local.get(['availability', 'status']);
            if (storage.availability)
                return String(storage.availability);
            if (storage.status)
                return String(storage.status);
        }
        return 'AVAILABLE';
    }
    /**
     * Save status setting
     */
    async saveStatus(value) {
        const { userPreferencesManager, saveSetting } = this.dependencies;
        // Priority 1: UserPreferencesManager
        if (userPreferencesManager?.isInitialized) {
            await userPreferencesManager.savePreference('globalAvailability', value);
            return;
        }
        // Priority 2: saveSetting function
        if (saveSetting) {
            await saveSetting('status', value);
            await saveSetting('availability', value, { skipApi: true });
            return;
        }
        // Priority 3: Chrome Storage
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            await chrome.storage.local.set({ availability: value, status: value });
        }
    }
    /**
     * Get aura color
     */
    async getAuraColor() {
        const { userPreferencesManager } = this.dependencies;
        // Priority 1: UserPreferencesManager
        if (userPreferencesManager?.isInitialized) {
            const pref = await userPreferencesManager.getPreference('auraColor');
            if (typeof pref === 'string')
                return pref;
        }
        // Priority 2: Chrome Storage
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            const storage = await chrome.storage.local.get(['auraColor']);
            if (storage.auraColor)
                return String(storage.auraColor);
        }
        return '#98d416'; // Default
    }
    /**
     * Save aura color
     */
    async saveAuraColor(value) {
        const { userPreferencesManager, saveSetting } = this.dependencies;
        if (userPreferencesManager?.isInitialized) {
            await userPreferencesManager.savePreference('auraColor', value);
            return;
        }
        if (saveSetting) {
            await saveSetting('auraColor', value);
            return;
        }
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            await chrome.storage.local.set({ auraColor: value });
        }
    }
    /**
     * Get aura intensity
     */
    async getAuraIntensity() {
        const { userPreferencesManager } = this.dependencies;
        if (userPreferencesManager?.isInitialized) {
            const pref = await userPreferencesManager.getPreference('auraIntensity');
            if (typeof pref === 'number')
                return pref;
        }
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            const storage = await chrome.storage.local.get(['auraIntensity']);
            if (storage.auraIntensity !== undefined) {
                return Number(storage.auraIntensity);
            }
        }
        return 0.5; // Default
    }
    /**
     * Save aura intensity
     */
    async saveAuraIntensity(value) {
        const { userPreferencesManager, saveSetting } = this.dependencies;
        if (userPreferencesManager?.isInitialized) {
            await userPreferencesManager.savePreference('auraIntensity', value);
            return;
        }
        if (saveSetting) {
            await saveSetting('auraIntensity', value);
            return;
        }
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            await chrome.storage.local.set({ auraIntensity: value });
        }
    }
    /**
     * Get display name
     */
    async getDisplayName() {
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            const storage = await chrome.storage.local.get(['displayName']);
            if (storage.displayName)
                return String(storage.displayName);
        }
        return '';
    }
    /**
     * Save display name
     */
    async saveDisplayName(value) {
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            await chrome.storage.local.set({ displayName: value });
        }
    }
}
