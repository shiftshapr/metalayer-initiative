/**
 * Comprehensive Diagnostic: All Recurring Issues
 * 
 * Checks:
 * 1. Toggle event listeners (visibility, theme, status, aura)
 * 2. DOM element persistence
 * 3. Settings tab initialization
 * 4. Duplicate messages in DOM
 * 5. .build-info.js and Logger.js file loading
 * 6. Event listener attachment timing
 * 7. Element recreation issues
 */

(function() {
  'use strict';

  function diagnoseToggles() {
    console.log('\n📋 Issue 1: Toggle Event Listeners');
    const results = {
      visibilityToggle: {
        exists: false,
        hasHandler: false,
        dataHandlerAttached: false,
        checked: null
      },
      themeToggle: {
        exists: false,
        hasHandler: false,
        dataHandlerAttached: false,
        checked: null
      },
      statusSelect: {
        exists: false,
        hasHandler: false,
        dataHandlerAttached: false,
        value: null
      },
      auraColorPicker: {
        exists: false,
        hasHandler: false,
        dataHandlerAttached: false,
        value: null
      },
      visibilitySettingsManager: {
        initialized: false,
        ensureEventListenersExists: false
      }
    };

    // Check visibility toggle
    const visibilityToggle = document.getElementById('visibility-toggle');
    if (visibilityToggle) {
      results.visibilityToggle.exists = true;
      results.visibilityToggle.checked = visibilityToggle.checked || false;
      results.visibilityToggle.dataHandlerAttached = visibilityToggle.hasAttribute('data-handler-attached');
      
      // Check if event listeners are attached (by checking if element has been cloned)
      const parent = visibilityToggle.parentElement;
      if (parent) {
        const allToggles = parent.querySelectorAll('#visibility-toggle');
        if (allToggles.length > 0) {
          results.visibilityToggle.hasHandler = true;
        }
      }
      // If we don't have a better signal, trust the data attribute
      if (!results.visibilityToggle.hasHandler && results.visibilityToggle.dataHandlerAttached) {
        results.visibilityToggle.hasHandler = true;
      }
    }

    // Check theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      results.themeToggle.exists = true;
      results.themeToggle.checked = themeToggle.checked || false;
      results.themeToggle.dataHandlerAttached = themeToggle.hasAttribute('data-handler-attached');
      results.themeToggle.hasHandler = results.themeToggle.dataHandlerAttached;
    }

    // Check status select
    const statusSelect = document.getElementById('status-select');
    if (statusSelect) {
      results.statusSelect.exists = true;
      results.statusSelect.value = statusSelect.value || '';
      results.statusSelect.dataHandlerAttached = statusSelect.hasAttribute('data-handler-attached');
      results.statusSelect.hasHandler = results.statusSelect.dataHandlerAttached;
    }

    // Check aura color picker
    const auraColorPicker = document.getElementById('aura-color-picker');
    if (auraColorPicker) {
      results.auraColorPicker.exists = true;
      results.auraColorPicker.value = auraColorPicker.value || '';
      results.auraColorPicker.dataHandlerAttached = auraColorPicker.hasAttribute('data-handler-attached');
      results.auraColorPicker.hasHandler = results.auraColorPicker.dataHandlerAttached;
    }

    // Check VisibilitySettingsManager
    const win = window;
    if (win.visibilitySettingsManager) {
      results.visibilitySettingsManager.initialized = true;
      results.visibilitySettingsManager.ensureEventListenersExists = 
        typeof win.visibilitySettingsManager.ensureEventListeners === 'function';
    }

    console.log('  Results:', results);
    return results;
  }

  function diagnoseDuplicateMessages() {
    console.log('\n📋 Issue 2: Duplicate Messages in DOM');
    const results = {
      messageElements: 0,
      uniqueMessageIds: 0,
      duplicates: [],
      messageIds: [],
      analyzedContainers: 0,
      visibleContainers: 0
    };

    const allContainers = Array.from(document.querySelectorAll('.chat-messages'));
    const visibleContainers = allContainers.filter(el => el.offsetParent !== null);
    const containersToInspect = visibleContainers.length > 0 ? visibleContainers : allContainers.slice(0, 1);
    results.analyzedContainers = containersToInspect.length;
    results.visibleContainers = visibleContainers.length;

    if (containersToInspect.length === 0) {
      console.log('  ⚠️ No chat message containers found in DOM.');
      return results;
    }

    const messageElements: Element[] = [];
    containersToInspect.forEach(container => {
      messageElements.push(...Array.from(container.querySelectorAll('[data-message-id]')));
    });

    results.messageElements = messageElements.length;

    const messageIds = new Set();
    const seenIds = new Map();

    messageElements.forEach(el => {
      const messageId = el.getAttribute('data-message-id');
      if (messageId) {
        results.messageIds.push(messageId);
        messageIds.add(messageId);
        const count = seenIds.get(messageId) || 0;
        seenIds.set(messageId, count + 1);
        if (count > 0) {
          results.duplicates.push(messageId);
        }
      }
    });

    results.uniqueMessageIds = messageIds.size;

    if (results.duplicates.length > 0) {
      console.warn('  ⚠️ Found duplicate messages:', results.duplicates);
    }

    console.log('  Containers inspected:', results.analyzedContainers, '(visible:', results.visibleContainers, ')');
    console.log('  Results:', results);
    return results;
  }

  function diagnoseFileLoading() {
    console.log('\n📋 Issue 3: File Loading Errors');
    const results = {
      buildInfoExists: false,
      buildInfoPath: null,
      loggerScriptTag: false,
      loggerImports: []
    };

    // Check .build-info.js
    const buildInfoScript = document.querySelector('script[src*=".build-info.js"]');
    if (buildInfoScript) {
      const src = buildInfoScript.src;
      results.buildInfoPath = src;
      // Try to fetch it
      fetch(src).then(() => {
        results.buildInfoExists = true;
      }).catch(() => {
        results.buildInfoExists = false;
      });
    }

    // Check Logger.js script tag
    const loggerScript = document.querySelector('script[src*="Logger.js"]');
    results.loggerScriptTag = !!loggerScript;

    // Check for Logger imports in code (would need to check compiled files)
    // This is a simplified check
    const scripts = Array.from(document.querySelectorAll('script[type="module"]'));
    scripts.forEach(script => {
      const src = script.src;
      if (src && src.includes('Logger')) {
        results.loggerImports.push(src);
      }
    });

    console.log('  Results:', results);
    return results;
  }

  function diagnoseSettingsTabInitialization() {
    console.log('\n📋 Issue 4: Settings Tab Initialization');
    const results = {
      settingsTabExists: false,
      isVisible: false,
      visibilitySettingsInitialized: false,
      initializationTiming: {
        tabVisible: false,
        managerReady: false
      }
    };

    const settingsTab = document.getElementById('settings-tab');
    if (settingsTab) {
      results.settingsTabExists = true;
      results.isVisible = settingsTab.offsetParent !== null;
    }

    const win = window;
    results.visibilitySettingsInitialized = !!(win.visibilitySettingsManager && win.visibilitySettingsManager.isInitialized);

    // Check if initialization happens when tab becomes visible
    if (results.isVisible && !results.visibilitySettingsInitialized) {
      results.initializationTiming.tabVisible = true;
      results.initializationTiming.managerReady = false;
    }

    console.log('  Results:', results);
    return results;
  }

  function diagnoseDOMElementPersistence() {
    console.log('\n📋 Issue 5: DOM Element Persistence');
    const results = {
      elementsRecreated: [],
      elementsStable: [],
      checkCount: 0
    };

    const criticalElements = [
      'visibility-toggle',
      'theme-toggle',
      'status-select',
      'aura-color-picker',
      'visibility-label',
      'visibility-setting-item'
    ];

    // Store initial element references
    const initialElements = new Map();
    criticalElements.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        initialElements.set(id, el);
      }
    });

    // Wait a bit and check if elements are the same
    setTimeout(() => {
      criticalElements.forEach(id => {
        const initial = initialElements.get(id);
        const current = document.getElementById(id);
        if (initial && current) {
          if (initial !== current) {
            results.elementsRecreated.push(id);
          } else {
            results.elementsStable.push(id);
          }
        }
      });
      results.checkCount = criticalElements.length;
      console.log('  Results:', results);
    }, 1000);

    return results;
  }

  function diagnoseEventListenerAttachment() {
    console.log('\n📋 Issue 6: Event Listener Attachment');
    const results = {
      visibilityToggleListeners: 0,
      themeToggleListeners: 0,
      canManuallyAttach: false,
      attachmentMethod: null
    };

    const visibilityToggle = document.getElementById('visibility-toggle');
    if (visibilityToggle) {
      // Try to get listener count (this is approximate)
      const win = window;
      if (win.visibilitySettingsManager) {
        results.canManuallyAttach = true;
        results.attachmentMethod = 'VisibilitySettingsManager';
      }
    }

    // Check if we can manually trigger ensureEventListeners
    const win = window;
    if (win.visibilitySettingsManager && win.visibilitySettingsManager.ensureEventListeners) {
      try {
        win.visibilitySettingsManager.ensureEventListeners();
        results.canManuallyAttach = true;
      } catch (e) {
        console.warn('  ⚠️ Cannot manually attach listeners:', e);
      }
    }

    console.log('  Results:', results);
    return results;
  }

  function runAllDiagnostics() {
    console.log('🔍 COMPREHENSIVE DIAGNOSTIC: Starting all recurring issues diagnostic...');
    console.log('='.repeat(80));
    
    const results = {
      timestamp: new Date().toISOString(),
      toggles: diagnoseToggles(),
      duplicateMessages: diagnoseDuplicateMessages(),
      fileLoading: diagnoseFileLoading(),
      settingsTabInit: diagnoseSettingsTabInitialization(),
      domPersistence: diagnoseDOMElementPersistence(),
      eventListeners: diagnoseEventListenerAttachment(),
      recommendations: []
    };

    // Generate recommendations
    if (!results.toggles.visibilityToggle.hasHandler || !results.toggles.visibilityToggle.dataHandlerAttached) {
      results.recommendations.push('Visibility toggle missing event listeners - call ensureEventListeners()');
    }
    if (!results.toggles.themeToggle.hasHandler || !results.toggles.themeToggle.dataHandlerAttached) {
      results.recommendations.push('Theme toggle missing event listeners - call ensureEventListeners()');
    }
    if (results.duplicateMessages.duplicates.length > 0 && results.duplicateMessages.analyzedContainers === 1) {
      results.recommendations.push(`Found ${results.duplicateMessages.duplicates.length} duplicate messages - clear active container before rendering`);
    }
    if (!results.settingsTabInit.visibilitySettingsInitialized && results.settingsTabInit.isVisible) {
      results.recommendations.push('Settings tab visible but VisibilitySettingsManager not initialized - initialize on tab switch');
    }

    console.log('\n📊 SUMMARY:');
    console.log(JSON.stringify(results, null, 2));

    console.log('\n💡 RECOMMENDATIONS:');
    results.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });

    // Expose to window
    window.allRecurringIssuesDiagnosticResults = results;
    return results;
  }

  // Auto-run if in browser
  if (typeof window !== 'undefined') {
    window.runAllRecurringIssuesDiagnostic = runAllDiagnostics;
    
    // Auto-run after DOM is ready and a delay for initialization
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runAllDiagnostics, 2000);
      });
    } else {
      setTimeout(runAllDiagnostics, 2000);
    }
  }

  console.log('✅ Comprehensive Recurring Issues Diagnostic script loaded.');
  console.log('📋 Run: window.runAllRecurringIssuesDiagnostic()');
})();

