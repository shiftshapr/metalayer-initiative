/**
 * DISPLAY NAME MANAGER - CRUD Operations for Display Name
 * Handles Create, Read, Update, Delete operations for user display name
 */
class DisplayNameManager {
    constructor() {
        this.minLength = 4; // Min characters for display name
        this.maxLength = 16; // Max characters for display name (updated from 20)
        this.currentDisplayName = null;
        this.originalDisplayName = null;
        this.isInitialized = false;
        this.isEditing = false;
        this.displayNameInput = null;
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
     * Initialize display name manager
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('⚠️ DISPLAY_NAME: Already initialized');
            return;
        }
        console.log('🔧 DISPLAY_NAME: Initializing display name manager...');
        try {
            // Get DOM elements
            this.displayNameInput = document.getElementById('display-name-input');
            this.charCount = document.getElementById('display-name-char-count');
            this.charMax = document.getElementById('display-name-char-max');
            this.saveBtn = document.getElementById('display-name-save-btn');
            this.cancelBtn = document.getElementById('display-name-cancel-btn');
            this.actionsDiv = document.getElementById('display-name-actions');
            this.menuContainer = document.getElementById('display-name-menu-container');
            this.menuBtn = document.getElementById('display-name-menu-btn');
            this.menuDropdown = document.getElementById('display-name-menu-dropdown');
            this.menuEdit = document.getElementById('display-name-menu-edit');
            this.menuDelete = document.getElementById('display-name-menu-delete');
            this.statusDiv = document.getElementById('display-name-status');
            if (!this.displayNameInput || !this.charCount || !this.saveBtn || !this.cancelBtn) {
                console.warn('⚠️ DISPLAY_NAME: Required DOM elements not found');
                return;
            }
            if (this.charMax) {
                this.charMax.textContent = String(this.maxLength); // Set max chars in UI
            }
            this.displayNameInput.maxLength = this.maxLength; // Ensure input has max length
            this.displayNameInput.minLength = this.minLength; // Ensure input has min length
            // Load existing display name
            await this.readDisplayName();
            // Set up event listeners
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('✅ DISPLAY_NAME: Display name manager initialized');
        }
        catch (error) {
            console.error('❌ DISPLAY_NAME: Failed to initialize:', error);
        }
    }
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        if (!this.displayNameInput)
            return;
        // Character count update
        this.displayNameInput.addEventListener('input', () => {
            this.updateCharCount();
            if (!this.isEditing) {
                this.startEditing();
            }
        });
        // Save button
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => {
                this.saveDisplayName();
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
                this.deleteDisplayName();
                this.hideMenu();
            });
        }
        // Click outside to close menu
        document.addEventListener('click', (e) => {
            if (this.menuContainer && !this.menuContainer.contains(e.target)) {
                this.hideMenu();
            }
        });
        // Enter key to save
        this.displayNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.isEditing) {
                e.preventDefault();
                this.saveDisplayName();
            }
        });
        // Focus to manage editing state
        this.displayNameInput.addEventListener('focus', () => {
            const hasContent = this.displayNameInput ? this.displayNameInput.value.trim().length > 0 : false;
            if (hasContent && !this.isEditing) {
                this.startEditing();
            }
            else if (!hasContent) {
                this.isEditing = true;
                this.updateUIState();
            }
        });
        console.log('✅ DISPLAY_NAME: Event listeners attached');
    }
    /**
     * Update character count display
     */
    updateCharCount() {
        if (!this.displayNameInput || !this.charCount)
            return;
        const currentLength = this.displayNameInput.value.length;
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
            else {
                charCountContainer.style.color = '#666'; // Gray
            }
        }
        // Update UI state to show/hide Save button based on validity
        this.updateUIState();
    }
    /**
     * READ: Load display name from storage/API
     */
    async readDisplayName() {
        try {
            console.log('📖 DISPLAY_NAME: Reading display name...');
            console.log('🔍 DIAGNOSTIC: Reading display name from UserPreferencesManager');
            // Use UserPreferencesManager (unified system)
            const userPreferencesManager = window.userPreferencesManager;
            if (userPreferencesManager && userPreferencesManager.isInitialized) {
                const displayName = await userPreferencesManager.getPreference('displayName');
                this.currentDisplayName = (typeof displayName === 'string' ? displayName : '') || '';
                this.originalDisplayName = (typeof displayName === 'string' ? displayName : '') || '';
                if (this.displayNameInput) {
                    this.displayNameInput.value = this.currentDisplayName;
                }
                this.updateCharCount();
                this.updateUIState();
                console.log('✅ DISPLAY_NAME: Display name loaded from UserPreferencesManager');
                console.log('🔍 DIAGNOSTIC: Display name value:', this.currentDisplayName);
                return;
            }
            // Fallback to old system during transition
            console.log('⚠️ DISPLAY_NAME: UserPreferencesManager not available, using fallback');
            // Try Chrome storage first
            const storageData = await chrome.storage.local.get(['displayName']);
            if (storageData.displayName) {
                this.currentDisplayName = storageData.displayName;
                this.originalDisplayName = storageData.displayName;
                if (this.displayNameInput) {
                    this.displayNameInput.value = this.currentDisplayName;
                }
                this.updateCharCount();
                this.updateUIState();
                console.log('✅ DISPLAY_NAME: Display name loaded from Chrome storage');
                return;
            }
            // Try API if available (DEPRECATED - will be removed after migration)
            if (window.currentUser && window.currentUser.id) {
                try {
                    const authToken = await this.getAuthToken();
                    const response = await fetch(`http://216.238.91.120:3002/v1/users/${window.currentUser.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        // Try column first (new system) - FIX: Use camelCase displayName, not snake_case
                        if (data.displayName) {
                            this.currentDisplayName = data.displayName;
                        }
                        else if (data.display_name) {
                            // Fallback to snake_case if API returns it
                            this.currentDisplayName = data.display_name;
                        }
                        else if (data.preferences && data.preferences.displayName) {
                            // Fallback to JSON (old system - DEPRECATED)
                            this.currentDisplayName = data.preferences.displayName;
                        }
                        if (this.currentDisplayName) {
                            this.originalDisplayName = this.currentDisplayName;
                            if (this.displayNameInput) {
                                this.displayNameInput.value = this.currentDisplayName;
                            }
                            this.updateCharCount();
                            this.updateUIState();
                            await chrome.storage.local.set({ displayName: this.currentDisplayName });
                            console.log('✅ DISPLAY_NAME: Display name loaded from API');
                            return;
                        }
                    }
                }
                catch (apiError) {
                    console.warn('⚠️ DISPLAY_NAME: API read failed:', apiError);
                }
            }
            // No display name found
            this.currentDisplayName = '';
            this.originalDisplayName = '';
            if (this.displayNameInput) {
                this.displayNameInput.value = '';
            }
            this.updateCharCount();
            this.updateUIState();
            console.log('ℹ️ DISPLAY_NAME: No display name found, starting fresh');
        }
        catch (error) {
            console.error('❌ DISPLAY_NAME: Failed to read display name:', error);
            this.showStatus('Error loading display name', 'error');
        }
    }
    /**
     * Update UI state based on display name content
     */
    updateUIState() {
        if (!this.displayNameInput)
            return;
        const hasDisplayName = this.displayNameInput.value.trim().length > 0;
        const isValidEntry = this.displayNameInput.value.trim().length >= this.minLength;
        // Show menu if display name exists and not editing
        if (this.menuContainer) {
            this.menuContainer.style.display = hasDisplayName && !this.isEditing ? 'block' : 'none';
        }
        // Show actions (Save/Cancel) only when editing AND valid entry
        if (this.actionsDiv) {
            this.actionsDiv.style.display = (this.isEditing && isValidEntry) ? 'flex' : 'none';
        }
        // Disable input when not editing (if display name exists)
        if (hasDisplayName && !this.isEditing) {
            this.displayNameInput.style.pointerEvents = 'none';
            this.displayNameInput.style.backgroundColor = '#f5f5f5';
            this.displayNameInput.readOnly = true;
        }
        else {
            this.displayNameInput.style.pointerEvents = 'auto';
            this.displayNameInput.style.backgroundColor = '';
            this.displayNameInput.readOnly = false;
        }
    }
    /**
     * Start editing display name
     */
    startEditing() {
        this.isEditing = true;
        this.updateUIState();
        if (this.displayNameInput) {
            this.displayNameInput.focus();
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
     * CREATE/UPDATE: Save display name
     */
    async saveDisplayName() {
        try {
            if (!this.displayNameInput)
                return;
            const newDisplayName = this.displayNameInput.value.trim();
            // ROOT CAUSE FIX: Min 4, max 16 chars, null is ok
            if (newDisplayName.length > 0) {
                if (newDisplayName.length < this.minLength) {
                    this.showStatus(`Display name must be at least ${this.minLength} characters`, 'error');
                    return;
                }
                if (newDisplayName.length > this.maxLength) {
                    this.showStatus(`Display name must be ${this.maxLength} characters or less`, 'error');
                    return;
                }
            }
            console.log('💾 DISPLAY_NAME: Saving display name...');
            // Use UserPreferencesManager (unified system)
            const userPreferencesManager = window.userPreferencesManager;
            if (userPreferencesManager && userPreferencesManager.isInitialized) {
                // FIX: Save immediately (not batched) to ensure database save happens right away
                await userPreferencesManager.savePreference('displayName', newDisplayName || null, { batch: false });
                console.log('✅ DISPLAY_NAME: Display name saved via UserPreferencesManager');
            }
            else {
                // Fallback to old system during transition
                console.log('⚠️ DISPLAY_NAME: UserPreferencesManager not available, using fallback');
                // Save to Chrome storage
                await chrome.storage.local.set({ displayName: newDisplayName });
                // Save to API (DEPRECATED - will be removed after migration)
                if (window.currentUser && window.currentUser.id) {
                    try {
                        const authToken = await this.getAuthToken();
                        const response = await fetch(`http://216.238.91.120:3002/v1/users/${window.currentUser.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${authToken}`
                            },
                            body: JSON.stringify({
                                displayName: newDisplayName || null // FIX: Use camelCase to match database column
                            })
                        });
                        if (response.ok) {
                            console.log('✅ DISPLAY_NAME: Display name saved to API (fallback)');
                        }
                        else {
                            console.warn('⚠️ DISPLAY_NAME: API save failed, but saved locally');
                        }
                    }
                    catch (apiError) {
                        console.warn('⚠️ DISPLAY_NAME: API save error, but saved locally:', apiError);
                    }
                }
            }
            this.currentDisplayName = newDisplayName;
            this.originalDisplayName = newDisplayName;
            this.isEditing = false;
            this.updateUIState();
            // Update window.currentUser
            if (window.currentUser) {
                window.currentUser.displayName = newDisplayName;
                window.currentUser.name = newDisplayName || window.currentUser.name;
            }
            this.showStatus('Display name saved successfully', 'success');
            console.log('✅ DISPLAY_NAME: Display name saved');
        }
        catch (error) {
            console.error('❌ DISPLAY_NAME: Failed to save display name:', error);
            this.showStatus('Error saving display name', 'error');
        }
    }
    /**
     * DELETE: Delete display name
     */
    async deleteDisplayName() {
        try {
            console.log('🗑️ DISPLAY_NAME: Deleting display name...');
            // Delete from Chrome storage
            await chrome.storage.local.remove(['displayName']);
            this.currentDisplayName = '';
            this.originalDisplayName = '';
            if (this.displayNameInput) {
                this.displayNameInput.value = '';
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
                                displayName: null
                            }
                        })
                    });
                    if (response.ok) {
                        console.log('✅ DISPLAY_NAME: Display name deleted from API');
                    }
                    else {
                        console.warn('⚠️ DISPLAY_NAME: API delete failed, but deleted locally');
                    }
                }
                catch (apiError) {
                    console.warn('⚠️ DISPLAY_NAME: API delete error, but deleted locally:', apiError);
                }
            }
            // Update window.currentUser
            if (window.currentUser) {
                window.currentUser.displayName = null;
            }
            this.showStatus('Display name deleted successfully', 'success');
            console.log('✅ DISPLAY_NAME: Display name deleted');
        }
        catch (error) {
            console.error('❌ DISPLAY_NAME: Failed to delete display name:', error);
            this.showStatus('Error deleting display name', 'error');
        }
    }
    /**
     * Cancel edit and restore original
     */
    cancelEdit() {
        if (this.displayNameInput) {
            this.displayNameInput.value = this.originalDisplayName || '';
        }
        this.updateCharCount();
        this.isEditing = false;
        this.updateUIState();
        this.showStatus('Changes cancelled', 'info');
        console.log('❌ DISPLAY_NAME: Edit cancelled');
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
            console.warn('⚠️ DISPLAY_NAME: Failed to get auth token:', error);
            return '';
        }
    }
}
// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.displayNameManager = new DisplayNameManager();
        window.displayNameManager?.initialize();
    });
}
else {
    window.displayNameManager = new DisplayNameManager();
    window.displayNameManager?.initialize();
}
// Export for use in other modules
window.DisplayNameManager = DisplayNameManager;
export { DisplayNameManager };
