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
    
    console.log('ProfileManager initialized', null, 'profile');
    this.initializeProfileHandlers();
  }

  /**
   * Initialize profile event handlers
   */
  initializeProfileHandlers() {
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
    console.log('User profile updated', user);
    
    this.profileData = user;
    this.updateProfileUI();
    
    // Notify callbacks
    this.updateCallbacks.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Profile callback error', error, 'profile');
      }
    });
  }

  /**
   * Handle avatar updates
   */
  handleAvatarUpdate(avatarData) {
    console.log('Avatar updated', avatarData);
    
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
      console.warn('No profile data available for UI update', null, 'profile');
      return;
    }
    
    console.log('Updating profile UI', {
      user: this.profileData.email,
      hasAvatar: !!this.profileData.avatarUrl
    });
    
    try {
      this.updateUserInfo();
      this.updateUserAvatar();
      this.updateUserMenu();
    } catch (error) {
      console.error('Profile UI update failed', error, 'profile');
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
      }
    
    if (userMenuName) {
      const displayName = this.profileData.name || this.profileData.email;
      userMenuName.textContent = displayName;
      }
  }

  /**
   * Update user avatar display
   */
  updateUserAvatar() {
    const userAvatarContainer = document.getElementById('user-avatar-container');
    
    if (!userAvatarContainer) {
      console.warn('User avatar container not found', null, 'profile');
      return;
    }
    
    console.log('Updating user avatar', {
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
        console.log('Avatar updated using AvatarUtils', null);
      } else {
        console.warn('AvatarUtils not available, using fallback', null, 'profile');
        this.createFallbackAvatar();
      }
    } catch (error) {
      console.error('Avatar update failed', error, 'profile');
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
    console.log('Fallback avatar created', null);
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
    console.log('Clearing profile UI', null);
    
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
      console.warn('Cannot update aura color: no profile data', null, 'profile');
      return false;
    }
    
    console.log('Updating aura color', { 
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
    console.log('Refreshing profile avatar', null);
    
    if (!this.profileData) {
      console.warn('No profile data for avatar refresh', null, 'profile');
      return;
    }
    
    // Try to get latest avatar from visibility data
    if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
      const userInVisibility = window.currentVisibilityDataUnfiltered.active.find(
        u => u.email === this.profileData.email || u.userId === this.profileData.email
      );
      
      if (userInVisibility && userInVisibility.avatarUrl) {
        console.log('Found updated avatar in visibility data', {
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

// ===== GLOBAL AVATAR FUNCTIONS =====
function getCurrentUserAvatarBgColor() {
  if (window.currentUser && window.currentUser.auraColor) {
    return window.currentUser.auraColor;
  }
  return '#ffffff'; // Default white
}

function getCurrentUserAvatarColor() {
  if (window.currentUser && window.currentUser.auraColor) {
    return window.currentUser.auraColor;
  }
  return '#ffffff'; // Default white
}

function setCustomAvatarColor(color) {
  if (window.currentUser) {
    window.currentUser.auraColor = color;
    // Update profile if ProfileManager instance exists
    if (window.ProfileManager && window.ProfileManager.updateProfile) {
      window.ProfileManager.updateProfile(window.currentUser);
    }
  }
}

function resetCustomAvatarColor() {
  if (window.currentUser) {
    window.currentUser.auraColor = '#aaaaaa'; // Default gray
    // Update profile if ProfileManager instance exists
    if (window.ProfileManager && window.ProfileManager.updateProfile) {
      window.ProfileManager.updateProfile(window.currentUser);
    }
  }
}

// ===== PROFILE MENU FUNCTIONS (FROM COMP) =====
function handleAvatarClick(e) {
  const userAvatarContainer = document.getElementById('user-avatar-container');
  const userMenu = document.getElementById('user-menu');
  
  console.log('👤 Profile avatar clicked!');
  console.log('🔍 Current menu display:', userMenu.style.display);
  e.stopPropagation();
  
  // Toggle menu visibility
  if (userMenu.style.display === 'none' || userMenu.style.display === '') {
    userMenu.style.display = 'block';
  } else {
    userMenu.style.display = 'none';
  }
}

function handleClickOutside(e) {
  const userAvatarContainer = document.getElementById('user-avatar-container');
  const userMenu = document.getElementById('user-menu');
  
  if (userAvatarContainer && userMenu && !userAvatarContainer.contains(e.target) && !userMenu.contains(e.target)) {
    console.log('🖱️ Clicked outside, hiding menu');
    userMenu.style.display = 'none';
  }
}

function addProfileAvatarClickHandler() {
  const userAvatarContainer = document.getElementById('user-avatar-container');
  const userMenu = document.getElementById('user-menu');
  if (userAvatarContainer && userMenu) {
    // Remove any existing click listeners to avoid duplicates
    userAvatarContainer.removeEventListener('click', handleAvatarClick);
    userAvatarContainer.addEventListener('click', handleAvatarClick);
    
    // Add click-outside listener only once
    if (!window.clickOutsideListenerAdded) {
      document.addEventListener('click', handleClickOutside);
      window.clickOutsideListenerAdded = true;
    }
    
    console.log('✅ Profile avatar click handler added');
  } else {
    console.log('❌ Profile avatar container or menu not found');
  }
}

// ===== PROFILE MENU ITEM HANDLERS (FROM COMP) =====
function addAuraButtonClickHandler() {
  const auraBtn = document.getElementById('aura-btn');
  if (auraBtn) {
    auraBtn.addEventListener('click', (e) => {
      console.log('🎨 Aura button clicked!');
      e.stopPropagation(); // Prevent menu from closing
      if (typeof window.showColorPickerModal === 'function') {
        window.showColorPickerModal();
      } else {
        console.log('❌ showColorPickerModal not available');
      }
    });
    console.log('✅ Aura button click handler added');
  } else {
    console.log('❌ Aura button not found');
  }
}

function addThemeToggleButtonClickHandler() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
      console.log('🌙 Theme toggle button clicked!');
      e.stopPropagation(); // Prevent menu from closing
      if (typeof window.toggleTheme === 'function') {
        window.toggleTheme();
      } else {
        console.log('❌ toggleTheme not available');
      }
    });
    console.log('✅ Theme toggle button click handler added');
  } else {
    console.log('❌ Theme toggle button not found');
  }
}

function addLogoutButtonClickHandler() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      console.log('🚪 Logout button clicked!');
      e.stopPropagation(); // Prevent menu from closing
      if (typeof window.logout === 'function') {
        window.logout();
      } else {
        console.log('❌ logout function not available');
      }
    });
    console.log('✅ Logout button click handler added');
  } else {
    console.log('❌ Logout button not found');
  }
}

