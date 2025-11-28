/**
 * UnifiedMessageDisplay - Renders messages with support for focus modes
 * 
 * Handles:
 * - Default display (standard message list)
 * - Parent in focus (emphasizes parent, collapses children)
 * - Child in focus (highlights child, shows parent as header)
 */

import type { Message, User } from '../types/index.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { UnifiedMessageRenderer } from '../utils/UnifiedMessageRenderer.js';
import { getMessageActionListenersService } from '../services/MessageActionListenersService.js';

import { handleError } from '../utils/ErrorHandler.js';

import { Logger } from '../utils/Logger.js';

type MessageWithMetadata = Message & {
  reactions?: Array<Record<string, unknown>>;
  reactionCount?: number;
  replyCount?: number;
  bookmarkCount?: number;
  isBookmarked?: boolean;
  hasUserReplied?: boolean;
  hasUserReposted?: boolean;
  hasUserShared?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  communityName?: string;
};

const PUBLIC_SQUARE_COMMUNITY_ID = 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4';

export type FocusContext = 'default' | 'parent' | 'child';

export interface DisplayOptions {
  focusContext?: FocusContext;
  parentMessage?: Message | null;
  highlightMessageId?: string | null;
  onMessageClick?: (message: Message) => void;
  onReplyClick?: (message: Message) => void;
  onFocusClick?: (message: Message) => void;
}

export class UnifiedMessageDisplay {
  private container: HTMLElement | null = null;

  /**
   * Get current container (for renderMessageElement)
   */
  getCurrentContainer(): HTMLElement | null {
    return this.container;
  }

  /**
   * Render messages in the container
   * ROOT CAUSE FIX: Ensure container is cleared and messages are properly appended
   */
  async render(
    messages: Message[],
    container: HTMLElement,
    options: DisplayOptions = {}
  ): Promise<void> {
    this.container = container;
    const {
      focusContext = 'default',
      parentMessage = null,
      highlightMessageId = null,
      onMessageClick,
      onReplyClick,
      onFocusClick
    } = options;

    // CRITICAL FIX: ALWAYS clear ALL message elements completely before rendering to prevent duplicates
    // The diagnostic found 256 DOM elements with only 12 unique IDs - massive duplication!
    // State is clean (12 unique), but DOM is broken. Must clear aggressively.
    const existingFocusContext = container.className.match(/focus-mode-(\w+)/)?.[1];
    
    // CRITICAL FIX: Remove ALL elements with data-message-id attribute (simpler, more aggressive)
    // This catches all message elements regardless of their structure
    const allMessageElements = Array.from(container.querySelectorAll('[data-message-id]'));
    const existingMessageCount = allMessageElements.length;
    
    // Also remove elements with .message class (backup for elements without data-message-id)
    const messageClassElements = Array.from(container.querySelectorAll('.message'));
    const allElementsToRemove = new Set([...allMessageElements, ...messageClassElements]);
    
    // Remove all duplicates
    allElementsToRemove.forEach(el => {
      // Only remove if it's actually a message element (not a button inside a message)
      // Buttons have data-message-id but are children of .message elements
      const isMessageElement = el.classList.contains('message') || 
                               (el.hasAttribute('data-message-id') && !el.closest('.message'));
      if (isMessageElement) {
        el.remove();
      }
    });
    
    Logger.debug(`🔍 UnifiedMessageDisplay: Removed ${allElementsToRemove.size} message elements (${existingMessageCount} existing messages, context: ${existingFocusContext} -> ${focusContext}, 'messages')`);
    
    Logger.debug(`🔍 UnifiedMessageDisplay: Rendering ${messages.length} messages to container:`, container.id || container.className, 'messages');

    // Apply focus mode class
    container.classList.remove('focus-mode-parent', 'focus-mode-child', 'focus-mode-default');
    container.classList.add(`focus-mode-${focusContext}`);

    // Render based on focus context
    switch (focusContext) {
      case 'parent':
        await this.renderParentFocus(messages, container, {
          parentMessage,
          highlightMessageId,
          onMessageClick,
          onReplyClick,
          onFocusClick
        });
        break;

      case 'child':
        await this.renderChildFocus(messages, container, {
          parentMessage,
          highlightMessageId,
          onMessageClick,
          onReplyClick,
          onFocusClick
        });
        break;

      default:
        await this.renderDefault(messages, container, {
          highlightMessageId,
          onMessageClick,
          onReplyClick,
          onFocusClick
        });
        break;
    }
  }

