/**
 * UNIFIED STORAGE SYNC - Early Loading Module
 * 
 * This module ensures all unified storage sync functions are available
 * immediately, even before ProfileManager.js fully loads.
 * 
 * Functions are defined here and then re-exported by ProfileManager.js
 * to ensure they're always available.
 */

import type { User, ApiResponse } from '../types/index.js';
import { Logger } from './Logger.js';
import { handleError } from './ErrorHandler.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { apiServiceInstance } from '../services/APIService.js';
// Type definitions
type AuraColor = string;
type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';
type Theme = 'light' | 'dark' | 'auto';

interface ChromeStorageResult {
  userAuraColor?: string;
  auraColor?: string;
  userAvailability?: string;
  availability?: string;
  globalAvailability?: string;
  theme?: string;
  userTheme?: string;
}

interface VisibilityUser {
  id?: string;
  userId?: string;
  auraColor?: string;
  availability?: string;
}

interface VisibilityData {
  active?: VisibilityUser[];
}

interface ApiRequestOptions {
  method: string;
  body?: string;
}

interface ApiModule {
  request: <T = unknown>(url: string, options?: ApiRequestOptions) => Promise<ApiResponse<T>>;
}

interface ProfileManager {
  updateUserAvatar?: () => Promise<void>;
}

interface WindowWithStorage {
  currentUser?: User;
  api?: ApiModule;
  currentVisibilityDataUnfiltered?: VisibilityData;
  handleAuraChange?: (data: { userId?: string; auraColor?: string }) => void;
  refreshAllMessageAvatars?: () => Promise<void>;
  refreshVisibilityAvatars?: () => Promise<void>;
  profileManager?: ProfileManager;
  ProfileManager?: {
    instance?: ProfileManager;
    updateUserAvatar?: () => Promise<void>;
  };
  AVATAR_FALLBACK_COLOR?: string;
}

declare const window: WindowWithStorage;

// ROOT CAUSE FIX: Unified function to update aura color in BOTH Chrome storage AND database
export async function updateAuraColorEverywhere(color: AuraColor): Promise<boolean> {
  Logger.debug('🔄 AURA_UPDATE: Updating aura color everywhere:', color, 'storage');
  
  if (!color || !color.startsWith('#')) {
    Logger.error('❌ AURA_UPDATE: Invalid color format:', color, 'storage');
    return false;
  }
  
  try {
    // Step 1: Update Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.set({ userAuraColor: color, auraColor: color }, () => {
          if (chrome.runtime.lastError) {
            Logger.error('❌ AURA_UPDATE: Error saving to Chrome storage:', chrome.runtime.lastError, 'storage');
            reject(chrome.runtime.lastError);
          } else {
            Logger.debug('✅ AURA_UPDATE: Saved to Chrome storage:', color, 'storage');
            resolve();
          }
        });
      });
    }
    
    // Step 2: Update database via API (TypeScript migration - use module imports)
    const currentUser = stateManagerInstance.getState('currentUser') as User | null;
    if (currentUser?.id && apiServiceInstance) {
      try {
        const result = await apiServiceInstance.request(`/v1/users/${currentUser.id}/aura-color`, {
          method: 'PUT',
          body: JSON.stringify({
            auraColor: color
          })
        });
        
        if (result) {
          Logger.debug('✅ AURA_UPDATE: Saved to database:', color, 'storage');
        } else {
          Logger.error('❌ AURA_UPDATE: Database update returned no result', null, 'storage');
        }
      } catch (error: unknown) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
      
    }
    }
    
    // Step 3: Update local user object immediately
    if (window.currentUser) {
      window.currentUser.auraColor = color;
      Logger.debug('✅ AURA_UPDATE: Updated window.currentUser', null, 'storage');
    }
    
    // Step 4: Update visibility cache
    if (window.currentVisibilityDataUnfiltered?.active) {
      const currentUserInVisibility = window.currentVisibilityDataUnfiltered.active.find(u => 
        String(u.id || u.userId) === String(window.currentUser?.id)
      );
      if (currentUserInVisibility) {
        currentUserInVisibility.auraColor = color;
      }
    }
    
    // Step 5: Trigger real-time update and avatar refresh
    if (window.handleAuraChange) {
      window.handleAuraChange({
        userId: window.currentUser?.id,
        auraColor: color
      });
    }
    
    // Step 6: Force refresh all avatars
    if (typeof window.refreshAllMessageAvatars === 'function') {
      await window.refreshAllMessageAvatars();
    }
    
    if (typeof window.refreshVisibilityAvatars === 'function') {
      await window.refreshVisibilityAvatars();
    }
    
    return true;
  } catch (error: unknown) {
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
    return false;
  
    }
}

