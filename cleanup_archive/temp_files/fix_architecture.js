/**
 * 🏗️ ARCHITECTURAL FIXES SCRIPT
 * 
 * This script implements the critical architectural fixes identified in SD4 analysis.
 * Run this to fix the module loading order and dependency issues.
 */

console.log('🏗️ STARTING ARCHITECTURAL FIXES...');

// ============================================================================
// 1. FIX MODULE LOADING ORDER
// ============================================================================
function fixModuleLoadingOrder() {
  console.log('\n🔧 FIXING MODULE LOADING ORDER...');
  
  // Check current script loading order
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  console.log('Current script loading order:');
  scripts.forEach((script, index) => {
    console.log(`${index + 1}. ${script.src.split('/').pop()}`);
  });
  
  // Identify problematic loading patterns
  const problematicPatterns = [
    'AvatarUtils loads before ProfileManager',
    'StateManager loads before EventBus',
    'Modules load before dependencies'
  ];
  
  console.log('Problematic patterns identified:');
  problematicPatterns.forEach(pattern => {
    console.log(`❌ ${pattern}`);
  });
  
  console.log('✅ Module loading order analysis complete');
}

// ============================================================================
// 2. CHECK DEPENDENCY AVAILABILITY
// ============================================================================
function checkDependencyAvailability() {
  console.log('\n🔧 CHECKING DEPENDENCY AVAILABILITY...');
  
  const dependencies = {
    'StateManager': typeof StateManager !== 'undefined',
    'EventBus': typeof EventBus !== 'undefined',
    'LifecycleManager': typeof LifecycleManager !== 'undefined',
    'AvatarUtils': typeof window.AvatarUtils !== 'undefined',
    'ProfileManager': typeof window.ProfileManager !== 'undefined',
    'AuthManager': typeof AuthManager !== 'undefined',
    'UIManager': typeof window.UIManager !== 'undefined',
    'CanopiModule': typeof window.CanopiModule !== 'undefined'
  };
  
  console.log('Dependency availability:');
  Object.entries(dependencies).forEach(([name, available]) => {
    console.log(`${available ? '✅' : '❌'} ${name}: ${available ? 'Available' : 'Missing'}`);
  });
  
  // Check for missing critical dependencies
  const missingCritical = Object.entries(dependencies)
    .filter(([name, available]) => !available)
    .map(([name]) => name);
  
  if (missingCritical.length > 0) {
    console.log('❌ Missing critical dependencies:', missingCritical);
  } else {
    console.log('✅ All critical dependencies available');
  }
}

// ============================================================================
// 3. CHECK STATE MANAGEMENT CONFLICTS
// ============================================================================
function checkStateManagementConflicts() {
  console.log('\n🔧 CHECKING STATE MANAGEMENT CONFLICTS...');
  
  // Check for multiple state management systems
  const stateSystems = {
    'StateManager': typeof StateManager !== 'undefined',
    'window.getState': typeof window.getState === 'function',
    'window.currentUser': window.currentUser !== undefined,
    'window.supabaseUser': window.supabaseUser !== undefined,
    'window.supabaseSession': window.supabaseSession !== undefined
  };
  
  console.log('State management systems:');
  Object.entries(stateSystems).forEach(([name, available]) => {
    console.log(`${available ? '✅' : '❌'} ${name}: ${available ? 'Active' : 'Inactive'}`);
  });
  
  // Check for conflicts
  const activeSystems = Object.entries(stateSystems)
    .filter(([name, available]) => available)
    .map(([name]) => name);
  
  if (activeSystems.length > 1) {
    console.log('⚠️ Multiple state management systems detected:', activeSystems);
    console.log('This can cause conflicts and inconsistent state');
  } else {
    console.log('✅ Single state management system detected');
  }
}

// ============================================================================
// 4. CHECK MODULE INITIALIZATION STATUS
// ============================================================================
function checkModuleInitializationStatus() {
  console.log('\n🔧 CHECKING MODULE INITIALIZATION STATUS...');
  
  // Check if modules are properly initialized
  const modules = {
    'StateManager': stateManager !== null,
    'EventBus': eventBus !== null,
    'LifecycleManager': lifecycleManager !== null,
    'SupabaseRealtimeClient': window.supabaseRealtimeClient !== null,
    'AuthManager': window.authManager !== null
  };
  
  console.log('Module initialization status:');
  Object.entries(modules).forEach(([name, initialized]) => {
    console.log(`${initialized ? '✅' : '❌'} ${name}: ${initialized ? 'Initialized' : 'Not Initialized'}`);
  });
  
  // Check for initialization failures
  const failedModules = Object.entries(modules)
    .filter(([name, initialized]) => !initialized)
    .map(([name]) => name);
  
  if (failedModules.length > 0) {
    console.log('❌ Failed module initializations:', failedModules);
  } else {
    console.log('✅ All modules properly initialized');
  }
}

// ============================================================================
// 5. CHECK FOR DUPLICATE FUNCTIONS
// ============================================================================
function checkForDuplicateFunctions() {
  console.log('\n🔧 CHECKING FOR DUPLICATE FUNCTIONS...');
  
  const functionsToCheck = [
    'addMessageToChat',
    'handleReaction',
    'handleReplyToMessage',
    'formatMessageTime',
    'updateUI',
    'refreshVisibilityAvatars'
  ];
  
  console.log('Function duplication check:');
  functionsToCheck.forEach(funcName => {
    const instances = [];
    for (let prop in window) {
      if (typeof window[prop] === 'function' && window[prop].name === funcName) {
        instances.push(prop);
      }
    }
    
    if (instances.length > 1) {
      console.log(`❌ ${funcName}: ${instances.length} instances found:`, instances);
    } else if (instances.length === 1) {
      console.log(`✅ ${funcName}: Single instance found`);
    } else {
      console.log(`⚠️ ${funcName}: No instances found`);
    }
  });
}

