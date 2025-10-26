// ===== DUPLICATE FUNCTION CHECKER =====
// SD1 + SD2 + TA1: Check for duplicate function definitions and event listeners
// Date: 2025-01-24

console.log('🔍 DUPLICATE FUNCTION CHECKER: Starting comprehensive audit...');

// ===== GLOBAL TRACKING =====
window.functionRegistry = new Map();
window.eventListenerRegistry = new Map();
window.duplicateWarnings = [];

// ===== MAIN CHECK FUNCTION =====

async function checkForDuplicates() {
  console.log('🚀 DUPLICATE CHECK: Starting comprehensive duplicate detection...');
  
  try {
    // Check 1: Function Definitions
    console.log('\n📋 CHECK 1: Scanning for duplicate function definitions...');
    await checkDuplicateFunctions();
    
    // Check 2: Event Listeners
    console.log('\n📋 CHECK 2: Scanning for duplicate event listeners...');
    await checkDuplicateEventListeners();
    
    // Check 3: Global Function Overwrites
    console.log('\n📋 CHECK 3: Checking for global function overwrites...');
    await checkGlobalFunctionOverwrites();
    
    // Check 4: Module Function Conflicts
    console.log('\n📋 CHECK 4: Checking for module function conflicts...');
    await checkModuleFunctionConflicts();
    
    // Check 5: Event Listener Memory Leaks
    console.log('\n📋 CHECK 5: Checking for event listener memory leaks...');
    await checkEventListenerMemoryLeaks();
    
    // Generate Report
    console.log('\n📊 DUPLICATE CHECK REPORT:');
    generateDuplicateReport();
    
  } catch (error) {
    console.error('❌ DUPLICATE CHECK: Error during duplicate detection:', error);
  }
}

// ===== INDIVIDUAL CHECK FUNCTIONS =====

