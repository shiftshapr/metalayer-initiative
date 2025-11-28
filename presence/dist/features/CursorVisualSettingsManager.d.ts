/**
 * CursorVisualSettingsManager - Manages live cursor visual style settings
 *
 * Allows users to select cursor appearance:
 * - Regular (default browser cursor)
 * - Aura color mini-circle
 * - Avatar
 * - Uploaded custom image
 */
import type { CursorVisualStyle } from '../core/CursorParkManager.js';
declare class CursorVisualSettingsManager {
    private visualStyle;
    private customImageUrl?;
    private isInitialized;
    /**
     * Initialize the settings manager
     */
    initialize(): Promise<void>;
    /**
     * Load settings from storage
     */
    private loadSettings;
    /**
     * Save settings to storage
     */
    private saveSettings;
    /**
     * Setup settings UI in the settings tab
     * FIX: Work with existing HTML structure instead of creating new section
     */
    private setupSettingsUI;
    /**
     * Sync visualization state with HTML
     */
    private syncVisualizationState;
    /**
     * Attach event listeners to settings UI
     */
    private attachEventListeners;
    /**
     * Get current visual style
     */
    getVisualStyle(): CursorVisualStyle;
    /**
     * Get custom image URL
     */
    getCustomImageUrl(): string | undefined;
}
declare const cursorVisualSettingsManagerInstance: CursorVisualSettingsManager;
export { CursorVisualSettingsManager, cursorVisualSettingsManagerInstance };
export default CursorVisualSettingsManager;
//# sourceMappingURL=CursorVisualSettingsManager.d.ts.map