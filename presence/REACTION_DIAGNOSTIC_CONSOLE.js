// DIAGNOSTIC: Run this in console to diagnose reaction display issues
window.diagnoseReactionDisplay = async function(messageId) {
  console.log('🔍 === REACTION DISPLAY DIAGNOSTIC ===');
  console.log('Message ID:', messageId);
  
  // 1. Get message element
  const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
  if (!messageEl) {
    console.error('❌ Message element not found');
    return;
  }
  console.log('✅ Message element found');
  
  // 2. Get reaction button
  const reactionBtn = messageEl.querySelector('.reaction-btn');
  if (!reactionBtn) {
    console.error('❌ Reaction button not found');
    return;
  }
  console.log('✅ Reaction button found');
  
  // 3. Current UI state
  const currentEmoji = reactionBtn.textContent.trim().replace(/\d+/, '').trim();
  const currentCount = reactionBtn.querySelector('.icon-count')?.textContent || '0';
  const datasetReaction = reactionBtn.dataset.reaction || '';
  const datasetSelectedEmoji = reactionBtn.dataset.selectedEmoji || '';
  const datasetLastUpdated = reactionBtn.dataset.lastUpdated || '';
  
  console.log('📊 Current UI State:');
  console.log('  Display emoji:', currentEmoji);
  console.log('  Count:', currentCount);
  console.log('  dataset.reaction:', datasetReaction);
  console.log('  dataset.selectedEmoji:', datasetSelectedEmoji);
  console.log('  dataset.lastUpdated:', datasetLastUpdated, datasetLastUpdated ? `(${Math.round((Date.now() - parseInt(datasetLastUpdated)) / 1000)}s ago)` : '');
  
  // 4. Current user info
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  const currentUserEmail = window.currentUser?.email;
  console.log('👤 Current User:');
  console.log('  ID:', currentUserId);
  console.log('  Email:', currentUserEmail);
  
  // 5. Fetch reactions from backend
  console.log('📡 Fetching reactions from backend...');
  try {
    const response = await window.api.request(`/v1/reactions/${messageId}`, { method: 'GET' });
    const reactions = response?.reactions || [];
    console.log('✅ Backend reactions:', reactions);
    
    // 6. Find user reaction
    const userReaction = reactions.find(r => {
      const rUserId = r.AppUser?.id || r.user_id;
      return rUserId && String(rUserId) === String(currentUserId);
    });
    
    console.log('🎯 User Reaction Analysis:');
    console.log('  User reaction found:', !!userReaction);
    if (userReaction) {
      console.log('  User reaction emoji:', userReaction.emoji);
      console.log('  User reaction ID:', userReaction.id);
    } else {
      console.log('  User reaction: NONE');
    }
    
    // 7. Count all reactions
    const reactionCounts = {};
    reactions.forEach(r => {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
    });
    const totalCount = reactions.length;
    
    console.log('📊 Reaction Stats:');
    console.log('  Total reactions:', totalCount);
    console.log('  Reactions by emoji:', reactionCounts);
    if (Object.keys(reactionCounts).length > 0) {
      const mostPopular = Object.keys(reactionCounts).reduce((a, b) => 
        reactionCounts[a] > reactionCounts[b] ? a : b
      );
      console.log('  Most popular emoji:', mostPopular, `(${reactionCounts[mostPopular]}x)`);
    }
    
    // 8. Expected vs Actual
    console.log('🔍 Expected vs Actual:');
    const expectedEmoji = userReaction ? userReaction.emoji : '🔘';
    const expectedCount = totalCount;
    console.log('  Expected emoji:', expectedEmoji);
    console.log('  Actual emoji:', currentEmoji);
    console.log('  Match:', currentEmoji === expectedEmoji ? '✅' : '❌');
    console.log('  Expected count:', expectedCount);
    console.log('  Actual count:', currentCount);
    console.log('  Count match:', currentCount === String(expectedCount) ? '✅' : '❌');
    
    // 9. Issues found
    const issues = [];
    if (!userReaction && currentEmoji !== '🔘' && currentEmoji !== '') {
      issues.push('User has no reaction but UI shows emoji instead of blank');
    }
    if (userReaction && currentEmoji !== userReaction.emoji) {
      issues.push('User reaction exists but UI shows different emoji');
    }
    if (currentCount !== String(totalCount)) {
      issues.push(`Count mismatch: UI shows ${currentCount} but backend has ${totalCount}`);
    }
    
    if (issues.length > 0) {
      console.error('🚨 ISSUES FOUND:');
      issues.forEach((issue, idx) => {
        console.error(`  ${idx + 1}. ${issue}`);
      });
    } else {
      console.log('✅ No issues found - display matches backend state');
    }
    
    return {
      messageId,
      currentUserId,
      userReaction: userReaction || null,
      totalReactions: totalCount,
      reactionCounts,
      uiState: {
        emoji: currentEmoji,
        count: currentCount,
        dataset: {
          reaction: datasetReaction,
          selectedEmoji: datasetSelectedEmoji,
          lastUpdated: datasetLastUpdated
        }
      },
      issues
    };
    
  } catch (error) {
    console.error('❌ Error fetching reactions:', error);
    return { error };
  }
};

console.log('✅ Diagnostic function loaded: window.diagnoseReactionDisplay(messageId)');
console.log('💡 Example: window.diagnoseReactionDisplay("43dbb2d7-669e-464b-a227-38afb063492d")');

