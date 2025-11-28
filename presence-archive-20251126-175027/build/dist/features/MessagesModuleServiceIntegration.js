/**
 * MESSAGES MODULE SERVICE INTEGRATION
 *
 * Integration layer for MessageRendererService, MessageLoadingService, and MessageActionListenersService.
 * Provides service-based implementations of loadChatHistory and addMessageToChat.
 *
 * Phase 4: Integration
 */
import { stateManagerInstance } from '../core/StateManager.js';
import { initializeMessageRendererService, getMessageRendererService } from '../services/MessageRendererService.js';
import { initializeMessageLoadingService, getMessageLoadingService } from '../services/MessageLoadingService.js';
import { initializeMessageActionListenersService, getMessageActionListenersService } from '../services/MessageActionListenersService.js';
import { UnifiedMessageDisplay } from '../components/UnifiedMessageDisplay.js';
import { Logger } from '../utils/Logger.js';
let servicesInitialized = false;
/**
 * Initialize all message services with dependencies
 */
export function initializeMessageServices(config) {
    if (servicesInitialized) {
        Logger.debug('⚠️ MessageServices: Already initialized', null, 'messages');
        return;
    }
    // Initialize MessageRendererService
    const messageRenderer = initializeMessageRendererService({
        unifiedMessageRenderer: undefined, // Use default
        unifiedMessageDisplay: new UnifiedMessageDisplay(),
        communitiesModule: config.communitiesModule,
        getCurrentUser: config.getCurrentUser || (() => stateManagerInstance.getState('currentUser')),
        getCurrentChatData: config.getCurrentChatData || (() => {
            const data = stateManagerInstance.getState('chat.data');
            return Array.isArray(data) ? data : [];
        }),
        formatMessageTime: config.formatMessageTime,
        getMessageActionsMenu: config.getMessageActionsMenu
    });
    // Initialize MessageLoadingService
    initializeMessageLoadingService({
        messageRenderer,
        messageSystemIntegration: config.messageSystemIntegration,
        container: config.container || null
    });
    // Initialize MessageActionListenersService
    initializeMessageActionListenersService({
        reactionsService: config.reactionsService,
        bookmarkService: config.bookmarkService,
        replyService: config.replyService,
        repostService: config.repostService,
        shareService: config.shareService,
        editService: config.editService,
        deleteService: config.deleteService
    });
    servicesInitialized = true;
    Logger.debug('✅ MessageServices: All services initialized', null, 'messages');
}
/**
 * Service-based loadChatHistory (replaces MessagesModule.loadChatHistory)
 */
export async function loadChatHistoryWithServices(pageId, activeCommunities = [], container) {
    if (!servicesInitialized) {
        throw new Error('MessageServices not initialized. Call initializeMessageServices() first.');
    }
    const messageLoadingService = getMessageLoadingService();
    // Set container if provided
    if (container) {
        messageLoadingService.setContainer(container);
    }
    // Use MessageLoadingService (state-first approach)
    await messageLoadingService.loadChatHistory(pageId, activeCommunities);
}
/**
 * Service-based addMessageToChat (replaces MessagesModule.addMessageToChat)
 */
export async function addMessageToChatWithServices(message, container) {
    if (!servicesInitialized) {
        throw new Error('MessageServices not initialized. Call initializeMessageServices() first.');
    }
    const messageLoadingService = getMessageLoadingService();
    const actionListeners = getMessageActionListenersService();
    // Set container if provided
    if (container) {
        messageLoadingService.setContainer(container);
    }
    // Use MessageLoadingService (state-first approach)
    await messageLoadingService.addMessage(message, container || undefined);
    // Attach action listeners
    const messageElement = container?.querySelector(`[data-message-id="${message.id}"]`);
    if (messageElement) {
        actionListeners.attachListeners(messageElement, message);
    }
}
/**
 * Get service instances (for advanced usage)
 */
export function getMessageServices() {
    return {
        renderer: getMessageRendererService(),
        loading: getMessageLoadingService(),
        actionListeners: getMessageActionListenersService()
    };
}
//# sourceMappingURL=MessagesModuleServiceIntegration.js.map