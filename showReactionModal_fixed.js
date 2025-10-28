// COMP METHOD: Show reaction modal for message
async function showReactionModal(messageId) {
  console.log('🔧 REACTIONS: COMP METHOD - Showing reaction modal for message:', messageId);
  
  const reactions = ['👍', '❓', '🔁', '🔗', '⚠️', '🙅'];
  
  // Find the reaction button for this message
  const reactionBtn = document.querySelector(`[data-message-id="${messageId}"].reaction-btn`);
  if (!reactionBtn) {
    console.error('❌ REACTIONS: Reaction button not found for message:', messageId);
    return;
  }
  
  // COMP METHOD: Check actual database state for user's current reaction
  console.log('🔍 REACTIONS: COMP METHOD - Checking database for current user reaction...');
  const userEmail = window.currentUser?.email;
  if (!userEmail) {
    console.warn('⚠️ REACTIONS: No authenticated user found');
    return;
  }
  
  try {
    // Fetch current reactions from database
    const data = await window.api.request(`/v1/reactions/${messageId}`);
    
    if (data.success && data.reactions) {
      // Find current user's reaction
      const userReaction = data.reactions.find(r => r.user_email === userEmail);
      
      if (userReaction) {
        // User has an existing reaction - remove it (toggle off)
        console.log('🔄 REACTION: COMP METHOD - User has existing reaction, removing it...', userReaction.emoji);
        
        const removeResult = await window.api.request('/v1/reactions', {
          method: 'POST',
          body: JSON.stringify({
            messageId: messageId,
            emoji: userReaction.emoji,
            userEmail: userEmail
          })
        });
        console.log('✅ REACTION: COMP METHOD - Reaction removed:', removeResult);
        
        // Update UI - reset to default (preserve count span)
        const countSpan = reactionBtn.querySelector('.icon-count');
        const existingCountText = countSpan ? countSpan.outerHTML : '';
        reactionBtn.innerHTML = '🔘' + existingCountText;
        reactionBtn.dataset.reaction = '';
        reactionBtn.dataset.selectedEmoji = '';
        
        // CRITICAL FIX: Reload reactions to get accurate count from database
        console.log('🔧 REACTIONS: COMP METHOD - Reloading reactions after removal for accurate count');
        window.loadMessageReactions(messageId, reactionBtn);
        
        return; // Don't show modal, just remove reaction
      }
    }
  } catch (error) {
    console.error('❌ REACTIONS: Error checking database state:', error);
    // Fall back to local state check
  }
  
  // COMP METHOD: No existing reaction - show modal to select one
  console.log('🔧 REACTIONS: COMP METHOD - No existing reaction, showing modal');
  
  // Create modal HTML
  const modalHTML = `
    <div class="reaction-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 99999; display: flex; align-items: center; justify-content: center;">
      <div class="reaction-options" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        ${reactions.map(reaction => `<button class="reaction-option" data-reaction="${reaction}" style="background: none; border: none; font-size: 24px; padding: 8px; cursor: pointer; border-radius: 4px; margin: 4px;">${reaction}</button>`).join('')}
      </div>
    </div>
  `;
  
  console.log('🔧 REACTIONS: COMP METHOD - Creating modal with reactions:', reactions);
  console.log('🔧 REACTIONS: COMP METHOD - Modal HTML:', modalHTML);
  
  // Position modal near the reaction button
  const buttonRect = reactionBtn.getBoundingClientRect();
  const modal = document.createElement('div');
  modal.innerHTML = modalHTML;
  const modalElement = modal.firstElementChild;
  
  // Position modal above the button
  modalElement.style.position = 'fixed';
  modalElement.style.top = `${buttonRect.top - 60}px`;
  modalElement.style.left = `${buttonRect.left}px`;
  modalElement.style.zIndex = '99999';
  
  console.log('🔧 REACTIONS: COMP METHOD - Button rect:', buttonRect);
  console.log('🔧 REACTIONS: COMP METHOD - Modal position:', modalElement.style.top, modalElement.style.left);
  
  document.body.appendChild(modalElement);
  
  console.log('🔧 REACTIONS: COMP METHOD - Modal added to DOM, checking visibility...');
  console.log('🔧 REACTIONS: COMP METHOD - Modal display:', modalElement.style.display);
  console.log('🔧 REACTIONS: COMP METHOD - Modal position:', modalElement.style.position);
  console.log('🔧 REACTIONS: COMP METHOD - Modal z-index:', modalElement.style.zIndex);
  
  // Force visibility
  const computedStyle = window.getComputedStyle(modalElement);
  console.log('🔧 REACTIONS: COMP METHOD - Modal computed style:', computedStyle.display);
  
  if (computedStyle.display === 'none') {
    modalElement.style.display = 'block';
    console.log('🔧 REACTIONS: COMP METHOD - Modal visibility forced');
  }
  
  // Add click handlers
  const reactionOptions = modalElement.querySelectorAll('.reaction-option');
  reactionOptions.forEach(option => {
    option.addEventListener('click', async (e) => {
      e.stopPropagation();
      const selectedReaction = e.target.dataset.reaction;
      console.log('🔧 REACTIONS: COMP METHOD - Selected reaction:', selectedReaction);
      
      // Remove modal
      modalElement.remove();
      
      // Get Chrome profile avatar URL
      let chromeAvatarUrl = null;
      try {
        if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getProfileUserInfo) {
          const profileInfo = await new Promise((resolve, reject) => {
            chrome.identity.getProfileUserInfo((profileInfo) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(profileInfo);
              }
            });
          });
          
          if (profileInfo && profileInfo.picture) {
            chromeAvatarUrl = profileInfo.picture;
            console.log('🔍 REACTIONS: Using Chrome profile avatar:', chromeAvatarUrl);
          }
        }
      } catch (error) {
        console.log('🔍 REACTIONS: Error getting Chrome profile info:', error);
      }
      
      console.log('🔧 REACTIONS: COMP METHOD - Calling API for reaction:', selectedReaction);
      
      const result = await window.api.request('/v1/reactions', {
        method: 'POST',
        body: JSON.stringify({
          messageId: messageId,
          emoji: selectedReaction,
          userEmail: userEmail,
          avatarUrl: chromeAvatarUrl // Include Chrome profile avatar URL
        })
      });
      console.log('✅ REACTIONS: COMP METHOD - API response:', result);
      console.log('🔍 REACTIONS: COMP METHOD - API response success:', result.success);
      console.log('🔍 REACTIONS: COMP METHOD - API response action:', result.action);
      console.log('🔍 REACTIONS: COMP METHOD - API response keys:', Object.keys(result));
      
      // Update UI based on API response
      if (result.success || result.action) {
        console.log('🔧 REACTIONS: COMP METHOD - Processing successful API response, action:', result.action);
        if (result.action === 'removed') {
          // Reaction was removed - reset UI (preserve count span)
          const countSpan = reactionBtn.querySelector('.icon-count');
          const existingCountText = countSpan ? countSpan.outerHTML : '';
          reactionBtn.innerHTML = '🔘' + existingCountText;
          reactionBtn.dataset.reaction = '';
          reactionBtn.dataset.selectedEmoji = '';
          
          // CRITICAL FIX: Reload reactions to get accurate count from database
          console.log('🔧 REACTIONS: COMP METHOD - Reloading reactions after removal for accurate count');
          window.loadMessageReactions(messageId, reactionBtn);
        } else if (result.action === 'added' || result.action === 'replaced') {
          // Reaction was added or replaced - update UI
          reactionBtn.textContent = selectedReaction;
          reactionBtn.dataset.reaction = selectedReaction;
          reactionBtn.dataset.selectedEmoji = selectedReaction;
          
          // CRITICAL FIX: Reload reactions to get accurate count from database
          console.log('🔧 REACTIONS: COMP METHOD - Reloading reactions after addition for accurate count');
          window.loadMessageReactions(messageId, reactionBtn);
        } else {
          console.log('⚠️ REACTIONS: COMP METHOD - Unknown action in API response:', result.action);
        }
      } else {
        console.log('❌ REACTIONS: COMP METHOD - API response not successful:', result);
      }
      
    });
  });
  
  // Close modal when clicking outside
  modalElement.addEventListener('click', (e) => {
    if (e.target === modalElement) {
      console.log('🔧 REACTIONS: COMP METHOD - Clicking outside modal, closing...');
      modalElement.remove();
    }
  });
  
  console.log('✅ REACTIONS: COMP METHOD - Reaction modal created and displayed');
}

