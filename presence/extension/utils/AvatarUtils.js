/**
 * Avatar Utilities
 * Helper functions for avatar management and display
 */
export class AvatarUtils {
    static generateInitials(name) {
        if (!name || typeof name !== 'string') {
            return '?';
        }
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0) {
            return '?';
        }
        if (parts.length === 1) {
            return parts[0]?.charAt(0).toUpperCase() ?? '?';
        }
        return ((parts[0]?.charAt(0) ?? '?') + (parts[parts.length - 1]?.charAt(0) ?? '?')).toUpperCase();
    }
    static getAvatarColor(name, fallbackColor = '#6366f1') {
        if (!name || typeof name !== 'string') {
            return fallbackColor;
        }
        // Simple hash-based color generation
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 65%, 50%)`;
    }
    static createAvatarElement(config = {}) {
        const { size = 32, fallbackColor = '#6366f1', showBorder = false, borderColor = '#e5e7eb' } = config;
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: ${Math.max(12, size * 0.375)}px;
      color: white;
      background-color: ${fallbackColor};
      ${showBorder ? `border: 2px solid ${borderColor};` : ''}
    `;
        return avatar;
    }
    static updateAvatarElement(element, name, imageUrl, config = {}) {
        if (!element)
            return;
        const initials = this.generateInitials(name);
        const color = this.getAvatarColor(name, config.fallbackColor);
        if (imageUrl) {
            element.style.backgroundImage = `url(${imageUrl})`;
            element.style.backgroundSize = 'cover';
            element.style.backgroundPosition = 'center';
            element.textContent = '';
        }
        else {
            element.style.backgroundImage = 'none';
            element.style.backgroundColor = color;
            element.textContent = initials;
        }
    }
    static createUnifiedAvatar(name, imageUrl, config = {}) {
        const avatar = this.createAvatarElement(config);
        this.updateAvatarElement(avatar, name, imageUrl, config);
        return avatar;
    }
}
// Export singleton instance
let avatarUtilsInstance = null;
export function getAvatarUtils() {
    if (!avatarUtilsInstance) {
        avatarUtilsInstance = new AvatarUtils();
    }
    return avatarUtilsInstance;
}
//# sourceMappingURL=AvatarUtils.js.map