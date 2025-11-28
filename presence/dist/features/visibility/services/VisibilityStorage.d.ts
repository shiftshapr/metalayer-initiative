/**
 * VISIBILITY STORAGE SERVICE - Storage Abstraction Layer
 *
 * Abstracts storage operations for visibility settings.
 * Handles UserPreferencesManager, UnifiedSettingsStorage, and Chrome storage fallbacks.
 * Phase 2: Core Logic Separation - Service Abstraction
 */
import type { IVisibilityStorage } from '../core/VisibilityTypes.js';
type PreferenceValue = string | number | boolean | null;
type PreferencePrimitive = string | number | boolean;
type SettingValue = string | number | boolean | null;
interface StorageFunctionOptions {
    apiKey?: string;
    skipApi?: boolean;
    forceDatabase?: boolean;
    batch?: boolean;
    [key: string]: unknown;
}
type UnifiedSettingsStorage = {
    getSetting: (key: string, defaultValue?: SettingValue | null, options?: StorageFunctionOptions) => Promise<SettingValue | null>;
};
type SaveSettingFn = (key: string, value: SettingValue, options?: StorageFunctionOptions) => Promise<void>;
type GetSettingFn = (key: string, defaultValue?: SettingValue | null, options?: StorageFunctionOptions) => Promise<SettingValue | null>;
export interface VisibilityStorageDependencies {
    userPreferencesManager?: {
        isInitialized: boolean;
        getPreference: (key: string) => Promise<PreferenceValue>;
        savePreference: (key: string, value: PreferencePrimitive) => Promise<boolean | void>;
    };
    unifiedSettingsStorage?: UnifiedSettingsStorage;
    saveSetting?: SaveSettingFn;
    getSetting?: GetSettingFn;
}
/**
 * VisibilityStorage service implementation
 * Provides unified storage interface with fallback chain
 */
export declare class VisibilityStorage implements IVisibilityStorage {
    private dependencies;
    constructor(dependencies: VisibilityStorageDependencies);
    /**
     * Get visibility setting
     * Priority: UserPreferencesManager > UnifiedSettingsStorage > Chrome Storage
     */
    getVisibility(): Promise<boolean>;
    /**
     * Save visibility setting
     */
    saveVisibility(value: boolean): Promise<void>;
    /**
     * Get status setting
     */
    getStatus(): Promise<string>;
    /**
     * Save status setting
     */
    saveStatus(value: string): Promise<void>;
    /**
     * Get aura color
     */
    getAuraColor(): Promise<string>;
    /**
     * Save aura color
     */
    saveAuraColor(value: string): Promise<void>;
    /**
     * Get aura intensity
     */
    getAuraIntensity(): Promise<number>;
    /**
     * Save aura intensity
     */
    saveAuraIntensity(value: number): Promise<void>;
    /**
     * Get display name
     */
    getDisplayName(): Promise<string>;
    /**
     * Save display name
     */
    saveDisplayName(value: string): Promise<void>;
}
export {};
//# sourceMappingURL=VisibilityStorage.d.ts.map