/**
 * ANCHOR HIGHLIGHTER - Visual Highlighting for Content Anchors
 * Applies visual highlights to elements when navigating from notifications
 */
import { HighlightStyle, HighlightState } from '../types/notifications';
/**
 * AnchorHighlighter class
 * Manages visual highlighting of anchored elements
 */
export declare class AnchorHighlighter {
    private logger;
    private activeHighlights;
    private styleElement;
    constructor();
    /**
     * Apply highlight to element
     */
    applyHighlight(element: HTMLElement, style?: HighlightStyle, duration?: number): Promise<void>;
    /**
     * Remove highlight from element
     */
    removeHighlight(element: HTMLElement): void;
    /**
     * Remove all active highlights
     */
    removeAllHighlights(): void;
    /**
     * Get highlight class for style
     */
    private getHighlightClass;
    /**
     * Get all available highlight styles
     */
    getHighlightStyles(): HighlightStyle[];
    /**
     * Check if element has active highlight
     */
    hasHighlight(element: HTMLElement): boolean;
    /**
     * Get active highlight state for element
     */
    getHighlightState(element: HTMLElement): HighlightState | undefined;
    /**
     * Update highlight duration for active highlight
     */
    updateDuration(element: HTMLElement, newDuration: number): void;
    /**
     * Inject CSS styles for highlights
     */
    private injectStyles;
    /**
     * Remove injected styles
     */
    removeStyles(): void;
    /**
     * Create custom highlight with specific colors
     */
    createCustomHighlight(element: HTMLElement, color: string, duration?: number): void;
    /**
     * Pulse highlight (one-time pulse effect)
     */
    pulseOnce(element: HTMLElement): void;
    /**
     * Flash highlight (quick attention grabber)
     */
    flashOnce(element: HTMLElement): void;
    /**
     * Persistent highlight (until manually removed)
     */
    highlightPersistent(element: HTMLElement, style?: HighlightStyle): void;
}
export declare const anchorHighlighter: AnchorHighlighter;
//# sourceMappingURL=AnchorHighlighter.d.ts.map