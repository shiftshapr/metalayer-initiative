/**
 * Diagnostic Script: Visibility Toggle, Action Menu, Message Display, and PageId Issues
 * 
 * Checks:
 * 1. Visible toggle logic (Go Visible Modal, Go Invisible button)
 * 2. Action menu background (theme-aware)
 * 3. Message display format (name | name & community)
 * 4. Message icons functionality
 * 5. Message click-through to focus mode
 * 6. PageId/normalizedUrl usage in message loading
 */

(function() {
  'use strict';

  function diagnoseVisibilityToggle() {
    console.log('\n📋 Issue 1: Visible Toggle Logic');
    const results = {
      toggleExists: false,
      toggleState: null,
      goInvisibleBtnExists: false,
      goVisibleModalExists: false,
      setVisibilityStatusExists: false,
      switchTabExists: false
    };

    const visibilityToggle = document.getElementById('visibility-toggle');
    if (visibilityToggle) {
      results.toggleExists = true;
      results.toggleState = (visibilityToggle as HTMLInputElement).checked;
    }

    const goInvisibleBtn = document.getElementById('go-invisible-btn');
    if (goInvisibleBtn) {
      results.goInvisibleBtnExists = true;
    }

    const goVisibleModal = document.querySelector('.go-visible-modal, #go-visible-modal');
    if (goVisibleModal) {
      results.goVisibleModalExists = true;
    }

    const win = window as any;
    results.setVisibilityStatusExists = typeof win.setVisibilityStatus === 'function';
    results.switchTabExists = typeof win.switchTab === 'function';

    console.log('  Results:', results);
    return results;
  }

  function diagnoseActionMenu() {
    console.log('\n📋 Issue 2: Action Menu Background');
    const results = {
      menusFound: 0,
      transparentBackgrounds: 0,
      themeAwareBackgrounds: 0,
      currentTheme: null
    };

    const currentTheme = document.body.getAttribute('data-theme') || 
                       document.documentElement.getAttribute('data-theme') || 
                       'light';
    results.currentTheme = currentTheme;

    const actionMenus = document.querySelectorAll('.action-dropdown, .message-actions-menu .action-dropdown');
    results.menusFound = actionMenus.length;

    actionMenus.forEach(menu => {
      const style = window.getComputedStyle(menu as HTMLElement);
      const bg = style.backgroundColor;
      if (bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
        results.transparentBackgrounds++;
      } else if (bg.includes('var(--surface-primary') || bg.includes('rgb') || bg.includes('#')) {
        results.themeAwareBackgrounds++;
      }
    });

    console.log('  Results:', results);
    return results;
  }

  function diagnoseMessageDisplay() {
    console.log('\n📋 Issue 3: Message Display Format');
    const results = {
      messagesFound: 0,
      correctFormat: 0,
      missingCommunity: 0,
      iconsWorking: 0,
      iconsMissing: 0,
      clickHandlers: 0
    };

    const messages = document.querySelectorAll('[data-message-id]');
    results.messagesFound = messages.length;

    messages.forEach(msg => {
      const senderName = msg.querySelector('.message-sender-name');
      if (senderName) {
        const text = senderName.textContent || '';
        // Check for "name | name & community" or "name • community" format
        if (text.includes('|') || text.includes('•')) {
          results.correctFormat++;
        } else {
          results.missingCommunity++;
        }
      }

      // Check icons
      const icons = msg.querySelectorAll('svg, .message-footer-actions button');
      if (icons.length > 0) {
        results.iconsWorking++;
      } else {
        results.iconsMissing++;
      }

      // Check click handlers
      if (msg.hasAttribute('data-message-id') && msg.onclick) {
        results.clickHandlers++;
      }
    });

    console.log('  Results:', results);
    return results;
  }

  function diagnosePageId() {
    console.log('\n📋 Issue 4: PageId/NormalizedUrl Usage');
    const results = {
      stateManagerExists: false,
      currentUrlData: null,
      pageId: null,
      normalizedUrl: null,
      loadChatHistoryExists: false,
      lastLoadPageId: null
    };

    const win = window as any;
    if (win.stateManagerInstance) {
      results.stateManagerExists = true;
      const urlData = win.stateManagerInstance.getState('currentUrlData');
      if (urlData) {
        results.currentUrlData = urlData;
        results.pageId = urlData.pageId || null;
        results.normalizedUrl = urlData.normalizedUrl || null;
      }
    }

    results.loadChatHistoryExists = typeof win.loadChatHistory === 'function';

    // Check if loadChatHistory was called with correct pageId
    if (results.loadChatHistoryExists) {
      // Try to infer from message elements
      const messages = document.querySelectorAll('[data-message-id]');
      if (messages.length > 0) {
        const firstMsg = messages[0] as HTMLElement;
        const msgPageId = firstMsg.dataset.pageId || firstMsg.closest('[data-page-id]')?.getAttribute('data-page-id');
        results.lastLoadPageId = msgPageId || 'unknown';
      }
    }

    console.log('  Results:', results);
    return results;
  }

  function runAllDiagnostics() {
    console.log('🔍 DIAGNOSTIC: Starting comprehensive diagnostics...');
    
    const results = {
      visibilityToggle: diagnoseVisibilityToggle(),
      actionMenu: diagnoseActionMenu(),
      messageDisplay: diagnoseMessageDisplay(),
      pageId: diagnosePageId(),
      timestamp: new Date().toISOString()
    };

    console.log('\n📊 SUMMARY:');
    console.log(JSON.stringify(results, null, 2));

    // Expose to window
    (window as any).diagnosticResults = results;
    return results;
  }

  // Auto-run if in browser
  if (typeof window !== 'undefined') {
    (window as any).runVisibilityActionMenuDiagnostic = runAllDiagnostics;
    
    // Auto-run after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runAllDiagnostics, 1000);
      });
    } else {
      setTimeout(runAllDiagnostics, 1000);
    }
  }

  console.log('✅ Diagnostic script loaded. Run: window.runVisibilityActionMenuDiagnostic()');
})();






