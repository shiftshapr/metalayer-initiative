/**
 * LoadingGifManager - TypeScript ES6 Module
 * Coordinates loading gif visibility with state management
 */
import { Logger } from '../../utils/Logger.js';
/**
 * LoadingGifManager - Coordinated loading gif management
 */
export class LoadingGifManager {
    constructor(logger = Logger, options = {}) {
        this.loadingGifElement = null;
        this.showTimeout = null;
        this.hideTimeout = null;
        this.logger = logger;
        this.options = {
            container: options.container || '.chat-messages',
            showDelay: options.showDelay || 100, // Small delay to prevent flicker
            hideDelay: options.hideDelay || 200, // Small delay to show completion
            text: options.text || 'Loading...',
        };
    }
    /**
     * Show loading gif with coordination
     */
    show(options) {
        // Clear any pending hide operation
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
        // Update options if provided
        const showOptions = options || {};
        const effectiveContainer = showOptions.container || this.options.container;
        const effectiveText = showOptions.text || 'Loading messages...';
        // Delay showing to prevent flicker on fast operations
        this.showTimeout = setTimeout(() => {
            this._showLoadingGif(effectiveContainer, effectiveText);
            this.showTimeout = null;
        }, this.options.showDelay);
    }
    /**
     * Hide loading gif with coordination
     */
    hide() {
        // Clear any pending show operation
        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
            this.showTimeout = null;
        }
        // Delay hiding to show completion briefly
        this.hideTimeout = setTimeout(() => {
            this._hideLoadingGif();
            this.hideTimeout = null;
        }, this.options.hideDelay);
    }
    /**
     * Force immediate show (for critical loading states)
     */
    showImmediate() {
        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
            this.showTimeout = null;
        }
        this._showLoadingGif();
    }
    /**
     * Force immediate hide (for error states)
     */
    hideImmediate() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
        this._hideLoadingGif();
    }
    /**
     * Check if loading gif is currently visible
     */
    isVisible() {
        return this.loadingGifElement !== null && this.loadingGifElement.style.display !== 'none';
    }
    /**
     * Get loading gif element
     */
    getElement() {
        return this.loadingGifElement;
    }
    /**
     * Private method to show loading gif
     */
    _showLoadingGif(containerSelector, loadingText) {
        try {
            // Use provided container or default
            const effectiveContainer = containerSelector || this.options.container;
            const effectiveText = loadingText || 'Loading messages...';
            // Find or create container
            const container = document.querySelector(effectiveContainer);
            if (!container) {
                this.logger.warn?.('LoadingGifManager: Container not found', {
                    container: effectiveContainer
                });
                return;
            }
            // Check if loading gif already exists
            let loadingGif = container.querySelector('.loading-container');
            if (loadingGif) {
                // Update existing gif text if different
                const textElement = loadingGif.querySelector('div:last-child');
                if (textElement && textElement.textContent !== effectiveText) {
                    textElement.textContent = effectiveText;
                }
                // Update existing gif
                loadingGif.style.display = 'flex';
                this.loadingGifElement = loadingGif;
                return;
            }
            // Create new loading gif
            loadingGif = document.createElement('div');
            loadingGif.className = 'loading-container';
            loadingGif.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: var(--text-secondary, #666);
        font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
      `;
            loadingGif.innerHTML = `
        <div class="loading-spinner" style="
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color, #e1e5e9);
          border-top: 3px solid var(--accent-color, #0066cc);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        "></div>
        <div style="font-size: 14px;">${effectiveText}</div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
            // Insert at the beginning of container
            if (container.firstChild) {
                container.insertBefore(loadingGif, container.firstChild);
            }
            else {
                container.appendChild(loadingGif);
            }
            this.loadingGifElement = loadingGif;
            this.logger.debug?.('LoadingGifManager: Loading gif shown');
        }
        catch (error) {
            this.logger.error?.('LoadingGifManager: Failed to show loading gif', error);
        }
    }
    /**
     * Private method to hide loading gif
     */
    _hideLoadingGif() {
        try {
            if (this.loadingGifElement) {
                this.loadingGifElement.style.display = 'none';
                this.loadingGifElement.remove();
                this.loadingGifElement = null;
                this.logger.debug?.('LoadingGifManager: Loading gif hidden');
            }
        }
        catch (error) {
            this.logger.error?.('LoadingGifManager: Failed to hide loading gif', error);
        }
    }
    /**
     * Cleanup on destruction
     */
    destroy() {
        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
            this.showTimeout = null;
        }
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
        this.hideImmediate();
    }
}
// Export singleton instance with immediate initialization
let loadingGifManagerInstance = null;
export function getLoadingGifManager(logger, options) {
    if (!loadingGifManagerInstance) {
        loadingGifManagerInstance = new LoadingGifManager(logger, options);
    }
    return loadingGifManagerInstance;
}
// CRITICAL FIX: Expose singleton immediately for browser compatibility
if (typeof window !== 'undefined') {
    window.loadingGifManager = getLoadingGifManager();
}
//# sourceMappingURL=LoadingGifManager.js.map