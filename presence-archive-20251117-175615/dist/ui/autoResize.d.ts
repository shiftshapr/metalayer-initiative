/**
 * Auto-resize helper for textarea inputs.
 * Keeps COMP-parity behaviour with max height caps and scrollbar toggling.
 */
export interface AutoResizeOptions {
    /**
     * Maximum height (in px) before scrollbars appear.
     */
    maxHeight?: number;
}
export declare function autoResize(textarea: HTMLTextAreaElement | null, options?: AutoResizeOptions): void;
export default autoResize;
//# sourceMappingURL=autoResize.d.ts.map