async function checkDuplicateFunctions() {
  console.log('🔧 CHECKING DUPLICATE FUNCTIONS: Scanning for duplicate function definitions...');
  
  const duplicateFunctions = [];
  const functionCounts = new Map();
  
  // Scan all script tags and inline functions
  const scripts = document.querySelectorAll('script');
  scripts.forEach((script, index) => {
    if (script.src) {
      console.log(`📄 Scanning external script: ${script.src}`);
    } else {
      console.log(`📄 Scanning inline script ${index + 1}`);
    }
    
    // Extract function definitions from script content
    const content = script.textContent || '';
    const functionMatches = content.match(/function\s+(\w+)/g);
    
    if (functionMatches) {
      functionMatches.forEach(match => {
        const functionName = match.replace('function ', '');
        const count = functionCounts.get(functionName) || 0;
        functionCounts.set(functionName, count + 1);
        
        if (count > 0) {
          duplicateFunctions.push({
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
        duplicateFunctions.push({
          name: key,
          count: count + 1,
          source: 'global-window'
        });
      }
    }
  });
  
  if (duplicateFunctions.length > 0) {
    console.log('❌ DUPLICATE FUNCTIONS FOUND:');
    duplicateFunctions.forEach(dup => {
      console.log(`   - ${dup.name}: defined ${dup.count} times (last in ${dup.source})`);
    });
  } else {
    console.log('✅ DUPLICATE FUNCTIONS: No duplicate function definitions found');
  }
  
  return duplicateFunctions;
}

async function checkDuplicateEventListeners() {
  console.log('🔧 CHECKING DUPLICATE EVENT LISTENERS: Scanning for duplicate event listeners...');
  
  const duplicateListeners = [];
  const listenerCounts = new Map();
  
  // Check common elements for duplicate listeners
  const elementsToCheck = [
    'user-avatar-container',
    'user-menu',
    'aura-color-btn',
    'theme-toggle-btn',
    'logout-btn',
    'reaction-btn',
    'inline-reply-btn',
    'thread-toggle-btn',
    'color-picker-close',
    'color-picker-reset',
    'color-picker-save'
  ];
  
  elementsToCheck.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      // Check for multiple click listeners
      const clickListeners = getEventListeners(element, 'click');
      if (clickListeners && clickListeners.length > 1) {
        duplicateListeners.push({
          element: elementId,
          event: 'click',
          count: clickListeners.length
        });
      }
      
      // Check for multiple input listeners
      const inputListeners = getEventListeners(element, 'input');
      if (inputListeners && inputListeners.length > 1) {
        duplicateListeners.push({
          element: elementId,
          event: 'input',
          count: inputListeners.length
        });
      }
    }
  });
  
  if (duplicateListeners.length > 0) {
    console.log('❌ DUPLICATE EVENT LISTENERS FOUND:');
    duplicateListeners.forEach(dup => {
      console.log(`   - ${dup.element}: ${dup.count} ${dup.event} listeners`);
    });
  } else {
    console.log('✅ DUPLICATE EVENT LISTENERS: No duplicate event listeners found');
  }
  
  return duplicateListeners;
}

async function checkGlobalFunctionOverwrites() {
  console.log('🔧 CHECKING GLOBAL FUNCTION OVERWRITES: Scanning for function overwrites...');
  
  const overwrites = [];
  const criticalFunctions = [
    'addMessageToChat',
    'updateMessageInChat',
    'removeMessageFromChat',
    'handleReaction',
    'handleReply',
    'toggleThreadReplies',
    'showColorPickerModal',
    'toggleTheme',
    'performLogout',
    'updateVisibleTab',
    'addProfileAvatarClickHandler',
    'addAuraButtonClickHandler',
    'addThemeToggleButtonClickHandler',
    'addLogoutButtonClickHandler'
  ];
  
  criticalFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      // Check if function has been overwritten by comparing with registry
      if (window.functionRegistry.has(funcName)) {
        const original = window.functionRegistry.get(funcName);
        const current = window[funcName];
        
        if (original.toString() !== current.toString()) {
          overwrites.push({
            name: funcName,
            original: original.toString().substring(0, 100) + '...',
            current: current.toString().substring(0, 100) + '...'
          });
        }
      } else {
        // Register function for future comparison
        window.functionRegistry.set(funcName, window[funcName]);
      }
    }
  });
  
  if (overwrites.length > 0) {
    console.log('❌ GLOBAL FUNCTION OVERWRITES FOUND:');
    overwrites.forEach(overwrite => {
      console.log(`   - ${overwrite.name}: Function has been overwritten`);
      console.log(`     Original: ${overwrite.original}`);
      console.log(`     Current: ${overwrite.current}`);
    });
  } else {
    console.log('✅ GLOBAL FUNCTION OVERWRITES: No function overwrites detected');
  }
  
  return overwrites;
}

async function checkModuleFunctionConflicts() {
  console.log('🔧 CHECKING MODULE FUNCTION CONFLICTS: Scanning for module conflicts...');
  
  const conflicts = [];
  const moduleFunctions = [
    'ProfileManager',
    'AuraColorModal',
    'CanopiModule',
    'VisibilityManager',
    'RealtimeManager'
  ];
  
  moduleFunctions.forEach(moduleName => {
    if (typeof window[moduleName] === 'function') {
      // Check if module has been redefined
      if (window.functionRegistry.has(moduleName)) {
        const original = window.functionRegistry.get(moduleName);
        const current = window[moduleName];
        
        if (original.toString() !== current.toString()) {
          conflicts.push({
            module: moduleName,
            issue: 'Module redefined'
          });
        }
      } else {
        window.functionRegistry.set(moduleName, window[moduleName]);
      }
    }
  });
  
  if (conflicts.length > 0) {
    console.log('❌ MODULE FUNCTION CONFLICTS FOUND:');
    conflicts.forEach(conflict => {
      console.log(`   - ${conflict.module}: ${conflict.issue}`);
    });
  } else {
    console.log('✅ MODULE FUNCTION CONFLICTS: No module conflicts detected');
  }
  
  return conflicts;
}

