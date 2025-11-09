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
          // CRITICAL FIX: Check Chrome storage FIRST for instant display
          let auraColorValue = this.profileData?.auraColor || this.profileData?.aura_color || window.currentUser.auraColor || window.currentUser.aura_color;
          let fromChromeStorage = false;
          
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
                fromChromeStorage = true;
                console.log('🎨 PROFILE MANAGER: Using aura color from Chrome storage (CACHE):', auraColorValue);
                // Update currentUser and profileData with cached value
                if (window.currentUser) {
                  window.currentUser.auraColor = auraColorValue;
                  window.currentUser.aura_color = auraColorValue;
                }
                if (this.profileData) {
                  this.profileData.auraColor = auraColorValue;
                  this.profileData.aura_color = auraColorValue;
                }
              }
            } catch (error) {
              console.warn('⚠️ PROFILE MANAGER: Could not read from Chrome storage:', error);
            }
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

          const avatarHTML = await window.AvatarUtils.createUnifiedAvatar(userDataForAvatar, {
            context: 'profile',
            showAura: true,
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
    
    // Add click handler
    userAvatarContainer.onclick = (e) => {
      e.stopPropagation();
      console.log('🔧 PROFILE MANAGER: COMP METHOD - Profile avatar clicked');
      this.toggleUserMenu();
    };
    
    console.log('✅ PROFILE MANAGER: COMP METHOD - Profile menu and aura modal setup complete');
  }

  /**
   * COMP METHOD: Toggle user menu
   */
  async toggleUserMenu() {
    console.log('🔧 PROFILE MANAGER: COMP METHOD - Toggling user menu...');

    let userMenu = document.getElementById('user-menu');
    if (!userMenu) {
      await this.createUserMenu();
    } else {
      const isVisible = userMenu.style.display !== 'none';
      userMenu.style.display = isVisible ? 'none' : 'block';
      console.log('🔧 PROFILE MANAGER: COMP METHOD - Menu toggled:', !isVisible);
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
      z-index: 1000;
      min-width: 200px;
      display: block;
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
        smallAvatarHTML = `<div class="user-avatar-small" style="width: 24px; height: 24px; border-radius: 50%; background: #007bff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
          ${currentUser.name.charAt(0).toUpperCase()}
        </div>`;
      }
    } else {
      smallAvatarHTML = `<div class="user-avatar-small" style="width: 24px; height: 24px; border-radius: 50%; background: #007bff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
        ${currentUser.name.charAt(0).toUpperCase()}
      </div>`;
    }

    userMenu.innerHTML = `
      <div class="user-menu-header" style="padding: 12px; border-bottom: 1px solid #eee;">
        <div class="user-info" style="display: flex; align-items: center; gap: 8px;">
          ${smallAvatarHTML}
          <div>
            <div class="user-name" style="font-weight: bold; font-size: 14px;">${currentUser.name}</div>
            <div class="user-id" style="font-size: 12px; color: #666;">${currentUser.id || currentUser.user_id}</div>
          </div>
        </div>
      </div>
      <div class="user-menu-actions" style="padding: 8px 0;">
        <button class="menu-action" id="aura-color-btn" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <span>🎨</span>
          <span>Change Aura Color</span>
        </button>
        <button class="menu-action" id="theme-toggle-btn" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <span>🌙</span>
          <span>Toggle Theme</span>
        </button>
        <button class="menu-action" id="logout-btn" style="width: 100%; padding: 8px 12px; border: none; background: none; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 8px; color: #d32f2f;">
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    `;
    
    // Add to avatar container
    const userAvatarContainer = document.getElementById('user-avatar-container');
    if (userAvatarContainer) {
      userAvatarContainer.appendChild(userMenu);
    }
    
    // Add event listeners
    this.addUserMenuEventListeners();
    
    console.log('✅ PROFILE MANAGER: COMP METHOD - User menu created');
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
        await this.toggleTheme();
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
    }
  }

  /**
   * COMP METHOD: Show color picker modal
   */
  showColorPickerModal() {
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
    
    // COMP METHOD: Get current user's database aura color
    const currentAuraColor = this.getCurrentUserAuraColor();
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
      resetBtn.onclick = () => {
        const currentColor = getCurrentUserAuraColor();
        const currentHex = currentColor.replace('#', '');
        colorInput.value = currentHex;
        previewCircle.style.background = currentColor;
        previewText.textContent = `Current: ${currentColor}`;
      };
    }
    
    // Save button
    if (saveBtn) {
      saveBtn.onclick = () => {
        const color = colorInput.value;
        if (color.length === 6) {
          console.log('🔧 PROFILE MANAGER: COMP METHOD - Saving aura color:', color);
          // Store aura color locally
          chrome.storage.local.set({ userAuraColor: '#' + color });
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
    // Use the global toggleTheme function if available, otherwise use data-theme attribute
    if (typeof window.toggleTheme === 'function') {
      console.log('🔧 PROFILE MANAGER: Using window.toggleTheme');
      await window.toggleTheme();
    } else {
      // Fallback: Use data-theme attribute (matches UIManager system)
      const body = document.body;
      const currentTheme = body.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      body.setAttribute('data-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Update icon and text
      const themeIcon = document.getElementById('theme-icon');
      const themeText = document.getElementById('theme-text');
      if (themeIcon) {
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      }
      if (themeText) {
        themeText.textContent = newTheme === 'dark' ? 'Light mode' : 'Dark mode';
      }
      
      // Save to localStorage
      if (typeof window.setState === 'function') {
        window.setState('theme', newTheme);
      } else {
        localStorage.setItem('theme', newTheme);
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
      const displayName = this.profileData.name || this.profileData.email;
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
    
    // CRITICAL FIX: Ensure we have auraColor for the profile avatar
    // Priority: Chrome Storage (cache) > PreRenderInitializer (database) > profileData > currentUser > API fetch
    let auraColorValue = this.profileData.auraColor || this.profileData.aura_color;

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

        const avatarHTML = await window.AvatarUtils.createUnifiedAvatar(userForAvatar, {
          context: 'profile',
          showAura: true,
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
        ${currentUser.name.charAt(0).toUpperCase()}
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
// COMP METHOD: Get current user's database aura color for modal
function getCurrentUserAuraColor() {
  console.log('🔍 AURA_MODAL: Getting current user aura color from database');
  
  // First try to get from current user object
  if (window.currentUser && window.currentUser.auraColor && window.currentUser.auraColor !== window.AVATAR_FALLBACK_COLOR) {
    console.log(`✅ AURA_MODAL: Found database aura color in currentUser: ${window.currentUser.auraColor}`);
    return window.currentUser.auraColor;
  }
  
  // Try to get from visibility data
  if (window.currentVisibilityData && window.currentVisibilityData.active) {
    const currentUserEmail = window.currentUser?.email;
    if (currentUserEmail) {
      const userData = window.currentVisibilityData.active.find(u => u.email === currentUserEmail);
      if (userData && userData.auraColor && userData.auraColor !== window.AVATAR_FALLBACK_COLOR) {
        console.log(`✅ AURA_MODAL: Found database aura color in visibility data: ${userData.auraColor}`);
        return userData.auraColor;
      }
    }
  }
  
  // Try to get from unfiltered visibility data
  if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
    const currentUserEmail = window.currentUser?.email;
    if (currentUserEmail) {
      const userData = window.currentVisibilityDataUnfiltered.active.find(u => u.email === currentUserEmail);
      if (userData && userData.auraColor && userData.auraColor !== window.AVATAR_FALLBACK_COLOR) {
        console.log(`✅ AURA_MODAL: Found database aura color in unfiltered visibility data: ${userData.auraColor}`);
        return userData.auraColor;
      }
    }
  }
  
  // Fallback to default
  console.log('⚠️ AURA_MODAL: No database aura color found, using default');
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

function addThemeToggleButtonClickHandler() {
  // NOTE: This function is now handled by ProfileManager.addEventListeners()
  // Keeping this function for backwards compatibility but it should not be called
  // as ProfileManager handles the theme toggle button
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    // Check if handler is already attached by ProfileManager
    if (themeToggleBtn.dataset.handlerAttached !== 'true') {
      themeToggleBtn.addEventListener('click', async (e) => {
        console.log('🌙 COMP METHOD: Theme toggle button clicked! (fallback handler)');
        e.stopPropagation();
        if (typeof window.toggleTheme === 'function') {
          await window.toggleTheme();
        } else {
          console.log('❌ toggleTheme not available');
        }
        // CRITICAL: Close profile menu after theme toggle
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
          userMenu.style.display = 'none';
        }
      });
      // CRITICAL FIX: Set handler attached flag so diagnostic knows handler is attached
      themeToggleBtn.dataset.handlerAttached = 'true';
      console.log('✅ COMP METHOD: Theme toggle button fallback handler added and flagged');
    } else {
      console.log('✅ COMP METHOD: Theme toggle button already handled by ProfileManager');
    }
  } else {
    console.log('❌ Theme toggle button not found');
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

// Make available globally
window.ProfileManager = ProfileManager;
window.getCurrentUserAuraColor = getCurrentUserAuraColor;
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




