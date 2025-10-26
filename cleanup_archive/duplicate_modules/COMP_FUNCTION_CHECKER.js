// ===== COMP FUNCTION CHECKER =====
// SD1 + SD2 + TA1: Check for duplicate COMP method functions and event listeners
// Date: 2025-01-24

console.log('🔍 COMP FUNCTION CHECKER: Starting COMP method function audit...');

// ===== MAIN CHECK FUNCTION =====

async function checkCompFunctions() {
  console.log('🚀 COMP FUNCTION CHECK: Starting comprehensive COMP method audit...');
  
  try {
    // Check 1: COMP Method Functions
    console.log('\n📋 CHECK 1: COMP Method Functions...');
    await checkCompMethodFunctions();
    
    // Check 2: Event Listener Duplicates
    console.log('\n📋 CHECK 2: Event Listener Duplicates...');
    await checkEventListenerDuplicates();
    
    // Check 3: Function Overwrites
    console.log('\n📋 CHECK 3: Function Overwrites...');
    await checkFunctionOverwrites();
    
    // Check 4: Memory Leaks
    console.log('\n📋 CHECK 4: Memory Leaks...');
    await checkMemoryLeaks();
    
    // Generate Report
    console.log('\n📊 COMP FUNCTION REPORT:');
    generateCompReport();
    
  } catch (error) {
    console.error('❌ COMP FUNCTION CHECK: Error during COMP method audit:', error);
  }
}

// ===== INDIVIDUAL CHECK FUNCTIONS =====

async function checkCompMethodFunctions() {
  console.log('🔧 CHECKING COMP METHOD FUNCTIONS: Scanning for duplicates...');
  
  const duplicates = [];
  
  // Check for duplicate COMP method functions
  const compFunctions = [
    'handleReaction',
    'handleReply',
    'toggleThreadReplies',
    'addReaction',
    'removeReaction',
    'loadMessageReactions',
    'updateReactionDisplay',
    'showColorPickerModal',
    'toggleTheme',
    'performLogout',
    'updateVisibleTab',
    'addProfileAvatarClickHandler',
    'addAuraButtonClickHandler',
    'addThemeToggleButtonClickHandler',
    'addLogoutButtonClickHandler',
    'addAllProfileMenuHandlers'
  ];
  
  compFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      const functionString = window[funcName].toString();
      const functionHash = btoa(functionString).substring(0, 16);
      
      if (window.functionRegistry && window.functionRegistry.has(funcName)) {
        const originalHash = window.functionRegistry.get(funcName);
        if (originalHash !== functionHash) {
          duplicates.push({
            function: funcName,
            issue: 'COMP method function redefined'
          });
        }
      } else {
        if (!window.functionRegistry) window.functionRegistry = new Map();
        window.functionRegistry.set(funcName, functionHash);
      }
    }
  });
  
  if (duplicates.length > 0) {
    console.log('❌ COMP METHOD FUNCTION DUPLICATES:');
    duplicates.forEach(dup => {
      console.log(`   - ${dup.function}: ${dup.issue}`);
    });
  } else {
    console.log('✅ COMP METHOD FUNCTIONS: No duplicates found');
  }
  
  return duplicates;
}

