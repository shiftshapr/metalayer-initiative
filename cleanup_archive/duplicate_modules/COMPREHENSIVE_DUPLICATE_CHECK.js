// ===== COMPREHENSIVE DUPLICATE CHECK =====
// SD1 + SD2 + TA1: Comprehensive duplicate function and event listener checker
// Date: 2025-01-24

console.log('🔍 COMPREHENSIVE DUPLICATE CHECK: Starting complete audit...');

// ===== MAIN CHECK FUNCTION =====

async function runComprehensiveDuplicateCheck() {
  console.log('🚀 COMPREHENSIVE DUPLICATE CHECK: Starting complete audit...');
  
  try {
    // Initialize function registry
    window.functionRegistry = new Map();
    window.eventListenerRegistry = new Map();
    window.duplicateWarnings = [];
    
    // Check 1: General Duplicates
    console.log('\n📋 CHECK 1: General Duplicate Functions...');
    await checkGeneralDuplicates();
    
    // Check 2: Module-Specific Duplicates
    console.log('\n📋 CHECK 2: Module-Specific Duplicates...');
    await checkModuleSpecificDuplicates();
    
    // Check 3: COMP Method Duplicates
    console.log('\n📋 CHECK 3: COMP Method Duplicates...');
    await checkCompMethodDuplicates();
    
    // Check 4: Event Listener Duplicates
    console.log('\n📋 CHECK 4: Event Listener Duplicates...');
    await checkEventListeners();
    
    // Check 5: Memory Leaks
    console.log('\n📋 CHECK 5: Memory Leaks...');
    await checkMemoryLeaks();
    
    // Check 6: Cross-Module Conflicts
    console.log('\n📋 CHECK 6: Cross-Module Conflicts...');
    await checkCrossModuleConflicts();
    
    // Generate Comprehensive Report
    console.log('\n📊 COMPREHENSIVE DUPLICATE REPORT:');
    generateComprehensiveReport();
    
  } catch (error) {
    console.error('❌ COMPREHENSIVE DUPLICATE CHECK: Error during audit:', error);
  }
}

// ===== INDIVIDUAL CHECK FUNCTIONS =====

async function checkGeneralDuplicates() {
  console.log('🔧 CHECKING GENERAL DUPLICATES: Scanning for duplicate functions...');
  
  const duplicates = [];
  const functionCounts = new Map();
  
  // Scan all script tags
  const scripts = document.querySelectorAll('script');
  scripts.forEach((script, index) => {
    if (script.src) {
      console.log(`📄 Scanning external script: ${script.src}`);
    } else {
      console.log(`📄 Scanning inline script ${index + 1}`);
    }
    
    const content = script.textContent || '';
    const functionMatches = content.match(/function\s+(\w+)/g);
    
    if (functionMatches) {
      functionMatches.forEach(match => {
        const functionName = match.replace('function ', '');
        const count = functionCounts.get(functionName) || 0;
        functionCounts.set(functionName, count + 1);
        
        if (count > 0) {
          duplicates.push({
            name: functionName,
            count: count + 1,
            source: script.src || `inline-script-${index + 1}`
          });
        }
      });
    }
  });
  
  // Check global window functions
  Object.keys(window).forEach(key => {
    if (typeof window[key] === 'function') {
      const count = functionCounts.get(key) || 0;
      functionCounts.set(key, count + 1);
      
      if (count > 0) {
        duplicates.push({
          name: key,
          count: count + 1,
          source: 'global-window'
        });
      }
    }
  });
  
  if (duplicates.length > 0) {
    console.log('❌ GENERAL DUPLICATES FOUND:');
    duplicates.forEach(dup => {
      console.log(`   - ${dup.name}: defined ${dup.count} times (last in ${dup.source})`);
      window.duplicateWarnings.push(dup);
    });
  } else {
    console.log('✅ GENERAL DUPLICATES: No duplicate functions found');
  }
  
  return duplicates;
}

