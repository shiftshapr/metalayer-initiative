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
    this.isAuthenticated = false;
    this.authPromise = null;

    console.log('ProfileManager initialized', null, 'profile');
    this.initializeProfileHandlers();

    // CRITICAL FIX: Initialize avatar immediately with available data, don't wait for everything
    this.initializeProfileAvatarImmediately();

    // Still set up the waiting mechanism for updates
    this.waitForAuthentication();
  }

  /**
   * Wait for authentication AND pre-render initialization to complete using proper async/promises
   */
  async waitForAuthentication() {
    console.log('🔧 PROFILE_MANAGER: Waiting for authentication and pre-render data...');

    // Create promises for each dependency
    const waitForAuth = new Promise((resolve) => {
      if (window.currentUser && window.currentUser.id) {
        console.log('🔧 PROFILE_MANAGER: Authentication already available');
        resolve();
        return;
      }

      console.log('🔧 PROFILE_MANAGER: Waiting for authentication...');

      // Listen for auth events (these may already be fired, so check immediately)
      const checkAuth = () => {
        if (window.currentUser && window.currentUser.id) {
          console.log('🔧 PROFILE_MANAGER: Authentication completed:', window.currentUser.email);
          resolve();
        }
      };

      // Check immediately in case auth already happened
      checkAuth();

      // Listen for future auth completion events
      document.addEventListener('authUIUpdate', (e) => {
        if (e.detail?.isAuthenticated && e.detail?.user) {
          checkAuth();
        }
      }, { once: true });
      document.addEventListener('userUpdated', (e) => {
        if (e.detail && e.detail.id) {
          checkAuth();
        }
      }, { once: true });
    });

    const waitForPreRender = new Promise((resolve) => {
      if (window.preRenderInitializer && window.preRenderInitializer.isInitialized) {
        console.log('🔧 PROFILE_MANAGER: Pre-render already initialized');
        resolve();
        return;
      }

      console.log('🔧 PROFILE_MANAGER: Waiting for pre-render initialization...');

      // Listen for pre-render events
      const checkPreRender = () => {
        if (window.preRenderInitializer && window.preRenderInitializer.isInitialized) {
          console.log('🔧 PROFILE_MANAGER: Pre-render initialization completed');
          const preRenderData = window.preRenderInitializer.getPreRenderData();
          console.log('🔧 PROFILE_MANAGER: Pre-render data:', {
            hasAuraColor: !!preRenderData.auraColor,
            hasAvatarUrl: !!preRenderData.avatarUrl,
            auraColor: preRenderData.auraColor
          });
          resolve();
        }
      };

      // Check immediately in case pre-render already happened
      checkPreRender();

      // Listen for future pre-render completion events
      document.addEventListener('preRenderComplete', checkPreRender, { once: true });
    });

    // Add timeout as fallback (30 seconds max)
    const timeout = new Promise((resolve) => {
      setTimeout(() => {
        console.warn('🔧 PROFILE_MANAGER: Timeout waiting for full initialization (30s)');
        console.warn('🔧 PROFILE_MANAGER: Proceeding with available data...');
        resolve();
      }, 30000);
    });

    // Wait for all promises to resolve (auth + pre-render + timeout fallback)
    try {
      await Promise.all([waitForAuth, waitForPreRender, timeout]);
      console.log('🔧 PROFILE_MANAGER: All initialization promises resolved');
    } catch (error) {
      console.error('🔧 PROFILE_MANAGER: Error waiting for promises:', error);
    }

    // Check final state and proceed
    const hasUser = window.currentUser && window.currentUser.id;
    const preRenderReady = window.preRenderInitializer && window.preRenderInitializer.isInitialized;

    if (hasUser) {
      this.isAuthenticated = true;
      console.log('🔧 PROFILE_MANAGER: Ready to initialize profile avatar...');
      await this.initializeProfileAvatar();
    } else {
      console.warn('🔧 PROFILE_MANAGER: No authentication available, skipping profile avatar initialization');
    }
  }

  /**
   * CRITICAL FIX: Initialize profile avatar with pre-render data to prevent white flash
   */
  async initializeProfileAvatarImmediately() {
    console.log('🔧 PROFILE_MANAGER: Initializing profile avatar with pre-render data to prevent white flash...');

    // CRITICAL FIX: Wait for PreRenderInitializer to complete before rendering avatar
    // This prevents the 10-15 second white flash while waiting for database auraColor
    if (!window.preRenderInitializer?.isInitialized) {
      console.log('⏳ PROFILE_MANAGER: Waiting for PreRenderInitializer to complete...');

      // Wait for pre-render initialization to complete (max 10 seconds)
      const preRenderPromise = new Promise((resolve) => {
        const checkPreRender = () => {
          if (window.preRenderInitializer?.isInitialized) {
            console.log('✅ PROFILE_MANAGER: PreRenderInitializer completed, proceeding with avatar setup');
            resolve();
          } else {
            // Check again in 100ms
            setTimeout(checkPreRender, 100);
          }
        };

        // Start checking immediately
        checkPreRender();

        // Timeout after 10 seconds to prevent infinite waiting
        setTimeout(() => {
          console.log('⏰ PROFILE_MANAGER: PreRenderInitializer timeout reached, proceeding anyway');
          resolve();
        }, 10000);
      });

      await preRenderPromise;
    }

    // Now get the complete pre-render data
    const currentUser = window.currentUser;
    const preRenderData = window.preRenderInitializer?.getPreRenderData();

    console.log('🔧 PROFILE_MANAGER: Pre-render data available:', {
      isInitialized: preRenderData?.isInitialized,
      hasAuraColor: !!preRenderData?.auraColor,
      auraColor: preRenderData?.auraColor,
      hasAvatarUrl: !!preRenderData?.avatarUrl,
      avatarUrl: preRenderData?.avatarUrl?.substring(0, 50) + '...'
    });

    // If we have user data, create the avatar with complete information
    if (currentUser?.id || preRenderData?.userData?.id) {
      console.log('🔧 PROFILE_MANAGER: User data available, setting up avatar with complete data...');

      // Set basic profile data from currentUser
      if (currentUser) {
        this.profileData = { ...currentUser };
      }

      // CRITICAL FIX: Check Chrome storage FIRST for instant display
      let auraColorValue = null;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
          const storageResult = await new Promise((resolve) => {
            chrome.storage.local.get(['userAuraColor', 'auraColor'], (result) => {
              resolve(result);
            });
          });
          
          const cachedAuraColor = storageResult.userAuraColor || storageResult.auraColor;
          if (cachedAuraColor && cachedAuraColor !== '#ffffff' && cachedAuraColor !== 'white' && cachedAuraColor !== '#fff') {
            auraColorValue = cachedAuraColor;
            console.log('🎨 PROFILE_MANAGER: Using aura color from Chrome storage (CACHE):', auraColorValue);
          }
        } catch (error) {
          console.warn('⚠️ PROFILE_MANAGER: Could not read from Chrome storage:', error);
        }
      }

      // Apply pre-render aura color (takes precedence over cache - this should be the database value)
      if (!auraColorValue && preRenderData?.auraColor) {
        auraColorValue = preRenderData.auraColor;
        console.log('🎨 PROFILE_MANAGER: Using auraColor from pre-render data (DATABASE):', auraColorValue);
        
        // Cache database value in Chrome storage for next time
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          try {
            await new Promise((resolve) => {
              chrome.storage.local.set({ userAuraColor: auraColorValue, auraColor: auraColorValue }, () => {
                console.log('💾 PROFILE_MANAGER: Cached aura color in Chrome storage:', auraColorValue);
                resolve();
              });
            });
          } catch (error) {
            console.warn('⚠️ PROFILE_MANAGER: Could not cache to Chrome storage:', error);
          }
        }
      }

      if (auraColorValue) {
        if (this.profileData) {
          this.profileData.auraColor = auraColorValue;
          this.profileData.aura_color = auraColorValue;
        }
        if (currentUser) {
          currentUser.auraColor = auraColorValue;
          currentUser.aura_color = auraColorValue;
        }
      } else {
        console.log('⚠️ PROFILE_MANAGER: No auraColor in cache or pre-render data, will fallback to auth data or API fetch');
      }

      // Apply pre-render avatar URL if available
      if (preRenderData?.avatarUrl && currentUser) {
        currentUser.avatarUrl = preRenderData.avatarUrl;
        if (this.profileData) {
          this.profileData.avatarUrl = preRenderData.avatarUrl;
        }
        console.log('🖼️ PROFILE_MANAGER: Using avatarUrl from pre-render data');
      }

      // Verify we have the auraColor before rendering
      if (this.profileData && (this.profileData.auraColor || this.profileData.aura_color)) {
        console.log('🎉 PROFILE_MANAGER: AuraColor available from pre-render/auth data - no white flash!');
      } else {
        console.log('⚠️ PROFILE_MANAGER: AuraColor still missing - will cause white flash');
      }

      // Set up the profile menu and avatar with complete data
      await this.setupProfileMenuAndAuraModal();

      console.log('✅ PROFILE_MANAGER: Profile avatar initialized with complete pre-render data');
    } else {
      console.log('🔧 PROFILE_MANAGER: No user data available, will initialize when authentication completes');
    }
  }

  /**
   * Initialize profile avatar after authentication
   */
  async initializeProfileAvatar() {
    console.log('🔧 PROFILE_MANAGER: Initializing profile avatar after authentication...');

    // Load aura color from storage if not already set
    await this.loadAuraColorFromStorage();

    // Set up the profile menu and avatar now that we have user data
    await this.setupProfileMenuAndAuraModal();
  }

  /**
   * Load aura color from pre-render data or storage
   */
  async loadAuraColorFromStorage() {
    try {
      console.log('🔧 PROFILE_MANAGER: Loading aura color from available sources...');

      // First priority: Check pre-render initializer data
      if (window.preRenderInitializer?.getPreRenderData) {
        const preRenderData = window.preRenderInitializer.getPreRenderData();
        console.log('🔧 PROFILE_MANAGER: Pre-render data available:', {
          isInitialized: preRenderData.isInitialized,
          auraColor: preRenderData.auraColor,
          avatarUrl: preRenderData.avatarUrl
        });

        if (preRenderData.auraColor && window.currentUser) {
          console.log('🎨 PROFILE_MANAGER: Using aura color from pre-render data (DATABASE):', preRenderData.auraColor);
          window.currentUser.auraColor = preRenderData.auraColor;
          window.currentUser.aura_color = preRenderData.auraColor;

          // Update profile data if it exists
          if (this.profileData) {
            this.profileData.auraColor = preRenderData.auraColor;
            this.profileData.aura_color = preRenderData.auraColor;
          }
          console.log('✅ PROFILE_MANAGER: Aura color applied to currentUser and profileData');
          return; // Don't check storage if we have pre-render data
        } else if (preRenderData.isInitialized) {
          console.log('ℹ️ PROFILE_MANAGER: Pre-render initialized but no aura color available');
        } else {
          console.log('⏳ PROFILE_MANAGER: Pre-render data available but not yet initialized');
        }
      } else {
        console.log('⚠️ PROFILE_MANAGER: Pre-render initializer not available');
      }

      // Fallback: Load aura color from state storage (set by aura color modal)
      if (typeof window.getState === 'function') {
        const storedColor = window.getState('userAvatarBgColor');
        console.log('🔧 PROFILE_MANAGER: Checking storage for aura color:', storedColor);

        if (storedColor && storedColor !== window.AVATAR_FALLBACK_COLOR && window.currentUser) {
          console.log('🎨 PROFILE_MANAGER: Using aura color from storage (USER PREFERENCE):', storedColor);
          window.currentUser.auraColor = storedColor;
          window.currentUser.aura_color = storedColor;

          // Update profile data if it exists
          if (this.profileData) {
            this.profileData.auraColor = storedColor;
            this.profileData.aura_color = storedColor;
          }
          console.log('✅ PROFILE_MANAGER: Aura color applied from storage');
        } else {
          console.log('ℹ️ PROFILE_MANAGER: No valid aura color in storage');
        }
      } else {
        console.log('⚠️ PROFILE_MANAGER: State storage not available');
      }

      // Last resort: Try to fetch aura color directly from API
      if (window.currentUser?.id && window.api && !this.profileData?.auraColor) {
        console.log('🔍 PROFILE_MANAGER: Last resort - fetching aura color directly from API...');
        try {
          const userResponse = await window.api.request(`/v1/users/${window.currentUser.id}`, {
            method: 'GET'
          });

          if (userResponse && (userResponse.auraColor || userResponse.aura_color)) {
            const apiAuraColor = userResponse.auraColor || userResponse.aura_color;
            console.log('🎨 PROFILE_MANAGER: Retrieved aura color from API (fallback):', apiAuraColor);

            window.currentUser.auraColor = apiAuraColor;
            window.currentUser.aura_color = apiAuraColor;

            // Update profile data if it exists
            if (this.profileData) {
              this.profileData.auraColor = apiAuraColor;
              this.profileData.aura_color = apiAuraColor;
            }

            console.log('✅ PROFILE_MANAGER: Aura color applied from API fallback');
            return;
          } else {
            console.log('⚠️ PROFILE_MANAGER: API response received but no aura color found');
          }
        } catch (apiError) {
          console.warn('⚠️ PROFILE_MANAGER: API fallback failed:', apiError.message);
        }
      }

    } catch (error) {
      console.log('🔧 PROFILE_MANAGER: Could not load aura color from storage:', error);
    }
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

    // Listen for aura color updates
    document.addEventListener('auraColorUpdated', (event) => {
      this.handleAuraColorUpdate(event.detail);
    });

    // COMP METHOD: Initialize profile menu and aura modal fixes
    this.initializeProfileMenuAndAuraModal();
  }

  /**
   * COMP METHOD: Initialize profile menu and aura modal with error handling
   */
  initializeProfileMenuAndAuraModal() {
    console.log('🔧 PROFILE MANAGER: COMP METHOD - Initializing profile menu and aura modal...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupProfileMenuAndAuraModal());
    } else {
      this.setupProfileMenuAndAuraModal();
    }
  }

  /**
   * COMP METHOD: Setup profile menu and aura modal
   */
  async setupProfileMenuAndAuraModal() {
    console.log('🔧 PROFILE MANAGER: COMP METHOD - Setting up profile menu and aura modal...');

    // Find or create user avatar container
    let userAvatarContainer = document.getElementById('user-avatar-container');
    if (!userAvatarContainer) {
      console.log('🔧 PROFILE MANAGER: COMP METHOD - Creating user avatar container...');
      userAvatarContainer = document.createElement('div');
      userAvatarContainer.id = 'user-avatar-container';
      userAvatarContainer.className = 'user-avatar-container';
      userAvatarContainer.style.cssText = `
        position: relative;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 8px;
        background: #f5f5f5;
        margin: 8px;
      `;

      // Add to sidebar
      const sidebar = document.querySelector('.sidebar, .sidepanel, #sidebar, #sidepanel') || document.body;
      sidebar.appendChild(userAvatarContainer);
    } else {
      console.log('🔧 PROFILE MANAGER: COMP METHOD - Found existing user avatar container, updating size for profile avatar...');
      // Update existing container size to accommodate profile avatar (32px + 2px aura extension on each side)
      userAvatarContainer.style.width = '36px';  // 32px avatar + 2px aura extension on each side
      userAvatarContainer.style.height = '36px'; // 32px avatar + 2px aura extension on each side
      userAvatarContainer.style.minWidth = '36px';
      userAvatarContainer.style.minHeight = '36px';
    }

    // Create user avatar if it doesn't exist
    let userAvatar = userAvatarContainer.querySelector('.user-avatar');
    if (!userAvatar) {
      console.log('🔧 PROFILE MANAGER: COMP METHOD - Creating user avatar...');

      // Use AvatarUtils for proper avatar creation with aura color
      if (window.AvatarUtils && window.currentUser) {
        try {
          // ROOT CAUSE FIX: Use getCurrentUserAuraColor() for latest aura color (prioritizes Chrome storage, then database)
          let auraColorValue = null;
          let fromChromeStorage = false;
          
          if (typeof window.getCurrentUserAuraColor === 'function') {
            try {
              auraColorValue = await window.getCurrentUserAuraColor();
              console.log('🎨 PROFILE MANAGER: Using aura color from getCurrentUserAuraColor():', auraColorValue);
              fromChromeStorage = true; // getCurrentUserAuraColor prioritizes Chrome storage
            } catch (error) {
              console.warn('⚠️ PROFILE MANAGER: Error calling getCurrentUserAuraColor():', error);
            }
          }
          
          // Fallback to profileData/currentUser if getCurrentUserAuraColor not available
          if (!auraColorValue) {
            auraColorValue = this.profileData?.auraColor || this.profileData?.aura_color || window.currentUser?.auraColor || window.currentUser?.aura_color;
          }

          // CRITICAL FIX: Use profileData if available (has aura color), otherwise fall back to currentUser
          const userDataForAvatar = {
            ...(this.profileData || window.currentUser),
            auraColor: auraColorValue || this.profileData?.auraColor || window.currentUser.auraColor,
            aura_color: auraColorValue || this.profileData?.aura_color || window.currentUser.aura_color
          };

          console.log('🔧 PROFILE MANAGER: COMP METHOD - Creating avatar with user data:', {
            userId: userDataForAvatar.id,
            auraColor: userDataForAvatar.auraColor,
            avatarUrl: userDataForAvatar.avatarUrl,
            usingProfileData: !!this.profileData,
            fromChromeStorage: fromChromeStorage,
            timestamp: new Date().toISOString()
          });

          // ROOT CAUSE FIX: Ensure availability is set for status dots
          if (!userDataForAvatar.availability) {
            // Try to get from currentUser first
            if (window.currentUser && (window.currentUser.availability || window.currentUser.globalAvailability)) {
              userDataForAvatar.availability = window.currentUser.availability || window.currentUser.globalAvailability;
            } else if (window.currentVisibilityDataUnfiltered?.active) {
              // Try to get from visibility data
              const currentUserInVisibility = window.currentVisibilityDataUnfiltered.active.find(u => 
                String(u.id || u.userId || u.user_id) === String(window.currentUser?.id)
              );
              if (currentUserInVisibility && currentUserInVisibility.availability) {
                userDataForAvatar.availability = currentUserInVisibility.availability;
              }
            }
            // Default to AVAILABLE if active, OFFLINE if not
            if (!userDataForAvatar.availability) {
              userDataForAvatar.availability = (userDataForAvatar.isActive || userDataForAvatar.is_active) ? 'AVAILABLE' : 'OFFLINE';
            }
          }
          
          const avatarHTML = await window.AvatarUtils.createUnifiedAvatar(userDataForAvatar, 'profile', {
            showAura: true,
            showStatus: true,  // ROOT CAUSE FIX: Enable status dots on profile avatar
            size: 32
          });

          console.log('🔧 PROFILE MANAGER: COMP METHOD - Avatar HTML generated, updating container at', new Date().toISOString());
          userAvatarContainer.innerHTML = avatarHTML;

          // Log what was actually inserted
          console.log('🔧 PROFILE MANAGER: COMP METHOD - Container updated, innerHTML length:', userAvatarContainer.innerHTML.length);
          console.log('🔧 PROFILE MANAGER: COMP METHOD - Container updated, checking for aura element...');
          const auraElement = userAvatarContainer.querySelector('.avatar-aura');
          if (auraElement) {
            console.log('✅ PROFILE MANAGER: COMP METHOD - Aura element found with background:', auraElement.style.backgroundColor);
          } else {
            console.log('⚠️ PROFILE MANAGER: COMP METHOD - Aura element NOT found in avatar HTML');
          }

          console.log('✅ PROFILE MANAGER: COMP METHOD - User avatar created using AvatarUtils with aura color');
        } catch (error) {
          console.error('🔧 PROFILE MANAGER: COMP METHOD - Error creating avatar with AvatarUtils:', error);
          // Fallback to simple avatar
          this.createFallbackAvatar();
        }
      } else {
        console.log('⚠️ PROFILE MANAGER: COMP METHOD - AvatarUtils or currentUser not available, using fallback');
        // Fallback avatar creation
        this.createFallbackAvatar();
      }
    }
    
    // ROOT CAUSE FIX: Remove existing handler if it exists, then add new one
    // Use a data attribute to track if handler is already attached
    if (userAvatarContainer.dataset.clickHandlerAttached === 'true') {
      // Handler already attached, skip to prevent duplicates
      console.log('🔧 PROFILE MANAGER: Click handler already attached, skipping');
      return;
    }
    
    // ROOT CAUSE FIX: Add click handler with proper event handling
    userAvatarContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      console.log('🔧 PROFILE MANAGER: COMP METHOD - Profile avatar clicked');
      this.toggleUserMenu(e); // Pass event to toggleUserMenu
    });
    
    // Mark handler as attached
    userAvatarContainer.dataset.clickHandlerAttached = 'true';
    
    console.log('✅ PROFILE MANAGER: COMP METHOD - Profile menu and aura modal setup complete');
  }

  /**
   * COMP METHOD: Toggle user menu
   */
  async toggleUserMenu(e) {
    console.log('🔧 PROFILE MANAGER: COMP METHOD - Toggling user menu...');

    // ROOT CAUSE FIX: Stop event propagation to prevent immediate click-outside handler
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    let userMenu = document.getElementById('user-menu');
    if (!userMenu) {
      console.log('🔧 PROFILE MANAGER: COMP METHOD - Menu not found, creating...');
      await this.createUserMenu();
      userMenu = document.getElementById('user-menu');
    }
    
    if (userMenu) {
      const isVisible = userMenu.style.display !== 'none' && userMenu.style.display !== '';
      userMenu.style.display = isVisible ? 'none' : 'block';
      
      // ROOT CAUSE FIX: Ensure menu is positioned correctly
      const userAvatarContainer = document.getElementById('user-avatar-container');
      if (userAvatarContainer && !isVisible) {
        // Menu is being shown - CRITICAL FIX: Re-attach event listeners
        this.addUserMenuEventListeners();
        
        // Position menu relative to avatar container
        const rect = userAvatarContainer.getBoundingClientRect();
        userMenu.style.position = 'absolute';
        userMenu.style.top = `${rect.height + 4}px`;
        userMenu.style.right = '0';
        userMenu.style.zIndex = '10000';
        
        // ROOT CAUSE FIX: Add click-outside handler AFTER menu is shown, with longer delay
        // Use requestAnimationFrame to ensure menu is in DOM before adding handler
        requestAnimationFrame(() => {
          setTimeout(() => {
            this.addClickOutsideHandler();
          }, 500); // ROOT CAUSE FIX: Increased delay to 500ms to prevent immediate closing from same click event
        });
      } else if (isVisible) {
        // Menu is closing, remove click-outside handler
        if (this._clickOutsideHandler) {
          document.removeEventListener('click', this._clickOutsideHandler);
        }
      }
      
      console.log('🔧 PROFILE MANAGER: COMP METHOD - Menu toggled:', !isVisible, 'display:', userMenu.style.display);
    } else {
      console.error('❌ PROFILE MANAGER: COMP METHOD - Failed to create or find user menu');
    }
  }

  /**
   * COMP METHOD: Create user menu
   */
  async createUserMenu() {
    console.log('🔧 PROFILE MANAGER: COMP METHOD - Creating user menu...');
    
    const userMenu = document.createElement('div');
    userMenu.id = 'user-menu';
    userMenu.className = 'user-menu';
    userMenu.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      min-width: 200px;
      display: none;
    `;
    
    const currentUser = window.currentUser || { name: 'User', email: 'user@example.com' };

    // Create small avatar using AvatarUtils if available
    let smallAvatarHTML = '';
    if (window.AvatarUtils && currentUser) {
      try {
        smallAvatarHTML = await window.AvatarUtils.createUnifiedAvatar(currentUser, {
          context: 'menu',
          showAura: true,
          size: 24
        });
      } catch (error) {
        console.error('🔧 PROFILE MANAGER: COMP METHOD - Error creating small avatar:', error);
        const displayNameOrName = currentUser.displayName || currentUser.name || 'U';
        smallAvatarHTML = `<div class="user-avatar-small" style="width: 24px; height: 24px; border-radius: 50%; background: #007bff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
          ${displayNameOrName.charAt(0).toUpperCase()}
        </div>`;
      }
    } else {
      const displayNameOrName = currentUser.displayName || currentUser.name || 'U';
      smallAvatarHTML = `<div class="user-avatar-small" style="width: 24px; height: 24px; border-radius: 50%; background: #007bff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
        ${displayNameOrName.charAt(0).toUpperCase()}
      </div>`;
    }

    userMenu.innerHTML = `
      <div class="user-menu-header" style="padding: 12px; border-bottom: 1px solid #eee;">
        <div class="user-info" style="display: flex; align-items: center; gap: 8px;">
          ${smallAvatarHTML}
          <div>
            <div class="user-name" style="font-weight: bold; font-size: 14px;">${currentUser.displayName || currentUser.name || 'User'}</div>
            <div class="user-id" style="font-size: 12px; color: #666;">${currentUser.id || currentUser.user_id}</div>
          </div>
        </div>
      </div>
      <div class="user-menu-actions" style="padding: 8px 0;">
        <button class="menu-action" id="aura-color-btn" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <span>🎨</span>
          <span>Change Aura Color</span>
        </button>
        <button class="menu-action" id="visibility-settings-btn" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <span>👁️</span>
          <span>Visibility Settings</span>
        </button>
        <button class="menu-action" id="theme-toggle-btn" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <span id="theme-icon-menu">🌙</span>
          <span id="theme-text-menu">Toggle Theme</span>
        </button>
        <button class="menu-action" id="logout-btn" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px; color: #d32f2f;">
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    `;
    
    // ROOT CAUSE FIX: Add to avatar container with proper positioning
    const userAvatarContainer = document.getElementById('user-avatar-container');
    if (userAvatarContainer) {
      // Ensure container has position: relative for absolute positioning
      if (window.getComputedStyle(userAvatarContainer).position === 'static') {
        userAvatarContainer.style.position = 'relative';
      }
      userAvatarContainer.appendChild(userMenu);
      
      // ROOT CAUSE FIX: Position menu correctly
      const rect = userAvatarContainer.getBoundingClientRect();
      userMenu.style.position = 'absolute';
      userMenu.style.top = `${rect.height + 4}px`;
      userMenu.style.right = '0';
      userMenu.style.zIndex = '10000';
    } else {
      console.error('❌ PROFILE MANAGER: COMP METHOD - User avatar container not found');
    }
    
    // Add event listeners
    this.addUserMenuEventListeners();
    
    // ROOT CAUSE FIX: Add click-outside handler
    this.addClickOutsideHandler();
    
    // CRITICAL FIX: Initialize theme icon/text based on current theme
    this.updateProfileMenuTheme();
    
    // FIX: Listen for preference changes to update display name and theme
    if (window.eventBus && typeof window.eventBus.on === 'function') {
      window.eventBus.on('preference:changed', (data) => {
        if (data.key === 'displayName' || data.key === 'theme') {
          this.updateUserMenuDisplay();
          if (data.key === 'theme') {
            this.updateProfileMenuTheme();
          }
        }
      });
    }
    
    // Also listen for native custom events
    document.addEventListener('preferenceChanged', (e) => {
      if (e.detail && (e.detail.key === 'displayName' || e.detail.key === 'theme')) {
        this.updateUserMenuDisplay();
        if (e.detail.key === 'theme') {
          this.updateProfileMenuTheme();
        }
      }
    });
    
    console.log('✅ PROFILE MANAGER: COMP METHOD - User menu created');
  }
  
  /**
   * Update profile menu theme icon and text based on current theme
   */
  updateProfileMenuTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 
                        document.documentElement.getAttribute('data-theme') || 
                        'light';
    const themeIconMenu = document.getElementById('theme-icon-menu');
    const themeTextMenu = document.getElementById('theme-text-menu');
    
    if (themeIconMenu) {
      themeIconMenu.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }
    if (themeTextMenu) {
      themeTextMenu.textContent = currentTheme === 'dark' ? 'Light mode' : 'Dark mode';
    }
  }

  /**
   * COMP METHOD: Add user menu event listeners
   */
  addUserMenuEventListeners() {
    console.log('🔧 PROFILE MANAGER: COMP METHOD - Adding event listeners...');
    
    // Aura color button
    const auraColorBtn = document.getElementById('aura-color-btn');
    if (auraColorBtn) {
      auraColorBtn.onclick = (e) => {
        e.preventDefault();
        console.log('🔧 PROFILE MANAGER: COMP METHOD - Aura color button clicked');
        this.hideUserMenu();
        this.showColorPickerModal();
      };
    }
    
    // Visibility settings button - FIX: Add link to visibility tab
    const visibilitySettingsBtn = document.getElementById('visibility-settings-btn');
    if (visibilitySettingsBtn) {
      // Remove any existing handler to prevent duplicates
      visibilitySettingsBtn.onclick = null;
      visibilitySettingsBtn.removeEventListener('click', this._visibilitySettingsHandler);
      
      // Create handler function
      this._visibilitySettingsHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔧 PROFILE MANAGER: COMP METHOD - Visibility settings button clicked');
        this.hideUserMenu();
        
        // FIX: Switch to visibility tab - try multiple methods for reliability
        let switched = false;
        
        // ROOT CAUSE FIX: Switch to settings tab (not visibility tab)
        // Method 1: Try button click
        const selectors = [
          'button[data-tab="settings-tab"]',
          '.main-nav-tab[data-tab="settings-tab"]',
          'button[aria-controls="settings-tab"]',
          '[data-tab="settings-tab"]',
          '.nav-tab[data-tab="settings-tab"]'
        ];
        
        for (const selector of selectors) {
          const button = document.querySelector(selector);
          if (button) {
            button.click();
            console.log(`✅ PROFILE MANAGER: Switched to settings tab via selector: ${selector}`);
            switched = true;
            break;
          }
        }
        
        // Method 2: Direct tab activation if button click didn't work
        if (!switched) {
          const settingsTab = document.getElementById('settings-tab');
          const allTabs = document.querySelectorAll('.main-tab-content');
          const allTabButtons = document.querySelectorAll('.main-nav-tab, button[data-tab]');
          
          if (settingsTab) {
            // Hide all tabs
            allTabs.forEach(tab => tab.classList.remove('active'));
            // Show settings tab
            settingsTab.classList.add('active');
            
            // Update button states
            allTabButtons.forEach(btn => {
              btn.classList.remove('active');
              if (btn.getAttribute('data-tab') === 'settings-tab' || btn.getAttribute('aria-controls') === 'settings-tab') {
                btn.classList.add('active');
              }
            });
            
            console.log('✅ PROFILE MANAGER: Directly activated settings tab');
            switched = true;
          }
        }
        
        // Method 3: Dispatch custom event as last resort
        if (!switched) {
          const tabSwitchEvent = new CustomEvent('tabSwitch', { detail: { tabId: 'settings-tab' } });
          window.dispatchEvent(tabSwitchEvent);
          console.log('✅ PROFILE MANAGER: Dispatched tab switch event for settings tab');
        }
        
        // CRITICAL FIX: Ensure event listeners are attached when settings tab opens
        setTimeout(async () => {
          if (window.visibilitySettingsManager && typeof window.visibilitySettingsManager.ensureEventListeners === 'function') {
            await window.visibilitySettingsManager.ensureEventListeners();
            console.log('✅ PROFILE MANAGER: Ensured visibility settings event listeners after tab switch');
          }
        }, 100);
      };
      
      // Attach handler
      visibilitySettingsBtn.addEventListener('click', this._visibilitySettingsHandler);
      visibilitySettingsBtn.dataset.handlerAttached = 'true';
      
      // ROOT CAUSE FIX: Ensure button is active and clickable
      visibilitySettingsBtn.style.pointerEvents = 'auto';
      visibilitySettingsBtn.style.cursor = 'pointer';
      visibilitySettingsBtn.style.opacity = '1';
      visibilitySettingsBtn.disabled = false;
      
      console.log('✅ PROFILE MANAGER: Visibility settings button handler added and activated');
    } else {
      console.warn('⚠️ PROFILE MANAGER: Visibility settings button not found in DOM');
    }
    
    // Theme toggle button - CRITICAL FIX: Ensure button is clickable and handler is attached
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      // Remove any existing handlers first
      themeToggleBtn.onclick = null;
      themeToggleBtn.removeEventListener('click', this._themeToggleHandler);
      
      // Create handler function
      this._themeToggleHandler = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔧 PROFILE MANAGER: COMP METHOD - Theme toggle button clicked');
        console.log('🔍 DIAGNOSTIC: Profile menu theme toggle clicked');
        const beforeTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'light';
        console.log('🔍 DIAGNOSTIC: Theme before toggle:', beforeTheme);
        await this.toggleTheme();
        const afterTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'light';
        console.log('🔍 DIAGNOSTIC: Theme after toggle:', afterTheme);
        console.log('🔍 DIAGNOSTIC: Theme changed:', beforeTheme !== afterTheme ? 'YES ✅' : 'NO ❌');
        // CRITICAL: Close profile menu after theme toggle
        this.hideUserMenu();
      };
      
      // Attach handler
      themeToggleBtn.addEventListener('click', this._themeToggleHandler);
      
      // Mark as handled to prevent duplicate handlers
      themeToggleBtn.dataset.handlerAttached = 'true';
      
      // Ensure button is active and clickable
      themeToggleBtn.style.pointerEvents = 'auto';
      themeToggleBtn.style.cursor = 'pointer';
      themeToggleBtn.style.opacity = '1';
      themeToggleBtn.style.visibility = 'visible';
      themeToggleBtn.disabled = false;
      
      console.log('✅ PROFILE MANAGER: Theme toggle button handler attached and activated');
    } else {
      console.warn('❌ PROFILE MANAGER: Theme toggle button not found');
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = (e) => {
        e.preventDefault();
        console.log('🔧 PROFILE MANAGER: COMP METHOD - Logout button clicked');
        this.hideUserMenu();
        this.performLogout();
      };
    }
    
    console.log('✅ PROFILE MANAGER: COMP METHOD - Event listeners added');
  }

  /**
   * COMP METHOD: Hide user menu
   */
  hideUserMenu() {
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
      userMenu.style.display = 'none';
      console.log('🔧 PROFILE MANAGER: COMP METHOD - User menu hidden');
    }
  }
  
  /**
   * ROOT CAUSE FIX: Add click-outside handler to close menu
   */
  addClickOutsideHandler() {
    // Remove existing handler if any
    if (this._clickOutsideHandler) {
      document.removeEventListener('click', this._clickOutsideHandler);
      this._clickOutsideHandler = null;
    }
    
    // Create new handler
    this._clickOutsideHandler = (e) => {
      const userAvatarContainer = document.getElementById('user-avatar-container');
      const userMenu = document.getElementById('user-menu');
      
      if (userAvatarContainer && userMenu && userMenu.style.display !== 'none') {
        // Check if click is outside both avatar container and menu
        if (!userAvatarContainer.contains(e.target) && !userMenu.contains(e.target)) {
          console.log('🔧 PROFILE MANAGER: Click outside detected, hiding menu');
          userMenu.style.display = 'none';
          // Remove handler when menu closes
          if (this._clickOutsideHandler) {
            document.removeEventListener('click', this._clickOutsideHandler);
            this._clickOutsideHandler = null;
          }
        }
      }
    };
    
    // Add listener with delay to prevent immediate closing from the click that opened the menu
    setTimeout(() => {
      document.addEventListener('click', this._clickOutsideHandler, true); // Use capture phase
    }, 300); // Increased delay to ensure menu is fully rendered
  }

  /**
   * COMP METHOD: Show color picker modal
   */
  async showColorPickerModal() {
    console.log('🔧 PROFILE MANAGER: COMP METHOD - Showing color picker modal...');
    
    // Check if modal already exists
    let modal = document.getElementById('color-picker-modal');
    if (modal) {
      modal.style.display = 'flex';
      return;
    }
    
    // Create modal
    modal = document.createElement('div');
    modal.id = 'color-picker-modal';
    modal.className = 'color-picker-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    // COMP METHOD: Get current user's aura color (Chrome storage first, then database)
    const currentAuraColor = await getCurrentUserAuraColor();
    const currentColorHex = currentAuraColor.replace('#', '');
    const displayColor = currentAuraColor || window.AVATAR_FALLBACK_COLOR;
    
    console.log('🔧 AURA_MODAL: Current database aura color:', currentAuraColor);
    console.log('🔧 AURA_MODAL: Using color for modal:', displayColor);

    modal.innerHTML = `
      <div class="color-picker-content" style="background: white; border-radius: 12px; padding: 24px; max-width: 400px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
        <div class="color-picker-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Change Aura Color</h3>
          <button id="color-picker-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
        </div>
        <div class="color-picker-input-group" style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Hex Color (without #):</label>
          <input type="text" id="color-input" placeholder="${currentColorHex}" value="${currentColorHex}" maxlength="6" 
                 style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px;">
        </div>
        <div class="color-picker-preview" style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 12px; background: #f5f5f5; border-radius: 8px;">
          <div id="color-preview-circle" style="width: 40px; height: 40px; border-radius: 50%; background: ${displayColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">D</div>
          <div id="color-preview-text" style="font-weight: 500;">Current: ${displayColor}</div>
        </div>
        <div class="color-picker-buttons" style="display: flex; gap: 12px;">
          <button id="color-picker-reset" style="flex: 1; padding: 12px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;">Reset to Default</button>
          <button id="color-picker-save" style="flex: 1; padding: 12px; border: none; background: #007bff; color: white; border-radius: 6px; cursor: pointer;">Save Color</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    this.addColorPickerEventListeners();
    
    console.log('✅ PROFILE MANAGER: COMP METHOD - Color picker modal created');
  }

  /**
   * COMP METHOD: Add color picker event listeners
   */
  addColorPickerEventListeners() {
    const colorInput = document.getElementById('color-input');
    const previewCircle = document.getElementById('color-preview-circle');
    const previewText = document.getElementById('color-preview-text');
    const closeBtn = document.getElementById('color-picker-close');
    const resetBtn = document.getElementById('color-picker-reset');
    const saveBtn = document.getElementById('color-picker-save');
    const modal = document.getElementById('color-picker-modal');
    
    // Color input handler
    if (colorInput) {
      colorInput.oninput = (e) => {
        const color = e.target.value;
        if (color.length === 6) {
          previewCircle.style.background = '#' + color;
          previewText.textContent = 'Preview';
        }
      };
    }
    
    // Close button
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.style.display = 'none';
      };
    }
    
    // Reset button
    if (resetBtn) {
      resetBtn.onclick = async () => {
        const currentColor = await getCurrentUserAuraColor();
        const currentHex = currentColor.replace('#', '');
        colorInput.value = currentHex;
        previewCircle.style.background = currentColor;
        previewText.textContent = `Current: ${currentColor}`;
      };
    }
    
    // Save button
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const color = colorInput.value;
        if (color.length === 6) {
          const colorHex = '#' + color;
          console.log('🔧 PROFILE MANAGER: COMP METHOD - Saving aura color:', colorHex);
          
          // ROOT CAUSE FIX: Update BOTH Chrome storage AND database
          await updateAuraColorEverywhere(colorHex);
          
          modal.style.display = 'none';
        } else {
          alert('Please enter a valid 6-digit hex color');
        }
      };
    }
    
    // Click outside to close
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      };
    }
  }

  /**
   * COMP METHOD: Toggle theme
   */
  async toggleTheme() {
    console.log('🔧 PROFILE MANAGER: COMP METHOD - Toggling theme');
    
    // Get current theme from DOM or storage
    const currentTheme = document.body.getAttribute('data-theme') || 
                        document.documentElement.getAttribute('data-theme') || 
                        await (window.getCurrentUserTheme ? window.getCurrentUserTheme() : Promise.resolve('light'));
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    console.log('🔧 PROFILE MANAGER: Current theme:', currentTheme, 'New theme:', newTheme);
    console.log('🔍 DIAGNOSTIC: UserPreferencesManager available:', !!window.userPreferencesManager);
    console.log('🔍 DIAGNOSTIC: UserPreferencesManager initialized:', window.userPreferencesManager?.isInitialized);
    
    // CRITICAL FIX: Use UserPreferencesManager (unified preference system) - ensure it saves to both Chrome storage and database
    if (window.userPreferencesManager && window.userPreferencesManager.isInitialized) {
      console.log('✅ PROFILE MANAGER: Using UserPreferencesManager to toggle theme');
      // FIX: Save immediately (not batched) to ensure database save happens right away
      const saved = await window.userPreferencesManager.savePreference('theme', newTheme, { batch: false });
      console.log('🔍 DIAGNOSTIC: UserPreferencesManager savePreference result:', saved);
      
      // Verify it was saved to Chrome storage
      const chromeStorage = await chrome.storage.local.get(['theme']);
      console.log('🔍 DIAGNOSTIC: Theme in Chrome storage after save:', chromeStorage.theme);
      console.log('✅ PROFILE MANAGER: Theme saved via UserPreferencesManager:', newTheme);
      
      // CRITICAL FIX: Update profile menu theme UI immediately after saving
      // Don't wait for event listeners - update directly to ensure UI reflects the change
      this.updateProfileMenuTheme();
      console.log('✅ PROFILE MANAGER: Profile menu theme UI updated immediately');
    } else if (typeof window.updateThemeEverywhere === 'function') {
      // Fallback to old system during transition
      console.log('⚠️ PROFILE MANAGER: UserPreferencesManager not available, using updateThemeEverywhere fallback');
      await window.updateThemeEverywhere(newTheme);
    } else if (typeof window.toggleTheme === 'function') {
      console.log('🔧 PROFILE MANAGER: Using window.toggleTheme');
      await window.toggleTheme();
      
      // Update profile menu icon and text after theme change
      const themeIconMenu = document.getElementById('theme-icon-menu');
      const themeTextMenu = document.getElementById('theme-text-menu');
      if (themeIconMenu) {
        themeIconMenu.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      }
      if (themeTextMenu) {
        themeTextMenu.textContent = newTheme === 'dark' ? 'Light mode' : 'Dark mode';
      }
    } else {
      // Fallback: Update manually if function not available
      console.warn('⚠️ PROFILE MANAGER: updateThemeEverywhere not available, using fallback');
      
      // Update DOM immediately
      document.documentElement.setAttribute('data-theme', newTheme);
      document.body.setAttribute('data-theme', newTheme);
      
      // Update icon and text in profile menu
      const themeIconMenu = document.getElementById('theme-icon-menu');
      const themeTextMenu = document.getElementById('theme-text-menu');
      if (themeIconMenu) {
        themeIconMenu.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      }
      if (themeTextMenu) {
        themeTextMenu.textContent = newTheme === 'dark' ? 'Light mode' : 'Dark mode';
      }
      
      // Update settings tab theme toggle if it exists
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        themeToggle.checked = newTheme === 'dark';
      }
      
      // Update Chrome storage
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ theme: newTheme, userTheme: newTheme });
      }
      
      // Update localStorage (for compatibility)
      localStorage.setItem('theme', newTheme);
      
      // Update database
      if (window.currentUser && window.currentUser.id && window.api && typeof window.api.request === 'function') {
        try {
          await window.api.request(`/v1/users/${window.currentUser.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              theme: newTheme
            })
          });
          console.log('✅ PROFILE MANAGER: Theme saved to database:', newTheme);
        } catch (error) {
          console.error('❌ PROFILE MANAGER: Error saving theme to database:', error);
        }
      }
      
      // Update local objects
      if (window.currentUser) {
        window.currentUser.theme = newTheme;
      }
      
      console.log(`✅ PROFILE MANAGER: Switched to ${newTheme} theme`);
    }
  }

  /**
   * COMP METHOD: Perform logout
   */
  performLogout() {
    console.log('🔧 PROFILE MANAGER: COMP METHOD - Performing logout');
    try {
      // Clear user data
      window.currentUser = null;
      window.supabaseUser = null;
      
      // Clear storage
      chrome.storage.local.clear();
      
      // Reload the extension
      window.location.reload();
      
      console.log('✅ PROFILE MANAGER: COMP METHOD - Logout completed');
    } catch (error) {
      console.error('❌ PROFILE MANAGER: COMP METHOD - Error during logout:', error);
    }
  }

  /**
   * Handle user profile updates
   */
  async handleUserUpdate(user) {
    console.log('User profile updated', user);

    // SD1 CRITICAL DEBUG: Log what user data is being set for profile avatar
    console.log('🔍 SD1 PROFILE DEBUG: === PROFILE MANAGER USER UPDATE ===');
    console.log('🔍 SD1 PROFILE DEBUG: User email:', user?.email);
    console.log('🔍 SD1 PROFILE DEBUG: User name:', user?.name);
    console.log('🔍 SD1 PROFILE DEBUG: User avatarUrl:', user?.avatarUrl);
    console.log('🔍 SD1 PROFILE DEBUG: User auraColor (before fetch):', user?.auraColor);
    console.log('🔍 SD1 PROFILE DEBUG: Full user object:', user);
    console.log('🔍 SD1 PROFILE DEBUG: === END PROFILE MANAGER USER UPDATE ===');

    this.profileData = user;

    // ROOT CAUSE FIX: Sync Chrome storage with database when user updates
    if (window.syncStorageWithDatabase && typeof window.syncStorageWithDatabase === 'function') {
      window.syncStorageWithDatabase().catch(err => {
        console.warn('⚠️ PROFILE_MANAGER: Error syncing storage with database:', err);
      });
    }

    // CRITICAL: Ensure we have auraColor for profile avatar
    // First priority: from user object (if included in update)
    if (this.profileData.auraColor) {
      console.log('✅ PROFILE_MANAGER: Using auraColor from user object:', this.profileData.auraColor);
    }
    // Second priority: from window.currentUser (should have been set during auth)
    else if (window.currentUser?.auraColor) {
      this.profileData.auraColor = window.currentUser.auraColor;
      console.log('✅ PROFILE_MANAGER: Using auraColor from window.currentUser:', window.currentUser.auraColor);
    }
    // Third priority: fetch from API if user ID is available
    else if (this.profileData.id && window.api) {
      console.log('🔍 PROFILE_MANAGER: Fetching auraColor from API for user:', this.profileData.id);
      try {
        const userResponse = await window.api.request(`/v1/users/${this.profileData.id}`, {
          method: 'GET'
        });
        if (userResponse && (userResponse.auraColor || userResponse.aura_color)) {
          const auraColor = userResponse.auraColor || userResponse.aura_color;
          this.profileData.auraColor = auraColor;
          // Also update window.currentUser for consistency
          if (window.currentUser) {
            window.currentUser.auraColor = auraColor;
            window.currentUser.aura_color = auraColor;
          }
          console.log('✅ PROFILE_MANAGER: Fetched auraColor from API:', auraColor);
        } else {
          console.log('ℹ️ PROFILE_MANAGER: No auraColor found in API response');
        }
      } catch (error) {
        console.warn('⚠️ PROFILE_MANAGER: Failed to fetch auraColor from API:', error);
      }
    } else {
      console.log('ℹ️ PROFILE_MANAGER: No auraColor available yet (may be set later)');
    }

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
   * Handle aura color updates
   */
  async handleAuraColorUpdate(auraData) {
    console.log('🔧 PROFILE_MANAGER: Handling aura color update:', auraData);

    const { color, user } = auraData;

    // Update profile data if it's the current user
    if (this.profileData && user && (this.profileData.id === user.id || this.profileData.id === user.user_id)) {
      this.profileData.auraColor = color;
      console.log('🔧 PROFILE_MANAGER: Updated profile data aura color:', color);

      // Refresh the profile avatar with the new aura color
      await this.updateUserAvatar();
    }
  }

  /**
   * Handle authentication UI updates
   */
  async handleAuthUIUpdate(authData) {
    console.log('🔧 PROFILE_MANAGER: Handling auth UI update:', authData?.isAuthenticated);

    if (authData.isAuthenticated && authData.user) {
      // SD1 CRITICAL DEBUG: Log what user data is being set for profile avatar
      console.log('🔍 SD1 PROFILE DEBUG: === PROFILE MANAGER AUTH UPDATE ===');
      console.log('🔍 SD1 PROFILE DEBUG: Auth user email:', authData.user?.email);
      console.log('🔍 SD1 PROFILE DEBUG: Auth user name:', authData.user?.name);
      console.log('🔍 SD1 PROFILE DEBUG: Auth user avatarUrl:', authData.user?.avatarUrl);
      console.log('🔍 SD1 PROFILE DEBUG: Auth user auraColor (before fetch):', authData.user?.auraColor);
      console.log('🔍 SD1 PROFILE DEBUG: Full auth user object:', authData.user);
      console.log('🔍 SD1 PROFILE DEBUG: === END PROFILE MANAGER AUTH UPDATE ===');

      this.profileData = authData.user;

      // CRITICAL: Ensure we have auraColor for profile avatar
      // First priority: from authData.user (if included in auth response)
      if (this.profileData.auraColor) {
        console.log('✅ PROFILE_MANAGER: Using auraColor from authData.user:', this.profileData.auraColor);
      }
      // Second priority: from window.currentUser (set by AuthModule)
      else if (window.currentUser?.auraColor) {
        this.profileData.auraColor = window.currentUser.auraColor;
        console.log('✅ PROFILE_MANAGER: Using auraColor from window.currentUser:', window.currentUser.auraColor);
      }
      // Third priority: fetch from API if user ID is available
      else if (this.profileData.id && window.api) {
        console.log('🔍 PROFILE_MANAGER: Fetching auraColor from API for user:', this.profileData.id);
        try {
          const userResponse = await window.api.request(`/v1/users/${this.profileData.id}`, {
            method: 'GET'
          });
          if (userResponse && (userResponse.auraColor || userResponse.aura_color)) {
            const auraColor = userResponse.auraColor || userResponse.aura_color;
            this.profileData.auraColor = auraColor;
            // Also update window.currentUser for consistency
            if (window.currentUser) {
              window.currentUser.auraColor = auraColor;
              window.currentUser.aura_color = auraColor;
            }
            console.log('✅ PROFILE_MANAGER: Fetched auraColor from API:', auraColor);
          } else {
            console.log('ℹ️ PROFILE_MANAGER: No auraColor found in API response');
          }
        } catch (error) {
          console.warn('⚠️ PROFILE_MANAGER: Failed to fetch auraColor from API:', error);
        }
      } else {
        console.log('ℹ️ PROFILE_MANAGER: No auraColor available yet (may be set later)');
      }

      // If authentication just completed, we need to initialize the profile avatar
      if (!this.isAuthenticated) {
        console.log('🔧 PROFILE_MANAGER: Authentication completed, initializing profile avatar...');
        this.isAuthenticated = true;
        await this.initializeProfileAvatar();
      } else {
        // Just update the UI with new data
        this.updateProfileUI();
      }
    } else {
      this.clearProfileUI();
    }
  }

  /**
   * Update profile UI with current user data
   */
  async updateProfileUI() {
    if (!this.profileData) {
      console.warn('No profile data available for UI update', null, 'profile');
      return;
    }
    
    console.log('Updating profile UI', {
      user: this.profileData.email,
      hasAvatar: !!this.profileData.avatarUrl,
      auraColor: this.profileData.auraColor
    });
    
    try {
      this.updateUserInfo();
      await this.updateUserAvatar(); // CRITICAL: Wait for avatar update to complete
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
      // FIX: Use displayName first, fallback to name, then email
      const displayName = this.profileData.displayName || this.profileData.name || this.profileData.email || 'User';
      userMenuName.textContent = displayName;
      }
  }

  /**
   * Update user avatar display
   */
  async updateUserAvatar() {
    console.log('🔧 PROFILE_MANAGER: updateUserAvatar called at', new Date().toISOString());

    const userAvatarContainer = document.getElementById('user-avatar-container');

    if (!userAvatarContainer) {
      console.warn('User avatar container not found', null, 'profile');
      return;
    }

    console.log('🔧 PROFILE_MANAGER: Updating user avatar with data:', {
      avatarUrl: this.profileData.avatarUrl,
      auraColor: this.profileData.auraColor,
      profileDataId: this.profileData.id,
      timestamp: new Date().toISOString()
    });
    
    // ROOT CAUSE FIX: Use getCurrentUserAuraColor() for latest aura color (prioritizes Chrome storage, then database)
    let auraColorValue = null;
    if (typeof window.getCurrentUserAuraColor === 'function') {
      try {
        auraColorValue = await window.getCurrentUserAuraColor();
        console.log('🎨 PROFILE_MANAGER: Got aura color from getCurrentUserAuraColor():', auraColorValue);
      } catch (error) {
        console.warn('⚠️ PROFILE_MANAGER: Error calling getCurrentUserAuraColor():', error);
      }
    }
    
    // Fallback to profileData if getCurrentUserAuraColor not available
    if (!auraColorValue) {
      auraColorValue = this.profileData?.auraColor || this.profileData?.aura_color;
    }

    // CRITICAL FIX: Check Chrome storage FIRST for instant display (persists across sessions)
    if (!auraColorValue && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const storageResult = await new Promise((resolve) => {
          chrome.storage.local.get(['userAuraColor', 'auraColor'], (result) => {
            resolve(result);
          });
        });
        
        const cachedAuraColor = storageResult.userAuraColor || storageResult.auraColor;
        if (cachedAuraColor && cachedAuraColor !== '#ffffff' && cachedAuraColor !== 'white' && cachedAuraColor !== '#fff') {
          auraColorValue = cachedAuraColor;
          console.log('🎨 PROFILE_MANAGER: Using aura color from Chrome storage (CACHE):', auraColorValue);
        }
      } catch (error) {
        console.warn('⚠️ PROFILE_MANAGER: Could not read from Chrome storage:', error);
      }
    }

    // CRITICAL FIX: Check pre-render data as SECONDARY source (database value)
    if (!auraColorValue && window.preRenderInitializer?.getPreRenderData) {
      const preRenderData = window.preRenderInitializer.getPreRenderData();
      if (preRenderData.auraColor) {
        auraColorValue = preRenderData.auraColor;
        console.log('🎨 PROFILE_MANAGER: Using aura color from pre-render data (DATABASE):', auraColorValue);
        
        // CRITICAL FIX: Cache database value in Chrome storage for next time
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          try {
            await new Promise((resolve) => {
              chrome.storage.local.set({ userAuraColor: auraColorValue, auraColor: auraColorValue }, () => {
                console.log('💾 PROFILE_MANAGER: Cached aura color in Chrome storage:', auraColorValue);
                resolve();
              });
            });
          } catch (error) {
            console.warn('⚠️ PROFILE_MANAGER: Could not cache to Chrome storage:', error);
          }
        }
      }
    }

    // Fallback to window.currentUser if pre-render data not available
    if (!auraColorValue && window.currentUser?.auraColor) {
      auraColorValue = window.currentUser.auraColor;
      console.log('✅ PROFILE_MANAGER: Using auraColor from window.currentUser:', auraColorValue);
    }

    // CRITICAL FIX: Resolve Promise if auraColor is a Promise
    if (auraColorValue && typeof auraColorValue === 'object' && typeof auraColorValue.then === 'function') {
      console.log('🔧 PROFILE_MANAGER: auraColor is a Promise, awaiting resolution...');
      try {
        auraColorValue = await auraColorValue;
        console.log(`✅ PROFILE_MANAGER: Resolved auraColor Promise: ${auraColorValue}`);
      } catch (e) {
        console.warn(`⚠️ PROFILE_MANAGER: Error resolving auraColor Promise:`, e);
        auraColorValue = null; // Treat as missing, will fetch from API
      }
    }

    // CRITICAL FIX: Validate auraColor - treat #ffffff as missing
    if (auraColorValue === '#ffffff' || auraColorValue === 'white' || auraColorValue === '#fff') {
      console.log('⚠️ PROFILE_MANAGER: auraColor is fallback white, treating as missing (will fetch from API)');
      auraColorValue = null;
    }

    // CRITICAL FIX: Fetch from API if still missing
    if (!auraColorValue && this.profileData.id && window.api) {
      console.log('🔍 PROFILE_MANAGER: Fetching auraColor from API for profile avatar...');
      try {
        const userResponse = await window.api.request(`/v1/users/${this.profileData.id}`, {
          method: 'GET'
        });

        if (userResponse && (userResponse.auraColor || userResponse.aura_color)) {
          const apiAuraColor = userResponse.auraColor || userResponse.aura_color;
          
          // Validate API response - treat #ffffff as missing
          if (apiAuraColor !== '#ffffff' && apiAuraColor !== 'white' && apiAuraColor !== '#fff') {
            auraColorValue = apiAuraColor;
            this.profileData.auraColor = apiAuraColor;
            this.profileData.aura_color = apiAuraColor;
            
            // Update window.currentUser for consistency
            if (window.currentUser) {
              window.currentUser.auraColor = apiAuraColor;
              window.currentUser.aura_color = apiAuraColor;
            }
            
            // CRITICAL FIX: Cache API value in Chrome storage for instant display next time
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
              try {
                await new Promise((resolve) => {
                  chrome.storage.local.set({ userAuraColor: apiAuraColor, auraColor: apiAuraColor }, () => {
                    console.log('💾 PROFILE_MANAGER: Cached API aura color in Chrome storage:', apiAuraColor);
                    resolve();
                  });
                });
              } catch (error) {
                console.warn('⚠️ PROFILE_MANAGER: Could not cache API value to Chrome storage:', error);
              }
            }
            
            console.log('✅ PROFILE_MANAGER: Fetched auraColor from API for profile avatar:', apiAuraColor);
          } else {
            console.log('⚠️ PROFILE_MANAGER: API returned fallback white, treating as missing');
          }
        }
      } catch (error) {
        console.warn('⚠️ PROFILE_MANAGER: Could not fetch auraColor from API for profile avatar:', error);
      }
    }

    // Update profileData with resolved value
    if (auraColorValue) {
      this.profileData.auraColor = auraColorValue;
      this.profileData.aura_color = auraColorValue;
    }
    
    try {
      // Use AvatarUtils for consistent avatar creation
      // CRITICAL FIX: Create user object with resolved auraColor value
      const userForAvatar = {
        ...this.profileData,
        auraColor: auraColorValue || this.profileData.auraColor,
        aura_color: auraColorValue || this.profileData.aura_color
      };

      if (window.AvatarUtils) {
        console.log('🔧 PROFILE_MANAGER: Calling AvatarUtils.createUnifiedAvatar with:', {
          userId: userForAvatar.id,
          auraColor: userForAvatar.auraColor,
          aura_color: userForAvatar.aura_color,
          avatarUrl: userForAvatar.avatarUrl,
          source: auraColorValue ? 'resolved' : 'profileData'
        });

        // ROOT CAUSE FIX: Ensure availability is set for status dots
        // CRITICAL: Prioritize window.currentUser.availability/globalAvailability (most up-to-date)
        if (window.currentUser && String(window.currentUser.id || window.currentUser.user_id) === String(userForAvatar.id || userForAvatar.userId)) {
          // Current user: use window.currentUser.availability/globalAvailability (most up-to-date from database)
          userForAvatar.availability = window.currentUser.availability || window.currentUser.globalAvailability || userForAvatar.availability;
          console.log(`🔍 PROFILE_MANAGER: Using currentUser.availability for profile avatar: ${userForAvatar.availability}`);
        }
        
        if (!userForAvatar.availability) {
          // Try to get from currentUser first
          if (window.currentUser && (window.currentUser.availability || window.currentUser.globalAvailability)) {
            userForAvatar.availability = window.currentUser.availability || window.currentUser.globalAvailability;
          } else if (window.currentVisibilityDataUnfiltered?.active) {
            // Try to get from visibility data
            const currentUserInVisibility = window.currentVisibilityDataUnfiltered.active.find(u => 
              String(u.id || u.userId || u.user_id) === String(window.currentUser?.id)
            );
            if (currentUserInVisibility && currentUserInVisibility.availability) {
              userForAvatar.availability = currentUserInVisibility.availability;
            }
          }
          // Default to AVAILABLE if active, OFFLINE if not
          if (!userForAvatar.availability) {
            userForAvatar.availability = (userForAvatar.isActive || userForAvatar.is_active) ? 'AVAILABLE' : 'OFFLINE';
          }
        }
        
        const avatarHTML = await window.AvatarUtils.createUnifiedAvatar(userForAvatar, 'profile', {
          showAura: true,
          showStatus: true,  // ROOT CAUSE FIX: Enable status dots on profile avatar
          size: 32
        });

        userAvatarContainer.innerHTML = avatarHTML;
        console.log('✅ PROFILE_MANAGER: Avatar updated using AvatarUtils with auraColor:', this.profileData.auraColor);
        console.log('📄 PROFILE_MANAGER: Generated avatar HTML:', avatarHTML.substring(0, 200) + '...');

        // Log what was actually inserted and check for aura element
        console.log('🔧 PROFILE_MANAGER: updateUserAvatar - Container updated, checking for aura element...');
        const auraElement = userAvatarContainer.querySelector('.avatar-aura');
        if (auraElement) {
          console.log('✅ PROFILE_MANAGER: updateUserAvatar - Aura element found with background:', auraElement.style.backgroundColor);
        } else {
          console.log('⚠️ PROFILE_MANAGER: updateUserAvatar - Aura element NOT found in avatar HTML');
          console.log('⚠️ PROFILE_MANAGER: updateUserAvatar - Full container HTML:', userAvatarContainer.innerHTML);
        }
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

    const currentUser = window.currentUser || { name: 'User', email: 'user@example.com' };
    const fallbackHTML = `
      <div class="user-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: #007bff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
        ${(currentUser.displayName || currentUser.name || 'U').charAt(0).toUpperCase()}
      </div>
    `;

    userAvatarContainer.innerHTML = fallbackHTML;
    console.log('🔧 PROFILE MANAGER: COMP METHOD - Fallback avatar created');
  }

  /**
   * Update user menu display
   */
  updateUserMenu() {
    // Update any user menu elements
    const userMenuElements = document.querySelectorAll('[data-user-menu]');
    const displayName = this.profileData?.displayName || this.profileData?.name || this.profileData?.email || 'User';
    userMenuElements.forEach(element => {
      if (element.dataset.userMenu === 'name') {
        element.textContent = displayName;
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
      userId: this.profileData?.id || this.profileData?.user_id || null,
      hasAvatar: !!this.profileData?.avatarUrl,
      avatarSource: this.profileData?.avatarSource || null,
      auraColor: this.profileData?.auraColor || null,
      callbacksRegistered: this.updateCallbacks.length,
      cacheSize: this.avatarCache.size
    };
  }
}

// ===== GLOBAL AVATAR FUNCTIONS =====
// ROOT CAUSE FIX: Unified function to update aura color in BOTH Chrome storage AND database
async function updateAuraColorEverywhere(color) {
  console.log('🔄 AURA_UPDATE: Updating aura color everywhere:', color);
  
  if (!color || !color.startsWith('#')) {
    console.error('❌ AURA_UPDATE: Invalid color format:', color);
    return false;
  }
  
  try {
    // Step 1: Update Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await new Promise((resolve, reject) => {
        chrome.storage.local.set({ userAuraColor: color, auraColor: color }, () => {
          if (chrome.runtime.lastError) {
            console.error('❌ AURA_UPDATE: Error saving to Chrome storage:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            console.log('✅ AURA_UPDATE: Saved to Chrome storage:', color);
            resolve();
          }
        });
      });
    }
    
    // Step 2: Update database via API
    if (window.currentUser && window.currentUser.id && window.api && typeof window.api.request === 'function') {
      try {
        const result = await window.api.request(`/v1/users/${window.currentUser.id}/aura-color`, {
          method: 'PUT',
          body: JSON.stringify({
            auraColor: color
          })
        });
        
        if (result) {
          console.log('✅ AURA_UPDATE: Saved to database:', color);
        } else {
          console.error('❌ AURA_UPDATE: Database update returned no result');
        }
      } catch (error) {
        console.error('❌ AURA_UPDATE: Error saving to database:', error);
        // Don't throw - Chrome storage update succeeded
      }
    } else {
      console.warn('⚠️ AURA_UPDATE: Cannot update database - missing user or API');
    }
    
    // Step 3: Update local user object immediately
    if (window.currentUser) {
      window.currentUser.auraColor = color;
      window.currentUser.aura_color = color;
      console.log('✅ AURA_UPDATE: Updated window.currentUser');
    }
    
    // Step 4: Update visibility cache immediately to prevent stale data
    if (window.currentVisibilityDataUnfiltered?.active) {
      const currentUserInVisibility = window.currentVisibilityDataUnfiltered.active.find(u => 
        String(u.id || u.userId || u.user_id) === String(window.currentUser?.id)
      );
      if (currentUserInVisibility) {
        currentUserInVisibility.aura_color = color;
        currentUserInVisibility.auraColor = color;
        console.log('✅ AURA_UPDATE: Updated visibility cache');
      }
    }
    
    if (window.currentVisibilityData?.active) {
      const currentUserInVisibility = window.currentVisibilityData.active.find(u => 
        String(u.id || u.userId || u.user_id) === String(window.currentUser?.id)
      );
      if (currentUserInVisibility) {
        currentUserInVisibility.aura_color = color;
        currentUserInVisibility.auraColor = color;
      }
    }
    
    // Step 5: Trigger real-time update and avatar refresh
    if (window.handleAuraChange) {
      window.handleAuraChange({
        userId: window.currentUser?.id,
        aura_color: color
      });
    }
    
    // Step 6: Force refresh all message avatars to show new color
    if (typeof window.refreshAllMessageAvatars === 'function') {
      console.log('🔄 AURA_UPDATE: Refreshing all message avatars with new aura color');
      await window.refreshAllMessageAvatars();
    }
    
    // Step 7: Refresh visibility avatars
    if (typeof window.refreshVisibilityAvatars === 'function') {
      console.log('🔄 AURA_UPDATE: Refreshing visibility avatars');
      await window.refreshVisibilityAvatars();
    }
    
    console.log('✅ AURA_UPDATE: Aura color update complete');
    return true;
  } catch (error) {
    console.error('❌ AURA_UPDATE: Error updating aura color:', error);
    return false;
  }
}

// COMP METHOD: Get current user's aura color (Chrome storage first, then database fallback)
async function getCurrentUserAuraColor() {
  console.log('🔍 AURA_MODAL: Getting current user aura color (Chrome storage first, then database)');
  
  // ROOT CAUSE FIX: Check Chrome storage FIRST
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const storageResult = await new Promise((resolve) => {
        chrome.storage.local.get(['userAuraColor', 'auraColor'], (result) => {
          resolve(result);
        });
      });
      
      const cachedAuraColor = storageResult.userAuraColor || storageResult.auraColor;
      if (cachedAuraColor && cachedAuraColor !== '#ffffff' && cachedAuraColor !== 'ffffff' && cachedAuraColor !== window.AVATAR_FALLBACK_COLOR) {
        console.log(`✅ AURA_MODAL: Found aura color in Chrome storage: ${cachedAuraColor}`);
        return cachedAuraColor;
      }
    } catch (error) {
      console.warn('⚠️ AURA_MODAL: Error reading Chrome storage:', error);
    }
  }
  
  // Fallback 1: Try to get from current user object (from database)
  if (window.currentUser && window.currentUser.auraColor && window.currentUser.auraColor !== window.AVATAR_FALLBACK_COLOR) {
    console.log(`✅ AURA_MODAL: Found database aura color in currentUser: ${window.currentUser.auraColor}`);
    return window.currentUser.auraColor;
  }
  
  if (window.currentUser && window.currentUser.aura_color && window.currentUser.aura_color !== window.AVATAR_FALLBACK_COLOR) {
    console.log(`✅ AURA_MODAL: Found database aura_color in currentUser: ${window.currentUser.aura_color}`);
    return window.currentUser.aura_color;
  }
  
  // Fallback 2: Try to get from visibility data (database)
  if (window.currentVisibilityData && window.currentVisibilityData.active) {
    const currentUserEmail = window.currentUser?.email;
    if (currentUserEmail) {
      const userData = window.currentVisibilityData.active.find(u => u.email === currentUserEmail);
      if (userData && userData.auraColor && userData.auraColor !== window.AVATAR_FALLBACK_COLOR) {
        console.log(`✅ AURA_MODAL: Found database aura color in visibility data: ${userData.auraColor}`);
        return userData.auraColor;
      }
      if (userData && userData.aura_color && userData.aura_color !== window.AVATAR_FALLBACK_COLOR) {
        console.log(`✅ AURA_MODAL: Found database aura_color in visibility data: ${userData.aura_color}`);
        return userData.aura_color;
      }
    }
  }
  
  // Fallback 3: Try to get from unfiltered visibility data (database)
  if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
    const currentUserEmail = window.currentUser?.email;
    if (currentUserEmail) {
      const userData = window.currentVisibilityDataUnfiltered.active.find(u => u.email === currentUserEmail);
      if (userData && userData.auraColor && userData.auraColor !== window.AVATAR_FALLBACK_COLOR) {
        console.log(`✅ AURA_MODAL: Found database aura color in unfiltered visibility data: ${userData.auraColor}`);
        return userData.auraColor;
      }
      if (userData && userData.aura_color && userData.aura_color !== window.AVATAR_FALLBACK_COLOR) {
        console.log(`✅ AURA_MODAL: Found database aura_color in unfiltered visibility data: ${userData.aura_color}`);
        return userData.aura_color;
      }
    }
  }
  
  // Fallback 4: Try to fetch from database via API
  if (window.currentUser && window.currentUser.id && window.api && typeof window.api.request === 'function') {
    try {
      const userData = await window.api.request(`/v1/users/${window.currentUser.id}`, {
        method: 'GET'
      });
      if (userData && (userData.aura_color || userData.auraColor)) {
        const dbColor = userData.aura_color || userData.auraColor;
        if (dbColor && dbColor !== window.AVATAR_FALLBACK_COLOR) {
          console.log(`✅ AURA_MODAL: Fetched aura color from database API: ${dbColor}`);
          // Cache it in Chrome storage for next time
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ userAuraColor: dbColor, auraColor: dbColor });
          }
          return dbColor;
        }
      }
    } catch (error) {
      console.warn('⚠️ AURA_MODAL: Error fetching from database API:', error);
    }
  }
  
  // Final fallback to default
  console.log('⚠️ AURA_MODAL: No aura color found, using default');
  return window.AVATAR_FALLBACK_COLOR;
}

// COMP METHOD: Get aura color from database, never use hardcoded colors
function getCurrentUserAvatarBgColor() {
  console.log('🔍 AURA_FIX: Getting current user aura color from database');
  
  // First, try to get from currentUser if it has a real database color
  if (window.currentUser && window.currentUser.auraColor && window.currentUser.auraColor !== window.AVATAR_FALLBACK_COLOR) {
    console.log(`✅ AURA_FIX: Found database aura color in currentUser: ${window.currentUser.auraColor}`);
    return window.currentUser.auraColor;
  }
  
  // Try to get from visibility data (database)
  if (window.currentVisibilityData && window.currentVisibilityData.active) {
    const currentUserEmail = window.currentUser?.email;
    if (currentUserEmail) {
      const userData = window.currentVisibilityData.active.find(u => u.email === currentUserEmail);
      if (userData && userData.auraColor && userData.auraColor !== window.AVATAR_FALLBACK_COLOR) {
        console.log(`✅ AURA_FIX: Found database aura color in visibility data: ${userData.auraColor}`);
        return userData.auraColor;
      }
    }
  }
  
  // Try to load from storage if not in database
  if (typeof window.getState === 'function') {
    try {
      const storedColor = window.getState('userAvatarBgColor');
      if (storedColor && storedColor !== window.AVATAR_FALLBACK_COLOR) {
        console.log('🔧 AURA_FIX: Loading aura color from storage:', storedColor);
        return storedColor;
      }
    } catch (error) {
      console.log('🔧 AURA_FIX: Could not load aura color from storage:', error);
    }
  }
  
  // COMP METHOD: Never use hardcoded colors - use white fallback
  console.log('⚠️ AURA_FIX: No database aura color found, using white fallback (no hardcoded colors)');
  return window.AVATAR_FALLBACK_COLOR;
}

function getCurrentUserAvatarColor() {
  if (window.currentUser && window.currentUser.auraColor) {
    return window.currentUser.auraColor;
  }
  return window.AVATAR_FALLBACK_COLOR; // Default white
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
    window.currentUser.auraColor = window.AVATAR_FALLBACK_COLOR; // Default white
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
  
  // Add a small delay to prevent immediate closing
  setTimeout(() => {
    if (userAvatarContainer && userMenu && userMenu.style.display !== 'none') {
      if (!userAvatarContainer.contains(e.target) && !userMenu.contains(e.target)) {
        console.log('🖱️ Clicked outside, hiding menu');
        userMenu.style.display = 'none';
      }
    }
  }, 100);
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


function addLogoutButtonClickHandler() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      console.log('🚪 COMP METHOD: Logout button clicked!');
      e.stopPropagation(); // Prevent menu from closing
      if (typeof window.logout === 'function') {
        window.logout();
      } else if (typeof window.performLogout === 'function') {
        window.performLogout();
      } else {
        console.log('❌ logout function not available, creating COMP method logout');
        // COMP METHOD: Create logout function if not available
        window.performLogout = async function() {
          console.log('🔧 LOGOUT: Performing logout');
          try {
            // Clear user data
            window.currentUser = null;
            window.supabaseUser = null;
            
            // Clear storage
            await chrome.storage.local.clear();
            
            // Reload the extension
            window.location.reload();
            
            console.log('✅ LOGOUT: Logout completed');
          } catch (error) {
            console.error('❌ LOGOUT: Error during logout:', error);
          }
        };
        window.performLogout();
      }
    });
    console.log('✅ COMP METHOD: Logout button click handler added');
  } else {
    console.log('❌ Logout button not found');
  }
}

function addAllProfileMenuHandlers() {
  console.log('🎯 PROFILE_MENU: Adding all profile menu handlers...');
  addAuraButtonClickHandler();
  addLogoutButtonClickHandler();
  
  // ROOT CAUSE FIX: Ensure visibility settings button handler is added
  const profileManager = window.profileManager || (window.ProfileManager && window.ProfileManager.instance);
  if (profileManager) {
    const visibilityBtn = document.getElementById('visibility-settings-btn');
    if (visibilityBtn) {
      // Check if handler is already attached
      if (!visibilityBtn.dataset.handlerAttached) {
        console.log('🔧 PROFILE_MENU: Visibility button found but handler not attached, attaching now...');
        
        // Remove any existing handlers first
        visibilityBtn.onclick = null;
        if (profileManager._visibilitySettingsHandler) {
          visibilityBtn.removeEventListener('click', profileManager._visibilitySettingsHandler);
        }
        
        // Create handler function if it doesn't exist
        if (!profileManager._visibilitySettingsHandler) {
          profileManager._visibilitySettingsHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔧 PROFILE MANAGER: COMP METHOD - Visibility settings button clicked');
            profileManager.hideUserMenu();
            
            // ROOT CAUSE FIX: Switch to settings tab (not visibility tab)
            let switched = false;
            const selectors = [
              'button[data-tab="settings-tab"]',
              '.main-nav-tab[data-tab="settings-tab"]',
              'button[aria-controls="settings-tab"]',
              '[data-tab="settings-tab"]',
              '.nav-tab[data-tab="settings-tab"]'
            ];
            
            for (const selector of selectors) {
              const button = document.querySelector(selector);
              if (button) {
                button.click();
                console.log(`✅ PROFILE MANAGER: Switched to settings tab via selector: ${selector}`);
                switched = true;
                break;
              }
            }
            
            // Method 2: Direct tab activation
            if (!switched) {
              const settingsTab = document.getElementById('settings-tab');
              const allTabs = document.querySelectorAll('.main-tab-content');
              const allTabButtons = document.querySelectorAll('.main-nav-tab, button[data-tab]');
              
              if (settingsTab) {
                allTabs.forEach(tab => tab.classList.remove('active'));
                settingsTab.classList.add('active');
                allTabButtons.forEach(btn => {
                  btn.classList.remove('active');
                  if (btn.getAttribute('data-tab') === 'settings-tab' || btn.getAttribute('aria-controls') === 'settings-tab') {
                    btn.classList.add('active');
                  }
                });
                console.log('✅ PROFILE MANAGER: Directly activated settings tab');
                switched = true;
              }
            }
            
            // Method 3: Dispatch custom event
            if (!switched) {
              const tabSwitchEvent = new CustomEvent('tabSwitch', { detail: { tabId: 'settings-tab' } });
              window.dispatchEvent(tabSwitchEvent);
              console.log('✅ PROFILE MANAGER: Dispatched tab switch event for settings tab');
            }
          };
        }
        
        // Attach handler
        visibilityBtn.addEventListener('click', profileManager._visibilitySettingsHandler);
        visibilityBtn.dataset.handlerAttached = 'true';
        
        // Ensure button is active and clickable
        visibilityBtn.style.pointerEvents = 'auto';
        visibilityBtn.style.cursor = 'pointer';
        visibilityBtn.style.opacity = '1';
        visibilityBtn.disabled = false;
        
        console.log('✅ PROFILE_MENU: Visibility button handler attached and activated');
      } else {
        console.log('✅ PROFILE_MENU: Visibility button handler already attached');
      }
    } else {
      console.warn('⚠️ PROFILE_MENU: Visibility button not found in DOM');
    }
  } else {
    console.warn('⚠️ PROFILE_MENU: ProfileManager instance not found');
  }
  
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
      let defaultColor = window.AVATAR_FALLBACK_COLOR; // Fallback
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

// ROOT CAUSE FIX: Unified function to update availability status in BOTH Chrome storage AND database
async function updateAvailabilityEverywhere(availability) {
  console.log('🔄 STATUS_UPDATE: Updating availability everywhere:', availability);
  
  if (!availability || !['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(availability)) {
    console.error('❌ STATUS_UPDATE: Invalid availability:', availability);
    return false;
  }
  
  try {
    // Step 1: Update Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await new Promise((resolve, reject) => {
        chrome.storage.local.set({ 
          userAvailability: availability, 
          availability: availability, 
          globalAvailability: availability 
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('❌ STATUS_UPDATE: Error saving to Chrome storage:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            console.log('✅ STATUS_UPDATE: Saved to Chrome storage:', availability);
            resolve();
          }
        });
      });
    }
    
    // Step 2: Update database via API
    if (window.currentUser && window.currentUser.id && window.api && typeof window.api.request === 'function') {
      try {
        const result = await window.api.request('/v1/presence/availability', {
          method: 'POST',
          body: JSON.stringify({
            availability: availability,
            isGlobal: true
          })
        });
        
        if (result && result.success) {
          console.log('✅ STATUS_UPDATE: Saved to database:', availability);
        } else {
          console.error('❌ STATUS_UPDATE: Database update returned no result');
        }
      } catch (error) {
        console.error('❌ STATUS_UPDATE: Error saving to database:', error);
        // Don't throw - Chrome storage update succeeded
      }
    } else {
      console.warn('⚠️ STATUS_UPDATE: Cannot update database - missing user or API');
    }
    
    // Step 3: Update local user object immediately
    if (window.currentUser) {
      window.currentUser.availability = availability;
      window.currentUser.globalAvailability = availability;
      console.log('✅ STATUS_UPDATE: Updated window.currentUser');
    }
    
    // Step 4: Update visibility cache immediately to prevent stale data
    if (window.currentVisibilityDataUnfiltered?.active) {
      const currentUserInVisibility = window.currentVisibilityDataUnfiltered.active.find(u => 
        String(u.id || u.userId || u.user_id) === String(window.currentUser?.id)
      );
      if (currentUserInVisibility) {
        currentUserInVisibility.availability = availability;
        console.log('✅ STATUS_UPDATE: Updated visibility cache');
      }
    }
    
    if (window.currentVisibilityData?.active) {
      const currentUserInVisibility = window.currentVisibilityData.active.find(u => 
        String(u.id || u.userId || u.user_id) === String(window.currentUser?.id)
      );
      if (currentUserInVisibility) {
        currentUserInVisibility.availability = availability;
      }
    }
    
    // Step 5: Refresh profile avatar to show new status dot
    const profileManagerInstance = window.profileManager || (window.ProfileManager && window.ProfileManager.instance) || this;
    if (profileManagerInstance && typeof profileManagerInstance.updateUserAvatar === 'function') {
      try {
        console.log('🔄 STATUS_UPDATE: Refreshing profile avatar with new status');
        await profileManagerInstance.updateUserAvatar();
        console.log('✅ STATUS_UPDATE: Profile avatar refreshed');
      } catch (error) {
        console.warn('⚠️ STATUS_UPDATE: Error refreshing profile avatar:', error);
      }
    }
    
    // Step 6: Force refresh all message avatars to show new status
    if (typeof window.refreshAllMessageAvatars === 'function') {
      console.log('🔄 STATUS_UPDATE: Refreshing all message avatars with new status');
      await window.refreshAllMessageAvatars();
    }
    
    // Step 7: Refresh visibility avatars
    if (typeof window.refreshVisibilityAvatars === 'function') {
      console.log('🔄 STATUS_UPDATE: Refreshing visibility avatars');
      await window.refreshVisibilityAvatars();
    }
    
    console.log('✅ STATUS_UPDATE: Availability update complete');
    return true;
  } catch (error) {
    console.error('❌ STATUS_UPDATE: Error updating availability:', error);
    return false;
  }
}

// ROOT CAUSE FIX: Unified function to update theme in BOTH Chrome storage AND database
async function updateThemeEverywhere(theme) {
  console.log('🔄 THEME_UPDATE: Updating theme everywhere:', theme);
  
  if (!theme || !['light', 'dark', 'auto'].includes(theme)) {
    console.error('❌ THEME_UPDATE: Invalid theme:', theme);
    return false;
  }
  
  try {
    // Step 1: Update Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await new Promise((resolve, reject) => {
        chrome.storage.local.set({ theme: theme, userTheme: theme }, () => {
          if (chrome.runtime.lastError) {
            console.error('❌ THEME_UPDATE: Error saving to Chrome storage:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            console.log('✅ THEME_UPDATE: Saved to Chrome storage:', theme);
            resolve();
          }
        });
      });
    }
    
    // Step 2: Update localStorage (for compatibility)
    localStorage.setItem('theme', theme);
    
    // Step 3: Update DOM immediately for instant feedback
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    
    // Step 4: Update database via API
    if (window.currentUser && window.currentUser.id && window.api && typeof window.api.request === 'function') {
      try {
        const result = await window.api.request(`/v1/users/${window.currentUser.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            theme: theme
          })
        });
        
        if (result) {
          console.log('✅ THEME_UPDATE: Saved to database:', theme);
        } else {
          console.error('❌ THEME_UPDATE: Database update returned no result');
        }
      } catch (error) {
        console.error('❌ THEME_UPDATE: Error saving to database:', error);
        // Don't throw - Chrome storage update succeeded
      }
    } else {
      console.warn('⚠️ THEME_UPDATE: Cannot update database - missing user or API');
    }
    
    // Step 5: Update local user object immediately
    if (window.currentUser) {
      window.currentUser.theme = theme;
      console.log('✅ THEME_UPDATE: Updated window.currentUser');
    }
    
    // Step 6: Update profile menu theme icon and text (both IDs)
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    const themeIconMenu = document.getElementById('theme-icon-menu');
    const themeTextMenu = document.getElementById('theme-text-menu');
    
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    if (themeText) {
      themeText.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    }
    if (themeIconMenu) {
      themeIconMenu.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    if (themeTextMenu) {
      themeTextMenu.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    }
    
    // Step 7: Update settings tab theme toggle if it exists
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.checked = theme === 'dark';
      // Trigger updateThemeStatus to update slider position
      if (window.visibilitySettingsManager && typeof window.visibilitySettingsManager.updateThemeStatus === 'function') {
        window.visibilitySettingsManager.updateThemeStatus();
      }
      console.log('✅ THEME_UPDATE: Updated settings tab theme toggle');
    }
    
    console.log('✅ THEME_UPDATE: Theme update complete');
    return true;
  } catch (error) {
    console.error('❌ THEME_UPDATE: Error updating theme:', error);
    return false;
  }
}

