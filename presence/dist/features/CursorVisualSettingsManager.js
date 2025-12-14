/**
 * CursorVisualSettingsManager - Manages live cursor visual style settings
 *
 * Allows users to select cursor appearance:
 * - Regular (default browser cursor)
 * - Aura color mini-circle
 * - Avatar
 * - Uploaded custom image
 */
import { handleError } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
class CursorVisualSettingsManager {
    constructor() {
        this.visualStyle = 'regular';
        this.isInitialized = false;
    }
    /**
     * Initialize the settings manager
     */
    async initialize() {
        try {
            if (this.isInitialized)
                return;
            // Load saved settings
            await this.loadSettings();
            // Setup UI if settings tab is available
            this.setupSettingsUI();
            this.isInitialized = true;
            Logger.debug('✅ CURSOR_VISUAL_SETTINGS: Initialized', null, 'cursor');
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'initialize',
                    component: 'CursorVisualSettingsManager'
                }
            });
        }
    }
    /**
     * Load settings from storage
     */
    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['cursorVisualStyle', 'cursorCustomImageUrl']);
            this.visualStyle = result.cursorVisualStyle || 'regular';
            this.customImageUrl = result.cursorCustomImageUrl;
            // Apply to cursor park manager
            const win = window;
            if (win.cursorParkManager) {
                win.cursorParkManager.setVisualStyle(this.visualStyle, this.customImageUrl);
            }
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'CursorVisualSettings'
                }
            });
            ;
        }
    }
    /**
     * Save settings to storage
     */
    async saveSettings() {
        try {
            await chrome.storage.local.set({
                cursorVisualStyle: this.visualStyle,
                cursorCustomImageUrl: this.customImageUrl
            });
            // Apply to cursor park manager
            const win = window;
            if (win.cursorParkManager) {
                win.cursorParkManager.setVisualStyle(this.visualStyle, this.customImageUrl);
            }
            Logger.debug('✅ CURSOR_VISUAL_SETTINGS: Settings saved', null, 'cursor');
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'catch',
                    component: 'CursorVisualSettings'
                }
            });
            ;
        }
    }
    /**
     * Setup settings UI in the settings tab
     * FIX: Work with existing HTML structure instead of creating new section
     */
    setupSettingsUI() {
        // Wait for settings tab to be available
        const checkSettingsTab = () => {
            const settingsTab = document.getElementById('settings-tab');
            if (!settingsTab) {
                setTimeout(checkSettingsTab, 500);
                return;
            }
            // Check if visualization radios already exist in HTML
            const existingRadios = document.querySelectorAll('input[name="cursor-visual-style"]');
            if (existingRadios.length > 0) {
                // HTML already has the structure, just sync state and attach listeners
                this.syncVisualizationState();
                this.attachEventListeners();
                return;
            }
            // If HTML doesn't have the structure yet, wait a bit more
            setTimeout(checkSettingsTab, 500);
        };
        checkSettingsTab();
    }
    /**
     * Sync visualization state with HTML
     */
    syncVisualizationState() {
        // Set checked state based on saved preference
        const radios = document.querySelectorAll('input[name="cursor-visual-style"]');
        radios.forEach(radio => {
            const input = radio;
            if (input.value === this.visualStyle) {
                input.checked = true;
            }
        });
        // Update aura preview color
        const auraPreview = document.getElementById('cursor-aura-preview');
        const avatarPreview = document.getElementById('cursor-avatar-preview');
        if (auraPreview || avatarPreview) {
            // Get aura color from settings
            chrome.storage.local.get(['auraColor'], (result) => {
                const auraColor = typeof result.auraColor === 'string' ? result.auraColor : '#98d416';
                if (auraPreview) {
                    auraPreview.style.background = auraColor;
                }
                if (avatarPreview) {
                    avatarPreview.style.background = auraColor;
                    avatarPreview.style.borderColor = auraColor;
                }
            });
        }
        // Show/hide custom image upload
        const uploadSection = document.getElementById('cursor-custom-image-upload');
        if (uploadSection) {
            uploadSection.style.display = this.visualStyle === 'custom-image' ? 'block' : 'none';
        }
        // Show custom image preview if available
        if (this.customImageUrl) {
            const preview = document.getElementById('cursor-custom-image-preview');
            if (preview) {
                preview.src = this.customImageUrl;
                preview.style.display = 'inline-block';
            }
        }
    }
    /**
     * Attach event listeners to settings UI
     */
    attachEventListeners() {
        // Remove existing listeners to prevent duplicates
        const radios = document.querySelectorAll('input[name="cursor-visual-style"]');
        radios.forEach(radio => {
            const newRadio = radio.cloneNode(true);
            radio.parentNode?.replaceChild(newRadio, radio);
            newRadio.addEventListener('change', (e) => {
                const target = e.target;
                this.visualStyle = target.value;
                this.saveSettings();
                // Show/hide custom image upload
                const uploadSection = document.getElementById('cursor-custom-image-upload');
                if (uploadSection) {
                    uploadSection.style.display = this.visualStyle === 'custom-image' ? 'block' : 'none';
                }
            });
        });
        // Custom image upload - remove existing listeners first
        const uploadBtn = document.getElementById('cursor-custom-image-btn');
        const fileInput = document.getElementById('cursor-custom-image-input');
        if (uploadBtn) {
            const newBtn = uploadBtn.cloneNode(true);
            uploadBtn.parentNode?.replaceChild(newBtn, uploadBtn);
            newBtn.addEventListener('click', () => {
                fileInput?.click();
            });
        }
        if (fileInput) {
            const newInput = fileInput.cloneNode(true);
            fileInput.parentNode?.replaceChild(newInput, fileInput);
            newInput.addEventListener('change', async (e) => {
                const target = e.target;
                const file = target.files?.[0];
                if (file) {
                    // Convert to data URL
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.customImageUrl = event.target?.result;
                        this.saveSettings();
                        // Update preview
                        const preview = document.getElementById('cursor-custom-image-preview');
                        if (preview) {
                            preview.src = this.customImageUrl;
                            preview.style.display = 'inline-block';
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }
    /**
     * Get current visual style
     */
    getVisualStyle() {
        return this.visualStyle;
    }
    /**
     * Get custom image URL
     */
    getCustomImageUrl() {
        return this.customImageUrl;
    }
}
// Create singleton instance
const cursorVisualSettingsManagerInstance = new CursorVisualSettingsManager();
// Initialize when DOM is ready
const bootstrapCursorVisualSettingsManager = () => {
    const win = window;
    win.cursorVisualSettingsManager = cursorVisualSettingsManagerInstance;
    void cursorVisualSettingsManagerInstance.initialize();
};
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrapCursorVisualSettingsManager);
    }
    else {
        bootstrapCursorVisualSettingsManager();
    }
}
export { CursorVisualSettingsManager, cursorVisualSettingsManagerInstance };
export default CursorVisualSettingsManager;