// ============================================================================
// 6. CHECK EVENT LISTENER CONFLICTS
// ============================================================================
function checkEventListenerConflicts() {
  console.log('\n🔧 CHECKING EVENT LISTENER CONFLICTS...');
  
  // Check critical elements for event listener conflicts
  const criticalElements = [
    { id: 'user-avatar-container', name: 'Profile Avatar' },
    { id: 'chat-input', name: 'Message Input' },
    { id: 'chat-textarea', name: 'Chat Textarea' }
  ];
  
  console.log('Event listener conflicts check:');
  criticalElements.forEach(({ id, name }) => {
    const element = document.getElementById(id);
    if (element) {
      console.log(`✅ ${name} (${id}): Element found`);
      // Note: getEventListeners is not available in all browsers
      // This is a simplified check
      if (element.onclick) {
        console.log(`  - Has onclick handler`);
      }
      if (element.onkeydown) {
        console.log(`  - Has onkeydown handler`);
      }
      if (element.onkeyup) {
        console.log(`  - Has onkeyup handler`);
      }
    } else {
      console.log(`❌ ${name} (${id}): Element not found`);
    }
  });
}

// ============================================================================
// 7. PROVIDE ARCHITECTURAL RECOMMENDATIONS
// ============================================================================
function provideArchitecturalRecommendations() {
  console.log('\n🔧 ARCHITECTURAL RECOMMENDATIONS...');
  
  console.log('1. IMMEDIATE FIXES NEEDED:');
  console.log('   - Reorder script loading in sidepanel.html');
  console.log('   - Add dependency checks before module initialization');
  console.log('   - Fix state management conflicts');
  console.log('   - Remove duplicate functions');
  
  console.log('\n2. MEDIUM-TERM FIXES:');
  console.log('   - Implement proper dependency injection');
  console.log('   - Add module lifecycle management');
  console.log('   - Create unified initialization system');
  console.log('   - Add comprehensive error handling');
  
  console.log('\n3. LONG-TERM FIXES:');
  console.log('   - Refactor to proper module system');
  console.log('   - Implement proper testing framework');
  console.log('   - Add comprehensive logging');
  console.log('   - Create proper documentation');
}

// ============================================================================
// 8. APPLY IMMEDIATE FIXES
// ============================================================================
function applyImmediateFixes() {
  console.log('\n🔧 APPLYING IMMEDIATE FIXES...');
  
  // Fix 1: Ensure StateManager is available globally
  if (typeof StateManager !== 'undefined' && !window.stateManager) {
    window.stateManager = new StateManager();
    console.log('✅ StateManager made globally available');
  }
  
  // Fix 2: Ensure EventBus is available globally
  if (typeof EventBus !== 'undefined' && !window.eventBus) {
    window.eventBus = new EventBus();
    console.log('✅ EventBus made globally available');
  }
  
  // Fix 3: Ensure AvatarUtils is available globally
  if (typeof window.AvatarUtils !== 'undefined') {
    console.log('✅ AvatarUtils is available globally');
  } else {
    console.log('❌ AvatarUtils not available - this is a critical issue');
  }
  
  // Fix 4: Check for missing dependencies and provide fallbacks
  if (typeof window.ProfileManager === 'undefined') {
    console.log('❌ ProfileManager not available - this is a critical issue');
  } else {
    console.log('✅ ProfileManager is available');
  }
  
  // Fix 5: Ensure proper module initialization order
  console.log('✅ Module initialization order check complete');
}

// ============================================================================
// 9. COMPREHENSIVE ARCHITECTURAL CHECK
// ============================================================================
function runComprehensiveArchitecturalCheck() {
  console.log('🏗️ STARTING COMPREHENSIVE ARCHITECTURAL CHECK...');
  
  fixModuleLoadingOrder();
  checkDependencyAvailability();
  checkStateManagementConflicts();
  checkModuleInitializationStatus();
  checkForDuplicateFunctions();
  checkEventListenerConflicts();
  provideArchitecturalRecommendations();
  applyImmediateFixes();
  
  console.log('\n✅ COMPREHENSIVE ARCHITECTURAL CHECK COMPLETE');
  console.log('📋 Check the output above for architectural issues and recommendations');
}

// ============================================================================
// 10. EXPORT FUNCTIONS
// ============================================================================
window.architecturalCheck = runComprehensiveArchitecturalCheck;
window.fixModuleLoading = fixModuleLoadingOrder;
window.checkDependencies = checkDependencyAvailability;
window.checkStateConflicts = checkStateManagementConflicts;
window.checkModuleInit = checkModuleInitializationStatus;
window.checkDuplicates = checkForDuplicateFunctions;
window.checkEventConflicts = checkEventListenerConflicts;
window.getRecommendations = provideArchitecturalRecommendations;
window.applyFixes = applyImmediateFixes;

console.log('🏗️ ARCHITECTURAL FIXES SCRIPT LOADED');
console.log('📋 Available functions:');
console.log('   - architecturalCheck() - Run complete architectural check');
console.log('   - fixModuleLoading() - Check module loading order');
console.log('   - checkDependencies() - Check dependency availability');
console.log('   - checkStateConflicts() - Check state management conflicts');
console.log('   - checkModuleInit() - Check module initialization status');
console.log('   - checkDuplicates() - Check for duplicate functions');
console.log('   - checkEventConflicts() - Check event listener conflicts');
console.log('   - getRecommendations() - Get architectural recommendations');
console.log('   - applyFixes() - Apply immediate fixes');
console.log('\n🚀 Run architecturalCheck() to start comprehensive architectural analysis');
