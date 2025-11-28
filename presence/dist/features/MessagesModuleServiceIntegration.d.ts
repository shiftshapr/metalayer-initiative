/**
 * MESSAGES MODULE SERVICE INTEGRATION
 *
 * Integration layer for MessageRendererService, MessageLoadingService, and MessageActionListenersService.
 * Provides service-based implementations of loadChatHistory and addMessageToChat.
 *
 * Phase 4: Integration
 */
import type { Message } from '../types/index.js';
import type { MessageSystemIntegration } from './MessageSystemIntegration.js';
interface CommunitiesModule {
    getCommunityName?: (communityId: string) => string | Promise<string>;
}
interface ServiceIntegrationConfig {
    messageSystemIntegration: MessageSystemIntegration;
    communitiesModule?: CommunitiesModule;
    container?: HTMLElement | null;
    reactionsService?: {
        toggleReaction?: (messageId: string) => Promise<void>;
        loadReactions?: (messageId: string) => Promise<void>;
    };
    bookmarkService?: {
        toggleBookmark?: (messageId: string) => Promise<void>;
    };
    replyService?: {
        replyToMessage?: (message: Message) => Promise<void>;
    };
    repostService?: {
        repostMessage?: (message: Message) => Promise<void>;
    };
    shareService?: {
        shareMessage?: (message: Message) => Promise<void>;
    };
    editService?: {
        editMessage?: (messageId: string, newContent: string) => Promise<void>;
    };
    deleteService?: {
        deleteMessage?: (messageId: string) => Promise<void>;
    };
    getCurrentUser?: () => {
        id?: string;
        email?: string;
        [key: string]: unknown;
    } | null;
    getCurrentChatData?: () => Message[];
    formatMessageTime?: (timestamp: string | Date | null) => string;
    getMessageActionsMenu?: (message: Message, canEdit: boolean, canDelete: boolean) => Promise<string> | string;
}
/**
 * Initialize all message services with dependencies
 */
export declare function initializeMessageServices(config: ServiceIntegrationConfig): void;
/**
 * Service-based loadChatHistory (replaces MessagesModule.loadChatHistory)
 */
export declare function loadChatHistoryWithServices(pageId: string | null, activeCommunities?: string[], container?: HTMLElement | null): Promise<void>;
/**
 * Service-based addMessageToChat (replaces MessagesModule.addMessageToChat)
 */
export declare function addMessageToChatWithServices(message: Message, container?: HTMLElement | null): Promise<void>;
/**
 * Get service instances (for advanced usage)
 */
export declare function getMessageServices(): {
    renderer: import("../services/MessageRendererService.js").MessageRendererService;
    loading: import("../services/MessageLoadingService.js").MessageLoadingService;
    actionListeners: import("../services/MessageActionListenersService.js").MessageActionListenersService;
};
export {};
//# sourceMappingURL=MessagesModuleServiceIntegration.d.ts.map