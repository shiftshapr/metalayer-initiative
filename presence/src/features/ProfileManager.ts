import { User } from '../types/index.js';
import { AvatarUtils } from '../utils/AvatarUtils.js';
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { apiServiceInstance } from '../services/APIService.js';
import { Logger } from '../utils/Logger.js';
import { userPreferencesManager } from '../utils/UserPreferencesManager.js';
import { authManagerInstance } from './AuthManager.js';

/**
 * ProfileManager.ts - User Profile Management Module
 * Extracted from sidepanel.js for modular architecture
 * 
 * Responsibilities:
 * - User profile display and updates
 * - Avatar management and updates
 * - Profile UI state management
 * - Profile data synchronization
 */

type PreRenderData = {
  auraColor?: string;
  avatarUrl?: string;
  isInitialized?: boolean;
  userData?: User;
  [key: string]: unknown;
};

type PreRenderInitializer = {
  isInitialized: boolean;
  getPreRenderData: () => PreRenderData;
};

declare const chrome: {
  storage?: {
    local?: {
      get(keys: string[] | Record<string, unknown>, callback: (result: Record<string, unknown>) => void): void;
      set(items: Record<string, unknown>, callback?: () => void): void;
      clear?(callback?: () => void): void;
    };
  };
  runtime?: {
    lastError?: Error;
    sendMessage?: (...args: unknown[]) => void;
  };
};


// Helper functions using ES6 imports (no window globals)
const getApi = () => {
  // ES6 pattern: Use apiServiceInstance directly
  return apiServiceInstance;
};

const ensureApi = (context: string) => {
  const api = getApi();
  if (!api) {
    Logger.warn(`⚠️ PROFILE_MANAGER: API not available (${context})`, null, 'profile');
    return null;
  }
  return api;
};

const getVisibilityDataUnfiltered = (): { active: User[] } | null => {
  const win = window as Window & { currentVisibilityDataUnfiltered?: { active?: unknown[] } };
  const candidate = win.currentVisibilityDataUnfiltered;
  if (candidate && Array.isArray(candidate.active)) {
    return { active: candidate.active as User[] };
  }
  return null;
};

const getVisibilityDataFiltered = (): { active: User[] } | null => {
  const win = window as Window & { currentVisibilityData?: { active?: unknown[] } };
  const candidate = win.currentVisibilityData;
  if (candidate && Array.isArray(candidate.active)) {
    return { active: candidate.active as User[] };
  }
  return null;
};

const getVisibilityData = (): { active: User[] } | null =>
  getVisibilityDataUnfiltered() ?? getVisibilityDataFiltered();

const getUserPreferencesManager = () => {
  // ES6 pattern: Use ES6 import directly
  return userPreferencesManager;
};

const getChromeStorage = <T extends Record<string, unknown>>(keys: string[]): Promise<T> => {
  return new Promise((resolve) => {
    chrome.storage!.local!.get(keys, (result) => {
      resolve((result || {}) as T);
    });
  });
};

