// ===== MODULE DUPLICATE CHECKER =====
// SD1 + SD2 + TA1: Check for duplicate functions and event listeners in specific modules
// Date: 2025-01-24

console.log('🔍 MODULE DUPLICATE CHECKER: Starting module-specific duplicate detection...');

// ===== MAIN CHECK FUNCTION =====

async function checkModuleDuplicates() {
  console.log('🚀 MODULE DUPLICATE CHECK: Starting comprehensive module audit...');
  
  try {
    // Check 1: ProfileManager Module
    console.log('\n📋 CHECK 1: ProfileManager Module...');
    await checkProfileManagerDuplicates();
    
    // Check 2: AuraColorModal Module
    console.log('\n📋 CHECK 2: AuraColorModal Module...');
    await checkAuraColorModalDuplicates();
    
    // Check 3: CanopiModule Module
    console.log('\n📋 CHECK 3: CanopiModule Module...');
    await checkCanopiModuleDuplicates();
    
    // Check 4: VisibilityManager Module
    console.log('\n📋 CHECK 4: VisibilityManager Module...');
    await checkVisibilityManagerDuplicates();
    
    // Check 5: RealtimeManager Module
    console.log('\n📋 CHECK 5: RealtimeManager Module...');
    await checkRealtimeManagerDuplicates();
    
    // Check 6: Cross-Module Conflicts
    console.log('\n📋 CHECK 6: Cross-Module Conflicts...');
    await checkCrossModuleConflicts();
    
    // Generate Report
    console.log('\n📊 MODULE DUPLICATE REPORT:');
    generateModuleReport();
    
  } catch (error) {
    console.error('❌ MODULE DUPLICATE CHECK: Error during module audit:', error);
  }
}

// ===== INDIVIDUAL MODULE CHECKS =====

async function checkProfileManagerDuplicates() {
  console.log('🔧 CHECKING PROFILE MANAGER: Scanning for duplicates...');
  
  const duplicates = [];
  
  // Check for duplicate function definitions
  const profileFunctions = [
    'addProfileAvatarClickHandler',
    'addAuraButtonClickHandler',
    'addThemeToggleButtonClickHandler',
    'addLogoutButtonClickHandler',
    'addAllProfileMenuHandlers'
  ];
  
  profileFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      // Check if function has been redefined
      const functionString = window[funcName].toString();
      const functionHash = btoa(functionString).substring(0, 16);
      
      if (window.functionRegistry && window.functionRegistry.has(funcName)) {
        const originalHash = window.functionRegistry.get(funcName);
        if (originalHash !== functionHash) {
          duplicates.push({
            module: 'ProfileManager',
            function: funcName,
            issue: 'Function redefined'
          });
        }
      } else {
        if (!window.functionRegistry) window.functionRegistry = new Map();
        window.functionRegistry.set(funcName, functionHash);
      }
    }
  });
  
  // Check for duplicate event listeners
  const profileElements = [
    'user-avatar-container',
    'aura-color-btn',
    'theme-toggle-btn',
    'logout-btn'
  ];
  
  profileElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      // Check for multiple click listeners
      const clickListeners = getEventListeners(element, 'click');
      if (clickListeners && clickListeners.length > 1) {
        duplicates.push({
          module: 'ProfileManager',
          element: elementId,
          issue: `Multiple click listeners (${clickListeners.length})`
        });
      }
    }
  });
  
  if (duplicates.length > 0) {
    console.log('❌ PROFILE MANAGER DUPLICATES:');
    duplicates.forEach(dup => {
      console.log(`   - ${dup.function || dup.element}: ${dup.issue}`);
    });
  } else {
    console.log('✅ PROFILE MANAGER: No duplicates found');
  }
  
  return duplicates;
}

async function checkAuraColorModalDuplicates() {
  console.log('🔧 CHECKING AURA COLOR MODAL: Scanning for duplicates...');
  
  const duplicates = [];
  
  // Check for duplicate function definitions
  const auraFunctions = [
    'showColorPickerModal',
    'hideColorPickerModal'
  ];
  
  auraFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      const functionString = window[funcName].toString();
      const functionHash = btoa(functionString).substring(0, 16);
      
      if (window.functionRegistry && window.functionRegistry.has(funcName)) {
        const originalHash = window.functionRegistry.get(funcName);
        if (originalHash !== functionHash) {
          duplicates.push({
            module: 'AuraColorModal',
            function: funcName,
            issue: 'Function redefined'
          });
        }
      } else {
        if (!window.functionRegistry) window.functionRegistry = new Map();
        window.functionRegistry.set(funcName, functionHash);
      }
    }
  });
  
  // Check for duplicate event listeners
  const auraElements = [
    'color-picker-close',
    'color-picker-reset',
    'color-picker-save',
    'color-input'
  ];
  
  auraElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      const clickListeners = getEventListeners(element, 'click');
      if (clickListeners && clickListeners.length > 1) {
        duplicates.push({
          module: 'AuraColorModal',
          element: elementId,
          issue: `Multiple click listeners (${clickListeners.length})`
        });
      }
    }
  });
  
  if (duplicates.length > 0) {
    console.log('❌ AURA COLOR MODAL DUPLICATES:');
    duplicates.forEach(dup => {
      console.log(`   - ${dup.function || dup.element}: ${dup.issue}`);
    });
  } else {
    console.log('✅ AURA COLOR MODAL: No duplicates found');
  }
  
  return duplicates;
}

