/**
 * ROOT CAUSE DIAGNOSTIC: Comprehensive Issue Analysis
 * Run in browser console: window.runRootCauseDiagnostic()
 * 
 * This script performs deep analysis to identify root causes of:
 * 1. Logger.js ERR_FILE_NOT_FOUND
 * 2. Message/Reply field click handlers not opening modal
 * 3. Hover modal for avatars not displaying
 * 4. Action menu background color (theme mismatch)
 * 5. Theme persistence issues
 * 6. Settings toggles not working
 * 7. Go Invisible button not working
 * 8. All previous persistent issues
 */

(function() {
  'use strict';

  async function runRootCauseDiagnostic() {
    console.log('🔍 ===== ROOT CAUSE DIAGNOSTIC =====');
    console.log('🔍 Timestamp:', new Date().toISOString());
    console.log('🔍 Build:', window.buildTracker?.getBuildNumber?.() || 'unknown');
    
    const results = {
      timestamp: new Date().toISOString(),
      buildNumber: window.buildTracker?.getBuildNumber?.() || 'unknown',
      issues: {},
      rootCauses: [],
      recommendations: []
    };

    // ===== ISSUE 1: Logger.js ERR_FILE_NOT_FOUND =====
    console.log('\n📋 Issue 1: Logger.js ERR_FILE_NOT_FOUND');
    const loggerResults = {
      scriptTags: [],
      imports: [],
      references: [],
      rootCause: null,
      fix: null
    };

    // Check script tags
    Array.from(document.querySelectorAll('script')).forEach(script => {
      const src = script.src || script.getAttribute('src') || '';
      if (src.includes('Logger') || src.includes('logger')) {
        loggerResults.scriptTags.push({
          src,
          commented: script.outerHTML.includes('<!--'),
          line: script.outerHTML.substring(0, 100)
        });
      }
    });

    // Check network errors
    const networkErrors = performance.getEntriesByType('resource')
      .filter(r => r.name.includes('Logger') && (r.transferSize === 0 || r.decodedBodySize === 0));
    loggerResults.networkErrors = networkErrors.map(e => ({
      name: e.name,
      failed: e.transferSize === 0
    }));

    // Check for imports without .js extension
    const allScripts = Array.from(document.querySelectorAll('script[type="module"]'));
    for (const script of allScripts) {
      if (script.src) {
        try {
          const response = await fetch(script.src);
          const text = await response.text();
          const importsWithoutExt = text.match(/from\s+['"]\.\.?\/.*Logger['"]/g);
          if (importsWithoutExt) {
            loggerResults.imports.push({
              file: script.src,
              imports: importsWithoutExt
            });
          }
        } catch (e) {
          // Can't fetch
        }
      }
    }

    if (loggerResults.imports.length > 0) {
      loggerResults.rootCause = 'Imports without .js extension found';
      loggerResults.fix = 'Add .js extension to all Logger imports';
    } else if (loggerResults.scriptTags.length > 0) {
      loggerResults.rootCause = 'Script tag references found (should use ES6 imports)';
      loggerResults.fix = 'Remove script tags, use ES6 imports only';
    }

    results.issues.logger = loggerResults;
    console.log('Logger Results:', loggerResults);

    // ===== ISSUE 2: Message/Reply Field Click Handlers =====
    console.log('\n📋 Issue 2: Message/Reply Field Click Handlers');
    const messageInputResults = {
      chatTextarea: null,
      replyFields: [],
      openMessageModal: null,
      unifiedMessageModal: null,
      eventListeners: [],
      rootCause: null,
      fix: null
    };

    // Check chat textarea
    const chatTextarea = document.getElementById('chat-textarea');
    messageInputResults.chatTextarea = {
      exists: !!chatTextarea,
      readonly: chatTextarea?.readOnly || false,
      hasClickHandler: chatTextarea ? getEventListeners(chatTextarea, 'click').length > 0 : false
    };

    // Check reply fields
    const replyFields = document.querySelectorAll('.reply-input, .message-reply-input, [class*="reply"]');
    messageInputResults.replyFields = Array.from(replyFields).map(field => ({
      element: field.tagName,
      hasClickHandler: getEventListeners(field, 'click').length > 0,
      hasFocusHandler: getEventListeners(field, 'focus').length > 0
    }));

    // Check openMessageModal
    messageInputResults.openMessageModal = {
      exists: typeof window.openMessageModal === 'function',
      type: typeof window.openMessageModal
    };

    // Check UnifiedMessageModal
    messageInputResults.unifiedMessageModal = {
      exists: !!window.unifiedMessageModal,
      hasOpen: window.unifiedMessageModal && typeof window.unifiedMessageModal.open === 'function'
    };

    // Check if setupMessageInputEventListeners was called
    const setupCalled = window.setupMessageInputEventListeners || 
                       (chatTextarea && chatTextarea.dataset.listenersAttached === 'true');
    messageInputResults.setupCalled = !!setupCalled;

    if (!messageInputResults.openMessageModal.exists) {
      messageInputResults.rootCause = 'openMessageModal not exported to window';
      messageInputResults.fix = 'Ensure UnifiedMessageModal exports openMessageModal to window';
    } else if (!messageInputResults.chatTextarea.hasClickHandler) {
      messageInputResults.rootCause = 'Click handler not attached to chat-textarea';
      messageInputResults.fix = 'Call setupMessageInputEventListeners on initialization';
    }

    results.issues.messageInput = messageInputResults;
    console.log('Message Input Results:', messageInputResults);

    // ===== ISSUE 3: Hover Modal for Avatars =====
    console.log('\n📋 Issue 3: Hover Modal for Avatars');
    const hoverModalResults = {
      userHoverModal: null,
      avatarElements: [],
      eventListeners: [],
      rootCause: null,
      fix: null
    };

    // Check UserHoverModal
    hoverModalResults.userHoverModal = {
      exists: !!window.userHoverModal,
      hasShow: window.userHoverModal && typeof window.userHoverModal.show === 'function',
      hasInit: window.userHoverModal && typeof window.userHoverModal.initialize === 'function'
    };

    // Check avatar elements
    const avatars = document.querySelectorAll('.user-avatar, .message-avatar, [class*="avatar"]');
    hoverModalResults.avatarElements = Array.from(avatars).slice(0, 5).map(avatar => ({
      hasMouseenter: getEventListeners(avatar, 'mouseenter').length > 0,
      hasMouseleave: getEventListeners(avatar, 'mouseleave').length > 0,
      hasClick: getEventListeners(avatar, 'click').length > 0,
      dataUserId: avatar.dataset.userId || avatar.getAttribute('data-user-id')
    }));

    // Check if modal DOM exists
    const hoverModalDOM = document.querySelector('.user-hover-modal, [class*="hover-modal"]');
    hoverModalResults.modalDOM = {
      exists: !!hoverModalDOM,
      visible: hoverModalDOM ? window.getComputedStyle(hoverModalDOM).display !== 'none' : false
    };

    if (!hoverModalResults.userHoverModal.exists) {
      hoverModalResults.rootCause = 'UserHoverModal not initialized or exported';
      hoverModalResults.fix = 'Ensure UserHoverModal is loaded and initialized';
    } else if (hoverModalResults.avatarElements.every(a => !a.hasMouseenter)) {
      hoverModalResults.rootCause = 'Event listeners not attached to avatars';
      hoverModalResults.fix = 'Attach mouseenter/mouseleave handlers to avatar elements';
    }

    results.issues.hoverModal = hoverModalResults;
    console.log('Hover Modal Results:', hoverModalResults);

    // ===== ISSUE 4: Action Menu Background Color =====
    console.log('\n📋 Issue 4: Action Menu Background Color');
    const actionMenuResults = {
      actionMenus: [],
      currentTheme: null,
      backgroundColors: [],
      rootCause: null,
      fix: null
    };

    const currentTheme = document.body.getAttribute('data-theme') || 
                         document.documentElement.getAttribute('data-theme') || 
                         'light';
    actionMenuResults.currentTheme = currentTheme;

    const actionMenus = document.querySelectorAll('.action-dropdown, .message-actions-menu');
    actionMenuResults.actionMenus = Array.from(actionMenus).slice(0, 3).map(menu => {
      const style = window.getComputedStyle(menu);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        display: style.display,
        visibility: style.visibility,
        expectedBg: currentTheme === 'dark' ? 'rgb(31, 31, 31)' : 'rgb(255, 255, 255)'
      };
    });

    const hasThemeMismatch = actionMenuResults.actionMenus.some(m => {
      const expected = m.expectedBg;
      const actual = m.backgroundColor;
      return actual !== expected && actual !== 'rgba(0, 0, 0, 0)' && actual !== 'transparent';
    });

    if (hasThemeMismatch) {
      actionMenuResults.rootCause = 'Action menu background not using theme variables';
      actionMenuResults.fix = 'Use var(--surface-primary) or var(--background-primary) for action menu background';
    }

    results.issues.actionMenu = actionMenuResults;
    console.log('Action Menu Results:', actionMenuResults);

    // ===== ISSUE 5: Theme Persistence =====
    console.log('\n📋 Issue 5: Theme Persistence');
    const themeResults = {
      domTheme: null,
      storedTheme: null,
      preferenceTheme: null,
      userPrefsTheme: null,
      rootCause: null,
      fix: null
    };

    themeResults.domTheme = document.body.getAttribute('data-theme') || 
                           document.documentElement.getAttribute('data-theme');

    // Check Chrome storage
    const storedTheme = await new Promise(resolve => {
      chrome.storage.local.get(['theme'], result => resolve(result.theme));
    });
    themeResults.storedTheme = storedTheme;

    // Check UserPreferencesManager
    if (window.userPreferencesManager && typeof window.userPreferencesManager.getPreference === 'function') {
      try {
        const prefTheme = await window.userPreferencesManager.getPreference('theme');
        themeResults.preferenceTheme = prefTheme;
      } catch (e) {
        themeResults.preferenceTheme = 'error: ' + e.message;
      }
    }

    if (themeResults.domTheme !== themeResults.storedTheme && themeResults.storedTheme) {
      themeResults.rootCause = 'DOM theme does not match stored theme';
      themeResults.fix = 'Ensure theme is applied to DOM when preferences load';
    }

    results.issues.theme = themeResults;
    console.log('Theme Results:', themeResults);

    // ===== ISSUE 6: Settings Toggles =====
    console.log('\n📋 Issue 6: Settings Toggles');
    const togglesResults = {
      toggles: {},
      handlersAttached: {},
      rootCause: null,
      fix: null
    };

    const toggleIds = ['visibility-toggle', 'status-select', 'aura-color-picker', 
                       'aura-color-hex', 'aura-intensity-slider', 'theme-toggle'];
    
    toggleIds.forEach(id => {
      const el = document.getElementById(id);
      togglesResults.toggles[id] = {
        exists: !!el,
        handlerAttached: el?.getAttribute('data-handler-attached') === 'true',
        hasEventListener: el ? getEventListeners(el, 'change').length > 0 : false
      };
    });

    const missingHandlers = Object.entries(togglesResults.toggles)
      .filter(([_, info]) => !info.handlerAttached && info.exists);
    
    if (missingHandlers.length > 0) {
      togglesResults.rootCause = `Handlers not attached to: ${missingHandlers.map(([id]) => id).join(', ')}`;
      togglesResults.fix = 'Call ensureEventListeners() when settings tab opens';
    }

    results.issues.toggles = togglesResults;
    console.log('Toggles Results:', togglesResults);

    // ===== ISSUE 7: Go Invisible Button =====
    console.log('\n📋 Issue 7: Go Invisible Button');
    const goInvisibleResults = {
      button: null,
      functions: {},
      rootCause: null,
      fix: null
    };

    const goInvisibleBtn = document.getElementById('go-invisible-btn');
    goInvisibleResults.button = {
      exists: !!goInvisibleBtn,
      visible: goInvisibleBtn ? goInvisibleBtn.offsetParent !== null : false,
      hasClickHandler: goInvisibleBtn ? getEventListeners(goInvisibleBtn, 'click').length > 0 : false
    };

    goInvisibleResults.functions = {
      setVisibilityStatus: typeof window.setVisibilityStatus === 'function',
      switchTab: typeof window.switchTab === 'function'
    };

    if (!goInvisibleResults.button.exists) {
      goInvisibleResults.rootCause = 'Button element not found';
      goInvisibleResults.fix = 'Ensure go-invisible-btn element exists in DOM';
    } else if (!goInvisibleResults.button.hasClickHandler) {
      goInvisibleResults.rootCause = 'Click handler not attached';
      goInvisibleResults.fix = 'Attach click handler in VisibilityManager';
    } else if (!goInvisibleResults.functions.setVisibilityStatus) {
      goInvisibleResults.rootCause = 'setVisibilityStatus not available';
      goInvisibleResults.fix = 'Export setVisibilityStatus from VisibilitySettingsManager';
    }

    results.issues.goInvisible = goInvisibleResults;
    console.log('Go Invisible Results:', goInvisibleResults);

    // ===== SUMMARY =====
    console.log('\n📊 ===== ROOT CAUSE SUMMARY =====');
    const rootCauses = [];
    Object.entries(results.issues).forEach(([name, issue]) => {
      if (issue.rootCause) {
        rootCauses.push({ issue: name, rootCause: issue.rootCause, fix: issue.fix });
        console.log(`\n🔴 ${name}:`);
        console.log(`   Root Cause: ${issue.rootCause}`);
        console.log(`   Fix: ${issue.fix}`);
      }
    });

    results.rootCauses = rootCauses;
    results.recommendations = rootCauses.map(rc => rc.fix).filter(Boolean);

    console.log(`\n📋 Total Root Causes Found: ${rootCauses.length}`);
    console.log('\n📋 Full Results:', results);
    
    return results;
  }

  // Helper function to get event listeners (approximation)
  function getEventListeners(element, type) {
    // This is an approximation - actual listeners are not directly accessible
    // Check for data attributes or known patterns
    const hasDataAttr = element.dataset.listenersAttached === 'true' ||
                       element.getAttribute('data-handler-attached') === 'true';
    return hasDataAttr ? [{ type, attached: true }] : [];
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.runRootCauseDiagnostic = runRootCauseDiagnostic;
    console.log('✅ Root Cause Diagnostic registered.');
    console.log('📋 Run: window.runRootCauseDiagnostic()');
  }
})();

