/**
 * Visibility Manager - Centralized Visibility System
 * Extracts all visibility-related functionality from sidepanel.js
 * 
 * Responsibilities:
 * - User visibility tracking
 * - Avatar management
 * - Real-time visibility updates
 * - Current user filtering
 */

class VisibilityManager {
  constructor(supabaseService, logger) {
    this.supabase = supabaseService;
    this.logger = logger;
    this.currentVisibilityData = [];
    this.currentUserEmail = null;
    this.isActive = false;
  }

  /**
   * Initialize visibility manager
   */
  async initialize(currentUserEmail) {
    try {
      this.logger.startFlow('VISIBILITY_INIT', { currentUserEmail });
      
      this.currentUserEmail = currentUserEmail;
      this.isActive = true;
      
      // Set up real-time event handlers
      this.supabase.on('presence', (eventType, newRecord, oldRecord) => {
        this.handlePresenceEvent(eventType, newRecord, oldRecord);
      });
      
      this.logger.endFlow('VISIBILITY_INIT', true);
    } catch (error) {
      this.logger.endFlow('VISIBILITY_INIT', false, { error: error.message });
      throw error;
    }
  }

  /**
   * Refresh visibility avatars for current page
   */
  async refreshVisibilityAvatars(pageId) {
    try {
      this.logger.startFlow('VISIBILITY_REFRESH', { pageId });
      
      if (!this.isActive) {
        this.logger.warn('VISIBILITY', 'Manager not active, skipping refresh');
        return;
      }

      // Get users from Supabase
      const users = await this.supabase.getPageUsers(pageId);
      this.logger.visibility('Enhanced query returned users', { 
        count: users.length,
        users: users.map(u => `${u.user_email} (${u.is_active ? 'ACTIVE' : 'INACTIVE'})`)
      });

      if (users && users.length > 0) {
        // Fetch avatar URLs for users
        const usersWithAvatars = await this.fetchUserAvatars(users);
        
        // Filter out current user
        const filteredUsers = this.filterCurrentUser(usersWithAvatars);
        
        // Update UI
        await this.updateVisibilityUI(filteredUsers);
        
        this.logger.endFlow('VISIBILITY_REFRESH', true, { 
          totalUsers: users.length,
          visibleUsers: filteredUsers.length 
        });
      } else {
        await this.updateVisibilityUI([]);
        this.logger.visibility('No users found, clearing visibility');
      }
    } catch (error) {
      this.logger.endFlow('VISIBILITY_REFRESH', false, { error: error.message });
      throw error;
    }
  }

  /**
   * Fetch avatar URLs for users
   */
  async fetchUserAvatars(users) {
    try {
      this.logger.visibility('Fetching avatar URLs for users', { count: users.length });
      
      const usersWithAvatars = await Promise.all(users.map(async (user) => {
        try {
          const userProfile = await this.supabase.getUserProfile(user.user_email);
          
          return {
            id: user.user_email,
            userId: user.user_email || user.email,
            email: user.user_email || user.email,
            name: userProfile?.name || (user.user_email || user.email)?.split('@')[0] || 'Unknown',
            handle: userProfile?.handle || (user.user_email || user.email)?.split('@')[0] || 'unknown',
            avatarUrl: userProfile?.avatar_url || null,
            auraColor: user.aura_color || window.AVATAR_FALLBACK_COLOR,
            communityId: 'comm-001',
            communityName: 'Community comm-001',
            lastSeen: user.last_seen,
            availability: null,
            customLabel: null,
            enterTime: user.enter_time,
            isActive: user.is_active,
            status: user.is_active ? 'online' : 'offline'
          };
        } catch (error) {
          this.logger.warn('VISIBILITY', 'Failed to fetch avatar for user', { 
            userId: user.id || user.user_id,
            error: error.message 
          });
          
          // Return basic user data without avatar
          return {
            id: user.user_email,
            userId: user.user_email || user.email,
            email: user.user_email || user.email,
            name: (user.user_email || user.email)?.split('@')[0] || 'Unknown',
            handle: (user.user_email || user.email)?.split('@')[0] || 'unknown',
            avatarUrl: null,
            auraColor: user.aura_color || window.AVATAR_FALLBACK_COLOR,
            communityId: 'comm-001',
            communityName: 'Community comm-001',
            lastSeen: user.last_seen,
            availability: null,
            customLabel: null,
            enterTime: user.enter_time,
            isActive: user.is_active,
            status: user.is_active ? 'online' : 'offline'
          };
        }
      }));

      this.logger.visibility('Users with avatars fetched', { count: usersWithAvatars.length });
      return usersWithAvatars;
    } catch (error) {
      this.logger.error('VISIBILITY', 'Failed to fetch user avatars', { error: error.message });
      throw error;
    }
  }