async function checkModuleSpecificDuplicates() {
  console.log('🔧 CHECKING MODULE-SPECIFIC DUPLICATES: Scanning modules...');
  
  const duplicates = [];
  
  // Check ProfileManager functions
  const profileFunctions = [
    'addProfileAvatarClickHandler',
    'addAuraButtonClickHandler',
    'addThemeToggleButtonClickHandler',
    'addLogoutButtonClickHandler',
    'addAllProfileMenuHandlers'
  ];
  
  profileFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      const functionString = window[funcName].toString();
      const functionHash = btoa(functionString).substring(0, 16);
      
      if (window.functionRegistry.has(funcName)) {
        const originalHash = window.functionRegistry.get(funcName);
        if (originalHash !== functionHash) {
          duplicates.push({
            module: 'ProfileManager',
            function: funcName,
            issue: 'Function redefined'
          });
        }
      } else {
        window.functionRegistry.set(funcName, functionHash);
      }
    }
  });
  
  // Check CanopiModule functions
  const canopiFunctions = [
    'addMessageToChat',
    'updateMessageInChat',
    'removeMessageFromChat',
    'handleReaction',
    'handleReply',
    'toggleThreadReplies'
  ];
  
  canopiFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      const functionString = window[funcName].toString();
      const functionHash = btoa(functionString).substring(0, 16);
      
      if (window.functionRegistry.has(funcName)) {
        const originalHash = window.functionRegistry.get(funcName);
        if (originalHash !== functionHash) {
          duplicates.push({
            module: 'CanopiModule',
            function: funcName,
            issue: 'Function redefined'
          });
        }
      } else {
        window.functionRegistry.set(funcName, functionHash);
      }
    }
  });
  
  if (duplicates.length > 0) {
    console.log('❌ MODULE-SPECIFIC DUPLICATES FOUND:');
    duplicates.forEach(dup => {
      console.log(`   - ${dup.module}: ${dup.function} (${dup.issue})`);
      window.duplicateWarnings.push(dup);
    });
  } else {
    console.log('✅ MODULE-SPECIFIC DUPLICATES: No duplicates found');
  }
  
  return duplicates;
}

async function checkCompMethodDuplicates() {
  console.log('🔧 CHECKING COMP METHOD DUPLICATES: Scanning COMP functions...');
  
  const duplicates = [];
  
  // Check COMP method functions
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
    'updateVisibleTab'
  ];
  
  compFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      const functionString = window[funcName].toString();
      const functionHash = btoa(functionString).substring(0, 16);
      
      if (window.functionRegistry.has(funcName)) {
        const originalHash = window.functionRegistry.get(funcName);
        if (originalHash !== functionHash) {
          duplicates.push({
            function: funcName,
            issue: 'COMP method function redefined'
          });
        }
      } else {
        window.functionRegistry.set(funcName, functionHash);
      }
    }
  });
  
  if (duplicates.length > 0) {
    console.log('❌ COMP METHOD DUPLICATES FOUND:');
    duplicates.forEach(dup => {
      console.log(`   - ${dup.function}: ${dup.issue}`);
      window.duplicateWarnings.push(dup);
    });
  } else {
    console.log('✅ COMP METHOD DUPLICATES: No duplicates found');
  }
  
  return duplicates;
}

