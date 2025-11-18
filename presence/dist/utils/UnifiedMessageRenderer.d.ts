/**
 * UNIFIED MESSAGE RENDERER - TypeScript Version
 *
 * Single source of truth for message rendering in both default and focus modes.
 * Ensures consistent HTML structure and prevents zero-height issues.
 *
 * Key Principle: Always render content, use CSS classes for visibility control.
 */
import type { Message, User } from '../types/index.js';
export interface MessageRenderOptions {
    isReply?: boolean;
    isFocusMode?: boolean;
    author?: User | null;
    communityName?: string;
    formattedTime?: string;
    reactionCount?: number;
    replyCount?: number;
    bookmarkCount?: number;
    isBookmarked?: boolean;
    hasUserReplied?: boolean;
    hasUserReposted?: boolean;
    hasUserShared?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}
export declare class UnifiedMessageRenderer {
    /**
     * Generate HTML for a message
     */
    static generateMessageHTML(message: Message, options?: MessageRenderOptions): Promise<string>;
    /**
     * Convert URLs in text to clickable links
     */
    static convertUrlsToLinks(text: string): string;
    /**
     * Render a complete message element
     */
    static renderMessage(message: Message, options?: MessageRenderOptions): Promise<HTMLElement>;
    /**
     * Format message time
     */
    static formatMessageTime(timestamp: string | Date | undefined, isFocusMode?: boolean): string;
}
export default UnifiedMessageRenderer;
//# sourceMappingURL=UnifiedMessageRenderer.d.ts.map