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
            userId: user.user_email,
            email: user.user_email,
            name: userProfile?.name || user.user_email.split('@')[0],
            handle: userProfile?.handle || user.user_email.split('@')[0],
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
            userEmail: user.user_email,
            error: error.message 
          });
          
          // Return basic user data without avatar
          return {
            id: user.user_email,
            userId: user.user_email,
            email: user.user_email,
            name: user.user_email.split('@')[0],
            handle: user.user_email.split('@')[0],
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
        userEmail: newRecord?.user_email || oldRecord?.user_email,
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
  
  // COMP METHOD: Do NOT add current user to visibility list - they should not see themselves
  console.log('🔍 VISIBILITY: Current user should not appear in their own visibility list');
  
  // Store visibility data globally for real-time aura color access
  window.currentVisibilityData = { active: avatars };
  
  // Clear any existing visibility update timer
  if (window.visibilityUpdateTimer) {
    clearInterval(window.visibilityUpdateTimer);
  }
  
  console.log('🔄 VISIBILITY: Stored visibility data globally for real-time aura access');
  
  const visibleTab = document.getElementById('canopi-visible');
  if (!visibleTab) {
    console.log('❌ VISIBILITY: visibleTab element not found');
    return;
  }
  
  console.log(`VISIBILITY: Updating visible tab with ${avatars.length} avatars`);
  
  // Get current user email for filtering
  const currentUserEmail = await getCurrentUserEmail();
  console.log(`VISIBILITY: Current user email: ${currentUserEmail}`);
  
  // Store the UNFILTERED data globally BEFORE filtering out current user
  window.currentVisibilityDataUnfiltered = { active: avatars };
  console.log(`VISIBILITY_UNFILTERED: Stored ${avatars.length} avatars (including current user) for profile avatar lookup`);
  
  // COMP METHOD: Strict filtering - remove current user completely
  const usersWithAvatars = avatars.filter(avatar => {
    const userIdMatch = avatar.userId === currentUserEmail;
    const handleMatch = avatar.handle === currentUserEmail.split('@')[0];
    const nameMatch = avatar.name === currentUserEmail.split('@')[0];
    const emailMatch = avatar.email === currentUserEmail;
    const idMatch = avatar.id === currentUserEmail;
    
    const isCurrentUser = userIdMatch || handleMatch || nameMatch || emailMatch || idMatch;
    
    if (isCurrentUser) {
      console.log(`🔧 VISIBILITY: COMP METHOD - Strictly filtering out current user:`, avatar.name);
      return false;
    }
    
    console.log(`🔧 VISIBILITY: COMP METHOD - Keeping avatar: ${avatar.name} (${avatar.userId})`);
    return true;
  });
  
  console.log(`🔧 VISIBILITY: COMP METHOD - Strictly filtered avatars:`, usersWithAvatars.length, 'of', avatars.length);
  
  console.log(`VISIBILITY: Showing ${usersWithAvatars.length} users with real avatars (filtered from ${avatars.length} total)`);
  
  // Create a compact header with search, count, and go invisible button
  visibleTab.innerHTML = `
    <div class="visible-users">
      <div class="visible-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 8px; background: var(--background-secondary); border-radius: 6px;">
        <div class="visible-count" style="font-weight: bold; color: var(--text-primary);">
          ${usersWithAvatars.length} visible
        </div>
        <input type="text" id="visible-search" placeholder="Search users..." style="flex: 1; padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--background-primary); color: var(--text-primary); font-size: 12px;">
        <button id="go-invisible-btn" style="padding: 4px 8px; background: var(--accent-color); color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">Go Invisible</button>
      </div>
      <ul class="item-list">
        ${usersWithAvatars.map((avatar, index) => {
          const isActive = avatar.isActive === true;
          const hasLeft = avatar.status === 'offline' || !isActive;
          
          return `
            <li class="item" style="display: flex; align-items: center; gap: 8px; padding: 8px; border-bottom: 1px solid var(--border-color);">
              <div class="avatar-container" style="position: relative; width: 32px; height: 32px;">
                <img src="${avatar.avatarUrl || '/icons/default-user.svg'}" 
                     alt="${avatar.name}" 
                     style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${avatar.auraColor || window.AVATAR_FALLBACK_COLOR};">
              </div>
              <div class="user-info" style="flex: 1; min-width: 0;">
                <div class="user-name" style="font-weight: bold; color: var(--text-primary); font-size: 14px;">${avatar.name}</div>
                <div class="user-status" style="font-size: 12px; color: ${isActive ? 'var(--success-color)' : 'var(--text-secondary)'};">
                  ${isActive ? 
                    (avatar.enterTime ? formatTimeDisplay(avatar.enterTime) : 'Online') : 
                    (avatar.lastSeen ? formatLastSeenDisplay(avatar.lastSeen) : 'Never seen')
                  }
                </div>
              </div>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
  `;
  
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


// Make available globally
if (typeof window !== 'undefined') {
  window.VisibilityManager = VisibilityManager;
  window.updateVisibleTab = updateVisibleTab;
}

console.log('✅ VisibilityManager initialized');




