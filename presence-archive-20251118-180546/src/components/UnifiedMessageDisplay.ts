/**
 * UnifiedMessageDisplay - Renders messages with support for focus modes
 * 
 * Handles:
 * - Default display (standard message list)
 * - Parent in focus (emphasizes parent, collapses children)
 * - Child in focus (highlights child, shows parent as header)
 */

import type { Message } from '../services/MessageStore.js';

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
   * Render messages in the container
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

    // Clear container
    container.innerHTML = '';

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
    for (const message of messages) {
      const messageEl = await this.createMessageElement(message, {
        isHighlighted: message.id === options.highlightMessageId,
        onMessageClick: options.onMessageClick,
        onReplyClick: options.onReplyClick,
        onFocusClick: options.onFocusClick
      });
      container.appendChild(messageEl);
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
   * Create message element
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
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.dataset.messageId = message.id;
    messageDiv.dataset.focusContext = options.isParent ? 'parent' : options.isFocused ? 'child' : 'default';

    if (options.isHighlighted) {
      messageDiv.classList.add('highlighted');
    }

    if (options.isCollapsed) {
      messageDiv.classList.add('collapsed');
    }

    // Use existing addMessageToChat if available, otherwise create basic structure
    if (typeof window !== 'undefined' && (window as Window & { addMessageToChat?: (message: Message) => Promise<void> | void }).addMessageToChat) {
      // Use existing rendering function
      await (window as Window & { addMessageToChat?: (message: Message) => Promise<void> | void }).addMessageToChat!(message);
      const existingEl = document.querySelector(`[data-message-id="${message.id}"]`);
      if (existingEl) {
        return existingEl as HTMLElement;
      }
    }

    // Fallback: Create basic message structure
    const author = message.author || { name: 'Unknown', handle: 'unknown', avatarUrl: '' };
    messageDiv.innerHTML = `
      <div class="message-header">
        <div class="message-avatar">
          <img src="${author.avatarUrl}" alt="${author.name}" />
        </div>
        <div class="message-author">
          <span class="author-name">${author.name}</span>
          <span class="author-handle">@${author.handle}</span>
        </div>
        <div class="message-time">${this.formatTime(message.createdAt)}</div>
      </div>
      <div class="message-content">${this.escapeHtml(message.content)}</div>
      ${message.thread?.topReply ? this.renderTopReply(message.thread.topReply) : ''}
      <div class="message-actions">
        ${options.onReplyClick ? `<button class="reply-btn" data-message-id="${message.id}">Reply</button>` : ''}
        ${options.onFocusClick ? `<button class="focus-btn" data-message-id="${message.id}">Focus</button>` : ''}
      </div>
    `;

    // Add event listeners
    if (options.onMessageClick) {
      messageDiv.addEventListener('click', () => options.onMessageClick!(message));
    }

    const replyBtn = messageDiv.querySelector('.reply-btn');
    if (replyBtn && options.onReplyClick) {
      replyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        options.onReplyClick!(message);
      });
    }

    const focusBtn = messageDiv.querySelector('.focus-btn');
    if (focusBtn && options.onFocusClick) {
      focusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        options.onFocusClick!(message);
      });
    }

    return messageDiv;
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
        <span class="parent-author">${this.escapeHtml(parentAuthor.name)}</span>
        <span class="parent-content-preview">${this.escapeHtml(parent.content.substring(0, 100))}${parent.content.length > 100 ? '...' : ''}</span>
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

  /**
   * Render top reply in chain
   */
  private renderTopReply(topReply: { id: string; content: string; reactions: Record<string, number>; createdAt: string; author: { id: string; name: string; avatarUrl: string }; hasMoreReplies: boolean } | null | undefined): string {
    if (!topReply) return '';

    return `
      <div class="top-reply-chain">
        <div class="reply-chain-line"></div>
        <div class="top-reply-content">
          <div class="top-reply-author">${this.escapeHtml(topReply.author.name)}</div>
          <div class="top-reply-text">${this.escapeHtml(topReply.content.substring(0, 150))}${topReply.content.length > 150 ? '...' : ''}</div>
          ${topReply.hasMoreReplies ? `<button class="show-more-replies-btn">Show replies</button>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Format timestamp
   */
  private formatTime(timestamp: string | Date): string {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

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

