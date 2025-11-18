/**
 * DISPLAY NAME MANAGER - CRUD Operations for Display Name
 * Handles Create, Read, Update, Delete operations for user display name
 */
declare class DisplayNameManager {
    private minLength;
    private maxLength;
    private currentDisplayName;
    private originalDisplayName;
    private isInitialized;
    private isEditing;
    private displayNameInput;
    private charCount;
    private charMax;
    private saveBtn;
    private cancelBtn;
    private actionsDiv;
    private menuContainer;
    private menuBtn;
    private menuDropdown;
    private menuEdit;
    private menuDelete;
    private statusDiv;
    /**
     * Initialize display name manager
     */
    initialize(): Promise<void>;
    /**
     * Set up event listeners
     */
    private setupEventListeners;
    /**
     * Update character count display
     */
    private updateCharCount;
    /**
     * READ: Load display name from storage/API
     */
    readDisplayName(): Promise<void>;
    /**
     * Update UI state based on display name content
     */
    private updateUIState;
    /**
     * Start editing display name
     */
    private startEditing;
    /**
     * Toggle menu dropdown
     */
    private toggleMenu;
    /**
     * Hide menu dropdown
     */
    private hideMenu;
    /**
     * CREATE/UPDATE: Save display name
     */
    saveDisplayName(): Promise<void>;
    /**
     * DELETE: Delete display name
     */
    deleteDisplayName(): Promise<void>;
    /**
     * Cancel edit and restore original
     */
    private cancelEdit;
    /**
     * Show status message
     */
    private showStatus;
    /**
     * Get auth token for API calls
     */
    private getAuthToken;
}
export { DisplayNameManager };
//# sourceMappingURL=DisplayNameManager.d.ts.map