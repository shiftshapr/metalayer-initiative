/**
 * NOTIFICATION ANCHOR MANAGER - Coordination Layer
 * Coordinates navigation, element location, and highlighting for notification anchors
 */
import { anchorNavigator } from './AnchorNavigator';
import { anchorHighlighter } from './AnchorHighlighter';
import { Logger } from '../utils/Logger';
/**
 * NotificationAnchorManager class
 * Coordinates the complete flow of navigating to and highlighting anchored content
 */
export class NotificationAnchorManager {
    constructor() {
        this.logger = new Logger();
        this.navigator = anchorNavigator;
        this.highlighter = anchorHighlighter;
    }
    /**
     * Navigate to anchor (complete flow)
     */
    async navigateToAnchor(anchor, url) {
        try {
            this.logger.info('Starting anchor navigation:', anchor);
            // Step 1: Navigate to URL if provided
            if (url) {
                const tab = await this.navigator.navigateToUrl(url, anchor);
                if (!tab || !tab.id) {
                    this.logger.error('Failed to navigate to URL');
                    return false;
                }
                // Wait a bit for page to stabilize
                await this.delay(500);
            }
            // Step 2: Find the target element
            const element = await this.navigator.findElement(anchor);
            if (!element) {
                this.logger.warn('Target element not found');
                return false;
            }
            // Step 3: Scroll to element
            const scrollBehavior = anchor.scrollBehavior || 'smooth';
            const offset = this.navigator.calculateScrollOffset();
            await this.navigator.scrollToElement(element, scrollBehavior, offset);
            // Step 4: Apply highlight
            const highlightStyle = anchor.highlightStyle || 'pulse';
            const highlightDuration = anchor.highlightDuration ?? 3000;
            await this.highlighter.applyHighlight(element, highlightStyle, highlightDuration);
            // Step 5: Auto-focus if requested
            if (anchor.autoFocus) {
                this.focusElement(element);
            }
            this.logger.info('Anchor navigation completed successfully');
            return true;
        }
        catch (error) {
            this.logger.error('Error navigating to anchor:', error);
            return false;
        }
    }
    /**
     * Highlight element without navigation
     */
    async highlightElement(selector, style = 'pulse', duration = 3000) {
        try {
            const element = await this.navigator.waitForElement(selector);
            if (!element) {
                this.logger.warn('Element not found:', selector);
                return false;
            }
            await this.highlighter.applyHighlight(element, style, duration);
            return true;
        }
        catch (error) {
            this.logger.error('Error highlighting element:', error);
            return false;
        }
    }
    /**
     * Scroll to element without highlighting
     */
    async scrollToElement(selector, behavior = 'smooth') {
        try {
            const element = await this.navigator.waitForElement(selector);
            if (!element) {
                this.logger.warn('Element not found:', selector);
                return false;
            }
            const offset = this.navigator.calculateScrollOffset();
            await this.navigator.scrollToElement(element, behavior, offset);
            return true;
        }
        catch (error) {
            this.logger.error('Error scrolling to element:', error);
            return false;
        }
    }
    /**
     * Focus element (for keyboard navigation)
     */
    focusElement(element) {
        try {
            // Make element focusable if not already
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '-1');
            }
            // Focus the element
            element.focus();
            // Remove tabindex after focus (if we added it)
            setTimeout(() => {
                if (element.getAttribute('tabindex') === '-1') {
                    element.removeAttribute('tabindex');
                }
            }, 100);
            this.logger.info('Element focused');
        }
        catch (error) {
            this.logger.debug('Could not focus element:', error);
        }
    }
    /**
     * Remove all active highlights
     */
    clearHighlights() {
        this.highlighter.removeAllHighlights();
    }
    /**
     * Check if element is currently highlighted
     */
    isHighlighted(element) {
        return this.highlighter.hasHighlight(element);
    }
    /**
     * Create anchor from current selection
     */
    createAnchorFromSelection(url) {
        try {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                return null;
            }
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            let element = null;
            if (container.nodeType === Node.TEXT_NODE) {
                element = container.parentElement;
            }
            else if (container.nodeType === Node.ELEMENT_NODE) {
                element = container;
            }
            if (!element) {
                return null;
            }
            // Generate selector
            const selector = this.generateSelector(element);
            return {
                target: selector,
                targetId: element.id || undefined,
                targetType: 'text',
                scrollBehavior: 'smooth',
                highlightStyle: 'pulse',
                highlightDuration: 3000,
                autoFocus: false,
                metadata: {
                    selectedText: selection.toString().trim()
                }
            };
        }
        catch (error) {
            this.logger.error('Error creating anchor from selection:', error);
            return null;
        }
    }
    /**
     * Create anchor from element
     */
    createAnchorFromElement(element, type = 'element') {
        const selector = this.generateSelector(element);
        return {
            target: selector,
            targetId: element.id || undefined,
            targetType: type,
            scrollBehavior: 'smooth',
            highlightStyle: 'pulse',
            highlightDuration: 3000,
            autoFocus: false
        };
    }
    /**
     * Generate CSS selector for element
     */
    generateSelector(element) {
        // If element has ID, use it
        if (element.id) {
            return `#${element.id}`;
        }
        // If element has unique data attribute
        const dataAttrs = ['data-id', 'data-message-id', 'data-post-id', 'data-item-id'];
        for (const attr of dataAttrs) {
            const value = element.getAttribute(attr);
            if (value) {
                return `[${attr}="${value}"]`;
            }
        }
        // Generate path-based selector
        const path = [];
        let current = element;
        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            if (current.className) {
                const classes = current.className.trim().split(/\s+/).filter(Boolean);
                if (classes.length > 0) {
                    selector += '.' + classes.slice(0, 2).join('.');
                }
            }
            // Add nth-child if needed
            if (current.parentElement) {
                const siblings = Array.from(current.parentElement.children);
                const index = siblings.indexOf(current);
                if (siblings.filter(s => s.tagName === current.tagName).length > 1) {
                    selector += `:nth-child(${index + 1})`;
                }
            }
            path.unshift(selector);
            current = current.parentElement;
            // Limit path depth
            if (path.length >= 5)
                break;
        }
        return path.join(' > ');
    }
    /**
     * Test anchor (verify it can be found)
     */
    async testAnchor(anchor) {
        try {
            const element = await this.navigator.findElement(anchor);
            return element !== null;
        }
        catch (error) {
            this.logger.error('Error testing anchor:', error);
            return false;
        }
    }
    /**
     * Get element from anchor
     */
    async getElement(anchor) {
        return await this.navigator.findElement(anchor);
    }
    /**
     * Utility: delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
// Export singleton instance
export const notificationAnchorManager = new NotificationAnchorManager();
//# sourceMappingURL=NotificationAnchorManager.js.map