  /**
   * Render default view (standard message list)
   * ROOT CAUSE FIX: Check for duplicates before appending
   */
  private async renderDefault(
    messages: Message[],
    container: HTMLElement,
    options: {
      highlightMessageId?: string | null;
      onMessageClick?: (message: Message) => void;
      onReplyClick?: (message: Message) => void;
      onFocusClick?: (message: Message) => void;
    }
  ): Promise<void> {
    // CRITICAL FIX: Check STATE first (single source of truth), then DOM as backup
    // Diagnostic found state is clean (12 unique) but DOM has 244 duplicates
    // State should be the authority, not DOM
    const stateManager = stateManagerInstance;
    let stateMessageIds = new Set<string>();
    
    if (stateManager) {
      const chatData = stateManager.getState('chat.data');
      if (Array.isArray(chatData)) {
        stateMessageIds = new Set(chatData.map(m => m.id));
        Logger.debug(`🔍 UnifiedMessageDisplay: State has ${chatData.length} messages (${stateMessageIds.size} unique, null, 'messages')`);
      }
    }
    
    // Also check DOM as backup (but state is primary)
    const allChatContainers = document.querySelectorAll('.chat-messages');
    const domExistingIds = new Set<string>();
    allChatContainers.forEach(cont => {
      // Get all elements with data-message-id (simpler check)
      const messageElements = Array.from(cont.querySelectorAll('[data-message-id]'));
      messageElements.forEach(el => {
        const id = el.getAttribute('data-message-id');
        if (id) domExistingIds.add(id);
      });
    });
    
    // CRITICAL FIX: Use state as primary source, DOM as backup
    // If message is in state, it's already loaded (don't add again)
    // If not in state but in DOM, it's a duplicate (don't add)
    const existingIds = stateMessageIds.size > 0 ? stateMessageIds : domExistingIds;
    const newMessages = messages.filter(msg => !existingIds.has(msg.id));
    
    if (newMessages.length !== messages.length) {
      Logger.warn(`⚠️ UnifiedMessageDisplay: Filtered out ${messages.length - newMessages.length} duplicate messages (state: ${stateMessageIds.size}, DOM: ${domExistingIds.size}, 'messages')`);
    }
    
    for (const message of newMessages) {
      const messageEl = await this.createMessageElement(message, {
        isHighlighted: message.id === options.highlightMessageId,
        onMessageClick: options.onMessageClick,
        onReplyClick: options.onReplyClick,
        onFocusClick: options.onFocusClick
      });
      
      // ROOT CAUSE FIX: Ensure data-message-id is set for reaction updates
      if (!messageEl.dataset.messageId) {
        messageEl.dataset.messageId = message.id;
      }
      
      // REFACTOR: Append messages at bottom for standard chat order (oldest first, newest last)
      // Messages from API are typically sorted oldest-first, so append maintains correct order
      try {
        // Check if this is a reply - replies should be inserted after their parent
        if (message.parentId) {
          const parentElement = container.querySelector(`[data-message-id="${message.parentId}"]`);
          if (parentElement && parentElement.nextSibling) {
            container.insertBefore(messageEl, parentElement.nextSibling);
          } else {
            // Parent not found or is last, append after parent's container
            container.appendChild(messageEl);
          }
        } else {
          // REFACTOR: Append at bottom for standard chat order (oldest at top, newest at bottom)
          // This ensures messages appear in chronological order when loaded from database
          container.appendChild(messageEl);
        }
        existingIds.add(message.id); // Track added message
        Logger.debug(`✅ UnifiedMessageDisplay: Inserted message ${message.id} to DOM`, null, 'messages');
      } catch (error: unknown) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'UnifiedMessageDisplay',
            messageId: message?.id
            }
        });;
      
    }
    }
    
    // CRITICAL FIX: Verify actual message elements (not buttons)
    const actualMessages = Array.from(container.querySelectorAll('.message, [data-message-id]')).filter(el => {
      return el.classList.contains('message') || 
             el.querySelector('.message-content-wrapper') !== null ||
             (el.querySelector('.message-footer-actions') !== null && el.querySelector('.message-content') !== null);
    });
    const finalCount = actualMessages.length;
    Logger.debug(`🔍 UnifiedMessageDisplay: Rendered ${newMessages.length} new messages, ${finalCount} actual message elements in container`, 'messages');
    if (finalCount > newMessages.length) {
      Logger.warn(`⚠️ UnifiedMessageDisplay: Container has more messages than expected! Expected ${newMessages.length} new, found ${finalCount} total`, 'messages');
    }
  }

  /**
   * Render parent-in-focus view
   */
  private async renderParentFocus(
    messages: Message[],
    container: HTMLElement,
    options: {
      parentMessage?: Message | null;
      highlightMessageId?: string | null;
      onMessageClick?: (message: Message) => void;
      onReplyClick?: (message: Message) => void;
      onFocusClick?: (message: Message) => void;
    }
  ): Promise<void> {
    // Render parent message prominently
    if (options.parentMessage) {
      const parentEl = await this.createMessageElement(options.parentMessage, {
        isParent: true,
        isHighlighted: options.parentMessage.id === options.highlightMessageId,
        onMessageClick: options.onMessageClick,
        onReplyClick: options.onReplyClick,
        onFocusClick: options.onFocusClick
      });
      parentEl.classList.add('parent-in-focus');
      container.appendChild(parentEl);
    }

    // Render children as collapsed/summary
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'children-collapsed';
    
    for (const message of messages) {
      const childEl = await this.createMessageElement(message, {
        isCollapsed: true,
        isHighlighted: message.id === options.highlightMessageId,
        onMessageClick: options.onMessageClick,
        onReplyClick: options.onReplyClick,
        onFocusClick: options.onFocusClick
      });
      childrenContainer.appendChild(childEl);
    }

    container.appendChild(childrenContainer);
  }

  /**
   * Render child-in-focus view
   */
  private async renderChildFocus(
    messages: Message[],
    container: HTMLElement,
    options: {
      parentMessage?: Message | null;
      highlightMessageId?: string | null;
      onMessageClick?: (message: Message) => void;
      onReplyClick?: (message: Message) => void;
      onFocusClick?: (message: Message) => void;
    }
  ): Promise<void> {
    // Render parent as compact header
    if (options.parentMessage) {
      const parentHeader = await this.createParentHeader(options.parentMessage, {
        onMessageClick: options.onMessageClick,
        onFocusClick: options.onFocusClick
      });
      container.appendChild(parentHeader);
    }

    // Render focused child prominently
    const focusedChild = messages.find(m => m.id === options.highlightMessageId);
    if (focusedChild) {
      const childEl = await this.createMessageElement(focusedChild, {
        isFocused: true,
        isHighlighted: true,
        onMessageClick: options.onMessageClick,
        onReplyClick: options.onReplyClick,
        onFocusClick: options.onFocusClick
      });
      childEl.classList.add('child-in-focus');
      container.appendChild(childEl);
    }

    // Render other children normally
    for (const message of messages) {
      if (message.id !== options.highlightMessageId) {
        const messageEl = await this.createMessageElement(message, {
          isHighlighted: false,
          onMessageClick: options.onMessageClick,
          onReplyClick: options.onReplyClick,
          onFocusClick: options.onFocusClick
        });
        container.appendChild(messageEl);
      }
    }
  }

  /**
   * Create message element using full rendering pipeline
   */
  private async createMessageElement(
    message: Message,
    options: {
      isParent?: boolean;
      isFocused?: boolean;
      isCollapsed?: boolean;
      isHighlighted?: boolean;
      onMessageClick?: (message: Message) => void;
      onReplyClick?: (message: Message) => void;
      onFocusClick?: (message: Message) => void;
    }
  ): Promise<HTMLElement> {
    const container = this.getCurrentContainer();
    const messageEl = await this.renderWithUnifiedRenderer(message, container);
    this.applyFocusClasses(messageEl, options);
    this.ensureDataAttributes(messageEl, message);
    this.attachFocusHandler(messageEl, message, options);
    
    // CRITICAL FIX: Add message-loaded class so footer is visible
    messageEl.classList.add('message-loaded');

    // CRITICAL FIX: Use MessageActionListenersService - ensure it's initialized
    try {
      let actionListenersService = getMessageActionListenersService();
      
      // If service not initialized, try to initialize it with window fallbacks
      if (!actionListenersService) {
        Logger.warn('⚠️ UnifiedMessageDisplay: MessageActionListenersService not initialized, attempting to initialize...', 'messages');
        const { initializeMessageActionListenersService } = await import('../services/MessageActionListenersService.js');
        
        // Initialize with window fallbacks for services
        const win = typeof window !== 'undefined' ? window as Window & {
          reactionsService?: { toggleReaction?: (messageId: string) => Promise<void>; loadReactions?: (messageId: string) => Promise<void> };
          bookmarkService?: { toggleBookmark?: (messageId: string) => Promise<void> };
          replyService?: { replyToMessage?: (message: Message) => Promise<void> };
          repostService?: { repostMessage?: (message: Message) => Promise<void> };
          shareService?: { shareMessage?: (message: Message) => Promise<void> };
          editService?: { editMessage?: (messageId: string, newContent: string) => Promise<void> };
          deleteService?: { deleteMessage?: (messageId: string) => Promise<void> };
          toggleReaction?: (messageId: string) => Promise<void>;
          loadMessageReactions?: (messageId: string) => Promise<void>;
          toggleBookmark?: (messageId: string) => Promise<void>;
          handleReplyToMessage?: (message: Message) => Promise<void>;
          repostMessage?: (message: Message) => Promise<void>;
          shareMessage?: (message: Message) => Promise<void>;
          updateMessageInChat?: (message: Message) => void;
          removeMessageFromChat?: (messageId: string) => void;
        } : undefined;
        initializeMessageActionListenersService({
          reactionsService: win?.reactionsService || { 
            toggleReaction: win?.toggleReaction,
            loadReactions: win?.loadMessageReactions 
          },
          bookmarkService: win?.bookmarkService || { 
            toggleBookmark: win?.toggleBookmark 
          },
          replyService: win?.replyService || { 
            replyToMessage: win?.handleReplyToMessage 
          },
          repostService: win?.repostService || { 
            repostMessage: win?.repostMessage 
          },
          shareService: win?.shareService || { 
            shareMessage: win?.shareMessage 
          },
          editService: win?.editService || (win?.updateMessageInChat ? {
            editMessage: async (id: string, content: string): Promise<void> => {
              const updateFn = win?.updateMessageInChat;
              if (updateFn) {
                const msg = { id, content } as Message;
                updateFn(msg);
              }
            }
          } : undefined),
          deleteService: win?.deleteService || (win?.removeMessageFromChat ? {
            deleteMessage: async (messageId: string): Promise<void> => {
              const removeFn = win?.removeMessageFromChat;
              if (removeFn) {
                removeFn(messageId);
              }
            }
          } : undefined)
        });
        
        actionListenersService = getMessageActionListenersService();
      }
      
      if (actionListenersService) {
        actionListenersService.attachListeners(messageEl, message);
        Logger.debug(`✅ UnifiedMessageDisplay: Attached action listeners for message ${message.id}`, null, 'messages');
      } else {
        throw new Error('Failed to get service after initialization');
      }
    } catch (error: unknown) {
      // Fallback to window if service not available
      const win = typeof window !== 'undefined'
        ? window as Window & {
            addMessageActionListeners?: (messageDiv: HTMLElement, message: Message) => void;
            loadMessageReactions?: (messageId: string) => Promise<void>;
          }
        : undefined;

      if (win?.addMessageActionListeners) {
        try {
          win.addMessageActionListeners(messageEl, message);
        } catch (err: unknown) {
          handleError(err, {
            log: true,
            logLevel: 'warn',
            context: {
              operation: 'addMessageActionListeners',
              component: 'UnifiedMessageDisplay',
              messageId: message?.id
            }
          });
        }
      } else {
        Logger.warn('⚠️ UnifiedMessageDisplay: No action listener service available and no window fallback', null, 'messages');
      }
    }

    // Load reactions (if service available)
    const win = typeof window !== 'undefined'
      ? window as Window & {
          loadMessageReactions?: (messageId: string) => Promise<void>;
        }
      : undefined;

    if (win?.loadMessageReactions && typeof win.loadMessageReactions === 'function') {
      const loadMessageReactions = win.loadMessageReactions;
      setTimeout(async () => {
        try {
          await loadMessageReactions(message.id);
        } catch (error: unknown) {
          handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
              operation: 'loadMessageReactions',
              component: 'UnifiedMessageDisplay',
              messageId: message?.id
            }
          });
        }
      }, 100);
    }

    // CRITICAL FIX: Attach avatar hover handlers for user hover modal
    const avatarContainer = messageEl.querySelector('.avatar-container');
    if (avatarContainer && message.author) {
      const userHoverModal = (win as Window & { userHoverModal?: { show?: (user: User, element: HTMLElement) => void } }).userHoverModal;
      if (userHoverModal && userHoverModal.show) {
        const showFn = userHoverModal.show;
        avatarContainer.addEventListener('mouseenter', (e) => {
          e.stopPropagation();
          try {
            showFn(message.author as User, avatarContainer as HTMLElement);
          } catch (error: unknown) {
            handleError(error, {
              log: true,
              logLevel: 'warn',
              context: {
                operation: 'showUserHoverModal',
                component: 'UnifiedMessageDisplay',
                messageId: message?.id
              }
            });
          }
        });
        avatarContainer.addEventListener('mouseleave', (e) => {
          e.stopPropagation();
          // Hover modal should handle hiding on mouseleave
        });
      }
    }

    return messageEl;
  }

  private applyFocusClasses(
    messageEl: HTMLElement,
    options: { isParent?: boolean; isFocused?: boolean; isCollapsed?: boolean; isHighlighted?: boolean }
  ): void {
    if (options.isParent) {
      messageEl.classList.add('parent-in-focus');
    }
    if (options.isFocused) {
      messageEl.classList.add('child-in-focus');
    }
    if (options.isHighlighted) {
      messageEl.classList.add('highlighted');
    }
    if (options.isCollapsed) {
      messageEl.classList.add('collapsed');
    }
  }

  private ensureDataAttributes(messageEl: HTMLElement, message: Message): void {
    if (!messageEl.dataset.messageId) {
      messageEl.dataset.messageId = message.id;
    }
    if (message.parentId && !messageEl.dataset.parentId) {
      messageEl.dataset.parentId = message.parentId;
    }
  }

  private attachFocusHandler(
    messageEl: HTMLElement,
    message: Message,
    options: { onMessageClick?: (message: Message) => void; onFocusClick?: (message: Message) => void }
  ): void {
    if (!options.onMessageClick && !options.onFocusClick) {
      return;
    }

    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.action-dots-btn, .action-dropdown, .reaction-btn, .reply-btn, .bookmark-btn, .share-btn, a')) {
        return;
      }

      if (options.onFocusClick) {
        options.onFocusClick(message);
      } else if (options.onMessageClick) {
        options.onMessageClick(message);
      }
    };

    messageEl.addEventListener('click', clickHandler);
    messageEl.style.cursor = 'pointer';
  }

  private async renderWithUnifiedRenderer(message: Message, container: HTMLElement | null): Promise<HTMLElement> {
    try {
      const typed = message as MessageWithMetadata;
      
      // CRITICAL FIX: Ensure communityId is available - check message.communityId first, then fallback to state
      if (!typed.communityId) {
        // Try to get from message data directly
        const messageData = (message as { communityId?: string });
        if (messageData.communityId) {
          typed.communityId = messageData.communityId;
        } else {
          // Fallback: Try to get from stateManager chat.data
          const chatData = stateManagerInstance.getState('chat.data') as Message[] | null;
          if (chatData) {
            const messageInState = chatData.find(m => m.id === message.id);
            if (messageInState?.communityId) {
              typed.communityId = messageInState.communityId;
            }
          }
        }
      }
      
      const reactionCount =
        typeof typed.reactionCount === 'number'
          ? typed.reactionCount
          : Array.isArray(typed.reactions)
            ? typed.reactions.length
            : 0;
      const replyCount =
        typeof typed.replyCount === 'number'
          ? typed.replyCount
          : typed.hasReplies
            ? 1
            : 0;
      const bookmarkCount = typeof typed.bookmarkCount === 'number' ? typed.bookmarkCount : 0;
      const communityName = typed.communityName || (await this.resolveCommunityName(typed.communityId));
      
      // Counts and community name are now properly resolved

      return UnifiedMessageRenderer.renderMessage(message, {
        isReply: !!message.parentId,
        isFocusMode: this.isFocusModeContainer(container),
        author: message.author,
        communityName,
        reactionCount,
        replyCount,
        bookmarkCount,
        isBookmarked: Boolean(typed.isBookmarked),
        hasUserReplied: Boolean(typed.hasUserReplied),
        hasUserReposted: Boolean(typed.hasUserReposted),
        hasUserShared: Boolean(typed.hasUserShared),
        canEdit: Boolean(typed.canEdit),
        canDelete: Boolean(typed.canDelete)
      });
    } catch (error: unknown) {
      handleError(error, {
        log: true,
        logLevel: 'error',
        context: {
          operation: 'renderWithUnifiedRenderer',
          component: 'UnifiedMessageDisplay',
          messageId: message.id
        }
      });
      // Return a fallback element on error
      const fallbackEl = document.createElement('div');
      fallbackEl.className = 'message-error';
      fallbackEl.textContent = 'Error rendering message';
      return fallbackEl;
    }
  }

  private isFocusModeContainer(container: HTMLElement | null): boolean {
    if (!container) return false;
    return container.classList.contains('focus-mode-child') || container.classList.contains('focus-mode-parent');
  }

  private async resolveCommunityName(communityId?: string | null): Promise<string> {
    if (!communityId) {
      return '';
    }

    if (typeof window !== 'undefined') {
      const win = window as Window & {
        CommunitiesModule?: { getCommunityName?: (id: string) => string | Promise<string> };
      };

      const module = win.CommunitiesModule;
      if (module?.getCommunityName) {
        const result = module.getCommunityName(communityId);
        if (typeof result === 'string') {
          return result;
        }
        if (result && typeof (result as Promise<string>).then === 'function') {
          try {
            return await result;
          } catch {
            // Ignore and fall back to state
          }
        }
      }
    }

    const communities = stateManagerInstance.getState('communities') as Record<string, { name?: string }> | null;
    if (communities && communities[communityId]?.name) {
      return communities[communityId]!.name!;
    }

    if (communityId === PUBLIC_SQUARE_COMMUNITY_ID) {
      return 'Public Square';
    }

    return '';
  }

  /**
   * Create parent header (compact view for child-in-focus)
   */
  private async createParentHeader(
    parent: Message,
    options: {
      onMessageClick?: (message: Message) => void;
      onFocusClick?: (message: Message) => void;
    }
  ): Promise<HTMLElement> {
    const header = document.createElement('div');
    header.className = 'parent-header-compact';
    const parentAuthor = parent.author || { name: 'Unknown' };
    header.innerHTML = `
      <div class="parent-header-content">
        <span class="parent-author">${this.escapeHtml(parentAuthor.name || 'Unknown')}</span>
        <span class="parent-content-preview">${this.escapeHtml((parent.content || '').substring(0, 100))}${(parent.content || '').length > 100 ? '...' : ''}</span>
      </div>
      ${options.onFocusClick ? `<button class="focus-parent-btn" data-message-id="${parent.id}">Focus on parent</button>` : ''}
    `;

    if (options.onMessageClick) {
      header.addEventListener('click', () => options.onMessageClick!(parent));
    }

    const focusBtn = header.querySelector('.focus-parent-btn');
    if (focusBtn && options.onFocusClick) {
      focusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        options.onFocusClick!(parent);
      });
    }

    return header;
  }

  // Removed unused methods: _renderTopReply and _formatTime
  // These were kept for potential future use but are not currently needed.
  // If needed in the future, they can be re-implemented or restored from git history.

  /**
   * Escape HTML
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export singleton instance
export const unifiedMessageDisplay = new UnifiedMessageDisplay();

