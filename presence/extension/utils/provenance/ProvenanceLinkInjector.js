/**
 * PROVENANCE LINK INJECTOR
 *
 * Non-invasively injects <link rel="provenance"> tags into message DOM elements
 * Follows the .well-known/provenance pattern for discoverability
 */
class ProvenanceLinkInjector {
    constructor() {
        this.isEnabled = false;
        this.observer = null;
        this.injectedMessages = new Set();
        this.baseUrl = 'https://app.canopi.live';
    }
    /**
     * Initialize the link injector
     */
    async initialize() {
        const service = window.provenanceService;
        if (!service) {
            console.warn('[ProvenanceLinkInjector] ProvenanceService not available');
            return;
        }
        // Check if enabled
        const enabled = localStorage.getItem('provenance_enabled') === 'true';
        if (!enabled) {
            console.log('[ProvenanceLinkInjector] Disabled (provenance not enabled)');
            return;
        }
        this.isEnabled = true;
        this.baseUrl = localStorage.getItem('provenance_base_url') || this.baseUrl;
        // Inject links for existing messages
        this.injectLinksForExistingMessages();
        // Watch for new messages
        this.observeNewMessages();
        console.log('[ProvenanceLinkInjector] Initialized');
    }
    /**
     * Inject provenance links for messages already in the DOM
     */
    injectLinksForExistingMessages() {
        const messages = document.querySelectorAll('[data-message-id], .message, .chat-message');
        messages.forEach(messageElement => {
            const messageId = this.getMessageId(messageElement);
            if (messageId && !this.injectedMessages.has(messageId)) {
                this.injectLink(messageElement, messageId);
            }
        });
    }
    /**
     * Observe DOM for new messages and inject links
     */
    observeNewMessages() {
        // Watch for new message elements
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if this is a message element
                        const messageId = this.getMessageId(node);
                        if (messageId && !this.injectedMessages.has(messageId)) {
                            this.injectLink(node, messageId);
                        }
                        // Also check children (in case message container is added)
                        const messageElements = node.querySelectorAll?.('[data-message-id], .message, .chat-message');
                        if (messageElements) {
                            messageElements.forEach((msgEl) => {
                                const id = this.getMessageId(msgEl);
                                if (id && !this.injectedMessages.has(id)) {
                                    this.injectLink(msgEl, id);
                                }
                            });
                        }
                    }
                });
            });
        });
        // Observe the document body for changes
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    /**
     * Extract message ID from element
     */
    getMessageId(element) {
        // Try data attribute first
        if (element.dataset?.messageId) {
            return element.dataset.messageId;
        }
        // Try data attribute with dash
        const attr = element.getAttribute?.('data-message-id');
        if (attr) {
            return attr;
        }
        // Try to find ID in nested elements
        const idElement = element.querySelector?.('[data-message-id]');
        if (idElement?.dataset?.messageId) {
            return idElement.dataset.messageId;
        }
        // Try to extract from message object if stored
        const messageObj = element.message;
        if (messageObj?.id) {
            return messageObj.id;
        }
        return null;
    }
    /**
     * Inject <link rel="provenance"> tag into message element
     */
    injectLink(messageElement, messageId) {
        if (this.injectedMessages.has(messageId)) {
            return; // Already injected
        }
        // Check if link already exists
        const existingLink = messageElement.querySelector?.('link[rel="provenance"]');
        if (existingLink) {
            this.injectedMessages.add(messageId);
            return;
        }
        // Generate provenance URL
        const service = window.provenanceService;
        const provenanceUrl = service?.getProvenanceUrl?.(messageId, this.baseUrl)
            || `${this.baseUrl}/message/${messageId}/.well-known/provenance`;
        // Create link element
        const link = document.createElement('link');
        link.rel = 'provenance';
        link.href = provenanceUrl;
        link.type = 'application/json';
        link.setAttribute('data-provenance-message-id', messageId);
        // Try to inject in <head> if message has a shadow root or specific structure
        // Otherwise inject near the message element
        const head = document.head;
        if (head) {
            // Check if link already exists in head
            const existingHeadLink = head.querySelector(`link[rel="provenance"][href="${provenanceUrl}"]`);
            if (!existingHeadLink) {
                head.appendChild(link);
                this.injectedMessages.add(messageId);
                console.log('[ProvenanceLinkInjector] Injected link in <head> for message', messageId);
                return;
            }
        }
        // Fallback: inject as a data attribute or meta tag near the message
        // Some browsers don't support <link> in body, so we'll use a meta tag
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'provenance');
        meta.setAttribute('content', provenanceUrl);
        meta.setAttribute('data-provenance-message-id', messageId);
        // Try to prepend to message element
        if (messageElement.insertBefore) {
            messageElement.insertBefore(meta, messageElement.firstChild);
        }
        else {
            messageElement.appendChild(meta);
        }
        this.injectedMessages.add(messageId);
        console.log('[ProvenanceLinkInjector] Injected provenance link for message', messageId);
    }
    /**
     * Manually inject link for a specific message
     */
    injectForMessage(messageId, messageElement = null) {
        if (!messageElement) {
            // Find message element by ID
            messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (!messageElement) {
                console.warn('[ProvenanceLinkInjector] Message element not found for', messageId);
                return;
            }
        }
        this.injectLink(messageElement, messageId);
    }
    /**
     * Update base URL for provenance links
     */
    setBaseUrl(url) {
        this.baseUrl = url;
        localStorage.setItem('provenance_base_url', url);
        // Re-inject all links with new URL
        this.injectedMessages.clear();
        this.injectLinksForExistingMessages();
    }
    /**
     * Cleanup observer
     */
    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.injectedMessages.clear();
    }
}
// Export for browser use
if (typeof window !== 'undefined') {
    Object.assign(window, { provenanceLinkInjector: new ProvenanceLinkInjector() });
    console.log('[ProvenanceLinkInjector] Available at window.provenanceLinkInjector');
}
export default ProvenanceLinkInjector;