// ROOT CAUSE FIX: Get current user's aura color (Chrome storage first, then database fallback)
export async function getCurrentUserAuraColor(): Promise<string> {
  // Check Chrome storage FIRST
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const storageResult = await new Promise<ChromeStorageResult>((resolve) => {
        chrome.storage.local.get(['userAuraColor', 'auraColor'], (result) => {
          resolve(result as ChromeStorageResult);
        });
      });
      
      const cachedAuraColor = storageResult.userAuraColor || storageResult.auraColor;
      const fallbackColor = window.AVATAR_FALLBACK_COLOR || '#ffffff';
      if (cachedAuraColor && cachedAuraColor !== '#ffffff' && cachedAuraColor !== 'ffffff' && cachedAuraColor !== fallbackColor) {
        Logger.debug(`✅ AURA_GET: Found aura color in Chrome storage: ${cachedAuraColor}`, null, 'storage');
        return cachedAuraColor;
      }
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
    
    }
  }
  
  // Fallback to database
  const fallbackColor = window.AVATAR_FALLBACK_COLOR || '#ffffff';
  if (window.currentUser && window.currentUser.auraColor && window.currentUser.auraColor !== fallbackColor) {
    return window.currentUser.auraColor;
  }
  
  // Check stateManager currentUser.auraColor (TypeScript migration)
  const currentUser = stateManagerInstance.getState('currentUser') as User | null;
  if (currentUser?.auraColor && currentUser.auraColor !== fallbackColor) {
    return currentUser.auraColor;
  }
  
  // Try to fetch from database via API (TypeScript migration - use module imports)
  if (currentUser?.id && apiServiceInstance) {
    try {
      const response = await apiServiceInstance.request<User>(`/v1/users/${currentUser.id}`, {
        method: 'GET'
      });
      const userData = response.data;
      if (userData && userData.auraColor) {
        const dbColor = userData.auraColor;
        if (dbColor && dbColor !== fallbackColor) {
          // Cache it in Chrome storage
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ userAuraColor: dbColor, auraColor: dbColor });
          }
          return dbColor;
        }
      }
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
    
    }
  }
  
  return fallbackColor;
}

// ROOT CAUSE FIX: Unified function to update availability status in BOTH Chrome storage AND database
export async function updateAvailabilityEverywhere(availability: AvailabilityStatus): Promise<boolean> {
  Logger.debug('🔄 STATUS_UPDATE: Updating availability everywhere:', availability, 'storage');
  
  if (!availability || !['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(availability)) {
    Logger.error('❌ STATUS_UPDATE: Invalid availability:', availability, 'storage');
    return false;
  }
  
  try {
    // Step 1: Update Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.set({ 
          userAvailability: availability, 
          availability: availability, 
          globalAvailability: availability 
        }, () => {
          if (chrome.runtime.lastError) {
            Logger.error('❌ STATUS_UPDATE: Error saving to Chrome storage:', chrome.runtime.lastError, 'storage');
            reject(chrome.runtime.lastError);
          } else {
            Logger.debug('✅ STATUS_UPDATE: Saved to Chrome storage:', availability, 'storage');
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
          Logger.debug('✅ STATUS_UPDATE: Saved to database:', availability, 'storage');
        }
      } catch (error: unknown) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
      
    }
    }
    
    // Step 3: Update local user object immediately
    if (window.currentUser) {
      window.currentUser.availability = availability;
      // Note: globalAvailability is a legacy alias, handled via UserPreferencesManager
      Logger.debug('✅ STATUS_UPDATE: Updated window.currentUser', null, 'storage');
    }
    
    // Step 4: Update visibility cache
    if (window.currentVisibilityDataUnfiltered?.active) {
      const currentUserInVisibility = window.currentVisibilityDataUnfiltered.active.find(u => 
        String(u.id || u.userId) === String(window.currentUser?.id)
      );
      if (currentUserInVisibility) {
        currentUserInVisibility.availability = availability;
      }
    }
    
    // Step 5: Force refresh all avatars
    if (typeof window.refreshAllMessageAvatars === 'function') {
      await window.refreshAllMessageAvatars();
    }
    
    if (typeof window.refreshVisibilityAvatars === 'function') {
      await window.refreshVisibilityAvatars();
    }
    
    // ROOT CAUSE FIX: Also refresh profile avatar when availability changes
    // ProfileManager is a class, try to find instance
    const profileManagerInstance = window.profileManager;
    if (profileManagerInstance && typeof profileManagerInstance.updateUserAvatar === 'function') {
        try {
          await profileManagerInstance.updateUserAvatar();
          Logger.debug('✅ STATUS_UPDATE: Profile avatar refreshed', null, 'storage');
        } catch (error: unknown) {
        handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
      
    }
    } else if (window.profileManager && typeof window.profileManager.updateUserAvatar === 'function') {
      // Use instance method
      try {
        await window.profileManager.updateUserAvatar();
        Logger.debug('✅ STATUS_UPDATE: Profile avatar refreshed (static method)', null, 'storage');
      } catch (error: unknown) {
        handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
      
    }
    }
    
    return true;
  } catch (error: unknown) {
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
    return false;
  
    }
}