const setChromeStorage = (items: Record<string, unknown>): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.storage!.local!.set(items, () => {
      if (chrome.runtime?.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

// ROOT CAUSE FIX: Helper to ensure user object has required fields
// UUID ONLY - no fake IDs, no email fallbacks
// Note: This is synchronous - callers should get currentUser from stateManager first if needed
const ensureUser = (user?: User | null): User | null => {
  if (!user) {
    // UUID ONLY - return null instead of fake user
    return null;
  }
  // UUID ONLY - user.id must be a valid UUID, no fallbacks
  if (!user.id) {
    Logger.warn('⚠️ PROFILE: User missing id (UUID)', { email: user.email }, 'profile');
    return null; // Don't create fake IDs
  }
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(user.id)) {
    Logger.warn('⚠️ PROFILE: user.id is not a valid UUID', { userId: user.id, email: user.email }, 'profile');
    return null; // Invalid ID
  }
  if (!user.name) {
    user.name = user.displayName || user.email?.split('@')[0] || 'User';
  }
  if (!user.displayName) {
    user.displayName = user.name;
  }
  return user;
};

class ProfileManager {
  private profileData: User | null;
  private avatarCache: Map<string, { url?: string; color?: string; initials?: string; [key: string]: unknown }>;
  private updateCallbacks: Array<(data: User | null) => void>;
  private isAuthenticated: boolean;
  private clickOutsideHandler?: (event: MouseEvent) => void;
  public visibilitySettingsHandler?: (event: Event) => void;
  private themeToggleHandler?: (event: Event) => void;

  constructor() {
    this.profileData = null;
    this.avatarCache = new Map();
    this.updateCallbacks = [];
    this.isAuthenticated = false;

    Logger.debug('ProfileManager initialized', null, 'profile');
    
    // ROOT CAUSE FIX: Do NOT load theme on startup - UserPreferencesManager will handle it
    // ProfileManager was setting theme to 'light' from Chrome storage before UserPreferencesManager could load the correct theme
    // this.loadThemeOnStartup(); // DISABLED: Let UserPreferencesManager handle theme loading
    
    this.initializeProfileHandlers();

    // CRITICAL FIX: Initialize avatar immediately with available data, don't wait for everything
    this.initializeProfileAvatarImmediately();

    // Still set up the waiting mechanism for updates
    this.waitForAuthentication();
  }
  
  /**
   * Load and apply theme on startup
   * ROOT CAUSE FIX: Ensures theme persists across page reloads
   */
  async loadThemeOnStartup() {
    try {
      const theme = await getCurrentUserTheme();
      if (theme && typeof theme === 'string' && ['light', 'dark', 'auto'].includes(theme)) {
        Logger.debug('✅ PROFILE MANAGER: Loading theme on startup', { theme }, 'profile');
        // Apply theme immediately
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        // Update theme toggle if it exists
        const themeToggle = document.getElementById('theme-toggle') as HTMLInputElement | null;
        if (themeToggle) {
          themeToggle.checked = theme === 'dark';
        }
        // Update profile menu theme display
        this.updateProfileMenuTheme();
        Logger.debug('✅ PROFILE MANAGER: Theme applied on startup', { theme }, 'profile');
      }
    } catch (error) {
      Logger.warn('⚠️ PROFILE MANAGER: Error loading theme on startup', error, 'profile');
    }
  }

  /**
   * Wait for authentication AND pre-render initialization to complete using proper async/promises
   */
  async waitForAuthentication() {
    Logger.debug('🔧 PROFILE_MANAGER: Waiting for authentication and pre-render data...', null, 'profile');

    // Create promises for each dependency
    const waitForAuth = new Promise<void>((resolve) => {
      const currentUser = stateManagerInstance.getState('currentUser') as User | null;
      if (currentUser && currentUser.id) {
        Logger.debug('🔧 PROFILE_MANAGER: Authentication already available', null, 'profile');
        resolve();
        return;
      }

      Logger.debug('🔧 PROFILE_MANAGER: Waiting for authentication...', null, 'profile');

      // Listen for auth events (these may already be fired, so check immediately)
      const checkAuth = () => {
        const user = stateManagerInstance.getState('currentUser') as User | null;
        if (user && user.id) {
          Logger.debug('🔧 PROFILE_MANAGER: Authentication completed', { email: user.email }, 'profile');
          resolve();
        }
      };

      // Check immediately in case auth already happened
      checkAuth();

      // Listen for future auth completion events
      document.addEventListener(
        'authUIUpdate',
        (event: Event) => {
          const detail = (event as CustomEvent<{ isAuthenticated?: boolean; user?: User }>).detail;
          if (detail?.isAuthenticated && detail.user) {
            checkAuth();
          }
        },
        { once: true }
      );
      document.addEventListener(
        'userUpdated',
        (event: Event) => {
          const detail = (event as CustomEvent<User>).detail;
          if (detail && detail.id) {
            checkAuth();
          }
        },
        { once: true }
      );
    });

    const waitForPreRender = new Promise<void>((resolve) => {
      const win = window as Window & { preRenderInitializer?: PreRenderInitializer };
      if (win.preRenderInitializer?.isInitialized) {
        Logger.debug('🔧 PROFILE_MANAGER: Pre-render already initialized', null, 'profile');
        resolve();
        return;
      }

      Logger.debug('🔧 PROFILE_MANAGER: Waiting for pre-render initialization...', null, 'profile');

      // Listen for pre-render events
      const checkPreRender = () => {
      const win = window as Window & { preRenderInitializer?: PreRenderInitializer };
      if (win.preRenderInitializer?.isInitialized) {
          Logger.debug('🔧 PROFILE_MANAGER: Pre-render initialization completed', null, 'profile');
          const preRenderData = win.preRenderInitializer.getPreRenderData();
          Logger.debug('🔧 PROFILE_MANAGER: Pre-render data', {
            hasAuraColor: !!preRenderData.auraColor,
            hasAvatarUrl: !!preRenderData.avatarUrl,
            auraColor: preRenderData.auraColor
          }, 'profile');
          resolve();
        }
      };

      // Check immediately in case pre-render already happened
      checkPreRender();

      // Listen for future pre-render completion events
      document.addEventListener('preRenderComplete', checkPreRender, { once: true });
    });

    // Add timeout as fallback (30 seconds max)
    const timeout = new Promise<void>((resolve) => {
      setTimeout(() => {
        Logger.warn('🔧 PROFILE_MANAGER: Timeout waiting for full initialization (30s)', null, 'profile');
        Logger.warn('🔧 PROFILE_MANAGER: Proceeding with available data...', null, 'profile');
        resolve();
      }, 30000);
    });

    // Wait for all promises to resolve (auth + pre-render + timeout fallback)
    try {
      await Promise.all([waitForAuth, waitForPreRender, timeout]);
      Logger.debug('🔧 PROFILE_MANAGER: All initialization promises resolved', null, 'profile');
    } catch (error) {
      Logger.error('🔧 PROFILE_MANAGER: Error waiting for promises', error, 'profile');
    }

    // Check final state and proceed
    const currentUserForCheck = stateManagerInstance.getState('currentUser') as User | null;
    const hasUser = currentUserForCheck && currentUserForCheck.id;

    if (hasUser) {
      this.isAuthenticated = true;
      Logger.debug('🔧 PROFILE_MANAGER: Ready to initialize profile avatar...', null, 'profile');
      
      // ROOT CAUSE FIX: Initialize UserPreferencesManager when user becomes available
      await this.initializeUserPreferencesManager(currentUserForCheck);
      
      await this.initializeProfileAvatar();
    } else {
      Logger.warn('🔧 PROFILE_MANAGER: No authentication available, skipping profile avatar initialization', 'profile');
    }
  }

  /**
   * ROOT CAUSE FIX: Initialize UserPreferencesManager when user becomes available
   * This ensures preferences (including theme) are loaded from database and applied correctly
   */
  async initializeUserPreferencesManager(user: User | null) {
    if (!user || !user.id) {
      Logger.warn('⚠️ PROFILE_MANAGER: Cannot initialize UserPreferencesManager - no user ID', null, 'profile');
      return;
    }

    try {
      const win = window as Window & { 
        userPreferencesManager?: { 
          isInitialized?: boolean;
          initialize?: (userId: string) => Promise<boolean>;
        } 
      };

      if (!win.userPreferencesManager) {
        Logger.warn('⚠️ PROFILE_MANAGER: UserPreferencesManager not available on window', null, 'profile');
        return;
      }

      if (win.userPreferencesManager.isInitialized) {
        Logger.debug('✅ PROFILE_MANAGER: UserPreferencesManager already initialized', null, 'profile');
        return;
      }

      Logger.debug('🔧 PROFILE_MANAGER: Initializing UserPreferencesManager for user', { userId: user.id }, 'profile');
      
      if (typeof win.userPreferencesManager.initialize === 'function') {
        const result = await win.userPreferencesManager.initialize(user.id);
        if (result) {
          Logger.debug('✅ PROFILE_MANAGER: UserPreferencesManager initialized successfully', null, 'profile');
        } else {
          Logger.warn('⚠️ PROFILE_MANAGER: UserPreferencesManager initialization returned false', null, 'profile');
        }
      } else {
        Logger.warn('⚠️ PROFILE_MANAGER: UserPreferencesManager.initialize is not a function', null, 'profile');
      }
    } catch (error) {
      Logger.error('❌ PROFILE_MANAGER: Error initializing UserPreferencesManager', error, 'profile');
    }
  }

  /**
   * CRITICAL FIX: Initialize profile avatar with pre-render data to prevent white flash
   */
  async initializeProfileAvatarImmediately() {
    Logger.debug('🔧 PROFILE_MANAGER: Initializing profile avatar with pre-render data to prevent white flash...', null, 'profile');

    // CRITICAL FIX: Wait for PreRenderInitializer to complete before rendering avatar
    // This prevents the 10-15 second white flash while waiting for database auraColor
    const win = window as Window & { preRenderInitializer?: PreRenderInitializer };
    if (!win.preRenderInitializer?.isInitialized) {
      Logger.debug('⏳ PROFILE_MANAGER: Waiting for PreRenderInitializer to complete...', null, 'profile');

      // Wait for pre-render initialization to complete (max 10 seconds)
      const preRenderPromise = new Promise<void>((resolve) => {
        const checkPreRender = () => {
          // ROOT CAUSE FIX: Reuse win variable from outer scope
          if (win.preRenderInitializer?.isInitialized) {
            Logger.debug('✅ PROFILE_MANAGER: PreRenderInitializer completed, proceeding with avatar setup', 'profile');
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
          Logger.debug('⏰ PROFILE_MANAGER: PreRenderInitializer timeout reached, proceeding anyway', 'profile');
          resolve();
        }, 10000);
      });

      await preRenderPromise;
    }

    // Now get the complete pre-render data
    const currentUser = stateManagerInstance.getState('currentUser') as User | null;
    // ROOT CAUSE FIX: Reuse win variable from outer scope
    const preRenderData = win.preRenderInitializer?.getPreRenderData();

    Logger.debug('🔧 PROFILE_MANAGER: Pre-render data available', {
      isInitialized: preRenderData?.isInitialized,
      hasAuraColor: !!preRenderData?.auraColor,
      auraColor: preRenderData?.auraColor,
      hasAvatarUrl: !!preRenderData?.avatarUrl,
      avatarUrl: preRenderData?.avatarUrl?.substring(0, 50) + '...'
    }, 'profile');

    // If we have user data, create the avatar with complete information
    if (currentUser?.id || preRenderData?.userData?.id) {
      Logger.debug('🔧 PROFILE_MANAGER: User data available, setting up avatar with complete data...', 'profile');

      // Set basic profile data from currentUser
      if (currentUser) {
        this.profileData = { ...currentUser };
      }

      // CRITICAL FIX: Check Chrome storage FIRST for instant display
      let auraColorValue = null;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
          const storageResult = await getChromeStorage<{ userAuraColor?: string; auraColor?: string }>(['userAuraColor', 'auraColor']);
          
          const cachedAuraColor = storageResult.userAuraColor || storageResult.auraColor;
          if (cachedAuraColor && cachedAuraColor !== '#ffffff' && cachedAuraColor !== 'white' && cachedAuraColor !== '#fff') {
            auraColorValue = cachedAuraColor;
            Logger.debug('🎨 PROFILE_MANAGER: Using aura color from Chrome storage (CACHE)', { auraColor: auraColorValue }, 'profile');
          }
        } catch (error) {
          Logger.warn('⚠️ PROFILE_MANAGER: Could not read from Chrome storage', error, 'profile');
        }
      }

      // Apply pre-render aura color (takes precedence over cache - this should be the database value)
      if (!auraColorValue && preRenderData?.auraColor) {
        auraColorValue = preRenderData.auraColor;
        Logger.debug('🎨 PROFILE_MANAGER: Using auraColor from pre-render data (DATABASE)', { auraColor: auraColorValue }, 'profile');
        
        // Cache database value in Chrome storage for next time
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          try {
            await setChromeStorage({ userAuraColor: auraColorValue, auraColor: auraColorValue });
            Logger.debug('💾 PROFILE_MANAGER: Cached aura color in Chrome storage', { auraColor: auraColorValue }, 'profile');
          } catch (error) {
            Logger.warn('⚠️ PROFILE_MANAGER: Could not cache to Chrome storage', error, 'profile');
          }
        }
      }

      if (auraColorValue) {
        if (this.profileData) {
          this.profileData.auraColor = auraColorValue;
        }
        if (currentUser) {
          currentUser.auraColor = auraColorValue;
        }
      } else {
        Logger.debug('⚠️ PROFILE_MANAGER: No auraColor in cache or pre-render data, will fallback to auth data or API fetch', 'profile');
      }

      // Apply pre-render avatar URL if available
      if (preRenderData?.avatarUrl && currentUser) {
        currentUser.avatarUrl = preRenderData.avatarUrl;
        if (this.profileData) {
          this.profileData.avatarUrl = preRenderData.avatarUrl;
        }
        Logger.debug('🖼️ PROFILE_MANAGER: Using avatarUrl from pre-render data', null, 'profile');
      }

      // Verify we have the auraColor before rendering
      if (this.profileData && this.profileData.auraColor) {
        Logger.debug('🎉 PROFILE_MANAGER: AuraColor available from pre-render/auth data - no white flash!', null, 'profile');
      } else {
        Logger.debug('⚠️ PROFILE_MANAGER: AuraColor still missing - will cause white flash', null, 'profile');
      }

      // Set up the profile menu and avatar with complete data
      await this.setupProfileMenuAndAuraModal();

      Logger.debug('✅ PROFILE_MANAGER: Profile avatar initialized with complete pre-render data', null, 'profile');
    } else {
      Logger.debug('🔧 PROFILE_MANAGER: No user data available, will initialize when authentication completes', 'profile');
    }
  }

  /**
   * Initialize profile avatar after authentication
   */
  async initializeProfileAvatar() {
    Logger.debug('🔧 PROFILE_MANAGER: Initializing profile avatar after authentication...', null, 'profile');

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
      Logger.debug('🔧 PROFILE_MANAGER: Loading aura color from available sources...', null, 'profile');

      // First priority: Check pre-render initializer data
      const win = window as Window & { preRenderInitializer?: PreRenderInitializer };
      if (win.preRenderInitializer?.getPreRenderData) {
        const preRenderData = win.preRenderInitializer.getPreRenderData();
        Logger.debug('🔧 PROFILE_MANAGER: Pre-render data available', {
          isInitialized: preRenderData.isInitialized,
          auraColor: preRenderData.auraColor,
          avatarUrl: preRenderData.avatarUrl
        }, 'profile');

        if (preRenderData.auraColor) {
          Logger.debug('🎨 PROFILE_MANAGER: Using aura color from pre-render data (DATABASE)', { auraColor: preRenderData.auraColor }, 'profile');
          const currentUserForAura = stateManagerInstance.getState('currentUser') as User | null;
          if (currentUserForAura) {
            stateManagerInstance.setState('currentUser', { ...currentUserForAura, auraColor: preRenderData.auraColor });
          }

          // Update profile data if it exists
          if (this.profileData) {
            this.profileData.auraColor = preRenderData.auraColor;
          }
          Logger.debug('✅ PROFILE_MANAGER: Aura color applied to currentUser and profileData', null, 'profile');
          return; // Don't check storage if we have pre-render data
        } else if (preRenderData.isInitialized) {
          Logger.debug('ℹ️ PROFILE_MANAGER: Pre-render initialized but no aura color available', null, 'profile');
        } else {
          Logger.debug('⏳ PROFILE_MANAGER: Pre-render data available but not yet initialized', null, 'profile');
        }
      } else {
        Logger.debug('⚠️ PROFILE_MANAGER: Pre-render initializer not available', null, 'profile');
      }

      // Fallback: Load aura color from state storage (set by aura color modal)
      // ROOT CAUSE FIX: Use stateManagerInstance instead of window.getState
      const storedColor = await stateManagerInstance.getState('userAvatarBgColor') as string | undefined;
      if (storedColor) {
        Logger.debug('🔧 PROFILE_MANAGER: Checking storage for aura color', { storedColor }, 'profile');

        if (storedColor && storedColor !== AVATAR_FALLBACK_COLOR) {
          Logger.debug('🎨 PROFILE_MANAGER: Using aura color from storage (USER PREFERENCE)', { storedColor }, 'profile');
          const currentUserForAura = stateManagerInstance.getState('currentUser') as User | null;
          if (currentUserForAura) {
            stateManagerInstance.setState('currentUser', { ...currentUserForAura, auraColor: storedColor });
          }

          // Update profile data if it exists
          if (this.profileData) {
            this.profileData.auraColor = storedColor;
          }
          Logger.debug('✅ PROFILE_MANAGER: Aura color applied from storage', null, 'profile');
        } else {
          Logger.debug('ℹ️ PROFILE_MANAGER: No valid aura color in storage', null, 'profile');
        }
      } else {
        Logger.debug('⚠️ PROFILE_MANAGER: State storage not available', null, 'profile');
      }

      // Last resort: Try to fetch aura color directly from API
      const api = getApi();
      const currentUserForApi = stateManagerInstance.getState('currentUser') as User | null;
      if (currentUserForApi?.id && api && !this.profileData?.auraColor) {
        Logger.debug('🔍 PROFILE_MANAGER: Last resort - fetching aura color directly from API...', null, 'profile');
        try {
          const userResponse = await api.request(`/v1/users/${currentUserForApi.id}`, {
            method: 'GET'
          });

          // ROOT CAUSE FIX: API response is wrapped in APIResponse type, check data property
          let apiAuraColor: string | null = null;
          if (userResponse && typeof userResponse === 'object') {
            if ('data' in userResponse && userResponse.data && typeof userResponse.data === 'object' && 'auraColor' in userResponse.data) {
              apiAuraColor = typeof userResponse.data.auraColor === 'string' ? userResponse.data.auraColor : null;
            } else if ('auraColor' in userResponse) {
              // Fallback: check if auraColor is directly on response
              apiAuraColor = typeof (userResponse as { auraColor?: string }).auraColor === 'string' 
                ? (userResponse as { auraColor: string }).auraColor 
                : null;
            }
          }
          if (apiAuraColor) {
            Logger.debug('🎨 PROFILE_MANAGER: Retrieved aura color from API (fallback)', { apiAuraColor }, 'profile');

            stateManagerInstance.setState('currentUser', { ...currentUserForApi, auraColor: apiAuraColor });

            // Update profile data if it exists
            if (this.profileData) {
              this.profileData.auraColor = apiAuraColor;
            }

            Logger.debug('✅ PROFILE_MANAGER: Aura color applied from API fallback', null, 'profile');
            return;
          } else {
            Logger.debug('⚠️ PROFILE_MANAGER: API response received but no aura color found', null, 'profile');
          }
        } catch (apiError: unknown) {
          const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
          Logger.warn('⚠️ PROFILE_MANAGER: API fallback failed', { errorMessage }, 'profile');
        }
      }

    } catch (error) {
      Logger.debug('🔧 PROFILE_MANAGER: Could not load aura color from storage', error, 'profile');
    }
  }

  /**
   * Initialize profile event handlers
   */
  initializeProfileHandlers() {
    // Listen for user updates
    document.addEventListener('userUpdated', (event: Event) => {
      const detail = (event as CustomEvent<User>).detail;
      if (detail) {
        this.handleUserUpdate(detail);
      }
    });

    // Listen for avatar updates
    document.addEventListener('avatarUpdated', (event: Event) => {
      const detail = (event as CustomEvent<{ avatarUrl?: string; source?: string }>).detail;
      if (detail) {
        this.handleAvatarUpdate(detail);
      }
    });

    // Listen for profile UI updates
    document.addEventListener('authUIUpdate', (event: Event) => {
      const detail = (event as CustomEvent<{ isAuthenticated?: boolean; user?: User; [key: string]: unknown }>).detail;
      if (detail) {
        this.handleAuthUIUpdate(detail);
      }
    });

    // Listen for aura color updates
    document.addEventListener('auraColorUpdated', (event: Event) => {
      const detail = (event as CustomEvent<{ auraColor?: string; color?: string; userId?: string; user?: User; [key: string]: unknown }>).detail;
      if (detail) {
        this.handleAuraColorUpdate(detail);
      }
    });

    // ROOT CAUSE FIX: Subscribe to stateManager currentUser updates (event-driven, NO POLLING)
    // This handles the race condition where avatar is created before auraColor is fetched from API
    // Using StateManager subscription instead of polling - aligns with Supabase real-time architecture
    stateManagerInstance.subscribe('currentUser', (newValue, oldValue) => {
      const currentUser = newValue as User | null;
      const oldUser = oldValue as User | null;
      
      // Only update if auraColor changed from missing/invalid to valid
      const oldAuraColor = oldUser?.auraColor;
      const newAuraColor = currentUser?.auraColor;
      
      if (currentUser && newAuraColor && 
          newAuraColor !== AVATAR_FALLBACK_COLOR &&
          newAuraColor !== '#ffffff' &&
          newAuraColor !== 'ffffff' &&
          newAuraColor !== oldAuraColor) { // Only if auraColor actually changed
        
        // Check if avatar exists but has wrong aura color
        const avatarContainer = document.getElementById('user-avatar-container');
        if (avatarContainer) {
          const userAvatar = avatarContainer.querySelector('.user-avatar') as HTMLElement | null;
          if (userAvatar) {
            const auraElement = userAvatar.querySelector('.avatar-aura-background') as HTMLElement | null;
            if (auraElement) {
              const existingAuraColor = window.getComputedStyle(auraElement).backgroundColor;
              // If existing aura is white/fallback and we have a valid color, update avatar
              if (existingAuraColor === 'rgb(255, 255, 255)' || existingAuraColor === 'rgba(255, 255, 255, 1)') {
                Logger.debug('🔄 PROFILE MANAGER: Aura color updated via StateManager subscription, refreshing avatar...', { newAuraColor }, 'profile');
                // Reset promise to allow avatar update
                this.setupProfileMenuAndAuraModalPromise = null;
                this.setupProfileMenuAndAuraModal();
              }
            }
          }
        }
      }
    });
    
    // Store unsubscribe function for cleanup (if needed in future)
    // Note: unsubscribeCurrentUser is stored but not currently used for cleanup

    // COMP METHOD: Initialize profile menu and aura modal fixes
    this.initializeProfileMenuAndAuraModal();
  }

  /**
   * COMP METHOD: Initialize profile menu and aura modal with error handling
   */
  initializeProfileMenuAndAuraModal() {
    Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Initializing profile menu and aura modal...', null, 'profile');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupProfileMenuAndAuraModal());
    } else {
      this.setupProfileMenuAndAuraModal();
    }
  }

  /**
   * ROOT CAUSE FIX: Ensure parent container #user-info is visible when user is authenticated
   */
  private ensureUserInfoVisible(): void {
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
      const currentUser = stateManagerInstance.getState('currentUser') as User | null;
      // ROOT CAUSE FIX: Check computed style, not just inline style (may be hidden by CSS)
      const computedStyle = window.getComputedStyle(userInfo);
      if (currentUser && (computedStyle.display === 'none' || userInfo.style.display === 'none')) {
        userInfo.style.display = 'flex'; // Match the inline style intent (align-items: center suggests flex)
        Logger.debug('✅ PROFILE MANAGER: Showing user-info container (was hidden)', null, 'profile');
      }
    }
  }

  /**
   * COMP METHOD: Setup profile menu and aura modal
   * ROOT CAUSE FIX: Wait for currentUser if not available, retry when it becomes available
   * ROOT CAUSE FIX: Prevent multiple simultaneous calls to avoid redundant API requests
   */
  private setupProfileMenuAndAuraModalPromise: Promise<void> | null = null;
  async setupProfileMenuAndAuraModal() {
    // ROOT CAUSE FIX: Prevent multiple simultaneous calls - but allow retry if promise completed
    // Check if promise exists AND is still pending (not completed)
    if (this.setupProfileMenuAndAuraModalPromise) {
      // Check if promise is already resolved/rejected by trying to access it
      try {
        // If promise exists, wait for it to complete
        Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - setupProfileMenuAndAuraModal already in progress, waiting...', 'profile');
        await this.setupProfileMenuAndAuraModalPromise;
        // After waiting, check if we still need to proceed (currentUser might be available now)
        const currentUserAfterWait = stateManagerInstance.getState('currentUser') as User | null;
        if (currentUserAfterWait && currentUserAfterWait.id) {
          // Promise completed but we should proceed now that currentUser is available
          // Reset promise and continue
          this.setupProfileMenuAndAuraModalPromise = null;
        } else {
          // Still no currentUser, exit
          return;
        }
      } catch (error) {
        // Promise rejected, reset and continue
        Logger.warn('⚠️ PROFILE MANAGER: Previous setupProfileMenuAndAuraModal promise rejected', error, 'profile');
        this.setupProfileMenuAndAuraModalPromise = null;
      }
    }
    
    this.setupProfileMenuAndAuraModalPromise = (async () => {
      try {
        Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Setting up profile menu and aura modal...', null, 'profile');

    // ROOT CAUSE FIX: Get currentUser - if not available, StateManager subscription will trigger update when it arrives
    // NO POLLING - using event-driven architecture (StateManager subscription handles updates)
    let currentUserForAvatar = stateManagerInstance.getState('currentUser') as User | null;
    if (!currentUserForAvatar || !currentUserForAvatar.id) {
      Logger.debug('⏳ PROFILE MANAGER: COMP METHOD - currentUser not yet available, will update via StateManager subscription when it arrives', 'profile');
      // Don't wait/poll - StateManager subscription (set up in constructor) will trigger update when currentUser arrives
      // Create fallback avatar for now
      this.createFallbackAvatar();
      // ROOT CAUSE FIX: Reset promise before returning early so future calls can proceed
      // Note: This reset happens inside the promise, so it will be reset in finally block too
      return; // Exit early, subscription will trigger update when currentUser arrives
    }

      // ROOT CAUSE FIX: Ensure parent container #user-info is visible
      this.ensureUserInfoVisible();
      
      // COMP: Update user info display (name in menu)
      this.updateUserInfo();

    // Find or create user avatar container
    let userAvatarContainer = document.getElementById('user-avatar-container');
    if (!userAvatarContainer) {
      Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Creating user avatar container...', null, 'profile');
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
      Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Found existing user avatar container, updating size for profile avatar...', 'profile');
      // Update existing container size to accommodate profile avatar (32px + 2px aura extension on each side)
      userAvatarContainer.style.width = '36px';  // 32px avatar + 2px aura extension on each side
      userAvatarContainer.style.height = '36px'; // 32px avatar + 2px aura extension on each side
      userAvatarContainer.style.minWidth = '36px';
      userAvatarContainer.style.minHeight = '36px';
    }

    // ROOT CAUSE FIX: Create/update user avatar if:
    // 1. Avatar doesn't exist, OR
    // 2. currentUser is now available and we want to replace fallback with real avatar, OR
    // 3. Avatar exists but auraColor is now available and different (race condition fix)
    let userAvatar = userAvatarContainer.querySelector('.user-avatar') as HTMLElement | null;
    // Check if current avatar is a fallback (has specific fallback styling or class)
    const isFallbackAvatar = userAvatar && (
      userAvatar.classList.contains('fallback-avatar') ||
      (userAvatar.style && userAvatar.style.backgroundColor === '#007bff') ||
      !userAvatar.querySelector('img') // Fallback avatars typically don't have img
    );
    
    // ROOT CAUSE FIX: Check if existing avatar has wrong aura color (white/fallback) and we now have correct color
    let needsAuraColorUpdate = false;
    if (userAvatar && currentUserForAvatar) {
      const latestCurrentUser = stateManagerInstance.getState('currentUser') as User | null;
      const currentAuraColor = latestCurrentUser?.auraColor;
      if (currentAuraColor && 
          currentAuraColor !== AVATAR_FALLBACK_COLOR &&
          currentAuraColor !== '#ffffff' &&
          currentAuraColor !== 'ffffff') {
        // Check if existing avatar has white/fallback aura color
        const existingAuraElement = userAvatar.querySelector('.avatar-aura-background') as HTMLElement | null;
        if (existingAuraElement) {
          const existingAuraColor = window.getComputedStyle(existingAuraElement).backgroundColor;
          // If existing aura is white (rgb(255, 255, 255)) and we have a valid color, update it
          if (existingAuraColor === 'rgb(255, 255, 255)' || existingAuraColor === 'rgba(255, 255, 255, 1)') {
            needsAuraColorUpdate = true;
            Logger.debug('🔄 PROFILE MANAGER: Existing avatar has white aura color, will update', { currentAuraColor }, 'profile');
          }
        }
      }
    }
    
    // Should create/update if: no avatar, fallback exists, OR aura color needs update
    const shouldCreateAvatar = !userAvatar || (isFallbackAvatar && currentUserForAvatar && currentUserForAvatar.id) || needsAuraColorUpdate;
    
    if (shouldCreateAvatar) {
      Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Creating/updating user avatar...', null, 'profile');

      // ROOT CAUSE FIX: Use imported AvatarUtils directly (TypeScript import - no need to wait or check window)
      // AvatarUtils is imported at the top of this file, so it's always available
      // ROOT CAUSE FIX: Re-check currentUser after waiting
      if (!currentUserForAvatar) {
        currentUserForAvatar = stateManagerInstance.getState('currentUser') as User | null;
      }
      
      if (currentUserForAvatar && currentUserForAvatar.id && typeof AvatarUtils.createUnifiedAvatar === 'function') {
        try {
          // ROOT CAUSE FIX: Prioritize stateManager's currentUser.auraColor (most up-to-date from API)
          let auraColorValue = null;
          let fromChromeStorage = false;
          
          // ROOT CAUSE FIX: Check stateManager FIRST (this is the source of truth after API fetch)
          // Re-fetch currentUser to ensure we have the latest (it may have been updated by API)
          const latestCurrentUser = stateManagerInstance.getState('currentUser') as User | null;
          if (latestCurrentUser && latestCurrentUser.auraColor) {
            const auraColor = latestCurrentUser.auraColor.trim();
            // Only exclude if it's explicitly the fallback color or white variants
            if (auraColor !== AVATAR_FALLBACK_COLOR &&
                auraColor !== '#ffffff' &&
                auraColor !== 'ffffff' &&
                auraColor !== '#fff' &&
                auraColor !== 'fff' &&
                auraColor !== 'white' &&
                auraColor.length > 0) {
              auraColorValue = auraColor;
              Logger.debug('🎨 PROFILE MANAGER: Using aura color from stateManager currentUser', { auraColorValue }, 'profile');
            } else {
              Logger.debug('⚠️ PROFILE MANAGER: stateManager has auraColor but it\'s fallback/white', { auraColor }, 'profile');
            }
          }
          
          // ROOT CAUSE FIX: Fallback to getCurrentUserAuraColor() if stateManager doesn't have it
          if (!auraColorValue) {
            try {
              auraColorValue = await getCurrentUserAuraColor();
              if (auraColorValue && 
                  auraColorValue !== AVATAR_FALLBACK_COLOR &&
                  auraColorValue !== '#ffffff' &&
                  auraColorValue !== 'ffffff') {
                Logger.debug('🎨 PROFILE MANAGER: Using aura color from getCurrentUserAuraColor()', { auraColorValue }, 'profile');
                fromChromeStorage = true;
              } else {
                Logger.debug('⚠️ PROFILE MANAGER: getCurrentUserAuraColor() returned fallback/white', { auraColorValue }, 'profile');
                auraColorValue = null; // Don't use white/fallback
              }
            } catch (error) {
              Logger.warn('⚠️ PROFILE MANAGER: Error calling getCurrentUserAuraColor()', error, 'profile');
            }
          }
          
          // Final fallback to profileData if still no value (but not white/fallback)
          if (!auraColorValue && this.profileData?.auraColor) {
            const profileAuraColor = this.profileData.auraColor.trim();
            if (profileAuraColor !== AVATAR_FALLBACK_COLOR &&
                profileAuraColor !== '#ffffff' &&
                profileAuraColor !== 'ffffff') {
              auraColorValue = profileAuraColor;
              Logger.debug('🎨 PROFILE MANAGER: Using aura color from profileData', { auraColor: auraColorValue }, 'profile');
            }
          }
          
          // ROOT CAUSE FIX: If still no valid color, check stateManager one more time (it may have been updated)
          if (!auraColorValue) {
            const finalCheckUser = stateManagerInstance.getState('currentUser') as User | null;
            if (finalCheckUser?.auraColor) {
              const finalAuraColor = finalCheckUser.auraColor.trim();
              if (finalAuraColor !== AVATAR_FALLBACK_COLOR &&
                  finalAuraColor !== '#ffffff' &&
                  finalAuraColor !== 'ffffff' &&
                  finalAuraColor !== '#fff' &&
                  finalAuraColor !== 'fff' &&
                  finalAuraColor !== 'white' &&
                  finalAuraColor.length > 0) {
                auraColorValue = finalAuraColor;
                Logger.debug('🎨 PROFILE MANAGER: Using aura color from final stateManager check', { auraColor: auraColorValue }, 'profile');
              }
            }
          }

          // If still no valid color, log warning but don't use white
          if (!auraColorValue) {
            Logger.warn('⚠️ PROFILE MANAGER: No valid aura color found, will use default from AvatarUtils', 'profile');
          }

          // CRITICAL FIX: Use profileData if available (has aura color), otherwise fall back to currentUser
          // ROOT CAUSE FIX: Ensure auraColorValue is passed to AvatarUtils
          const fallbackUser: User = {
            id: currentUserForAvatar?.id || 'anonymous-user',
            name: currentUserForAvatar?.name || 'User',
            email: currentUserForAvatar?.email || 'user@example.com'
          } as User;
          const sourceUser: User = (this.profileData || currentUserForAvatar || fallbackUser) as User;
          
          // ROOT CAUSE FIX: Override auraColor in sourceUser if we found a valid one
          if (auraColorValue) {
            sourceUser.auraColor = auraColorValue;
            Logger.debug('🎨 PROFILE MANAGER: Setting auraColor on sourceUser', { auraColor: auraColorValue }, 'profile');
          }
          // UUID ONLY - sourceUser.id must be a valid UUID
          if (!sourceUser.id) {
            if (currentUserForAvatar?.id) {
              sourceUser.id = currentUserForAvatar.id;
            } else {
              Logger.warn('⚠️ PROFILE: sourceUser missing id (UUID)', null, 'profile');
              // Don't create fake ID - return early or handle null
            }
          }
          // ROOT CAUSE FIX: Map picture to avatarUrl for AvatarUtils compatibility
          // currentUser has 'picture' property but AvatarUtils expects 'avatarUrl'
          const pictureValue = currentUserForAvatar?.picture;
          const profilePictureValue = this.profileData?.picture;
          const avatarUrlFromPicture = (typeof pictureValue === 'string' ? pictureValue : null) ||
                                      (typeof profilePictureValue === 'string' ? profilePictureValue : null) ||
                                      this.profileData?.avatarUrl ||
                                      (typeof currentUserForAvatar?.avatarUrl === 'string' ? currentUserForAvatar.avatarUrl : null);
          
          // ROOT CAUSE FIX: Get final aura color - prioritize auraColorValue, then stateManager, then profileData
          let finalAuraColor: string | null | undefined = auraColorValue;
          if (!finalAuraColor) {
            const stateUser = stateManagerInstance.getState('currentUser') as User | null;
            if (stateUser?.auraColor) {
              const stateAura = stateUser.auraColor.trim();
              if (stateAura !== AVATAR_FALLBACK_COLOR &&
                  stateAura !== '#ffffff' &&
                  stateAura !== 'ffffff' &&
                  stateAura !== '#fff' &&
                  stateAura !== 'fff' &&
                  stateAura !== 'white' &&
                  stateAura.length > 0) {
                finalAuraColor = stateAura;
                Logger.debug('🎨 PROFILE MANAGER: Using aura color from stateManager in userDataForAvatar', { auraColor: finalAuraColor }, 'profile');
              }
            }
          }
          if (!finalAuraColor) {
            finalAuraColor = this.profileData?.auraColor || currentUserForAvatar?.auraColor || undefined;
          }

          const userDataForAvatar: User = {
            ...sourceUser,
            avatarUrl: avatarUrlFromPicture || undefined, // ROOT CAUSE FIX: Map picture -> avatarUrl
            picture: avatarUrlFromPicture || undefined, // Also keep picture for compatibility
            auraColor: finalAuraColor || undefined // ROOT CAUSE FIX: Use finalAuraColor which includes stateManager check, convert null to undefined
          };

          Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Creating avatar with user data', {
            userId: userDataForAvatar.id,
            auraColor: userDataForAvatar.auraColor,
            avatarUrl: userDataForAvatar.avatarUrl,
            usingProfileData: !!this.profileData,
            fromChromeStorage: fromChromeStorage,
            timestamp: new Date().toISOString()
          }, 'profile');

          // ROOT CAUSE FIX: Ensure availability is set for status dots
          if (!userDataForAvatar.availability) {
            // Try to get from currentUser first
            if (currentUserForAvatar && (currentUserForAvatar.availability || currentUserForAvatar.globalAvailability)) {
              userDataForAvatar.availability = currentUserForAvatar.availability || currentUserForAvatar.globalAvailability;
            } else {
              // Try to get from visibility data
              const visibilityData = getVisibilityData();
              if (visibilityData) {
                const currentUserInVisibility = visibilityData.active.find((u: User) => 
                  String(u.id || (u as User).userId) === String(currentUserForAvatar?.id)
                );
                if (currentUserInVisibility && currentUserInVisibility.availability) {
                  userDataForAvatar.availability = currentUserInVisibility.availability;
                }
              }
            }
            // Default to AVAILABLE if active, OFFLINE if not
            if (!userDataForAvatar.availability) {
              userDataForAvatar.availability = (userDataForAvatar.isActive || userDataForAvatar.is_active) ? 'AVAILABLE' : 'OFFLINE';
            }
          }
          
          // ROOT CAUSE FIX: Use imported AvatarUtils directly (TypeScript import)
          const avatarHTML = await AvatarUtils.createUnifiedAvatar(userDataForAvatar, 'profile', {
            showAura: true,
            showStatus: true,  // ROOT CAUSE FIX: Enable status dots on profile avatar
            size: 32
          });

          Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Avatar HTML generated, updating container', { timestamp: new Date().toISOString() }, 'profile');
          // ROOT CAUSE FIX: Wrap AvatarUtils HTML in .user-avatar div for consistency with diagnostic expectations
          // AvatarUtils returns .avatar-container, but we wrap it in .user-avatar for ProfileManager
          userAvatarContainer.innerHTML = `<div class="user-avatar">${avatarHTML}</div>`;

          // Log what was actually inserted
          Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Container updated', { innerHTMLLength: userAvatarContainer.innerHTML.length }, 'profile');
          Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Container updated, checking for aura element...', 'profile');
          const auraElement = userAvatarContainer.querySelector('.avatar-aura') as HTMLElement | null;
          if (auraElement) {
            Logger.debug('✅ PROFILE MANAGER: COMP METHOD - Aura element found with background', { backgroundColor: auraElement.style.backgroundColor }, 'profile');
          } else {
            Logger.warn('⚠️ PROFILE MANAGER: COMP METHOD - Aura element NOT found in avatar HTML', null, 'profile');
          }

          Logger.debug('✅ PROFILE MANAGER: COMP METHOD - User avatar created using AvatarUtils with aura color', null, 'profile');
        } catch (error) {
          Logger.error('🔧 PROFILE MANAGER: COMP METHOD - Error creating avatar with AvatarUtils', error, 'profile');
          // Fallback to simple avatar
          this.createFallbackAvatar();
        }
      } else {
        // ROOT CAUSE FIX: Log detailed diagnostic info
        Logger.warn('⚠️ PROFILE MANAGER: COMP METHOD - AvatarUtils.createUnifiedAvatar not available or currentUser missing', {
          currentUserForAvatar: currentUserForAvatar ? 'exists' : 'null/undefined',
          currentUserForAvatarId: currentUserForAvatar?.id || 'missing',
          avatarUtils: typeof AvatarUtils !== 'undefined' ? 'available' : 'undefined',
          avatarUtilsCreateUnifiedAvatar: typeof AvatarUtils?.createUnifiedAvatar === 'function' ? 'function' : typeof AvatarUtils?.createUnifiedAvatar
        }, 'profile');
        
        // Only create fallback if we don't have currentUser - otherwise wait for retry
        if (!currentUserForAvatar || !currentUserForAvatar.id) {
          Logger.debug('   ⏳ PROFILE MANAGER: COMP METHOD - currentUser not available yet, will retry when auth completes', 'profile');
          // Don't create fallback - wait for handleAuthUIUpdate to retry
        } else {
          Logger.warn('   ⚠️ PROFILE MANAGER: COMP METHOD - AvatarUtils issue, using fallback', 'profile');
          this.createFallbackAvatar();
        }
      }
    } else {
      Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - User avatar already exists, skipping creation', 'profile');
    }
    
    // ROOT CAUSE FIX: Remove existing handler if it exists, then add new one
    // Use a data attribute to track if handler is already attached
    if (userAvatarContainer.dataset.clickHandlerAttached === 'true') {
      // Handler already attached, skip to prevent duplicates
      Logger.debug('🔧 PROFILE MANAGER: Click handler already attached, skipping', 'profile');
      return;
    }
    
    // ROOT CAUSE FIX: Add click handler with proper event handling
    userAvatarContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Profile avatar clicked', null, 'profile');
      this.toggleUserMenu(e); // Pass event to toggleUserMenu
    });
    
    // Mark handler as attached
    userAvatarContainer.dataset.clickHandlerAttached = 'true';
    
        Logger.debug('✅ PROFILE MANAGER: COMP METHOD - Profile menu and aura modal setup complete', null, 'profile');
      } catch (error) {
        Logger.error('❌ PROFILE MANAGER: Error in setupProfileMenuAndAuraModal', error, 'profile');
        // ROOT CAUSE FIX: Reset promise on error so future calls can proceed
        this.setupProfileMenuAndAuraModalPromise = null;
      } finally {
        // ROOT CAUSE FIX: Always reset promise after completion (success or error)
        this.setupProfileMenuAndAuraModalPromise = null;
      }
    })();
    
    return this.setupProfileMenuAndAuraModalPromise;
  }

  /**
   * COMP METHOD: Toggle user menu
   */
  async toggleUserMenu(e: Event) {
    Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Toggling user menu...', null, 'profile');

    // ROOT CAUSE FIX: Stop event propagation to prevent immediate click-outside handler
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    let userMenu = document.getElementById('user-menu') as HTMLElement | null;
    if (!userMenu) {
      Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Menu not found, creating...', 'profile');
      await this.createUserMenu();
      userMenu = document.getElementById('user-menu') as HTMLElement | null;
    }
    
    if (userMenu) {
      const isVisible = userMenu.style.display !== 'none' && userMenu.style.display !== '';
      userMenu.style.display = isVisible ? 'none' : 'block';
      
      // ROOT CAUSE FIX: Ensure menu is positioned correctly
      const userAvatarContainer = document.getElementById('user-avatar-container');
      if (userAvatarContainer && !isVisible) {
        // Menu is being shown - CRITICAL FIX: Re-attach event listeners
        this.addUserMenuEventListeners();
        
        // ROOT CAUSE FIX: Update theme toggle display to show opposite of current theme
        this.updateProfileMenuTheme();
        
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
        if (this.clickOutsideHandler) {
          document.removeEventListener('click', this.clickOutsideHandler);
        }
      }
      
      Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Menu toggled', { isVisible: !isVisible, display: userMenu.style.display }, 'profile');
    } else {
      Logger.error('❌ PROFILE MANAGER: COMP METHOD - Failed to create or find user menu', null, 'profile');
    }
  }

  /**
   * COMP METHOD: Create user menu
   */
  async createUserMenu() {
    Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Creating user menu...', null, 'profile');
    
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
    
    // Get currentUser from stateManager
    const currentUserFromState = stateManagerInstance.getState('currentUser') as User | null;
    const currentUser = ensureUser(currentUserFromState);
    if (!currentUser) {
      Logger.warn('⚠️ PROFILE: No valid user for avatar generation', null, 'profile');
      return ''; // UUID ONLY - can't generate avatar without valid user UUID
    }

    // Create small avatar using AvatarUtils if available
    let smallAvatarHTML = '';
    // ROOT CAUSE FIX: Use imported AvatarUtils directly (TypeScript import)
    if (currentUser && typeof AvatarUtils.createUnifiedAvatar === 'function') {
      try {
        smallAvatarHTML = await AvatarUtils.createUnifiedAvatar(
          currentUser as User,
          'menu',
          {
            showAura: true,
            size: 24
          }
        );
      } catch (error) {
        Logger.error('🔧 PROFILE MANAGER: COMP METHOD - Error creating small avatar', error, 'profile');
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
            <div class="user-id" style="font-size: 12px; color: #666;">${currentUser.id || currentUser.userId}</div>
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
    const userAvatarContainer = document.getElementById('user-avatar-container') as HTMLElement | null;
    if (userAvatarContainer) {
      // Ensure container has position: relative for absolute positioning
      // Use window.getComputedStyle
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
      Logger.error('❌ PROFILE MANAGER: COMP METHOD - User avatar container not found', null, 'profile');
    }
    
    // Add event listeners
    this.addUserMenuEventListeners();
    
    // ROOT CAUSE FIX: Add click-outside handler
    this.addClickOutsideHandler();
    
    // CRITICAL FIX: Initialize theme icon/text based on current theme
    this.updateProfileMenuTheme();
    
    // FIX: Listen for preference changes to update display name and theme
    // Get EventBus from window
    const win = window as Window & { EventBus?: { on?: (event: string, handler: (data: { key?: string; value?: unknown }) => void) => void } };
    if (win.EventBus && typeof win.EventBus === 'object') {
      const eventBus = win.EventBus;
      if (typeof eventBus.on === 'function') {
        eventBus.on('preference:changed', (data: { key?: string; value?: unknown }) => {
          if (data.key === 'displayName' || data.key === 'theme') {
            this.updateUserMenu();
            if (data.key === 'theme') {
              this.updateProfileMenuTheme();
            }
          }
        });
      }
    }
    
    // Also listen for native custom events
    document.addEventListener('preferenceChanged', (event: Event) => {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (detail && (detail.key === 'displayName' || detail.key === 'theme')) {
        this.updateUserMenu();
        if (detail.key === 'theme') {
          this.updateProfileMenuTheme();
        }
      }
    });
    
    Logger.debug('✅ PROFILE MANAGER: COMP METHOD - User menu created', null, 'profile');
    return userMenu.outerHTML;
  }
  
  /**
   * Update profile menu theme icon and text based on current theme
   * ROOT CAUSE FIX: Update BOTH theme-icon/theme-text (sidepanel.html) AND theme-icon-menu/theme-text-menu (dynamic menu)
   */
  updateProfileMenuTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 
                        document.documentElement.getAttribute('data-theme') || 
                        'light';
    
    // Update sidepanel.html elements (theme-icon, theme-text)
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    if (themeIcon) {
      themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }
    if (themeText) {
      themeText.textContent = currentTheme === 'dark' ? 'Light mode' : 'Dark mode';
    }
    
    // Update dynamic menu elements (theme-icon-menu, theme-text-menu)
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
   * ROOT CAUSE FIX: Unified function to update ALL theme UI elements (profile menu AND settings tab)
   * This ensures both toggles stay in sync when theme is changed from either location
   */
  updateAllThemeUI(theme: string) {
    Logger.debug('🔄 THEME_SYNC: Updating all theme UI elements for theme:', { theme }, 'profile');
    
    // Update DOM
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    
    // Update profile menu theme icon/text (both IDs - sidepanel.html AND dynamic menu)
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
    
    // Update settings tab theme toggle
    const themeToggle = document.getElementById('theme-toggle') as HTMLInputElement | null;
    if (themeToggle) {
      themeToggle.checked = theme === 'dark';
      // Update slider position via VisibilitySettingsManager if available
      const win = window as Window & { visibilitySettingsManager?: { updateThemeStatus?: () => void } };
      if (win.visibilitySettingsManager && typeof win.visibilitySettingsManager.updateThemeStatus === 'function') {
        win.visibilitySettingsManager.updateThemeStatus();
      }
    }
    
    Logger.debug('✅ THEME_SYNC: All theme UI elements updated', null, 'profile');
  }

  /**
   * COMP METHOD: Add user menu event listeners
   */
  addUserMenuEventListeners() {
    Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Adding event listeners...', null, 'profile');
    
    // Aura color button
    const auraColorBtn = document.getElementById('aura-color-btn') as HTMLButtonElement | null;
    if (auraColorBtn) {
      auraColorBtn.onclick = (e) => {
        e.preventDefault();
        Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Aura color button clicked', null, 'profile');
        this.hideUserMenu();
        this.showColorPickerModal();
      };
    }
    
    // Visibility settings button - FIX: Add link to visibility tab
    const visibilitySettingsBtn = document.getElementById('visibility-settings-btn') as HTMLButtonElement | null;
    if (visibilitySettingsBtn) {
      // Remove any existing handler to prevent duplicates
      visibilitySettingsBtn.onclick = null;
      visibilitySettingsBtn.removeEventListener('click', this.visibilitySettingsHandler as EventListener);
      
      // Create handler function
      this.visibilitySettingsHandler = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Visibility settings button clicked', null, 'profile');
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
          const button = document.querySelector(selector) as HTMLElement | null;
          if (button) {
            button.click();
            Logger.debug(`✅ PROFILE MANAGER: Switched to settings tab via selector: ${selector}`, null, 'profile');
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
              const btnElement = btn as HTMLElement;
              btnElement.classList.remove('active');
              // ROOT CAUSE FIX: Remove forced styles from inactive tabs
              btnElement.style.removeProperty('border-bottom');
              btnElement.style.removeProperty('border-bottom-color');
              btnElement.style.removeProperty('border-bottom-width');
              btnElement.style.removeProperty('border-bottom-style');
              btnElement.style.removeProperty('color');
              btnElement.style.removeProperty('font-weight');
              
              if (btnElement.getAttribute('data-tab') === 'settings-tab' || btnElement.getAttribute('aria-controls') === 'settings-tab') {
                btnElement.classList.add('active');
                // ROOT CAUSE FIX: Force selector line via JavaScript since CSS isn't applying
                const SELECTOR_LINE_COLOR = '#1D9BF0'; // X's neon blue
                const SELECTOR_LINE_WIDTH = '4px';
                btnElement.style.setProperty('border-bottom', `${SELECTOR_LINE_WIDTH} solid ${SELECTOR_LINE_COLOR}`, 'important');
                btnElement.style.setProperty('border-bottom-color', SELECTOR_LINE_COLOR, 'important');
                btnElement.style.setProperty('border-bottom-width', SELECTOR_LINE_WIDTH, 'important');
                btnElement.style.setProperty('border-bottom-style', 'solid', 'important');
                btnElement.style.setProperty('color', SELECTOR_LINE_COLOR, 'important');
                btnElement.style.setProperty('font-weight', '700', 'important');
              }
            });
            
            Logger.debug('✅ PROFILE MANAGER: Directly activated settings tab', null, 'profile');
            switched = true;
          }
        }
        
        // Method 3: Dispatch custom event as last resort
        if (!switched) {
          const tabSwitchEvent = new CustomEvent('tabSwitch', { detail: { tabId: 'settings-tab' } });
          window.dispatchEvent(tabSwitchEvent);
          Logger.debug('✅ PROFILE MANAGER: Dispatched tab switch event for settings tab', null, 'profile');
        }
        
        // CRITICAL FIX: Ensure event listeners are attached when settings tab opens
        setTimeout(async () => {
          // ROOT CAUSE FIX: Ensure VisibilitySettingsManager event listeners are attached
          // Use dynamic import with proper type declarations (ES6 module pattern)
          try {
            // Dynamic import - VisibilitySettingsManager is in extension/features at runtime
            // @ts-expect-error - Dynamic runtime import, types not available at compile time
            const module = await import('../../extension/features/VisibilitySettingsManager.js').catch(() => 
              // @ts-expect-error - Dynamic runtime import, types not available at compile time
              import('../../features/VisibilitySettingsManager.js')
            ) as { visibilitySettingsManagerInstance?: { ensureEventListeners?: () => Promise<void> } };
            const visibilitySettingsManager = module?.visibilitySettingsManagerInstance;
            if (visibilitySettingsManager && typeof visibilitySettingsManager.ensureEventListeners === 'function') {
              await visibilitySettingsManager.ensureEventListeners();
              Logger.debug('✅ PROFILE MANAGER: Ensured visibility settings event listeners after tab switch', null, 'profile');
            } else {
              Logger.warn('⚠️ PROFILE MANAGER: visibilitySettingsManagerInstance not available or ensureEventListeners not a function', null, 'profile');
            }
          } catch (error) {
            Logger.warn('⚠️ PROFILE MANAGER: Failed to import VisibilitySettingsManager:', error, 'profile');
          }
        }, 100);
      };
      
      // Attach handler
      visibilitySettingsBtn.addEventListener('click', this.visibilitySettingsHandler as EventListener);
      visibilitySettingsBtn.dataset.handlerAttached = 'true';
      
      // ROOT CAUSE FIX: Ensure button is active and clickable
      visibilitySettingsBtn.style.pointerEvents = 'auto';
      visibilitySettingsBtn.style.cursor = 'pointer';
      visibilitySettingsBtn.style.opacity = '1';
      visibilitySettingsBtn.disabled = false;
      
      Logger.debug('✅ PROFILE MANAGER: Visibility settings button handler added and activated', null, 'profile');
    } else {
      Logger.warn('⚠️ PROFILE MANAGER: Visibility settings button not found in DOM', null, 'profile');
    }
    
    // Theme toggle button - CRITICAL FIX: Ensure button is clickable and handler is attached
    const themeToggleBtn = document.getElementById('theme-toggle-btn') as HTMLButtonElement | null;
    if (themeToggleBtn) {
      // Remove any existing handlers first
      themeToggleBtn.onclick = null;
      themeToggleBtn.removeEventListener('click', this.themeToggleHandler as EventListener);
      
      // Create handler function
      this.themeToggleHandler = async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Theme toggle button clicked', null, 'profile');
        Logger.debug('🔍 DIAGNOSTIC: Profile menu theme toggle clicked', null, 'profile');
        const beforeTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'light';
        Logger.debug('🔍 DIAGNOSTIC: Theme before toggle:', { beforeTheme }, 'profile');
        await this.toggleTheme();
        const afterTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'light';
        Logger.debug('🔍 DIAGNOSTIC: Theme after toggle:', { afterTheme }, 'profile');
        Logger.debug('🔍 DIAGNOSTIC: Theme changed:', { changed: beforeTheme !== afterTheme ? 'YES ✅' : 'NO ❌' }, 'profile');
        // CRITICAL: Close profile menu after theme toggle
        this.hideUserMenu();
      };
      
      // Attach handler
      themeToggleBtn.addEventListener('click', this.themeToggleHandler as EventListener);
      
      // Mark as handled to prevent duplicate handlers
      themeToggleBtn.dataset.handlerAttached = 'true';
      
      // Ensure button is active and clickable
      themeToggleBtn.style.pointerEvents = 'auto';
      themeToggleBtn.style.cursor = 'pointer';
      themeToggleBtn.style.opacity = '1';
      themeToggleBtn.style.visibility = 'visible';
      themeToggleBtn.disabled = false;
      
      Logger.debug('✅ PROFILE MANAGER: Theme toggle button handler attached and activated', null, 'profile');
    } else {
      Logger.warn('❌ PROFILE MANAGER: Theme toggle button not found', null, 'profile');
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement | null;
    if (logoutBtn) {
      logoutBtn.onclick = (e) => {
        e.preventDefault();
        Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Logout button clicked', null, 'profile');
        this.hideUserMenu();
        this.performLogout();
      };
    }
    
    Logger.debug('✅ PROFILE MANAGER: COMP METHOD - Event listeners added', null, 'profile');
  }

  /**
   * COMP METHOD: Hide user menu
   */
  hideUserMenu() {
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
      userMenu.style.display = 'none';
      Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - User menu hidden', null, 'profile');
    }
  }
  
  /**
   * ROOT CAUSE FIX: Add click-outside handler to close menu
   */
  addClickOutsideHandler() {
    // Remove existing handler if any
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler);
      this.clickOutsideHandler = undefined;
    }
    
    // Create new handler
    this.clickOutsideHandler = (e: MouseEvent) => {
      const userAvatarContainer = document.getElementById('user-avatar-container') as HTMLElement | null;
      const userMenu = document.getElementById('user-menu') as HTMLElement | null;
      const target = e.target as Node | null;
      
      if (userAvatarContainer && userMenu && target && userMenu.style.display !== 'none') {
        // Check if click is outside both avatar container and menu
        if (!userAvatarContainer.contains(target as Node) && !userMenu.contains(target as Node)) {
          Logger.debug('🔧 PROFILE MANAGER: Click outside detected, hiding menu', 'profile');
          userMenu.style.display = 'none';
          // Remove handler when menu closes
          if (this.clickOutsideHandler) {
            document.removeEventListener('click', this.clickOutsideHandler);
            this.clickOutsideHandler = undefined;
          }
        }
      }
    };
    
    // Add listener with delay to prevent immediate closing from the click that opened the menu
    setTimeout(() => {
      if (this.clickOutsideHandler) {
        document.addEventListener('click', this.clickOutsideHandler, true); // Use capture phase
      }
    }, 300); // Increased delay to ensure menu is fully rendered
  }

  /**
   * COMP METHOD: Show color picker modal
   */
  async showColorPickerModal() {
    Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Showing color picker modal...', null, 'profile');
    
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
    const currentColorHex = currentAuraColor ? currentAuraColor.replace('#', '') : '';
    const displayColor = currentAuraColor || AVATAR_FALLBACK_COLOR;
    
    Logger.debug('🔧 AURA_MODAL: Current database aura color:', { currentAuraColor }, 'profile');
    Logger.debug('🔧 AURA_MODAL: Using color for modal:', { displayColor }, 'profile');

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
    
    Logger.debug('✅ PROFILE MANAGER: COMP METHOD - Color picker modal created', null, 'profile');
  }

  /**
   * COMP METHOD: Add color picker event listeners
   */
  addColorPickerEventListeners() {
    const colorInput = document.getElementById('color-input') as HTMLInputElement | null;
    const previewCircle = document.getElementById('color-preview-circle') as HTMLElement | null;
    const previewText = document.getElementById('color-preview-text') as HTMLElement | null;
    const closeBtn = document.getElementById('color-picker-close') as HTMLButtonElement | null;
    const resetBtn = document.getElementById('color-picker-reset') as HTMLButtonElement | null;
    const saveBtn = document.getElementById('color-picker-save') as HTMLButtonElement | null;
    const modal = document.getElementById('color-picker-modal') as HTMLElement | null;
    
    // Color input handler
    if (colorInput && previewCircle && previewText) {
      colorInput.oninput = (e: Event) => {
        const input = e.target as HTMLInputElement;
        const color = input.value;
        if (color.length === 6) {
          previewCircle.style.background = '#' + color;
          previewText.textContent = 'Preview';
        }
      };
    }
    
    // Close button
    if (closeBtn && modal) {
      closeBtn.onclick = () => {
        modal.style.display = 'none';
      };
    }
    
    // Reset button
    if (resetBtn && colorInput && previewCircle && previewText) {
      resetBtn.onclick = async () => {
        const currentColor = await getCurrentUserAuraColor();
        if (!currentColor) return;
        const currentHex = currentColor.replace('#', '');
        colorInput.value = currentHex;
        previewCircle.style.background = currentColor;
        previewText.textContent = `Current: ${currentColor}`;
      };
    }
    
    // Save button
    if (saveBtn && colorInput && modal) {
      saveBtn.onclick = async () => {
        const color = colorInput.value;
        if (color.length === 6) {
          const colorHex = '#' + color;
          Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Saving aura color:', { colorHex }, 'profile');
          
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
      modal.onclick = (e: MouseEvent) => {
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
    Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Toggling theme', null, 'profile');
    
    // Get current theme from DOM or storage
    // CRITICAL FIX: Get UserPreferencesManager first, then get theme
    const userPreferencesManager = getUserPreferencesManager();
    
    // CRITICAL FIX: Get theme from UserPreferencesManager first, then DOM, then default
    let currentTheme: string = 'light';
    if (userPreferencesManager && userPreferencesManager.isInitialized && typeof userPreferencesManager.getPreference === 'function') {
      const storedTheme = await userPreferencesManager.getPreference('theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        currentTheme = storedTheme;
      }
    }
    // Fallback to DOM if UserPreferencesManager doesn't have it
    if (currentTheme === 'light') {
      const domTheme = document.body.getAttribute('data-theme') || 
                      document.documentElement.getAttribute('data-theme');
      if (domTheme === 'dark' || domTheme === 'light') {
        currentTheme = domTheme;
      }
    }
    // Only toggle if we have a valid current theme
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    Logger.debug('🔧 PROFILE MANAGER: Current theme:', { currentTheme, newTheme }, 'profile');
    Logger.debug('🔍 DIAGNOSTIC: UserPreferencesManager available:', { available: !!userPreferencesManager }, 'profile');
    Logger.debug('🔍 DIAGNOSTIC: UserPreferencesManager initialized:', { initialized: userPreferencesManager?.isInitialized }, 'profile');
    
    // CRITICAL FIX: Use UserPreferencesManager (unified preference system) - ensure it saves to both Chrome storage and database
    if (userPreferencesManager && userPreferencesManager.isInitialized && typeof userPreferencesManager.savePreference === 'function') {
      Logger.debug('✅ PROFILE MANAGER: Using UserPreferencesManager to toggle theme', null, 'profile');
      // FIX: Save immediately (not batched) to ensure database save happens right away
      const saved = await userPreferencesManager.savePreference('theme', newTheme, { batch: false });
      Logger.debug('🔍 DIAGNOSTIC: UserPreferencesManager savePreference result:', saved, 'profile');
      
      // Verify it was saved to Chrome storage
      const chromeStorage = await getChromeStorage<{ theme?: string }>(['theme']);
      Logger.debug('🔍 DIAGNOSTIC: Theme in Chrome storage after save:', { theme: chromeStorage.theme }, 'profile');
      Logger.debug('✅ PROFILE MANAGER: Theme saved via UserPreferencesManager:', { newTheme }, 'profile');
      
      // ROOT CAUSE FIX: Update ALL theme UI elements (profile menu AND settings tab) to keep them in sync
      this.updateAllThemeUI(newTheme);
      Logger.debug('✅ PROFILE MANAGER: All theme UI elements updated (profile menu + settings tab)', null, 'profile');
    } else if (typeof updateThemeEverywhere === 'function') {
      // ROOT CAUSE FIX: updateThemeEverywhere is defined in this file, use it directly
      Logger.warn('⚠️ PROFILE MANAGER: UserPreferencesManager not available, using updateThemeEverywhere fallback', 'profile');
      await updateThemeEverywhere(newTheme);
    } else {
      // Fallback: Update manually if function not available
      Logger.warn('⚠️ PROFILE MANAGER: updateThemeEverywhere not available, using fallback', 'profile');
      
      // Update profile menu icon and text after theme change
      const themeIconMenu = document.getElementById('theme-icon-menu');
      const themeTextMenu = document.getElementById('theme-text-menu');
      if (themeIconMenu) {
        themeIconMenu.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      }
      if (themeTextMenu) {
        themeTextMenu.textContent = newTheme === 'dark' ? 'Light mode' : 'Dark mode';
      }
      
      // Update DOM immediately
      document.documentElement.setAttribute('data-theme', newTheme);
      document.body.setAttribute('data-theme', newTheme);
      if (themeIconMenu) {
        themeIconMenu.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      }
      if (themeTextMenu) {
        themeTextMenu.textContent = newTheme === 'dark' ? 'Light mode' : 'Dark mode';
      }
      
      // Update settings tab theme toggle if it exists
      const themeToggle = document.getElementById('theme-toggle') as HTMLInputElement | null;
      if (themeToggle) {
        themeToggle.checked = newTheme === 'dark';
      }
      
      // Update Chrome storage
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await setChromeStorage({ theme: newTheme, userTheme: newTheme });
      }
      
      // ROOT CAUSE FIX: Removed localStorage - we only use Chrome storage and database
      
      // Update database
      const apiForTheme = getApi();
      // Get currentUser from stateManager
      const currentUserForTheme = stateManagerInstance.getState('currentUser') as User | null;
      if (currentUserForTheme && currentUserForTheme.id && apiForTheme) {
        try {
          await apiForTheme.request(`/v1/users/${currentUserForTheme.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              theme: newTheme
            })
          });
          Logger.debug('✅ PROFILE MANAGER: Theme saved to database:', { newTheme }, 'profile');
          // Update stateManager with new theme
          stateManagerInstance.setState('currentUser', { ...currentUserForTheme, theme: newTheme });
        } catch (error) {
          Logger.error('❌ PROFILE MANAGER: Error saving theme to database:', error, 'profile');
        }
      }
      
      Logger.debug(`✅ PROFILE MANAGER: Switched to ${newTheme} theme`, { newTheme }, 'profile');
    }
  }

  /**
   * COMP METHOD: Perform logout
   */
  performLogout() {
    Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Performing logout', null, 'profile');
    try {
      // Clear currentUser in stateManager
      stateManagerInstance.setState('currentUser', null);
      stateManagerInstance.setState('supabaseUser', null);
      
      // Clear storage
      if (chrome?.storage?.local?.clear) {
        chrome.storage.local.clear();
      }
      
      // Reload the extension
      // Use window.location
      window.location.reload();
      
      Logger.debug('✅ PROFILE MANAGER: COMP METHOD - Logout completed', null, 'profile');
    } catch (error) {
      Logger.error('❌ PROFILE MANAGER: COMP METHOD - Error during logout:', error, 'profile');
    }
  }

  /**
   * Handle user profile updates
   */
  async handleUserUpdate(user: User) {
    Logger.debug('User profile updated', user, 'profile');

    if (Logger.isDebugEnabled('profile')) {
      Logger.debug(
        '🔍 SD1 PROFILE DEBUG: ProfileManager user update snapshot',
        {
          email: user?.email || null,
          name: user?.name || null,
          avatarUrl: user?.avatarUrl || null,
          auraColorBeforeFetch: user?.auraColor || null,
          payload: user ?? null
        },
        'profile'
      );
    }

    this.profileData = user;

    // ROOT CAUSE FIX: Sync Chrome storage with database when user updates
    // Note: syncStorageWithDatabase should be imported from proper module if needed
    // TypeScript migration: Convert promise chain to async/await for better error handling
    const win = window as Window & { syncStorageWithDatabase?: () => Promise<void> };
    if (win.syncStorageWithDatabase && typeof win.syncStorageWithDatabase === 'function') {
      (async () => {
        try {
          await win.syncStorageWithDatabase!();
        } catch (err: unknown) {
          Logger.warn('⚠️ PROFILE_MANAGER: Error syncing storage with database:', err, 'profile');
        }
      })();
    }

    // CRITICAL: Ensure we have auraColor for profile avatar
    // First priority: from user object (if included in update)
    if (this.profileData && this.profileData.auraColor) {
      Logger.debug('✅ PROFILE_MANAGER: Using auraColor from user object:', this.profileData.auraColor, 'profile');
    }
    // Second priority: from stateManager currentUser (should have been set during auth)
    // Get currentUser from stateManager
    const currentUserForAura = stateManagerInstance.getState('currentUser') as User | null;
    if (currentUserForAura?.auraColor) {
      if (this.profileData) {
        this.profileData.auraColor = currentUserForAura.auraColor;
        Logger.debug('✅ PROFILE_MANAGER: Using auraColor from stateManager currentUser:', currentUserForAura.auraColor, 'profile');
      }
    }
    // Third priority: fetch from API if user ID is available
    else if (this.profileData && this.profileData.id) {
      const api = ensureApi('fetch auraColor for profileData');
      if (api) {
        Logger.debug('🔍 PROFILE_MANAGER: Fetching auraColor from API for user:', this.profileData.id, 'profile');
        try {
          const userResponse = await api.request(`/v1/users/${this.profileData.id}`, {
            method: 'GET'
          });
          if (userResponse && typeof userResponse === 'object' && 'auraColor' in userResponse) {
            const auraColor = typeof userResponse.auraColor === 'string' ? userResponse.auraColor : undefined;
            if (auraColor && this.profileData) {
              this.profileData.auraColor = auraColor;
              // ROOT CAUSE FIX: Also update stateManager currentUser for consistency
              const currentUserForUpdate = stateManagerInstance.getState('currentUser') as User | null;
              if (currentUserForUpdate) {
                stateManagerInstance.setState('currentUser', { ...currentUserForUpdate, auraColor });
              }
              Logger.debug('✅ PROFILE_MANAGER: Fetched auraColor from API:', auraColor, 'profile');
            } else {
              Logger.debug('ℹ️ PROFILE_MANAGER: No auraColor found in API response', null, 'profile');
            }
          }
        } catch (error) {
          Logger.warn('⚠️ PROFILE_MANAGER: Failed to fetch auraColor from API', error, 'profile');
        }
      }
    } else {
      Logger.debug('ℹ️ PROFILE_MANAGER: No auraColor available yet (may be set later)', null, 'profile');
    }

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
  async handleAvatarUpdate(avatarData: { avatarUrl?: string; source?: string }) {
    Logger.debug('Avatar updated', avatarData, 'profile');
    
    if (this.profileData) {
      this.profileData.avatarUrl = avatarData.avatarUrl;
      this.profileData.avatarSource = avatarData.source;
      await this.updateUserAvatar();
    }
  }

  /**
   * Handle aura color updates
   */
  async handleAuraColorUpdate(auraData: { auraColor?: string; color?: string; userId?: string; user?: User; [key: string]: unknown }) {
    Logger.debug('🔧 PROFILE_MANAGER: Handling aura color update:', auraData, 'profile');

    const color = auraData.color || auraData.auraColor;
    const user = auraData.user;

    // Update profile data if it's the current user
    if (this.profileData && user && (this.profileData.id === user.id || this.profileData.id === user.userId)) {
      this.profileData.auraColor = color;
      Logger.debug('🔧 PROFILE_MANAGER: Updated profile data aura color:', color, 'profile');

      // Refresh the profile avatar with the new aura color
      await this.updateUserAvatar();
    }
  }

  /**
   * Handle authentication UI updates
   */
  async handleAuthUIUpdate(authData: { isAuthenticated?: boolean; user?: User; [key: string]: unknown }) {
    Logger.debug('🔧 PROFILE_MANAGER: Handling auth UI update:', authData?.isAuthenticated, 'profile');

    if (authData.isAuthenticated && authData.user) {
      if (Logger.isDebugEnabled('profile')) {
        Logger.debug(
          '🔍 SD1 PROFILE DEBUG: ProfileManager auth update snapshot',
          {
            email: authData.user?.email || null,
            name: authData.user?.name || null,
            avatarUrl: authData.user?.avatarUrl || null,
            auraColorBeforeFetch: authData.user?.auraColor || null,
            payload: authData.user ?? null
          },
          'profile'
        );
      }

      this.profileData = authData.user;

      // CRITICAL: Ensure we have auraColor for profile avatar
      // First priority: from authData.user (if included in auth response)
      if (this.profileData && this.profileData.auraColor) {
        Logger.debug('✅ PROFILE_MANAGER: Using auraColor from authData.user:', this.profileData.auraColor, 'profile');
      }
      // Second priority: from stateManager (TypeScript migration - no window.currentUser)
      else if (this.profileData) {
        const currentUserFromState = stateManagerInstance.getState('currentUser') as User | null;
        if (currentUserFromState?.auraColor) {
          this.profileData.auraColor = currentUserFromState.auraColor;
          Logger.debug('✅ PROFILE_MANAGER: Using auraColor from stateManager:', currentUserFromState.auraColor, 'profile');
        }
        // Third priority: fetch from API if user ID is available
        else if (this.profileData.id) {
          const api = ensureApi('fetch auraColor after auth');
          if (api) {
            Logger.debug('🔍 PROFILE_MANAGER: Fetching auraColor from API for user:', this.profileData.id, 'profile');
            try {
              const userResponse = await api.request(`/v1/users/${this.profileData.id}`, {
                method: 'GET'
              });
              if (userResponse && typeof userResponse === 'object' && 'auraColor' in userResponse && this.profileData) {
                const auraColor = typeof userResponse.auraColor === 'string' ? userResponse.auraColor : undefined;
                if (auraColor) {
                  this.profileData.auraColor = auraColor;
                  const currentUserForAura = stateManagerInstance.getState('currentUser') as User | null;
                  if (currentUserForAura) {
                    stateManagerInstance.setState('currentUser', { ...currentUserForAura, auraColor: auraColor });
                  }
                  Logger.debug('✅ PROFILE_MANAGER: Fetched auraColor from API:', auraColor, 'profile');
                } else {
                  Logger.debug('ℹ️ PROFILE_MANAGER: No auraColor found in API response', null, 'profile');
                }
              }
            } catch (error) {
              Logger.warn('⚠️ PROFILE_MANAGER: Failed to fetch auraColor from API:', error, 'profile');
            }
          }
        } else {
          Logger.debug('ℹ️ PROFILE_MANAGER: No auraColor available yet (may be set later)', null, 'profile');
        }
      }

      // If authentication just completed, we need to initialize the profile avatar
      if (!this.isAuthenticated) {
        Logger.debug('🔧 PROFILE_MANAGER: Authentication completed, initializing profile avatar...', 'profile');
        this.isAuthenticated = true;
        
        // ROOT CAUSE FIX: Initialize UserPreferencesManager FIRST (before avatar) to ensure theme is loaded correctly
        await this.initializeUserPreferencesManager(authData.user);
        
        // ROOT CAUSE FIX: Force avatar recreation by calling setupProfileMenuAndAuraModal directly
        // This ensures avatar is created even if it was skipped earlier due to missing currentUser
        await this.setupProfileMenuAndAuraModal();
        await this.initializeProfileAvatar();
      } else {
        // ROOT CAUSE FIX: If already authenticated but user data updated, refresh avatar
        Logger.debug('🔧 PROFILE_MANAGER: User data updated, refreshing profile avatar...', 'profile');
        
        // ROOT CAUSE FIX: Ensure UserPreferencesManager is initialized even if already authenticated
        await this.initializeUserPreferencesManager(authData.user);
        
        await this.setupProfileMenuAndAuraModal(); // This will update existing avatar if currentUser is now available
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
      Logger.warn('No profile data available for UI update', null, 'profile');
      return;
    }
    
    Logger.debug('Updating profile UI', {
      user: this.profileData.email,
      hasAvatar: !!this.profileData.avatarUrl,
      auraColor: this.profileData.auraColor
    }, 'profile');
    
    try {
      this.updateUserInfo();
      await this.updateUserAvatar(); // CRITICAL: Wait for avatar update to complete
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
      }
    
    if (userMenuName) {
      // COMP: Get user name from currentUser in StateManager (most up-to-date)
      const currentUser = stateManagerInstance.getState('currentUser') as User | null;
      const displayName = currentUser?.displayName || 
                         currentUser?.name || 
                         this.profileData?.displayName || 
                         this.profileData?.name || 
                         currentUser?.email || 
                         this.profileData?.email || 
                         'User';
      userMenuName.textContent = displayName;
      Logger.debug('✅ PROFILE_MANAGER: Updated user menu name:', displayName, 'profile');
    }
  }

  /**
   * Update user avatar display
   */
  async updateUserAvatar() {
    Logger.debug('🔧 PROFILE_MANAGER: updateUserAvatar called at', new Date().toISOString(), 'profile');

    const userAvatarContainer = document.getElementById('user-avatar-container') as HTMLElement | null;

    if (!userAvatarContainer) {
      Logger.warn('User avatar container not found', null, 'profile');
      return;
    }

    Logger.debug('🔧 PROFILE_MANAGER: Updating user avatar with data:', {
      avatarUrl: this.profileData?.avatarUrl,
      auraColor: this.profileData?.auraColor,
      profileDataId: this.profileData?.id,
      timestamp: new Date().toISOString()
    }, 'profile');
    
    // ROOT CAUSE FIX: Use getCurrentUserAuraColor() for latest aura color (prioritizes Chrome storage, then database)
    let auraColorValue = null;
    const win = window as Window & { getCurrentUserAuraColor?: () => Promise<string | null> };
    if (typeof win.getCurrentUserAuraColor === 'function') {
      try {
        auraColorValue = await win.getCurrentUserAuraColor();
        Logger.debug('🎨 PROFILE_MANAGER: Got aura color from getCurrentUserAuraColor():', auraColorValue, 'profile');
      } catch (error) {
        Logger.warn('⚠️ PROFILE_MANAGER: Error calling getCurrentUserAuraColor():', error, 'profile');
      }
    }
    
    // Fallback to profileData if getCurrentUserAuraColor not available
    if (!auraColorValue) {
      auraColorValue = this.profileData?.auraColor;
    }

    // CRITICAL FIX: Check Chrome storage FIRST for instant display (persists across sessions)
    if (!auraColorValue && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const storageResult = await getChromeStorage<{ userAuraColor?: string; auraColor?: string }>(['userAuraColor', 'auraColor']);
        
        const cachedAuraColor = storageResult.userAuraColor || storageResult.auraColor;
        if (cachedAuraColor && cachedAuraColor !== '#ffffff' && cachedAuraColor !== 'white' && cachedAuraColor !== '#fff') {
          auraColorValue = cachedAuraColor;
          Logger.debug('🎨 PROFILE_MANAGER: Using aura color from Chrome storage (CACHE):', auraColorValue, 'profile');
        }
      } catch (error) {
        Logger.warn('⚠️ PROFILE_MANAGER: Could not read from Chrome storage:', error, 'profile');
      }
    }

    // CRITICAL FIX: Check pre-render data as SECONDARY source (database value)
    const winWithPreRender = window as Window & { preRenderInitializer?: PreRenderInitializer };
    if (!auraColorValue && winWithPreRender.preRenderInitializer?.getPreRenderData) {
      const preRenderData = winWithPreRender.preRenderInitializer.getPreRenderData();
      if (preRenderData.auraColor) {
        auraColorValue = preRenderData.auraColor;
        Logger.debug('🎨 PROFILE_MANAGER: Using aura color from pre-render data (DATABASE):', auraColorValue, 'profile');
        
        // CRITICAL FIX: Cache database value in Chrome storage for next time
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          try {
            await setChromeStorage({ userAuraColor: auraColorValue, auraColor: auraColorValue });
            Logger.debug('💾 PROFILE_MANAGER: Cached aura color in Chrome storage:', auraColorValue, 'profile');
          } catch (error) {
            Logger.warn('⚠️ PROFILE_MANAGER: Could not cache to Chrome storage:', error, 'profile');
          }
        }
      }
    }

    // ROOT CAUSE FIX: Fallback to stateManager currentUser if pre-render data not available
    if (!auraColorValue) {
      const currentUserForAura = stateManagerInstance.getState('currentUser') as User | null;
      if (currentUserForAura?.auraColor) {
        auraColorValue = currentUserForAura.auraColor;
        Logger.debug('✅ PROFILE_MANAGER: Using auraColor from stateManager currentUser:', auraColorValue, 'profile');
      }
    }

    // CRITICAL FIX: Resolve Promise if auraColor is a Promise
    if (auraColorValue && typeof auraColorValue === 'object' && 'then' in auraColorValue && typeof (auraColorValue as { then: unknown }).then === 'function') {
      Logger.debug('🔧 PROFILE_MANAGER: auraColor is a Promise, awaiting resolution...', 'profile');
      try {
        auraColorValue = await (auraColorValue as Promise<string | null>);
        Logger.debug(`✅ PROFILE_MANAGER: Resolved auraColor Promise: ${auraColorValue}`, null, 'profile');
      } catch (e) {
        Logger.warn(`⚠️ PROFILE_MANAGER: Error resolving auraColor Promise:`, e, 'profile');
        auraColorValue = null; // Treat as missing, will fetch from API
      }
    }

    // CRITICAL FIX: Validate auraColor - treat #ffffff as missing
    if (auraColorValue === '#ffffff' || auraColorValue === 'white' || auraColorValue === '#fff') {
      Logger.debug('⚠️ PROFILE_MANAGER: auraColor is fallback white, treating as missing (will fetch from API)', null, 'profile');
      auraColorValue = null;
    }

    // CRITICAL FIX: Fetch from API if still missing
    if (!auraColorValue && this.profileData && this.profileData.id) {
      const api = ensureApi('fetch auraColor for profile avatar');
      if (api) {
        Logger.debug('🔍 PROFILE_MANAGER: Fetching auraColor from API for profile avatar...', null, 'profile');
        try {
          const userResponse = await api.request(`/v1/users/${this.profileData.id}`, {
            method: 'GET'
          });

          if (userResponse && typeof userResponse === 'object' && 'auraColor' in userResponse) {
            const apiAuraColor = typeof userResponse.auraColor === 'string' ? userResponse.auraColor : undefined;
            if (apiAuraColor) {
              // Validate API response - treat #ffffff as missing
              if (apiAuraColor !== '#ffffff' && apiAuraColor !== 'white' && apiAuraColor !== '#fff' && this.profileData) {
                auraColorValue = apiAuraColor;
                this.profileData.auraColor = apiAuraColor;
                
                // Update stateManager currentUser for consistency (TypeScript migration)
                const currentUser = stateManagerInstance.getState('currentUser') as User | null;
                if (currentUser) {
                  const updatedUser = { ...currentUser, auraColor: apiAuraColor };
                  stateManagerInstance.setState('currentUser', updatedUser);
                  // ES6 pattern: Update stateManager instead of window.currentUser
                  const currentUserForUpdate = stateManagerInstance.getState('currentUser') as User | null;
                  if (currentUserForUpdate) {
                    const updatedUser = { ...currentUserForUpdate, auraColor: apiAuraColor };
                    stateManagerInstance.setState('currentUser', updatedUser);
                  }
                }
                
                // CRITICAL FIX: Cache API value in Chrome storage for instant display next time
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                  try {
                    await setChromeStorage({ userAuraColor: apiAuraColor, auraColor: apiAuraColor });
                    Logger.debug('💾 PROFILE_MANAGER: Cached API aura color in Chrome storage:', apiAuraColor, 'profile');
                  } catch (error) {
                    Logger.warn('⚠️ PROFILE_MANAGER: Could not cache API value to Chrome storage:', error, 'profile');
                  }
                }
                
                Logger.debug('✅ PROFILE_MANAGER: Fetched auraColor from API for profile avatar:', apiAuraColor, 'profile');
              } else {
                Logger.debug('⚠️ PROFILE_MANAGER: API returned fallback white, treating as missing', 'profile');
              }
            }
          }
        } catch (error) {
          Logger.warn('⚠️ PROFILE_MANAGER: Could not fetch auraColor from API for profile avatar:', error, 'profile');
        }
      }
    }

    // Update profileData with resolved value
    if (auraColorValue && this.profileData) {
      this.profileData.auraColor = auraColorValue;
    }
    
    if (!this.profileData) {
      Logger.warn('Cannot update avatar: no profile data', null, 'profile');
      return;
    }
    
    try {
      // Use AvatarUtils for consistent avatar creation
      // CRITICAL FIX: Create user object with resolved auraColor value
      // ROOT CAUSE FIX: Map picture to avatarUrl for AvatarUtils compatibility
      const pictureValue = this.profileData.picture;
      const pictureUrl = (typeof pictureValue === 'string' ? pictureValue : null) || this.profileData.avatarUrl || undefined;
      const userForAvatar: User = {
        ...this.profileData,
        avatarUrl: pictureUrl, // ROOT CAUSE FIX: Map picture -> avatarUrl
        picture: pictureUrl, // Also keep picture for compatibility
        auraColor: auraColorValue || this.profileData.auraColor
      } as User;

      // ROOT CAUSE FIX: Use imported AvatarUtils directly (TypeScript import)
      if (typeof AvatarUtils.createUnifiedAvatar === 'function') {
        Logger.debug('🔧 PROFILE_MANAGER: Calling AvatarUtils.createUnifiedAvatar with:', {
          userId: userForAvatar.id,
          auraColor: userForAvatar.auraColor,
          avatarUrl: userForAvatar.avatarUrl,
          source: auraColorValue ? 'resolved' : 'profileData'
        }, 'profile');

        // ROOT CAUSE FIX: Ensure availability is set for status dots
        // ROOT CAUSE FIX: Prioritize stateManager currentUser.availability/globalAvailability (most up-to-date)
        const currentUserForAvailability = stateManagerInstance.getState('currentUser') as User | null;
        if (currentUserForAvailability && String(currentUserForAvailability.id || currentUserForAvailability.userId) === String(userForAvatar.id || (userForAvatar as User).userId)) {
          // Current user: use stateManager currentUser.availability/globalAvailability (most up-to-date from database)
          userForAvatar.availability = currentUserForAvailability.availability || currentUserForAvailability.globalAvailability || userForAvatar.availability;
          Logger.debug(`🔍 PROFILE_MANAGER: Using currentUser.availability for profile avatar: ${userForAvatar.availability}`, null, 'profile');
        }
        
        if (!userForAvatar.availability) {
          // ROOT CAUSE FIX: Try to get from stateManager currentUser first
          if (currentUserForAvailability && (currentUserForAvailability.availability || currentUserForAvailability.globalAvailability)) {
            userForAvatar.availability = currentUserForAvailability.availability || currentUserForAvailability.globalAvailability;
          } else {
            // Try to get from visibility data
            const visibilityData = getVisibilityDataUnfiltered();
            if (visibilityData?.active) {
              const currentUserInVisibility = visibilityData.active.find((u: User) => 
                String(u.id || (u as User).userId) === String(currentUserForAvailability?.id)
              );
              if (currentUserInVisibility && currentUserInVisibility.availability) {
                userForAvatar.availability = currentUserInVisibility.availability;
              }
            }
          }
          // Default to AVAILABLE if active, OFFLINE if not
          if (!userForAvatar.availability) {
            userForAvatar.availability = (userForAvatar.isActive || (userForAvatar as User).is_active) ? 'AVAILABLE' : 'OFFLINE';
          }
        }
        
        const avatarHTML = await AvatarUtils.createUnifiedAvatar(userForAvatar, 'profile', {
          showAura: true,
          showStatus: true,  // ROOT CAUSE FIX: Enable status dots on profile avatar
          size: 32
        });

        // ROOT CAUSE FIX: Wrap AvatarUtils HTML in .user-avatar div for consistency
        userAvatarContainer.innerHTML = `<div class="user-avatar">${avatarHTML}</div>`;
        Logger.debug('✅ PROFILE_MANAGER: Avatar updated using AvatarUtils with auraColor:', this.profileData?.auraColor, 'profile');
        Logger.debug('📄 PROFILE_MANAGER: Generated avatar HTML', avatarHTML.substring(0, 200) + '...', 'profile');

        // Log what was actually inserted and check for aura element
        Logger.debug('🔧 PROFILE_MANAGER: updateUserAvatar - Container updated, checking for aura element...', 'profile');
        const auraElement = userAvatarContainer.querySelector('.avatar-aura') as HTMLElement | null;
        if (auraElement) {
          Logger.debug('✅ PROFILE_MANAGER: updateUserAvatar - Aura element found with background:', auraElement.style.backgroundColor, 'profile');
        } else {
          Logger.debug('⚠️ PROFILE_MANAGER: updateUserAvatar - Aura element NOT found in avatar HTML', null, 'profile');
          Logger.debug('⚠️ PROFILE_MANAGER: updateUserAvatar - Full container HTML:', userAvatarContainer.innerHTML, 'profile');
        }
      } else {
        Logger.warn('AvatarUtils not available, using fallback', 'profile');
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
    const userAvatarContainer = document.getElementById('user-avatar-container') as HTMLElement | null;
    if (!userAvatarContainer) return;

    // Get currentUser from stateManager
    const currentUserFromState = stateManagerInstance.getState('currentUser') as User | null;
    const currentUser = ensureUser(currentUserFromState);
    if (!currentUser) {
      Logger.warn('⚠️ PROFILE: No valid user for fallback HTML', null, 'profile');
      return ''; // UUID ONLY - can't generate fallback without valid user UUID
    }
    const fallbackHTML = `
      <div class="user-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: #007bff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
        ${(currentUser.displayName || currentUser.name || 'U').charAt(0).toUpperCase()}
      </div>
    `;

    userAvatarContainer.innerHTML = fallbackHTML;
    Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Fallback avatar created', null, 'profile');
    return fallbackHTML;
  }

  /**
   * Update user menu display
   */
  updateUserMenu() {
    // Update any user menu elements
    const userMenuElements = document.querySelectorAll('[data-user-menu]');
    const displayName = this.profileData?.displayName || this.profileData?.name || this.profileData?.email || 'User';
    userMenuElements.forEach(element => {
      const el = element as HTMLElement;
      const menuKey = el.dataset.userMenu;
      if (menuKey === 'name') {
        el.textContent = displayName;
      } else if (menuKey === 'email' && this.profileData?.email) {
        el.textContent = this.profileData.email;
      }
    });
  }

  /**
   * Clear profile UI when user signs out
   */
  clearProfileUI() {
    Logger.debug('Clearing profile UI', null, 'profile');
    
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
  updateAuraColor(color: string) {
    if (!this.profileData) {
      Logger.warn('Cannot update aura color: no profile data', null, 'profile');
      return false;
    }
    
    Logger.debug('Updating aura color', {
      oldColor: this.profileData.auraColor,
      newColor: color
    }, 'profile');
    
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
    Logger.debug('Refreshing profile avatar', null, 'profile');
    
    if (!this.profileData) {
      Logger.warn('No profile data for avatar refresh', null, 'profile');
      return;
    }
    
    // Try to get latest avatar from visibility data
    // UUID ONLY - match by id, not email
    const visibilityData = getVisibilityDataUnfiltered();
    if (visibilityData?.active && this.profileData && this.profileData.id) {
      const userInVisibility = visibilityData.active.find(
        (u: User) => u.id === this.profileData!.id
      );
      
      if (userInVisibility && userInVisibility.avatarUrl) {
        Logger.debug('Found updated avatar in visibility data', {
          oldAvatar: this.profileData.avatarUrl,
          newAvatar: userInVisibility.avatarUrl
        }, 'profile');
        
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
  onProfileUpdate(callback: (user: User | null) => void) {
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
  cacheAvatar(userId: string, avatarData: { url?: string; color?: string; initials?: string; [key: string]: unknown }) {
    this.avatarCache.set(userId, {
      ...avatarData,
      cachedAt: Date.now()
    });
  }

  /**
   * Get cached avatar
   */
  getCachedAvatar(userId: string) {
    const cached = this.avatarCache.get(userId);
    if (cached && typeof cached === 'object' && 'cachedAt' in cached && typeof cached.cachedAt === 'number') {
      if (Date.now() - cached.cachedAt < 300000) { // 5 minutes
        return cached;
      }
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
      userId: this.profileData?.id || this.profileData?.userId || null,
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
async function updateAuraColorEverywhere(color: string) {
  Logger.debug('🔄 AURA_UPDATE: Updating aura color everywhere:', color, 'profile');
  
  if (!color || !color.startsWith('#')) {
    Logger.error('❌ AURA_UPDATE: Invalid color format:', color, 'profile');
    return false;
  }
  
  try {
    // Step 1: Update Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await setChromeStorage({ userAuraColor: color, auraColor: color });
        Logger.debug('✅ AURA_UPDATE: Saved to Chrome storage:', color, 'profile');
      } catch (error) {
        Logger.error('❌ AURA_UPDATE: Error saving to Chrome storage:', error, 'profile');
      }
    }
    
    // ROOT CAUSE FIX: Step 2: Update database via API
    const currentUserForAuraUpdate = stateManagerInstance.getState('currentUser') as User | null;
    if (currentUserForAuraUpdate && currentUserForAuraUpdate.id) {
      const api = ensureApi('update aura color in database');
      if (api) {
        try {
          const result = await api.request(`/v1/users/${currentUserForAuraUpdate.id}/aura-color`, {
          method: 'PUT',
          body: JSON.stringify({
            auraColor: color
          })
        });
        
        if (result) {
          Logger.debug('✅ AURA_UPDATE: Saved to database:', color, 'profile');
        } else {
          Logger.error('❌ AURA_UPDATE: Database update returned no result', null, 'profile');
        }
        } catch (error) {
          Logger.error('❌ AURA_UPDATE: Error saving to database:', error, 'profile');
          // Don't throw - Chrome storage update succeeded
        }
      }
    } else {
      Logger.warn('⚠️ AURA_UPDATE: Cannot update database - missing user or API', null, 'profile');
    }
    
    // ROOT CAUSE FIX: Step 3: Update stateManager currentUser immediately
    if (currentUserForAuraUpdate) {
      stateManagerInstance.setState('currentUser', { ...currentUserForAuraUpdate, auraColor: color });
      Logger.debug('✅ AURA_UPDATE: Updated stateManager currentUser', null, 'profile');
    }
    
    // Step 4: Update visibility cache immediately to prevent stale data
    const visibilityData = getVisibilityDataUnfiltered();
    if (visibilityData?.active) {
      const currentUserInVisibility = visibilityData.active.find((u: User) => 
        String(u.id || (u as User).userId) === String(currentUserForAuraUpdate?.id)
      );
      if (currentUserInVisibility) {
        currentUserInVisibility.auraColor = color;
        Logger.debug('✅ AURA_UPDATE: Updated visibility cache', null, 'profile');
      }
    }
    
    const visibilityDataFiltered = getVisibilityDataFiltered();
    if (visibilityDataFiltered?.active) {
      const currentUserInVisibility = visibilityDataFiltered.active.find((u: User) => 
        String(u.id || (u as User).userId) === String(currentUserForAuraUpdate?.id)
      );
      if (currentUserInVisibility) {
        currentUserInVisibility.auraColor = color;
      }
    }
    
    // ROOT CAUSE FIX: Step 5: Trigger real-time update and avatar refresh
    const win = window as Window & { 
      handleAuraChange?: (data: { userId?: string; auraColor: string }) => void;
      refreshAllMessageAvatars?: () => Promise<void>;
      refreshVisibilityAvatars?: () => Promise<void>;
    };
    if (win.handleAuraChange && typeof win.handleAuraChange === 'function') {
      const currentUserForEvent = stateManagerInstance.getState('currentUser') as User | null;
      win.handleAuraChange({
        userId: currentUserForEvent?.id,
        auraColor: color
      });
    }
    
    // ROOT CAUSE FIX: Step 6: Force refresh all message avatars to show new color
    if (typeof win.refreshAllMessageAvatars === 'function') {
      Logger.debug('🔄 AURA_UPDATE: Refreshing all message avatars with new aura color', null, 'profile');
      await win.refreshAllMessageAvatars();
    }
    
    // ROOT CAUSE FIX: Step 7: Refresh visibility avatars
    if (typeof win.refreshVisibilityAvatars === 'function') {
      Logger.debug('🔄 AURA_UPDATE: Refreshing visibility avatars', null, 'profile');
      await win.refreshVisibilityAvatars();
    }
    
    Logger.debug('✅ AURA_UPDATE: Aura color update complete', null, 'profile');
    return true;
  } catch (error) {
    Logger.error('❌ AURA_UPDATE: Error updating aura color:', error, 'profile');
    return false;
  }
}

// COMP METHOD: Get current user's aura color (Chrome storage first, then database fallback)
async function getCurrentUserAuraColor() {
  Logger.debug('🔍 AURA_MODAL: Getting current user aura color (stateManager FIRST, then Chrome storage, then database)', null, 'profile');
  
  // ROOT CAUSE FIX: Check stateManager FIRST (most up-to-date, from API)
  const currentUserForAura = stateManagerInstance.getState('currentUser') as User | null;
  if (currentUserForAura && currentUserForAura.auraColor) {
    const auraColor = currentUserForAura.auraColor.trim();
    // Only exclude if it's explicitly the fallback color or white variants
    if (auraColor !== AVATAR_FALLBACK_COLOR &&
        auraColor !== '#ffffff' &&
        auraColor !== 'ffffff' &&
        auraColor !== '#fff' &&
        auraColor !== 'fff' &&
        auraColor !== 'white' &&
        auraColor.length > 0) {
      Logger.debug(`✅ AURA_MODAL: Found auraColor in stateManager currentUser: ${auraColor}`, null, 'profile');
      return auraColor;
    } else {
      Logger.debug(`⚠️ AURA_MODAL: stateManager has auraColor but it's fallback/white: ${auraColor}`, null, 'profile');
    }
  } else {
    Logger.debug(`⚠️ AURA_MODAL: stateManager currentUser missing or no auraColor`, null, 'profile');
  }
  
  // ROOT CAUSE FIX: Fallback 1: Check Chrome storage (persisted value)
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const storageResult = await getChromeStorage<{ userAuraColor?: string; auraColor?: string }>(['userAuraColor', 'auraColor']);
      
      const cachedAuraColor = storageResult.userAuraColor || storageResult.auraColor;
      if (cachedAuraColor && cachedAuraColor !== '#ffffff' && cachedAuraColor !== 'ffffff' && cachedAuraColor !== AVATAR_FALLBACK_COLOR) {
        Logger.debug(`✅ AURA_MODAL: Found aura color in Chrome storage: ${cachedAuraColor}`, null, 'profile');
        return cachedAuraColor;
      }
    } catch (error) {
      Logger.warn('⚠️ AURA_MODAL: Error reading Chrome storage:', error, 'profile');
    }
  }
  
  // UUID ONLY - match by id, not email
  const visibilityDataFiltered = getVisibilityDataFiltered();
  if (visibilityDataFiltered?.active && currentUserForAura?.id) {
    const userData = visibilityDataFiltered.active.find((u: User) => u.id === currentUserForAura.id);
    if (userData && userData.auraColor && userData.auraColor !== AVATAR_FALLBACK_COLOR) {
      Logger.debug(`✅ AURA_MODAL: Found database auraColor in visibility data: ${userData.auraColor}`, null, 'profile');
      return userData.auraColor;
    }
  }
  
  // UUID ONLY - match by id, not email
  const visibilityData = getVisibilityDataUnfiltered();
  if (visibilityData?.active && currentUserForAura?.id) {
    const userData = visibilityData.active.find((u: User) => u.id === currentUserForAura.id);
    if (userData && userData.auraColor && userData.auraColor !== AVATAR_FALLBACK_COLOR) {
      Logger.debug(`✅ AURA_MODAL: Found database auraColor in unfiltered visibility data: ${userData.auraColor}`, null, 'profile');
      return userData.auraColor;
    }
  }
  
  // ROOT CAUSE FIX: Fallback 4: Try to fetch from database via API
  if (currentUserForAura && currentUserForAura.id) {
    const api = ensureApi('fetch aura color from database');
    if (api) {
      try {
        const userData = await api.request(`/v1/users/${currentUserForAura.id}`, {
          method: 'GET'
        });
        if (userData && typeof userData === 'object' && 'auraColor' in userData) {
          const dbColor = typeof userData.auraColor === 'string' ? userData.auraColor : undefined;
          if (dbColor && dbColor !== AVATAR_FALLBACK_COLOR) {
            Logger.debug(`✅ AURA_MODAL: Fetched aura color from database API: ${dbColor}`, null, 'profile');
            // Cache it in Chrome storage for next time
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
              await setChromeStorage({ userAuraColor: dbColor, auraColor: dbColor });
            }
            return dbColor;
          }
        }
      } catch (error) {
        Logger.error('❌ AURA_MODAL: Error fetching aura color from database:', error, 'profile');
      }
    }
  }
  
  // Final fallback to default
  Logger.debug('⚠️ AURA_MODAL: No aura color found, using default', 'profile');
  return AVATAR_FALLBACK_COLOR;
}

// COMP METHOD: Get aura color from database, never use hardcoded colors
function getCurrentUserAvatarBgColor(): string {
  Logger.debug('🔍 AURA_FIX: Getting current user aura color from database', null, 'profile');
  
  // First, try to get from currentUser if it has a real database color
  const currentUser = stateManagerInstance.getState('currentUser') as User | null;
  if (currentUser && currentUser.auraColor && currentUser.auraColor !== AVATAR_FALLBACK_COLOR) {
    Logger.debug(`✅ AURA_FIX: Found database aura color in currentUser: ${currentUser.auraColor}`, null, 'profile');
    return currentUser.auraColor;
  }
  
  // UUID ONLY - match by id, not email
  const visibilityDataFiltered2 = getVisibilityDataFiltered();
  const currentUserForVisibility = stateManagerInstance.getState('currentUser') as User | null;
  if (visibilityDataFiltered2?.active && currentUserForVisibility?.id) {
    const userData = visibilityDataFiltered2.active.find((u: User) => u.id === currentUserForVisibility.id);
    if (userData && userData.auraColor && userData.auraColor !== AVATAR_FALLBACK_COLOR) {
      Logger.debug(`✅ AURA_FIX: Found database aura color in visibility data: ${userData.auraColor}`, null, 'profile');
      return userData.auraColor;
    }
  }
  
  // Try to load from storage if not in database (ES6 pattern - use stateManager)
  try {
    const storedColor = stateManagerInstance.getState('userAvatarBgColor');
    if (typeof storedColor === 'string' && storedColor !== AVATAR_FALLBACK_COLOR) {
      Logger.debug('🔧 AURA_FIX: Loading aura color from storage:', storedColor, 'profile');
      return storedColor;
    }
  } catch (error) {
    Logger.debug('🔧 AURA_FIX: Could not load aura color from storage:', error, 'profile');
  }
  
  // COMP METHOD: Never use hardcoded colors - use white fallback
  Logger.debug('⚠️ AURA_FIX: No database aura color found, using white fallback (no hardcoded colors)', null, 'profile');
  return AVATAR_FALLBACK_COLOR;
}

async function getCurrentUserAvatarColor(): Promise<string> {
  const currentUser = stateManagerInstance.getState('currentUser') as User | null;
  if (currentUser && typeof currentUser.auraColor === 'string' && currentUser.auraColor.length) {
    return currentUser.auraColor;
  }
  return AVATAR_FALLBACK_COLOR; // Default white
}

function setCustomAvatarColor(color: string) {
  const currentUser = stateManagerInstance.getState('currentUser') as User | null;
  if (currentUser) {
    const updatedUser = { ...currentUser, auraColor: color };
    stateManagerInstance.setState('currentUser', updatedUser);
    // Dispatch event for profile update (ES6 pattern)
    window.dispatchEvent(new CustomEvent('profileUpdated', {
      detail: { user: updatedUser }
    }));
  }
}

function resetCustomAvatarColor() {
  const currentUser = stateManagerInstance.getState('currentUser') as User | null;
  if (currentUser) {
    const updatedUser = { ...currentUser, auraColor: AVATAR_FALLBACK_COLOR };
    stateManagerInstance.setState('currentUser', updatedUser);
    // Dispatch event for profile update (ES6 pattern)
    window.dispatchEvent(new CustomEvent('profileUpdated', {
      detail: { user: updatedUser }
    }));
  }
}

// ===== PROFILE MENU FUNCTIONS (FROM COMP) =====
function handleAvatarClick(e: Event) {
  const userMenu = document.getElementById('user-menu');
  
  if (!userMenu) {
    Logger.warn('User menu not found', null, 'profile');
    return;
  }
  
  Logger.debug('👤 Profile avatar clicked!', null, 'profile');
  Logger.debug('🔍 Current menu display:', userMenu.style.display, 'profile');
  e.stopPropagation();
  
  // Toggle menu visibility
  if (userMenu.style.display === 'none' || userMenu.style.display === '') {
    userMenu.style.display = 'block';
  } else {
    userMenu.style.display = 'none';
  }
}

function handleClickOutside(e: Event) {
  const userAvatarContainer = document.getElementById('user-avatar-container');
  const userMenu = document.getElementById('user-menu');
  
  // Add a small delay to prevent immediate closing
  setTimeout(() => {
    if (userAvatarContainer && userMenu && userMenu.style.display !== 'none') {
      const target = e.target as Node | null;
      if (target && !userAvatarContainer.contains(target) && !userMenu.contains(target)) {
        Logger.debug('🖱️ Clicked outside, hiding menu', 'profile');
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
    
    // Add click-outside listener only once (ES6 pattern - module-level flag)
    let clickOutsideListenerAdded = false;
    if (!clickOutsideListenerAdded) {
      document.addEventListener('click', handleClickOutside);
      clickOutsideListenerAdded = true;
    }
    
    Logger.debug('✅ Profile avatar click handler added', null, 'profile');
  } else {
    Logger.debug('❌ Profile avatar container or menu not found', null, 'profile');
  }
}

// ===== PROFILE MENU ITEM HANDLERS (FROM COMP) =====
function addAuraButtonClickHandler() {
  const auraBtn = document.getElementById('aura-btn');
  if (auraBtn) {
    auraBtn.addEventListener('click', (e) => {
      Logger.debug('🎨 Aura button clicked!', null, 'profile');
      e.stopPropagation(); // Prevent menu from closing
      // ES6 pattern: Dispatch DOM event instead of calling window function
      window.dispatchEvent(new CustomEvent('showColorPickerModal', {
        detail: { source: 'ProfileManager' }
      }));
      // Optional: Try to call function if available (graceful degradation)
      const win = window as Window & { showColorPickerModal?: () => void };
      if (typeof win.showColorPickerModal === 'function') {
        win.showColorPickerModal();
      }
    });
    Logger.debug('✅ Aura button click handler added', null, 'profile');
  } else {
    Logger.debug('❌ Aura button not found', null, 'profile');
  }
}


function addLogoutButtonClickHandler() {
  const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement | null;
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      Logger.debug('🚪 COMP METHOD: Logout button clicked!', null, 'profile');
      e.stopPropagation(); // Prevent menu from closing
      // ES6 pattern: Use authManagerInstance for logout
      if (authManagerInstance && typeof authManagerInstance.signOut === 'function') {
        try {
          authManagerInstance.signOut();
        } catch (error) {
          Logger.error('❌ LOGOUT: Error during sign out', error, 'profile');
        }
      } else {
        Logger.debug('❌ logout function not available, using fallback', 'profile');
        // Fallback: Dispatch event and clear state
        window.dispatchEvent(new CustomEvent('performLogout', {
          detail: { source: 'ProfileManager' }
        }));
        // Clear user data from state manager (ES6 pattern)
        stateManagerInstance.setState('currentUser', null);
        stateManagerInstance.setState('supabaseUser', null);
        
        // Clear storage
        if (chrome?.storage?.local?.clear) {
          chrome.storage.local.clear(() => {
            if (chrome.runtime?.lastError) {
              Logger.error('❌ LOGOUT: Error clearing storage', chrome.runtime.lastError, 'profile');
            }
          });
        }
        
        // Reload the extension
        window.location.reload();
      }
    });
    Logger.debug('✅ COMP METHOD: Logout button click handler added', null, 'profile');
  } else {
    Logger.debug('❌ Logout button not found', null, 'profile');
  }
}

function addAllProfileMenuHandlers() {
  Logger.debug('🎯 PROFILE_MENU: Adding all profile menu handlers...', null, 'profile');
  addAuraButtonClickHandler();
  addLogoutButtonClickHandler();
  
  // ROOT CAUSE FIX: Ensure visibility settings button handler is added
  // ES6 pattern: ProfileManager is available via ES6 exports, not window
  // TODO: Refactor to use ES6 import when ProfileManager is properly exported
  // This section is temporarily disabled until ProfileManager is properly exported as ES6 module
  /*
  const profileManager = null; // Will be replaced with ES6 import when available
  const visibilityBtn = document.getElementById('visibility-settings-btn') as HTMLButtonElement | null;
  if (visibilityBtn && profileManager) {
      // Check if handler is already attached
      if (!visibilityBtn.dataset.handlerAttached) {
        Logger.debug('🔧 PROFILE_MENU: Visibility button found but handler not attached, attaching now...', 'profile');
        
        // Remove any existing handlers first
        visibilityBtn.onclick = null;
        if (profileManager && typeof profileManager === 'object' && 'visibilitySettingsHandler' in profileManager && profileManager.visibilitySettingsHandler) {
          visibilityBtn.removeEventListener('click', profileManager.visibilitySettingsHandler as EventListener);
        }
        
        // Create handler function if it doesn't exist
        if (!profileManager || typeof profileManager !== 'object' || !('visibilitySettingsHandler' in profileManager) || !profileManager.visibilitySettingsHandler) {
          if (profileManager && typeof profileManager === 'object') {
            (profileManager as { visibilitySettingsHandler?: (e: Event) => void }).visibilitySettingsHandler = (e: Event) => {
              e.preventDefault();
              e.stopPropagation();
              Logger.debug('🔧 PROFILE MANAGER: COMP METHOD - Visibility settings button clicked', null, 'profile');
              if (profileManager && typeof profileManager === 'object' && 'hideUserMenu' in profileManager && typeof (profileManager as { hideUserMenu: unknown }).hideUserMenu === 'function') {
                (profileManager as { hideUserMenu: () => void }).hideUserMenu();
              }
            
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
              const button = document.querySelector(selector) as HTMLElement | null;
              if (button) {
                button.click();
                Logger.debug('✅ PROFILE MANAGER: Switched to settings tab via selector', { selector }, 'profile');
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
              const btnElement = btn as HTMLElement;
              btnElement.classList.remove('active');
              // ROOT CAUSE FIX: Remove forced styles from inactive tabs
              btnElement.style.removeProperty('border-bottom');
              btnElement.style.removeProperty('border-bottom-color');
              btnElement.style.removeProperty('border-bottom-width');
              btnElement.style.removeProperty('border-bottom-style');
              btnElement.style.removeProperty('color');
              btnElement.style.removeProperty('font-weight');
              
              if (btnElement.getAttribute('data-tab') === 'settings-tab' || btnElement.getAttribute('aria-controls') === 'settings-tab') {
                btnElement.classList.add('active');
                // ROOT CAUSE FIX: Force selector line via JavaScript since CSS isn't applying
                const SELECTOR_LINE_COLOR = '#1D9BF0'; // X's neon blue
                const SELECTOR_LINE_WIDTH = '4px';
                btnElement.style.setProperty('border-bottom', `${SELECTOR_LINE_WIDTH} solid ${SELECTOR_LINE_COLOR}`, 'important');
                btnElement.style.setProperty('border-bottom-color', SELECTOR_LINE_COLOR, 'important');
                btnElement.style.setProperty('border-bottom-width', SELECTOR_LINE_WIDTH, 'important');
                btnElement.style.setProperty('border-bottom-style', 'solid', 'important');
                btnElement.style.setProperty('color', SELECTOR_LINE_COLOR, 'important');
                btnElement.style.setProperty('font-weight', '700', 'important');
              }
            });
            Logger.debug('✅ PROFILE MANAGER: Directly activated settings tab', null, 'profile');
            switched = true;
            
            // ROOT CAUSE FIX: Ensure event listeners are attached when settings tab opens
            // Use setTimeout to avoid blocking, and wrap in async IIFE
            setTimeout(async () => {
              try {
                // Dynamic import - VisibilitySettingsManager is in extension/features at runtime
            // @ts-expect-error - Dynamic runtime import, types not available at compile time
            const module = await import('../../extension/features/VisibilitySettingsManager.js').catch(() => 
              // @ts-expect-error - Dynamic runtime import, types not available at compile time
              import('../../features/VisibilitySettingsManager.js')
            ) as { visibilitySettingsManagerInstance?: { ensureEventListeners?: () => Promise<void> } };
                const visibilitySettingsManager = module?.visibilitySettingsManagerInstance;
                if (visibilitySettingsManager && typeof visibilitySettingsManager.ensureEventListeners === 'function') {
                  await visibilitySettingsManager.ensureEventListeners();
                  Logger.debug('✅ PROFILE MANAGER: Ensured VisibilitySettingsManager event listeners are attached', null, 'profile');
                } else {
                  Logger.warn('⚠️ PROFILE MANAGER: visibilitySettingsManagerInstance not available or ensureEventListeners not a function', null, 'profile');
                }
              } catch (error) {
                Logger.warn('⚠️ PROFILE MANAGER: Failed to import VisibilitySettingsManager', error, 'profile');
              }
            }, 100);
          }
            }
            
            // Method 3: Dispatch custom event
            if (!switched) {
              const tabSwitchEvent = new CustomEvent('tabSwitch', { detail: { tabId: 'settings-tab' } });
              window.dispatchEvent(tabSwitchEvent);
              Logger.debug('✅ PROFILE MANAGER: Dispatched tab switch event for settings tab', null, 'profile');
            }
            };
          }
        }
        
        // Attach handler
        if (profileManager && typeof profileManager === 'object' && 'visibilitySettingsHandler' in profileManager && profileManager.visibilitySettingsHandler) {
          visibilityBtn.addEventListener('click', profileManager.visibilitySettingsHandler as EventListener);
        }
        visibilityBtn.dataset.handlerAttached = 'true';
        
        // Ensure button is active and clickable
        visibilityBtn.style.pointerEvents = 'auto';
        visibilityBtn.style.cursor = 'pointer';
        visibilityBtn.style.opacity = '1';
        visibilityBtn.disabled = false;
        
        Logger.debug('✅ PROFILE_MENU: Visibility button handler attached and activated', null, 'profile');
      } else {
        Logger.debug('✅ PROFILE_MENU: Visibility button handler already attached', null, 'profile');
      }
    } else {
      Logger.warn('⚠️ PROFILE_MENU: Visibility button not found in DOM', null, 'profile');
    }
  }
  */
  
  Logger.debug('✅ PROFILE_MENU: All profile menu handlers added', null, 'profile');
}

// ===== AURA COLOR MODAL (FROM COMP) =====
function showColorPickerModal() {
  Logger.debug('🎨 Opening color picker modal...', null, 'profile');
  
  // Check if modal already exists and is visible
  const existingModal = document.getElementById('color-picker-modal');
  if (existingModal) {
    Logger.debug('🎨 Modal already exists, showing it', 'profile');
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
    const modal = document.getElementById('color-picker-modal') as HTMLElement | null;
    const colorInput = document.getElementById('color-input') as HTMLInputElement | null;
    const previewCircle = document.getElementById('color-preview-circle') as HTMLElement | null;
    const previewText = document.getElementById('color-preview-text') as HTMLElement | null;
    const closeBtn = document.getElementById('color-picker-close') as HTMLButtonElement | null;
    const resetBtn = document.getElementById('color-picker-reset') as HTMLButtonElement | null;
    const saveBtn = document.getElementById('color-picker-save') as HTMLButtonElement | null;
    
    if (!modal || !colorInput || !previewCircle || !previewText || !closeBtn || !resetBtn || !saveBtn) {
      Logger.error('❌ Modal elements not found after creation', null, 'profile');
      return;
    }
    
    // Get current color and set initial values
    const currentColor = getCurrentUserAvatarBgColor();
    const currentHex = typeof currentColor === 'string' ? currentColor.replace('#', '') : 'ffffff';
    colorInput.value = currentHex;
    updateColorPreview(currentHex);
    
    // Remove any existing event listeners to prevent duplicates
    const newColorInput = colorInput.cloneNode(true) as HTMLInputElement;
    const parentNode = colorInput.parentNode;
    if (!parentNode) {
      Logger.error('❌ PROFILE: Color input has no parent node', null, 'profile');
      return;
    }
    parentNode.replaceChild(newColorInput, colorInput);
    
    // Event listeners
    newColorInput.addEventListener('input', (e: Event) => {
      const inputEl = e.target as HTMLInputElement;
      const hex = inputEl.value.replace('#', '');
      updateColorPreview(hex);
    });
    
    closeBtn.addEventListener('click', closeColorPickerModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeColorPickerModal();
    });
    
    resetBtn.addEventListener('click', () => {
      // Get the dynamic default color (based on user's name)
      // ES6 pattern: Get from stateManager instead of window.currentUser
      let defaultColor = AVATAR_FALLBACK_COLOR; // Fallback
      const user = stateManagerInstance.getState('currentUser') as User | null;
      if (user) {
        const userMetadata = (user as { user_metadata?: { full_name?: string } }).user_metadata;
        const name = userMetadata?.full_name || user.name || user.email || 'User';
        defaultColor = getAvatarColor(name);
      }
      const defaultHex = (defaultColor || '#aaaaaa').replace('#', '');
      newColorInput.value = defaultHex;
      updateColorPreview(defaultHex);
    });
    
    saveBtn.addEventListener('click', async () => {
      const hex = newColorInput.value.replace('#', '');
      if (isValidHex(hex)) {
        Logger.debug('🎨 Saving aura color:', '#' + hex, 'profile');
        const auraColor = '#' + hex;
        Logger.debug('🎨 Setting aura color:', auraColor, 'profile');
        
        // Apply aura color to profile avatar using unified system
        // ES6 pattern: Update stateManager instead of window.currentUser
        const currentUser = stateManagerInstance.getState('currentUser') as User | null;
        if (currentUser) {
          currentUser.auraColor = auraColor;
          stateManagerInstance.setState('currentUser', currentUser);
          // ES6 pattern: Dispatch event instead of calling window function
          window.dispatchEvent(new CustomEvent('updateUI', {
            detail: { user: currentUser, source: 'ProfileManager' }
          }));
        }
        
        // Save aura color to storage
        // ES6 pattern: Use stateManager instead of window.setState
        stateManagerInstance.setState('userAvatarBgColor', auraColor);
        
        closeColorPickerModal();
      } else {
        alert('Please enter a valid 6-digit hex color (e.g., 45B7D1)');
      }
    });
    
    // Focus the input
    newColorInput.focus();
    newColorInput.select();
    
    Logger.debug('🎨 Modal setup complete', null, 'profile');
  }, 50);
}

