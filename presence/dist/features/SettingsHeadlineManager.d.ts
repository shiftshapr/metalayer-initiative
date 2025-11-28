declare class SettingsHeadlineManager {
    private minLength;
    private maxLength;
    private currentHeadline;
    private originalHeadline;
    private isInitialized;
    private isEditing;
    private readonly storage;
    private headlineInput;
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
     * READ: Load headline from storage/API
     */
    readHeadline(): Promise<void>;
    /**
     * Update UI state based on headline content
     */
    private updateUIState;
    /**
     * Start editing headline
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
}
export { SettingsHeadlineManager };
//# sourceMappingURL=SettingsHeadlineManager.d.ts.map