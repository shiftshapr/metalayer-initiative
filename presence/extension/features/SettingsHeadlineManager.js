/**
 * SETTINGS HEADLINE MANAGER - CRUD Operations for Settings Headline
 * Handles Create, Read, Update, Delete operations for user headline
 *
 * Modeled exactly after DisplayNameManager pattern
 */
class SettingsHeadlineManager {
    constructor() {
        this.minLength = 20; // Min characters for headline
        this.maxLength = 1000; // Max characters for headline
        this.currentHeadline = null;
        this.originalHeadline = null;
        this.isInitialized = false;
        this.isEditing = false;
        this.headlineInput = null;
        this.charCount = null;
        this.charMax = null;
        this.saveBtn = null;
        this.cancelBtn = null;
        this.actionsDiv = null;
        this.menuContainer = null;
        this.menuBtn = null;
        this.menuDropdown = null;
        this.menuEdit = null;
        this.menuDelete = null;
        this.statusDiv = null;
    }
    /**
     * Initialize headline manager
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('⚠️ SETTINGS_HEADLINE: Already initialized');
            return;
        }
        console.log('🔧 SETTINGS_HEADLINE: Initializing headline manager...');
        try {
            // Get DOM elements
            this.headlineInput = document.getElementById('settings-headline-input');
            this.charCount = document.getElementById('headline-char-count');
            this.charMax = document.getElementById('headline-char-max');
            this.saveBtn = document.getElementById('headline-save-btn');
            this.cancelBtn = document.getElementById('headline-cancel-btn');
            this.actionsDiv = document.getElementById('headline-actions');
            this.menuContainer = document.getElementById('headline-menu-container');
            this.menuBtn = document.getElementById('headline-menu-btn');
            this.menuDropdown = document.getElementById('headline-menu-dropdown');
            this.menuEdit = document.getElementById('headline-menu-edit');
            this.menuDelete = document.getElementById('headline-menu-delete');
            this.statusDiv = document.getElementById('headline-status');
            if (!this.headlineInput || !this.charCount || !this.saveBtn || !this.cancelBtn) {
                console.warn('⚠️ SETTINGS_HEADLINE: Required DOM elements not found');
                return;
            }
            if (this.charMax) {
                this.charMax.textContent = String(this.maxLength); // Set max chars in UI
            }
            this.headlineInput.maxLength = this.maxLength; // Ensure input has max length
            this.headlineInput.minLength = this.minLength; // Ensure input has min length
            // Load existing headline
            await this.readHeadline();
            // Set up event listeners
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('✅ SETTINGS_HEADLINE: Headline manager initialized');
        }
        catch (error) {
            console.error('❌ SETTINGS_HEADLINE: Failed to initialize:', error);
        }
    }
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        if (!this.headlineInput)
            return;
        // Character count update
        this.headlineInput.addEventListener('input', () => {
            this.updateCharCount();
            if (!this.isEditing) {
                this.startEditing();
            }
        });
        // Save button
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => {
                this.saveHeadline();
            });
        }
        // Cancel button
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => {
                this.cancelEdit();
            });
        }
        // Menu button
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
        }
        // Menu edit
        if (this.menuEdit) {
            this.menuEdit.addEventListener('click', () => {
                this.startEditing();
                this.hideMenu();
            });
        }
        // Menu delete
        if (this.menuDelete) {
            this.menuDelete.addEventListener('click', () => {
                this.deleteHeadline();
                this.hideMenu();
            });
        }
        // Click outside to close menu
        document.addEventListener('click', (e) => {
            if (this.menuContainer && !this.menuContainer.contains(e.target)) {
                this.hideMenu();
            }
        });
        // Enter key to save (Ctrl+Enter or Cmd+Enter)
        this.headlineInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && this.isEditing) {
                e.preventDefault();
                this.saveHeadline();
            }
        });
        // Focus to manage editing state
        this.headlineInput.addEventListener('focus', () => {
            const hasContent = this.headlineInput ? this.headlineInput.value.trim().length > 0 : false;
            if (hasContent && !this.isEditing) {
                this.startEditing();
            }
            else if (!hasContent) {
                this.isEditing = true;
                this.updateUIState();
            }
        });
        console.log('✅ SETTINGS_HEADLINE: Event listeners attached');
    }
    /**
     * Update character count display
     */
    updateCharCount() {
        if (!this.headlineInput || !this.charCount)
            return;
        const currentLength = this.headlineInput.value.length;
        this.charCount.textContent = String(currentLength);
        // Update color based on length (ROOT CAUSE FIX: Char count is now in separate div below input)
        const charCountContainer = this.charCount.parentElement;
        if (charCountContainer) {
            if (currentLength > this.maxLength * 0.9) {
                charCountContainer.style.color = '#dc3545'; // Red
            }
            else if (currentLength > this.maxLength * 0.75) {
                charCountContainer.style.color = '#ffc107'; // Yellow
            }
            else if (currentLength < this.minLength && currentLength > 0) {
                charCountContainer.style.color = '#dc3545'; // Red if below minimum and not empty
            }
            else {
                charCountContainer.style.color = '#666'; // Gray
            }
        }
        // Update UI state to show/hide Save button based on validity
        this.updateUIState();
    }
    /**
     * READ: Load headline from storage/API
     */
    async readHeadline() {
        try {
            console.log('📖 SETTINGS_HEADLINE: Reading headline...');
            console.log('🔍 DIAGNOSTIC: Reading headline from UserPreferencesManager');
            // Use UserPreferencesManager (unified system)
            const userPreferencesManager = window.userPreferencesManager;
            if (userPreferencesManager && userPreferencesManager.isInitialized) {
                const headline = await userPreferencesManager.getPreference('headline');
                this.currentHeadline = (typeof headline === 'string' ? headline : '') || '';
                this.originalHeadline = (typeof headline === 'string' ? headline : '') || '';
                if (this.headlineInput) {
                    this.headlineInput.value = this.currentHeadline || '';
                }
                this.updateCharCount();
                this.updateUIState();
                console.log('✅ SETTINGS_HEADLINE: Headline loaded from UserPreferencesManager');
                console.log('🔍 DIAGNOSTIC: Headline value:', this.currentHeadline);
                return;
            }
            // Fallback to old system during transition
            console.log('⚠️ SETTINGS_HEADLINE: UserPreferencesManager not available, using fallback');
            // Try Chrome storage first
            const storageData = await chrome.storage.local.get(['settingsHeadline']);
            if (storageData.settingsHeadline) {
                this.currentHeadline = storageData.settingsHeadline;
                this.originalHeadline = storageData.settingsHeadline;
                if (this.headlineInput) {
                    this.headlineInput.value = this.currentHeadline || '';
                }
                this.updateCharCount();
                this.updateUIState();
                console.log('✅ SETTINGS_HEADLINE: Headline loaded from Chrome storage');
                return;
            }
            // Try API if available (DEPRECATED - will be removed after migration)
            if (window.currentUser && window.currentUser.id) {
                try {
                    const authToken = await this.getAuthToken();
                    const response = await fetch(`http://216.238.91.120:3002/v1/users/${window.currentUser.id}/preferences`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.preferences && data.preferences.headline) {
                            this.currentHeadline = data.preferences.headline;
                            this.originalHeadline = data.preferences.headline;
                            if (this.headlineInput) {
                                this.headlineInput.value = this.currentHeadline || '';
                            }
                            this.updateCharCount();
                            this.updateUIState();
                            await chrome.storage.local.set({ settingsHeadline: this.currentHeadline });
                            console.log('✅ SETTINGS_HEADLINE: Headline loaded from API');
                            return;
                        }
                    }
                }
                catch (apiError) {
                    console.warn('⚠️ SETTINGS_HEADLINE: API read failed:', apiError);
                }
            }
            // No headline found
            this.currentHeadline = '';
            this.originalHeadline = '';
            if (this.headlineInput) {
                this.headlineInput.value = '';
            }
            this.updateCharCount();
            this.updateUIState();
            console.log('ℹ️ SETTINGS_HEADLINE: No headline found, starting fresh');
        }
        catch (error) {
            console.error('❌ SETTINGS_HEADLINE: Failed to read headline:', error);
            this.showStatus('Error loading headline', 'error');
        }
    }
    /**
     * Update UI state based on headline content
     */
    updateUIState() {
        if (!this.headlineInput)
            return;
        const hasHeadline = this.headlineInput.value.trim().length > 0;
        const isValidEntry = this.headlineInput.value.trim().length >= this.minLength;
        // Show menu if headline exists and not editing
        if (this.menuContainer) {
            this.menuContainer.style.display = hasHeadline && !this.isEditing ? 'block' : 'none';
        }
        // Show actions (Save/Cancel) only when editing AND valid entry
        if (this.actionsDiv) {
            this.actionsDiv.style.display = (this.isEditing && isValidEntry) ? 'flex' : 'none';
        }
        // Disable input when not editing (if headline exists)
        if (hasHeadline && !this.isEditing) {
            this.headlineInput.style.pointerEvents = 'none';
            this.headlineInput.style.backgroundColor = '#f5f5f5';
            this.headlineInput.readOnly = true;
        }
        else {
            this.headlineInput.style.pointerEvents = 'auto';
            this.headlineInput.style.backgroundColor = '';
            this.headlineInput.readOnly = false;
        }
    }
    /**
     * Start editing headline
     */
    startEditing() {
        this.isEditing = true;
        this.updateUIState();
        if (this.headlineInput) {
            this.headlineInput.focus();
        }
    }
    /**
     * Toggle menu dropdown
     */
    toggleMenu() {
        if (this.menuDropdown) {
            const isVisible = this.menuDropdown.style.display === 'block';
            this.menuDropdown.style.display = isVisible ? 'none' : 'block';
        }
    }
    /**
     * Hide menu dropdown
     */
    hideMenu() {
        if (this.menuDropdown) {
            this.menuDropdown.style.display = 'none';
        }
    }
    /**
     * CREATE/UPDATE: Save headline
     */
    async saveHeadline() {
        try {
            if (!this.headlineInput)
                return;
            const newHeadline = this.headlineInput.value.trim();
            // ROOT CAUSE FIX: Min 20, max 1000 chars, null is ok
            if (newHeadline.length > 0) {
                if (newHeadline.length < this.minLength) {
                    this.showStatus(`Headline must be at least ${this.minLength} characters`, 'error');
                    return;
                }
                if (newHeadline.length > this.maxLength) {
                    this.showStatus(`Headline must be ${this.maxLength} characters or less`, 'error');
                    return;
                }
            }
            console.log('💾 SETTINGS_HEADLINE: Saving headline...');
            // Use UserPreferencesManager (unified system)
            const userPreferencesManager = window.userPreferencesManager;
            if (userPreferencesManager && userPreferencesManager.isInitialized) {
                // FIX: Save immediately (not batched) to ensure database save happens right away
                await userPreferencesManager.savePreference('headline', newHeadline || null, { batch: false });
                console.log('✅ SETTINGS_HEADLINE: Headline saved via UserPreferencesManager');
            }
            else {
                // Fallback to old system during transition
                console.log('⚠️ SETTINGS_HEADLINE: UserPreferencesManager not available, using fallback');
                // Save to Chrome storage
                await chrome.storage.local.set({ settingsHeadline: newHeadline });
                // Save to API (DEPRECATED - will be removed after migration)
                if (window.currentUser && window.currentUser.id) {
                    try {
                        const authToken = await this.getAuthToken();
                        const response = await fetch(`http://216.238.91.120:3002/v1/users/${window.currentUser.id}/preferences`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${authToken}`
                            },
                            body: JSON.stringify({
                                preferences: {
                                    headline: newHeadline || null
                                }
                            })
                        });
                        if (response.ok) {
                            console.log('✅ SETTINGS_HEADLINE: Headline saved to API (fallback)');
                        }
                        else {
                            console.warn('⚠️ SETTINGS_HEADLINE: API save failed, but saved locally');
                        }
                    }
                    catch (apiError) {
                        console.warn('⚠️ SETTINGS_HEADLINE: API save error, but saved locally:', apiError);
                    }
                }
            }
            this.currentHeadline = newHeadline || null;
            this.originalHeadline = newHeadline || null;
            this.isEditing = false;
            this.updateUIState();
            this.showStatus('Headline saved successfully', 'success');
            console.log('✅ SETTINGS_HEADLINE: Headline saved');
        }
        catch (error) {
            console.error('❌ SETTINGS_HEADLINE: Failed to save headline:', error);
            this.showStatus('Error saving headline', 'error');
        }
    }
    /**
     * DELETE: Delete headline
     */
    async deleteHeadline() {
        try {
            console.log('🗑️ SETTINGS_HEADLINE: Deleting headline...');
            // Delete from Chrome storage
            await chrome.storage.local.remove(['settingsHeadline']);
            this.currentHeadline = '';
            this.originalHeadline = '';
            if (this.headlineInput) {
                this.headlineInput.value = '';
            }
            this.updateCharCount();
            this.isEditing = false;
            this.updateUIState();
            this.hideMenu();
            // Delete from API if available
            if (window.currentUser && window.currentUser.id) {
                try {
                    const authToken = await this.getAuthToken();
                    const response = await fetch(`http://216.238.91.120:3002/v1/users/${window.currentUser.id}/preferences`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({
                            preferences: {
                                headline: null
                            }
                        })
                    });
                    if (response.ok) {
                        console.log('✅ SETTINGS_HEADLINE: Headline deleted from API');
                    }
                    else {
                        console.warn('⚠️ SETTINGS_HEADLINE: API delete failed, but deleted locally');
                    }
                }
                catch (apiError) {
                    console.warn('⚠️ SETTINGS_HEADLINE: API delete error, but deleted locally:', apiError);
                }
            }
            this.showStatus('Headline deleted successfully', 'success');
            console.log('✅ SETTINGS_HEADLINE: Headline deleted');
        }
        catch (error) {
            console.error('❌ SETTINGS_HEADLINE: Failed to delete headline:', error);
            this.showStatus('Error deleting headline', 'error');
        }
    }
    /**
     * Cancel edit and restore original
     */
    cancelEdit() {
        if (this.headlineInput) {
            this.headlineInput.value = this.originalHeadline || '';
        }
        this.updateCharCount();
        this.isEditing = false;
        this.updateUIState();
        this.showStatus('Changes cancelled', 'info');
        console.log('❌ SETTINGS_HEADLINE: Edit cancelled');
    }
    /**
     * Show status message
     */
    showStatus(message, type = 'info') {
        if (!this.statusDiv)
            return;
        this.statusDiv.textContent = message;
        this.statusDiv.style.display = 'block';
        // Set color based on type
        switch (type) {
            case 'success':
                this.statusDiv.style.backgroundColor = '#d4edda';
                this.statusDiv.style.color = '#155724';
                this.statusDiv.style.border = '1px solid #c3e6cb';
                break;
            case 'error':
                this.statusDiv.style.backgroundColor = '#f8d7da';
                this.statusDiv.style.color = '#721c24';
                this.statusDiv.style.border = '1px solid #f5c6cb';
                break;
            default:
                this.statusDiv.style.backgroundColor = '#d1ecf1';
                this.statusDiv.style.color = '#0c5460';
                this.statusDiv.style.border = '1px solid #bee5eb';
        }
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.statusDiv.style.display = 'none';
        }, 3000);
    }
    /**
     * Get auth token for API calls
     */
    async getAuthToken() {
        try {
            const authData = await chrome.storage.local.get(['authToken', 'googleAccessToken']);
            return (authData.authToken || authData.googleAccessToken || '');
        }
        catch (error) {
            console.warn('⚠️ SETTINGS_HEADLINE: Failed to get auth token:', error);
            return '';
        }
    }
}
// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.settingsHeadlineManager = new SettingsHeadlineManager();
        window.settingsHeadlineManager?.initialize();
    });
}
else {
    window.settingsHeadlineManager = new SettingsHeadlineManager();
    window.settingsHeadlineManager?.initialize();
}
// Export for use in other modules
window.SettingsHeadlineManager = SettingsHeadlineManager;
export { SettingsHeadlineManager };
