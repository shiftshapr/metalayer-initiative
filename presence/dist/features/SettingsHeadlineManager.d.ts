/**
 * SETTINGS HEADLINE MANAGER - CRUD Operations for Settings Headline
 * Handles Create, Read, Update, Delete operations for user headline
 */
declare class SettingsHeadlineManager {
    private maxLength;
    private currentHeadline;
    private originalHeadline;
    private isInitialized;
    private headlineInput;
    private charCount;
    private saveBtn;
    private cancelBtn;
    private deleteBtn;
    private statusDiv;
    /**
     * Initialize headline manager
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
     * READ: Load headline from storage
     */
    readHeadline(): Promise<void>;
    /**
     * CREATE/UPDATE: Save headline
     */
    saveHeadline(): Promise<void>;
    /**
     * DELETE: Delete headline
     */
    deleteHeadline(): Promise<void>;
    /**
     * Cancel edit and restore original
     */
    private cancelEdit;
    /**
     * Show status message
     */
    private showStatus;
    /**
     * Get authentication token
     */
    private getAuthToken;
}
export { SettingsHeadlineManager };
//# sourceMappingURL=SettingsHeadlineManager.d.ts.map