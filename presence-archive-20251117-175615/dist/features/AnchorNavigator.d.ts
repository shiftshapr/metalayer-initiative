/**
 * ANCHOR NAVIGATOR - Navigation and Element Location
 * Handles URL navigation, tab management, and element location for content anchoring
 */
import { NotificationAnchor, ScrollBehavior } from '../types/notifications';
/**
 * AnchorNavigator class
 * Manages navigation to URLs and locating elements for anchoring
 */
export declare class AnchorNavigator {
    private logger;
    private maxWaitTime;
    private pollInterval;
    constructor();
    /**
     * Navigate to URL and optionally wait for element
     */
    navigateToUrl(url: string, anchor?: NotificationAnchor, openInNewTab?: boolean): Promise<chrome.tabs.Tab | null>;
    /**
     * Wait for page to finish loading
     */
    waitForPageLoad(tabId: number, timeout?: number): Promise<boolean>;
    /**
     * Wait for element to appear in DOM
     */
    waitForElement(selector: string, timeout?: number): Promise<HTMLElement | null>;
    /**
     * Find element by multiple strategies
     */
    findElement(anchor: NotificationAnchor): Promise<HTMLElement | null>;
    /**
     * Scroll element into view
     */
    scrollToElement(element: HTMLElement, behavior?: ScrollBehavior, offsetTop?: number): Promise<void>;
    /**
     * Calculate scroll offset for fixed headers
     */
    calculateScrollOffset(): number;
    /**
     * Check if element is in viewport
     */
    isElementInViewport(element: HTMLElement): boolean;
    /**
     * Get element's position relative to document
     */
    getElementPosition(element: HTMLElement): {
        top: number;
        left: number;
    };
    /**
     * Utility: delay
     */
    private delay;
}
export declare const anchorNavigator: AnchorNavigator;
//# sourceMappingURL=AnchorNavigator.d.ts.map