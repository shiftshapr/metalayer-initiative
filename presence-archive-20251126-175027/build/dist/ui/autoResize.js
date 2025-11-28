/**
 * Auto-resize helper for textarea inputs.
 * Keeps COMP-parity behaviour with max height caps and scrollbar toggling.
 */
export function autoResize(textarea, options = {}) {
    if (!textarea) {
        return;
    }
    const { maxHeight = 120 } = options;
    const target = textarea;
    target.style.height = 'auto';
    const newHeight = Math.min(target.scrollHeight, maxHeight);
    target.style.height = `${newHeight}px`;
    target.style.overflowY = target.scrollHeight > maxHeight ? 'auto' : 'hidden';
}
export default autoResize;
//# sourceMappingURL=autoResize.js.map