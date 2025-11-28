/**
 * VISIBILITY SETTINGS COMPONENT - Settings UI Component
 *
 * Phase 3: UI Component Extraction
 * - Extracted from VisibilitySettingsManager
 * - Manages settings UI and delegates to storage service
 */
import type { IVisibilityStorage } from '../core/VisibilityTypes.js';
/**
 * VisibilitySettings component
 * Manages visibility settings UI (visibility toggle, status, aura, display name, theme)
 */
export declare class VisibilitySettings {
    private storage;
    private visibilityToggle;
    private statusSelect;
    private auraColorPicker;
    private auraIntensitySlider;
    private displayNameInput;
    private themeToggle;
    private isInitialized;
    constructor(storage: IVisibilityStorage);
    /**
     * Initialize component
     */
    initialize(): Promise<void>;
    /**
     * Ensure event listeners are attached
     */
    ensureEventListeners(): Promise<void>;
    /**
     * Set up global event listeners for external communication
     * Listens for events from other modules (e.g., ProfileManager)
     */
    private setupGlobalEventListeners;
    /**
     * Update theme status (refresh theme toggle state)
     */
    private updateThemeStatus;
    /**
     * Set up event listeners
     */
    private setupEventListeners;
    /**
     * Load settings from storage
     */
    private loadSettings;
    /**
     * Save visibility setting
     */
    private saveVisibility;
    /**
     * Save status setting
     */
    private saveStatus;
    /**
     * Save aura settings
     */
    private saveAura;
    /**
     * Save display name
     */
    private saveDisplayName;
    /**
     * Save theme setting
     */
    private saveTheme;
    /**
     * Get visibility toggle element (for external access)
     */
    getVisibilityToggle(): HTMLInputElement | null;
}
//# sourceMappingURL=VisibilitySettings.d.ts.map