/**
 * VISIBILITY SETTINGS MANAGER
 * Handles all visibility-related settings: Visible, Status, Aura, Headline, Display Name
 * TypeScript + ES6 Module
 */
declare class VisibilitySettingsManager {
    private isInitialized;
    private originalValues;
    private visibilityToggle;
    private visibilityStatusText;
    private statusSelect;
    private auraColorPicker;
    private auraColorHex;
    private auraIntensitySlider;
    private auraIntensityValue;
    private displayNameInput;
    private displayNameSaveBtn;
    private displayNameResetBtn;
    private themeToggle;
    constructor();
    /**
     * Initialize visibility settings manager
     */
    initialize(): Promise<void>;
    /**
     * CRITICAL FIX: Ensure event listeners are attached (call when settings tab opens)
     */
    ensureEventListeners(): Promise<void>;
    /**
     * Set up event listeners
     */
    setupEventListeners(): void;
    /**
     * Load current settings from storage/API
     */
    loadSettings(): Promise<void>;
    /**
     * Update visibility status text and toggle slider
     */
    updateVisibilityStatus(): void;
    /**
     * Save visibility setting (ROOT CAUSE FIX: Use unified storage and update stateManagerInstance.getState("currentUser") as User | undefined)
     */
    saveVisibility(): Promise<void>;
    /**
     * Save status setting (ROOT CAUSE FIX: Use unified storage)
     */
    saveStatus(): Promise<void>;
    /**
     * Save aura settings (ROOT CAUSE FIX: Use unified storage)
     */
    saveAura(): Promise<void>;
    /**
     * Save display name
     */
    saveDisplayName(): Promise<void>;
    /**
     * Reset display name to original
     */
    resetDisplayName(): void;
    /**
     * Update theme status text and toggle slider
     */
    updateThemeStatus(): void;
    /**
     * Save theme setting (ROOT CAUSE FIX: Use unified storage and apply theme immediately)
     */
    saveTheme(): Promise<void>;
    /**
     * Get auth token for API calls
     */
    getAuthToken(): Promise<string>;
    /**
     * Fallback getSetting if unified storage not available
     */
    getSettingFallback(key: string, defaultValue: any, options?: any): Promise<any>;
}
declare const visibilitySettingsManagerInstance: VisibilitySettingsManager;
export { VisibilitySettingsManager, visibilitySettingsManagerInstance };
export default VisibilitySettingsManager;
//# sourceMappingURL=VisibilitySettingsManager.d.ts.map