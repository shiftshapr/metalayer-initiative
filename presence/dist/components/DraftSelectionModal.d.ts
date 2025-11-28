/**
 * DraftSelectionModal - Modal for selecting and managing drafts
 *
 * Displays a list of user's drafts with options to:
 * - Select a draft to continue editing
 * - Delete drafts
 * - See draft preview
 */
export interface Draft {
    id: string;
    content: string;
    pageId: string;
    parentId?: string | null;
    quoteId?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    attachments?: unknown[];
}
export interface DraftSelectionModalOptions {
    pageId: string;
    userId: string;
    onSelect?: (draft: Draft) => void;
    onDelete?: (draftId: string) => void;
    onCancel?: () => void;
}
export declare class DraftSelectionModal {
    private modal;
    private options;
    private drafts;
    private isOpen;
    constructor();
    private setupEventListeners;
    /**
     * Open the draft selection modal
     */
    open(options: DraftSelectionModalOptions): Promise<void>;
    /**
     * Close the modal
     */
    close(): void;
    /**
     * Load drafts from API
     */
    private loadDrafts;
    /**
     * Render the modal
     */
    private renderModal;
    /**
     * Get modal HTML
     */
    private getModalHTML;
    /**
     * Get draft item HTML
     */
    private getDraftItemHTML;
    /**
     * Attach event listeners
     */
    private attachEventListeners;
    /**
     * Delete a draft
     */
    private deleteDraft;
    /**
     * Resolve API base URL
     */
    private resolveApiBaseUrl;
    /**
     * Escape HTML
     */
    private escapeHtml;
}
export declare const draftSelectionModal: DraftSelectionModal;
//# sourceMappingURL=DraftSelectionModal.d.ts.map