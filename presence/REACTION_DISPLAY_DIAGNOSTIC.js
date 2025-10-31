// REACTION DISPLAY DIAGNOSTIC: Run this in console to diagnose reaction display issues
window.diagnoseReactionIssues = async function(messageId) {
  console.log('🔍 === REACTION DISPLAY DIAGNOSTIC ===');
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
  
  const currentUser = window.currentUser;
  console.log('\n1️⃣ CURRENT USER:');
  console.log('   ID:', currentUser?.id);
  console.log('   user_id:', currentUser?.user_id);
  console.log('   Email:', currentUser?.email);
  console.log('   Name:', currentUser?.name);
  
  const uiEmoji = btn.textContent.trim().replace(/\d+/, '').trim();
  const uiCount = parseInt(btn.querySelector('.icon-count')?.textContent) || 0;
  
  console.log('\n2️⃣ UI STATE:');
  console.log('   Displayed Emoji:', uiEmoji);
  console.log('   Displayed Count:', uiCount);
  
  console.log('\n3️⃣ FETCHING BACKEND DATA...');
  try {
    const resp = await window.api.request(`/v1/reactions/${messageId}`);
    const reactions = resp?.reactions || [];
    
    console.log('\n4️⃣ BACKEND REACTIONS:', reactions.length);
    reactions.forEach((r, idx) => {
      const rUserId = r.AppUser?.id || r.user_id;
      const matches = currentUser?.id && rUserId ? String(rUserId) === String(currentUser.id) : false;
      console.log(`   Reaction ${idx + 1}:`, {
        emoji: r.emoji,
        user_id: rUserId,
        user_email: r.AppUser?.email,
        matches_current_user: matches ? '✅ YES' : '❌ NO'
      });
    });
    
    // Find user reaction
    const userReaction = reactions.find(r => {
      const rUserId = r.AppUser?.id || r.user_id;
      return currentUser?.id && rUserId && String(rUserId) === String(currentUser.id);
    });
    
    // Count by emoji
    const counts = {};
    reactions.forEach(r => {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    });
    
    console.log('\n5️⃣ ANALYSIS:');
    console.log('   Total reactions:', reactions.length);
    console.log('   Counts by emoji:', counts);
    console.log('   Current user reaction:', userReaction ? userReaction.emoji : 'NONE');
    
    // Determine expected emoji
    let expectedEmoji = '🔘';
    if (userReaction) {
      expectedEmoji = userReaction.emoji;
      console.log('   ✅ Expected: User\'s own reaction', expectedEmoji);
    } else if (reactions.length > 0) {
      // Most popular
      const mostPopular = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      expectedEmoji = mostPopular ? mostPopular[0] : '🔘';
      console.log('   ✅ Expected: Most popular from others', expectedEmoji, `(count: ${mostPopular?.[1]})`);
    } else {
      console.log('   ✅ Expected: Blank (no reactions)');
    }
    
    console.log('\n6️⃣ EXPECTED VS ACTUAL:');
    console.log('   Expected emoji:', expectedEmoji);
    console.log('   Actual emoji:', uiEmoji);
    console.log('   Match:', expectedEmoji === uiEmoji ? '✅' : '❌');
    console.log('   Expected count:', reactions.length);
    console.log('   Actual count:', uiCount);
    console.log('   Count match:', reactions.length === uiCount ? '✅' : '❌');
    
    // Check for user ID mismatch
    if (reactions.length > 0 && !userReaction) {
      console.log('\n7️⃣ USER ID MISMATCH CHECK:');
      reactions.forEach(r => {
        const rUserId = r.AppUser?.id || r.user_id;
        if (currentUser?.id && rUserId) {
          const rIdStr = String(rUserId);
          const currentIdStr = String(currentUser.id);
          console.log(`   Reaction user ID: "${rIdStr}" (length: ${rIdStr.length}, type: ${typeof rUserId})`);
          console.log(`   Current user ID: "${currentIdStr}" (length: ${currentIdStr.length}, type: ${typeof currentUser.id})`);
          console.log(`   Match: ${rIdStr === currentIdStr ? '✅' : '❌'}`);
        }
      });
    }
    
    return {
      messageId,
      currentUser: { id: currentUser?.id, email: currentUser?.email },
      backendReactions: reactions,
      uiState: { emoji: uiEmoji, count: uiCount },
      expected: { emoji: expectedEmoji, count: reactions.length },
      userReaction: userReaction || null,
      issues: {
        emojiMismatch: expectedEmoji !== uiEmoji,
        countMismatch: reactions.length !== uiCount,
        userReactionFound: !!userReaction
      }
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { error };
  }
};

console.log('✅ Diagnostic function loaded:');
console.log('  window.diagnoseReactionIssues(messageId)');
console.log('💡 Example: window.diagnoseReactionIssues("12c72d07-ec8e-4e66-a372-0f975a71baa2")');


