/**
 * Unified Message Renderer
 * Standardized message rendering across the application
 */
// Import conversion functions
const isMessage = (obj) => 'content' in obj && 'authorId' in obj;
const messageToNormalizedMessage = (message) => ({
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
export class UnifiedMessageRenderer {
    renderMessage(message) {
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
    updateMessage(element, message) {
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
    removeMessage(element) {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    /**
     * Static method to render a message
     */
    static renderMessage(message) {
        const instance = getUnifiedMessageRenderer();
        return instance.renderMessage(message);
    }
    /**
     * Static method to generate HTML string for a message
     */
    static async generateMessageHTML(message, _options = {}) {
        const renderer = getUnifiedMessageRenderer();
        // Convert to NormalizedMessage if needed
        const normalizedMessage = isMessage(message)
            ? messageToNormalizedMessage(message)
            : message;
        const element = renderer.renderMessage(normalizedMessage);
        return element.outerHTML;
    }
}
// Export singleton instance
let unifiedMessageRendererInstance = null;
export function getUnifiedMessageRenderer() {
    if (!unifiedMessageRendererInstance) {
        unifiedMessageRendererInstance = new UnifiedMessageRenderer();
    }
    return unifiedMessageRendererInstance;
}
//# sourceMappingURL=UnifiedMessageRenderer.js.map