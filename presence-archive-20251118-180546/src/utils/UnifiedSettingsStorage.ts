/**
 * UNIFIED SETTINGS STORAGE - TypeScript Version
 * Unified functions to store and retrieve settings from Chrome local storage AND database
 * Works for: theme, aura, status, visibility, and other user preferences
 */

import type { User } from '../types/index.js';

type SettingKey = 'theme' | 'auraColor' | 'auraIntensity' | 'status' | 'availability' | 'visibilityEnabled' | 'isVisible' | 'displayName' | 'headline';
type SettingValue = string | number | boolean | null;

interface SaveOptions {
  skipApi?: boolean;
  apiKey?: string;
}

interface GetOptions {
  skipApi?: boolean;
  apiKey?: string;
  forceDatabase?: boolean;
}

interface PreferencesMapping {
  [key: string]: string;
}

// Declare window globals
declare const window: Window & {
  currentUser?: User;
  UnifiedSettingsStorage?: typeof UnifiedSettingsStorage;
  unifiedSettingsStorage?: UnifiedSettingsStorage;
  saveSetting?: (key: string, value: SettingValue, options?: SaveOptions) => Promise<boolean>;
  getSetting?: (key: string, defaultValue?: SettingValue, options?: GetOptions) => Promise<SettingValue>;
  saveSettings?: (settings: Record<string, SettingValue>, options?: SaveOptions) => Promise<Record<string, boolean>>;
  getSettings?: (keys: string[], defaults?: Record<string, SettingValue>, options?: GetOptions) => Promise<Record<string, SettingValue>>;
};

// Declare chrome storage API
declare const chrome: {
  storage: {
    local: {
      get: (keys: string[]) => Promise<Record<string, any>>;
      set: (items: Record<string, any>) => Promise<void>;
    };
  };
};

export class UnifiedSettingsStorage {
  private readonly apiBaseUrl: string = 'http://216.238.91.120:3002';

  /**
   * Get auth token for API calls
   */
  async getAuthToken(): Promise<string> {
    try {
      const authData = await chrome.storage.local.get(['authToken', 'googleAccessToken']);
      return authData.authToken || authData.googleAccessToken || '';
    } catch (error) {
      console.warn('⚠️ UNIFIED_STORAGE: Failed to get auth token:', error);
      return '';
    }
  }

  /**
   * Save setting to both Chrome storage and database
   */
  async saveSetting(key: string, value: SettingValue, options: SaveOptions = {}): Promise<boolean> {
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
          } else {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.warn(`⚠️ UNIFIED_STORAGE: Database save failed for ${key} (${response.status}): ${errorText}, but saved locally`);
          }
        } catch (apiError) {
          console.warn(`⚠️ UNIFIED_STORAGE: Database save error for ${key}, but saved locally:`, apiError);
        }
      }

      // Step 3: Update window.currentUser if available
      if (window.currentUser) {
        if (key === 'theme' || key === 'auraColor' || key === 'status' || key === 'visibilityEnabled') {
          if (!window.currentUser.userMetadata) {
            window.currentUser.userMetadata = {};
          }
          (window.currentUser.userMetadata as any).preferences = (window.currentUser.userMetadata as any).preferences || {};
          ((window.currentUser.userMetadata as any).preferences as any)[key] = value;
        }
        
        // Also update direct properties for backward compatibility
        if (key === 'auraColor') {
          window.currentUser.auraColor = value as string;
        }
        if (key === 'status' || key === 'availability') {
          const statusValue = value as string;
          window.currentUser.availability = statusValue;
          window.currentUser.status = statusValue as 'online' | 'offline' | 'inactive' | 'AVAILABLE' | 'BUSY' | 'AWAY';
        }
        if (key === 'visibilityEnabled' || key === 'isVisible') {
          window.currentUser.isVisible = value as boolean;
        }
      }

      return true;
    } catch (error) {
      console.error(`❌ UNIFIED_STORAGE: Failed to save ${key}:`, error);
      return false;
    }
  }

  /**
   * Get setting from Chrome storage, with fallback to database
   */
  async getSetting(key: string, defaultValue: SettingValue = null, options: GetOptions = {}): Promise<SettingValue> {
    try {
      console.log(`📖 UNIFIED_STORAGE: Getting ${key}...`);

      // Step 1: Try Chrome storage first (fastest) - unless forceDatabase is true
      if (!options.forceDatabase) {
        const storageData = await chrome.storage.local.get([key]);
        if (storageData[key] !== undefined && storageData[key] !== null) {
          console.log(`✅ UNIFIED_STORAGE: Found ${key} in Chrome storage:`, storageData[key]);
          return storageData[key];
        }
      } else {
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
        } catch (apiError) {
          console.warn(`⚠️ UNIFIED_STORAGE: API read failed for ${key}, using default:`, apiError);
        }
      }

      // Step 3: Try window.currentUser as fallback
      if (window.currentUser) {
        if (window.currentUser.userMetadata && (window.currentUser.userMetadata as any).preferences) {
          const prefs = (window.currentUser.userMetadata as any).preferences;
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
    } catch (error) {
      console.error(`❌ UNIFIED_STORAGE: Failed to get ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Map setting key to preferences key in database
   */
  mapToPreferencesKey(key: string): string {
    const mapping: PreferencesMapping = {
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
  async saveSettings(settings: Record<string, SettingValue>, options: SaveOptions = {}): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(settings)) {
      results[key] = await this.saveSetting(key, value, options);
    }
    return results;
  }

  /**
   * Get multiple settings at once
   */
  async getSettings(keys: string[], defaults: Record<string, SettingValue> = {}, options: GetOptions = {}): Promise<Record<string, SettingValue>> {
    const results: Record<string, SettingValue> = {};
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
  (window as typeof window & {
    UnifiedSettingsStorage: typeof UnifiedSettingsStorage;
    unifiedSettingsStorage: UnifiedSettingsStorage;
    saveSetting: typeof unifiedSettingsStorage.saveSetting;
    getSetting: typeof unifiedSettingsStorage.getSetting;
    saveSettings: typeof unifiedSettingsStorage.saveSettings;
    getSettings: typeof unifiedSettingsStorage.getSettings;
  }).UnifiedSettingsStorage = UnifiedSettingsStorage;
  (window as typeof window & { unifiedSettingsStorage: UnifiedSettingsStorage }).unifiedSettingsStorage = unifiedSettingsStorage;
  
  // Also create convenience functions
  (window as typeof window & { saveSetting: typeof unifiedSettingsStorage.saveSetting }).saveSetting = (key: string, value: SettingValue, options?: SaveOptions) => unifiedSettingsStorage.saveSetting(key, value, options);
  (window as typeof window & { getSetting: typeof unifiedSettingsStorage.getSetting }).getSetting = (key: string, defaultValue?: SettingValue, options?: GetOptions) => unifiedSettingsStorage.getSetting(key, defaultValue, options);
  (window as typeof window & { saveSettings: typeof unifiedSettingsStorage.saveSettings }).saveSettings = (settings: Record<string, SettingValue>, options?: SaveOptions) => unifiedSettingsStorage.saveSettings(settings, options);
  (window as typeof window & { getSettings: typeof unifiedSettingsStorage.getSettings }).getSettings = (keys: string[], defaults?: Record<string, SettingValue>, options?: GetOptions) => unifiedSettingsStorage.getSettings(keys, defaults, options);
}

console.log('✅ UNIFIED_STORAGE: UnifiedSettingsStorage loaded');

export default unifiedSettingsStorage;

