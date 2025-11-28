/**
 * Theme Change Tracker
 * Comprehensive logging for all theme changes to identify root cause
 */

import { Logger } from './Logger.js';

class ThemeChangeTracker {
  private observer: MutationObserver | null = null;
  private isTracking = false;

  startTracking() {
    if (this.isTracking) {
      Logger.debug('🔍 THEME_TRACKER: Already tracking', null, 'theme');
      return;
    }

    this.isTracking = true;
    Logger.debug('🔍 THEME_TRACKER: Starting theme change tracking...', null, 'theme');

    // Track all setAttribute calls on document.body and document.documentElement
    const originalSetAttribute = Element.prototype.setAttribute;
    
    Element.prototype.setAttribute = function(name: string, value: string) {
      // Check if this is a theme attribute change on body or html element
      if (name === 'data-theme') {
        const isBody = this === document.body;
        const isDocumentElement = this === document.documentElement;
        
        if (isBody || isDocumentElement) {
          const oldValue = this.getAttribute('data-theme');
          const stack = new Error().stack;
          const caller = stack?.split('\n')[2]?.trim() || 'unknown';
          
          Logger.debug('🔍 THEME_TRACKER: ========================================', null, 'theme');
          Logger.debug('🔍 THEME_TRACKER: data-theme attribute SET', null, 'theme');
          Logger.debug('🔍 THEME_TRACKER: Element:', isBody ? 'document.body' : 'document.documentElement', 'theme');
          Logger.debug('🔍 THEME_TRACKER: Old value:', oldValue || 'NOT SET', 'theme');
          Logger.debug('🔍 THEME_TRACKER: New value:', value, 'theme');
          Logger.debug('🔍 THEME_TRACKER: Caller:', caller, 'theme');
          Logger.debug('🔍 THEME_TRACKER: Full stack:', stack?.split('\n').slice(1, 15).join('\n'), 'theme');
          Logger.debug('🔍 THEME_TRACKER: Timestamp:', new Date().toISOString(), 'theme');
          Logger.debug('🔍 THEME_TRACKER: ========================================', null, 'theme');
        }
      }
      
      return originalSetAttribute.call(this, name, value);
    };

    // Also use MutationObserver as backup
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const target = mutation.target as HTMLElement;
          const newValue = target.getAttribute('data-theme');
          const oldValue = mutation.oldValue;
          
          const stack = new Error().stack;
          Logger.debug('🔍 THEME_TRACKER: ========================================', null, 'theme');
          Logger.debug('🔍 THEME_TRACKER: data-theme attribute CHANGED (MutationObserver)', null, 'theme');
          Logger.debug('🔍 THEME_TRACKER: Element:', target === document.body ? 'document.body' : target === document.documentElement ? 'document.documentElement' : target.tagName, 'theme');
          Logger.debug('🔍 THEME_TRACKER: Old value:', oldValue || 'NOT SET', 'theme');
          Logger.debug('🔍 THEME_TRACKER: New value:', newValue || 'NOT SET', 'theme');
          Logger.debug('🔍 THEME_TRACKER: Call stack:', stack?.split('\n').slice(1, 15).join('\n'), 'theme');
          Logger.debug('🔍 THEME_TRACKER: Timestamp:', new Date().toISOString(), 'theme');
          Logger.debug('🔍 THEME_TRACKER: ========================================', null, 'theme');
        }
      });
    });

    this.observer.observe(document.body, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['data-theme']
    });

    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['data-theme']
    });

    Logger.debug('✅ THEME_TRACKER: Theme change tracking started', null, 'theme');
  }

  stopTracking() {
    if (!this.isTracking) {
      return;
    }

    this.isTracking = false;
    
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    Logger.debug('🔍 THEME_TRACKER: Theme change tracking stopped', null, 'theme');
  }
}

// Create singleton instance
const themeChangeTracker = new ThemeChangeTracker();

// Auto-start tracking when module loads
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      themeChangeTracker.startTracking();
    });
  } else {
    themeChangeTracker.startTracking();
  }
  
  // Assign to window using proper typing
  Object.assign(window, { themeChangeTracker });
}

export { ThemeChangeTracker, themeChangeTracker };
export default themeChangeTracker;

