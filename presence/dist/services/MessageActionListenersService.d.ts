/**
 * MESSAGE ACTION LISTENERS SERVICE
 *
 * Handles attaching event listeners to message action buttons.
 * Replaces getWindowFunction() lookups with dependency injection.
 *
 * Phase 3: Dependency Injection
 */
import type { Message } from '../types/index.js';
interface ReactionsService {
    toggleReaction?: (messageId: string) => Promise<void>;
    loadReactions?: (messageId: string) => Promise<void>;
}
interface BookmarkService {
    toggleBookmark?: (messageId: string) => Promise<void>;
}
interface ReplyService {
    replyToMessage?: (message: Message) => Promise<void>;
}
interface RepostService {
    repostMessage?: (message: Message) => Promise<void>;
}
interface ShareService {
    shareMessage?: (message: Message) => Promise<void>;
}
interface EditService {
    editMessage?: (messageId: string, newContent: string) => Promise<void>;
}
interface DeleteService {
    deleteMessage?: (messageId: string) => Promise<void>;
}
interface MessageActionListenersDependencies {
    reactionsService?: ReactionsService;
    bookmarkService?: BookmarkService;
    replyService?: ReplyService;
    repostService?: RepostService;
    shareService?: ShareService;
    editService?: EditService;
    deleteService?: DeleteService;
}
export declare class MessageActionListenersService {
    private reactionsService?;
    private bookmarkService?;
    private replyService?;
    private repostService?;
    private shareService?;
    private editService?;
    private deleteService?;
    constructor(dependencies?: MessageActionListenersDependencies);
    /**
     * Attach all action listeners to a message element
     */
    attachListeners(messageElement: HTMLElement, message: Message): void;
    /**
     * Attach reaction listener
     */
    attachReactionListener(button: HTMLElement, message: Message): void;
    /**
     * Attach bookmark listener
     */
    attachBookmarkListener(button: HTMLElement, message: Message): void;
    /**
     * Attach edit listener
     */
    attachEditListener(button: HTMLElement, message: Message): void;
    /**
     * Attach delete listener
     */
    attachDeleteListener(button: HTMLElement, message: Message): void;
}
/**
 * Initialize the service with dependencies
 */
export declare function initializeMessageActionListenersService(dependencies: MessageActionListenersDependencies): MessageActionListenersService;
/**
 * Get the service instance
 */
export declare function getMessageActionListenersService(): MessageActionListenersService;
export {};
//# sourceMappingURL=MessageActionListenersService.d.ts.map