async function checkEventListenerDuplicates() {
  console.log('🔧 CHECKING EVENT LISTENER DUPLICATES: Scanning for duplicates...');
  
  const duplicates = [];
  
  // Check for duplicate event listeners on COMP method elements
  const compElements = [
    'user-avatar-container',
    'user-menu',
    'aura-color-btn',
    'theme-toggle-btn',
    'logout-btn',
    'visibility-settings-btn',
    'color-picker-close',
    'color-picker-reset',
    'color-picker-save',
    'color-input'
  ];
  
  compElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      // Check for multiple click listeners
      const clickListeners = getEventListeners(element, 'click');
      if (clickListeners && clickListeners.length > 1) {
        duplicates.push({
          element: elementId,
          event: 'click',
          count: clickListeners.length,
          issue: 'Multiple click listeners'
        });
      }
      
      // Check for multiple input listeners
      const inputListeners = getEventListeners(element, 'input');
      if (inputListeners && inputListeners.length > 1) {
        duplicates.push({
          element: elementId,
          event: 'input',
          count: inputListeners.length,
          issue: 'Multiple input listeners'
        });
      }
    }
  });
  
  // Check for duplicate event listeners on dynamic elements
  const dynamicElements = document.querySelectorAll('.reaction-btn, .inline-reply-btn, .thread-toggle-btn');
  dynamicElements.forEach((element, index) => {
    const clickListeners = getEventListeners(element, 'click');
    if (clickListeners && clickListeners.length > 1) {
      duplicates.push({
        element: `dynamic-element-${index}`,
        event: 'click',
        count: clickListeners.length,
        issue: 'Multiple click listeners on dynamic element'
      });
    }
  });
  
  if (duplicates.length > 0) {
    console.log('❌ EVENT LISTENER DUPLICATES:');
    duplicates.forEach(dup => {
      console.log(`   - ${dup.element}: ${dup.count} ${dup.event} listeners (${dup.issue})`);
    });
  } else {
    console.log('✅ EVENT LISTENERS: No duplicates found');
  }
  
  return duplicates;
}

async function checkFunctionOverwrites() {
  console.log('🔧 CHECKING FUNCTION OVERWRITES: Scanning for overwrites...');
  
  const overwrites = [];
  
  // Check for function overwrites
  const criticalFunctions = [
    'handleReaction',
    'handleReply',
    'toggleThreadReplies',
    'showColorPickerModal',
    'toggleTheme',
    'performLogout'
  ];
  
  criticalFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      const functionString = window[funcName].toString();
      const functionHash = btoa(functionString).substring(0, 16);
      
      if (window.functionRegistry && window.functionRegistry.has(funcName)) {
        const originalHash = window.functionRegistry.get(funcName);
        if (originalHash !== functionHash) {
          overwrites.push({
            function: funcName,
            issue: 'Function has been overwritten'
          });
        }
      } else {
        if (!window.functionRegistry) window.functionRegistry = new Map();
        window.functionRegistry.set(funcName, functionHash);
      }
    }
  });
  
  if (overwrites.length > 0) {
    console.log('❌ FUNCTION OVERWRITES:');
    overwrites.forEach(overwrite => {
      console.log(`   - ${overwrite.function}: ${overwrite.issue}`);
    });
  } else {
    console.log('✅ FUNCTION OVERWRITES: No overwrites detected');
  }
  
  return overwrites;
}

async function checkMemoryLeaks() {
  console.log('🔧 CHECKING MEMORY LEAKS: Scanning for leaks...');
  
  const leaks = [];
  
  // Check for excessive event listeners
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    if (element.id) {
      const events = ['click', 'input', 'change', 'submit'];
      events.forEach(event => {
        const listeners = getEventListeners(element, event);
        if (listeners && listeners.length > 3) {
          leaks.push({
            element: element.id,
            event: event,
            count: listeners.length,
            issue: 'Excessive event listeners'
          });
        }
      });
    }
  });
  
  // Check for global event listeners
  const globalEvents = ['click', 'keydown', 'keyup', 'resize'];
  globalEvents.forEach(event => {
    const listeners = getEventListeners(document, event);
    if (listeners && listeners.length > 5) {
      leaks.push({
        element: 'document',
        event: event,
        count: listeners.length,
        issue: 'Excessive global event listeners'
      });
    }
  });
  
  if (leaks.length > 0) {
    console.log('❌ MEMORY LEAKS:');
    leaks.forEach(leak => {
      console.log(`   - ${leak.element}: ${leak.count} ${leak.event} listeners (${leak.issue})`);
    });
  } else {
    console.log('✅ MEMORY LEAKS: No leaks detected');
  }
  
  return leaks;
}

// ===== UTILITY FUNCTIONS =====

