// ===== CONSOLE DEBUGGING CODE BLOCK =====
// Run this in the browser console if fixes don't work

console.log('🔧 CONSOLE DEBUGGING: === AVATAR AND REACTION SYSTEM DIAGNOSIS ===');

// 1. Check Avatar Fallback Colors
console.log('🔍 1. Checking avatar fallback colors...');
const messageElements = document.querySelectorAll('[data-message-id]');
messageElements.forEach((element, index) => {
  const avatarElement = element.querySelector('.message-avatar');
  if (avatarElement) {
    const avatarImg = avatarElement.querySelector('img');
    if (avatarImg) {
      const src = avatarImg.src;
      const isGeneric = src.includes('default-user') || src.includes('gravatar');
      const hasWhiteBackground = avatarImg.style.backgroundColor === (window.AVATAR_FALLBACK_COLOR || '#ffffff') || 
                                avatarImg.closest('.avatar-container')?.style.backgroundColor === (window.AVATAR_FALLBACK_COLOR || '#ffffff');
      console.log(`🔍 Message ${index + 1} avatar: ${isGeneric ? 'Generic' : 'Real'} - ${src}`);
      console.log(`   White background: ${hasWhiteBackground}`);
    }
  }
});

// 2. Check Reaction Counts
console.log('🔍 2. Checking reaction counts...');
const reactionButtons = document.querySelectorAll('.reaction-btn');
reactionButtons.forEach((btn, index) => {
  const messageId = btn.dataset.messageId;
  const currentReaction = btn.dataset.reaction;
  const countSpan = btn.querySelector('.icon-count');
  const count = countSpan ? countSpan.textContent : 'none';
  console.log(`🔍 Button ${index + 1}: Message ${messageId}, Reaction: ${currentReaction || 'none'}, Count: ${count}`);
});

// 3. Check Function Availability
console.log('🔍 3. Checking function availability...');
const requiredFunctions = [
  'window.refreshAllMessageAvatars',
  'window.handleReactionChange',
  'window.loadMessageReactions',
  'window.showReactionModal',
  'window.refreshAllReactionDisplays',
  'window.getLatestAuraColorFromPresence'
];

requiredFunctions.forEach(funcName => {
  const isAvailable = typeof window[funcName] === 'function';
  console.log(`${isAvailable ? '✅' : '❌'} ${funcName}: ${isAvailable ? 'Available' : 'Missing'}`);
});

// 4. Check Visibility Data
console.log('🔍 4. Checking visibility data...');
if (window.currentVisibilityDataUnfiltered) {
  console.log('✅ Visibility data available:', window.currentVisibilityDataUnfiltered.active?.length || 0, 'users');
  window.currentVisibilityDataUnfiltered.active?.forEach((user, index) => {
    console.log(`   User ${index + 1}: ${user.email} - auraColor: ${user.auraColor || 'null'}`);
  });
} else {
  console.log('❌ Visibility data: Not available');
}

// 5. Check Current User
console.log('🔍 5. Checking current user...');
if (window.currentUser) {
  console.log('✅ Current user:', window.currentUser.email);
  console.log('   Aura color:', window.currentUser.auraColor || 'null');
  console.log('   Avatar URL:', window.currentUser.avatarUrl || 'null');
} else {
  console.log('❌ Current user: Not available');
}

// 6. Test Avatar Refresh
console.log('🔍 6. Testing avatar refresh...');
if (typeof window.refreshAllMessageAvatars === 'function') {
  console.log('✅ Avatar refresh function available, calling...');
  window.refreshAllMessageAvatars().then(() => {
    console.log('✅ Avatar refresh completed');
  }).catch(error => {
    console.error('❌ Avatar refresh failed:', error);
  });
} else {
  console.log('❌ Avatar refresh function not available');
}

// 7. Test Reaction Refresh
console.log('🔍 7. Testing reaction refresh...');
if (typeof window.refreshAllReactionDisplays === 'function') {
  console.log('✅ Reaction refresh function available, calling...');
  window.refreshAllReactionDisplays().then(() => {
    console.log('✅ Reaction refresh completed');
  }).catch(error => {
    console.error('❌ Reaction refresh failed:', error);
  });
} else {
  console.log('❌ Reaction refresh function not available');
}

// 8. Check Real-time Subscriptions
console.log('🔍 8. Checking real-time subscriptions...');
if (window.supabaseRealtimeClient) {
  console.log('✅ Supabase real-time client available');
  console.log('   Status:', window.supabaseRealtimeClient.isInitialized ? 'Initialized' : 'Not initialized');
} else {
  console.log('❌ Supabase real-time client not available');
}

// 9. Force Refresh All Avatars
console.log('🔍 9. Force refreshing all avatars...');
if (typeof window.refreshAllMessageAvatars === 'function') {
  setTimeout(() => {
    window.refreshAllMessageAvatars();
    console.log('✅ Force refresh completed');
  }, 1000);
}

// 10. Test Reaction Modal
console.log('🔍 10. Testing reaction modal...');
const firstReactionBtn = document.querySelector('.reaction-btn');
if (firstReactionBtn) {
  console.log('✅ First reaction button found, testing modal...');
  console.log('   Click the reaction button to test modal functionality');
  console.log('   Message ID:', firstReactionBtn.dataset.messageId);
} else {
  console.log('❌ No reaction buttons found');
}

console.log('🔧 CONSOLE DEBUGGING: === END DIAGNOSIS ===');
console.log('🔧 If issues persist, check the console logs above for specific problems');
console.log('🔧 Run testComprehensiveAvatarReactionFixes() for full test suite');