function addAllProfileMenuHandlers() {
  console.log('🎯 PROFILE_MENU: Adding all profile menu handlers...');
  addAuraButtonClickHandler();
  addThemeToggleButtonClickHandler();
  addLogoutButtonClickHandler();
  console.log('✅ PROFILE_MENU: All profile menu handlers added');
}

// ===== AURA COLOR MODAL (FROM COMP) =====
function showColorPickerModal() {
  console.log('🎨 Opening color picker modal...');
  
  // Check if modal already exists and is visible
  const existingModal = document.getElementById('color-picker-modal');
  if (existingModal) {
    console.log('🎨 Modal already exists, showing it');
    existingModal.style.display = 'flex';
    return;
  }
  
  // Create modal HTML
  const modalHTML = `
    <div class="color-picker-modal" id="color-picker-modal" style="display: flex;">
      <div class="color-picker-content">
        <div class="color-picker-header">
          <h3 class="color-picker-title">Change Aura Color</h3>
          <button class="color-picker-close" id="color-picker-close">&times;</button>
        </div>
        <div class="color-picker-input-group">
          <label class="color-picker-label" for="color-input">Hex Color (without #):</label>
          <input type="text" class="color-picker-input" id="color-input" placeholder="45B7D1" maxlength="6">
        </div>
        <div class="color-picker-preview">
          <div class="color-picker-preview-circle" id="color-preview-circle">D</div>
          <div class="color-picker-preview-text" id="color-preview-text">Preview</div>
        </div>
        <div class="color-picker-buttons">
          <button class="color-picker-btn" id="color-picker-reset">Reset to Default</button>
          <button class="color-picker-btn primary" id="color-picker-save">Save Color</button>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Wait for DOM to be ready before attaching event listeners
  setTimeout(() => {
    const modal = document.getElementById('color-picker-modal');
    const colorInput = document.getElementById('color-input');
    const previewCircle = document.getElementById('color-preview-circle');
    const previewText = document.getElementById('color-preview-text');
    const closeBtn = document.getElementById('color-picker-close');
    const resetBtn = document.getElementById('color-picker-reset');
    const saveBtn = document.getElementById('color-picker-save');
    
    if (!modal || !colorInput || !previewCircle || !previewText || !closeBtn || !resetBtn || !saveBtn) {
      console.error('❌ Modal elements not found after creation');
      return;
    }
    
    // Get current color and set initial values
    const currentColor = getCurrentUserAvatarBgColor();
    const currentHex = currentColor.replace('#', '');
    colorInput.value = currentHex;
    updateColorPreview(currentHex);
    
    // Remove any existing event listeners to prevent duplicates
    const newColorInput = colorInput.cloneNode(true);
    colorInput.parentNode.replaceChild(newColorInput, colorInput);
    
    // Event listeners
    newColorInput.addEventListener('input', (e) => {
      const hex = e.target.value.replace('#', '');
      updateColorPreview(hex);
    });
    
    closeBtn.addEventListener('click', closeColorPickerModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeColorPickerModal();
    });
    
    resetBtn.addEventListener('click', () => {
      // Get the dynamic default color (based on user's name) - use window.currentUser
      let defaultColor = '#45B7D1'; // Fallback
      const user = window.currentUser;
      if (user) {
        const name = user.user_metadata?.full_name || user.name || user.email || 'User';
        defaultColor = getAvatarColor(name);
      }
      const defaultHex = defaultColor.replace('#', '');
      newColorInput.value = defaultHex;
      updateColorPreview(defaultHex);
    });
    
    saveBtn.addEventListener('click', async () => {
      const hex = newColorInput.value.replace('#', '');
      if (isValidHex(hex)) {
        console.log('🎨 Saving aura color:', '#' + hex);
        const auraColor = '#' + hex;
        console.log('🎨 Setting aura color:', auraColor);
        
        // Apply aura color to profile avatar using unified system
        if (window.currentUser) {
          window.currentUser.auraColor = auraColor;
          if (typeof window.updateUI === 'function') {
            window.updateUI(window.currentUser);
          }
        }
        
        // Save aura color to storage
        if (typeof window.setState === 'function') {
          window.setState('userAvatarBgColor', auraColor);
        }
        
        closeColorPickerModal();
      } else {
        alert('Please enter a valid 6-digit hex color (e.g., 45B7D1)');
      }
    });
    
    // Focus the input
    newColorInput.focus();
    newColorInput.select();
    
    console.log('🎨 Modal setup complete');
  }, 50);
}

function closeColorPickerModal() {
  const modal = document.getElementById('color-picker-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function updateColorPreview(hex) {
  const previewCircle = document.getElementById('color-preview-circle');
  const previewText = document.getElementById('color-preview-text');
  
  if (previewCircle && previewText) {
    const color = '#' + hex;
    previewCircle.style.backgroundColor = color;
    previewText.textContent = color;
  }
}

function isValidHex(hex) {
  return /^[A-Fa-f0-9]{6}$/.test(hex);
}

function getAvatarColor(name) {
  // Simple hash function to generate consistent colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

// Make available globally
window.ProfileManager = ProfileManager;
window.getCurrentUserAvatarBgColor = getCurrentUserAvatarBgColor;
window.getCurrentUserAvatarColor = getCurrentUserAvatarColor;
window.setCustomAvatarColor = setCustomAvatarColor;
window.resetCustomAvatarColor = resetCustomAvatarColor;
window.handleAvatarClick = handleAvatarClick;
window.handleClickOutside = handleClickOutside;
window.addProfileAvatarClickHandler = addProfileAvatarClickHandler;
window.addAuraButtonClickHandler = addAuraButtonClickHandler;
window.addThemeToggleButtonClickHandler = addThemeToggleButtonClickHandler;
window.addLogoutButtonClickHandler = addLogoutButtonClickHandler;
window.addAllProfileMenuHandlers = addAllProfileMenuHandlers;
window.showColorPickerModal = showColorPickerModal;
window.closeColorPickerModal = closeColorPickerModal;
window.updateColorPreview = updateColorPreview;
window.isValidHex = isValidHex;
window.getAvatarColor = getAvatarColor;

console.log('ProfileManager module loaded', null, 'profile');




