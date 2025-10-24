/**
 * COMMUNITIES MODULE - Community Management
 * Handles all community functionality
 */

class CommunitiesModule {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
  }

  /**
   * Initialize CommunitiesModule
   */
  async initialize() {
    if (this.isInitialized) {
      this.log('WARN', 'CommunitiesModule already initialized');
      return;
    }

    this.log('INFO', 'Initializing CommunitiesModule...');
    
    try {
      // TODO: Initialize community systems here
      
      this.isInitialized = true;
      this.log('INFO', 'CommunitiesModule initialized successfully');
    } catch (error) {
      this.log('ERROR', 'Failed to initialize CommunitiesModule:', error);
      throw error;
    }
  }

  /**
   * Logging utility
   */
  log(level, message, ...args) {
    if (this.logLevel === 'SILENT') return;
    
    const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
    if (levels[level] <= levels[this.logLevel]) {
      console.log(`[CommunitiesModule] [${level}] ${message}`, ...args);
    }
  }
}

// ===== COMMUNITY FUNCTIONS (Move from sidepanel.js) =====
// TODO: Move these functions from sidepanel.js:

// --- Community Management Functions ---
async function loadCommunities() {
    try {
      console.log('Loading communities...');
      const response = await api.getCommunities();
      const communities = response.communities || response; // Handle both formats
      console.log(`Loaded ${communities.length} communities`);
      
      // Update community dropdown
      updateCommunityDropdown(communities);
      
      // Set up active communities and primary community
      if (communities.length > 0) {
        // For now, all communities are active communities
        const activeCommunities = communities.map(c => c.id);
        const primaryCommunity = communities[0].id; // First community is primary
        
        // Store active communities and primary community
        chrome.storage.local.set({ 
          activeCommunities: activeCommunities,
          primaryCommunity: primaryCommunity,
          currentCommunity: primaryCommunity, // For backward compatibility
          communities: communities // Store communities for name lookup
        });
        
        // Normalize the current URL ONCE at startup
        const initialUrlData = await normalizeCurrentUrl();
        window.currentUrlData = initialUrlData; // CRITICAL: Set global state
        console.log('🔄 STARTUP: URL normalized for initial load');
        console.log('🔄 STARTUP: window.currentUrlData set to:', initialUrlData.pageId);
        
        // Wait for authentication before loading avatars
        console.log('🔍 INIT: Waiting for authentication before loading avatars...');
        let authAttempts = 0;
        const maxAuthAttempts = 10;
        
        while (authAttempts < maxAuthAttempts) {
          try {
            const currentUser = await getCurrentUserEmail();
            if (currentUser && currentUser !== 'undefined' && currentUser !== null) {
              console.log('🔍 INIT: Authentication confirmed, loading avatars...');
              break;
            }
          } catch (error) {
            Logger.debug(`INIT: Authentication not ready, attempt ${authAttempts + 1}/${maxAuthAttempts}... (${error.message})`, null, 'general');
          }
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
          authAttempts++;
        }
        
        // Load combined avatars from all active communities (uses normalized URL)
        try {
          await loadCombinedAvatars(activeCommunities);
        } catch (error) {
          console.log('🔍 INIT: loadCombinedAvatars failed - user needs to authenticate first');
          console.log('🔍 INIT: Skipping avatar loading until user signs in');
          // Don't retry - wait for user to authenticate
        }
        await loadChatHistory(primaryCommunity);
        
        // Update placeholder text with primary community name
        updatePlaceholderText(communities[0].name);
      }
    } catch (error) {
      console.error('Failed to load communities:', error);
      console.log(`Failed to load communities: ${error.message}`);
      
      // Fallback: show default community
      updateCommunityDropdown([{ id: 'default', name: 'Main Community' }]);
    }
  }
  

  function updateCommunityDropdown(communities) {
    const communityList = document.querySelector('.community-list');
    if (!communityList) return;
    
    // Clear existing communities
    communityList.innerHTML = '';
    
    // Add communities to the list
    communities.forEach((community, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <img src="/images/community${index + 1}.png" alt="Community" data-community-fallback="true">
        <span>${community.name}</span>
        ${index === 0 ? '<span class="primary-tag">Primary</span>' : ''}
      `;
      
      // Add error handler for community image
      const communityImg = li.querySelector('img[data-community-fallback="true"]');
      if (communityImg) {
        communityImg.addEventListener('error', function() {
          this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IHg9IjEwIiB5PSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DPC90ZXh0Pgo8L3N2Zz4K';
        });
      }
      
      // Add click handler to switch communities
      li.addEventListener('click', () => {
        switchCommunity(community);
      });
      
      communityList.appendChild(li);
    });
  }
  

  function switchCommunity(community) {
    console.log(`Switching primary community to: ${community.name}`);
    
    // Update the current community name in the header
    const currentCommunityName = document.getElementById('current-community-name');
    if (currentCommunityName) {
      currentCommunityName.textContent = community.name;
    }
    
    // Update the placeholder text
    updatePlaceholderText(community.name);
    
    // Close the dropdown
    const communityDropdownPanel = document.getElementById('community-dropdown-panel');
    if (communityDropdownPanel) {
      communityDropdownPanel.style.display = 'none';
    }
    
    // Get current active communities and update primary community
    // Modernized: Use StateManager instead of Chrome Storage
    getState('activeCommunities').then((activeCommunities) => {
      const communities = activeCommunities || [community.id];
      
      // Store updated primary community
      // Modernized: Use StateManager instead of Chrome Storage
      getState('communities').then((communities) => {
        setState('communities', { 
          primaryCommunity: community.id,
          currentCommunity: community.id, // For backward compatibility
          communities: result.communities // Keep existing communities
        });
      });
      
      // Load chat history for the new primary community
      loadChatHistory(community.id);
      
      // Note: We don't reload avatars here because we want to show people from ALL active communities
      // The avatars are already loaded from all active communities in loadCombinedAvatars()
    });
  }
  
  async function getPrimaryCommunityName() {
    try {
      const result = await chrome.storage.local.get(['primaryCommunity', 'communities']);
      const primaryCommunityId = result.primaryCommunity;
      const communities = result.communities;
      
      if (primaryCommunityId && communities) {
        const primaryCommunity = communities.find(c => c.id === primaryCommunityId);
        return primaryCommunity ? primaryCommunity.name : '';
      }
      return '';
    } catch (error) {
      console.error('Failed to get primary community name:', error);
      return '';
    }
  }



// Load avatars from multiple communities and combine them
async function loadCombinedAvatars(communityIds) {
    try {
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('👥 LOAD_VISIBILITY: === LOADING COMBINED AVATARS ===');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('👥 LOAD_VISIBILITY: Communities:', communityIds);
      console.log('👥 LOAD_VISIBILITY: Timestamp:', new Date().toISOString());
      console.log(`Loading combined avatars from communities: ${communityIds.join(', ')}`);
      
      // Get normalized URL for visibility - SAME AS MESSAGES
      console.log('');
      console.log('📊 LOAD_VISIBILITY: Step 1 - Normalizing URL');
      console.log('───────────────────────────────────────────────────────────');
      const urlData = await normalizeCurrentUrl();
      const currentUri = urlData.normalizedUrl; // Use normalized URL for consistency
      console.log('✅ LOAD_VISIBILITY: Normalized URL:', currentUri);
      console.log('✅ LOAD_VISIBILITY: Raw URL:', urlData.rawUrl);
      console.log('✅ LOAD_VISIBILITY: Page ID:', urlData.pageId);
      
      // Try URL-based presence first (more accurate)
      let avatarResponses = [];
      try {
        console.log('');
        console.log('📊 LOAD_VISIBILITY: Step 2 - Fetching active users from backend');
        console.log('───────────────────────────────────────────────────────────');
        console.log('🌐 LOAD_VISIBILITY: Calling API with URL:', currentUri);
        const apiStartTime = Date.now();
        // Load initial presence data via API, then real-time updates will handle changes
        const urlResponse = await api.getPresenceByUrl(currentUri, communityIds);
        const apiEndTime = Date.now();
        Logger.success(`LOAD_VISIBILITY: API responded in ${apiEndTime - apiStartTime}ms`, null, 'general');
        console.log('🔍 LOAD_VISIBILITY: Response structure:', {
          hasActive: !!urlResponse?.active,
          activeCount: urlResponse?.active?.length || 0,
          pageId: urlResponse?.pageId,
          url: urlResponse?.url
        });
        
        if (urlResponse && urlResponse.active && urlResponse.active.length > 0) {
          avatarResponses = [urlResponse];
          console.log('');
          console.log('✅✅✅ LOAD_VISIBILITY: Found active users ✅✅✅');
          console.log('✅ LOAD_VISIBILITY: Count:', urlResponse.active.length);
          
          // Enhanced logging for each active user
          urlResponse.active.forEach((user, index) => {
            Logger.info(`👤 LOAD_VISIBILITY: User ${index + 1}/${urlResponse.active.length}:`, {
              email: user.email,
              name: user.name,
              isActive: user.isActive,
              status: user.status,
              lastSeen: user.lastSeen,
              enterTime: user.enterTime
            }, 'general');
          });
        } else {
          console.log('');
          console.log('⚠️⚠️⚠️ LOAD_VISIBILITY: No active users on this page ⚠️⚠️⚠️');
          console.log('⚠️ LOAD_VISIBILITY: This page has no currently active users');
          console.log('⚠️ LOAD_VISIBILITY: Response:', JSON.stringify(urlResponse, null, 2));
          console.log('🔍 LOAD_VISIBILITY DEBUG: Current user email:', window.currentUser?.email);
          console.log('🔍 LOAD_VISIBILITY DEBUG: Current page ID:', currentPageId);
          console.log('🔍 LOAD_VISIBILITY DEBUG: API URL called:', `https://api.themetalayer.org/presence/by-url?url=${encodeURIComponent(currentUri)}`);
          console.log('🔍 LOAD_VISIBILITY DEBUG: Community IDs:', communityIds);
          console.log('🔍 LOAD_VISIBILITY DEBUG: This suggests the presence tracking is not working properly');
          console.log('🔍 LOAD_VISIBILITY DEBUG: Current user should be present on this page');
          throw new Error('No active users found via URL-based presence');
        }
      } catch (urlError) {
        console.log('🔍 VISIBILITY: URL-based presence failed, falling back to community-based:', urlError.message);
        
            // If it's a 401 error, wait a bit and retry once
            if (urlError.message.includes('401')) {
              console.log('🔍 VISIBILITY: 401 error detected, waiting for authentication and retrying...');
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
              try {
                console.log('🔍 VISIBILITY: Retrying URL-based presence API...');
                const retryResponse = await api.getPresenceByUrl(currentUri, communityIds);
                console.log('🔍 VISIBILITY: Retry response:', JSON.stringify(retryResponse, null, 2));
  
                if (retryResponse && retryResponse.length > 0) {
                  console.log('🔍 VISIBILITY: Retry successful - found', retryResponse.length, 'active users');
                  // Convert to expected format
                  const formattedResponse = {
                    active: retryResponse.map(user => ({
                      id: user.user_email,
                      userId: user.user_email,
                      email: user.user_email,
                      name: user.user_email.split('@')[0],
                      handle: user.user_email.split('@')[0],
                      avatarUrl: user.avatar_url,
                      auraColor: user.aura_color || '#aaaaaa',
                      communityId: 'comm-001',
                      communityName: 'Community comm-001',
                      lastSeen: user.last_seen,
                      availability: null,
                      customLabel: null,
                      enterTime: user.enter_time,
                      isActive: user.is_active,
                      status: 'online'
                    })),
                    pageId: currentUri.replace(/[^a-zA-Z0-9]/g, '_'),
                    url: currentUri
                  };
                  avatarResponses = [formattedResponse];
                } else {
                  console.log('🔍 VISIBILITY: Retry successful but no active users found');
                  throw new Error('No active users found via URL-based presence retry');
                }
              } catch (retryError) {
                console.log('🔍 VISIBILITY: Retry also failed:', retryError.message);
              }
            }
        
        // REMOVED: Community-based presence fallback was causing 400 errors
        // The user_presence table doesn't have a community_id column
        // If URL-based presence fails, show empty list
        if (avatarResponses.length === 0) {
          console.log('🔍 VISIBILITY: URL-based presence failed - showing empty list');
          console.log('🔍 VISIBILITY: No presence data available');
          
          // CRITICAL FIX: Always call updateVisibleTab even with empty data
          if (typeof updateVisibleTab === 'function') {
            console.log('🔄 REFRESH_VISIBILITY: Calling updateVisibleTab with empty data...');
            updateVisibleTab([]);
          } else {
            console.error('❌ REFRESH_VISIBILITY: updateVisibleTab function not available');
          }
          
          return [];
        }
      }
      
      console.log('🔍 VISIBILITY: Final avatar responses from API:', avatarResponses);
      
      // Combine and deduplicate avatars
      const allAvatars = [];
      const seenUsers = new Set();
      
      avatarResponses.forEach((response, index) => {
        const communityId = communityIds[index];
        let avatars;
        
        Logger.debug(`VISIBILITY: Processing response for community ${communityId}:`, response, 'general');
        Logger.debug(`VISIBILITY: Response keys:`, response ? Object.keys(response) : 'null', 'general');
        Logger.debug(`VISIBILITY: Response type:`, typeof response, 'general');
        Logger.debug(`VISIBILITY: Is array:`, Array.isArray(response), 'general');
        
        // Handle different response formats
        if (response && response.avatars && Array.isArray(response.avatars)) {
          avatars = response.avatars;
          Logger.debug(`VISIBILITY: Found ${avatars.length} avatars in response.avatars for ${communityId}`, null, 'general');
        } else if (response && response.active && Array.isArray(response.active)) {
          avatars = response.active;
          Logger.debug(`VISIBILITY: Found ${avatars.length} avatars in response.active for ${communityId}`, null, 'general');
        } else if (Array.isArray(response)) {
          avatars = response;
          Logger.debug(`VISIBILITY: Found ${avatars.length} avatars in direct array for ${communityId}`, null, 'general');
        } else if (response && typeof response === 'object') {
          // Check for other possible structures
          Logger.debug(`VISIBILITY: Checking other object structures for ${communityId}`, null, 'general');
          if (response.users && Array.isArray(response.users)) {
            avatars = response.users;
            Logger.debug(`VISIBILITY: Found ${avatars.length} avatars in response.users for ${communityId}`, null, 'general');
          } else {
            avatars = [];
            Logger.debug(`VISIBILITY: No avatars found in object for ${communityId}, available keys:`, Object.keys(response), 'general');
          }
        } else {
          avatars = [];
          Logger.debug(`VISIBILITY: No avatars found for ${communityId}, response format:`, typeof response, 'general');
        }
        
        // Add community info to each avatar and deduplicate
        avatars.forEach((avatar, avatarIndex) => {
          Logger.debug(`VISIBILITY: Processing avatar ${avatarIndex + 1} from ${communityId}:`, {
            id: avatar.id,
            userId: avatar.userId,
            name: avatar.name,
            handle: avatar.handle,
            email: avatar.email || avatar.userId || avatar.id,
            avatarUrl: avatar.avatarUrl,
            auraColor: avatar.auraColor
          }, 'general');
          
          const userKey = `${avatar.userId || avatar.id}`;
          if (!seenUsers.has(userKey)) {
            seenUsers.add(userKey);
            allAvatars.push({
              ...avatar,
              communityId: communityId,
              communityName: avatar.communityName || `Community ${communityId}`
            });
            Logger.success(`VISIBILITY: Added unique avatar: ${avatar.name || avatar.handle || 'Unknown'} (${userKey}) from ${communityId}`, null, 'general');
          } else {
            Logger.info(`⏭️ VISIBILITY: Skipped duplicate avatar: ${avatar.name || avatar.handle || 'Unknown'} (${userKey}) from ${communityId}`, null, 'general');
          }
        });
      });
      
      Logger.debug(`VISIBILITY: Final combined avatars:`, allAvatars, 'general');
      Logger.debug(`VISIBILITY: Total unique avatars: ${allAvatars.length}`, null, 'general');
      console.log(`Combined avatars from ${communityIds.length} communities:`, allAvatars);
      console.log(`Total unique avatars: ${allAvatars.length}`);
      
      // Enhanced logging for final avatars before passing to updateVisibleTab
      console.log('🔍 VISIBILITY: Final avatars to be processed by updateVisibleTab:');
      allAvatars.forEach((avatar, index) => {
        Logger.debug(`VISIBILITY: Final avatar ${index + 1}:`, {
          id: avatar.id,
          userId: avatar.userId,
          name: avatar.name,
          handle: avatar.handle,
          email: avatar.email,
          avatarUrl: avatar.avatarUrl,
          auraColor: avatar.auraColor,
          communityId: avatar.communityId
        }, 'general');
      });
      
      // Update the visible tab with combined avatar data
      await updateVisibleTab(allAvatars);
      
      // CRITICAL FIX: Update profile avatar AFTER visibility data is loaded
      // This ensures the profile avatar can access the real avatar URL from window.currentVisibilityDataUnfiltered
      console.log('🔍 PROFILE_AVATAR_REFRESH: Refreshing profile avatar with real data from visibility...');
      if (window.currentUser) {
        console.log('🔍 PROFILE_AVATAR_REFRESH: Current user exists, calling updateUI()...');
        await updateUI(window.currentUser);
        console.log('✅ PROFILE_AVATAR_REFRESH: Profile avatar refreshed with real avatar data');
      } else {
        console.log('⚠️ PROFILE_AVATAR_REFRESH: No current user to refresh');
      }
    } catch (error) {
      console.error('❌ VISIBILITY: Failed to load combined avatars:', error);
      console.log(`Failed to load combined avatars: ${error.message}`);
      await updateVisibleTab([]);
    }
  }
  
  // Legacy function for backward compatibility - now accepts array of community IDs
  async function loadAvatars(communityIds) {
    try {
      // If single community ID passed, convert to array
      if (typeof communityIds === 'string') {
        communityIds = [communityIds];
      }
      
      // If no community IDs provided, get from storage
      if (!communityIds || communityIds.length === 0) {
        const result = await chrome.storage.local.get(['activeCommunities']);
        communityIds = result.activeCommunities || ['comm-001'];
      }
      
      console.log(`Loading avatars for communities: ${communityIds.join(', ')}`);
      
      // Use the combined avatars function
      await loadCombinedAvatars(communityIds);
    } catch (error) {
      console.error('Failed to load avatars:', error);
      console.log(`Failed to load avatars: ${error.message}`);
    }
  }
  
  function updatePlaceholderText(communityName) {
    const chatTextarea = document.getElementById('chat-textarea');
    if (chatTextarea) {
      chatTextarea.placeholder = `Start thread in ${communityName}`;
    }
  }
  

