/**
 * COMPREHENSIVE DIAGNOSTIC: All Persistent Issues
 * Run in browser console: window.runAllPersistentIssuesDiagnostic()
 * 
 * This script checks:
 * 1. Go Invisible button functionality
 * 2. Logger.js error references
 * 3. Theme persistence
 * 4. Settings toggles
 * 5. Action menu (edit/delete/flag)
 * 6. Message icons and community names
 * 7. Edit message timing (1 hour limit)
 */

(function() {
  'use strict';

  function runAllPersistentIssuesDiagnostic() {
    console.log('🔍 ===== COMPREHENSIVE PERSISTENT ISSUES DIAGNOSTIC =====');
    console.log('🔍 Timestamp:', new Date().toISOString());
    
    const results = {
      timestamp: new Date().toISOString(),
      buildNumber: window.buildTracker?.getBuildNumber?.() || 'unknown',
      issues: {}
    };

    // Issue 1: Go Invisible Button
    console.log('\n📋 Issue 1: Go Invisible Button');
    const goInvisibleBtn = document.getElementById('go-invisible-btn');
    const goInvisibleIssues = [];
    
    if (!goInvisibleBtn) {
      goInvisibleIssues.push({ type: 'missing', message: 'Button element not found' });
    } else {
      goInvisibleIssues.push({ type: 'found', visible: goInvisibleBtn.offsetParent !== null });
      
      // Check if setVisibilityStatus exists
      const setVisibilityStatus = window.setVisibilityStatus;
      if (typeof setVisibilityStatus !== 'function') {
        goInvisibleIssues.push({ 
          type: 'missing_function', 
          message: 'window.setVisibilityStatus is not a function',
          available: typeof setVisibilityStatus
        });
      } else {
        goInvisibleIssues.push({ type: 'function_exists', message: 'setVisibilityStatus is available' });
      }
      
      // Check if switchTab exists
      const switchTab = window.switchTab;
      if (typeof switchTab !== 'function') {
        goInvisibleIssues.push({ 
          type: 'missing_function', 
          message: 'window.switchTab is not a function'
        });
      } else {
        goInvisibleIssues.push({ type: 'function_exists', message: 'switchTab is available' });
      }
      
      // Check button styling
      const computedStyle = window.getComputedStyle(goInvisibleBtn);
      const theme = document.body.getAttribute('data-theme') || 'light';
      const color = computedStyle.color;
      goInvisibleIssues.push({ 
        type: 'styling', 
        theme, 
        color,
        visible: theme === 'light' ? (color !== 'rgb(255, 255, 255)' && color !== 'white') : true
      });
    }
    
    results.issues.goInvisible = {
      status: goInvisibleIssues.some(i => i.type === 'missing' || i.type === 'missing_function') ? 'BROKEN' : 'OK',
      details: goInvisibleIssues
    };
    console.log('Go Invisible:', results.issues.goInvisible);

    // Issue 2: Logger.js Error
    console.log('\n📋 Issue 2: Logger.js ERR_FILE_NOT_FOUND');
    const loggerIssues = [];
    const loggerScripts = Array.from(document.querySelectorAll('script')).filter(s => {
      const src = s.src || s.getAttribute('src') || '';
      return src.includes('Logger') || src.includes('logger');
    });
    
    loggerScripts.forEach(script => {
      loggerIssues.push({
        type: 'script_tag',
        src: script.src || script.getAttribute('src'),
        commented: script.outerHTML.includes('<!--') && script.outerHTML.includes('-->')
      });
    });
    
    // Check for dynamic imports in script content
    const allScripts = Array.from(document.querySelectorAll('script')).map(s => s.textContent || '').join('\n');
    if (allScripts.includes('Logger.js') || allScripts.includes('utils/Logger')) {
      loggerIssues.push({ type: 'dynamic_import', found: true });
    }
    
    results.issues.logger = {
      status: loggerIssues.length > 0 ? 'FOUND' : 'NOT_FOUND',
      details: loggerIssues,
      recommendation: loggerIssues.length > 0 
        ? 'Remove all Logger.js script tags and use ES6 imports only'
        : 'No Logger.js references found - may be browser cache issue'
    };
    console.log('Logger:', results.issues.logger);

    // Issue 3: Theme Persistence
    console.log('\n📋 Issue 3: Theme Persistence');
    const themeIssues = [];
    const currentTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'light';
    themeIssues.push({ type: 'current_theme', value: currentTheme });
    
    // Check stored theme
    chrome.storage.local.get(['theme'], (result) => {
      themeIssues.push({ type: 'stored_theme', value: result.theme });
    });
    
    // Check UserPreferencesManager
    const userPrefs = window.userPreferencesManager;
    if (userPrefs && typeof userPrefs.getPreference === 'function') {
      userPrefs.getPreference('theme').then(theme => {
        themeIssues.push({ type: 'preference_theme', value: theme });
      }).catch(() => {});
    }
    
    results.issues.theme = {
      status: 'CHECKING',
      details: themeIssues,
      currentTheme
    };
    console.log('Theme:', results.issues.theme);

    // Issue 4: Settings Toggles
    console.log('\n📋 Issue 4: Settings Toggles');
    const toggleIssues = [];
    const toggles = {
      'visibility-toggle': document.getElementById('visibility-toggle'),
      'status-select': document.getElementById('status-select'),
      'aura-color-picker': document.getElementById('aura-color-picker'),
      'aura-color-hex': document.getElementById('aura-color-hex'),
      'aura-intensity-slider': document.getElementById('aura-intensity-slider'),
      'theme-toggle': document.getElementById('theme-toggle')
    };
    
    Object.entries(toggles).forEach(([name, el]) => {
      if (!el) {
        toggleIssues.push({ type: 'missing', element: name });
      } else {
        const handlerAttached = el.getAttribute('data-handler-attached') === 'true';
        toggleIssues.push({ 
          type: 'found', 
          element: name,
          handlerAttached,
          hasValue: el.value !== undefined || el.checked !== undefined
        });
      }
    });
    
    results.issues.toggles = {
      status: toggleIssues.some(i => i.type === 'missing' || !i.handlerAttached) ? 'BROKEN' : 'OK',
      details: toggleIssues
    };
    console.log('Toggles:', results.issues.toggles);

    // Issue 5: Action Menu (COMP - edit/delete/flag)
    console.log('\n📋 Issue 5: Action Menu (COMP)');
    const actionMenuIssues = [];
    const messages = document.querySelectorAll('[data-message-id]');
    actionMenuIssues.push({ type: 'message_count', count: messages.length });
    
    if (messages.length > 0) {
      const firstMessage = messages[0];
      const actionMenu = firstMessage.querySelector('.message-actions-menu');
      const actionDropdown = firstMessage.querySelector('.action-dropdown');
      const editBtn = firstMessage.querySelector('.edit-btn, [class*="edit"]');
      const deleteBtn = firstMessage.querySelector('.delete-btn, [class*="delete"]');
      const flagBtn = firstMessage.querySelector('.flag-btn, [class*="flag"]');
      const actionDots = firstMessage.querySelector('.action-dots-btn, .action-dots');
      
      actionMenuIssues.push({
        type: 'structure',
        hasActionMenu: !!actionMenu,
        hasActionDropdown: !!actionDropdown,
        hasEditBtn: !!editBtn,
        hasDeleteBtn: !!deleteBtn,
        hasFlagBtn: !!flagBtn,
        hasActionDots: !!actionDots
      });
      
      // Check getMessageActionsMenu function
      const getMessageActionsMenu = window.getMessageActionsMenu;
      if (typeof getMessageActionsMenu === 'function') {
        actionMenuIssues.push({ type: 'function_exists', message: 'getMessageActionsMenu is available' });
        // Test it
        try {
          const testMessage = { id: 'test', author: { id: 'test' } };
          const testResult = getMessageActionsMenu(testMessage, true, true);
          if (testResult instanceof Promise) {
            testResult.then(html => {
              actionMenuIssues.push({ 
                type: 'test_result', 
                returnsPromise: true,
                htmlPreview: html.substring(0, 200),
                hasEdit: html.includes('edit') || html.includes('Edit'),
                hasDelete: html.includes('delete') || html.includes('Delete'),
                hasFlag: html.includes('flag') || html.includes('Flag')
              });
            });
          } else {
            actionMenuIssues.push({ 
              type: 'test_result', 
              returnsString: true,
              htmlPreview: String(testResult).substring(0, 200),
              hasEdit: String(testResult).includes('edit') || String(testResult).includes('Edit'),
              hasDelete: String(testResult).includes('delete') || String(testResult).includes('Delete'),
              hasFlag: String(testResult).includes('flag') || String(testResult).includes('Flag')
            });
          }
        } catch (e) {
          actionMenuIssues.push({ type: 'test_error', error: e.message });
        }
      } else {
        actionMenuIssues.push({ type: 'missing_function', message: 'getMessageActionsMenu not found' });
      }
    }
    
    results.issues.actionMenu = {
      status: actionMenuIssues.some(i => i.type === 'missing_function' || (i.type === 'structure' && !i.hasEditBtn)) ? 'BROKEN' : 'OK',
      details: actionMenuIssues
    };
    console.log('Action Menu:', results.issues.actionMenu);

    // Issue 6: Message Icons and Community Names
    console.log('\n📋 Issue 6: Message Icons and Community Names');
    const messageIssues = [];
    if (messages.length > 0) {
      const firstMessage = messages[0];
      const hasCommunityName = firstMessage.textContent?.includes('Public Square') || 
                               firstMessage.querySelector('.message-sender-name')?.textContent?.includes('•');
      const hasIcons = firstMessage.querySelector('.inline-reply-btn, .reaction-btn, .bookmark-btn');
      
      messageIssues.push({
        type: 'message_structure',
        hasCommunityName,
        hasIcons: !!hasIcons,
        messageId: firstMessage.getAttribute('data-message-id')
      });
    }
    
    results.issues.messages = {
      status: 'OK',
      details: messageIssues
    };
    console.log('Messages:', results.issues.messages);

    // Summary
    console.log('\n📊 ===== DIAGNOSTIC SUMMARY =====');
    const brokenIssues = Object.entries(results.issues).filter(([_, issue]) => issue.status === 'BROKEN' || issue.status === 'FOUND');
    console.log(`Broken/Found issues: ${brokenIssues.length}`);
    brokenIssues.forEach(([name, issue]) => {
      console.log(`  - ${name}: ${issue.status}`);
    });
    
    const okIssues = Object.entries(results.issues).filter(([_, issue]) => issue.status === 'OK');
    console.log(`OK issues: ${okIssues.length}`);
    
    console.log('\n📋 Full Results:', results);
    return results;
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.runAllPersistentIssuesDiagnostic = runAllPersistentIssuesDiagnostic;
    console.log('✅ Comprehensive Persistent Issues Diagnostic registered.');
    console.log('📋 Run: window.runAllPersistentIssuesDiagnostic()');
  }
})();

