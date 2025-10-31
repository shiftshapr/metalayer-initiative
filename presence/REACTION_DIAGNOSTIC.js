// ROOT CAUSE DIAGNOSTIC: Run this in console to diagnose reaction ID mismatch
window.diagnoseReactionIssue = async function(messageId) {
  console.log('🔍 ROOT CAUSE DIAGNOSTIC: Starting reaction ID analysis...');
  
  // 1. Check frontend user ID
  const frontendUserId = window.currentUser?.id || window.currentUser?.user_id;
  console.log('1️⃣ Frontend user ID:', frontendUserId);
  
  // 2. Check if frontend has real AppUser UUID (valid UUID format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const hasRealUuid = window.currentUser?.id && uuidRegex.test(window.currentUser.id);
  console.log('2️⃣ Has real AppUser UUID:', hasRealUuid ? window.currentUser.id : 'NOT SET (will use email)');
  
  // 3. Fetch reactions for message
  console.log('3️⃣ Fetching reactions for message:', messageId);
  try {
    const response = await window.api.request(`/v1/reactions/${messageId}`, { method: 'GET' });
    const reactions = response || [];
    console.log('4️⃣ Reactions from API:', reactions.length);
    
    // 4. Check all user IDs in reactions
    const reactionUserIds = reactions.map(r => ({
      reaction_id: r.id,
      user_id: r.user_id,
      AppUser_id: r.AppUser?.id,
      emoji: r.emoji
    }));
    console.log('5️⃣ All reaction user IDs:', reactionUserIds);
    
    // 5. Check for match (use frontend ID which should be real AppUser UUID now)
    const matchingUserId = frontendUserId;
    const userReaction = reactions.find(r => {
      const rUserId = r.user_id || r.AppUser?.id;
      return rUserId && String(rUserId) === String(matchingUserId);
    });
    
    if (userReaction) {
      console.log('✅ MATCH FOUND: User reaction exists:', userReaction);
    } else {
      console.error('❌ NO MATCH: User reaction not found!');
      console.error('❌ Frontend ID:', frontendUserId);
      // Removed - no longer using backendUserId
      console.error('❌ Matching with:', matchingUserId);
      console.error('❌ All reaction user IDs:', reactionUserIds.map(r => r.user_id || r.AppUser_id));
      
      // Check if any reaction IDs match frontend ID
      const frontendMatch = reactions.find(r => {
        const rUserId = r.user_id || r.AppUser?.id;
        return rUserId && String(rUserId) === String(frontendUserId);
      });
      
      if (frontendMatch) {
        console.log('⚠️ Frontend ID matches a reaction:', frontendMatch);
      } else {
        console.error('🚨 ROOT CAUSE: Frontend ID does not match ANY reaction user_id!');
        console.error('🚨 This means backend used a DIFFERENT UUID when creating reactions');
        console.error('🚨 Check backend authenticateUser middleware - it may be falling back to email lookup');
      }
    }
    
    // 6. Suggest fix
    if (!userReaction) {
      if (!hasRealUuid) {
        console.log('💡 ISSUE: Frontend does not have real AppUser UUID');
        console.log('💡 Check if window.currentUser.id is set correctly after first API call');
      } else {
        console.log('💡 ISSUE: UUID mismatch between frontend and reaction user_ids');
        console.log('💡 Frontend ID:', frontendUserId);
        console.log('💡 Reaction IDs:', allReactionUserIds);
      }
    }
    
    return { frontendUserId, hasRealUuid, reactions, userReaction };
  } catch (error) {
    console.error('❌ Error fetching reactions:', error);
    return { error };
  }
};

console.log('✅ Diagnostic function loaded: window.diagnoseReactionIssue(messageId)');
console.log('📝 Usage: window.diagnoseReactionIssue("your-message-id")');

