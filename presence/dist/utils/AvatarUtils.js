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
        // Try to get avatar URL from user object
        // Note: 'picture' is a common property from OAuth providers, but not in our User type
        avatarUrl = user.avatarUrl || null;
        if (avatarUrl) {
            avatarSource = 'user-object';
        }
        else {
            // Try to get from window.currentUser if available
            if (typeof window !== 'undefined' && window.currentUser) {
                const currentUser = window.currentUser;
                if (currentUser.id === user.id && currentUser.avatarUrl) {
                    avatarUrl = currentUser.avatarUrl;
                    avatarSource = 'currentUser';
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
        if (!auraColor && typeof window !== 'undefined' && window.currentUser) {
            const currentUser = window.currentUser;
            if (currentUser.id === user.id) {
                auraColor = currentUser.auraColor;
            }
        }
        auraColor = auraColor || AVATAR_FALLBACK_COLOR;
        // Get user initial for fallback
        const initial = userName.charAt(0).toUpperCase();
        // Build avatar HTML with aura ring
        let avatarHTML = '';
        if (avatarUrl) {
            // Avatar with image - aura background extends beyond image to show as border/glow
            const auraPadding = Math.max(2, Math.floor(size * 0.08)); // Padding scales with avatar size (about 8%)
            const glowSize = Math.max(2, Math.floor(size * 0.12)); // Glow size scales with avatar size
            const auraBackgroundSize = size + (auraPadding * 2); // Aura extends beyond image
            avatarHTML = `
        <div class="avatar-container" style="width: ${size}px; height: ${size}px; position: relative; overflow: visible;">
          ${showAura ? `
            <div class="avatar-aura avatar-aura-background" style="position: absolute; width: ${auraBackgroundSize}px; height: ${auraBackgroundSize}px; border-radius: 50%; background-color: ${auraColor}; top: -${auraPadding}px; left: -${auraPadding}px; z-index: 0; pointer-events: none; box-shadow: 0 0 ${glowSize * 2}px ${glowSize}px ${auraColor}50, inset 0 0 ${glowSize}px ${auraColor}40;"></div>
            <div class="avatar-aura avatar-aura-ring" style="position: absolute; width: ${size + 4}px; height: ${size + 4}px; border-radius: 50%; border: 2px solid ${auraColor}; top: -2px; left: -2px; z-index: 2; pointer-events: none; box-shadow: 0 0 ${glowSize}px ${auraColor}80;"></div>
          ` : ''}
          <img 
            src="${avatarUrl}" 
            alt="${userName}" 
            class="avatar-img" 
            style="width: ${size}px; height: ${size}px; border-radius: 50%; position: relative; z-index: 1; object-fit: cover; border: none; background-color: transparent; box-shadow: ${showAura ? `0 0 ${glowSize}px ${auraColor}40` : 'none'};" 
            referrerpolicy="no-referrer"
            onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'${size}\\' height=\\'${size}\\'%3E%3Crect width=\\'${size}\\' height=\\'${size}\\' fill=\\'${auraColor}\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'white\\' font-size=\\'${size * 0.4}\\'%3E${initial}%3C/text%3E%3C/svg%3E';"
          />
        </div>
      `;
        }
        else {
            // Fallback avatar with initial - aura is the background
            avatarHTML = `
        <div class="avatar-container" style="width: ${size}px; height: ${size}px; position: relative; overflow: visible;">
          ${showAura ? `<div class="avatar-aura avatar-aura-ring" style="position: absolute; width: ${size + 4}px; height: ${size + 4}px; border-radius: 50%; border: 2px solid ${auraColor}; top: -2px; left: -2px; z-index: 0; pointer-events: none;"></div>` : ''}
          <div 
            class="avatar-initial" 
            style="width: ${size}px; height: ${size}px; border-radius: 50%; background-color: ${auraColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${size * 0.4}px; position: relative; z-index: 1;"
          >
            <span>${initial}</span>
          </div>
        </div>
      `;
        }
        return avatarHTML.trim();
    }
}
// Export as ES6 module
export { AvatarUtils };
export default AvatarUtils;
// Note: Window exports will be added in compiled JS for backward compatibility
// TypeScript source uses pure ES6 exports only
//# sourceMappingURL=AvatarUtils.js.map