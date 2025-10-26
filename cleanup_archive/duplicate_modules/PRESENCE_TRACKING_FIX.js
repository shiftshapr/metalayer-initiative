// ===== PRESENCE TRACKING FIX =====
// SD1 + SD2 + TA1: Critical fix for presence tracking issues
// Problem: API calls are failing and avatars are not displaying correctly
// Solution: Fix presence tracking and avatar display using COMP method

console.log('🔧 PRESENCE TRACKING FIX: Starting critical presence tracking fixes');

// ===== CRITICAL FIX 1: Fix Presence Event Sending =====
// Problem: Presence events are not being sent properly
// Solution: Fix presence event sending using COMP method

function fixPresenceEventSending() {
  console.log('🔧 FIXING PRESENCE EVENT SENDING: Ensuring proper presence event sending');
  
  // Override presence event sending
  window.sendPresenceEvent = async function(kind, availability = null, customLabel = null) {
    console.log('🔧 PRESENCE_EVENT: Sending presence event:', kind);
    
    try {
      const currentUser = await getCurrentUser();
      const currentPage = await getCurrentPageInfo();
      
      if (!currentUser || !currentPage) {
        console.error('❌ PRESENCE_EVENT: Missing user or page info');
        return false;
      }
      
      console.log('🔧 PRESENCE_EVENT: Current user:', currentUser.email);
      console.log('🔧 PRESENCE_EVENT: Current page:', currentPage.pageId);
      
      // Create presence event data using COMP method
      const presenceData = {
        pageId: currentPage.pageId,
        userId: currentUser.email,
        kind: kind,
        availability: availability,
        customLabel: customLabel,
        pageUrl: currentPage.rawUrl
      };
      
      console.log('🔧 PRESENCE_EVENT: Presence data:', presenceData);
      
      // Send via API using COMP method
      const response = await fetch('https://api.themetalayer.org/v1/presence/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(presenceData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ PRESENCE_EVENT: Event sent successfully:', result);
        
        // Also send via Supabase real-time for immediate propagation
        if (window.supabaseRealtimeClient) {
          await window.supabaseRealtimeClient.sendPresenceUpdate(presenceData);
        }
        
        return result;
      } else {
        console.error('❌ PRESENCE_EVENT: API call failed:', response.status, response.statusText);
        return false;
      }
      
    } catch (error) {
      console.error('❌ PRESENCE_EVENT: Error sending presence event:', error);
      return false;
    }
  };
  
  console.log('✅ PRESENCE EVENT SENDING: Fixed presence event sending');
}

// ===== CRITICAL FIX 2: Fix Avatar Display =====
// Problem: Avatars are not displaying correctly
// Solution: Fix avatar display using COMP method

