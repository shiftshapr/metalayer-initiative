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
  // --- 1. Check Global Function Availability ---
  console.log('\n--- 1. Global Function Availability ---');
  const functionsToCheck = [
    'window.loadMessageReactions',
    'window.showReactionModal',
    'window.addReactionToMessage',
    'window.updateReactionInMessage',
    'window.removeReactionFromMessage',
    'window.handleReactionChange',
    'window.refreshAllReactionDisplays',
    'window.refreshAllMessageAvatars',
    'window.AvatarUtils',
    'window.AvatarUtils.createUnifiedAvatar',
    'window.getLatestAuraColorFromPresence',
    'window.getCurrentUserEmail',
    'window.getCurrentUserAvatarBgColor',
    'window.AVATAR_FALLBACK_COLOR'
  ];
  
  functionsToCheck.forEach(funcName => {
    try {
      const func = eval(funcName);
      console.log(`✅ ${funcName}: ${typeof func === 'function' || typeof func === 'object' || typeof func === 'string' ? 'Available' : 'Missing'}`);
    } catch (e) {
      console.log(`❌ ${funcName}: Missing (Error: ${e.message})`);
    }
  });

  // --- 2. Check Avatar Fallback Color Logic ---
  console.log('\n--- 2. Avatar Fallback Color Logic ---');
  try {
    const expectedFallback = window.AVATAR_FALLBACK_COLOR || '#ffffff';
    console.log(`🔍 Expected fallback color: ${expectedFallback}`);
    
    if (expectedFallback === '#ffffff') {
      console.log('✅ Avatar Fallback: Constant is correctly set to white');
    } else {
      console.error(`❌ Avatar Fallback: Constant is not white: ${expectedFallback}`);
    }

    const testUserEmail = 'debuguser@example.com';
    const testUserName = 'Debug User';
    const testUser = {
      email: testUserEmail,
      name: testUserName,
      auraColor: null // Simulate null auraColor
    };

    if (window.AvatarUtils && window.AvatarUtils.createUnifiedAvatar) {
      const avatarResult = window.AvatarUtils.createUnifiedAvatar(testUser, {
        size: 24,
        showAura: true,
        showStatus: true
      });

      if (avatarResult && avatarResult.avatarHtml) {
        const dummyDiv = document.createElement('div');
        dummyDiv.innerHTML = avatarResult.avatarHtml;
        const auraRing = dummyDiv.querySelector('.aura-ring');
        if (auraRing) {
          const computedStyle = window.getComputedStyle(auraRing);
          const backgroundColor = computedStyle.backgroundColor;
          const rgb = backgroundColor.match(/\d+/g);
          const hex = rgb ? '#' + ('0' + parseInt(rgb[0], 10).toString(16)).slice(-2) +
            ('0' + parseInt(rgb[1], 10).toString(16)).slice(-2) +
            ('0' + parseInt(rgb[2], 10).toString(16)).slice(-2) : '';

          console.log(`🔍 Debug User Aura Color (expected #ffffff): ${hex}`);
          if (hex === '#ffffff') {
            console.log('✅ Avatar Fallback: Aura ring is white when auraColor is null');
          } else {
            console.error(`❌ Avatar Fallback: Aura ring is ${hex}, expected #ffffff`);
          }
        } else {
          console.error('❌ Avatar Fallback: Aura ring element not found in generated HTML');
        }
      } else {
        console.error('❌ Avatar Fallback: createUnifiedAvatar did not return expected HTML');
      }
    } else {
      console.error('❌ Avatar Fallback: AvatarUtils.createUnifiedAvatar is not available');
    }
  } catch (error) {
    console.error('❌ Error during Avatar Fallback Color Logic check:', error);
  }

  // --- 3. Check Avatar Consistency (Profile, Message, Visibility) ---
  console.log('\n--- 3. Avatar Consistency Check ---');
  try {
    console.log('🔧 Attempting to refresh all avatars...');
    if (window.refreshVisibilityAvatars) {
      await window.refreshVisibilityAvatars();
      console.log('✅ Visibility avatars refreshed');
    }
    if (window.refreshAllMessageAvatars) {
      await window.refreshAllMessageAvatars();
      console.log('✅ Message avatars refreshed');
    }
    if (window.updateUI && window.currentUser) {
      await window.updateUI(window.currentUser); // Refresh profile avatar
      console.log('✅ Profile avatar refreshed');
    }

    // Give some time for DOM updates
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUserEmail = window.currentUser?.email;
    if (currentUserEmail) {
      const profileAvatarImg = document.querySelector('#user-avatar-container img');
      const profileAvatarUrl = profileAvatarImg ? profileAvatarImg.src : 'N/A';
      console.log(`🔍 Profile Avatar URL for ${currentUserEmail}: ${profileAvatarUrl}`);

      const messageAvatarImg = document.querySelector(`.message[data-author-email="${currentUserEmail}"] .message-avatar img`);
      const messageAvatarUrl = messageAvatarImg ? messageAvatarImg.src : 'N/A';
      console.log(`🔍 Message Avatar URL for ${currentUserEmail}: ${messageAvatarUrl}`);

      const visibilityAvatarImg = document.querySelector(`.visibility-list-item[data-user-email="${currentUserEmail}"] .avatar img`);
      const visibilityAvatarUrl = visibilityAvatarImg ? visibilityAvatarImg.src : 'N/A';
      console.log(`🔍 Visibility Avatar URL for ${currentUserEmail}: ${visibilityAvatarUrl}`);

      let consistent = true;
      if (profileAvatarUrl !== 'N/A' && messageAvatarUrl !== 'N/A' && profileAvatarUrl !== messageAvatarUrl) {
        console.error('❌ Consistency Check: Profile and Message avatars do NOT match');
        consistent = false;
      }
      if (profileAvatarUrl !== 'N/A' && visibilityAvatarUrl !== 'N/A' && profileAvatarUrl !== visibilityAvatarUrl) {
        console.error('❌ Consistency Check: Profile and Visibility avatars do NOT match');
        consistent = false;
      }
      if (consistent) {
        console.log('✅ Consistency Check: All avatars for current user appear consistent');
      }
    } else {
      console.warn('⚠️ Consistency Check: Current user email not found. Cannot fully verify avatar consistency.');
    }
  } catch (error) {
    console.error('❌ Error during Avatar Consistency Check:', error);
  }

  // --- 4. Check Reaction Propagation ---
  console.log('\n--- 4. Reaction Propagation Check ---');
  try {
    const messageElements = document.querySelectorAll('[data-message-id]');
    if (messageElements.length > 0) {
      const firstMessageId = messageElements[0].dataset.messageId;
      const reactionBtn = document.querySelector(`[data-message-id="${firstMessageId}"] .reaction-btn`);

      if (reactionBtn && window.loadMessageReactions && window.handleReactionChange) {
        console.log(`🔧 Checking reactions for message ID: ${firstMessageId}`);
        await window.loadMessageReactions(firstMessageId, reactionBtn);
        await new Promise(resolve => setTimeout(resolve, 200)); // Give UI time to update

        const initialCountSpan = reactionBtn.querySelector('.icon-count');
        const initialCount = initialCountSpan ? parseInt(initialCountSpan.textContent) : 0;
        console.log(`🔍 Initial UI reaction count: ${initialCount}`);

        // Simulate an external reaction update
        const mockPayload = {
          eventType: 'INSERT',
          new: {
            message_id: firstMessageId,
            emoji: '👍',
            user_email: 'simulated@example.com',
            created_at: new Date().toISOString()
          }
        };
        console.log('🔧 Simulating real-time INSERT event...');
        window.handleReactionChange(mockPayload);

        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for propagation

        const updatedCountSpan = reactionBtn.querySelector('.icon-count');
        const updatedCount = updatedCountSpan ? parseInt(updatedCountSpan.textContent) : 0;
        console.log(`🔍 Updated UI reaction count after INSERT: ${updatedCount}`);

        if (updatedCount > initialCount) {
          console.log('✅ Reaction Propagation: Count increased after simulated INSERT');
        } else {
          console.error('❌ Reaction Propagation: Count did NOT increase after simulated INSERT');
        }

        // Simulate an external reaction removal
        const mockDeletePayload = {
          eventType: 'DELETE',
          old: {
            message_id: firstMessageId,
            emoji: '👍',
            user_email: 'simulated@example.com',
            created_at: new Date().toISOString()
          }
        };
        console.log('🔧 Simulating real-time DELETE event...');
        window.handleReactionChange(mockDeletePayload);

        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for propagation

        const finalCountSpan = reactionBtn.querySelector('.icon-count');
        const finalCount = finalCountSpan ? parseInt(finalCountSpan.textContent) : 0;
        console.log(`🔍 Final UI reaction count after DELETE: ${finalCount}`);

        if (finalCount < updatedCount) {
          console.log('✅ Reaction Propagation: Count decreased after simulated DELETE');
        } else {
          console.error('❌ Reaction Propagation: Count did NOT decrease after simulated DELETE');
        }

      } else {
        console.warn('⚠️ Reaction Propagation: Cannot test, missing elements or functions');
      }
    } else {
      console.warn('⚠️ Reaction Propagation: No messages found in DOM');
    }
  } catch (error) {
    console.error('❌ Error during Reaction Propagation Check:', error);
  }

  // --- 5. Check Hardcoded Color Values ---
  console.log('\n--- 5. Hardcoded Color Values Check ---');
  try {
    // Check if any #45B7D1 values still exist
    const pageHTML = document.documentElement.outerHTML;
    const hardcodedBlueCount = (pageHTML.match(/#45B7D1/g) || []).length;
    
    if (hardcodedBlueCount === 0) {
      console.log('✅ Hardcoded Colors: No #45B7D1 values found in DOM');
    } else {
      console.error(`❌ Hardcoded Colors: Found ${hardcodedBlueCount} instances of #45B7D1 in DOM`);
    }

    // Check if white fallback is being used
    const whiteFallbackCount = (pageHTML.match(/#ffffff/g) || []).length;
    console.log(`🔍 White fallback (#ffffff) instances in DOM: ${whiteFallbackCount}`);

  } catch (error) {
    console.error('❌ Error during Hardcoded Color Values Check:', error);
  }

  // --- 6. Check Real-time Subscription Status ---
  console.log('\n--- 6. Real-time Subscription Status ---');
  try {
    if (window.supabase && window.supabase.realtime) {
      console.log('✅ Supabase realtime client is available');
      
      // Check if we have active subscriptions
      const channels = window.supabase.realtime.channels;
      if (channels && channels.length > 0) {
        console.log(`🔍 Active realtime channels: ${channels.length}`);
        channels.forEach((channel, index) => {
          console.log(`  Channel ${index + 1}: ${channel.topic}`);
        });
      } else {
        console.warn('⚠️ No active realtime channels found');
      }
    } else {
      console.error('❌ Supabase realtime client is not available');
    }
  } catch (error) {
    console.error('❌ Error during Real-time Subscription Status check:', error);
  }

  console.log('\n--- COMPREHENSIVE DEBUGGING SESSION COMPLETE ---');
  console.log('If issues persist, check the specific error messages above.');
  console.log('All functions should be available and colors should be white when auraColor is null.');
})();