  /**
   * Filter out current user from visibility list
   */
  filterCurrentUser(users) {
    if (!this.currentUserEmail) return users;
    
    const filteredUsers = users.filter(user => {
      const isCurrentUser = user.userId === this.currentUserEmail || 
                           user.email === this.currentUserEmail ||
                           user.handle === this.currentUserEmail.split('@')[0];
      
      if (isCurrentUser) {
        this.logger.visibility('Filtering out current user', { 
          userId: user.userId,
          currentUser: this.currentUserEmail 
        });
        return false;
      }
      
      return true;
    });

    this.logger.visibility('Current user filtering complete', { 
      originalCount: users.length,
      filteredCount: filteredUsers.length 
    });
    
    return filteredUsers;
  }

  /**
   * Update visibility UI
   */
  async updateVisibilityUI(users) {
    try {
      this.logger.visibility('Updating visibility UI', { userCount: users.length });
      
      // Store globally for profile avatar lookup
      window.currentVisibilityDataUnfiltered = users;
      
      // Update the UI with users
      if (typeof updateVisibleTab === 'function') {
        await updateVisibleTab(users);
        this.logger.visibility('UI updated successfully');
      } else {
        this.logger.warn('VISIBILITY', 'updateVisibleTab function not available');
      }
      
      this.currentVisibilityData = users;
    } catch (error) {
      this.logger.error('VISIBILITY', 'Failed to update visibility UI', { error: error.message });
      throw error;
    }
  }

  /**
   * Handle real-time presence events
   */
  handlePresenceEvent(eventType, newRecord, oldRecord) {
    try {
      this.logger.visibility('Processing presence event', { 
        eventType,
        userId: newRecord?.user_id || oldRecord?.user_id,
        pageId: newRecord?.page_id || oldRecord?.page_id
      });

      // Only process events for current page
      if (this.currentPageId && 
          (newRecord?.page_id !== this.currentPageId && oldRecord?.page_id !== this.currentPageId)) {
        this.logger.visibility('Ignoring event from different page', { 
          eventPageId: newRecord?.page_id || oldRecord?.page_id,
          currentPageId: this.currentPageId 
        });
        return;
      }

      // Refresh visibility for current page
      if (this.currentPageId) {
        this.refreshVisibilityAvatars(this.currentPageId);
      }
    } catch (error) {
      this.logger.error('VISIBILITY', 'Failed to handle presence event', { error: error.message });
    }
  }

  /**
   * Set current page
   */
  setCurrentPage(pageId) {
    this.currentPageId = pageId;
    this.logger.visibility('Current page set', { pageId });
  }

  /**
   * Get current visibility data
   */
  getCurrentVisibilityData() {
    return this.currentVisibilityData;
  }

