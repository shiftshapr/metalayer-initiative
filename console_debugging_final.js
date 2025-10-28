// COMP METHOD: Console Debugging Code Block
// Run this in the browser console if fixes don't work

console.log('🔧 COMP METHOD: Console Debugging Started');
console.log('==========================================');

// Debug 1: Check Function Availability
console.log('\n🔍 DEBUG 1: Function Availability Check');
const debugFunctions = [
  'loadMessageReactions',
  'showReactionModal', 
  'addReactionToMessage',
  'updateReactionInMessage',
  'removeReactionFromMessage',
  'handleReactionChange',
  'refreshAllReactionDisplays',
  'refreshAllMessageAvatars',
  'updateReactionDisplay'
];

debugFunctions.forEach(funcName => {
  const func = window[funcName];
  console.log(`${funcName}: ${typeof func} ${func ? '(defined)' : '(undefined)'}`);
  if (func && typeof func === 'function') {
    console.log(`  - Function length: ${func.length} parameters`);
    console.log(`  - Function toString preview: ${func.toString().substring(0, 100)}...`);
  }
});

// Debug 2: Check Global Variables
console.log('\n🔍 DEBUG 2: Global Variables Check');
console.log('window.AVATAR_FALLBACK_COLOR:', window.AVATAR_FALLBACK_COLOR);
console.log('window.currentUser:', window.currentUser);
console.log('window.api:', window.api);
console.log('window.supabase:', window.supabase);

// Debug 3: Check DOM Elements
console.log('\n🔍 DEBUG 3: DOM Elements Check');
console.log('Reaction buttons found:', document.querySelectorAll('.reaction-btn').length);
console.log('Chat messages container:', document.querySelector('.chat-messages') ? 'Found' : 'Missing');
console.log('Messages in chat:', document.querySelectorAll('.message').length);

// Debug 4: Check Module Loading Order
console.log('\n🔍 DEBUG 4: Module Loading Order');
const scripts = Array.from(document.scripts).map(script => script.src || script.textContent.substring(0, 50));
console.log('Loaded scripts:', scripts);

// Debug 5: Check for Errors
console.log('\n🔍 DEBUG 5: Error Check');
console.log('Console errors in last 10 seconds:');
// This will show recent errors if any

// Debug 6: Test API Connection
console.log('\n🔍 DEBUG 6: API Connection Test');
async function debugAPIConnection() {
  try {
    console.log('Testing API connection...');
    const result = await window.api.request('/v1/reactions/test');
    console.log('✅ API Connection successful:', result);
  } catch (error) {
    console.log('❌ API Connection failed:', error.message);
    console.log('Error details:', error);
  }
}

debugAPIConnection();

// Debug 7: Check Real-time Subscription
console.log('\n🔍 DEBUG 7: Real-time Subscription Check');
if (window.supabase) {
  console.log('✅ Supabase client available');
  console.log('Supabase URL:', window.supabase.supabaseUrl);
  console.log('Supabase Key:', window.supabase.supabaseKey ? 'Present' : 'Missing');
} else {
  console.log('❌ Supabase client not available');
}

// Debug 8: Check Reaction Modal
console.log('\n🔍 DEBUG 8: Reaction Modal Check');
const modal = document.querySelector('.reaction-modal');
if (modal) {
  console.log('✅ Reaction modal found in DOM');
  console.log('Modal style:', window.getComputedStyle(modal));
} else {
  console.log('❌ Reaction modal not found in DOM');
}

// Debug 9: Check Message Data
console.log('\n🔍 DEBUG 9: Message Data Check');
const messages = document.querySelectorAll('.message');
messages.forEach((msg, index) => {
  console.log(`Message ${index + 1}:`);
  console.log('  - ID:', msg.dataset.messageId);
  console.log('  - Author:', msg.querySelector('.message-author')?.textContent);
  console.log('  - Reaction Button:', msg.querySelector('.reaction-btn') ? 'Yes' : 'No');
  console.log('  - Count Span:', msg.querySelector('.icon-count') ? 'Yes' : 'No');
});

// Debug 10: Force Function Re-assignment
console.log('\n🔍 DEBUG 10: Force Function Re-assignment');
try {
  // Try to re-assign functions if they're missing
  if (!window.loadMessageReactions) {
    console.log('Attempting to re-assign loadMessageReactions...');
    // This would need to be done by reloading the module
  }
  
  if (!window.handleReactionChange) {
    console.log('Attempting to re-assign handleReactionChange...');
    // This would need to be done by reloading the module
  }
  
  console.log('Function re-assignment attempted');
} catch (error) {
  console.log('❌ Error during function re-assignment:', error);
}

console.log('\n🔧 COMP METHOD: Debugging completed');
console.log('==========================================');
console.log('If issues persist, check the individual debug sections above');
console.log('and ensure all modules are loading in the correct order.');