/**
 * CursorVisualSettingsManager - Manages live cursor visual style settings
 *
 * Allows users to select cursor appearance:
 * - Regular (default browser cursor)
 * - Aura color mini-circle
 * - Avatar
 * - Uploaded custom image
 */
class CursorVisualSettingsManager {
    constructor() {
        this.visualStyle = 'regular';
        this.isInitialized = false;
    }
    /**
     * Initialize the settings manager
     */
    async initialize() {
        if (this.isInitialized)
            return;
        // Load saved settings
        await this.loadSettings();
        // Setup UI if settings tab is available
        this.setupSettingsUI();
        this.isInitialized = true;
        console.log('✅ CURSOR_VISUAL_SETTINGS: Initialized');
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
            console.error('❌ CURSOR_VISUAL_SETTINGS: Failed to load settings:', error);
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
            console.log('✅ CURSOR_VISUAL_SETTINGS: Settings saved');
        }
        catch (error) {
            console.error('❌ CURSOR_VISUAL_SETTINGS: Failed to save settings:', error);
        }
    }
    /**
     * Setup settings UI in the settings tab
     */
    setupSettingsUI() {
        // Wait for settings tab to be available
        const checkSettingsTab = () => {
            const settingsTab = document.getElementById('settings-tab');
            if (!settingsTab) {
                setTimeout(checkSettingsTab, 500);
                return;
            }
            // Find or create cursor visual settings section
            let cursorVisualSection = document.getElementById('cursor-visual-settings-section');
            if (!cursorVisualSection) {
                cursorVisualSection = document.createElement('div');
                cursorVisualSection.id = 'cursor-visual-settings-section';
                cursorVisualSection.className = 'settings-section';
                cursorVisualSection.innerHTML = `
          <h4>Live Cursor Visual Style</h4>
          <p class="settings-description">Choose how your cursor appears when live cursor is enabled</p>
          <div class="cursor-visual-options">
            <label class="cursor-visual-option">
              <input type="radio" name="cursor-visual-style" value="regular" ${this.visualStyle === 'regular' ? 'checked' : ''}>
              <span class="option-label">
                <span class="option-icon">🖱️</span>
                <span>Regular</span>
              </span>
            </label>
            <label class="cursor-visual-option">
              <input type="radio" name="cursor-visual-style" value="aura-circle" ${this.visualStyle === 'aura-circle' ? 'checked' : ''}>
              <span class="option-label">
                <span class="option-icon" style="width: 12px; height: 12px; border-radius: 50%; background: var(--aura-color, #33aa33); display: inline-block;"></span>
                <span>Aura Color Circle</span>
              </span>
            </label>
            <label class="cursor-visual-option">
              <input type="radio" name="cursor-visual-style" value="avatar" ${this.visualStyle === 'avatar' ? 'checked' : ''}>
              <span class="option-label">
                <span class="option-icon">👤</span>
                <span>Avatar</span>
              </span>
            </label>
            <label class="cursor-visual-option">
              <input type="radio" name="cursor-visual-style" value="custom-image" ${this.visualStyle === 'custom-image' ? 'checked' : ''}>
              <span class="option-label">
                <span class="option-icon">🖼️</span>
                <span>Custom Image</span>
              </span>
            </label>
          </div>
          <div class="cursor-custom-image-upload" id="cursor-custom-image-upload" style="display: ${this.visualStyle === 'custom-image' ? 'block' : 'none'}; margin-top: 12px;">
            <input type="file" id="cursor-custom-image-input" accept="image/*" style="display: none;">
            <button type="button" id="cursor-custom-image-btn" class="settings-btn">Upload Image</button>
            ${this.customImageUrl ? `<img src="${this.escapeHtml(this.customImageUrl)}" alt="Custom cursor" style="max-width: 48px; max-height: 48px; margin-left: 8px; border-radius: 4px;">` : ''}
          </div>
        `;
                // Insert after Live Cursor section
                const liveCursorSection = document.querySelector('#live-cursor-settings, [data-section="live-cursor"]');
                if (liveCursorSection && liveCursorSection.parentElement) {
                    liveCursorSection.parentElement.insertBefore(cursorVisualSection, liveCursorSection.nextSibling);
                }
                else {
                    // Fallback: append to settings tab
                    settingsTab.appendChild(cursorVisualSection);
                }
            }
            // Setup event listeners
            this.attachEventListeners();
        };
        checkSettingsTab();
    }
    /**
     * Attach event listeners to settings UI
     */
    attachEventListeners() {
        // Radio button changes
        const radios = document.querySelectorAll('input[name="cursor-visual-style"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
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
        // Custom image upload
        const uploadBtn = document.getElementById('cursor-custom-image-btn');
        const fileInput = document.getElementById('cursor-custom-image-input');
        uploadBtn?.addEventListener('click', () => {
            fileInput?.click();
        });
        fileInput?.addEventListener('change', async (e) => {
            const target = e.target;
            const file = target.files?.[0];
            if (file) {
                // Convert to data URL
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.customImageUrl = event.target?.result;
                    this.saveSettings();
                    // Update preview
                    const preview = document.querySelector('#cursor-custom-image-upload img');
                    if (preview) {
                        preview.src = this.customImageUrl;
                    }
                    else {
                        // Create preview if it doesn't exist
                        const uploadSection = document.getElementById('cursor-custom-image-upload');
                        if (uploadSection) {
                            const img = document.createElement('img');
                            img.src = this.customImageUrl;
                            img.alt = 'Custom cursor';
                            img.style.cssText = 'max-width: 48px; max-height: 48px; margin-left: 8px; border-radius: 4px;';
                            uploadSection.appendChild(img);
                        }
                    }
                };
                reader.readAsDataURL(file);
            }
        });
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
    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
// Create singleton instance
const cursorVisualSettingsManagerInstance = new CursorVisualSettingsManager();
// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            cursorVisualSettingsManagerInstance.initialize();
        });
    }
    else {
        cursorVisualSettingsManagerInstance.initialize();
    }
    // Export to window
    window.cursorVisualSettingsManager = cursorVisualSettingsManagerInstance;
    console.log('✅ CURSOR_VISUAL_SETTINGS: Exported to window');
}
export { CursorVisualSettingsManager, cursorVisualSettingsManagerInstance };
export default CursorVisualSettingsManager;
