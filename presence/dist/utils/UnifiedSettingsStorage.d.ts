/**
 * UNIFIED SETTINGS STORAGE - TypeScript Version
 * Unified functions to store and retrieve settings from Chrome local storage AND database
 * Works for: theme, aura, status, visibility, and other user preferences
 */
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
export declare class UnifiedSettingsStorage {
    private readonly apiBaseUrl;
    /**
     * Get auth token for API calls
     */
    getAuthToken(): Promise<string>;
    /**
     * Save setting to both Chrome storage and database
     */
    saveSetting(key: string, value: SettingValue, options?: SaveOptions): Promise<boolean>;
    /**
     * Get setting from Chrome storage, with fallback to database
     */
    getSetting(key: string, defaultValue?: SettingValue, options?: GetOptions): Promise<SettingValue>;
    /**
     * Map setting key to preferences key in database
     */
    mapToPreferencesKey(key: string): string;
    /**
     * Save multiple settings at once
     */
    saveSettings(settings: Record<string, SettingValue>, options?: SaveOptions): Promise<Record<string, boolean>>;
    /**
     * Get multiple settings at once
     */
    getSettings(keys: string[], defaults?: Record<string, SettingValue>, options?: GetOptions): Promise<Record<string, SettingValue>>;
}
declare const unifiedSettingsStorage: UnifiedSettingsStorage;
export default unifiedSettingsStorage;
//# sourceMappingURL=UnifiedSettingsStorage.d.ts.map