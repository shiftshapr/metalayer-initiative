/**
 * PROVENANCE LINK INJECTOR
 *
 * Non-invasively injects <link rel="provenance"> tags into message DOM elements
 * Follows the .well-known/provenance pattern for discoverability
 */
declare class ProvenanceLinkInjector {
    private observer;
    private injectedMessages;
    private baseUrl;
    /**
     * Initialize the link injector
     */
    initialize(): Promise<void>;
    /**
     * Inject provenance links for messages already in the DOM
     */
    private injectLinksForExistingMessages;
    /**
     * Observe DOM for new messages and inject links
     */
    private observeNewMessages;
    /**
     * Extract message ID from element
     */
    private getMessageId;
    /**
     * Inject <link rel="provenance"> tag into message element
     */
    private injectLink;
    /**
     * Manually inject link for a specific message
     */
    injectForMessage(messageId: string, messageElement?: HTMLElement | null): void;
    /**
     * Update base URL for provenance links
     */
    setBaseUrl(url: string): void;
    /**
     * Cleanup observer
     */
    cleanup(): void;
}
export default ProvenanceLinkInjector;
//# sourceMappingURL=ProvenanceLinkInjector.d.ts.map