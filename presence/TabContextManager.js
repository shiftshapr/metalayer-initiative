// TabContextManager.js
// Architecture-first approach: Ensures all DOM operations are scoped to correct tab

(function() {
  'use strict';
  
  class TabContextManager {
    constructor() {
      this.activeTabId = null;
      this.observers = [];
      this.init();
    }
    
    init() {
      // Observe tab switches
      this.observeTabSwitches();
      
      // Set initial active tab
      const activeTab = document.querySelector('.main-tab-content.active');
      if (activeTab) {
        this.activeTabId = activeTab.id;
        console.log('🔷 TAB_CONTEXT: Initial active tab:', this.activeTabId);
      }
    }
    
    observeTabSwitches() {
      // Watch for class changes on tab containers
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target;
            if (target.classList.contains('main-tab-content')) {
              if (target.classList.contains('active')) {
                this.activeTabId = target.id;
                console.log('🔷 TAB_CONTEXT: Tab switched to:', this.activeTabId);
                this.onTabSwitch(this.activeTabId);
              }
            }
          }
        });
      });
      
      // Observe all tab containers
      const allTabs = document.querySelectorAll('.main-tab-content');
      allTabs.forEach(tab => {
        observer.observe(tab, { attributes: true, attributeFilter: ['class'] });
      });
      
      this.observers.push(observer);
    }
    
    onTabSwitch(tabId) {
      // Notify listeners
      window.dispatchEvent(new CustomEvent('tab-switched', { detail: { tabId } }));
    }
    
    getActiveTab() {
      const activeTab = document.querySelector('.main-tab-content.active');
      return activeTab ? activeTab.id : null;
    }
    
    getTabContainer(tabId) {
      const tab = document.getElementById(tabId);
      if (!tab) {
        // Only log as warning during initialization, error after DOM is ready
        if (document.readyState === 'loading') {
          console.warn(`🔷 TAB_CONTEXT: Tab ${tabId} not found (DOM still loading)`);
        } else {
          console.warn(`🔷 TAB_CONTEXT: Tab ${tabId} not found`);
        }
        return null;
      }
      return tab;
    }
    
    isTabActive(tabId) {
      const activeTabId = this.getActiveTab();
      return activeTabId === tabId;
    }
    
    ensureScopedOperation(tabId, operation, description = 'operation') {
      // Check if tab is active
      if (!this.isTabActive(tabId)) {
        console.warn(`🔷 TAB_CONTEXT: ${description} attempted on inactive tab: ${tabId} (active: ${this.getActiveTab()})`);
        return null;
      }
      
      // Get tab container
      const container = this.getTabContainer(tabId);
      if (!container) {
        console.error(`🔷 TAB_CONTEXT: Cannot perform ${description} - tab ${tabId} not found`);
        return null;
      }
      
      // Execute operation within container
      try {
        return operation(container);
      } catch (error) {
        console.error(`🔷 TAB_CONTEXT: Error in ${description}:`, error);
        return null;
      }
    }
    
    // Convenience methods for common operations
    getScopedElement(tabId, selector) {
      return this.ensureScopedOperation(tabId, (container) => {
        return container.querySelector(selector);
      }, `getScopedElement(${selector})`);
    }
    
    getAllScopedElements(tabId, selector) {
      return this.ensureScopedOperation(tabId, (container) => {
        return container.querySelectorAll(selector);
      }, `getAllScopedElements(${selector})`) || [];
    }
    
    addScopedElement(tabId, selector, element) {
      return this.ensureScopedOperation(tabId, (container) => {
        const parent = container.querySelector(selector);
        if (!parent) {
          console.error(`🔷 TAB_CONTEXT: Parent ${selector} not found in ${tabId}`);
          return null;
        }
        parent.appendChild(element);
        return element;
      }, `addScopedElement(${selector})`);
    }
    
    // Validate content before insertion
    validateContentForTab(tabId, content) {
      if (tabId === 'discuss-tab') {
        // Discuss tab should not have visibility content
        if (content.querySelector && content.querySelector('.visible-users, .visible-header')) {
          console.error('🔷 TAB_CONTEXT: Attempted to add visibility content to discuss-tab!');
          return false;
        }
      }
      
      if (tabId === 'visibility-tab') {
        // Visibility tab should not have message content
        if (content.querySelector && content.querySelector('.message, .chat-messages')) {
          console.error('🔷 TAB_CONTEXT: Attempted to add message content to visibility-tab!');
          return false;
        }
      }
      
      return true;
    }
  }
  
  // Create global instance
  window.tabContextManager = new TabContextManager();
  
  console.log('✅ TabContextManager initialized');
  console.log('📋 Use window.tabContextManager for scoped operations');
})();


