// DIAGNOSTIC AND FIX: Run this in console if reactions still don't display correctly
// ROOT CAUSE FIX: Add reaction count propagation diagnostic
window.diagnoseReactionDisplayIssue = async function(messageId) {
  console.log('🔍 === REACTION DISPLAY ISSUE DIAGNOSTIC ===');
  
  if (!messageId) {
    // Try to get first message on page
    const firstMsg = document.querySelector('[data-message-id]');
    if (firstMsg) {
      messageId = firstMsg.dataset.messageId;
      console.log('📌 Using first message ID:', messageId);
    } else {
      console.error('❌ No message ID provided and no messages found on page');
      return;
    }
  }
  
  // 1. Check current state
  const msgEl = document.querySelector(`[data-message-id="${messageId}"]`);
  if (!msgEl) {
    console.error('❌ Message not found:', messageId);
    return;
  }
  
  const btn = msgEl.querySelector('.reaction-btn');
  if (!btn) {
    console.error('❌ Reaction button not found');
    return;
  }
  
  const currentEmoji = btn.textContent.trim();
  const currentCount = btn.querySelector('.icon-count')?.textContent || '0';
  
  console.log('📊 Current UI State:');
  console.log('  Emoji:', currentEmoji);
  console.log('  Count:', currentCount);
  console.log('  dataset.reaction:', btn.dataset.reaction);
  console.log('  dataset.selectedEmoji:', btn.dataset.selectedEmoji);
  
  // 2. Fetch backend state
  console.log('📡 Fetching from backend...');
  try {
    const resp = await window.api.request(`/v1/reactions/${messageId}`);
    const reactions = resp?.reactions || [];
    const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
    
    const userReaction = reactions.find(r => {
      const rId = r.AppUser?.id || r.user_id;
      return rId && String(rId) === String(currentUserId);
    });
    
    console.log('📊 Backend State:');
    console.log('  Total reactions:', reactions.length);
    console.log('  User reaction:', userReaction ? userReaction.emoji : 'NONE');
    console.log('  All reactions:', reactions.map(r => ({ emoji: r.emoji, userId: r.user_id || r.AppUser?.id })));
    
    // 3. Expected vs Actual
    const expectedEmoji = userReaction ? userReaction.emoji : '🔘';
    const expectedCount = reactions.length;
    
    console.log('🎯 Expected vs Actual:');
    console.log('  Expected emoji:', expectedEmoji);
    console.log('  Actual emoji:', currentEmoji);
    console.log('  Match:', expectedEmoji === currentEmoji ? '✅' : '❌');
    console.log('  Expected count:', expectedCount);
    console.log('  Actual count:', currentCount);
    console.log('  Count match:', String(expectedCount) === currentCount ? '✅' : '❌');
    
    // 4. If mismatch, force fix
    if (expectedEmoji !== currentEmoji || String(expectedCount) !== currentCount) {
      console.log('🔧 Fixing display...');
      await window.loadMessageReactions(messageId, btn);
      
      // Check again after fix
      setTimeout(() => {
        const newEmoji = btn.textContent.trim();
        const newCount = btn.querySelector('.icon-count')?.textContent || '0';
        console.log('✅ After fix:');
        console.log('  Emoji:', newEmoji, newEmoji === expectedEmoji ? '✅' : '❌');
        console.log('  Count:', newCount, newCount === String(expectedCount) ? '✅' : '❌');
      }, 500);
    }
    
    return {
      messageId,
      expected: { emoji: expectedEmoji, count: expectedCount },
      actual: { emoji: currentEmoji, count: currentCount },
      userReaction: userReaction || null,
      allReactions: reactions
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { error };
  }
};

// Quick fix all reactions on page
window.fixAllReactionDisplays = async function() {
  console.log('🔧 Fixing all reaction displays on page...');
  const messages = document.querySelectorAll('[data-message-id]');
  console.log(`Found ${messages.length} messages`);
  
  for (const msgEl of messages) {
    const msgId = msgEl.dataset.messageId;
    const btn = msgEl.querySelector('.reaction-btn');
    if (btn && msgId) {
      await window.loadMessageReactions(msgId, btn);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between messages
    }
  }
  
  console.log('✅ All reaction displays refreshed');
};

// ROOT CAUSE FIX: Add function to check real-time event propagation
window.checkReactionPropagation = async function(messageId) {
  console.log('🔍 === REACTION PROPAGATION CHECK ===');
  console.log('Message ID:', messageId);
  
  const msgEl = document.querySelector(`[data-message-id="${messageId}"]`);
  if (!msgEl) {
    console.error('❌ Message not found');
    return;
  }
  
  const btn = msgEl.querySelector('.reaction-btn');
  if (!btn) {
    console.error('❌ Reaction button not found');
    return;
  }
  
  console.log('📊 Current state:');
  console.log('  Emoji:', btn.textContent.trim().replace(/\d+/, '').trim());
  console.log('  Count:', btn.querySelector('.icon-count')?.textContent || '0');
  
  console.log('📡 Checking backend state...');
  try {
    const resp = await window.api.request(`/v1/reactions/${messageId}`);
    const reactions = resp?.reactions || [];
    console.log('✅ Backend has', reactions.length, 'reactions');
    console.log('  Reactions:', reactions.map(r => ({ emoji: r.emoji, userId: r.user_id || r.AppUser?.id })));
    
    // Check if count matches
    const backendCount = reactions.length;
    const uiCount = parseInt(btn.querySelector('.icon-count')?.textContent) || 0;
    
    if (backendCount !== uiCount) {
      console.error('❌ COUNT MISMATCH: UI shows', uiCount, 'but backend has', backendCount);
      console.log('🔧 Reloading...');
      await window.loadMessageReactions(messageId, btn);
    } else {
      console.log('✅ Count matches:', backendCount);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

console.log('✅ Diagnostic functions loaded:');
console.log('  window.diagnoseReactionDisplayIssue(messageId) - Diagnose single message');
console.log('  window.fixAllReactionDisplays() - Fix all reactions on page');
console.log('  window.checkReactionPropagation(messageId) - Check count propagation');
console.log('💡 Example: window.diagnoseReactionDisplayIssue("43dbb2d7-669e-464b-a227-38afb063492d")');