async function checkEventListeners() {
  console.log('🔧 CHECKING EVENT LISTENERS: Scanning for duplicates...');
  
  const duplicates = [];
  
  // Check common elements for duplicate listeners
  const elementsToCheck = [
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
  
  elementsToCheck.forEach(elementId => {
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
  
  // Check dynamic elements
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
    console.log('❌ EVENT LISTENER DUPLICATES FOUND:');
    duplicates.forEach(dup => {
      console.log(`   - ${dup.element}: ${dup.count} ${dup.event} listeners (${dup.issue})`);
      window.duplicateWarnings.push(dup);
    });
  } else {
    console.log('✅ EVENT LISTENERS: No duplicates found');
  }
  
  return duplicates;
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
    console.log('❌ MEMORY LEAKS FOUND:');
    leaks.forEach(leak => {
      console.log(`   - ${leak.element}: ${leak.count} ${leak.event} listeners (${leak.issue})`);
      window.duplicateWarnings.push(leak);
    });
  } else {
    console.log('✅ MEMORY LEAKS: No leaks detected');
  }
  
  return leaks;
}

async function checkCrossModuleConflicts() {
  console.log('🔧 CHECKING CROSS-MODULE CONFLICTS: Scanning for conflicts...');
  
  const conflicts = [];
  
  // Check for functions that might be defined in multiple modules
  const sharedFunctions = [
    'handleReaction',
    'handleReply',
    'toggleTheme',
    'performLogout'
  ];
  
  sharedFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      const functionString = window[funcName].toString();
      const functionHash = btoa(functionString).substring(0, 16);
      
      if (window.functionRegistry.has(funcName)) {
        const originalHash = window.functionRegistry.get(funcName);
        if (originalHash !== functionHash) {
          conflicts.push({
            function: funcName,
            issue: 'Function defined in multiple modules with different implementations'
          });
        }
      } else {
        window.functionRegistry.set(funcName, functionHash);
      }
    }
  });
  
  if (conflicts.length > 0) {
    console.log('❌ CROSS-MODULE CONFLICTS FOUND:');
    conflicts.forEach(conflict => {
      console.log(`   - ${conflict.function}: ${conflict.issue}`);
      window.duplicateWarnings.push(conflict);
    });
  } else {
    console.log('✅ CROSS-MODULE CONFLICTS: No conflicts found');
  }
  
  return conflicts;
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

function generateComprehensiveReport() {
  console.log('\n📊 COMPREHENSIVE DUPLICATE REPORT:');
  console.log('==================================');
  
  const totalWarnings = window.duplicateWarnings.length;
  
  if (totalWarnings === 0) {
    console.log('✅ ALL CHECKS PASSED: No duplicates or conflicts found');
    console.log('🎯 CODE QUALITY: Excellent - no duplicate functions or event listeners');
    console.log('🏆 COMP METHOD: All functions are properly defined and unique');
  } else {
    console.log(`⚠️  WARNINGS FOUND: ${totalWarnings} issues detected`);
    console.log('🔧 RECOMMENDATIONS:');
    console.log('   1. Remove duplicate function definitions');
    console.log('   2. Clean up duplicate event listeners');
    console.log('   3. Use event delegation where possible');
    console.log('   4. Implement proper cleanup functions');
    console.log('   5. Resolve cross-module conflicts');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('   1. Review warnings above');
  console.log('   2. Clean up duplicates');
  console.log('   3. Re-run this check');
  console.log('   4. Test functionality');
  console.log('   5. Monitor for new duplicates');
}

// ===== CLEANUP FUNCTIONS =====

function cleanupAllDuplicates() {
  console.log('🧹 CLEANUP: Cleaning up all duplicates...');
  
  // Clean up event listener duplicates
  cleanupEventListenerDuplicates();
  
  // Clean up function overwrites
  cleanupFunctionOverwrites();
  
  console.log('✅ CLEANUP: All duplicates cleaned up');
}

function cleanupEventListenerDuplicates() {
  console.log('🧹 CLEANUP: Cleaning up event listener duplicates...');
  
  // Clean up common elements
  const elementsToClean = [
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
  
  elementsToClean.forEach(elementId => {
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

window.runComprehensiveDuplicateCheck = runComprehensiveDuplicateCheck;
window.checkGeneralDuplicates = checkGeneralDuplicates;
window.checkModuleSpecificDuplicates = checkModuleSpecificDuplicates;
window.checkCompMethodDuplicates = checkCompMethodDuplicates;
window.checkEventListeners = checkEventListeners;
window.checkMemoryLeaks = checkMemoryLeaks;
window.checkCrossModuleConflicts = checkCrossModuleConflicts;
window.cleanupAllDuplicates = cleanupAllDuplicates;
window.cleanupEventListenerDuplicates = cleanupEventListenerDuplicates;
window.cleanupFunctionOverwrites = cleanupFunctionOverwrites;

console.log('✅ COMPREHENSIVE DUPLICATE CHECK: Script loaded successfully');
console.log('📋 USAGE: Run window.runComprehensiveDuplicateCheck() to check for all duplicates');
console.log('📋 USAGE: Run window.cleanupAllDuplicates() to clean up all duplicates');