function closeColorPickerModal() {
  const modal = document.getElementById('color-picker-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function updateColorPreview(hex: string) {
  const previewCircle = document.getElementById('color-preview-circle');
  const previewText = document.getElementById('color-preview-text');
  
  if (previewCircle && previewText) {
    const color = '#' + hex;
    previewCircle.style.backgroundColor = color;
    previewText.textContent = color;
  }
}

function isValidHex(hex: string) {
  return /^[A-Fa-f0-9]{6}$/.test(hex);
}

function getAvatarColor(name: string) {
  // Simple hash function to generate consistent colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

// ROOT CAUSE FIX: Unified function to update availability status in BOTH Chrome storage AND database
async function updateAvailabilityEverywhere(availability: string) {
  Logger.debug('🔄 STATUS_UPDATE: Updating availability everywhere', { availability }, 'profile');
  
  if (!availability || !['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(availability)) {
    Logger.error('❌ STATUS_UPDATE: Invalid availability', { availability }, 'profile');
    return false;
  }
  
  try {
    // Step 1: Update Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await setChromeStorage({ 
          userAvailability: availability, 
          availability: availability, 
          globalAvailability: availability 
        });
        Logger.debug('✅ STATUS_UPDATE: Saved to Chrome storage', { availability }, 'profile');
      } catch (error) {
        Logger.error('❌ STATUS_UPDATE: Error saving to Chrome storage', error, 'profile');
      }
    }
    
    // ROOT CAUSE FIX: Step 2: Update database via API
    const currentUserForStatusApi = stateManagerInstance.getState('currentUser') as User | null;
    if (currentUserForStatusApi && currentUserForStatusApi.id) {
      const api = ensureApi('update availability in database');
      if (api) {
        try {
          const result = await api.request('/v1/presence/availability', {
          method: 'POST',
          body: JSON.stringify({
            availability: availability,
            isGlobal: true
          })
        });
        
          if (result && typeof result === 'object' && 'success' in result && result.success) {
            Logger.debug('✅ STATUS_UPDATE: Saved to database', { availability }, 'profile');
          } else {
            Logger.error('❌ STATUS_UPDATE: Database update returned no result', null, 'profile');
          }
        } catch (error) {
          Logger.error('❌ STATUS_UPDATE: Error saving to database', error, 'profile');
          // Don't throw - Chrome storage update succeeded
        }
      }
    } else {
      Logger.warn('⚠️ STATUS_UPDATE: Cannot update database - missing user or API', null, 'profile');
    }
    
    // ROOT CAUSE FIX: Step 3: Update stateManager currentUser immediately
    const currentUserForStatusUpdate = stateManagerInstance.getState('currentUser') as User | null;
    if (currentUserForStatusUpdate) {
      stateManagerInstance.setState('currentUser', { ...currentUserForStatusUpdate, availability, globalAvailability: availability });
      Logger.debug('✅ STATUS_UPDATE: Updated stateManager currentUser', null, 'profile');
    }
    
    // ROOT CAUSE FIX: Step 4: Update visibility cache immediately to prevent stale data
    const visibilityData = getVisibilityDataUnfiltered();
    if (visibilityData?.active && currentUserForStatusUpdate) {
      const currentUserInVisibility = visibilityData.active.find((u: User) => 
        String(u.id || (u as User).userId) === String(currentUserForStatusUpdate.id)
      );
      if (currentUserInVisibility) {
        currentUserInVisibility.availability = availability;
        Logger.debug('✅ STATUS_UPDATE: Updated visibility cache', null, 'profile');
      }
    }
    
    const visibilityDataFiltered3 = getVisibilityDataFiltered();
    if (visibilityDataFiltered3?.active && currentUserForStatusUpdate) {
      const currentUserInVisibility = visibilityDataFiltered3.active.find((u: User) => 
        String(u.id || (u as User).userId) === String(currentUserForStatusUpdate.id)
      );
      if (currentUserInVisibility) {
        currentUserInVisibility.availability = availability;
      }
    }
    
    // Step 5: Refresh profile avatar to show new status dot
    // ES6 pattern: ProfileManager available via ES6 exports
    // TODO: Replace with ES6 import when ProfileManager is properly exported
    const profileManagerInstance = null as { updateUserAvatar?: () => Promise<void> } | null;
    if (profileManagerInstance && typeof profileManagerInstance.updateUserAvatar === 'function') {
      try {
        Logger.debug('🔄 STATUS_UPDATE: Refreshing profile avatar with new status', null, 'profile');
        await profileManagerInstance.updateUserAvatar();
        Logger.debug('✅ STATUS_UPDATE: Profile avatar refreshed', null, 'profile');
      } catch (error) {
        Logger.warn('⚠️ STATUS_UPDATE: Error refreshing profile avatar', error, 'profile');
      }
    }
    
    // Step 6: Force refresh all message avatars to show new status
    // ES6 pattern: Dispatch DOM events for avatar refresh
    window.dispatchEvent(new CustomEvent('avatarRefreshRequested', {
      detail: { type: 'all', source: 'ProfileManager' }
    }));
    // Optional: Try to call functions if available (graceful degradation)
    const win = window as Window & { 
      refreshAllMessageAvatars?: () => Promise<void>;
      refreshVisibilityAvatars?: () => Promise<void>;
    };
    if (typeof win.refreshAllMessageAvatars === 'function') {
      Logger.debug('🔄 STATUS_UPDATE: Refreshing all message avatars with new status', null, 'profile');
      await win.refreshAllMessageAvatars();
    }
    
    // Step 7: Refresh visibility avatars
    window.dispatchEvent(new CustomEvent('avatarRefreshRequested', {
      detail: { type: 'visibility', source: 'ProfileManager' }
    }));
    if (typeof win.refreshVisibilityAvatars === 'function') {
      Logger.debug('🔄 STATUS_UPDATE: Refreshing visibility avatars', null, 'profile');
      await win.refreshVisibilityAvatars();
    }
    
    Logger.debug('✅ STATUS_UPDATE: Availability update complete', null, 'profile');
    return true;
  } catch (error) {
    Logger.error('❌ STATUS_UPDATE: Error updating availability', error, 'profile');
    return false;
  }
}

