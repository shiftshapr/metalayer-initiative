/**
 * ProfileManager.js - User Profile Management Module
 * Extracted from sidepanel.js for modular architecture
 * 
 * Responsibilities:
 * - User profile display and updates
 * - Avatar management and updates
 * - Profile UI state management
 * - Profile data synchronization
 */

class ProfileManager {
  constructor() {
    this.profileData = null;
    this.avatarCache = new Map();
    this.updateCallbacks = [];
    
    Logger.info('ProfileManager initialized', null, 'profile');
    this.initializeProfileHandlers();
  }

  /**
   * Initialize profile event handlers
   */
  initializeProfileHandlers() {
    Logger.debug('Setting up profile handlers', null, 'profile');
    
    // Listen for user updates
    document.addEventListener('userUpdated', (event) => {
      this.handleUserUpdate(event.detail);
    });
    
    // Listen for avatar updates
    document.addEventListener('avatarUpdated', (event) => {
      this.handleAvatarUpdate(event.detail);
    });
    
    // Listen for profile UI updates
    document.addEventListener('authUIUpdate', (event) => {
      this.handleAuthUIUpdate(event.detail);
    });
  }

  /**
   * Handle user profile updates
   */
  handleUserUpdate(user) {
    Logger.profile('User profile updated', user);
    
    this.profileData = user;
    this.updateProfileUI();
    
    // Notify callbacks
    this.updateCallbacks.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        Logger.error('Profile callback error', error, 'profile');
      }
    });
  }

  /**
   * Handle avatar updates
   */
  handleAvatarUpdate(avatarData) {
    Logger.profile('Avatar updated', avatarData);
    
    if (this.profileData) {
      this.profileData.avatarUrl = avatarData.avatarUrl;
      this.profileData.avatarSource = avatarData.source;
      this.updateProfileAvatar();
    }
  }

  /**
   * Handle authentication UI updates
   */
  handleAuthUIUpdate(authData) {
    Logger.debug('Auth UI update received', authData, 'profile');
    
    if (authData.isAuthenticated && authData.user) {
      this.profileData = authData.user;
      this.updateProfileUI();
    } else {
      this.clearProfileUI();
    }
  }

  /**
   * Update profile UI with current user data
   */
  updateProfileUI() {
    if (!this.profileData) {
      Logger.warn('No profile data available for UI update', null, 'profile');
      return;
    }
    
    Logger.profile('Updating profile UI', {
      user: this.profileData.email,
      hasAvatar: !!this.profileData.avatarUrl
    });
    
    try {
      this.updateUserInfo();
      this.updateUserAvatar();
      this.updateUserMenu();
    } catch (error) {
      Logger.error('Profile UI update failed', error, 'profile');
    }
  }

  /**
   * Update user information display
   */
  updateUserInfo() {
    const userInfoDiv = document.getElementById('user-info');
    const userMenuName = document.getElementById('user-menu-name');
    
    if (userInfoDiv) {
      userInfoDiv.style.display = 'flex';
      Logger.debug('User info div displayed', null, 'profile');
    }
    
    if (userMenuName) {
      const displayName = this.profileData.name || this.profileData.email;
      userMenuName.textContent = displayName;
      Logger.debug(`User menu name set to: ${displayName}`, null, 'profile');
    }
  }

  /**
   * Update user avatar display
   */
  updateUserAvatar() {
    const userAvatarContainer = document.getElementById('user-avatar-container');
    
    if (!userAvatarContainer) {
      Logger.warn('User avatar container not found', null, 'profile');
      return;
    }
    
    Logger.profile('Updating user avatar', {
      avatarUrl: this.profileData.avatarUrl,
      auraColor: this.profileData.auraColor
    });
    
    try {
      // Use AvatarUtils for consistent avatar creation
      if (window.AvatarUtils) {
        const avatarHTML = window.AvatarUtils.createUnifiedAvatar(this.profileData, {
          context: 'profile',
          showAura: true,
          size: 32
        });
        
        userAvatarContainer.innerHTML = avatarHTML;
        Logger.profile('Avatar updated using AvatarUtils', null);
      } else {
        Logger.warn('AvatarUtils not available, using fallback', null, 'profile');
        this.createFallbackAvatar();
      }
    } catch (error) {
      Logger.error('Avatar update failed', error, 'profile');
      this.createFallbackAvatar();
    }
  }

  /**
   * Create fallback avatar when AvatarUtils is not available
   */
  createFallbackAvatar() {
    const userAvatarContainer = document.getElementById('user-avatar-container');
    if (!userAvatarContainer) return;
    
    const fallbackHTML = `
      <div style="position: relative; width: 32px; height: 32px;">
        <div style="position: absolute; top: -2px; left: -2px; width: 36px; height: 36px; border-radius: 50%; background-color: ${this.profileData.auraColor || '#aaaaaa'}; z-index: 1;"></div>
        <img src="${this.profileData.avatarUrl || 'https://lh3.googleusercontent.com/a/default-user=s96-c'}" 
             alt="${this.profileData.name || 'User'}" 
             style="position: relative; z-index: 2; width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid ${this.profileData.auraColor || '#aaaaaa'};">
      </div>
    `;
    
    userAvatarContainer.innerHTML = fallbackHTML;
    Logger.profile('Fallback avatar created', null);
  }

  /**
   * Update user menu display
   */
  updateUserMenu() {
    // Update any user menu elements
    const userMenuElements = document.querySelectorAll('[data-user-menu]');
    userMenuElements.forEach(element => {
      if (element.dataset.userMenu === 'name') {
        element.textContent = this.profileData.name || this.profileData.email;
      } else if (element.dataset.userMenu === 'email') {
        element.textContent = this.profileData.email;
      }
    });
  }

  /**
   * Clear profile UI when user signs out
   */
  clearProfileUI() {
    Logger.profile('Clearing profile UI', null);
    
    const userInfoDiv = document.getElementById('user-info');
    if (userInfoDiv) {
      userInfoDiv.style.display = 'none';
    }
    
    const userAvatarContainer = document.getElementById('user-avatar-container');
    if (userAvatarContainer) {
      userAvatarContainer.innerHTML = '';
    }
    
    this.profileData = null;
  }

  /**
   * Update user aura color
   */
  updateAuraColor(color) {
    if (!this.profileData) {
      Logger.warn('Cannot update aura color: no profile data', null, 'profile');
      return false;
    }
    
    Logger.profile('Updating aura color', { 
      oldColor: this.profileData.auraColor, 
      newColor: color 
    });
    
    this.profileData.auraColor = color;
    
    // Update avatar with new aura color
    this.updateUserAvatar();
    
    // Dispatch aura update event
    document.dispatchEvent(new CustomEvent('auraColorUpdated', {
      detail: {
        color: color,
        user: this.profileData
      }
    }));
    
    return true;
  }

  /**
   * Refresh profile avatar with latest data
   */
  refreshProfileAvatar() {
    Logger.profile('Refreshing profile avatar', null);
    
    if (!this.profileData) {
      Logger.warn('No profile data for avatar refresh', null, 'profile');
      return;
    }
    
    // Try to get latest avatar from visibility data
    if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
      const userInVisibility = window.currentVisibilityDataUnfiltered.active.find(
        u => u.email === this.profileData.email || u.userId === this.profileData.email
      );
      
      if (userInVisibility && userInVisibility.avatarUrl) {
        Logger.profile('Found updated avatar in visibility data', {
          oldAvatar: this.profileData.avatarUrl,
          newAvatar: userInVisibility.avatarUrl
        });
        
        this.profileData.avatarUrl = userInVisibility.avatarUrl;
        this.updateUserAvatar();
      }
    }
  }

  /**
   * Get current profile data
   */
  getProfileData() {
    return this.profileData;
  }

  /**
   * Register profile update callback
   */
  onProfileUpdate(callback) {
    this.updateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Cache avatar for performance
   */
  cacheAvatar(userId, avatarData) {
    this.avatarCache.set(userId, {
      ...avatarData,
      cachedAt: Date.now()
    });
  }

  /**
   * Get cached avatar
   */
  getCachedAvatar(userId) {
    const cached = this.avatarCache.get(userId);
    if (cached && Date.now() - cached.cachedAt < 300000) { // 5 minutes
      return cached;
    }
    return null;
  }

  /**
   * Clear avatar cache
   */
  clearAvatarCache() {
    this.avatarCache.clear();
    Logger.debug('Avatar cache cleared', null, 'profile');
  }

  /**
   * Get profile status for debugging
   */
  getProfileStatus() {
    return {
      hasProfileData: !!this.profileData,
      userEmail: this.profileData?.email || null,
      hasAvatar: !!this.profileData?.avatarUrl,
      avatarSource: this.profileData?.avatarSource || null,
      auraColor: this.profileData?.auraColor || null,
      callbacksRegistered: this.updateCallbacks.length,
      cacheSize: this.avatarCache.size
    };
  }
}

// Make available globally
window.ProfileManager = ProfileManager;

Logger.info('ProfileManager module loaded', null, 'profile');



