/**
 * UnifiedMessageModal - Unified modal for creating/updating all message types
 *
 * Features:
 * - New messages (top-level)
 * - Replies (with parent context)
 * - Quotes (with quoted message preview)
 * - Edits (existing message content)
 * - Media attachments (images, audio, video) with preview
 * - Emoji picker
 * - Camera capture
 * - Focus context support
 */
import type { Message } from '../types/index.js';
export type MessageModalMode = 'new' | 'reply' | 'quote' | 'edit';
export type MessageKind = 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'MIXED';
export interface Attachment {
    id: string;
    type: 'image' | 'audio' | 'video';
    url: string;
    thumbnailUrl?: string;
    filename: string;
    size: number;
    mimeType: string;
    blob?: Blob;
}
export interface EmojiMetadata {
    emojis?: string[];
    emojiCount?: number;
    hasEmoji?: boolean;
}
export interface FocusContext {
    mode: 'default' | 'parent-in-focus' | 'child-in-focus';
    parentId?: string;
    childId?: string;
}
export interface MessageModalOptions {
    mode: MessageModalMode;
    pageId: string;
    communityId?: string;
    parentId?: string | null;
    quoteId?: string | null;
    editMessage?: Message;
    focusContext?: FocusContext;
    premiumText?: boolean;
    onSuccess?: (message: Message) => void;
    onDraftSaved?: (message: Message) => void;
    onCancel?: () => void;
}
export declare class UnifiedMessageModal {
    private modal;
    private options;
    private attachments;
    private emojiMetadata;
    private cameraStream;
    private isOpen;
    private parentMessage;
    private quotedMessage;
    constructor();
    private setupEventListeners;
    /**
     * Open the modal with the given options
     */
    open(options: MessageModalOptions): Promise<void>;
    /**
     * Close the modal
     */
    close(): void;
    /**
     * Render the modal HTML
     *
     * CRITICAL: Modal must be appended to document.body (not sidebar) to escape
     * sidebar container constraints. Fixed positioning is viewport-relative, but
     * parent overflow:hidden can still clip it, so we ensure body is the parent.
     */
    private render;
    /**
     * Get modal HTML based on mode
     * X (Twitter) Design Pattern:
     * - Top bar: X (close) on left, "Drafts" on right
     * - User profile picture on left
     * - Audience selector ("Everyone" dropdown) next to profile
     * - Large text input with "What's happening?" placeholder
     * - Reply settings below ("Everyone can reply" with globe icon)
     * - Bottom toolbar with icons (media, GIF, poll, list, emoji, calendar, location, bold, italic)
     * - Post button (gray when disabled, blue when active)
     */
    private getModalHTML;
    private getParentContextHTML;
    private getQuoteContextHTML;
    /**
     * Re-render context sections (reply/quote)
     */
    private renderContextSection;
    /**
     * Load parent message data
     */
    private loadParentMessage;
    /**
     * Load quoted message data
     */
    private loadQuotedMessage;
    /**
     * Escape HTML to prevent XSS
     */
    private escapeHtml;
    /**
     * Setup event handlers for modal interactions
     */
    private setupModalHandlers;
    /**
     * Update Post button state (disabled when empty, enabled when has content)
     */
    private updatePostButtonState;
    /**
     * Auto-resize textarea
     */
    private autoResizeTextarea;
    /**
     * Handle drafts
     */
    private handleDrafts;
    /**
     * Load a draft into the modal
     */
    private loadDraft;
    /**
     * Handle audience selection
     */
    private handleAudienceSelect;
    /**
     * Handle GIF picker
     */
    private handleGIF;
    /**
     * Handle poll creation
     */
    private handlePoll;
    /**
     * Handle list creation
     */
    private handleList;
    /**
     * Handle schedule
     */
    private handleSchedule;
    /**
     * Handle location
     */
    private handleLocation;
    /**
     * Handle bold formatting
     */
    private handleBold;
    /**
     * Handle italic formatting
     */
    private handleItalic;
    /**
     * Handle sending the message (publish)
     */
    private handleSend;
    /**
     * Handle saving as draft
     */
    private handleSaveDraft;
    /**
     * Submit message (draft or published)
     */
    private submitMessage;
    /**
     * Determine message kind based on attachments
     */
    private determineMessageKind;
    /**
     * Handle media attachment button click
     */
    private handleAttachMedia;
    /**
     * Handle file selection
     */
    private handleFileSelect;
    /**
     * Add an attachment
     */
    private addAttachment;
    /**
     * Get file type from MIME type
     */
    private getFileType;
    /**
     * Convert blob to data URL
     */
    private blobToDataURL;
    /**
     * Generate video thumbnail
     */
    private generateVideoThumbnail;
    /**
     * Update attachments preview
     */
    private updateAttachmentsPreview;
    /**
     * Remove an attachment
     */
    private removeAttachment;
    /**
     * Handle emoji picker
     */
    private handleEmojiPicker;
    /**
     * Insert emoji into textarea
     */
    private insertEmoji;
    /**
     * Update emoji metadata from content
     * Uses EmojiUtils for consistent emoji detection across the codebase
     */
    private updateEmojiMetadata;
    /**
     * Cleanup camera stream
     */
    private cleanupCamera;
    /**
     * Get current user from state
     */
    private getCurrentUser;
    /**
     * Get avatar HTML with aura support (40px Twitter size)
     * Uses same pattern as AvatarUtils.createUnifiedAvatar
     */
    private getAvatarHTML;
    /**
     * Resolve API base URL (same logic as MessageStore)
     */
    private resolveApiBaseUrl;
    /**
     * Cleanup resources
     */
    private cleanup;
}
export declare const unifiedMessageModal: UnifiedMessageModal;
//# sourceMappingURL=UnifiedMessageModal.d.ts.map