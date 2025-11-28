/**
 * Auto-resize helper for textarea inputs.
 * Keeps COMP-parity behaviour with max height caps and scrollbar toggling.
 */
interface AutoResizeOptions {
    maxHeight?: number;
    [key: string]: unknown;
}
export declare function autoResize(textarea: HTMLTextAreaElement | null, options?: AutoResizeOptions): void;
export default autoResize;
//# sourceMappingURL=autoResize.d.ts.map