// ROOT CAUSE FIX: Get current user's availability (Chrome storage first, then database fallback)
export async function getCurrentUserAvailability(): Promise<AvailabilityStatus> {
  // Check Chrome storage FIRST
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const storageResult = await new Promise<ChromeStorageResult>((resolve) => {
        chrome.storage.local.get(['userAvailability', 'availability', 'globalAvailability'], (result) => {
          resolve(result as ChromeStorageResult);
        });
      });
      
      const cachedAvailability = storageResult.userAvailability || storageResult.availability || storageResult.globalAvailability;
      if (cachedAvailability && ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(cachedAvailability as AvailabilityStatus)) {
        Logger.debug(`✅ STATUS_GET: Found availability in Chrome storage: ${cachedAvailability}`, null, 'storage');
        return cachedAvailability as AvailabilityStatus;
      }
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
    
    }
  }
  
  // Fallback to stateManager (TypeScript migration)
  const currentUser = stateManagerInstance.getState('currentUser') as User | null;
  if (currentUser?.availability && ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(currentUser.availability as AvailabilityStatus)) {
    return currentUser.availability as AvailabilityStatus;
  }
  
  // Try to fetch from database via API (TypeScript migration - use module imports)
  if (currentUser?.id && apiServiceInstance) {
    try {
      const statusData = await apiServiceInstance.request<{ availability?: AvailabilityStatus }>('/v1/presence/availability', {
        method: 'GET'
      });
      const availability = statusData?.data?.availability;
      if (availability) {
        // Cache it in Chrome storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ 
            userAvailability: availability, 
            availability: availability, 
            globalAvailability: availability 
          });
        }
        // Update stateManager currentUser (TypeScript migration)
        if (currentUser) {
          const updatedUser = { ...currentUser, availability: availability as AvailabilityStatus };
          stateManagerInstance.setState('currentUser', updatedUser);
          // Note: globalAvailability is a legacy alias, handled via UserPreferencesManager
          // Backward compatibility: Update window.currentUser if it exists
          if (typeof window !== 'undefined' && (window as { currentUser?: User }).currentUser) {
            (window as { currentUser: User }).currentUser.availability = availability;
          }
        }
        return availability as AvailabilityStatus;
      }
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
    
    }
  }
  
  return 'AVAILABLE';
}

