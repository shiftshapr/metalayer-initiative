/**
 * UNIFIED STORAGE SYNC - Early Loading Module
 *
 * This module ensures all unified storage sync functions are available
 * immediately, even before ProfileManager.js fully loads.
 *
 * Functions are defined here and then re-exported by ProfileManager.js
 * to ensure they're always available.
 */
import { Logger } from './Logger.js';
import { handleError } from './ErrorHandler.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { apiServiceInstance } from '../services/APIService.js';
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
// ROOT CAUSE FIX: Unified function to update aura color in BOTH Chrome storage AND database
export async function updateAuraColorEverywhere(color) {
    Logger.debug('🔄 AURA_UPDATE: Updating aura color everywhere:', color, 'storage');
    if (!color || !color.startsWith('#')) {
        Logger.error('❌ AURA_UPDATE: Invalid color format:', color, 'storage');
        return false;
    }
    try {
        // Step 1: Update Chrome storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await new Promise((resolve, reject) => {
                chrome.storage.local.set({ userAuraColor: color, auraColor: color }, () => {
                    if (chrome.runtime.lastError) {
                        Logger.error('❌ AURA_UPDATE: Error saving to Chrome storage:', chrome.runtime.lastError, 'storage');
                        reject(chrome.runtime.lastError);
                    }
                    else {
                        Logger.debug('✅ AURA_UPDATE: Saved to Chrome storage:', color, 'storage');
                        resolve();
                    }
                });
            });
        }
        // Step 2: Update database via API (TypeScript migration - use module imports)
        // ES6 pattern: Get from stateManager instead of window
        let currentUser = stateManagerInstance.getState('currentUser');
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
                }
                else {
                    Logger.error('❌ AURA_UPDATE: Database update returned no result', null, 'storage');
                }
            }
            catch (error) {
                handleError(error, {
                    log: true,
                    logLevel: 'error',
                    context: {
                        operation: 'catch',
                        component: 'UnifiedStorageSync'
                    }
                });
                ;
            }
        }
        // Step 3: Update local user object immediately
        // ES6 pattern: Update stateManager instead of window.currentUser
        // Reuse currentUser variable from Step 2
        if (!currentUser) {
            currentUser = stateManagerInstance.getState('currentUser');
        }
        if (currentUser) {
            currentUser.auraColor = color;
            stateManagerInstance.setState('currentUser', currentUser);
            Logger.debug('✅ AURA_UPDATE: Updated stateManager.currentUser', null, 'storage');
        }
        // Step 4: Update visibility cache
        // ES6 pattern: Get from stateManager instead of window
        const currentVisibilityDataUnfiltered = stateManagerInstance.getState('currentVisibilityDataUnfiltered');
        if (currentVisibilityDataUnfiltered?.active) {
            const currentUserInVisibility = currentVisibilityDataUnfiltered.active.find(u => String(u.id || u.userId) === String(currentUser?.id));
            if (currentUserInVisibility) {
                currentUserInVisibility.auraColor = color;
                stateManagerInstance.setState('currentVisibilityDataUnfiltered', currentVisibilityDataUnfiltered);
            }
        }
        // Step 5: Trigger real-time update and avatar refresh
        // ES6 pattern: Dispatch DOM event instead of calling window function
        if (currentUser?.id) {
            window.dispatchEvent(new CustomEvent('handleAuraChange', {
                detail: { userId: currentUser.id, auraColor: color, source: 'UnifiedStorageSync' }
            }));
            // Optional: Try direct call if available (graceful degradation)
            const win = window;
            if (typeof win.handleAuraChange === 'function') {
                win.handleAuraChange({
                    userId: currentUser.id,
                    auraColor: color
                });
            }
        }
        // Step 6: Force refresh all avatars
        // ES6 pattern: Dispatch DOM events instead of calling window functions
        window.dispatchEvent(new CustomEvent('refreshAllMessageAvatars', {
            detail: { source: 'UnifiedStorageSync' }
        }));
        window.dispatchEvent(new CustomEvent('refreshVisibilityAvatars', {
            detail: { source: 'UnifiedStorageSync' }
        }));
        // Optional: Try direct calls if available (graceful degradation)
        const win2 = window;
        if (typeof win2.refreshAllMessageAvatars === 'function') {
            await win2.refreshAllMessageAvatars();
        }
        if (typeof win2.refreshVisibilityAvatars === 'function') {
            await win2.refreshVisibilityAvatars();
        }
        return true;
    }
    catch (error) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
                component: 'UnifiedStorageSync'
            }
        });
        ;
        return false;
    }
}
// ROOT CAUSE FIX: Get current user's aura color (Chrome storage first, then database fallback)
export async function getCurrentUserAuraColor() {
    // Check Chrome storage FIRST
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
            const storageResult = await new Promise((resolve) => {
                chrome.storage.local.get(['userAuraColor', 'auraColor'], (result) => {
                    resolve(result);
                });
            });
            const cachedAuraColor = storageResult.userAuraColor || storageResult.auraColor;
            // ES6 pattern: Use imported constant instead of window
            const fallbackColor = AVATAR_FALLBACK_COLOR;
            if (cachedAuraColor && cachedAuraColor !== '#ffffff' && cachedAuraColor !== 'ffffff' && cachedAuraColor !== fallbackColor) {
                Logger.debug(`✅ AURA_GET: Found aura color in Chrome storage: ${cachedAuraColor}`, null, 'storage');
                return cachedAuraColor;
            }
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'warn',
                context: {
                    operation: 'catch',
                    component: 'UnifiedStorageSync'
                }
            });
            ;
        }
    }
    // Fallback to database
    // ES6 pattern: Use imported constant and stateManager instead of window
    const fallbackColor = AVATAR_FALLBACK_COLOR;
    const currentUser = stateManagerInstance.getState('currentUser');
    if (currentUser && currentUser.auraColor && currentUser.auraColor !== fallbackColor) {
        return currentUser.auraColor;
    }
    // Check stateManager currentUser.auraColor (TypeScript migration - already checked above)
    if (currentUser?.auraColor && currentUser.auraColor !== fallbackColor) {
        return currentUser.auraColor;
    }
    // Try to fetch from database via API (TypeScript migration - use module imports)
    if (currentUser?.id && apiServiceInstance) {
        try {
            const response = await apiServiceInstance.request(`/v1/users/${currentUser.id}`, {
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
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'warn',
                context: {
                    operation: 'catch',
                    component: 'UnifiedStorageSync'
                }
            });
            ;
        }
    }
    return fallbackColor;
}
// ROOT CAUSE FIX: Unified function to update availability status in BOTH Chrome storage AND database
export async function updateAvailabilityEverywhere(availability) {
    Logger.debug('🔄 STATUS_UPDATE: Updating availability everywhere:', availability, 'storage');
    if (!availability || !['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(availability)) {
        Logger.error('❌ STATUS_UPDATE: Invalid availability:', availability, 'storage');
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
                        Logger.error('❌ STATUS_UPDATE: Error saving to Chrome storage:', chrome.runtime.lastError, 'storage');
                        reject(chrome.runtime.lastError);
                    }
                    else {
                        Logger.debug('✅ STATUS_UPDATE: Saved to Chrome storage:', availability, 'storage');
                        resolve();
                    }
                });
            });
        }
        // Step 2: Update database via API
        // ES6 pattern: Use stateManager and apiServiceInstance instead of window
        const currentUser = stateManagerInstance.getState('currentUser');
        if (currentUser && currentUser.id && apiServiceInstance) {
            try {
                const result = await apiServiceInstance.request('/v1/presence/availability', {
                    method: 'POST',
                    body: JSON.stringify({
                        availability: availability,
                        isGlobal: true
                    })
                });
                if (result) {
                    Logger.debug('✅ STATUS_UPDATE: Saved to database:', availability, 'storage');
                }
            }
            catch (error) {
                handleError(error, {
                    log: true,
                    logLevel: 'error',
                    context: {
                        operation: 'catch',
                        component: 'UnifiedStorageSync'
                    }
                });
                ;
            }
        }
        // Step 3: Update local user object immediately
        // ES6 pattern: Update stateManager instead of window.currentUser
        if (currentUser) {
            currentUser.availability = availability;
            stateManagerInstance.setState('currentUser', currentUser);
            // Note: globalAvailability is a legacy alias, handled via UserPreferencesManager
            Logger.debug('✅ STATUS_UPDATE: Updated stateManager.currentUser', null, 'storage');
        }
        // Step 4: Update visibility cache
        // ES6 pattern: Get from stateManager instead of window
        const currentVisibilityDataUnfiltered = stateManagerInstance.getState('currentVisibilityDataUnfiltered');
        if (currentVisibilityDataUnfiltered?.active) {
            const currentUserInVisibility = currentVisibilityDataUnfiltered.active.find(u => String(u.id || u.userId) === String(currentUser?.id));
            if (currentUserInVisibility) {
                currentUserInVisibility.availability = availability;
                stateManagerInstance.setState('currentVisibilityDataUnfiltered', currentVisibilityDataUnfiltered);
            }
        }
        // Step 5: Force refresh all avatars
        // ES6 pattern: Dispatch DOM events instead of calling window functions
        window.dispatchEvent(new CustomEvent('refreshAllMessageAvatars', {
            detail: { source: 'UnifiedStorageSync' }
        }));
        window.dispatchEvent(new CustomEvent('refreshVisibilityAvatars', {
            detail: { source: 'UnifiedStorageSync' }
        }));
        // Optional: Try direct calls if available (graceful degradation)
        const win = window;
        if (typeof win.refreshAllMessageAvatars === 'function') {
            await win.refreshAllMessageAvatars();
        }
        if (typeof win.refreshVisibilityAvatars === 'function') {
            await win.refreshVisibilityAvatars();
        }
        // ROOT CAUSE FIX: Also refresh profile avatar when availability changes
        // ES6 pattern: Dispatch DOM event instead of calling window function
        window.dispatchEvent(new CustomEvent('updateUserAvatar', {
            detail: { source: 'UnifiedStorageSync' }
        }));
        // Optional: Try direct call if available (graceful degradation - reuse win variable)
        const profileManagerInstance = win.profileManager;
        if (profileManagerInstance && typeof profileManagerInstance.updateUserAvatar === 'function') {
            try {
                await profileManagerInstance.updateUserAvatar();
                Logger.debug('✅ STATUS_UPDATE: Profile avatar refreshed', null, 'storage');
            }
            catch (error) {
                handleError(error, {
                    log: true,
                    logLevel: 'warn',
                    context: {
                        operation: 'catch',
                        component: 'UnifiedStorageSync'
                    }
                });
                ;
            }
        }
        else if (win.profileManager && typeof win.profileManager.updateUserAvatar === 'function') {
            // Use instance method
            try {
                await win.profileManager.updateUserAvatar();
                Logger.debug('✅ STATUS_UPDATE: Profile avatar refreshed (static method)', null, 'storage');
            }
            catch (error) {
                handleError(error, {
                    log: true,
                    logLevel: 'warn',
                    context: {
                        operation: 'catch',
                        component: 'UnifiedStorageSync'
                    }
                });
                ;
            }
        }
        return true;
    }
    catch (error) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
                component: 'UnifiedStorageSync'
            }
        });
        ;
        return false;
    }
}
// ROOT CAUSE FIX: Get current user's availability (Chrome storage first, then database fallback)
export async function getCurrentUserAvailability() {
    // Check Chrome storage FIRST
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
            const storageResult = await new Promise((resolve) => {
                chrome.storage.local.get(['userAvailability', 'availability', 'globalAvailability'], (result) => {
                    resolve(result);
                });
            });
            const cachedAvailability = storageResult.userAvailability || storageResult.availability || storageResult.globalAvailability;
            if (cachedAvailability && ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(cachedAvailability)) {
                Logger.debug(`✅ STATUS_GET: Found availability in Chrome storage: ${cachedAvailability}`, null, 'storage');
                return cachedAvailability;
            }
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'warn',
                context: {
                    operation: 'catch',
                    component: 'UnifiedStorageSync'
                }
            });
            ;
        }
    }
    // Fallback to stateManager (TypeScript migration)
    const currentUser = stateManagerInstance.getState('currentUser');
    if (currentUser?.availability && ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(currentUser.availability)) {
        return currentUser.availability;
    }
    // Try to fetch from database via API (TypeScript migration - use module imports)
    if (currentUser?.id && apiServiceInstance) {
        try {
            const statusData = await apiServiceInstance.request('/v1/presence/availability', {
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
                    const updatedUser = { ...currentUser, availability: availability };
                    stateManagerInstance.setState('currentUser', updatedUser);
                    // Note: globalAvailability is a legacy alias, handled via UserPreferencesManager
                    // ES6 pattern: No window.currentUser assignment - use stateManager only
                }
                return availability;
            }
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'warn',
                context: {
                    operation: 'catch',
                    component: 'UnifiedStorageSync'
                }
            });
            ;
        }
    }
    return 'AVAILABLE';
}
// ROOT CAUSE FIX: Unified function to update theme in BOTH Chrome storage AND database
export async function updateThemeEverywhere(theme) {
    Logger.debug('🔄 THEME_UPDATE: Updating theme everywhere:', theme, 'storage');
    if (!theme || !['light', 'dark', 'auto'].includes(theme)) {
        Logger.error('❌ THEME_UPDATE: Invalid theme:', theme, 'storage');
        return false;
    }
    try {
        // Step 1: Update Chrome storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await new Promise((resolve, reject) => {
                chrome.storage.local.set({ theme: theme, userTheme: theme }, () => {
                    if (chrome.runtime.lastError) {
                        Logger.error('❌ THEME_UPDATE: Error saving to Chrome storage:', chrome.runtime.lastError, 'storage');
                        reject(chrome.runtime.lastError);
                    }
                    else {
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
        // ES6 pattern: Use stateManager and apiServiceInstance instead of window
        const currentUser = stateManagerInstance.getState('currentUser');
        if (currentUser && currentUser.id && apiServiceInstance) {
            try {
                const result = await apiServiceInstance.request(`/v1/users/${currentUser.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        theme: theme
                    })
                });
                if (result) {
                    Logger.debug('✅ THEME_UPDATE: Saved to database:', theme, 'storage');
                }
            }
            catch (error) {
                handleError(error, {
                    log: true,
                    logLevel: 'error',
                    context: {
                        operation: 'catch',
                        component: 'UnifiedStorageSync'
                    }
                });
                ;
            }
        }
        // Step 5: Update local user object
        // ES6 pattern: Update stateManager instead of window.currentUser
        if (currentUser) {
            // Note: theme is handled via UserPreferencesManager, but we can set it here for backward compatibility
            // The User interface already supports theme via index signature
            const userWithTheme = currentUser;
            userWithTheme.theme = theme;
            stateManagerInstance.setState('currentUser', userWithTheme);
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
            const themeSelect = document.getElementById('theme-select');
            if (themeSelect) {
                themeSelect.value = theme;
            }
        }
        return true;
    }
    catch (error) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
                component: 'UnifiedStorageSync'
            }
        });
        ;
        return false;
    }
}
// ROOT CAUSE FIX: Get current user's theme (Chrome storage first, then database fallback)
export async function getCurrentUserTheme() {
    // Check Chrome storage FIRST
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
            const storageResult = await new Promise((resolve) => {
                chrome.storage.local.get(['theme', 'userTheme'], (result) => {
                    resolve(result);
                });
            });
            const cachedTheme = storageResult.theme || storageResult.userTheme;
            if (cachedTheme && ['light', 'dark', 'auto'].includes(cachedTheme)) {
                Logger.debug(`✅ THEME_GET: Found theme in Chrome storage: ${cachedTheme}`, null, 'storage');
                return cachedTheme;
            }
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'warn',
                context: {
                    operation: 'catch',
                    component: 'UnifiedStorageSync'
                }
            });
            ;
        }
    }
    // Fallback to localStorage
    if (typeof localStorage !== 'undefined') {
        const localStorageTheme = localStorage.getItem('theme');
        if (localStorageTheme && ['light', 'dark', 'auto'].includes(localStorageTheme)) {
            return localStorageTheme;
        }
    }
    // Fallback to currentUser from stateManager
    const userWithTheme = stateManagerInstance.getState('currentUser');
    if (userWithTheme?.theme) {
        return userWithTheme.theme;
    }
    // Try to fetch from database via API
    // ES6 pattern: Use stateManager and apiServiceInstance instead of window
    const currentUser = stateManagerInstance.getState('currentUser');
    if (currentUser && currentUser.id && apiServiceInstance) {
        try {
            const response = await apiServiceInstance.request(`/v1/users/${currentUser.id}`, {
                method: 'GET'
            });
            const userData = response?.data;
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
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'warn',
                context: {
                    operation: 'catch',
                    component: 'UnifiedStorageSync'
                }
            });
            ;
        }
    }
    // Fallback to DOM
    if (typeof document !== 'undefined') {
        const domTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme');
        if (domTheme && ['light', 'dark', 'auto'].includes(domTheme)) {
            return domTheme;
        }
    }
    return 'light';
}
// ROOT CAUSE FIX: Sync Chrome storage with database on load
export async function syncStorageWithDatabase() {
    Logger.debug('🔄 SYNC: Syncing Chrome storage with database...', null, 'storage');
    // ES6 pattern: Use stateManager and apiServiceInstance instead of window
    const currentUser = stateManagerInstance.getState('currentUser');
    if (!currentUser || !currentUser.id || !apiServiceInstance) {
        Logger.warn('⚠️ SYNC: Cannot sync - missing user or API', null, 'storage');
        return;
    }
    try {
        // Fetch user data from database
        const userResponse = await apiServiceInstance.request(`/v1/users/${currentUser.id}`, {
            method: 'GET'
        });
        const userData = userResponse?.data;
        const availabilityResponse = await apiServiceInstance.request('/v1/presence/availability', {
            method: 'GET'
        });
        const availabilityData = availabilityResponse?.data;
        // Sync aura color
        if (userData && userData.auraColor) {
            const dbAuraColor = userData.auraColor;
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                const storageResult = await new Promise((resolve) => {
                    chrome.storage.local.get(['userAuraColor', 'auraColor'], (result) => {
                        resolve(result);
                    });
                });
                const chromeAuraColor = storageResult.userAuraColor || storageResult.auraColor;
                // If Chrome storage has different value, update it to match database
                if (chromeAuraColor && chromeAuraColor !== dbAuraColor) {
                    Logger.debug(`🔄 SYNC: Updating Chrome storage aura color from ${chromeAuraColor} to ${dbAuraColor}`, null, 'storage');
                    chrome.storage.local.set({ userAuraColor: dbAuraColor, auraColor: dbAuraColor });
                }
                else if (!chromeAuraColor) {
                    // If Chrome storage is empty, populate it from database
                    Logger.debug(`🔄 SYNC: Populating Chrome storage aura color from database: ${dbAuraColor}`, null, 'storage');
                    chrome.storage.local.set({ userAuraColor: dbAuraColor, auraColor: dbAuraColor });
                }
                // Update stateManager currentUser (TypeScript migration)
                const currentUserForAura = stateManagerInstance.getState('currentUser');
                if (currentUserForAura) {
                    const updatedUser = { ...currentUserForAura, auraColor: dbAuraColor };
                    stateManagerInstance.setState('currentUser', updatedUser);
                }
                // ES6 pattern: No window.currentUser assignment - use stateManager only
            }
        }
        // Sync availability
        if (availabilityData && availabilityData.availability) {
            const dbAvailability = availabilityData.availability;
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                const storageResult = await new Promise((resolve) => {
                    chrome.storage.local.get(['userAvailability', 'availability', 'globalAvailability'], (result) => {
                        resolve(result);
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
                }
                else if (!chromeAvailability) {
                    // If Chrome storage is empty, populate it from database
                    Logger.debug(`🔄 SYNC: Populating Chrome storage availability from database: ${dbAvailability}`, null, 'storage');
                    chrome.storage.local.set({
                        userAvailability: dbAvailability,
                        availability: dbAvailability,
                        globalAvailability: dbAvailability
                    });
                }
                // ES6 pattern: Update stateManager (no window.currentUser assignment)
                const currentUser = stateManagerInstance.getState('currentUser');
                if (currentUser) {
                    const updatedUser = { ...currentUser, availability: dbAvailability };
                    stateManagerInstance.setState('currentUser', updatedUser);
                    Logger.debug(`🔄 SYNC: Updated stateManager currentUser.availability to ${dbAvailability}`, null, 'storage');
                }
                // ROOT CAUSE FIX: Also update visibility cache if it exists
                // ES6 pattern: Use DOM event to notify visibility system
                const visibilityData = stateManagerInstance.getState('currentVisibilityDataUnfiltered');
                if (visibilityData?.active) {
                    const currentUser = stateManagerInstance.getState('currentUser');
                    if (currentUser?.id) {
                        const currentUserInVisibility = visibilityData.active.find(u => String(u.id || u.userId) === String(currentUser.id));
                        if (currentUserInVisibility) {
                            currentUserInVisibility.availability = dbAvailability;
                            Logger.debug(`🔄 SYNC: Updated visibility cache availability to ${dbAvailability}`, null, 'storage');
                        }
                    }
                }
                // ROOT CAUSE FIX: Refresh profile avatar if it exists
                // ES6 pattern: Dispatch DOM event for profile manager
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('profileAvatarUpdateRequested', {
                        detail: { reason: 'availabilitySync' }
                    }));
                    Logger.debug('✅ SYNC: Dispatched profile avatar update event', null, 'storage');
                }
                // Optional: Try direct call if available (graceful degradation)
                // Note: ProfileManager.updateUserAvatar is an instance method, so we dispatch event instead
            }
        }
        // Sync theme
        if (userData) {
            const userDataWithTheme = userData;
            if (userDataWithTheme && userDataWithTheme.theme) {
                const dbTheme = userDataWithTheme.theme;
                if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    const storageResult = await new Promise((resolve) => {
                        chrome.storage.local.get(['theme', 'userTheme'], (result) => {
                            resolve(result);
                        });
                    });
                    const chromeTheme = storageResult.theme || storageResult.userTheme;
                    // If Chrome storage has different value, update it to match database
                    if (chromeTheme && chromeTheme !== dbTheme) {
                        Logger.debug(`🔄 SYNC: Updating Chrome storage theme from ${chromeTheme} to ${dbTheme}`, null, 'storage');
                        chrome.storage.local.set({ theme: dbTheme, userTheme: dbTheme });
                    }
                    else if (!chromeTheme) {
                        // If Chrome storage is empty, populate it from database
                        Logger.debug(`🔄 SYNC: Populating Chrome storage theme from database: ${dbTheme}`, null, 'storage');
                        chrome.storage.local.set({ theme: dbTheme, userTheme: dbTheme });
                    }
                    // ES6 pattern: Update stateManager (no window.currentUser assignment)
                    const currentUser = stateManagerInstance.getState('currentUser');
                    if (currentUser) {
                        const updatedUser = { ...currentUser, theme: dbTheme };
                        stateManagerInstance.setState('currentUser', updatedUser);
                    }
                }
            }
        }
        Logger.debug('✅ SYNC: Chrome storage synced with database', null, 'storage');
    }
    catch (error) {
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
                component: 'UnifiedStorageSync'
            }
        });
    }
}
// Auto-sync when user is available (only in browser context)
if (typeof window !== 'undefined') {
    Logger.debug('🔄 UNIFIED_STORAGE_SYNC: Loading unified storage sync functions...', null, 'storage');
    // ES6 pattern: Functions are exported via ES6 module exports only
    // No window assignments - functions should be imported where needed
    // Functions available: getCurrentUserAuraColor, updateAuraColorEverywhere, getCurrentUserAvailability,
    // updateAvailabilityEverywhere, getCurrentUserTheme, updateThemeEverywhere, syncStorageWithDatabase
    Logger.debug('✅ UNIFIED_STORAGE_SYNC: Functions available via ES6 imports', null, 'storage');
    // Auto-sync when user is available
    const currentUser = stateManagerInstance.getState('currentUser');
    if (currentUser && currentUser.id) {
        syncStorageWithDatabase();
    }
    else {
        // Wait for user to be available via stateManager
        const checkUser = setInterval(() => {
            const currentUser = stateManagerInstance.getState('currentUser');
            if (currentUser && currentUser.id) {
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