  /**
   * Format last seen display like COMP
   */
  formatLastSeenDisplay(lastSeen) {
    if (!lastSeen) return 'Last seen unknown';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now - lastSeenDate;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    // If the difference is negative, it means the timestamp is in the future
    if (diffMs < 0) {
      return 'Last seen just now';
    }
    
    if (diffSeconds < 60) {
      return `Last seen ${diffSeconds} second${diffSeconds === 1 ? '' : 's'} ago`;
    } else if (diffMinutes < 60) {
      return `Last seen ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `Last seen ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else {
      return `Last seen ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }
  }

  /**
   * Get visibility status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      currentUserEmail: this.currentUserEmail,
      currentPageId: this.currentPageId,
      visibleUsers: this.currentVisibilityData.length
    };
  }

  /**
   * Cleanup
   */
  async cleanup() {
    try {
      this.isActive = false;
      this.currentVisibilityData = [];
      this.currentUserEmail = null;
      this.currentPageId = null;
      
      this.logger.visibility('Cleanup completed');
    } catch (error) {
      this.logger.error('VISIBILITY', 'Cleanup failed', { error: error.message });
    }
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisibilityManager;
}

// ===== CORE VISIBILITY FUNCTIONS =====

/**
 * Update the visible tab with avatars
 * @param {Array} avatars - Array of avatar objects
 */
// Time formatting functions
function formatTimeDisplay(enterTime) {
  if (!enterTime) return 'Now';
  
  const now = new Date();
  const enter = new Date(enterTime);
  const diffMs = now - enter;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `Online for ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `Online for ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  if (diffDays < 365) return `Online for ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  return `Online for ${diffYears} year${diffYears !== 1 ? 's' : ''}`;
}

function formatLastSeenDisplay(lastSeen) {
  if (!lastSeen) return 'Never seen';
  
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffMs = now - lastSeenDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffMins < 1) return 'Last seen just now';
  if (diffMins < 60) return `Last seen ${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `Last seen ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `Last seen ${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `Last seen ${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `Last seen ${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  return `Last seen ${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
}

// COMP METHOD: Exact time formatting functions from sidepanel_COMP.js
function formatTimeDisplay(enterTime) {
  // REDUCED LOGGING - Only log when time changes categories (Now -> minutes -> hours -> days)
  const now = new Date();
  
  if (!enterTime) {
    return 'Now';
  }
  
  const enterTimeDate = new Date(enterTime);
  const diffMs = now - enterTimeDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // If the difference is negative, it means the timestamp is in the future
  if (diffMs < 0) {
    console.log('🕒 TIME_DEBUG: Negative time difference detected - enterTime is in the future!');
    return 'Now';
  }
  
  // User requirements: 
  // a) If user is still on tab, show "Now" for under 60 seconds, then minutes, hours, days
  // b) If user has left tab, show "Last seen X minutes ago"
  // c) After 1 month threshold, don't show last seen
  // d) If someone leaves and comes back, reset ENTER and null EXIT
  
  if (diffSeconds < 60) {
    return 'Now'; // Don't show seconds, show "Now"
  } else if (diffMinutes < 60) {
    return `Online for ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`;
  } else if (diffHours < 24) {
    return `Online for ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  } else if (diffDays < 30) { // 1 month threshold
    return `Online for ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  } else {
    return 'Last seen over a month ago'; // Don't show after 1 month
  }
}

function formatLastSeenDisplay(lastSeen) {
  if (!lastSeen) return 'Last seen unknown';
  
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffMs = now - lastSeenDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // If the difference is negative, it means the timestamp is in the future
  if (diffMs < 0) {
    return 'Last seen just now';
  }
  
  if (diffSeconds < 60) {
    return `Last seen ${diffSeconds} second${diffSeconds === 1 ? '' : 's'} ago`;
  } else if (diffMinutes < 60) {
    return `Last seen ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `Last seen ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else {
    return `Last seen ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
}

async function updateVisibleTab(avatars) {
  console.log('🔍 VISIBILITY: updateVisibleTab called with avatars:', JSON.stringify(avatars, null, 2));
  
  // Store visibility data globally for real-time aura color access
  window.currentVisibilityData = { active: avatars };
  window.currentVisibilityDataUnfiltered = { active: avatars };
  console.log('🔄 VISIBILITY: Stored visibility data globally for real-time aura access');
  
  // Clear any existing visibility update timer
  if (window.visibilityUpdateTimer) {
    clearInterval(window.visibilityUpdateTimer);
  }
  
  // SD4 ARCHITECTURE FIX: Use TabContextManager to ensure scoped operation
  let visibleTab;
  if (window.tabContextManager) {
    visibleTab = window.tabContextManager.getTabContainer('visibility-tab');
    if (!visibleTab) {
      console.warn('⚠️ VISIBILITY: visibility-tab not found or not active');
      visibleTab = document.getElementById('visibility-tab');
    }
  } else {
    visibleTab = document.getElementById('visibility-tab');
  }
  
  if (!visibleTab) {
    console.log('❌ VISIBILITY: visibleTab element not found');
    return;
  }
  
  // UI UPGRADE: Ensure we're not accidentally updating discuss tab
  if (visibleTab.id !== 'visibility-tab') {
    console.error('❌ VISIBILITY: Wrong tab element passed to updateVisibleTab');
    return;
  }
  
  // SD4 ARCHITECTURE FIX: Do NOT update tab if it's not active
  const isVisibilityTabActive = document.getElementById('visibility-tab')?.classList.contains('active');
  if (!isVisibilityTabActive) {
    console.warn('⚠️ VISIBILITY: Attempting to update visibility-tab when it is not active - SKIPPING');
    return;
  }
  
  // Double-check with TabContextManager if available
  if (window.tabContextManager && !window.tabContextManager.isTabActive('visibility-tab')) {
    console.warn('⚠️ VISIBILITY: TabContextManager confirms tab is not active - SKIPPING');
    return;
  }
  
  console.log('🔍 VISIBILITY: Updating visible tab with', avatars.length, 'avatars');
  
  // Get current user for filtering
  const currentUserEmail = window.currentUser ? window.currentUser.email : await getCurrentUserEmail();
  const currentUserId = window.currentUser?.id || window.currentUser?.user_id;
  console.log('🔍 VISIBILITY: Current user email:', currentUserEmail, 'ID:', currentUserId);
  
  // ROOT CAUSE FIX: Filter out ONLY the current user - show all other users
  // CRITICAL: Use UUID matching, not email matching - different profiles may have same email
  const usersWithAvatars = avatars.filter(avatar => {
    // Match by UUID (primary) or email (fallback if UUID not available)
    const avatarId = avatar.id || avatar.userId || avatar.user_id;
    const isCurrentUser = (currentUserId && avatarId && String(avatarId) === String(currentUserId)) ||
                        (!currentUserId && avatar.email === currentUserEmail);
    
    if (isCurrentUser) {
      console.log('🔍 VISIBILITY: 🚫 FILTERING OUT current user from their own visibility list');
      console.log('🔍 VISIBILITY: Current user ID:', currentUserId, 'Avatar ID:', avatarId);
      return false;
    }
    
    return true;
  });
  
  console.log('🔍 VISIBILITY: Showing', usersWithAvatars.length, 'users with real avatars (filtered from', avatars.length, 'total)');
  
  // COMP METHOD: Create visible users UI with unified avatars (aura ring behind image)
  const avatarHTMLPromises = usersWithAvatars.map(async (avatar) => {
    // RED-LINE: Standardize auraColor - convert snake_case if present
    if (avatar.aura_color && !avatar.auraColor) {
      avatar.auraColor = avatar.aura_color;
      delete avatar.aura_color;
    }
    
    // COMP METHOD: Use unified avatar structure with aura ring behind image
    let avatarHTML = '';
    try {
      if (window.AvatarUtils && typeof window.AvatarUtils.createUnifiedAvatar === 'function') {
        avatarHTML = await window.AvatarUtils.createUnifiedAvatar(avatar, 'visibility', {
          size: 24,
          showAura: true,
          showStatus: true
        });
      } else {
        // Fallback to simple img if AvatarUtils not available
        avatarHTML = `<img src="${avatar.avatarUrl}" alt="${avatar.name || avatar.email}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 2px solid ${avatar.auraColor || window.AVATAR_FALLBACK_COLOR};">`;
      }
    } catch (error) {
      console.error('❌ VISIBILITY: Error creating unified avatar:', error);
      avatarHTML = `<img src="${avatar.avatarUrl}" alt="${avatar.name || avatar.email}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 2px solid ${avatar.aura_color || window.AVATAR_FALLBACK_COLOR};">`;
    }
    
    return `
      <li class="item" style="display: flex; align-items: center; gap: 8px; padding: 8px; border-bottom: 1px solid var(--border-color);">
        <div class="avatar-container" style="position: relative;">
          ${avatarHTML}
        </div>
        <div class="user-info" style="flex: 1;">
          <div class="user-name" style="font-weight: bold; color: var(--text-primary); font-size: 12px;">${avatar.name || avatar.email}</div>
          <div class="user-status" style="color: var(--text-secondary); font-size: 10px;">
            ${(() => {
              if ((avatar.isActive || avatar.status === 'online') && avatar.enterTime) {
                return formatTimeDisplay(avatar.enterTime);
              } else if ((avatar.status === 'recently_seen' || (!avatar.isActive && avatar.lastSeen)) && avatar.lastSeen) {
                return formatLastSeenDisplay(avatar.lastSeen);
              } else {
                return 'offline';
              }
            })()}
          </div>
        </div>
      </li>
    `;
  });
  
  const avatarHTMLStrings = await Promise.all(avatarHTMLPromises);
  
  // TAB ISOLATION: Ensure no visibility content exists in discuss-tab before adding
  const discussTab = document.getElementById('discuss-tab');
  if (discussTab) {
    const leakedVisibility = discussTab.querySelectorAll('.visible-users, .visible-header, .visible-count, #visible-search, #go-invisible-btn, [class*="visible"], [id*="visible"]');
    leakedVisibility.forEach(el => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.remove();
    });
    if (leakedVisibility.length > 0) {
      console.log('🧹 TAB ISOLATION: Removed', leakedVisibility.length, 'leaked visibility elements from #discuss-tab');
    }
  }
  
  // SD4 ARCHITECTURE FIX: Clear tab and ensure top alignment
  visibleTab.innerHTML = '';
  visibleTab.style.padding = '0';
  visibleTab.style.margin = '0';
  
  // SD4 FIX: Top-aligned with margin-top: 0 and padding-top for header
  visibleTab.innerHTML = `
    <div class="visible-users" style="padding: 0; margin: 0; width: 100%;">
      <div class="visible-header" style="display: flex; align-items: center; gap: 10px; margin-top: 0 !important; margin-bottom: 10px; padding: 8px; background: var(--background-secondary); border-radius: 6px;">
        <div class="visible-count" style="font-weight: bold; color: var(--text-primary);">
          ${usersWithAvatars.length} visible
        </div>
        <input type="text" id="visible-search" placeholder="Search users..." style="flex: 1; padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--background-primary); color: var(--text-primary); font-size: 12px;">
        <button id="go-invisible-btn" style="padding: 4px 8px; background: var(--accent-color); color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">Go Invisible</button>
      </div>
      <ul class="item-list" style="margin-top: 0 !important; padding-top: 0 !important;">
        ${avatarHTMLStrings.join('')}
      </ul>
    </div>
  `;
  
  // ARCHITECTURE FIX: CRITICAL validation - verify discuss-tab doesn't have visibility content
  if (discussTab) {
    const hasVisibilityContent = discussTab.querySelector('.visible-users, .visible-header, .visible-count, #visible-search, #go-invisible-btn');
    if (hasVisibilityContent) {
      console.error('🚨 TAB_ISOLATION: CRITICAL - Visibility content found in discuss-tab! Removing immediately...');
      discussTab.querySelectorAll('.visible-users, .visible-header, .visible-count, #visible-search, #go-invisible-btn, [class*="visible"], [id*="visible"]').forEach(el => el.remove());
    }
  }
  
  console.log('✅ VISIBILITY: Visible tab updated successfully');
  
  // COMP METHOD: Refresh all message avatars now that visibility data is available
  if (typeof window.refreshAllMessageAvatars === 'function') {
    console.log('🔧 VISIBILITY: Refreshing all message avatars with updated visibility data');
    try {
      await window.refreshAllMessageAvatars();
    } catch (error) {
      console.error('❌ VISIBILITY: Error refreshing message avatars:', error);
    }
  }
  
  // ROOT CAUSE FIX: Start periodic status refresh to update "Now" to "Online for X mins"
  // Clear any existing interval to prevent duplicates
  if (window.visibilityStatusRefreshInterval) {
    clearInterval(window.visibilityStatusRefreshInterval);
  }
  
  // Refresh status display every 30 seconds to update "Now" -> "Online for X mins"
  window.visibilityStatusRefreshInterval = setInterval(async () => {
    const visibleTab = document.getElementById('visibility-tab');
    if (visibleTab && window.currentVisibilityData?.active && window.currentVisibilityData.active.length > 0) {
      console.log('🔄 VISIBILITY: Periodic status refresh - updating time displays');
      try {
        await window.updateVisibleTab(window.currentVisibilityData.active);
      } catch (error) {
        console.error('❌ VISIBILITY: Error in periodic refresh:', error);
      }
    }
  }, 30000); // Every 30 seconds
  
  // Add search functionality
  const searchInput = document.getElementById('visible-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const items = visibleTab.querySelectorAll('.item');
      items.forEach(item => {
        const userName = item.querySelector('.user-name').textContent.toLowerCase();
        const isVisible = userName.includes(searchTerm);
        item.style.display = isVisible ? 'flex' : 'none';
      });
    });
  }
  
  // Add go invisible functionality
  const goInvisibleBtn = document.getElementById('go-invisible-btn');
  if (goInvisibleBtn) {
    goInvisibleBtn.addEventListener('click', async () => {
      console.log('🔍 VISIBILITY: Go invisible clicked');
      // TODO: Implement go invisible functionality
    });
  }
}


// Make available globally IMMEDIATELY (before any async operations)
if (typeof window !== 'undefined') {
  window.VisibilityManager = VisibilityManager;
  window.updateVisibleTab = updateVisibleTab;
  console.log('✅ VisibilityManager exported to window immediately');
}

// Wait for DOM ready before logging full initialization
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ VisibilityManager initialized (DOM ready)');
  });
} else {
  console.log('✅ VisibilityManager initialized');
}