// ROOT CAUSE FIX: Unified function to update theme in BOTH Chrome storage AND database
export async function updateThemeEverywhere(theme: Theme): Promise<boolean> {
  Logger.debug('🔄 THEME_UPDATE: Updating theme everywhere:', theme, 'storage');
  
  if (!theme || !['light', 'dark', 'auto'].includes(theme)) {
    Logger.error('❌ THEME_UPDATE: Invalid theme:', theme, 'storage');
    return false;
  }
  
  try {
    // Step 1: Update Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await new Promise<void>((resolve, reject) => {
        chrome.storage.local.set({ theme: theme, userTheme: theme }, () => {
          if (chrome.runtime.lastError) {
            Logger.error('❌ THEME_UPDATE: Error saving to Chrome storage:', chrome.runtime.lastError, 'storage');
            reject(chrome.runtime.lastError);
          } else {
            Logger.debug('✅ THEME_UPDATE: Saved to Chrome storage:', theme, 'storage');
            resolve();
          }
        });
      });
    }
    
    // Step 2: Update localStorage (for compatibility)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
    
    // Step 3: Update DOM immediately
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
    }
    
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
          Logger.debug('✅ THEME_UPDATE: Saved to database:', theme, 'storage');
        }
      } catch (error: unknown) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
      
    }
    }
    
    // Step 5: Update local user object
    if (window.currentUser) {
      // Note: theme is handled via UserPreferencesManager, but we can set it here for backward compatibility
      // The User interface already supports theme via index signature
      const userWithTheme = window.currentUser as User & { theme?: Theme };
      userWithTheme.theme = theme;
    }
    
    // Step 6: Update UI elements
    if (typeof document !== 'undefined') {
      const themeIcon = document.getElementById('theme-icon');
      const themeText = document.getElementById('theme-text');
      if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
      }
      if (themeText) {
        themeText.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
      }
      
      const themeSelect = document.getElementById('theme-select') as HTMLSelectElement | null;
      if (themeSelect) {
        themeSelect.value = theme;
      }
    }
    
    return true;
  } catch (error: unknown) {
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
    return false;
  
    }
}

// ROOT CAUSE FIX: Get current user's theme (Chrome storage first, then database fallback)
export async function getCurrentUserTheme(): Promise<Theme> {
  // Check Chrome storage FIRST
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const storageResult = await new Promise<ChromeStorageResult>((resolve) => {
        chrome.storage.local.get(['theme', 'userTheme'], (result) => {
          resolve(result as ChromeStorageResult);
        });
      });
      
      const cachedTheme = storageResult.theme || storageResult.userTheme;
      if (cachedTheme && ['light', 'dark', 'auto'].includes(cachedTheme)) {
        Logger.debug(`✅ THEME_GET: Found theme in Chrome storage: ${cachedTheme}`, null, 'storage');
        return cachedTheme as Theme;
      }
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
    
    }
  }
  
  // Fallback to localStorage
  if (typeof localStorage !== 'undefined') {
    const localStorageTheme = localStorage.getItem('theme');
    if (localStorageTheme && ['light', 'dark', 'auto'].includes(localStorageTheme)) {
      return localStorageTheme as Theme;
    }
  }
  
  // Fallback to currentUser
  const userWithTheme = window.currentUser as (User & { theme?: Theme }) | undefined;
  if (userWithTheme?.theme) {
    return userWithTheme.theme;
  }
  
  // Try to fetch from database via API
  if (window.currentUser && window.currentUser.id && window.api && typeof window.api.request === 'function') {
    try {
      const response = await window.api.request<User & { theme?: Theme }>(`/v1/users/${window.currentUser.id}`, {
        method: 'GET'
      });
      const userData = response.data;
      if (userData && userData.theme) {
        // Cache it in Chrome storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ theme: userData.theme, userTheme: userData.theme });
        }
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('theme', userData.theme);
        }
        return userData.theme;
      }
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
    
    }
  }
  
  // Fallback to DOM
  if (typeof document !== 'undefined') {
    const domTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
    if (domTheme && ['light', 'dark', 'auto'].includes(domTheme)) {
      return domTheme as Theme;
    }
  }
  
  return 'light';
}

