/**
 * Theme Reset Diagnostic
 * Tracks all function calls that could change the theme during reload/message loading
 */

(function() {
  'use strict';

  console.log('🔍 THEME_DIAGNOSTIC: Starting comprehensive theme change tracking...');

  // Track all theme changes with full call stack
  const themeChangeLog = [];

  // Intercept setAttribute calls on document.body and document.documentElement
  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    if (name === 'data-theme' && (this === document.body || this === document.documentElement)) {
      const oldValue = this.getAttribute('data-theme');
      const stack = new Error().stack || 'No stack trace';
      const caller = stack.split('\n')[2]?.trim() || 'unknown';
      
      themeChangeLog.push({
        timestamp: new Date().toISOString(),
        oldValue: oldValue || 'NOT SET',
        newValue: value || 'NOT SET',
        source: caller,
        stack: stack
      });

      console.log('🔍 THEME_DIAGNOSTIC: ========================================');
      console.log('🔍 THEME_DIAGNOSTIC: ⚠️ THEME CHANGE DETECTED');
      console.log('🔍 THEME_DIAGNOSTIC: Element:', this === document.body ? 'document.body' : 'document.documentElement');
      console.log('🔍 THEME_DIAGNOSTIC: Old value:', oldValue || 'NOT SET');
      console.log('🔍 THEME_DIAGNOSTIC: New value:', value || 'NOT SET');
      console.log('🔍 THEME_DIAGNOSTIC: Caller:', caller);
      console.log('🔍 THEME_DIAGNOSTIC: Full stack:', stack);
      console.log('🔍 THEME_DIAGNOSTIC: ========================================');
    }
    
    return originalSetAttribute.call(this, name, value);
  };

  // Also use MutationObserver as backup
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const target = mutation.target;
        if (target === document.body || target === document.documentElement) {
          const oldValue = mutation.oldValue || 'NOT SET';
          const newValue = target.getAttribute('data-theme') || 'NOT SET';
          const stack = new Error().stack || 'No stack trace';
          
          themeChangeLog.push({
            timestamp: new Date().toISOString(),
            oldValue: oldValue,
            newValue: newValue,
            source: 'MutationObserver',
            stack: stack
          });

          console.log('🔍 THEME_DIAGNOSTIC: ========================================');
          console.log('🔍 THEME_DIAGNOSTIC: ⚠️ THEME CHANGE DETECTED (MutationObserver)');
          console.log('🔍 THEME_DIAGNOSTIC: Element:', target === document.body ? 'document.body' : 'document.documentElement');
          console.log('🔍 THEME_DIAGNOSTIC: Old value:', oldValue);
          console.log('🔍 THEME_DIAGNOSTIC: New value:', newValue);
          console.log('🔍 THEME_DIAGNOSTIC: Full stack:', stack);
          console.log('🔍 THEME_DIAGNOSTIC: ========================================');
        }
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['data-theme']
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['data-theme']
  });

  // Track function calls that could change theme
  const trackedFunctions = [
    'loadSettings',
    'saveTheme',
    'updateThemeEverywhere',
    'applyPreferencesToUI',
    'loadAllPreferences',
    'initialize',
    'loadChatHistory',
    'onMessageUpdate',
    'renderMessages'
  ];

  // Intercept window function calls
  const originalWindowFunctions = {};
  trackedFunctions.forEach((funcName) => {
    if (window[funcName] && typeof window[funcName] === 'function') {
      originalWindowFunctions[funcName] = window[funcName];
      window[funcName] = function(...args) {
        const stack = new Error().stack || 'No stack trace';
        console.log(`🔍 THEME_DIAGNOSTIC: Function called: ${funcName}`);
        console.log(`🔍 THEME_DIAGNOSTIC: Arguments:`, args);
        console.log(`🔍 THEME_DIAGNOSTIC: Call stack:`, stack.split('\n').slice(1, 5).join('\n'));
        
        const currentTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
        console.log(`🔍 THEME_DIAGNOSTIC: Current theme before ${funcName}:`, currentTheme);
        
        const result = originalWindowFunctions[funcName].apply(this, args);
        
        // Check if theme changed after function call
        setTimeout(() => {
          const newTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
          if (currentTheme !== newTheme) {
            console.log(`🔍 THEME_DIAGNOSTIC: ⚠️ THEME CHANGED by ${funcName}!`);
            console.log(`🔍 THEME_DIAGNOSTIC: Before: ${currentTheme} -> After: ${newTheme}`);
          }
        }, 100);
        
        return result;
      };
    }
  });

  // Export diagnostic function
  window.getThemeChangeLog = () => {
    console.log('🔍 THEME_DIAGNOSTIC: ========================================');
    console.log('🔍 THEME_DIAGNOSTIC: Theme Change Log (all changes)');
    console.log('🔍 THEME_DIAGNOSTIC: ========================================');
    themeChangeLog.forEach((entry, index) => {
      console.log(`\n[${index + 1}] ${entry.timestamp}`);
      console.log(`  Old: ${entry.oldValue} -> New: ${entry.newValue}`);
      console.log(`  Source: ${entry.source}`);
      console.log(`  Stack: ${entry.stack.split('\n').slice(1, 5).join('\n')}`);
    });
    console.log('🔍 THEME_DIAGNOSTIC: ========================================');
    return themeChangeLog;
  };

  console.log('✅ THEME_DIAGNOSTIC: Theme change tracking initialized');
  console.log('📋 THEME_DIAGNOSTIC: Call window.getThemeChangeLog() to see all theme changes');
})();





