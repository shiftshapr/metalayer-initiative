/**
 * ANCHOR NAVIGATOR - Navigation and Element Location
 * Handles URL navigation, tab management, and element location for content anchoring
 */

import { NotificationAnchor, ScrollBehavior } from '../types/notifications';
import { Logger } from '../utils/Logger';

/**
 * AnchorNavigator class
 * Manages navigation to URLs and locating elements for anchoring
 */
export class AnchorNavigator {
  private logger: Logger;
  private maxWaitTime: number = 5000; // 5 seconds
  private pollInterval: number = 100; // 100ms

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Navigate to URL and optionally wait for element
   */
  async navigateToUrl(
    url: string,
    anchor?: NotificationAnchor,
    openInNewTab: boolean = false
  ): Promise<chrome.tabs.Tab | null> {
    try {
      this.logger.info('Navigating to URL:', url);

      // Check if URL is already open in a tab
      const existingTabs = await chrome.tabs.query({ url });
      
      if (existingTabs.length > 0 && existingTabs[0].id && !openInNewTab) {
        // Focus existing tab
        const tab = existingTabs[0];
        if (tab.id) {
          await chrome.tabs.update(tab.id, { active: true });
        }
        if (tab.windowId) {
          await chrome.windows.update(tab.windowId, { focused: true });
        }
        
        this.logger.info('Focused existing tab');
        
        // If anchor provided, wait for page to be ready
        if (anchor && tab.id) {
          await this.waitForPageLoad(tab.id);
        }
        
        return tab;
      } else {
        // Open new tab
        const tab = await chrome.tabs.create({ url, active: true });
        
        this.logger.info('Opened new tab');
        
        // Wait for page to load
        if (tab.id) {
          await this.waitForPageLoad(tab.id);
        }
        
        return tab;
      }
    } catch (error) {
      this.logger.error('Error navigating to URL:', error);
      return null;
    }
  }

  /**
   * Wait for page to finish loading
   */
  async waitForPageLoad(tabId: number, timeout: number = 10000): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkStatus = async () => {
        try {
          const tab = await chrome.tabs.get(tabId);
          
          if (tab.status === 'complete') {
            this.logger.info('Page loaded');
            resolve(true);
            return;
          }
          
          if (Date.now() - startTime > timeout) {
            this.logger.warn('Page load timeout');
            resolve(false);
            return;
          }
          
          setTimeout(checkStatus, 100);
        } catch (error) {
          this.logger.error('Error checking tab status:', error);
          resolve(false);
        }
      };
      
      checkStatus();
    });
  }

  /**
   * Wait for element to appear in DOM
   */
  async waitForElement(
    selector: string,
    timeout: number = this.maxWaitTime
  ): Promise<HTMLElement | null> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkElement = () => {
        const element = document.querySelector(selector) as HTMLElement;
        
        if (element) {
          this.logger.info('Element found:', selector);
          resolve(element);
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          this.logger.warn('Element not found (timeout):', selector);
          resolve(null);
          return;
        }
        
        setTimeout(checkElement, this.pollInterval);
      };
      
      checkElement();
    });
  }

  /**
   * Find element by multiple strategies
   */
  async findElement(anchor: NotificationAnchor): Promise<HTMLElement | null> {
    try {
      // Try CSS selector first
      if (anchor.target) {
        const element = await this.waitForElement(anchor.target);
        if (element) return element;
      }

      // Try by ID
      if (anchor.targetId) {
        const element = await this.waitForElement(`#${anchor.targetId}`);
        if (element) return element;
        
        // Try data attribute
        const dataElement = await this.waitForElement(`[data-id="${anchor.targetId}"]`);
        if (dataElement) return dataElement;
        
        // Try various common data attributes
        const commonAttributes = [
          `[data-message-id="${anchor.targetId}"]`,
          `[data-post-id="${anchor.targetId}"]`,
          `[data-item-id="${anchor.targetId}"]`,
          `[id*="${anchor.targetId}"]`
        ];
        
        for (const selector of commonAttributes) {
          const elem = await this.waitForElement(selector, 1000);
          if (elem) return elem;
        }
      }

      // Try by type-specific selectors
      if (anchor.targetType) {
        const typeSelectors: Record<string, string> = {
          message: '.message, [data-type="message"], article',
          profile: '.profile, [data-type="profile"], .user-card',
          room: '.room, [data-type="room"], .channel',
          post: '.post, [data-type="post"], article'
        };
        
        const selector = typeSelectors[anchor.targetType];
        if (selector) {
          const element = await this.waitForElement(selector, 1000);
          if (element) return element;
        }
      }

      this.logger.warn('Element not found with any strategy');
      return null;
    } catch (error) {
      this.logger.error('Error finding element:', error);
      return null;
    }
  }

  /**
   * Scroll element into view
   */
  async scrollToElement(
    element: HTMLElement,
    behavior: ScrollBehavior = 'smooth',
    offsetTop: number = 100
  ): Promise<void> {
    try {
      // Get element position
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop - offsetTop;

      // Scroll to element
      if (behavior === 'smooth') {
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
      } else if (behavior === 'instant') {
        window.scrollTo(0, targetY);
      } else {
        // Auto - use browser default
        element.scrollIntoView({ block: 'center' });
      }

      this.logger.info('Scrolled to element');

      // Wait for scroll to complete
      await this.delay(behavior === 'smooth' ? 500 : 100);
    } catch (error) {
      this.logger.error('Error scrolling to element:', error);
    }
  }

  /**
   * Calculate scroll offset for fixed headers
   */
  calculateScrollOffset(): number {
    try {
      // Look for common fixed header selectors
      const headerSelectors = [
        'header[style*="fixed"]',
        '.header-fixed',
        '.navbar-fixed',
        '[data-fixed="true"]',
        'header'
      ];

      for (const selector of headerSelectors) {
        const header = document.querySelector(selector) as HTMLElement;
        if (header) {
          const style = window.getComputedStyle(header);
          if (style.position === 'fixed' || style.position === 'sticky') {
            return header.offsetHeight + 20; // Add 20px padding
          }
        }
      }

      // Default offset
      return 100;
    } catch (error) {
      this.logger.debug('Error calculating scroll offset:', error);
      return 100;
    }
  }

  /**
   * Check if element is in viewport
   */
  isElementInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Get element's position relative to document
   */
  getElementPosition(element: HTMLElement): { top: number; left: number } {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft
    };
  }

  /**
   * Utility: delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const anchorNavigator = new AnchorNavigator();

