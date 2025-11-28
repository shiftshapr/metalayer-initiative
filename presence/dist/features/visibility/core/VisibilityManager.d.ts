/**
 * VISIBILITY MANAGER - Core Business Logic (Refactored)
 *
 * Phase 2: Core Logic Separation
 * - Removed UI logic (moved to UI layer)
 * - Uses dependency injection
 * - Uses VisibilityState instead of window globals
 * - Uses IVisibilityRealtime interface
 */
import type { IVisibilityRealtime, VisibilityUser } from './VisibilityTypes.js';
import { VisibilityState } from './VisibilityState.js';
import { Logger } from '../../../utils/Logger.js';
/**
 * Refactored VisibilityManager
 * Business logic only - no UI concerns
 */
export declare class VisibilityManager {
    private currentUserId;
    private currentUserEmail;
    private currentPageId;
    private isActive;
    private realtime;
    private logger;
    private state;
    constructor(realtime: IVisibilityRealtime, logger: Logger, state?: VisibilityState);
    /**
     * Initialize visibility manager - REFACTOR PHASE 1: Single Initialization Point
     *
     * Requirements:
     * - currentUserId MUST be a valid AppUser UUID (not Google ID)
     * - Can only be called once (initialization guard)
     * - Called ONLY by BootController.handleUserChange()
     */
    initialize(currentUserId: string): Promise<void>;
    /**
     * Set current user email for filtering compatibility
     */
    setCurrentUserEmail(email: string | null): void;
    /**
     * Refresh visibility data for a page
     * Returns users - UI layer handles rendering
     */
    refreshVisibilityAvatars(pageId: string): Promise<VisibilityUser[]>;
    /**
     * Fetch avatar URLs for users
     */
    private fetchUserAvatars;
    /**
     * Handle presence events from realtime service
     */
    private handlePresenceEvent;
    /**
     * Set current page ID
     */
    setCurrentPage(pageId: string): void;
    /**
     * Get current visibility data from state
     */
    getCurrentVisibilityData(): VisibilityUser[];
    /**
     * Get visibility state instance (for UI layer subscription)
     */
    getState(): VisibilityState;
    /**
     * Get manager status
     */
    getStatus(): {
        isActive: boolean;
        currentUserId: string | null;
        currentUserEmail: string | null;
        currentPageId: string | null;
        visibleUsers: number;
    };
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=VisibilityManager.d.ts.map