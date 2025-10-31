// Test function availability in CanopiModule.js
// Run this in the browser console to test

console.log('🧪 TESTING FUNCTION AVAILABILITY');
console.log('================================');

// Test 1: Check if functions exist in window
const functionsToTest = [
  'window.loadMessageReactions',
  'window.showReactionModal', 
  'window.addReactionToMessage',
  'window.updateReactionInMessage',
  'window.removeReactionFromMessage',
  'window.handleReactionChange',
  'window.refreshAllReactionDisplays'
];

console.log('\n📋 Test 1: Window Function Availability');
functionsToTest.forEach(funcName => {
  const func = eval(funcName);
  if (typeof func === 'function') {
    console.log(`✅ ${funcName}: Available (${func.name})`);
  } else {
    console.log(`❌ ${funcName}: Missing (${typeof func})`);
  }
});

// Test 2: Check if functions exist in global scope
console.log('\n📋 Test 2: Global Scope Function Availability');
const globalFunctions = [
  'loadMessageReactions',
  'showReactionModal', 
  'addReactionToMessage',
  'updateReactionInMessage',
  'removeReactionFromMessage',
  'handleReactionChange',
  'refreshAllReactionDisplays'
];

globalFunctions.forEach(funcName => {
  if (typeof window[funcName] === 'function') {
    console.log(`✅ ${funcName}: Available in window`);
  } else {
    console.log(`❌ ${funcName}: Missing in window`);
  }
});

// Test 3: Check if CanopiModule is loaded
console.log('\n📋 Test 3: Module Loading Status');
console.log('CanopiModule loaded message:', document.querySelector('script[src*="CanopiModule.js"]') ? 'Found' : 'Not found');

// Test 4: Try to call a function directly
console.log('\n📋 Test 4: Direct Function Call Test');
try {
  if (typeof window.refreshAllReactionDisplays === 'function') {
    console.log('✅ refreshAllReactionDisplays is callable');
    // Don't actually call it to avoid side effects
  } else {
    console.log('❌ refreshAllReactionDisplays is not callable');
  }
} catch (error) {
  console.error('❌ Error calling function:', error);
}

// Test 5: Check window object properties
console.log('\n📋 Test 5: Window Object Properties');
const windowProps = Object.keys(window).filter(key => 
  key.includes('Reaction') || key.includes('reaction') || key.includes('Message')
);
console.log('Window properties containing "reaction" or "message":', windowProps);

console.log('\n🎯 FUNCTION AVAILABILITY TEST COMPLETE');
console.log('=====================================');

