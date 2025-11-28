/**
 * VISIBILITY MODAL COMPONENT - Modal UI Component
 *
 * Phase 3: UI Component Extraction
 * - Extracted from VisibilityModalHandler
 * - Handles Go Visible modal display and interactions
 */
import type { IVisibilityStorage } from '../core/VisibilityTypes.js';
/**
 * VisibilityModal component
 * Manages the "Go Visible" modal UI
 */
export declare class VisibilityModal {
    private modal;
    private goVisibleBtn;
    private cancelBtn;
    private closeBtn;
    private storage;
    private onVisibilityEnabled?;
    constructor(storage: IVisibilityStorage, onVisibilityEnabled?: () => void);
    /**
     * Initialize component
     */
    initialize(): Promise<void>;
    /**
     * Update cancel button text color based on theme
     */
    private updateCancelButtonColor;
    /**
     * Set up theme observer to update cancel button color on theme change
     */
    private setupThemeObserver;
    /**
     * Set up event listeners
     */
    private setupEventListeners;
    /**
     * Show modal
     */
    show(): void;
    /**
     * Hide modal
     */
    hide(): void;
    /**
     * Handle Go Visible button click
     */
    private handleGoVisible;
    /**
     * Check if user is visible
     */
    isUserVisible(): Promise<boolean>;
}
//# sourceMappingURL=VisibilityModal.d.ts.map