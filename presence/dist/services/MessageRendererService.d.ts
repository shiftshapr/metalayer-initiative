/**
 * MESSAGE RENDERER SERVICE
 *
 * Single source of truth for rendering messages.
 * Replaces multiple rendering paths with a unified service.
 *
 * Phase 1: Consolidate Rendering
 */
import type { Message, User } from '../types/index.js';
import { UnifiedMessageRenderer } from '../utils/UnifiedMessageRenderer.js';
import { UnifiedMessageDisplay, type DisplayOptions } from '../components/UnifiedMessageDisplay.js';
interface CommunitiesModule {
    getCommunityName?: (communityId: string) => string | Promise<string>;
}
interface UserResolutionService {
    resolveUser?: (userId: string) => Promise<User | null>;
}
interface MessageRendererDependencies {
    unifiedMessageRenderer?: typeof UnifiedMessageRenderer;
    unifiedMessageDisplay?: UnifiedMessageDisplay;
    communitiesModule?: CommunitiesModule;
    userResolutionService?: UserResolutionService;
    getMessageActionsMenu?: (message: Message, canEdit: boolean, canDelete: boolean) => Promise<string> | string;
    getCurrentUser?: () => User | null;
    getCurrentChatData?: () => Message[];
    formatMessageTime?: (timestamp: string | Date | null) => string;
}
interface RenderMessageOptions {
    isReply?: boolean;
    isFocusMode?: boolean;
    container?: HTMLElement | null;
    canEdit?: boolean | null;
    canDelete?: boolean | null;
    reactionCount?: number;
    replyCount?: number;
    bookmarkCount?: number;
    isBookmarked?: boolean;
    hasUserReplied?: boolean;
    hasUserReposted?: boolean;
    hasUserShared?: boolean;
}
interface MessageUpdates {
    message?: Message;
    reactionCount?: number;
    isBookmarked?: boolean;
    content?: string;
}
export declare class MessageRendererService {
    private unifiedMessageRenderer;
    private unifiedMessageDisplay;
    private communitiesModule?;
    private getMessageActionsMenu?;
    private getCurrentUser?;
    private getCurrentChatData?;
    private formatMessageTime?;
    constructor(dependencies?: MessageRendererDependencies);
    /**
     * Render a single message element
     */
    renderMessage(message: Message, options?: RenderMessageOptions): Promise<HTMLElement>;
    /**
     * Render multiple messages (batch)
     */
    renderMessages(messages: Message[], container: HTMLElement, options?: DisplayOptions): Promise<void>;
    /**
     * Update existing message in DOM
     */
    updateMessage(messageId: string, updates: MessageUpdates): Promise<void>;
    /**
     * Remove message from DOM
     */
    removeMessage(messageId: string): void;
}
/**
 * Initialize the service with dependencies
 */
export declare function initializeMessageRendererService(dependencies: MessageRendererDependencies): MessageRendererService;
/**
 * Get the service instance
 */
export declare function getMessageRendererService(): MessageRendererService;
export {};
//# sourceMappingURL=MessageRendererService.d.ts.map