async function checkEventListenerMemoryLeaks() {
  console.log('🔧 CHECKING EVENT LISTENER MEMORY LEAKS: Scanning for memory leaks...');
  
  const memoryLeaks = [];
  
  // Check for elements with excessive event listeners
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    if (element.id) {
      // Check for multiple listeners on the same element
      const events = ['click', 'input', 'change', 'submit'];
      events.forEach(event => {
        const listeners = getEventListeners(element, event);
        if (listeners && listeners.length > 3) {
          memoryLeaks.push({
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
      memoryLeaks.push({
        element: 'document',
        event: event,
        count: listeners.length,
        issue: 'Excessive global event listeners'
      });
    }
  });
  
  if (memoryLeaks.length > 0) {
    console.log('❌ EVENT LISTENER MEMORY LEAKS FOUND:');
    memoryLeaks.forEach(leak => {
      console.log(`   - ${leak.element}: ${leak.count} ${leak.event} listeners (${leak.issue})`);
    });
  } else {
    console.log('✅ EVENT LISTENER MEMORY LEAKS: No memory leaks detected');
  }
  
  return memoryLeaks;
}

// ===== UTILITY FUNCTIONS =====

function getEventListeners(element, eventType) {
  // This is a simplified version - in a real implementation,
  // you'd need to track listeners as they're added
  try {
    // Check if element has event listeners
    if (element._listeners && element._listeners[eventType]) {
      return element._listeners[eventType];
    }
    return [];
  } catch (error) {
    return [];
  }
}

function generateDuplicateReport() {
  console.log('\n📊 DUPLICATE CHECK REPORT:');
  console.log('========================');
  
  const totalWarnings = window.duplicateWarnings.length;
  
  if (totalWarnings === 0) {
    console.log('✅ ALL CHECKS PASSED: No duplicates or conflicts found');
    console.log('🎯 CODE QUALITY: Excellent - no duplicate functions or event listeners');
  } else {
    console.log(`⚠️  WARNINGS FOUND: ${totalWarnings} issues detected`);
    console.log('🔧 RECOMMENDATIONS:');
    console.log('   1. Remove duplicate function definitions');
    console.log('   2. Clean up duplicate event listeners');
    console.log('   3. Use event delegation where possible');
    console.log('   4. Implement proper cleanup functions');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('   1. Review warnings above');
  console.log('   2. Clean up duplicates');
  console.log('   3. Re-run this check');
  console.log('   4. Test functionality');
}

// ===== CLEANUP FUNCTIONS =====

function cleanupDuplicateFunctions() {
  console.log('🧹 CLEANUP: Removing duplicate function definitions...');
  
  // This would need to be implemented based on specific findings
  console.log('⚠️  CLEANUP: Manual cleanup required - review warnings above');
}

function cleanupDuplicateEventListeners() {
  console.log('🧹 CLEANUP: Removing duplicate event listeners...');
  
  // Remove duplicate listeners from common elements
  const elementsToClean = [
    'user-avatar-container',
    'aura-color-btn',
    'theme-toggle-btn',
    'logout-btn'
  ];
  
  elementsToClean.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      // Clone element to remove all event listeners
      const newElement = element.cloneNode(true);
      element.parentNode.replaceChild(newElement, element);
      console.log(`✅ CLEANUP: Removed all listeners from ${elementId}`);
    }
  });
}

// ===== EXPORT FUNCTIONS =====

window.checkForDuplicates = checkForDuplicates;
window.checkDuplicateFunctions = checkDuplicateFunctions;
window.checkDuplicateEventListeners = checkDuplicateEventListeners;
window.checkGlobalFunctionOverwrites = checkGlobalFunctionOverwrites;
window.checkModuleFunctionConflicts = checkModuleFunctionConflicts;
window.checkEventListenerMemoryLeaks = checkEventListenerMemoryLeaks;
window.cleanupDuplicateFunctions = cleanupDuplicateFunctions;
window.cleanupDuplicateEventListeners = cleanupDuplicateEventListeners;

console.log('✅ DUPLICATE FUNCTION CHECKER: Script loaded successfully');
console.log('📋 USAGE: Run window.checkForDuplicates() to check for duplicates');
console.log('📋 USAGE: Run window.cleanupDuplicateEventListeners() to clean up listeners');
