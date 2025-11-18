/**
 * UNIFIED STORAGE SYNC - Early Loading Module
 *
 * This module ensures all unified storage sync functions are available
 * immediately, even before ProfileManager.js fully loads.
 *
 * Functions are defined here and then re-exported by ProfileManager.js
 * to ensure they're always available.
 */
type AuraColor = string;
type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';
type Theme = 'light' | 'dark' | 'auto';
export declare function updateAuraColorEverywhere(color: AuraColor): Promise<boolean>;
export declare function getCurrentUserAuraColor(): Promise<string>;
export declare function updateAvailabilityEverywhere(availability: AvailabilityStatus): Promise<boolean>;
export declare function getCurrentUserAvailability(): Promise<AvailabilityStatus>;
export declare function updateThemeEverywhere(theme: Theme): Promise<boolean>;
export declare function getCurrentUserTheme(): Promise<Theme>;
export declare function syncStorageWithDatabase(): Promise<void>;
export {};
//# sourceMappingURL=UnifiedStorageSync.d.ts.map