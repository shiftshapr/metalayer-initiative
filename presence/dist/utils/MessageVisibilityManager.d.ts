/**
 * MESSAGE VISIBILITY MANAGER - TypeScript Version
 *
 * Handles CSS class management and visibility for messages in different modes.
 * Separates visibility logic from rendering logic.
 */
export interface FixStatistics {
    fixed: number;
    failed: number;
    total: number;
}
export declare class MessageVisibilityManager {
    /**
     * Ensure a reply has all required classes for focus mode visibility
     */
    static ensureFocusModeClasses(messageElement: HTMLElement | null): boolean;
    /**
     * Fix zero-height replies by applying comprehensive dimension fixes
     */
    static fixZeroDimensions(messageElement: HTMLElement | null, messageId: string): Promise<boolean>;
    /**
     * Verify message dimensions and apply fallback styles if needed
     */
    static verifyDimensions(messageElement: HTMLElement | null, messageId: string): Promise<boolean>;
    /**
     * Ensure parent container has proper width (prevents zero-width cascade)
     */
    static ensureParentContainerWidth(messageElement: HTMLElement | null): void;
    /**
     * Hide a reply (for default mode)
     */
    static hideReply(messageElement: HTMLElement | null): void;
    /**
     * Show a reply (for focus mode)
     */
    static showReply(messageElement: HTMLElement | null, messageId?: string): Promise<boolean>;
    /**
     * Fix all zero-dimension replies in a container
     */
    static fixAllZeroDimensionReplies(container: HTMLElement | null): Promise<FixStatistics>;
}
export default MessageVisibilityManager;
//# sourceMappingURL=MessageVisibilityManager.d.ts.map