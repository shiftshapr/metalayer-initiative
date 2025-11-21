/**
 * UNIFIED STORAGE SYNC - Early Loading Module
 * 
 * This module ensures all unified storage sync functions are available
 * immediately, even before ProfileManager.js fully loads.
 * 
 * Functions are defined here and then re-exported by ProfileManager.js
 * to ensure they're always available.
 */

import type { User } from '../types/index.js';

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
  request: (url: string, options?: ApiRequestOptions) => Promise<any>;
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
  console.log('🔄 AURA_UPDATE: Updating aura color everywhere:', color);
  
  if (!color || !color.startsWith('#')) {
    console.error('❌ AURA_UPDATE: Invalid color format:', color);
    return false;
  }
  
  try {
    // Step 1: Update Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await new Promise<void>((resolve, reject) => {
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
      }
    }
    
    // Step 3: Update local user object immediately
    if (window.currentUser) {
      window.currentUser.auraColor = color;
      console.log('✅ AURA_UPDATE: Updated window.currentUser');
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
  } catch (error) {
    console.error('❌ AURA_UPDATE: Error updating aura color:', error);
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
        console.log(`✅ AURA_GET: Found aura color in Chrome storage: ${cachedAuraColor}`);
        return cachedAuraColor;
      }
    } catch (error) {
      console.warn('⚠️ AURA_GET: Error reading Chrome storage:', error);
    }
  }
  
  // Fallback to database
  const fallbackColor = window.AVATAR_FALLBACK_COLOR || '#ffffff';
  if (window.currentUser && window.currentUser.auraColor && window.currentUser.auraColor !== fallbackColor) {
    return window.currentUser.auraColor;
  }
  
  // Check window.currentUser.auraColor (camelCase only)
  if (window.currentUser?.auraColor && window.currentUser.auraColor !== fallbackColor) {
    return window.currentUser.auraColor;
  }
  
  // Try to fetch from database via API
  if (window.currentUser && window.currentUser.id && window.api && typeof window.api.request === 'function') {
    try {
      const userData = await window.api.request(`/v1/users/${window.currentUser.id}`, {
        method: 'GET'
      });
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
    } catch (error) {
      console.warn('⚠️ AURA_GET: Error fetching from database:', error);
    }
  }
  
  return fallbackColor;
}

// ROOT CAUSE FIX: Unified function to update availability status in BOTH Chrome storage AND database
export async function updateAvailabilityEverywhere(availability: AvailabilityStatus): Promise<boolean> {
  console.log('🔄 STATUS_UPDATE: Updating availability everywhere:', availability);
  
  if (!availability || !['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(availability)) {
    console.error('❌ STATUS_UPDATE: Invalid availability:', availability);
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
        }
      } catch (error) {
        console.error('❌ STATUS_UPDATE: Error saving to database:', error);
      }
    }
    
    // Step 3: Update local user object immediately
    if (window.currentUser) {
      window.currentUser.availability = availability;
      (window.currentUser as any).globalAvailability = availability;
      console.log('✅ STATUS_UPDATE: Updated window.currentUser');
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
    const profileManagerInstance = window.profileManager || (window.ProfileManager && window.ProfileManager.instance);
    if (profileManagerInstance && typeof profileManagerInstance.updateUserAvatar === 'function') {
      try {
        await profileManagerInstance.updateUserAvatar();
        console.log('✅ STATUS_UPDATE: Profile avatar refreshed');
      } catch (error) {
        console.warn('⚠️ STATUS_UPDATE: Error refreshing profile avatar:', error);
      }
    } else if (window.ProfileManager && typeof window.ProfileManager.updateUserAvatar === 'function') {
      // Fallback: try static method
      try {
        await window.ProfileManager.updateUserAvatar();
        console.log('✅ STATUS_UPDATE: Profile avatar refreshed (static method)');
      } catch (error) {
        console.warn('⚠️ STATUS_UPDATE: Error refreshing profile avatar:', error);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ STATUS_UPDATE: Error updating availability:', error);
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
        console.log(`✅ STATUS_GET: Found availability in Chrome storage: ${cachedAvailability}`);
        return cachedAvailability as AvailabilityStatus;
      }
    } catch (error) {
      console.warn('⚠️ STATUS_GET: Error reading Chrome storage:', error);
    }
  }
  
  // Fallback to database
  if (window.currentUser) {
    const userAvailability = window.currentUser.availability || (window.currentUser as any).globalAvailability;
    if (userAvailability && ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(userAvailability as AvailabilityStatus)) {
      return userAvailability as AvailabilityStatus;
    }
  }
  
  // Try to fetch from database via API
  if (window.currentUser && window.currentUser.id && window.api && typeof window.api.request === 'function') {
    try {
      const statusData = await window.api.request('/v1/presence/availability', {
        method: 'GET'
      });
      if (statusData && statusData.availability) {
        // Cache it in Chrome storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ 
            userAvailability: statusData.availability, 
            availability: statusData.availability, 
            globalAvailability: statusData.availability 
          });
        }
        // Update window.currentUser
        if (window.currentUser) {
          window.currentUser.availability = statusData.availability;
          (window.currentUser as any).globalAvailability = statusData.availability;
        }
        return statusData.availability as AvailabilityStatus;
      }
    } catch (error) {
      console.warn('⚠️ STATUS_GET: Error fetching from database:', error);
    }
  }
  
  return 'AVAILABLE';
}

