/**
 * OverlaySpinner - full-screen loading overlay used by the message system.
 *
 * Provides a lightweight abstraction so other modules can simply call
 * overlaySpinner.show('message') / overlaySpinner.hide().
 */

class OverlaySpinner {
  private overlayElement: HTMLElement | null = null;
  private messageElement: HTMLElement | null = null;
  private visible = false;

  /**
   * Show the overlay with an optional status message.
   */
  show(message = 'Loading messages…'): void {
    if (typeof document === 'undefined') return;
    const overlay = this.ensureOverlay();
    if (!overlay) return;

    overlay.classList.add('overlay-spinner--visible');
    overlay.setAttribute('aria-busy', 'true');
    overlay.style.pointerEvents = 'auto';
    overlay.style.opacity = '1';

    if (this.messageElement) {
      this.messageElement.textContent = message;
    }

    this.visible = true;
  }

  /**
   * Hide the overlay (if currently visible).
   */
  hide(): void {
    if (!this.visible || !this.overlayElement) return;

    this.overlayElement.classList.remove('overlay-spinner--visible');
    this.overlayElement.setAttribute('aria-busy', 'false');
    this.overlayElement.style.pointerEvents = 'none';
    this.overlayElement.style.opacity = '0';

    this.visible = false;
  }

  /**
   * Ensure the overlay DOM element exists (create if necessary).
   */
  private ensureOverlay(): HTMLElement | null {
    if (this.overlayElement) {
      return this.overlayElement;
    }

    if (typeof document === 'undefined') {
      return null;
    }

    const overlay = document.createElement('div');
    overlay.id = 'overlay-spinner';
    overlay.className = 'overlay-spinner';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0, 0, 0, 0.35)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.transition = 'opacity 150ms ease';

    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.alignItems = 'center';
    content.style.gap = '12px';
    content.style.padding = '0';
    content.style.borderRadius = '0';
    content.style.background = 'transparent';
    content.style.border = 'none';
    content.style.color = 'var(--text-primary, #fff)';
    content.style.fontSize = '0.95rem';
    content.style.boxShadow = 'none';

    const spinner = document.createElement('div');
    spinner.className = 'overlay-spinner__circle';
    spinner.style.width = '36px';
    spinner.style.height = '36px';
    spinner.style.border = '3px solid rgba(255,255,255,0.2)';
    spinner.style.borderTopColor = 'var(--brand-primary, #33aa33)';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'overlay-spin 1s linear infinite';

    const message = document.createElement('div');
    message.className = 'overlay-spinner__message';
    message.style.textAlign = 'center';
    message.style.fontWeight = '500';
    message.textContent = 'Loading messages…';

    content.appendChild(spinner);
    content.appendChild(message);
    overlay.appendChild(content);

    document.body.appendChild(overlay);

    // Basic keyframes (in case CSS not loaded)
    const existingStyle = document.getElementById('overlay-spinner-style');
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = 'overlay-spinner-style';
      style.textContent = `
        @keyframes overlay-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    this.overlayElement = overlay;
    this.messageElement = message;
    return overlay;
  }
}

export const overlaySpinner = new OverlaySpinner();
export type OverlaySpinnerType = OverlaySpinner;

