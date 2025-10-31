// ============================================================
// REACTION DISPLAY FIX - CONSOLE DIAGNOSTIC CODE
// ============================================================
// Run this code block in the browser console if reactions are still not working correctly.
// This will help diagnose user ID mismatches and reaction display issues.

(async function() {
  console.log('🔍 === COMPREHENSIVE REACTION DIAGNOSTIC ===\n');
  
  // 1. Check current user identity
  console.log('1️⃣ Current User Identity:');
  console.log('   window.currentUser.id:', window.currentUser?.id);
  console.log('   window.currentUser.user_id:', window.currentUser?.user_id);
  console.log('   window.currentUser.email:', window.currentUser?.email);
  console.log('   window.currentUser.name:', window.currentUser?.name);
  console.log('   Full object:', window.currentUser);
  
  // 2. Check all messages and their reactions
  console.log('\n2️⃣ All Messages on Page:');
  const messages = document.querySelectorAll('[data-message-id]');
  console.log('   Total messages:', messages.length);
  
  for (const msgEl of messages) {
    const msgId = msgEl.dataset.messageId;
    const msgAuthor = msgEl.dataset.authorId;
    const btn = msgEl.querySelector('.reaction-btn');
    
    console.log(`\n   Message: ${msgId}`);
    console.log(`     Author ID: ${msgAuthor}`);
    
    if (btn) {
      const uiEmoji = btn.textContent.trim().replace(/\d+/, '').trim();
      const uiCount = parseInt(btn.querySelector('.icon-count')?.textContent) || 0;
      console.log(`     UI shows: ${uiEmoji} ${uiCount > 0 ? uiCount : ''}`);
      
      // Fetch backend state
      try {
        const resp = await window.api.request(`/v1/reactions/${msgId}`);
        const reactions = resp?.reactions || [];
        const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
        
        console.log(`     Backend has ${reactions.length} reactions:`);
        reactions.forEach(r => {
          const rUserId = r.AppUser?.id || r.user_id;
          const matches = rUserId && String(rUserId) === String(currentUserId);
          console.log(`       ${r.emoji} by ${r.AppUser?.email || rUserId} ${matches ? '(YOU ✅)' : ''}`);
        });
        
        const userReaction = reactions.find(r => {
          const rId = r.AppUser?.id || r.user_id;
          return rId && String(rId) === String(currentUserId);
        });
        const expectedEmoji = userReaction ? userReaction.emoji : '🔘';
        const expectedCount = reactions.length;
        
        if (uiEmoji !== expectedEmoji || uiCount !== expectedCount) {
          console.error(`     ❌ MISMATCH: Expected ${expectedEmoji} ${expectedCount}, got ${uiEmoji} ${uiCount}`);
        } else {
          console.log(`     ✅ Match: ${expectedEmoji} ${expectedCount}`);
        }
      } catch (error) {
        console.error(`     ❌ Error fetching reactions:`, error);
      }
    }
  }
  
  // 3. Check for user ID conflicts
  console.log('\n3️⃣ User ID Conflict Check:');
  const storedKeys = Object.keys(sessionStorage).filter(k => k.startsWith('lastUserEmail_'));
  if (storedKeys.length > 0) {
    console.log('   Checking sessionStorage for ID conflicts...');
    storedKeys.forEach(key => {
      const userId = key.replace('lastUserEmail_', '');
      const email = sessionStorage.getItem(key);
      console.log(`   User ID ${userId}: ${email}`);
    });
  } else {
    console.log('   No stored user ID conflicts found');
  }
  
  // 4. Test reaction API
  console.log('\n4️⃣ Testing Reaction API:');
  try {
    const testResp = await window.api.request('/v1/reactions/test', { method: 'GET', allow404: true });
    console.log('   API accessible:', true);
  } catch (error) {
    console.error('   API error:', error);
  }
  
  // 5. Force refresh all reactions
  console.log('\n5️⃣ Force Refreshing All Reactions...');
  if (typeof window.refreshAllReactionDisplays === 'function') {
    await window.refreshAllReactionDisplays();
    console.log('   ✅ All reactions refreshed');
  } else {
    console.error('   ❌ window.refreshAllReactionDisplays not available');
  }
  
  console.log('\n=== DIAGNOSTIC COMPLETE ===');
  console.log('💡 Use window.diagnoseReactionDisplayIssue(messageId) for single message deep dive');
  
  return {
    currentUser: window.currentUser,
    messageCount: messages.length,
    diagnosticComplete: true
  };
})();

