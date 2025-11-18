/**
 * OverlaySpinner - Full-screen loading overlay
 *
 * Prevents flicker by hiding intermediate DOM states during message loading
 */
export class OverlaySpinner {
    constructor() {
        this.overlay = null;
        this.isVisible = false;
    }
    /**
     * Show overlay spinner
     */
    show(message = 'Loading messages...') {
        if (this.isVisible) {
            this.updateMessage(message);
            return;
        }
        // Create overlay element
        this.overlay = document.createElement('div');
        this.overlay.id = 'message-loading-overlay';
        this.overlay.className = 'message-loading-overlay';
        this.overlay.innerHTML = `
      <div class="message-loading-spinner-container">
        <div class="message-loading-spinner"></div>
        <div class="message-loading-message">${message}</div>
      </div>
    `;
        // Add to DOM
        document.body.appendChild(this.overlay);
        // Force reflow to ensure overlay is rendered
        void this.overlay.offsetHeight;
        // Add visible class for animation
        requestAnimationFrame(() => {
            if (this.overlay) {
                this.overlay.classList.add('visible');
            }
        });
        this.isVisible = true;
    }
    /**
     * Hide overlay spinner
     */
    hide() {
        if (!this.isVisible || !this.overlay) {
            return;
        }
        // Fade out
        this.overlay.classList.remove('visible');
        this.overlay.classList.add('hiding');
        // Remove from DOM after animation
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            this.overlay = null;
            this.isVisible = false;
        }, 300); // Match CSS transition duration
    }
    /**
     * Update spinner message
     */
    updateMessage(message) {
        if (this.overlay) {
            const messageEl = this.overlay.querySelector('.message-loading-message');
            if (messageEl) {
                messageEl.textContent = message;
            }
        }
    }
    /**
     * Check if spinner is visible
     */
    get visible() {
        return this.isVisible;
    }
}
// Export singleton instance
export const overlaySpinner = new OverlaySpinner();
