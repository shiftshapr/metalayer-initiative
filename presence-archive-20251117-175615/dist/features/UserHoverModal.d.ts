/**
 * UserHoverModal.ts
 *
 * Displays a modal when hovering over message or visibility avatars.
 * Shows: mutual communities, headline, Add friend button (inactive),
 * Message button (inactive), and avatar (with aura).
 *
 * Architecture:
 * - Singleton pattern for modal management
 * - Event delegation for hover handlers
 * - API integration for mutual communities
 * - Unified avatar system integration
 */
interface Community {
    id?: string;
    community_id?: string;
    communityId?: string;
    name?: string;
}
declare class UserHoverModal {
    private modal;
    private currentUserId;
    private hoverTimeout;
    private hideTimeout;
    private isVisible;
    private currentTarget;
    private logger;
    constructor();
    /**
     * Initialize the hover modal system
     */
    initialize(): Promise<void>;
    /**
     * Create the modal HTML structure
     */
    createModal(): void;
    /**
     * Inject CSS styles for the modal
     */
    injectStyles(): void;
    /**
     * Attach hover handlers to message avatars
     */
    attachMessageAvatarHandlers(): void;
    /**
     * Attach hover handlers to visibility avatars
     */
    attachVisibilityAvatarHandlers(): void;
    /**
     * Find user in visibility data by avatar URL
     */
    findUserByAvatarUrl(avatarUrl: string): {
        id?: string;
    } | null;
    /**
     * Handle hover enter event
     */
    handleHover(event: any, userId: any, targetElement: any): void;
    /**
     * Handle hover leave event
     */
    handleHoverOut(event: MouseEvent, targetElement: HTMLElement): void;
    /**
     * Show the modal with user data
     */
    showModal(userId: string, targetElement: HTMLElement): Promise<void>;
    /**
     * Hide the modal
     */
    hideModal(): void;
    /**
     * Get user data from various sources
     * FIX: Ensure headline and displayName are fetched from all sources
     */
    getUserData(userId: string): Promise<{
        id: string;
        name: string;
        displayName?: string | null;
        avatarUrl?: string;
        auraColor?: string;
        headline?: string | null;
        communities?: Community[];
    } | null>;
    /**
     * Update modal content with user data
     */
    updateModalContent(userData: {
        id: string;
        name: string;
        displayName?: string | null;
        avatarUrl?: string;
        auraColor?: string;
        headline?: string | null;
    }): Promise<void>;
    /**
     * Position the modal relative to the target element
     * FIX: Ensure modal doesn't go off page boundaries
     */
    positionModal(targetElement: HTMLElement): void;
    /**
     * Load mutual communities for the user using the new backend endpoint
     * FIX: Ensure currentUserId is set before loading
     */
    loadMutualCommunities(userId: string): Promise<void>;
    /**
     * Get current user's communities (kept for backward compatibility, but not used for mutual communities)
     */
    getCurrentUserCommunities(): Promise<Community[]>;
    /**
     * Get user's communities from API (kept for backward compatibility, but not used for mutual communities)
     */
    getUserCommunities(userId: string): Promise<Community[]>;
    /**
     * Find mutual communities between two users
     */
    findMutualCommunities(user1Communities: Community[], user2Communities: Community[]): Community[];
}
declare const userHoverModalInstance: UserHoverModal;
export { UserHoverModal, userHoverModalInstance };
export default UserHoverModal;
//# sourceMappingURL=UserHoverModal.d.ts.map