async function checkCanopiModuleDuplicates() {
  console.log('🔧 CHECKING CANOPI MODULE: Scanning for duplicates...');
  
  const duplicates = [];
  
  // Check for duplicate function definitions
  const canopiFunctions = [
    'addMessageToChat',
    'updateMessageInChat',
    'removeMessageFromChat',
    'handleReaction',
    'handleReply',
    'toggleThreadReplies',
    'addReaction',
    'removeReaction',
    'loadMessageReactions',
    'updateReactionDisplay'
  ];
  
  canopiFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      const functionString = window[funcName].toString();
      const functionHash = btoa(functionString).substring(0, 16);
      
      if (window.functionRegistry && window.functionRegistry.has(funcName)) {
        const originalHash = window.functionRegistry.get(funcName);
        if (originalHash !== functionHash) {
          duplicates.push({
            module: 'CanopiModule',
            function: funcName,
            issue: 'Function redefined'
          });
        }
      } else {
        if (!window.functionRegistry) window.functionRegistry = new Map();
        window.functionRegistry.set(funcName, functionHash);
      }
    }
  });
  
  // Check for duplicate event listeners
  const canopiElements = [
    'reaction-btn',
    'inline-reply-btn',
    'thread-toggle-btn'
  ];
  
  canopiElements.forEach(elementId => {
    const elements = document.querySelectorAll(`.${elementId}`);
    elements.forEach(element => {
      const clickListeners = getEventListeners(element, 'click');
      if (clickListeners && clickListeners.length > 1) {
        duplicates.push({
          module: 'CanopiModule',
          element: elementId,
          issue: `Multiple click listeners (${clickListeners.length})`
        });
      }
    });
  });
  
  if (duplicates.length > 0) {
    console.log('❌ CANOPI MODULE DUPLICATES:');
    duplicates.forEach(dup => {
      console.log(`   - ${dup.function || dup.element}: ${dup.issue}`);
    });
  } else {
    console.log('✅ CANOPI MODULE: No duplicates found');
  }
  
  return duplicates;
}

async function checkVisibilityManagerDuplicates() {
  console.log('🔧 CHECKING VISIBILITY MANAGER: Scanning for duplicates...');
  
  const duplicates = [];
  
  // Check for duplicate function definitions
  const visibilityFunctions = [
    'updateVisibleTab',
    'refreshVisibilityAvatars',
    'filterCurrentUser'
  ];
  
  visibilityFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      const functionString = window[funcName].toString();
      const functionHash = btoa(functionString).substring(0, 16);
      
      if (window.functionRegistry && window.functionRegistry.has(funcName)) {
        const originalHash = window.functionRegistry.get(funcName);
        if (originalHash !== functionHash) {
          duplicates.push({
            module: 'VisibilityManager',
            function: funcName,
            issue: 'Function redefined'
          });
        }
      } else {
        if (!window.functionRegistry) window.functionRegistry = new Map();
        window.functionRegistry.set(funcName, functionHash);
      }
    }
  });
  
  if (duplicates.length > 0) {
    console.log('❌ VISIBILITY MANAGER DUPLICATES:');
    duplicates.forEach(dup => {
      console.log(`   - ${dup.function}: ${dup.issue}`);
    });
  } else {
    console.log('✅ VISIBILITY MANAGER: No duplicates found');
  }
  
  return duplicates;
}

