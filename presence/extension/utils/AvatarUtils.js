/**
 * AVATAR UTILITIES - TypeScript Version
 * Centralized avatar management system
 */
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
import { formatUserDisplayName, formatUserHandle, getUserIdentity } from './Fallbacks.js';
class AvatarUtils {
    /**
     * Get avatar URL for a user
     */
    static async getAvatarUrl(user, context = 'visibility') {
        console.log(`Getting avatar for ${getUserIdentity(user)} in context: ${context}`);
        let avatarUrl = null;
        let userName = formatUserDisplayName(user, 'user');
        let userHandle = formatUserHandle(user, 'unknown');
        let avatarSource = 'none';
        // Validate user object
        if (!user || (!user.id && !user.name)) {
            console.log(`❌ AVATAR_UTILS: Invalid user object:`, user);
            return {
                avatarUrl: `https://lh3.googleusercontent.com/a/default-user=s96-c`,
                source: 'generic-fallback',
                userName: formatUserDisplayName(user, 'unknown'),
                userHandle: formatUserHandle(user, 'unknown')
            };
        }
        // ROOT CAUSE FIX: Try to get avatar URL from user object (check both avatarUrl and picture)
        avatarUrl = user.avatarUrl || user.picture || null;
        if (avatarUrl) {
            avatarSource = 'user-object';
        }
        else {
            // Try to get from window.currentUser if available
            const win = window;
            if (typeof window !== 'undefined' && win.currentUser) {
                const currentUser = win.currentUser;
                if (currentUser && currentUser.id === user.id) {
                    avatarUrl = currentUser.avatarUrl || currentUser.picture || null;
                    if (avatarUrl) {
                        avatarSource = 'currentUser';
                    }
                }
            }
        }
        // Extract name and handle
        userName = user.name || user.email?.split('@')[0] || 'user';
        userHandle = user.handle || userName;
        return {
            avatarUrl,
            source: avatarSource,
            userName,
            userHandle
        };
    }
    /**
     * Convert hex color to rgba with opacity
     */
    static hexToRgba(hex, opacity) {
        // Remove # if present
        hex = hex.replace('#', '');
        // Parse RGB values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    /**
     * Get aura intensity from user object or preferences
     */
    static async getAuraIntensity(user) {
        // Try to get from user object
        let intensity = user.auraIntensity;
        // Try to get from currentUser if available
        if (intensity === undefined && typeof window !== 'undefined') {
            const win = window;
            if (win.currentUser && win.currentUser.id === user.id) {
                intensity = win.currentUser.auraIntensity;
            }
        }
        // Try to get from UserPreferencesManager (async)
        if (intensity === undefined && typeof window !== 'undefined') {
            const win = window;
            if (win.userPreferencesManager?.isInitialized) {
                try {
                    const prefValue = await win.userPreferencesManager.getPreference('auraIntensity');
                    if (typeof prefValue === 'number') {
                        intensity = prefValue;
                    }
                    else if (typeof prefValue === 'string') {
                        intensity = parseFloat(prefValue);
                    }
                }
                catch (error) {
                    console.warn('⚠️ AvatarUtils: Failed to get auraIntensity from UserPreferencesManager:', error);
                }
            }
        }
        // Default to 0.5 if not found
        return typeof intensity === 'number' && !isNaN(intensity)
            ? Math.max(0, Math.min(1, intensity))
            : 0.5;
    }
    /**
     * Create unified avatar HTML
     */
    static async createUnifiedAvatar(user, context = 'visibility', options = {}) {
        const size = options.size || (context === 'profile' ? 32 : 24);
        const showAura = options.showAura !== false;
        const showStatus = options.showStatus === true;
        // Get avatar data
        const avatarData = await this.getAvatarUrl(user, context);
        const avatarUrl = avatarData.avatarUrl;
        const userName = avatarData.userName;
        // Get aura color
        let auraColor = user.auraColor;
        const win = window;
        if (!auraColor && typeof window !== 'undefined' && win.currentUser) {
            const currentUser = win.currentUser;
            if (currentUser && currentUser.id === user.id) {
                auraColor = currentUser.auraColor;
            }
        }
        auraColor = auraColor || AVATAR_FALLBACK_COLOR;
        // Get aura intensity (0-1 range) and convert to opacity
        const auraIntensity = await this.getAuraIntensity(user);
        const backgroundOpacity = auraIntensity * 0.6; // Background opacity: 0-0.6 based on intensity
        const glowOpacity = auraIntensity * 0.8; // Glow opacity: 0-0.8 based on intensity
        const shadowOpacity = auraIntensity * 0.5; // Shadow opacity: 0-0.5 based on intensity
        // Convert hex to rgba with opacity
        const auraColorRgba = this.hexToRgba(auraColor, backgroundOpacity);
        const glowColorRgba = this.hexToRgba(auraColor, glowOpacity);
        const shadowColorRgba = this.hexToRgba(auraColor, shadowOpacity);
        // Get user initial for fallback
        const initial = userName.charAt(0).toUpperCase();
        // Build avatar HTML with aura ring
        let avatarHTML = '';
        if (avatarUrl) {
            const auraPadding = Math.max(2, Math.floor(size * 0.08));
            const glowSize = Math.max(2, Math.floor(size * 0.12));
            const auraBackgroundSize = size + (auraPadding * 2);
            avatarHTML = `
        <div class="avatar-container" style="width: ${size}px; height: ${size}px; position: relative; overflow: visible;">
          ${showAura ? `
            <div class="avatar-aura avatar-aura-background" style="position: absolute; width: ${auraBackgroundSize}px; height: ${auraBackgroundSize}px; border-radius: 50%; background-color: ${auraColorRgba}; top: -${auraPadding}px; left: -${auraPadding}px; z-index: 0; pointer-events: none; box-shadow: 0 0 ${glowSize * 2}px ${glowSize}px ${glowColorRgba}, inset 0 0 ${glowSize}px ${shadowColorRgba};"></div>
          ` : ''}
          <img 
            src="${avatarUrl}" 
            alt="${userName}" 
            class="avatar-img" 
            style="width: ${size}px; height: ${size}px; border-radius: 50%; position: relative; z-index: 1; object-fit: cover; border: none !important; outline: none !important; background-color: transparent; box-shadow: ${showAura ? `0 0 ${glowSize}px ${shadowColorRgba}` : 'none'};" 
            referrerpolicy="no-referrer"
            onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'${size}\\' height=\\'${size}\\'%3E%3Crect width=\\'${size}\\' height=\\'${size}\\' fill=\\'${auraColor}\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'white\\' font-size=\\'${size * 0.4}\\'%3E${initial}%3C/text%3E%3C/svg%3E';"
          />
        </div>
      `;
        }
        else {
            // For fallback initials, apply opacity to background
            const initialBgColor = this.hexToRgba(auraColor, backgroundOpacity);
            avatarHTML = `
        <div class="avatar-container" style="width: ${size}px; height: ${size}px; position: relative; overflow: visible;">
          <div 
            class="avatar-initial" 
            style="width: ${size}px; height: ${size}px; border-radius: 50%; background-color: ${initialBgColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${size * 0.4}px; position: relative; z-index: 1; box-shadow: ${showAura ? `0 0 ${Math.max(2, Math.floor(size * 0.12))}px ${shadowColorRgba}` : 'none'};"
          >
            <span>${initial}</span>
          </div>
        </div>
      `;
        }
        return avatarHTML.trim();
    }
}
export { AvatarUtils };
export default AvatarUtils;
// CRITICAL FIX: Export AvatarUtils to window and globalThis for legacy code compatibility
// ROOT CAUSE FIX: ProfileManager checks legacyContext.AvatarUtils (which is globalThis), so we must export it immediately
if (typeof window !== 'undefined') {
    window.AvatarUtils = AvatarUtils;
    // Also set on globalThis for legacyContext compatibility (legacyContext = globalThis)
    globalThis.AvatarUtils = AvatarUtils;
    // CRITICAL: Also set immediately using Object.defineProperty to ensure it's available synchronously
    Object.defineProperty(globalThis, 'AvatarUtils', {
        value: AvatarUtils,
        writable: true,
        configurable: true,
    });
    Object.defineProperty(window, 'AvatarUtils', {
        value: AvatarUtils,
        writable: true,
        configurable: true,
    });
    console.log('✅ AvatarUtils exported to window and globalThis for legacyContext compatibility');
}
