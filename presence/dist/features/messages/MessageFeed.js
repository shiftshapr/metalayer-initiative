/**
 * MessageFeed - Modern TypeScript Message Display Component
 *
 * Sleek, isolated message feed that doesn't impact tabs, theme, or other UI.
 * Handles default and focus modes with real-time updates.
 */
import { MessageRenderer } from './MessageRenderer.js';
import { MessageRealtimeManager } from './MessageRealtimeManager.js';
import { MessagePaginationService } from './MessagePaginationService.js';
import { LoadingIndicator } from './LoadingIndicator.js';
import { Logger } from '../../utils/Logger.js';
/**
 * MessageFeed - Main component for displaying messages
 */
export class MessageFeed {
    constructor(options) {
        this.realtimeManager = null;
        this.currentFocusState = { mode: 'default' };
        this.messages = [];
        this.isLoading = false;
        this.options = options;
        this.container = options.container;
        this.renderer = new MessageRenderer({
            container: this.container,
            onAvatarHover: this.handleAvatarHover.bind(this),
            onShowMore: this.handleShowMore.bind(this),
            onMessageClick: options.onMessageClick,
            onReplyClick: options.onReplyClick,
            onFocusClick: options.onFocusClick
        });
        this.paginationService = new MessagePaginationService({
            pageId: options.pageId,
            communityId: options.communityId
        });
        this.loadingIndicator = new LoadingIndicator(this.container);
    }
    /**
     * Initialize the feed
     */
    async initialize() {
        Logger.debug('MessageFeed: Initializing...', { pageId: this.options.pageId }, 'messages');
        // Initialize real-time manager if supabase client available
        if (this.options.supabaseClient) {
            this.realtimeManager = new MessageRealtimeManager({
                supabaseClient: this.options.supabaseClient,
                pageId: this.options.pageId,
                communityId: this.options.communityId,
                onNewMessage: this.handleNewMessage.bind(this),
                onMessageUpdate: this.handleMessageUpdate.bind(this),
                onReactionUpdate: this.handleReactionUpdate.bind(this)
            });
            await this.realtimeManager.initialize();
        }
        // Load initial messages
        await this.loadMessages();
    }
    /**
     * Load messages (default or focus mode)
     */
    async loadMessages(focusState) {
        if (this.isLoading) {
            console.warn('⚠️ MessageFeed: Already loading, skipping duplicate call');
            Logger.warn('MessageFeed: Already loading, skipping duplicate call', null, 'messages');
            return;
        }
        console.log('🔵 MessageFeed: loadMessages() called', {
            mode: focusState?.mode || this.currentFocusState.mode,
            pageId: this.options.pageId,
            communityId: this.options.communityId
        });
        this.isLoading = true;
        this.loadingIndicator.show();
        try {
            if (focusState) {
                this.currentFocusState = focusState;
            }
            console.log('🔵 MessageFeed: Calling paginationService.loadPage()...');
            const messages = await this.paginationService.loadPage({
                focusState: this.currentFocusState,
                limit: 10
            });
            console.log('🔵 MessageFeed: paginationService returned', messages.length, 'messages');
            // Sort: newest first (last on top)
            this.messages = this.sortMessagesNewestFirst(messages);
            console.log('🔵 MessageFeed: Sorted messages, total:', this.messages.length);
            // Render messages
            console.log('🔵 MessageFeed: Calling renderer.render()...');
            await this.renderer.render({
                messages: this.messages,
                focusState: this.currentFocusState
            });
            console.log('🔵 MessageFeed: renderer.render() completed');
            console.log(`✅ MessageFeed: Loaded ${this.messages.length} messages`);
            Logger.debug(`MessageFeed: Loaded ${this.messages.length} messages`, null, 'messages');
        }
        catch (error) {
            console.error('❌ MessageFeed: Error loading messages', error);
            Logger.error('MessageFeed: Error loading messages', error, 'messages');
            throw error;
        }
        finally {
            this.isLoading = false;
            this.loadingIndicator.hide();
        }
    }
    /**
     * Enter focus mode for a message
     */
    async enterFocusMode(parentMessageId, highlightedMessageId) {
        Logger.debug('MessageFeed: Entering focus mode', { parentMessageId, highlightedMessageId }, 'messages');
        this.currentFocusState = {
            mode: 'focus',
            parentMessageId,
            highlightedMessageId
        };
        await this.loadMessages();
    }
    /**
     * Exit focus mode (return to default)
     */
    async exitFocusMode() {
        Logger.debug('MessageFeed: Exiting focus mode', null, 'messages');
        this.currentFocusState = { mode: 'default' };
        await this.loadMessages();
    }
    /**
     * Handle new message from real-time
     * Requirements 4, 5, 6: New messages display locally and propagate in real-time
     */
    async handleNewMessage(message) {
        Logger.debug('MessageFeed: New message received', {
            messageId: message.id,
            parentId: message.parentId,
            mode: this.currentFocusState.mode
        }, 'messages');
        // Requirement 6: New reply in focus mode → display on top of replies
        if (this.currentFocusState.mode === 'focus' &&
            message.parentId === this.currentFocusState.parentMessageId) {
            // Add to top of replies list (newest first)
            this.messages = [message, ...this.messages];
            await this.renderer.addMessage(message, { position: 'top', focusState: this.currentFocusState });
            Logger.debug('MessageFeed: Added reply to focus mode', { messageId: message.id }, 'messages');
            return;
        }
        // Requirement 5: New reply in default mode → open focus mode with parent + new reply on top
        if (this.currentFocusState.mode === 'default' && message.parentId) {
            // Enter focus mode for this parent
            await this.enterFocusMode(message.parentId, message.id);
            Logger.debug('MessageFeed: Opened focus mode for new reply', {
                parentId: message.parentId,
                replyId: message.id
            }, 'messages');
            return;
        }
        // Requirement 4: New top-level message in default mode → add to top
        if (this.currentFocusState.mode === 'default' && !message.parentId) {
            this.messages = [message, ...this.messages];
            await this.renderer.addMessage(message, { position: 'top', focusState: this.currentFocusState });
            Logger.debug('MessageFeed: Added top-level message', { messageId: message.id }, 'messages');
        }
    }
    /**
     * Handle message update (edit, delete, etc.)
     */
    async handleMessageUpdate(updatedMessage) {
        Logger.debug('MessageFeed: Message updated', { messageId: updatedMessage.id }, 'messages');
        const index = this.messages.findIndex(m => m.id === updatedMessage.id);
        if (index >= 0) {
            this.messages[index] = updatedMessage;
            await this.renderer.updateMessage(updatedMessage);
        }
    }
    /**
     * Handle reaction update
     */
    async handleReactionUpdate(messageId, reactionCount) {
        Logger.debug('MessageFeed: Reaction updated', { messageId, reactionCount }, 'messages');
        await this.renderer.updateReactionCount(messageId, reactionCount);
    }
    /**
     * Handle avatar hover
     */
    handleAvatarHover(user, element) {
        // Delegate to window.userHoverModal if available
        const win = typeof window !== 'undefined' ? window : undefined;
        if (win?.userHoverModal?.show) {
            win.userHoverModal.show(user, element);
        }
    }
    /**
     * Handle "Show More" click
     */
    handleShowMore(messageId) {
        Logger.debug('MessageFeed: Show more clicked', { messageId }, 'messages');
        this.renderer.expandMessage(messageId);
    }
    /**
     * Sort messages: newest first (last on top)
     */
    sortMessagesNewestFirst(messages) {
        return [...messages].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA; // Descending (newest first)
        });
    }
    /**
     * Cleanup
     */
    destroy() {
        this.realtimeManager?.destroy();
        this.loadingIndicator.destroy();
        Logger.debug('MessageFeed: Destroyed', null, 'messages');
    }
}