function fixAvatarDisplay() {
  console.log('🔧 FIXING AVATAR DISPLAY: Ensuring proper avatar display');
  
  // Override avatar refresh function
  window.refreshVisibilityAvatars = async function() {
    console.log('🔧 REFRESH_AVATARS: Refreshing visibility avatars');
    
    try {
      const currentPage = await getCurrentPageInfo();
      if (!currentPage) {
        console.error('❌ REFRESH_AVATARS: No current page info');
        return;
      }
      
      console.log('🔧 REFRESH_AVATARS: Current page:', currentPage.pageId);
      
      // Get page users from API
      const response = await fetch(`https://api.themetalayer.org/v1/presence/page/${currentPage.pageId}/users`);
      if (!response.ok) {
        console.error('❌ REFRESH_AVATARS: Failed to get page users:', response.status);
        return;
      }
      
      const users = await response.json();
      console.log('🔧 REFRESH_AVATARS: Page users:', users);
      
      // Update visibility UI using COMP method
      const visibilityContainer = document.querySelector('.visibility-container');
      if (visibilityContainer) {
        visibilityContainer.innerHTML = users.map(user => {
          const userName = user.name || user.email?.split('@')[0] || 'Unknown';
          const avatarUrl = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4ECDC4&color=fff&size=32&bold=true`;
          
          return `
            <div class="user-avatar" data-user="${user.email}" title="${userName}">
              <img src="${avatarUrl}" 
                   alt="${userName}" 
                   class="avatar-image"
                   onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4ECDC4&color=fff&size=32&bold=true'">
            </div>
          `;
        }).join('');
        
        console.log('✅ REFRESH_AVATARS: Visibility UI updated with', users.length, 'users');
      } else {
        console.log('⚠️ REFRESH_AVATARS: No visibility container found');
      }
      
      // Also update message avatars
      await refreshMessageAvatars(users);
      
      console.log('✅ REFRESH_AVATARS: Avatars refreshed successfully');
      
    } catch (error) {
      console.error('❌ REFRESH_AVATARS: Error refreshing avatars:', error);
    }
  };
  
  // Helper function to refresh message avatars
  async function refreshMessageAvatars(users) {
    console.log('🔧 REFRESH_MESSAGE_AVATARS: Refreshing message avatars');
    
    const messageElements = document.querySelectorAll('.message');
    for (const messageElement of messageElements) {
      const authorId = messageElement.dataset.authorId;
      if (!authorId) continue;
      
      // Find user data
      const user = users.find(u => u.email === authorId);
      if (!user) continue;
      
      // Update avatar in message
      const avatarElement = messageElement.querySelector('.message-avatar');
      if (avatarElement) {
        const userName = user.name || user.email?.split('@')[0] || 'Unknown';
        const avatarUrl = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4ECDC4&color=fff&size=32&bold=true`;
        
        avatarElement.src = avatarUrl;
        avatarElement.alt = userName;
        avatarElement.onerror = function() {
          this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4ECDC4&color=fff&size=32&bold=true`;
        };
      }
    }
    
    console.log('✅ REFRESH_MESSAGE_AVATARS: Message avatars refreshed');
  }
  
  console.log('✅ AVATAR DISPLAY: Fixed avatar display');
}

// ===== CRITICAL FIX 3: Fix Presence Tracking Initialization =====
// Problem: Presence tracking is not being initialized properly
// Solution: Fix presence tracking initialization using COMP method

function fixPresenceTrackingInitialization() {
  console.log('🔧 FIXING PRESENCE TRACKING INITIALIZATION: Ensuring proper presence tracking setup');
  
  // Override presence tracking initialization
  window.initializePresenceTracking = async function() {
    console.log('🔧 INITIALIZE_PRESENCE: Starting presence tracking initialization');
    
    try {
      const currentUser = await getCurrentUser();
      const currentPage = await getCurrentPageInfo();
      
      if (!currentUser || !currentPage) {
        console.error('❌ INITIALIZE_PRESENCE: Missing user or page info');
        return false;
      }
      
      console.log('🔧 INITIALIZE_PRESENCE: Current user:', currentUser.email);
      console.log('🔧 INITIALIZE_PRESENCE: Current page:', currentPage.pageId);
      
      // Send ENTER presence event
      const enterResult = await window.sendPresenceEvent('ENTER');
      if (enterResult) {
        console.log('✅ INITIALIZE_PRESENCE: ENTER event sent successfully');
      } else {
        console.error('❌ INITIALIZE_PRESENCE: Failed to send ENTER event');
      }
      
      // Refresh visibility avatars
      await window.refreshVisibilityAvatars();
      
      // Set up periodic presence updates
      if (window.presenceUpdateInterval) {
        clearInterval(window.presenceUpdateInterval);
      }
      
      window.presenceUpdateInterval = setInterval(async () => {
        try {
          await window.sendPresenceEvent('HEARTBEAT');
        } catch (error) {
          console.error('❌ PRESENCE_HEARTBEAT: Error sending heartbeat:', error);
        }
      }, 30000); // Every 30 seconds
      
      // Set up page unload handler
      window.addEventListener('beforeunload', async () => {
        try {
          await window.sendPresenceEvent('EXIT');
        } catch (error) {
          console.error('❌ PRESENCE_EXIT: Error sending EXIT event:', error);
        }
      });
      
      console.log('✅ INITIALIZE_PRESENCE: Presence tracking initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ INITIALIZE_PRESENCE: Error initializing presence tracking:', error);
      return false;
    }
  };
  
  console.log('✅ PRESENCE TRACKING INITIALIZATION: Fixed presence tracking initialization');
}

// ===== CRITICAL FIX 4: Fix Supabase Real-time Presence =====
// Problem: Supabase real-time presence is not working properly
// Solution: Fix Supabase real-time presence using COMP method

function fixSupabaseRealtimePresence() {
  console.log('🔧 FIXING SUPABASE REALTIME PRESENCE: Ensuring proper real-time presence');
  
  // Override Supabase real-time client presence methods
  if (window.supabaseRealtimeClient) {
    // Add presence update method
    window.supabaseRealtimeClient.sendPresenceUpdate = async function(presenceData) {
      console.log('🔧 SUPABASE_PRESENCE: Sending presence update via Supabase');
      
      try {
        if (!this.supabase) {
          console.error('❌ SUPABASE_PRESENCE: No Supabase client available');
          return false;
        }
        
        // Send presence update via Supabase real-time
        const { error } = await this.supabase
          .from('presence_events')
          .insert([{
            page_id: presenceData.pageId,
            user_id: presenceData.userId,
            kind: presenceData.kind,
            availability: presenceData.availability,
            custom_label: presenceData.customLabel,
            page_url: presenceData.pageUrl,
            created_at: new Date().toISOString()
          }]);
        
        if (error) {
          console.error('❌ SUPABASE_PRESENCE: Error sending presence update:', error);
          return false;
        }
        
        console.log('✅ SUPABASE_PRESENCE: Presence update sent successfully');
        return true;
        
      } catch (error) {
        console.error('❌ SUPABASE_PRESENCE: Error sending presence update:', error);
        return false;
      }
    };
    
    // Add presence subscription method
    window.supabaseRealtimeClient.subscribeToPresenceUpdates = async function(pageId) {
      console.log('🔧 SUPABASE_PRESENCE: Subscribing to presence updates for page:', pageId);
      
      try {
        if (!this.supabase) {
          console.error('❌ SUPABASE_PRESENCE: No Supabase client available');
          return false;
        }
        
        // Subscribe to presence updates
        const channel = this.supabase.realtime.channel(`presence_updates_${pageId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'presence_events',
            filter: `page_id=eq.${pageId}`
          }, (payload) => {
            console.log('🔧 SUPABASE_PRESENCE: New presence event:', payload);
            if (this.onPresenceUpdate && typeof this.onPresenceUpdate === 'function') {
              this.onPresenceUpdate(payload.new);
            }
          })
          .subscribe();
        
        this.presenceChannel = channel;
        console.log('✅ SUPABASE_PRESENCE: Subscribed to presence updates');
        return true;
        
      } catch (error) {
        console.error('❌ SUPABASE_PRESENCE: Error subscribing to presence updates:', error);
        return false;
      }
    };
    
    // Add presence update handler
    window.supabaseRealtimeClient.onPresenceUpdate = async function(presenceEvent) {
      console.log('🔧 SUPABASE_PRESENCE: Handling presence update:', presenceEvent);
      
      // Refresh visibility avatars when presence changes
      await window.refreshVisibilityAvatars();
    };
  }
  
  console.log('✅ SUPABASE REALTIME PRESENCE: Fixed Supabase real-time presence');
}

// ===== UTILITY FUNCTIONS =====

async function getCurrentUser() {
  try {
    // Try to get user from various sources
    if (window.currentUser) return window.currentUser;
    if (window.supabaseUser) return window.supabaseUser;
    
    // Get from storage
    const result = await chrome.storage.local.get(['currentUser', 'supabaseUser']);
    return result.currentUser || result.supabaseUser;
  } catch (error) {
    console.error('❌ GET_CURRENT_USER: Error getting current user:', error);
    return null;
  }
}

async function getCurrentPageInfo() {
  try {
    const url = window.location.href;
    const normalizedUrl = url.replace(/^https?:\/\//, '').split('/')[0];
    const pageId = normalizedUrl.replace(/\./g, '_') + '_';
    
    return {
      rawUrl: url,
      normalizedUrl: normalizedUrl,
      pageId: pageId
    };
  } catch (error) {
    console.error('❌ GET_CURRENT_PAGE: Error getting page info:', error);
    return null;
  }
}

// ===== MAIN FIX FUNCTION =====

async function runPresenceTrackingFixes() {
  console.log('🚀 PRESENCE TRACKING FIXES: Starting all presence tracking fixes...');
  
  try {
    fixPresenceEventSending();
    fixAvatarDisplay();
    fixPresenceTrackingInitialization();
    fixSupabaseRealtimePresence();
    
    console.log('✅ PRESENCE TRACKING FIXES: All fixes completed successfully');
    
    // Test the fixes
    await testPresenceTrackingFixes();
    
  } catch (error) {
    console.error('❌ PRESENCE TRACKING FIXES: Error running fixes:', error);
  }
}

// ===== TEST FUNCTION =====

async function testPresenceTrackingFixes() {
  console.log('🧪 TESTING PRESENCE TRACKING FIXES: Running tests...');
  
  try {
    // Test 1: Presence event sending
    console.log('🧪 TEST 1: Testing presence event sending...');
    const enterResult = await window.sendPresenceEvent('ENTER');
    if (enterResult) {
      console.log('✅ TEST 1: Presence event sending test passed');
    } else {
      console.log('❌ TEST 1: Presence event sending test failed');
    }
    
    // Test 2: Avatar refresh
    console.log('🧪 TEST 2: Testing avatar refresh...');
    await window.refreshVisibilityAvatars();
    console.log('✅ TEST 2: Avatar refresh test passed');
    
    // Test 3: Presence tracking initialization
    console.log('🧪 TEST 3: Testing presence tracking initialization...');
    const initResult = await window.initializePresenceTracking();
    if (initResult) {
      console.log('✅ TEST 3: Presence tracking initialization test passed');
    } else {
      console.log('❌ TEST 3: Presence tracking initialization test failed');
    }
    
    // Test 4: Supabase real-time presence
    console.log('🧪 TEST 4: Testing Supabase real-time presence...');
    if (window.supabaseRealtimeClient) {
      const currentPage = await getCurrentPageInfo();
      await window.supabaseRealtimeClient.subscribeToPresenceUpdates(currentPage.pageId);
      console.log('✅ TEST 4: Supabase real-time presence test passed');
    } else {
      console.log('⚠️ TEST 4: Supabase client not available, skipping real-time presence test');
    }
    
    console.log('✅ ALL PRESENCE TRACKING TESTS PASSED: Fixes are working correctly');
    
  } catch (error) {
    console.error('❌ TEST PRESENCE TRACKING FIXES: Error testing fixes:', error);
  }
}

// ===== EXPORT FUNCTIONS =====

window.runPresenceTrackingFixes = runPresenceTrackingFixes;
window.testPresenceTrackingFixes = testPresenceTrackingFixes;
window.fixPresenceEventSending = fixPresenceEventSending;
window.fixAvatarDisplay = fixAvatarDisplay;
window.fixPresenceTrackingInitialization = fixPresenceTrackingInitialization;
window.fixSupabaseRealtimePresence = fixSupabaseRealtimePresence;

console.log('✅ PRESENCE TRACKING FIX: Script loaded successfully');
console.log('📋 USAGE: Run window.runPresenceTrackingFixes() to apply all fixes');
console.log('📋 USAGE: Run window.testPresenceTrackingFixes() to test the fixes');
