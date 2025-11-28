/**
 * UnifiedMessageDisplay - Renders messages with support for focus modes
 *
 * Handles:
 * - Default display (standard message list)
 * - Parent in focus (emphasizes parent, collapses children)
 * - Child in focus (highlights child, shows parent as header)
 */
import type { Message } from '../types/index.js';
export type FocusContext = 'default' | 'parent' | 'child';
export interface DisplayOptions {
    focusContext?: FocusContext;
    parentMessage?: Message | null;
    highlightMessageId?: string | null;
    onMessageClick?: (message: Message) => void;
    onReplyClick?: (message: Message) => void;
    onFocusClick?: (message: Message) => void;
}
export declare class UnifiedMessageDisplay {
    private container;
    /**
     * Get current container (for renderMessageElement)
     */
    getCurrentContainer(): HTMLElement | null;
    /**
     * Render messages in the container
     * ROOT CAUSE FIX: Ensure container is cleared and messages are properly appended
     */
    render(messages: Message[], container: HTMLElement, options?: DisplayOptions): Promise<void>;
    /**
     * Render default view (standard message list)
     * ROOT CAUSE FIX: Check for duplicates before appending
     */
    private renderDefault;
    /**
     * Render parent-in-focus view
     */
    private renderParentFocus;
    /**
     * Render child-in-focus view
     */
    private renderChildFocus;
    /**
     * Create message element using full rendering pipeline
     */
    private createMessageElement;
    private applyFocusClasses;
    private ensureDataAttributes;
    private attachFocusHandler;
    private renderWithUnifiedRenderer;
    private isFocusModeContainer;
    private resolveCommunityName;
    /**
     * Create parent header (compact view for child-in-focus)
     */
    private createParentHeader;
    /**
     * Escape HTML
     */
    private escapeHtml;
}
export declare const unifiedMessageDisplay: UnifiedMessageDisplay;
//# sourceMappingURL=UnifiedMessageDisplay.d.ts.map