/**
 * COMPREHENSIVE DIAGNOSTIC: All Persistent Issues
 * Run: window.runPersistentIssuesDiagnostic()
 */

(function() {
  'use strict';

  function runPersistentIssuesDiagnostic() {
    console.log('🔍 ===== PERSISTENT ISSUES DIAGNOSTIC =====');
    const results = {
      timestamp: new Date().toISOString(),
      issues: {}
    };

    // Issue 1: Logger.js Error
    console.log('\n📋 Issue 1: Logger.js ERR_FILE_NOT_FOUND');
    const loggerIssues = [];
    const loggerScripts = document.querySelectorAll('script[src*="Logger"], script[src*="logger"]');
    loggerScripts.forEach(script => {
      loggerIssues.push({
        element: script.outerHTML,
        src: script.src || script.getAttribute('src'),
        type: script.type
      });
    });
    
    // Check for dynamic imports
    const scripts = Array.from(document.querySelectorAll('script')).map(s => s.textContent || '').join('\n');
    if (scripts.includes('Logger.js') || scripts.includes('utils/Logger')) {
      loggerIssues.push({ type: 'dynamic_import', found: true });
    }
    
    results.issues.logger = {
      status: loggerIssues.length > 0 ? 'FOUND' : 'NOT_FOUND',
      details: loggerIssues,
      recommendation: loggerIssues.length > 0 
        ? 'Remove all Logger.js script tags and use ES6 imports only'
        : 'No Logger.js references found in HTML'
    };
    console.log('Logger issues:', results.issues.logger);

    // Issue 2: Go Invisible Button Action
    console.log('\n📋 Issue 2: Go Invisible Button Action');
    const goInvisibleBtn = document.getElementById('go-invisible-btn');
    const goInvisibleIssues = [];
    
    if (!goInvisibleBtn) {
      goInvisibleIssues.push({ type: 'missing', message: 'Button element not found' });
    } else {
      goInvisibleIssues.push({ type: 'found', element: goInvisibleBtn.outerHTML.substring(0, 100) });
      
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
          message: 'window.switchTab is not a function',
          available: typeof switchTab
        });
      } else {
        goInvisibleIssues.push({ type: 'function_exists', message: 'switchTab is available' });
      }
      
      // Check event listeners
      const listeners = getEventListeners?.(goInvisibleBtn);
      if (listeners) {
        goInvisibleIssues.push({ type: 'listeners', count: Object.keys(listeners).length, listeners });
      } else {
        goInvisibleIssues.push({ type: 'listeners', message: 'Cannot check listeners (DevTools required)' });
      }
    }
    
    results.issues.goInvisible = {
      status: goInvisibleIssues.some(i => i.type === 'missing' || i.type === 'missing_function') ? 'BROKEN' : 'OK',
      details: goInvisibleIssues
    };
    console.log('Go Invisible issues:', results.issues.goInvisible);

    // Issue 3: Theme Switching
    console.log('\n📋 Issue 3: Theme Switching from Dark to Light');
    const themeIssues = [];
    const currentTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'light';
    themeIssues.push({ type: 'current_theme', value: currentTheme });
    
    // Check for theme update functions
    const updateThemeEverywhere = window.updateThemeEverywhere;
    const setTheme = window.setTheme;
    if (typeof updateThemeEverywhere === 'function') {
      themeIssues.push({ type: 'function_exists', name: 'updateThemeEverywhere' });
    }
    if (typeof setTheme === 'function') {
      themeIssues.push({ type: 'function_exists', name: 'setTheme' });
    }
    
    // Check UserPreferencesManager
    const userPrefs = window.userPreferencesManager;
    if (userPrefs && typeof userPrefs.getPreference === 'function') {
      userPrefs.getPreference('theme').then(theme => {
        themeIssues.push({ type: 'stored_theme', value: theme });
      }).catch(() => {});
    }
    
    results.issues.theme = {
      status: 'CHECKING',
      details: themeIssues,
      recommendation: 'Check ProfileManager.ts for theme update triggers during message loading'
    };
    console.log('Theme issues:', results.issues.theme);

    // Issue 4: Settings Toggles
    console.log('\n📋 Issue 4: Settings Toggles');
    const toggleIssues = [];
    const visibilityToggle = document.getElementById('visibility-toggle');
    const statusSelect = document.getElementById('status-select');
    const themeToggle = document.getElementById('theme-toggle');
    
    [visibilityToggle, statusSelect, themeToggle].forEach((el, idx) => {
      const names = ['visibility-toggle', 'status-select', 'theme-toggle'];
      if (!el) {
        toggleIssues.push({ type: 'missing', element: names[idx] });
      } else {
        const handlerAttached = el.getAttribute('data-handler-attached') === 'true';
        toggleIssues.push({ 
          type: 'found', 
          element: names[idx],
          handlerAttached,
          hasListeners: el.onchange !== null || el.onclick !== null
        });
      }
    });
    
    results.issues.toggles = {
      status: toggleIssues.some(i => i.type === 'missing' || !i.handlerAttached) ? 'BROKEN' : 'OK',
      details: toggleIssues
    };
    console.log('Toggle issues:', results.issues.toggles);

    // Issue 5: Message Action Menu Promise
    console.log('\n📋 Issue 5: Message Action Menu Promise');
    const actionMenuIssues = [];
    const getMessageActionsMenu = window.getMessageActionsMenu;
    if (typeof getMessageActionsMenu === 'function') {
      actionMenuIssues.push({ type: 'function_exists' });
      // Test if it returns a Promise
      try {
        const testResult = getMessageActionsMenu({ id: 'test' }, false, false);
        if (testResult instanceof Promise) {
          actionMenuIssues.push({ type: 'returns_promise', message: 'Function returns Promise (good)' });
        } else {
          actionMenuIssues.push({ type: 'returns_string', message: 'Function returns string directly' });
        }
      } catch (e) {
        actionMenuIssues.push({ type: 'error', message: e.message });
      }
    } else {
      actionMenuIssues.push({ type: 'missing_function', message: 'getMessageActionsMenu not found' });
    }
    
    results.issues.actionMenu = {
      status: actionMenuIssues.some(i => i.type === 'missing_function') ? 'BROKEN' : 'OK',
      details: actionMenuIssues
    };
    console.log('Action menu issues:', results.issues.actionMenu);

    // Summary
    console.log('\n📊 ===== DIAGNOSTIC SUMMARY =====');
    const brokenIssues = Object.entries(results.issues).filter(([_, issue]) => issue.status === 'BROKEN');
    console.log(`Broken issues: ${brokenIssues.length}`);
    brokenIssues.forEach(([name, issue]) => {
      console.log(`  - ${name}: ${issue.status}`);
    });

    return results;
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.runPersistentIssuesDiagnostic = runPersistentIssuesDiagnostic;
    console.log('✅ Persistent Issues Diagnostic registered. Run: window.runPersistentIssuesDiagnostic()');
  }
})();