// ROOT CAUSE FIX: Sync Chrome storage with database on load
export async function syncStorageWithDatabase(): Promise<void> {
  Logger.debug('🔄 SYNC: Syncing Chrome storage with database...', null, 'storage');
  
  if (!window.currentUser || !window.currentUser.id || !window.api) {
    Logger.warn('⚠️ SYNC: Cannot sync - missing user or API', null, 'storage');
    return;
  }
  
  try {
    // Fetch user data from database
    const userResponse = await window.api.request<User>(`/v1/users/${window.currentUser.id}`, {
      method: 'GET'
    });
    const userData = userResponse.data;
    
    const availabilityResponse = await window.api.request<{ availability?: AvailabilityStatus }>('/v1/presence/availability', {
      method: 'GET'
    });
    const availabilityData = availabilityResponse.data;
    
    // Sync aura color
    if (userData && userData.auraColor) {
      const dbAuraColor = userData.auraColor;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const storageResult = await new Promise<ChromeStorageResult>((resolve) => {
          chrome.storage.local.get(['userAuraColor', 'auraColor'], (result) => {
            resolve(result as ChromeStorageResult);
          });
        });
        
        const chromeAuraColor = storageResult.userAuraColor || storageResult.auraColor;
        
        // If Chrome storage has different value, update it to match database
        if (chromeAuraColor && chromeAuraColor !== dbAuraColor) {
          Logger.debug(`🔄 SYNC: Updating Chrome storage aura color from ${chromeAuraColor} to ${dbAuraColor}`, null, 'storage');
          chrome.storage.local.set({ userAuraColor: dbAuraColor, auraColor: dbAuraColor });
        } else if (!chromeAuraColor) {
          // If Chrome storage is empty, populate it from database
          Logger.debug(`🔄 SYNC: Populating Chrome storage aura color from database: ${dbAuraColor}`, null, 'storage');
          chrome.storage.local.set({ userAuraColor: dbAuraColor, auraColor: dbAuraColor });
        }
        
        // Update stateManager currentUser (TypeScript migration)
        const currentUserForAura = stateManagerInstance.getState('currentUser') as User | null;
        if (currentUserForAura) {
          const updatedUser = { ...currentUserForAura, auraColor: dbAuraColor };
          stateManagerInstance.setState('currentUser', updatedUser);
        }
        // Backward compatibility: Update window.currentUser if it exists
        if (typeof window !== 'undefined' && (window as { currentUser?: User }).currentUser) {
          (window as { currentUser: User }).currentUser.auraColor = dbAuraColor;
        }
      }
    }
    
    // Sync availability
    if (availabilityData && availabilityData.availability) {
      const dbAvailability = availabilityData.availability;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const storageResult = await new Promise<ChromeStorageResult>((resolve) => {
          chrome.storage.local.get(['userAvailability', 'availability', 'globalAvailability'], (result) => {
            resolve(result as ChromeStorageResult);
          });
        });
        
        const chromeAvailability = storageResult.userAvailability || storageResult.availability || storageResult.globalAvailability;
        
        // If Chrome storage has different value, update it to match database
        if (chromeAvailability && chromeAvailability !== dbAvailability) {
          Logger.debug(`🔄 SYNC: Updating Chrome storage availability from ${chromeAvailability} to ${dbAvailability}`, null, 'storage');
          chrome.storage.local.set({ 
            userAvailability: dbAvailability, 
            availability: dbAvailability, 
            globalAvailability: dbAvailability 
          });
        } else if (!chromeAvailability) {
          // If Chrome storage is empty, populate it from database
          Logger.debug(`🔄 SYNC: Populating Chrome storage availability from database: ${dbAvailability}`, null, 'storage');
          chrome.storage.local.set({ 
            userAvailability: dbAvailability, 
            availability: dbAvailability, 
            globalAvailability: dbAvailability 
          });
        }
        
        // Update window.currentUser
        if (window.currentUser) {
          window.currentUser.availability = dbAvailability;
          // Note: globalAvailability is a legacy alias, handled via UserPreferencesManager
          Logger.debug(`🔄 SYNC: Updated window.currentUser.availability to ${dbAvailability}`, null, 'storage');
        }
        
        // ROOT CAUSE FIX: Also update visibility cache if it exists
        if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
          const currentUserInVisibility = window.currentVisibilityDataUnfiltered.active.find(u => 
            String(u.id || u.userId) === String(window.currentUser?.id)
          );
          if (currentUserInVisibility) {
            currentUserInVisibility.availability = dbAvailability;
            Logger.debug(`🔄 SYNC: Updated visibility cache availability to ${dbAvailability}`, null, 'storage');
          }
        }
        
        // ROOT CAUSE FIX: Refresh profile avatar if it exists
        if (window.profileManager) {
          // Use profileManager instance directly
          const profileManagerInstance = window.profileManager;
          if (profileManagerInstance && typeof profileManagerInstance.updateUserAvatar === 'function') {
            try {
              await profileManagerInstance.updateUserAvatar();
              Logger.debug('✅ SYNC: Profile avatar refreshed after availability sync', null, 'storage');
            } catch (error: unknown) {
              handleError(error, {
            log: true,
            logLevel: 'warn',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
            
    }
          }
        }
      }
    }
    
    // Sync theme
    const userDataWithTheme = userData as (User & { theme?: Theme }) | undefined;
    if (userDataWithTheme && userDataWithTheme.theme) {
      const dbTheme = userDataWithTheme.theme;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const storageResult = await new Promise<ChromeStorageResult>((resolve) => {
          chrome.storage.local.get(['theme', 'userTheme'], (result) => {
            resolve(result as ChromeStorageResult);
          });
        });
        
        const chromeTheme = storageResult.theme || storageResult.userTheme;
        
        // If Chrome storage has different value, update it to match database
        if (chromeTheme && chromeTheme !== dbTheme) {
          Logger.debug(`🔄 SYNC: Updating Chrome storage theme from ${chromeTheme} to ${dbTheme}`, null, 'storage');
          chrome.storage.local.set({ theme: dbTheme, userTheme: dbTheme });
        } else if (!chromeTheme) {
          // If Chrome storage is empty, populate it from database
          Logger.debug(`🔄 SYNC: Populating Chrome storage theme from database: ${dbTheme}`, null, 'storage');
          chrome.storage.local.set({ theme: dbTheme, userTheme: dbTheme });
        }
        
        // Update window.currentUser
        if (window.currentUser) {
          const userWithTheme = window.currentUser as User & { theme?: Theme };
          userWithTheme.theme = dbTheme;
        }
      }
    }
    
    Logger.debug('✅ SYNC: Chrome storage synced with database', null, 'storage');
  } catch (error: unknown) {
    handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'UnifiedStorageSync'
            }
        });;
  
    }
}