// ROOT CAUSE FIX: Get current user's theme (Chrome storage first, then database fallback)
async function getCurrentUserTheme() {
  console.log('🔍 THEME_GET: Getting current user theme (Chrome storage first, then database)');
  
  // ROOT CAUSE FIX: Check Chrome storage FIRST
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const storageResult = await new Promise((resolve) => {
        chrome.storage.local.get(['theme', 'userTheme'], (result) => {
          resolve(result);
        });
      });
      
      const cachedTheme = storageResult.theme || storageResult.userTheme;
      if (cachedTheme && ['light', 'dark', 'auto'].includes(cachedTheme)) {
        console.log(`✅ THEME_GET: Found theme in Chrome storage: ${cachedTheme}`);
        return cachedTheme;
      }
    } catch (error) {
      console.warn('⚠️ THEME_GET: Error reading Chrome storage:', error);
    }
  }
  
  // Fallback 1: Try localStorage (for compatibility)
  const localStorageTheme = localStorage.getItem('theme');
  if (localStorageTheme && ['light', 'dark', 'auto'].includes(localStorageTheme)) {
    console.log(`✅ THEME_GET: Found theme in localStorage: ${localStorageTheme}`);
    // Cache it in Chrome storage for next time
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ theme: localStorageTheme, userTheme: localStorageTheme });
    }
    return localStorageTheme;
  }
  
  // Fallback 2: Try to get from current user object (from database)
  if (window.currentUser && window.currentUser.theme) {
    const userTheme = window.currentUser.theme;
    if (['light', 'dark', 'auto'].includes(userTheme)) {
      console.log(`✅ THEME_GET: Found theme in currentUser: ${userTheme}`);
      return userTheme;
    }
  }
  
  // Fallback 3: Try to fetch from database via API
  if (window.currentUser && window.currentUser.id && window.api && typeof window.api.request === 'function') {
    try {
      const userData = await window.api.request(`/v1/users/${window.currentUser.id}`, {
        method: 'GET'
      });
      if (userData && userData.theme) {
        console.log(`✅ THEME_GET: Fetched theme from database API: ${userData.theme}`);
        // Cache it in Chrome storage for next time
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ theme: userData.theme, userTheme: userData.theme });
        }
        // Also update localStorage for compatibility
        localStorage.setItem('theme', userData.theme);
        return userData.theme;
      }
    } catch (error) {
      console.warn('⚠️ THEME_GET: Error fetching from database API:', error);
    }
  }
  
  // Fallback 4: Check DOM attribute
  const domTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
  if (domTheme && ['light', 'dark', 'auto'].includes(domTheme)) {
    console.log(`✅ THEME_GET: Found theme in DOM: ${domTheme}`);
    return domTheme;
  }
  
  // Final fallback to default
  console.log('⚠️ THEME_GET: No theme found, using default: light');
  return 'light';
}

