/**
 * VISIBILITY MANAGER - Centralized Visibility System
 * TypeScript + ES6 Module
 */
import { User } from '../types/index.js';
import { Logger } from '../utils/Logger.js';
interface SupabaseService {
    on: (event: string, callback: (eventType: string, newRecord: any, oldRecord: any) => void) => void;
    getPageUsers: (pageId: string) => Promise<any[]>;
    getUserProfile: (email: string) => Promise<any>;
}
interface VisibilityStatus {
    isActive: boolean;
    currentUserEmail: string | null;
    currentPageId: string | null;
    visibleUsers: number;
}
declare class VisibilityManager {
    private supabase;
    private logger;
    private currentVisibilityData;
    private currentUserEmail;
    private currentPageId;
    private isActive;
    constructor(supabaseService: SupabaseService, logger: Logger);
    /**
     * Initialize visibility manager
     */
    initialize(currentUserEmail: string): Promise<void>;
    /**
     * Refresh visibility avatars for current page
     */
    refreshVisibilityAvatars(pageId: string): Promise<void>;
    /**
     * Fetch avatar URLs for users
     */
    private fetchUserAvatars;
    /**
     * Filter out current user from visibility list
     */
    private filterCurrentUser;
    /**
     * Update visibility UI
     */
    private updateVisibilityUI;
    /**
     * Handle real-time presence events
     */
    handlePresenceEvent(eventType: string, newRecord: any, oldRecord: any): void;
    /**
     * Set current page
     */
    setCurrentPage(pageId: string): void;
    /**
     * Get current visibility data
     */
    getCurrentVisibilityData(): User[];
    /**
     * Format last seen display (static utility)
     */
    static formatLastSeenDisplay(lastSeen: string | null | undefined): string;
    /**
     * Format time display (static utility)
     */
    static formatTimeDisplay(enterTime: string | null | undefined): string;
    /**
     * Get visibility status
     */
    getStatus(): VisibilityStatus;
    /**
     * Cleanup
     */
    cleanup(): Promise<void>;
}
/**
 * Update visible tab UI (standalone function for backward compatibility)
 */
declare function updateVisibleTab(avatars: User[]): Promise<void>;
export { VisibilityManager, updateVisibleTab };
export default VisibilityManager;
//# sourceMappingURL=VisibilityManager.d.ts.map