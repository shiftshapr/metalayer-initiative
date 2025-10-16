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
            auraColor: user.aura_color || '#aaaaaa',
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
            auraColor: user.aura_color || '#aaaaaa',
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

// Make available globally
if (typeof window !== 'undefined') {
  window.VisibilityManager = VisibilityManager;
}

console.log('✅ VisibilityManager initialized');