// ROOT CAUSE FIX: Get current user's availability (Chrome storage first, then database fallback)
async function getCurrentUserAvailability() {
  console.log('🔍 STATUS_GET: Getting current user availability (Chrome storage first, then database)');
  
  // ROOT CAUSE FIX: Check Chrome storage FIRST
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const storageResult = await new Promise((resolve) => {
        chrome.storage.local.get(['userAvailability', 'availability', 'globalAvailability'], (result) => {
          resolve(result);
        });
      });
      
      const cachedAvailability = storageResult.userAvailability || storageResult.availability || storageResult.globalAvailability;
      if (cachedAvailability && ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(cachedAvailability)) {
        console.log(`✅ STATUS_GET: Found availability in Chrome storage: ${cachedAvailability}`);
        return cachedAvailability;
      }
    } catch (error) {
      console.warn('⚠️ STATUS_GET: Error reading Chrome storage:', error);
    }
  }
  
  // Fallback 1: Try to get from current user object (from database)
  if (window.currentUser) {
    const userAvailability = window.currentUser.availability || window.currentUser.globalAvailability;
    if (userAvailability && ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(userAvailability)) {
      console.log(`✅ STATUS_GET: Found availability in currentUser: ${userAvailability}`);
      return userAvailability;
    }
  }
  
  // Fallback 2: Try to get from visibility data (database)
  if (window.currentVisibilityDataUnfiltered?.active) {
    const currentUserInVisibility = window.currentVisibilityDataUnfiltered.active.find(u => 
      String(u.id || u.userId || u.user_id) === String(window.currentUser?.id)
    );
    if (currentUserInVisibility && currentUserInVisibility.availability) {
      console.log(`✅ STATUS_GET: Found availability in visibility data: ${currentUserInVisibility.availability}`);
      return currentUserInVisibility.availability;
    }
  }
  
  // Fallback 3: Try to fetch from database via API
  if (window.currentUser && window.currentUser.id && window.api && typeof window.api.request === 'function') {
    try {
      const statusData = await window.api.request('/v1/presence/availability', {
        method: 'GET'
      });
      if (statusData && statusData.availability) {
        console.log(`✅ STATUS_GET: Fetched availability from database API: ${statusData.availability}`);
        // Cache it in Chrome storage for next time
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ 
            userAvailability: statusData.availability, 
            availability: statusData.availability, 
            globalAvailability: statusData.availability 
          });
        }
        return statusData.availability;
      }
    } catch (error) {
      console.warn('⚠️ STATUS_GET: Error fetching from database API:', error);
    }
  }
  
  // Final fallback to default
  console.log('⚠️ STATUS_GET: No availability found, using default: AVAILABLE');
  return 'AVAILABLE';
}

