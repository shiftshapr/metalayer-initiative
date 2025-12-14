/**
 * Unified Message Renderer
 * Standardized message rendering across the application
 */

import type { Message } from '../types/index.js';
import type { NormalizedMessage, UnifiedMessageDisplay } from '../types/messageHelpers.js';

// Import conversion functions
const isMessage = (obj: Message | NormalizedMessage): obj is Message => 'content' in obj && 'authorId' in obj;
const messageToNormalizedMessage = (message: Message): NormalizedMessage => ({
  id: message.id,
  body: message.content,
  author: {
    id: message.authorId,
    name: message.author.name,
    handle: message.authorHandle,
    email: message.authorEmail,
    avatarUrl: message.author.avatarUrl,
    auraColor: message.author.auraColor,
  },
  timestamp: message.createdAt,
  threadId: message.conversationId,
  parentId: message.parentId || undefined,
  reactions: message.reactions,
  isBookmarked: message.isBookmarked,
  bookmarkCount: message.bookmarkCount,
});

export class UnifiedMessageRenderer implements UnifiedMessageDisplay {
  renderMessage(message: NormalizedMessage): HTMLElement {
    const element = document.createElement('div');
    element.className = 'message-item';
    element.setAttribute('data-message-id', message.id);

    element.innerHTML = `
      <div class="message-header">
        <span class="author-name">${this.escapeHtml(message.author.name || 'Unknown')}</span>
        <span class="message-timestamp">${new Date(message.timestamp).toLocaleString()}</span>
      </div>
      <div class="message-body">${this.escapeHtml(message.body)}</div>
    `;

    return element;
  }

  updateMessage(element: HTMLElement, message: NormalizedMessage): void {
    const authorElement = element.querySelector('.author-name');
    const bodyElement = element.querySelector('.message-body');
    const timestampElement = element.querySelector('.message-timestamp');

    if (authorElement) {
      authorElement.textContent = message.author.name || 'Unknown';
    }
    if (bodyElement) {
      bodyElement.textContent = message.body;
    }
    if (timestampElement) {
      timestampElement.textContent = new Date(message.timestamp).toLocaleString();
    }

    element.setAttribute('data-message-id', message.id);
  }

  removeMessage(element: HTMLElement): void {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Static method to render a message
   */
  static renderMessage(message: NormalizedMessage): HTMLElement {
    const instance = getUnifiedMessageRenderer();
    return instance.renderMessage(message);
  }

  /**
   * Static method to generate HTML string for a message
   */
  static async generateMessageHTML(message: Message | NormalizedMessage, _options: any = {}): Promise<string> {
    const renderer = getUnifiedMessageRenderer();
    // Convert to NormalizedMessage if needed
    const normalizedMessage: NormalizedMessage = isMessage(message)
      ? messageToNormalizedMessage(message)
      : message as NormalizedMessage;
    const element = renderer.renderMessage(normalizedMessage);
    return element.outerHTML;
  }
}

// Export singleton instance
let unifiedMessageRendererInstance: UnifiedMessageRenderer | null = null;

export function getUnifiedMessageRenderer(): UnifiedMessageRenderer {
  if (!unifiedMessageRendererInstance) {
    unifiedMessageRendererInstance = new UnifiedMessageRenderer();
  }
  return unifiedMessageRendererInstance;
}

// Export interface for type checking
export type { UnifiedMessageDisplay };