import type { Message, User } from '../types/index.js';
interface MessageOptions {
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
declare global {
    interface Window {
        getMessageActionsMenu?: (message: Message, canEdit: boolean, canDelete: boolean) => Promise<string> | string;
    }
}
export declare class UnifiedMessageRenderer {
    /**
     * Generate HTML for a message
     */
    static generateMessageHTML(message: Message, options?: MessageOptions): Promise<string>;
    /**
     * Convert URLs in text to clickable links
     */
    static convertUrlsToLinks(text: string): string;
    /**
     * Render a complete message element
     */
    static renderMessage(message: Message, options?: MessageOptions): Promise<HTMLElement>;
    /**
     * Format message time
     */
    static formatMessageTime(timestamp: string | Date | undefined, _isFocusMode?: boolean): string;
}
interface UnifiedMessageRendererApi {
    renderer: typeof UnifiedMessageRenderer;
    renderMessage: typeof UnifiedMessageRenderer.renderMessage;
    generateMessageHTML: typeof UnifiedMessageRenderer.generateMessageHTML;
    convertUrlsToLinks: typeof UnifiedMessageRenderer.convertUrlsToLinks;
    formatMessageTime: typeof UnifiedMessageRenderer.formatMessageTime;
    initialize: () => UnifiedMessageRendererApi | null;
}
export declare const unifiedMessageRendererApi: UnifiedMessageRendererApi;
export declare function initializeUnifiedMessageRenderer(): UnifiedMessageRendererApi | null;
export default unifiedMessageRendererApi;
//# sourceMappingURL=UnifiedMessageRenderer.d.ts.map