// Auto-sync when user is available (only in browser context)
if (typeof window !== 'undefined') {
  Logger.debug('🔄 UNIFIED_STORAGE_SYNC: Loading unified storage sync functions...', null, 'storage');
  
  // Export functions to window for backward compatibility
  ((window as unknown) as Window & { getCurrentUserAuraColor?: () => Promise<string> }).getCurrentUserAuraColor = getCurrentUserAuraColor;
  ((window as unknown) as Window & { updateAuraColorEverywhere?: (color: string) => Promise<boolean> }).updateAuraColorEverywhere = updateAuraColorEverywhere;
  ((window as unknown) as Window & { getCurrentUserAvailability?: () => Promise<'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE'> }).getCurrentUserAvailability = getCurrentUserAvailability;
  ((window as unknown) as Window & { updateAvailabilityEverywhere?: (availability: 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE') => Promise<boolean> }).updateAvailabilityEverywhere = updateAvailabilityEverywhere;
  ((window as unknown) as Window & { getCurrentUserTheme?: () => Promise<'light' | 'dark' | 'auto'> }).getCurrentUserTheme = getCurrentUserTheme;
  // Type assertion needed due to index signature causing intersection type conflict
  Object.assign(window, { updateThemeEverywhere });
  ((window as unknown) as Window & { syncStorageWithDatabase?: () => Promise<void> }).syncStorageWithDatabase = syncStorageWithDatabase;
  
  Logger.debug('✅ UNIFIED_STORAGE_SYNC: Functions exported to window', null, 'storage');
  
  // Auto-sync when user is available
  if (window.currentUser && window.currentUser.id) {
    syncStorageWithDatabase();
  } else {
    // Wait for user to be available
    const checkUser = setInterval(() => {
      if (window.currentUser && window.currentUser.id) {
        clearInterval(checkUser);
        syncStorageWithDatabase();
      }
    }, 500);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkUser);
    }, 10000);
  }
}