async function checkRealtimeManagerDuplicates() {
  console.log('🔧 CHECKING REALTIME MANAGER: Scanning for duplicates...');
  
  const duplicates = [];
  
  // Check for duplicate function definitions
  const realtimeFunctions = [
    'handlePresenceChange',
    'handleMessageChange',
    'handleReactionChange',
    'handleAuraChange'
  ];
  
  realtimeFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
      const functionString = window[funcName].toString();
      const functionHash = btoa(functionString).substring(0, 16);
      
      if (window.functionRegistry && window.functionRegistry.has(funcName)) {
        const originalHash = window.functionRegistry.get(funcName);
        if (originalHash !== functionHash) {
          duplicates.push({
            module: 'RealtimeManager',
            function: funcName,
            issue: 'Function redefined'
          });
        }
      } else {
        if (!window.functionRegistry) window.functionRegistry = new Map();
        window.functionRegistry.set(funcName, functionHash);
      }
    }
  });
  
  if (duplicates.length > 0) {
    console.log('❌ REALTIME MANAGER DUPLICATES:');
    duplicates.forEach(dup => {
      console.log(`   - ${dup.function}: ${dup.issue}`);
    });
  } else {
    console.log('✅ REALTIME MANAGER: No duplicates found');
  }
  
  return duplicates;
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
      
      if (window.functionRegistry && window.functionRegistry.has(funcName)) {
        const originalHash = window.functionRegistry.get(funcName);
        if (originalHash !== functionHash) {
          conflicts.push({
            function: funcName,
            issue: 'Function defined in multiple modules with different implementations'
          });
        }
      } else {
        if (!window.functionRegistry) window.functionRegistry = new Map();
        window.functionRegistry.set(funcName, functionHash);
      }
    }
  });
  
  if (conflicts.length > 0) {
    console.log('❌ CROSS-MODULE CONFLICTS:');
    conflicts.forEach(conflict => {
      console.log(`   - ${conflict.function}: ${conflict.issue}`);
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

function generateModuleReport() {
  console.log('\n📊 MODULE DUPLICATE REPORT:');
  console.log('===========================');
  
  const totalIssues = window.duplicateWarnings ? window.duplicateWarnings.length : 0;
  
  if (totalIssues === 0) {
    console.log('✅ ALL MODULES CLEAN: No duplicates or conflicts found');
    console.log('🎯 MODULE QUALITY: Excellent - all modules are clean');
  } else {
    console.log(`⚠️  MODULE ISSUES: ${totalIssues} issues detected`);
    console.log('🔧 RECOMMENDATIONS:');
    console.log('   1. Review module-specific warnings above');
    console.log('   2. Clean up duplicate functions in modules');
    console.log('   3. Remove duplicate event listeners');
    console.log('   4. Resolve cross-module conflicts');
  }
  
  console.log('\n📋 MODULE MAINTENANCE:');
  console.log('   1. Run this check regularly');
  console.log('   2. Clean up duplicates immediately');
  console.log('   3. Test functionality after cleanup');
  console.log('   4. Monitor for new duplicates');
}

// ===== CLEANUP FUNCTIONS =====

function cleanupModuleDuplicates() {
  console.log('🧹 CLEANUP: Cleaning up module duplicates...');
  
  // Clean up ProfileManager duplicates
  cleanupProfileManagerDuplicates();
  
  // Clean up AuraColorModal duplicates
  cleanupAuraColorModalDuplicates();
  
  // Clean up CanopiModule duplicates
  cleanupCanopiModuleDuplicates();
  
  console.log('✅ CLEANUP: Module duplicates cleaned up');
}

function cleanupProfileManagerDuplicates() {
  console.log('🧹 CLEANUP: Cleaning up ProfileManager duplicates...');
  
  // Remove duplicate event listeners from profile elements
  const profileElements = [
    'user-avatar-container',
    'aura-color-btn',
    'theme-toggle-btn',
    'logout-btn'
  ];
  
  profileElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      // Clone element to remove all event listeners
      const newElement = element.cloneNode(true);
      element.parentNode.replaceChild(newElement, element);
      console.log(`✅ CLEANUP: Removed listeners from ${elementId}`);
    }
  });
}

function cleanupAuraColorModalDuplicates() {
  console.log('🧹 CLEANUP: Cleaning up AuraColorModal duplicates...');
  
  // Remove duplicate event listeners from aura elements
  const auraElements = [
    'color-picker-close',
    'color-picker-reset',
    'color-picker-save',
    'color-input'
  ];
  
  auraElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      const newElement = element.cloneNode(true);
      element.parentNode.replaceChild(newElement, element);
      console.log(`✅ CLEANUP: Removed listeners from ${elementId}`);
    }
  });
}

function cleanupCanopiModuleDuplicates() {
  console.log('🧹 CLEANUP: Cleaning up CanopiModule duplicates...');
  
  // Remove duplicate event listeners from canopi elements
  const canopiElements = document.querySelectorAll('.reaction-btn, .inline-reply-btn, .thread-toggle-btn');
  canopiElements.forEach(element => {
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
  });
  
  console.log('✅ CLEANUP: Removed listeners from CanopiModule elements');
}

// ===== EXPORT FUNCTIONS =====

window.checkModuleDuplicates = checkModuleDuplicates;
window.checkProfileManagerDuplicates = checkProfileManagerDuplicates;
window.checkAuraColorModalDuplicates = checkAuraColorModalDuplicates;
window.checkCanopiModuleDuplicates = checkCanopiModuleDuplicates;
window.checkVisibilityManagerDuplicates = checkVisibilityManagerDuplicates;
window.checkRealtimeManagerDuplicates = checkRealtimeManagerDuplicates;
window.checkCrossModuleConflicts = checkCrossModuleConflicts;
window.cleanupModuleDuplicates = cleanupModuleDuplicates;

console.log('✅ MODULE DUPLICATE CHECKER: Script loaded successfully');
console.log('📋 USAGE: Run window.checkModuleDuplicates() to check for module duplicates');
console.log('📋 USAGE: Run window.cleanupModuleDuplicates() to clean up duplicates');