// ROOT CAUSE FIX: Unified function to update theme in BOTH Chrome storage AND database
async function updateThemeEverywhere(theme: string) {
  // ROOT CAUSE FIX: Log call stack to identify where this is being called from
  const stack = new Error().stack;
  Logger.debug('🔄 THEME_UPDATE: Updating theme everywhere', { theme, callStack: stack?.split('\n').slice(1, 5).join('\n') }, 'profile');
  
  if (!theme || !['light', 'dark', 'auto'].includes(theme)) {
    Logger.error('❌ THEME_UPDATE: Invalid theme', { theme }, 'profile');
    return false;
  }

  // ROOT CAUSE FIX: CRITICAL - Prevent resetting to 'light' if current DOM theme is 'dark'
  // This prevents theme from being reset when preferences load or messages reload
  // NEVER allow resetting from dark to light unless it's an explicit user action
  const currentDomTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
  if (currentDomTheme === 'dark' && theme === 'light') {
    // Check if this is coming from UserPreferencesManager or VisibilitySettingsManager (which should respect DOM)
    const isFromPreferencesManager = stack?.includes('UserPreferencesManager') || 
                                     stack?.includes('applyPreferencesToUI') ||
                                     stack?.includes('loadAllPreferences') ||
                                     stack?.includes('VisibilitySettingsManager') ||
                                     stack?.includes('saveTheme');
    
    if (isFromPreferencesManager) {
      Logger.warn('🚫 THEME_UPDATE: BLOCKING reset from dark to light - preserving current DOM theme', null, 'profile');
      Logger.warn('🚫 THEME_UPDATE: Current DOM theme is dark, requested theme is light, but this appears to be from preferences/settings loading', null, 'profile');
      Logger.warn('🚫 THEME_UPDATE: This is likely a fallback that should not happen - UserPreferencesManager should be initialized', null, 'profile');
      return false; // Don't reset theme
    }
    
    // Even if not from preferences manager, check if Chrome storage has 'dark' (user's actual preference)
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const chromeStorage = await new Promise<Record<string, unknown>>((resolve) => {
          chrome.storage!.local!.get(['theme'], (result) => {
            resolve((result || {}) as Record<string, unknown>);
          });
        });
        if (chromeStorage && chromeStorage.theme === 'dark') {
          Logger.warn('🚫 THEME_UPDATE: BLOCKING reset from dark to light - Chrome storage has dark theme', null, 'profile');
          return false; // Don't reset theme
        }
      } catch (error) {
        Logger.warn('⚠️ THEME_UPDATE: Error checking Chrome storage', error, 'profile');
      }
    }
  }
  
  try {
    // Step 1: Update Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        await setChromeStorage({ theme: theme, userTheme: theme });
        Logger.debug('✅ THEME_UPDATE: Saved to Chrome storage:', theme, 'profile');
      } catch (error) {
        Logger.error('❌ THEME_UPDATE: Error saving to Chrome storage:', error, 'profile');
      }
    }
    
    // ROOT CAUSE FIX: Removed localStorage - we only use Chrome storage and database
    
    // Step 3: Update DOM immediately for instant feedback
    const currentDomBeforeUpdate = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
    Logger.debug('🔍 THEME_UPDATE: ========================================', null, 'profile');
    Logger.debug('🔍 THEME_UPDATE: About to set DOM theme', null, 'profile');
    Logger.debug('🔍 THEME_UPDATE: Current DOM theme:', currentDomBeforeUpdate || 'NOT SET', 'profile');
    Logger.debug('🔍 THEME_UPDATE: New theme:', theme, 'profile');
    Logger.debug('🔍 THEME_UPDATE: ========================================', null, 'profile');
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    
    // Step 4: Update database via API
    // ROOT CAUSE FIX: Get currentUser from stateManager
    const currentUserForThemeApi = stateManagerInstance.getState('currentUser') as User | null;
    if (currentUserForThemeApi && currentUserForThemeApi.id) {
      const api = ensureApi('update theme in database');
      if (api) {
        try {
          const result = await api.request(`/v1/users/${currentUserForThemeApi.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              theme: theme
            })
          });
          
          if (result) {
            Logger.debug('✅ THEME_UPDATE: Saved to database:', theme, 'profile');
          } else {
            Logger.error('❌ THEME_UPDATE: Database update returned no result', null, 'profile');
          }
        } catch (error) {
          Logger.error('❌ THEME_UPDATE: Error saving to database:', error, 'profile');
          // Don't throw - Chrome storage update succeeded
        }
      }
    } else {
      Logger.warn('⚠️ THEME_UPDATE: Cannot update database - missing user or API', null, 'profile');
    }
    
    // Step 5: Update local user object immediately
    // ES6 pattern: Update stateManager instead of window.currentUser
    const currentUser = stateManagerInstance.getState('currentUser') as User | null;
    if (currentUser) {
      currentUser.theme = theme;
      stateManagerInstance.setState('currentUser', currentUser);
      Logger.debug('✅ THEME_UPDATE: Updated stateManager.currentUser', null, 'profile');
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
    const themeToggle = document.getElementById('theme-toggle') as HTMLInputElement | null;
    if (themeToggle) {
      themeToggle.checked = theme === 'dark';
      // Trigger updateThemeStatus to update slider position
      // ES6 pattern: Dispatch event for visibility settings update
      window.dispatchEvent(new CustomEvent('updateVisibilityThemeStatus', {
        detail: { source: 'ProfileManager' }
      }));
      // Optional: Try to call manager if available (graceful degradation)
      const win = window as Window & { 
        visibilitySettingsManager?: { updateThemeStatus?: () => void };
      };
      if (win.visibilitySettingsManager && typeof win.visibilitySettingsManager.updateThemeStatus === 'function') {
        win.visibilitySettingsManager.updateThemeStatus();
      }
      Logger.debug('✅ THEME_UPDATE: Updated settings tab theme toggle', null, 'profile');
    }
    
    Logger.debug('✅ THEME_UPDATE: Theme update complete', null, 'profile');
    return true;
  } catch (error) {
    Logger.error('❌ THEME_UPDATE: Error updating theme:', error, 'profile');
    return false;
  }
}

// ROOT CAUSE FIX: Get current user's theme (Chrome storage first, then database fallback)
async function getCurrentUserTheme() {
  Logger.debug('🔍 THEME_GET: Getting current user theme (Chrome storage first, then database)', null, 'profile');
  
  // ROOT CAUSE FIX: Check Chrome storage FIRST
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const storageResult = await getChromeStorage<{ theme?: string; userTheme?: string }>(['theme', 'userTheme']);
      
      const cachedTheme = storageResult.theme || storageResult.userTheme;
      if (cachedTheme && ['light', 'dark', 'auto'].includes(cachedTheme)) {
        Logger.debug(`✅ THEME_GET: Found theme in Chrome storage: ${cachedTheme}`, null, 'profile');
        return cachedTheme;
      }
    } catch (error) {
      Logger.warn('⚠️ THEME_GET: Error reading Chrome storage:', error, 'profile');
    }
  }
  
  // ROOT CAUSE FIX: Removed localStorage fallback - we only use Chrome storage and database
  // Fallback 1: Try to get from current user object (from database)
  // ES6 pattern: Get from stateManager instead of window.currentUser
  const currentUser = stateManagerInstance.getState('currentUser') as User | null;
  if (currentUser && currentUser.theme) {
    const userTheme = currentUser.theme;
    if (typeof userTheme === 'string' && ['light', 'dark', 'auto'].includes(userTheme)) {
      Logger.debug(`✅ THEME_GET: Found theme in currentUser: ${userTheme}`, null, 'profile');
      return userTheme;
    }
  }
  
  // ROOT CAUSE FIX: Fallback 3: Try to fetch from database via API
  const currentUserForThemeFetch = stateManagerInstance.getState('currentUser') as User | null;
  if (currentUserForThemeFetch && currentUserForThemeFetch.id) {
    const api = ensureApi('fetch theme from database');
    if (api) {
      try {
        const userData = await api.request(`/v1/users/${currentUserForThemeFetch.id}`, {
          method: 'GET'
        });
        if (userData && typeof userData === 'object' && 'theme' in userData && typeof userData.theme === 'string') {
          Logger.debug(`✅ THEME_GET: Fetched theme from database API: ${userData.theme}`, null, 'profile');
          // Cache it in Chrome storage for next time
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await setChromeStorage({ theme: userData.theme, userTheme: userData.theme });
          }
          // ROOT CAUSE FIX: Removed localStorage - we only use Chrome storage and database
          return userData.theme;
        }
      } catch (error) {
        Logger.warn('⚠️ THEME_GET: Error fetching from database API:', error, 'profile');
      }
    }
  }
  
  // Fallback 4: Check DOM attribute
  const domTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
  if (domTheme && ['light', 'dark', 'auto'].includes(domTheme)) {
    Logger.debug(`✅ THEME_GET: Found theme in DOM: ${domTheme}`, null, 'profile');
    return domTheme;
  }
  
  // Final fallback to default
  Logger.debug('⚠️ THEME_GET: No theme found, using default: light', 'profile');
  return 'light';
}

// ROOT CAUSE FIX: Get current user's availability (Chrome storage first, then database fallback)
async function getCurrentUserAvailability() {
  Logger.debug('🔍 STATUS_GET: Getting current user availability (Chrome storage first, then database)', null, 'profile');
  
  // ROOT CAUSE FIX: Check Chrome storage FIRST
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const storageResult = await getChromeStorage<{ userAvailability?: string; availability?: string; globalAvailability?: string }>(['userAvailability', 'availability', 'globalAvailability']);
      
      const cachedAvailability = storageResult.userAvailability || storageResult.availability || storageResult.globalAvailability;
      if (cachedAvailability && ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(cachedAvailability)) {
        Logger.debug(`✅ STATUS_GET: Found availability in Chrome storage: ${cachedAvailability}`, null, 'profile');
        return cachedAvailability;
      }
    } catch (error) {
      Logger.warn('⚠️ STATUS_GET: Error reading Chrome storage:', error, 'profile');
    }
  }
  
  // Fallback 1: Try to get from stateManager currentUser (from database)
  const currentUserForStatus = stateManagerInstance.getState('currentUser') as User | null;
  if (currentUserForStatus) {
    const userAvailability = (currentUserForStatus as { availability?: string; globalAvailability?: string }).availability || (currentUserForStatus as { availability?: string; globalAvailability?: string }).globalAvailability;
    if (userAvailability && typeof userAvailability === 'string' && ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(userAvailability)) {
      Logger.debug(`✅ STATUS_GET: Found availability in currentUser: ${userAvailability}`, null, 'profile');
      return userAvailability;
    }
  }
  
  // ROOT CAUSE FIX: Fallback 2: Try to get from visibility data (database)
  const visibilityData = getVisibilityDataUnfiltered();
  if (visibilityData?.active) {
    const currentUserInVisibility = visibilityData.active.find((u: User) => 
      String(u.id || (u as User).userId) === String(currentUserForStatus?.id)
    );
    if (currentUserInVisibility && currentUserInVisibility.availability) {
      Logger.debug(`✅ STATUS_GET: Found availability in visibility data: ${currentUserInVisibility.availability}`, null, 'profile');
      return currentUserInVisibility.availability;
    }
  }
  
  // ROOT CAUSE FIX: Fallback 3: Try to fetch from database via API
  if (currentUserForStatus && currentUserForStatus.id) {
    const api = ensureApi('fetch availability from database');
    if (api) {
      try {
        const statusData = await api.request('/v1/presence/availability', {
          method: 'GET'
        });
        if (statusData && typeof statusData === 'object' && 'availability' in statusData && typeof statusData.availability === 'string') {
          Logger.debug(`✅ STATUS_GET: Fetched availability from database API: ${statusData.availability}`, null, 'profile');
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
        Logger.warn('⚠️ STATUS_GET: Error fetching from database API:', error, 'profile');
      }
    }
  }
  
  // Final fallback to default
  Logger.debug('⚠️ STATUS_GET: No availability found, using default: AVAILABLE', 'profile');
  return 'AVAILABLE';
}

type ProfileManagerWindowBindings = Window & {
  ProfileManager?: typeof ProfileManager;
  profileManager?: ProfileManager;
  getCurrentUserAuraColor?: typeof getCurrentUserAuraColor;
  updateAuraColorEverywhere?: typeof updateAuraColorEverywhere;
  getCurrentUserTheme?: typeof getCurrentUserTheme;
  updateThemeEverywhere?: typeof updateThemeEverywhere;
  getCurrentUserAvailability?: typeof getCurrentUserAvailability;
  updateAvailabilityEverywhere?: typeof updateAvailabilityEverywhere;
  getCurrentUserAvatarBgColor?: typeof getCurrentUserAvatarBgColor;
  getCurrentUserAvatarColor?: typeof getCurrentUserAvatarColor;
  setCustomAvatarColor?: typeof setCustomAvatarColor;
  resetCustomAvatarColor?: typeof resetCustomAvatarColor;
  handleAvatarClick?: typeof handleAvatarClick;
  handleClickOutside?: typeof handleClickOutside;
  addProfileAvatarClickHandler?: typeof addProfileAvatarClickHandler;
  addAuraButtonClickHandler?: typeof addAuraButtonClickHandler;
  addLogoutButtonClickHandler?: typeof addLogoutButtonClickHandler;
  addAllProfileMenuHandlers?: typeof addAllProfileMenuHandlers;
  showColorPickerModal?: typeof showColorPickerModal;
  closeColorPickerModal?: typeof closeColorPickerModal;
  updateColorPreview?: typeof updateColorPreview;
  isValidHex?: typeof isValidHex;
  getAvatarColor?: typeof getAvatarColor;
};

let profileManagerInstance: ProfileManager | null = null;
let profileManagerInitialized = false;

const getProfileManagerInstance = (): ProfileManager => {
  if (!profileManagerInstance) {
    profileManagerInstance = new ProfileManager();
  }
  return profileManagerInstance;
};

const bindProfileManagerToWindow = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const win = window as ProfileManagerWindowBindings;
  const instance = getProfileManagerInstance();

  win.ProfileManager = ProfileManager;
  win.profileManager = instance;
  win.getCurrentUserAuraColor = getCurrentUserAuraColor;
  win.updateAuraColorEverywhere = updateAuraColorEverywhere;
  win.getCurrentUserTheme = getCurrentUserTheme;
  win.updateThemeEverywhere = updateThemeEverywhere;
  win.getCurrentUserAvailability = getCurrentUserAvailability;
  win.updateAvailabilityEverywhere = updateAvailabilityEverywhere;
  win.getCurrentUserAvatarBgColor = getCurrentUserAvatarBgColor;
  win.getCurrentUserAvatarColor = getCurrentUserAvatarColor;
  win.setCustomAvatarColor = setCustomAvatarColor;
  win.resetCustomAvatarColor = resetCustomAvatarColor;
  win.handleAvatarClick = handleAvatarClick;
  win.handleClickOutside = handleClickOutside;
  win.addProfileAvatarClickHandler = addProfileAvatarClickHandler;
  win.addAuraButtonClickHandler = addAuraButtonClickHandler;
  win.addLogoutButtonClickHandler = addLogoutButtonClickHandler;
  win.addAllProfileMenuHandlers = addAllProfileMenuHandlers;
  win.showColorPickerModal = showColorPickerModal;
  win.closeColorPickerModal = closeColorPickerModal;
  win.updateColorPreview = updateColorPreview;
  win.isValidHex = isValidHex;
  win.getAvatarColor = getAvatarColor;
};

const initializeProfileManager = (): ProfileManager | null => {
  if (profileManagerInitialized) {
    return profileManagerInstance;
  }
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    Logger.debug('ℹ️ ProfileManager: Skipping bootstrap (no DOM context)', null, 'profile');
    return null;
  }

  const instance = getProfileManagerInstance();
  bindProfileManagerToWindow();
  profileManagerInitialized = true;
  return instance;
};

if (typeof window !== 'undefined') {
  initializeProfileManager();
}

Logger.debug('ProfileManager module loaded', null, 'profile');

const profileManagerApi = {
  ProfileManager,
  initializeProfileManager,
  getProfileManagerInstance,
  getCurrentUserAuraColor,
  updateAuraColorEverywhere,
  getCurrentUserTheme,
  updateThemeEverywhere,
  getCurrentUserAvailability,
  updateAvailabilityEverywhere,
  getCurrentUserAvatarBgColor,
  getCurrentUserAvatarColor,
  setCustomAvatarColor,
  resetCustomAvatarColor,
  handleAvatarClick,
  handleClickOutside,
  addProfileAvatarClickHandler,
  addAuraButtonClickHandler,
  addLogoutButtonClickHandler,
  addAllProfileMenuHandlers,
  showColorPickerModal,
  closeColorPickerModal,
  updateColorPreview,
  isValidHex,
  getAvatarColor
};

export {
  ProfileManager,
  initializeProfileManager,
  getProfileManagerInstance,
  getCurrentUserAuraColor,
  updateAuraColorEverywhere,
  getCurrentUserTheme,
  updateThemeEverywhere,
  getCurrentUserAvailability,
  updateAvailabilityEverywhere,
  getCurrentUserAvatarBgColor,
  getCurrentUserAvatarColor,
  setCustomAvatarColor,
  resetCustomAvatarColor,
  handleAvatarClick,
  handleClickOutside,
  addProfileAvatarClickHandler,
  addAuraButtonClickHandler,
  addLogoutButtonClickHandler,
  addAllProfileMenuHandlers,
  showColorPickerModal,
  closeColorPickerModal,
  updateColorPreview,
  isValidHex,
  getAvatarColor
};

export default profileManagerApi;




