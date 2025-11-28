/**
 * User Utilities - ES6 TypeScript Module
 * Utilities for getting current user information
 */
import { stateManagerInstance } from '../core/StateManager.js';
import { handleError } from './ErrorHandler.js';
import { Logger } from './Logger.js';
import { getCurrentUserAvatarBgColor as profileGetCurrentUserAvatarBgColor, getCurrentUserAvatarColor as profileGetCurrentUserAvatarColor } from '../features/ProfileManager.js';
/**
 * Gets the current user ID from stateManager
 * Falls back to email if no ID is available
 * @returns Promise resolving to user ID or email, or null
 */
export async function getCurrentUserId() {
    try {
        // ROOT CAUSE FIX: Use stateManager (TypeScript migration - no window.currentUser)
        const user = stateManagerInstance.getState('currentUser');
        if (user && user.id) {
            return user.id; // Use the actual user ID
        }
        else {
            // Fallback to email if no ID is stored
            const email = await getCurrentUserEmail();
            return email;
        }
    }
    catch (error) {
        const user = stateManagerInstance.getState('currentUser');
        handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'getCurrentUserId',
                component: 'UserUtils',
                userId: user?.id
            }
        });
        // Fallback to email
        const email = await getCurrentUserEmail();
        return email;
    }
}
// CRITICAL FIX: Guard to prevent multiple simultaneous calls
let isGettingCurrentUserEmail = false;
let currentUserEmailPromise = null;
/**
 * Gets the current user email from stateManager or auth
 * CRITICAL FIX: Guarded against multiple simultaneous calls
 * @returns Promise resolving to user email or null
 */
export async function getCurrentUserEmail() {
    // ROOT CAUSE FIX: Check stateManager first (TypeScript migration - no window.currentUser)
    const currentUserFromState = stateManagerInstance.getState('currentUser');
    if (currentUserFromState?.email) {
        Logger.debug('[AUTH] Using existing stateManager.currentUser:', currentUserFromState?.email, 'user');
        return currentUserFromState.email || null;
    }
    // CRITICAL FIX: Guard against multiple simultaneous calls
    if (isGettingCurrentUserEmail && currentUserEmailPromise) {
        Logger.debug('[AUTH] getCurrentUserEmail() already in progress, returning existing promise', null, 'user');
        return currentUserEmailPromise;
    }
    isGettingCurrentUserEmail = true;
    currentUserEmailPromise = (async () => {
        try {
            // FIRST: Try real Google auth for actual profile pictures
            // COMP METHOD: Check if realGoogleAuth is available and initialized
            const win = typeof window !== 'undefined' ? window : null;
            const realGoogleAuth = win && win.realGoogleAuth;
            if (realGoogleAuth && typeof realGoogleAuth.getCurrentUser === 'function') {
                Logger.debug('[AUTH] Calling realGoogleAuth.getCurrentUser()...', null, 'user');
                const user = await realGoogleAuth.getCurrentUser();
                Logger.debug('[AUTH] Real Google Auth returned user:', user, 'user');
                if (user && user.email) {
                    Logger.debug('[AUTH] Found authenticated user with REAL profile picture:', user.email, 'user');
                    // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
                    stateManagerInstance.setState('currentUser', user);
                    Logger.debug('[AUTH] Set stateManager.currentUser from getCurrentUserEmail():', { email: user.email }, 'user');
                    const userWithMetadata = user;
                    Logger.debug('[AUTH] Real avatar URL:', userWithMetadata.user_metadata?.avatar_url, 'user');
                    return user.email;
                }
                else {
                    Logger.debug('[AUTH] Real Google Auth returned null or no email', null, 'user');
                }
            }
            else {
                Logger.debug('[AUTH] realGoogleAuth not available or not initialized', null, 'user');
            }
            // SECOND: Fallback to AuthManager
            const authManager = win && win.authManager;
            if (authManager && authManager.getCurrentUser) {
                const user = await authManager.getCurrentUser();
                Logger.debug('[AUTH] AuthManager returned user:', user, 'user');
                if (user && user.email) {
                    Logger.debug('[AUTH] Found authenticated user (fallback):', { email: user.email }, 'user');
                    // ROOT CAUSE FIX: Update stateManager (TypeScript migration - no window.currentUser)
                    stateManagerInstance.setState('currentUser', user);
                    Logger.debug('[AUTH] Set stateManager.currentUser from AuthManager:', user.email, 'user');
                    return user.email;
                }
            }
            Logger.error('[AUTH] No authenticated user found via any method', null, 'user');
            // COMP METHOD: Only show auth prompt after initialization is complete
            const isInitializing = stateManagerInstance.getState('extension.isInitialized');
            if (!isInitializing) {
                Logger.debug('[AUTH] No user found, showing authentication prompt...', 'user');
                // Note: showAuthPrompt would need to be imported if available
                // For now, we'll just log and return null
            }
            else {
                Logger.debug('[AUTH] No user found, but not showing auth prompt during initialization', 'user');
            }
            // Return null instead of throwing error to allow graceful handling
            return null;
        }
        catch (error) {
            handleError(error, {
                log: true,
                logLevel: 'error',
                context: {
                    operation: 'getCurrentUserEmail',
                    component: 'UserUtils'
                }
            });
            ;
            return null;
        }
        finally {
            // CRITICAL FIX: Reset guard after completion
            isGettingCurrentUserEmail = false;
            currentUserEmailPromise = null;
        }
    })();
    return currentUserEmailPromise;
}
/**
 * Gets the avatar color for the current user (custom or default)
 * @returns Promise resolving to color string
 */
export function getCurrentUserAvatarColor() {
    return profileGetCurrentUserAvatarColor();
}
/**
 * Gets the user's aura color from stateManager
 * @returns User's aura color or fallback color
 */
export function getCurrentUserAvatarBgColor() {
    return profileGetCurrentUserAvatarBgColor();
}