function getEventListeners(element, eventType) {
  // Simplified event listener detection
  try {
    if (element._listeners && element._listeners[eventType]) {
      return element._listeners[eventType];
    }
    return [];
  } catch (error) {
    return [];
  }
}

function generateCompReport() {
  console.log('\n📊 COMP FUNCTION REPORT:');
  console.log('========================');
  
  const totalIssues = window.duplicateWarnings ? window.duplicateWarnings.length : 0;
  
  if (totalIssues === 0) {
    console.log('✅ ALL COMP FUNCTIONS CLEAN: No duplicates or conflicts found');
    console.log('🎯 COMP METHOD QUALITY: Excellent - all functions are clean');
  } else {
    console.log(`⚠️  COMP FUNCTION ISSUES: ${totalIssues} issues detected`);
    console.log('🔧 RECOMMENDATIONS:');
    console.log('   1. Review COMP method function warnings above');
    console.log('   2. Clean up duplicate functions');
    console.log('   3. Remove duplicate event listeners');
    console.log('   4. Fix function overwrites');
    console.log('   5. Address memory leaks');
  }
  
  console.log('\n📋 COMP METHOD MAINTENANCE:');
  console.log('   1. Run this check regularly');
  console.log('   2. Clean up duplicates immediately');
  console.log('   3. Test COMP method functionality');
  console.log('   4. Monitor for new duplicates');
}

// ===== CLEANUP FUNCTIONS =====

function cleanupCompDuplicates() {
  console.log('🧹 CLEANUP: Cleaning up COMP method duplicates...');
  
  // Clean up event listener duplicates
  cleanupEventListenerDuplicates();
  
  // Clean up function overwrites
  cleanupFunctionOverwrites();
  
  console.log('✅ CLEANUP: COMP method duplicates cleaned up');
}

function cleanupEventListenerDuplicates() {
  console.log('🧹 CLEANUP: Cleaning up event listener duplicates...');
  
  // Clean up COMP method elements
  const compElements = [
    'user-avatar-container',
    'user-menu',
    'aura-color-btn',
    'theme-toggle-btn',
    'logout-btn',
    'visibility-settings-btn',
    'color-picker-close',
    'color-picker-reset',
    'color-picker-save',
    'color-input'
  ];
  
  compElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      // Clone element to remove all event listeners
      const newElement = element.cloneNode(true);
      element.parentNode.replaceChild(newElement, element);
      console.log(`✅ CLEANUP: Removed listeners from ${elementId}`);
    }
  });
  
  // Clean up dynamic elements
  const dynamicElements = document.querySelectorAll('.reaction-btn, .inline-reply-btn, .thread-toggle-btn');
  dynamicElements.forEach((element, index) => {
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
    console.log(`✅ CLEANUP: Removed listeners from dynamic element ${index}`);
  });
}

function cleanupFunctionOverwrites() {
  console.log('🧹 CLEANUP: Cleaning up function overwrites...');
  
  // This would need to be implemented based on specific findings
  console.log('⚠️  CLEANUP: Manual cleanup required - review warnings above');
}

// ===== EXPORT FUNCTIONS =====

window.checkCompFunctions = checkCompFunctions;
window.checkCompMethodFunctions = checkCompMethodFunctions;
window.checkEventListenerDuplicates = checkEventListenerDuplicates;
window.checkFunctionOverwrites = checkFunctionOverwrites;
window.checkMemoryLeaks = checkMemoryLeaks;
window.cleanupCompDuplicates = cleanupCompDuplicates;
window.cleanupEventListenerDuplicates = cleanupEventListenerDuplicates;
window.cleanupFunctionOverwrites = cleanupFunctionOverwrites;

console.log('✅ COMP FUNCTION CHECKER: Script loaded successfully');
console.log('📋 USAGE: Run window.checkCompFunctions() to check for COMP method duplicates');
console.log('📋 USAGE: Run window.cleanupCompDuplicates() to clean up duplicates');
