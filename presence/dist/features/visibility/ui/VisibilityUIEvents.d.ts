/**
 * VISIBILITY UI EVENTS COORDINATOR - Unified Event Handling
 *
 * Phase 4: Event Handler Consolidation
 * - Consolidates event handlers from VisibilityTabHandler and VisibilityUIModule
 * - Single source of truth for tab navigation
 * - Unified visibility check and modal triggering
 */
import type { IVisibilityStorage } from '../core/VisibilityTypes.js';
import { VisibilityState } from '../core/VisibilityState.js';
/**
 * VisibilityUIEvents coordinator
 * Manages all visibility-related UI events
 */
export declare class VisibilityUIEvents {
    private state;
    private storage;
    private visibilityTab;
    private modal;
    private isInitialized;
    private tabActivationObserver;
    constructor(state: VisibilityState, storage: IVisibilityStorage);
    /**
     * Initialize event coordinator
     */
    initialize(): Promise<void>;
    /**
     * Set up visibility tab click handler (unified)
     */
    private setupVisibilityTabClick;
    /**
     * Set up tab activation watcher
     */
    private setupTabActivationWatcher;
    /**
     * Refresh visibility when tab opens
     */
    private refreshVisibilityOnTabOpen;
    /**
     * Navigate to visibility tab
     */
    private navigateToVisibilityTab;
    /**
     * Show modal
     */
    showModal(): void;
    /**
     * Cleanup
     */
    cleanup(): void;
}
//# sourceMappingURL=VisibilityUIEvents.d.ts.map