// ROOT CAUSE FIX: Unified function to update theme in BOTH Chrome storage AND database
export async function updateThemeEverywhere(theme: Theme): Promise<boolean> {
  console.log('🔄 THEME_UPDATE: Updating theme everywhere:', theme);
  
  if (!theme || !['light', 'dark', 'auto'].includes(theme)) {
    console.error('❌ THEME_UPDATE: Invalid theme:', theme);
    return false;
  }
  
  try {
    // Step 1: Update Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await new Promise<void>((resolve, reject) => {
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
          console.log('✅ THEME_UPDATE: Saved to database:', theme);
        }
      } catch (error) {
        console.error('❌ THEME_UPDATE: Error saving to database:', error);
      }
    }
    
    // Step 5: Update local user object
    if (window.currentUser) {
      (window.currentUser as any).theme = theme;
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
  } catch (error) {
    console.error('❌ THEME_UPDATE: Error updating theme:', error);
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
        console.log(`✅ THEME_GET: Found theme in Chrome storage: ${cachedTheme}`);
        return cachedTheme as Theme;
      }
    } catch (error) {
      console.warn('⚠️ THEME_GET: Error reading Chrome storage:', error);
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
  if (window.currentUser && (window.currentUser as any).theme) {
    return (window.currentUser as any).theme as Theme;
  }
  
  // Try to fetch from database via API
  if (window.currentUser && window.currentUser.id && window.api && typeof window.api.request === 'function') {
    try {
      const userData = await window.api.request(`/v1/users/${window.currentUser.id}`, {
        method: 'GET'
      });
      if (userData && userData.theme) {
        // Cache it in Chrome storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ theme: userData.theme, userTheme: userData.theme });
        }
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('theme', userData.theme);
        }
        return userData.theme as Theme;
      }
    } catch (error) {
      console.warn('⚠️ THEME_GET: Error fetching from database:', error);
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
  console.log('🔄 SYNC: Syncing Chrome storage with database...');
  
  if (!window.currentUser || !window.currentUser.id || !window.api) {
    console.warn('⚠️ SYNC: Cannot sync - missing user or API');
    return;
  }
  
  try {
    // Fetch user data from database
    const userData = await window.api.request(`/v1/users/${window.currentUser.id}`, {
      method: 'GET'
    });
    
    const availabilityData = await window.api.request('/v1/presence/availability', {
      method: 'GET'
    });
    
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
          console.log(`🔄 SYNC: Updating Chrome storage aura color from ${chromeAuraColor} to ${dbAuraColor}`);
          chrome.storage.local.set({ userAuraColor: dbAuraColor, auraColor: dbAuraColor });
        } else if (!chromeAuraColor) {
          // If Chrome storage is empty, populate it from database
          console.log(`🔄 SYNC: Populating Chrome storage aura color from database: ${dbAuraColor}`);
          chrome.storage.local.set({ userAuraColor: dbAuraColor, auraColor: dbAuraColor });
        }
        
        // Update window.currentUser
        if (window.currentUser) {
          window.currentUser.auraColor = dbAuraColor;
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
          console.log(`🔄 SYNC: Updating Chrome storage availability from ${chromeAvailability} to ${dbAvailability}`);
          chrome.storage.local.set({ 
            userAvailability: dbAvailability, 
            availability: dbAvailability, 
            globalAvailability: dbAvailability 
          });
        } else if (!chromeAvailability) {
          // If Chrome storage is empty, populate it from database
          console.log(`🔄 SYNC: Populating Chrome storage availability from database: ${dbAvailability}`);
          chrome.storage.local.set({ 
            userAvailability: dbAvailability, 
            availability: dbAvailability, 
            globalAvailability: dbAvailability 
          });
        }
        
        // Update window.currentUser
        if (window.currentUser) {
          window.currentUser.availability = dbAvailability;
          (window.currentUser as any).globalAvailability = dbAvailability;
          console.log(`🔄 SYNC: Updated window.currentUser.availability to ${dbAvailability}`);
        }
        
        // ROOT CAUSE FIX: Also update visibility cache if it exists
        if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
          const currentUserInVisibility = window.currentVisibilityDataUnfiltered.active.find(u => 
            String(u.id || u.userId) === String(window.currentUser?.id)
          );
          if (currentUserInVisibility) {
            currentUserInVisibility.availability = dbAvailability;
            console.log(`🔄 SYNC: Updated visibility cache availability to ${dbAvailability}`);
          }
        }
        
        // ROOT CAUSE FIX: Refresh profile avatar if it exists
        if (window.ProfileManager) {
          // ProfileManager is a class, need to find the instance
          // Try to get instance from window or use static method
          const profileManagerInstance = window.profileManager || window.ProfileManager.instance;
          if (profileManagerInstance && typeof profileManagerInstance.updateUserAvatar === 'function') {
            try {
              await profileManagerInstance.updateUserAvatar();
              console.log('✅ SYNC: Profile avatar refreshed after availability sync');
            } catch (error) {
              console.warn('⚠️ SYNC: Error refreshing profile avatar:', error);
            }
          }
        }
      }
    }
    
    // Sync theme
    if (userData && userData.theme) {
      const dbTheme = userData.theme;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const storageResult = await new Promise<ChromeStorageResult>((resolve) => {
          chrome.storage.local.get(['theme', 'userTheme'], (result) => {
            resolve(result as ChromeStorageResult);
          });
        });
        
        const chromeTheme = storageResult.theme || storageResult.userTheme;
        
        // If Chrome storage has different value, update it to match database
        if (chromeTheme && chromeTheme !== dbTheme) {
          console.log(`🔄 SYNC: Updating Chrome storage theme from ${chromeTheme} to ${dbTheme}`);
          chrome.storage.local.set({ theme: dbTheme, userTheme: dbTheme });
        } else if (!chromeTheme) {
          // If Chrome storage is empty, populate it from database
          console.log(`🔄 SYNC: Populating Chrome storage theme from database: ${dbTheme}`);
          chrome.storage.local.set({ theme: dbTheme, userTheme: dbTheme });
        }
        
        // Update window.currentUser
        if (window.currentUser) {
          (window.currentUser as any).theme = dbTheme;
        }
      }
    }
    
    console.log('✅ SYNC: Chrome storage synced with database');
  } catch (error) {
    console.error('❌ SYNC: Error syncing storage with database:', error);
  }
}

