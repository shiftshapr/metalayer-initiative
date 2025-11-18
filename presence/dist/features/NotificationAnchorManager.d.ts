/**
 * NOTIFICATION ANCHOR MANAGER - Coordination Layer
 * Coordinates navigation, element location, and highlighting for notification anchors
 */
import { NotificationAnchor } from '../types/notifications';
/**
 * NotificationAnchorManager class
 * Coordinates the complete flow of navigating to and highlighting anchored content
 */
export declare class NotificationAnchorManager {
    private logger;
    private navigator;
    private highlighter;
    constructor();
    /**
     * Navigate to anchor (complete flow)
     */
    navigateToAnchor(anchor: NotificationAnchor, url?: string): Promise<boolean>;
    /**
     * Highlight element without navigation
     */
    highlightElement(selector: string, style?: string, duration?: number): Promise<boolean>;
    /**
     * Scroll to element without highlighting
     */
    scrollToElement(selector: string, behavior?: string): Promise<boolean>;
    /**
     * Focus element (for keyboard navigation)
     */
    private focusElement;
    /**
     * Remove all active highlights
     */
    clearHighlights(): void;
    /**
     * Check if element is currently highlighted
     */
    isHighlighted(element: HTMLElement): boolean;
    /**
     * Create anchor from current selection
     */
    createAnchorFromSelection(url: string): NotificationAnchor | null;
    /**
     * Create anchor from element
     */
    createAnchorFromElement(element: HTMLElement, type?: string): NotificationAnchor;
    /**
     * Generate CSS selector for element
     */
    private generateSelector;
    /**
     * Test anchor (verify it can be found)
     */
    testAnchor(anchor: NotificationAnchor): Promise<boolean>;
    /**
     * Get element from anchor
     */
    getElement(anchor: NotificationAnchor): Promise<HTMLElement | null>;
    /**
     * Utility: delay
     */
    private delay;
}
export declare const notificationAnchorManager: NotificationAnchorManager;
//# sourceMappingURL=NotificationAnchorManager.d.ts.map