// Make available globally
window.ProfileManager = ProfileManager;
window.getCurrentUserAuraColor = getCurrentUserAuraColor;
window.updateAuraColorEverywhere = updateAuraColorEverywhere;
window.getCurrentUserTheme = getCurrentUserTheme;
window.updateThemeEverywhere = updateThemeEverywhere;
window.getCurrentUserAvailability = getCurrentUserAvailability;
window.updateAvailabilityEverywhere = updateAvailabilityEverywhere;
window.getCurrentUserAvatarBgColor = getCurrentUserAvatarBgColor;
window.getCurrentUserAvatarColor = getCurrentUserAvatarColor;
window.setCustomAvatarColor = setCustomAvatarColor;
window.resetCustomAvatarColor = resetCustomAvatarColor;
window.handleAvatarClick = handleAvatarClick;
window.handleClickOutside = handleClickOutside;
window.addProfileAvatarClickHandler = addProfileAvatarClickHandler;
window.addAuraButtonClickHandler = addAuraButtonClickHandler;
window.addLogoutButtonClickHandler = addLogoutButtonClickHandler;
window.addAllProfileMenuHandlers = addAllProfileMenuHandlers;
window.showColorPickerModal = showColorPickerModal;
window.closeColorPickerModal = closeColorPickerModal;
window.updateColorPreview = updateColorPreview;
window.isValidHex = isValidHex;
window.getAvatarColor = getAvatarColor;

console.log('ProfileManager module loaded', null, 'profile');