// Auto-sync when user is available (only in browser context)
if (typeof window !== 'undefined') {
  console.log('🔄 UNIFIED_STORAGE_SYNC: Loading unified storage sync functions...');
  
  // Export functions to window for backward compatibility
  ((window as unknown) as Window & { getCurrentUserAuraColor?: () => Promise<string> }).getCurrentUserAuraColor = getCurrentUserAuraColor;
  ((window as unknown) as Window & { updateAuraColorEverywhere?: (color: string) => Promise<boolean> }).updateAuraColorEverywhere = updateAuraColorEverywhere;
  ((window as unknown) as Window & { getCurrentUserAvailability?: () => Promise<'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE'> }).getCurrentUserAvailability = getCurrentUserAvailability;
  ((window as unknown) as Window & { updateAvailabilityEverywhere?: (availability: 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE') => Promise<boolean> }).updateAvailabilityEverywhere = updateAvailabilityEverywhere;
  ((window as unknown) as Window & { getCurrentUserTheme?: () => Promise<'light' | 'dark' | 'auto'> }).getCurrentUserTheme = getCurrentUserTheme;
  // Type assertion needed due to index signature causing intersection type conflict
  Object.assign(window, { updateThemeEverywhere });
  ((window as unknown) as Window & { syncStorageWithDatabase?: () => Promise<void> }).syncStorageWithDatabase = syncStorageWithDatabase;
  
  console.log('✅ UNIFIED_STORAGE_SYNC: Functions exported to window');
  
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

