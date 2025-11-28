import { handleError } from './ErrorHandler.js';
import { Logger } from './Logger.js';
import { AVATAR_FALLBACK_COLOR } from '../core/ConfigModule.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { escapeHtml } from './HtmlSanitizer.js';
class AvatarUtils {
    /**
     * Get avatar URL for a user
     */
    static async getAvatarUrl(user, context = 'visibility') {
        // Get user identity for logging
        const userIdentity = user?.id ?? user?.email ?? 'unknown-user';
        Logger.debug(`Getting avatar for ${userIdentity} in context: ${context}`, null, 'avatar');
        let avatarUrl = null;
        let avatarSource = 'none';
        // Validate user object
        if (!user || (!user.id && !user.name)) {
            Logger.debug(`❌ AVATAR_UTILS: Invalid user object:`, user, 'avatar');
            const fallbackName = user?.name ?? user?.handle ?? user?.email?.split('@')[0] ?? 'unknown';
            const fallbackHandle = user?.handle ?? fallbackName.replace(/\s+/g, '').toLowerCase() ?? 'unknown';
            return {
                avatarUrl: `https://lh3.googleusercontent.com/a/default-user=s96-c`,
                source: 'generic-fallback',
                userName: fallbackName,
                userHandle: fallbackHandle
            };
        }
        // ROOT CAUSE FIX: Try to get avatar URL from user object (check both avatarUrl and picture)
        avatarUrl = (user.avatarUrl ?? user.picture) ?? null;
        if (avatarUrl) {
            avatarSource = 'user-object';
        }
        else {
            // Try to get from stateManager if available
            // ES6 pattern: Get from stateManager instead of window.currentUser
            const currentUser = stateManagerInstance.getState('currentUser');
            if (currentUser && currentUser.id === user.id) {
                avatarUrl = (currentUser.avatarUrl ?? currentUser.picture) ?? null;
                if (avatarUrl) {
                    avatarSource = 'currentUser';
                }
            }
        }
        // Extract name and handle using TypeScript native features
        const userName = user.name ?? user.handle ?? user.email?.split('@')[0] ?? 'user';
        const userHandle = user.handle ?? userName.replace(/\s+/g, '').toLowerCase() ?? 'unknown';
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
                    handleError(error, {
                        log: true,
                        logLevel: 'warn',
                        context: {
                            operation: 'getAuraIntensity',
                            component: 'AvatarUtils'
                        }
                    });
                }
            }
        }
        // Default intensity
        return intensity ?? 0.5;
    }
    /**
     * Create unified avatar HTML
     */
    static async createUnifiedAvatar(user, context = 'visibility', options = {}) {
        const { size = 40, showAura = true, showStatus = false } = options;
        // Get avatar data
        const avatarData = await this.getAvatarUrl(user, context);
        const avatarUrl = avatarData.avatarUrl;
        // Get aura color
        const auraColor = user.auraColor ?? AVATAR_FALLBACK_COLOR;
        const auraIntensity = await this.getAuraIntensity(user);
        const auraRgba = this.hexToRgba(auraColor, auraIntensity);
        // Create avatar HTML
        let avatarHtml = `<div class="avatar-container" style="width: ${size}px; height: ${size}px; position: relative;">`;
        if (showAura && auraColor) {
            // CRITICAL FIX: Add box-shadow for glow effect (regression fix)
            // Calculate glow size based on avatar size (larger avatars get more glow)
            const glowSize = Math.max(4, size * 0.15); // Minimum 4px, scales with size
            const glowColorRgba = this.hexToRgba(auraColor, Math.min(0.6, auraIntensity + 0.2)); // Slightly brighter for glow
            avatarHtml += `<div class="avatar-aura" style="position: absolute; inset: -${glowSize}px; border-radius: 50%; background: ${auraRgba}; z-index: 0; box-shadow: 0 0 ${glowSize * 2}px ${glowSize}px ${glowColorRgba};"></div>`;
        }
        // SECURITY FIX: Sanitize userName to prevent XSS in alt attribute and initials
        const safeUserName = escapeHtml(avatarData.userName);
        if (avatarUrl) {
            // SECURITY FIX: Validate avatarUrl is a safe URL (not javascript: or data: with malicious content)
            // CRITICAL: Validate URL to prevent XSS attacks via javascript: or malicious data: URLs
            const trimmedUrl = avatarUrl.trim();
            const lowerUrl = trimmedUrl.toLowerCase();
            // Block dangerous URL schemes
            const isUnsafeUrl = lowerUrl.startsWith('javascript:') ||
                lowerUrl.startsWith('data:text/html') ||
                lowerUrl.startsWith('vbscript:') ||
                lowerUrl.startsWith('onerror=') ||
                lowerUrl.startsWith('onload=');
            if (isUnsafeUrl) {
                Logger.warn('⚠️ AVATAR_UTILS: Blocked potentially unsafe avatar URL', { url: trimmedUrl.substring(0, 50) }, 'avatar');
                // Fall through to initials fallback below
            }
            else {
                // Escape the URL for use in HTML attribute (additional safety)
                const safeAvatarUrl = escapeHtml(trimmedUrl);
                // CRITICAL FIX: Remove border from avatar image (regression fix)
                avatarHtml += `<img src="${safeAvatarUrl}" alt="${safeUserName}" class="avatar-image" style="width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; position: relative; z-index: 1; border: none !important; outline: none !important;" />`;
            }
        }
        // Fallback to initials if no avatar URL or URL was blocked for security
        if (!avatarUrl || (avatarUrl && avatarUrl.trim().toLowerCase().match(/^(javascript:|data:text\/html|vbscript:|onerror=|onload=)/))) {
            const initials = safeUserName
                .split(' ')
                .map(n => n[0] || '')
                .join('')
                .toUpperCase()
                .substring(0, 2);
            avatarHtml += `<div class="avatar-initials" style="width: ${size}px; height: ${size}px; border-radius: 50%; background: ${auraColor}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: ${size * 0.4}px; position: relative; z-index: 1;">${initials}</div>`;
        }
        if (showStatus) {
            avatarHtml += `<div class="avatar-status" style="position: absolute; bottom: 0; right: 0; width: ${size * 0.3}px; height: ${size * 0.3}px; border-radius: 50%; background: green; border: 2px solid white; z-index: 2;"></div>`;
        }
        avatarHtml += `</div>`;
        return avatarHtml;
    }
}
export { AvatarUtils };
export default AvatarUtils;
