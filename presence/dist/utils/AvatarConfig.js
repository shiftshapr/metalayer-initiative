/**
 * AVATAR CONFIG - TypeScript Version
 * Unified avatar display function - SAME implementation for ALL contexts
 * This function creates identical visual appearance regardless of context
 */
/**
 * Create unified avatar HTML
 */
export function createUnifiedAvatar(user, options = {}) {
    const { context = 'default', showAura = true, size = 'medium', clickable = false, showName = false, namePosition = 'below' } = options;
    if (!user) {
        return '';
    }
    // Get user identification
    const userName = user.name || user.displayName || '';
    // Get aura color - prioritize user.auraColor, then fallback to stored
    let auraColor = user.auraColor;
    if (!auraColor && window.currentUser && window.currentUser.id === user.id) {
        auraColor = window.currentUser.auraColor;
    }
    if (!auraColor) {
        auraColor = window.AVATAR_FALLBACK_COLOR || '#ffffff'; // Default white
    }
    // Size classes
    const sizeClasses = {
        small: 'avatar-small',
        medium: 'avatar-medium',
        large: 'avatar-large'
    };
    // Create avatar HTML
    const avatarHTML = `
    <div class="unified-avatar ${sizeClasses[size]} ${context}-avatar" 
         data-user-id="${user.id}" 
         data-aura-color="${auraColor}"
         ${clickable ? 'onclick="handleAvatarClick(event)"' : ''}>
      <div class="avatar-container" style="background-color: ${auraColor};">
        <div class="avatar-inner">
          ${getUserInitial(userName)}
        </div>
        ${showAura ? `<div class="aura-ring" style="border-color: ${auraColor};"></div>` : ''}
      </div>
      ${showName ? `<div class="avatar-name ${namePosition}">${userName}</div>` : ''}
    </div>
  `;
    return avatarHTML;
}
/**
 * Get user initial from name or email
 */
export function getUserInitial(name) {
    if (!name)
        return '?';
    // If it's an email, use the part before @
    if (name.includes('@')) {
        return name.split('@')[0].charAt(0).toUpperCase();
    }
    // Otherwise use first character
    return name.charAt(0).toUpperCase();
}
/**
 * Handle avatar click events
 */
export function handleAvatarClick(event) {
    event.preventDefault();
    event.stopPropagation();
    const avatar = event.currentTarget;
    const userId = avatar.getAttribute('data-user-id');
    console.log('Avatar clicked for user:', userId);
    // Dispatch custom event for other modules to handle
    document.dispatchEvent(new CustomEvent('avatarClicked', {
        detail: { userId, avatar }
    }));
}
// Export to window for backward compatibility
if (typeof window !== 'undefined') {
    window.createUnifiedAvatar = createUnifiedAvatar;
    window.getUserInitial = getUserInitial;
    window.handleAvatarClick = handleAvatarClick;
}
console.log('✅ AvatarConfig: Unified avatar system loaded');
export default { createUnifiedAvatar, getUserInitial, handleAvatarClick };
//# sourceMappingURL=AvatarConfig.js.map