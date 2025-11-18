/**
 * STATUS PICKER MODULE
 *
 * Allows users to set their availability status (4-state system)
 * - Available (green)
 * - Working/Busy (yellow)
 * - Away (red)
 * - Offline (gray - automatic)
 */
type Status = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';
declare class StatusPickerModule {
    private currentStatus;
    private isInitialized;
    private logger;
    constructor();
    /**
     * Initialize the status picker module
     */
    initialize(): Promise<void>;
    /**
     * Load current user's status from backend
     */
    loadCurrentStatus(): Promise<void>;
    /**
     * Create status picker UI in the profile section
     */
    createStatusPickerUI(): void;
    /**
     * Set up event listeners for status options
     */
    setupEventListeners(): void;
    /**
     * Set user's availability status
     * @param {string} status - Status to set (AVAILABLE, BUSY, AWAY)
     */
    setStatus(status: Status): Promise<void>;
    /**
     * Update status on backend via API
     * @param {string} status - Status to set
     */
    updateStatusOnBackend(status: Status): Promise<void>;
    /**
     * Update status picker UI to reflect current status
     * @param {string} status - Current status
     */
    updateStatusUI(status: Status): void;
    /**
     * Get current status
     * @returns {string} Current status
     */
    getCurrentStatus(): Status;
}
declare const statusPickerModuleInstance: StatusPickerModule;
export { StatusPickerModule, statusPickerModuleInstance };
export default StatusPickerModule;
//# sourceMappingURL=StatusPickerModule.d.ts.map