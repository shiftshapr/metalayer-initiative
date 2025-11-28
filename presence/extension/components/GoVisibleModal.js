import { Logger } from '../utils/Logger.js';
import { handleError } from '../utils/ErrorHandler.js';
/**
 * GoVisibleModal - Simple modal for prompting user to go visible
 *
 * Shown when user clicks on visibility section while toggle is "No"
 */
class GoVisibleModal {
    constructor() {
        this.modal = null;
        this.isOpen = false;
    }
    /**
     * Show the Go Visible modal
     */
    show() {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;
        this.createModal();
        document.body.appendChild(this.modal);
        // Animate in
        requestAnimationFrame(() => {
            if (this.modal) {
                this.modal.classList.add('visible');
            }
        });
    }
    /**
     * Hide the modal
     */
    hide() {
        if (!this.modal || !this.isOpen) {
            return;
        }
        this.modal.classList.remove('visible');
        setTimeout(() => {
            if (this.modal && this.modal.parentNode) {
                this.modal.parentNode.removeChild(this.modal);
            }
            this.modal = null;
            this.isOpen = false;
        }, 300);
    }
    /**
     * Create modal HTML
     */
    createModal() {
        // COMP: Get current theme to set appropriate colors
        const currentTheme = document.body.getAttribute('data-theme') ||
            document.documentElement.getAttribute('data-theme') ||
            'light';
        const isLightTheme = currentTheme === 'light';
        this.modal = document.createElement('div');
        this.modal.className = 'go-visible-modal-overlay';
        this.modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
        const content = document.createElement('div');
        content.className = 'go-visible-modal-content';
        content.style.cssText = `
      background: var(--surface-primary, #fff);
      border-radius: 16px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      transform: scale(0.9);
      transition: transform 0.3s ease;
    `;
        // COMP: Cancel button color - dark for light theme, light for dark theme
        const cancelButtonColor = isLightTheme ? '#212529' : 'var(--text-primary, #fff)';
        content.innerHTML = `
      <h3 style="margin: 0 0 16px 0; font-size: 20px; color: var(--text-primary);">Go Visible</h3>
      <p style="margin: 0 0 24px 0; color: var(--text-secondary); line-height: 1.5;">
        Make yourself visible to others on this page. Your cursor and presence will be shown to other users.
      </p>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button class="go-visible-cancel" style="
          padding: 10px 20px;
          background: transparent;
          border: 1px solid var(--border-color, #ddd);
          border-radius: 8px;
          color: ${cancelButtonColor};
          cursor: pointer;
          font-size: 14px;
        ">Cancel</button>
        <button class="go-visible-confirm" style="
          padding: 10px 20px;
          background: var(--accent-color, #007bff);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        ">Go Visible</button>
      </div>
    `;
        // Add event listeners
        const cancelBtn = content.querySelector('.go-visible-cancel');
        const confirmBtn = content.querySelector('.go-visible-confirm');
        cancelBtn?.addEventListener('click', () => {
            this.hide();
        });
        confirmBtn?.addEventListener('click', async () => {
            try {
                // Set visibility to true
                const win = window;
                if (win.setVisibilityStatus) {
                    await win.setVisibilityStatus(true);
                }
                this.hide();
                // Navigate to Visibility tab after setting visible
                if (win.navigateToVisibilityTab) {
                    setTimeout(() => {
                        win.navigateToVisibilityTab();
                    }, 100);
                }
            }
            catch (error) {
                handleError(error, {
                    log: true,
                    logLevel: 'error',
                    context: {
                        operation: 'setVisibilityStatus',
                        component: 'GoVisibleModal'
                    }
                });
            }
        });
        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.hide();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        this.modal.appendChild(content);
        // Add visible class after a frame
        requestAnimationFrame(() => {
            if (this.modal) {
                this.modal.style.opacity = '1';
                const contentEl = this.modal.querySelector('.go-visible-modal-content');
                if (contentEl) {
                    contentEl.style.transform = 'scale(1)';
                }
            }
        });
    }
}
// Create singleton instance
const goVisibleModalInstance = new GoVisibleModal();
// Export to window
if (typeof window !== 'undefined') {
    window.showGoVisibleModal = () => goVisibleModalInstance.show();
    window.openGoVisibleModal = () => goVisibleModalInstance.show();
    window.goVisibleModal = goVisibleModalInstance;
    Logger.debug('✅ GO_VISIBLE_MODAL: Initialized and exported to window', null, 'visibility');
}
export { GoVisibleModal, goVisibleModalInstance };
export default GoVisibleModal;