async function loadMessageReplies(messageId, conversationId, communityId = null) {
  try {
    // Get the community ID from parameter or use the first active community
    const resolvedCommunityId = communityId || (window.activeCommunities && window.activeCommunities[0]) || 'comm-001';
    
    // Get the full conversation to find replies to this specific message
    // Use Supabase real-time instead of API polling
    const { data: response, error } = await supabase
      .from('messages')
      .select('*')
      .eq('community_id', resolvedCommunityId)
      .eq('page_id', this.currentPage?.pageId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    if (response && response.posts) {
      const replies = response.posts.filter(post => post.parentId === messageId);
      
      // Sort replies by creation time
      replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      // Add each reply (they will be visible since we're in focus mode)
      for (const reply of replies) {
        // Check if this reply has its own replies (nested replies)
        const nestedReplies = response.posts.filter(post => post.parentId === reply.id);
        
        const replyMsg = { 
          ...reply, 
          conversationId, 
          isReply: true, 
          hasReplies: nestedReplies.length > 0 // Show thread toggle if it has nested replies
        };
        await addMessageToChat(replyMsg);
      }
    }
  } catch (error) {
    console.error('Failed to load message replies:', error);
  }
}


// Note: loadChatHistory is in CanopiModule.js, not CommunitiesModule.js

// Export for global access
window.CommunitiesModule = CommunitiesModule;
window.loadCombinedAvatars = loadCombinedAvatars;
