/**
 * ANCHOR HIGHLIGHTER - Visual Highlighting for Content Anchors
 * Applies visual highlights to elements when navigating from notifications
 */
import { Logger } from '../utils/Logger';
/**
 * AnchorHighlighter class
 * Manages visual highlighting of anchored elements
 */
export class AnchorHighlighter {
    constructor() {
        this.activeHighlights = new Map();
        this.styleElement = null;
        this.logger = new Logger();
        this.injectStyles();
    }
    /**
     * Apply highlight to element
     */
    async applyHighlight(element, style = 'pulse', duration = 3000) {
        try {
            this.logger.info('Applying highlight', { style, duration });
            // Remove any existing highlight on this element
            this.removeHighlight(element);
            // Get highlight class
            const highlightClass = this.getHighlightClass(style);
            // Add highlight class
            element.classList.add(highlightClass);
            element.classList.add('anchor-highlight-active');
            // Store highlight state
            const state = {
                element,
                style,
                startTime: Date.now(),
                duration
            };
            this.activeHighlights.set(element, state);
            // Auto-remove after duration (if not persistent)
            if (duration > 0) {
                state.timeoutId = window.setTimeout(() => {
                    this.removeHighlight(element);
                }, duration);
            }
            this.logger.info('Highlight applied');
        }
        catch (error) {
            this.logger.error('Error applying highlight', error);
        }
    }
    /**
     * Remove highlight from element
     */
    removeHighlight(element) {
        try {
            const state = this.activeHighlights.get(element);
            if (state) {
                // Clear timeout
                if (state.timeoutId) {
                    clearTimeout(state.timeoutId);
                }
                // Clear animation frame
                if (state.animationId) {
                    cancelAnimationFrame(state.animationId);
                }
                // Remove classes
                const highlightClass = this.getHighlightClass(state.style);
                element.classList.remove(highlightClass);
                element.classList.remove('anchor-highlight-active');
                // Remove from active highlights
                this.activeHighlights.delete(element);
                this.logger.info('Highlight removed');
            }
        }
        catch (error) {
            this.logger.error('Error removing highlight', error);
        }
    }
    /**
     * Remove all active highlights
     */
    removeAllHighlights() {
        this.activeHighlights.forEach((state, element) => {
            this.removeHighlight(element);
        });
    }
    /**
     * Get highlight class for style
     */
    getHighlightClass(style) {
        const classes = {
            pulse: 'anchor-highlight-pulse',
            glow: 'anchor-highlight-glow',
            flash: 'anchor-highlight-flash',
            border: 'anchor-highlight-border'
        };
        return classes[style];
    }
    /**
     * Get all available highlight styles
     */
    getHighlightStyles() {
        return ['pulse', 'glow', 'flash', 'border'];
    }
    /**
     * Check if element has active highlight
     */
    hasHighlight(element) {
        return this.activeHighlights.has(element);
    }
    /**
     * Get active highlight state for element
     */
    getHighlightState(element) {
        return this.activeHighlights.get(element);
    }
    /**
     * Update highlight duration for active highlight
     */
    updateDuration(element, newDuration) {
        const state = this.activeHighlights.get(element);
        if (state) {
            // Clear existing timeout
            if (state.timeoutId) {
                clearTimeout(state.timeoutId);
            }
            // Set new duration
            state.duration = newDuration;
            // Set new timeout (if not persistent)
            if (newDuration > 0) {
                state.timeoutId = window.setTimeout(() => {
                    this.removeHighlight(element);
                }, newDuration);
            }
        }
    }
    /**
     * Inject CSS styles for highlights
     */
    injectStyles() {
        try {
            // Check if styles already injected
            if (document.getElementById('anchor-highlight-styles')) {
                return;
            }
            const styles = `
        /* Anchor Highlight Animations */
        @keyframes anchor-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }

        @keyframes anchor-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
          }
        }

        @keyframes anchor-flash {
          0%, 100% {
            background-color: transparent;
          }
          50% {
            background-color: rgba(59, 130, 246, 0.2);
          }
        }

        @keyframes anchor-border-pulse {
          0%, 100% {
            border-color: rgba(59, 130, 246, 1);
          }
          50% {
            border-color: rgba(59, 130, 246, 0.3);
          }
        }

        /* Highlight Classes */
        .anchor-highlight-active {
          position: relative;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .anchor-highlight-pulse {
          animation: anchor-pulse 1.5s ease-in-out 2;
          border: 2px solid #3b82f6 !important;
          border-radius: 8px;
        }

        .anchor-highlight-glow {
          animation: anchor-glow 2s ease-in-out 2;
          border-radius: 8px;
        }

        .anchor-highlight-flash {
          animation: anchor-flash 0.5s ease-in-out 3;
          border-radius: 8px;
        }

        .anchor-highlight-border {
          animation: anchor-border-pulse 2s ease-in-out 1;
          border: 3px solid #3b82f6 !important;
          border-radius: 8px;
        }

        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .anchor-highlight-pulse,
          .anchor-highlight-glow,
          .anchor-highlight-flash,
          .anchor-highlight-border {
            animation: none !important;
            border: 2px solid #3b82f6 !important;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          @keyframes anchor-pulse {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.7);
            }
            50% {
              box-shadow: 0 0 0 10px rgba(96, 165, 250, 0);
            }
          }

          @keyframes anchor-glow {
            0%, 100% {
              box-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
            }
            50% {
              box-shadow: 0 0 40px rgba(96, 165, 250, 0.8);
            }
          }

          @keyframes anchor-flash {
            0%, 100% {
              background-color: transparent;
            }
            50% {
              background-color: rgba(96, 165, 250, 0.2);
            }
          }

          .anchor-highlight-pulse,
          .anchor-highlight-border {
            border-color: #60a5fa !important;
          }

          @keyframes anchor-border-pulse {
            0%, 100% {
              border-color: rgba(96, 165, 250, 1);
            }
            50% {
              border-color: rgba(96, 165, 250, 0.3);
            }
          }
        }
      `;
            this.styleElement = document.createElement('style');
            this.styleElement.id = 'anchor-highlight-styles';
            this.styleElement.textContent = styles;
            document.head.appendChild(this.styleElement);
            this.logger.info('Highlight styles injected');
        }
        catch (error) {
            this.logger.error('Error injecting styles', error);
        }
    }
    /**
     * Remove injected styles
     */
    removeStyles() {
        if (this.styleElement && this.styleElement.parentNode) {
            this.styleElement.parentNode.removeChild(this.styleElement);
            this.styleElement = null;
            this.logger.info('Highlight styles removed');
        }
    }
    /**
     * Create custom highlight with specific colors
     */
    createCustomHighlight(element, color, duration = 3000) {
        try {
            // Remove existing highlights
            this.removeHighlight(element);
            // Apply custom style
            const originalBorder = element.style.border;
            const originalBoxShadow = element.style.boxShadow;
            element.style.border = `2px solid ${color}`;
            element.style.boxShadow = `0 0 20px ${color}`;
            element.style.borderRadius = '8px';
            element.style.transition = 'all 0.3s ease';
            // Store state
            const state = {
                element,
                style: 'pulse', // Default style type
                startTime: Date.now(),
                duration
            };
            this.activeHighlights.set(element, state);
            // Auto-remove after duration
            if (duration > 0) {
                state.timeoutId = window.setTimeout(() => {
                    element.style.border = originalBorder;
                    element.style.boxShadow = originalBoxShadow;
                    this.activeHighlights.delete(element);
                }, duration);
            }
            this.logger.info('Custom highlight applied');
        }
        catch (error) {
            this.logger.error('Error creating custom highlight', error);
        }
    }
    /**
     * Pulse highlight (one-time pulse effect)
     */
    pulseOnce(element) {
        this.applyHighlight(element, 'pulse', 1500);
    }
    /**
     * Flash highlight (quick attention grabber)
     */
    flashOnce(element) {
        this.applyHighlight(element, 'flash', 1500);
    }
    /**
     * Persistent highlight (until manually removed)
     */
    highlightPersistent(element, style = 'border') {
        this.applyHighlight(element, style, -1);
    }
}
// Export singleton instance
export const anchorHighlighter = new AnchorHighlighter();
