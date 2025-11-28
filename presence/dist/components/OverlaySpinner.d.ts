/**
 * OverlaySpinner - full-screen loading overlay used by the message system.
 *
 * Provides a lightweight abstraction so other modules can simply call
 * overlaySpinner.show('message') / overlaySpinner.hide().
 */
declare class OverlaySpinner {
    private overlayElement;
    private messageElement;
    private visible;
    /**
     * Show the overlay with an optional status message.
     */
    show(message?: string): void;
    /**
     * Hide the overlay (if currently visible).
     */
    hide(): void;
    /**
     * Ensure the overlay DOM element exists (create if necessary).
     */
    private ensureOverlay;
}
export declare const overlaySpinner: OverlaySpinner;
export type OverlaySpinnerType = OverlaySpinner;
export {};
//# sourceMappingURL=OverlaySpinner.d.ts.map