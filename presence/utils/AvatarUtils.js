/**
 * SD1 AVATAR UTILITIES
 * 
 * Centralized avatar management system.
 * Abstracts repeated avatar creation and URL fetching patterns.
 */

class AvatarUtils {
  /**
   * Get avatar URL for a user using the working system
   * @param {Object} user - User object
   * @param {string} context - Context ('profile', 'visibility', 'message')
   * @returns {Object} {avatarUrl, source, userName}
   */
  static getAvatarUrl(user, context = 'visibility') {
    Logger.avatar(`Getting avatar for ${user.user_email || user.email} in context: ${context}`);
    
    let avatarUrl = null;
    let userName = user.user_email?.split('@')[0] || user.email?.split('@')[0] || 'user';
    let userHandle = userName;
    let avatarSource = 'none';

    try {
      // For current user, use user_metadata (same as profile avatar system)
      const currentUser = window.currentUser || {};
      if ((user.user_email || user.email) === currentUser.email && currentUser.user_metadata?.avatar_url) {
        avatarUrl = currentUser.user_metadata.avatar_url;
        userName = currentUser.user_metadata.full_name || userName;
        avatarSource = 'current_user_metadata';
        Logger.avatar(`✅ Using current user metadata for ${user.user_email || user.email} - avatarUrl: ${avatarUrl}`);
      } else {
        // For other users, use visibility data (same as profile avatar system)
        if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
          const userInVisibility = window.currentVisibilityDataUnfiltered.active.find(
            u => u.email === (user.user_email || user.email) || 
                 u.userId === (user.user_email || user.email) || 
                 u.id === (user.user_email || user.email)
          );
          if (userInVisibility && userInVisibility.avatarUrl) {
            avatarUrl = userInVisibility.avatarUrl;
            userName = userInVisibility.name || userName;
            avatarSource = 'visibility_data';
            Logger.avatar(`✅ Found REAL avatar in visibility data for ${user.user_email || user.email} - avatarUrl: ${avatarUrl}`);
          } else {
            Logger.avatar(`ℹ️ User ${user.user_email || user.email} not found in visibility data`);
          }
        } else {
          Logger.avatar(`ℹ️ No unfiltered visibility data available`);
        }
      }
    } catch (error) {
      Logger.error(`Exception processing avatar for ${user.user_email || user.email}`, error, 'avatar');
    }

    // Only fallback to generic if absolutely necessary
    if (!avatarUrl) {
      Logger.avatar(`⚠️ No real avatar found, using generic for ${user.user_email || user.email}`);
      avatarUrl = `https://lh3.googleusercontent.com/a/default-user=s96-c`;
      avatarSource = 'generic-fallback';
    }

    Logger.avatar(`Avatar result: ${user.user_email || user.email} - avatarUrl: ${avatarUrl}, source: ${avatarSource}, name: ${userName}`);

    return {
      avatarUrl,
      source: avatarSource,
      userName,
      userHandle
    };
  }

  /**
   * Create unified avatar HTML (same system used throughout)
   * @param {Object} user - User object
   * @param {string} context - Context ('profile', 'visibility', 'message')
   * @param {Object} options - Additional options
   * @returns {string} HTML string
   */
  static createUnifiedAvatar(user, context = 'visibility', options = {}) {
    Logger.avatar(`Creating unified avatar for ${user.user_email || user.email} in context: ${context}`);

    const avatarData = this.getAvatarUrl(user, context);
    const {
      avatarUrl,
      source: avatarSource,
      userName,
      userHandle
    } = avatarData;

    const auraColor = user.aura_color || user.auraColor || '#aaaaaa';
    const showAura = options.showAura !== false;
    const size = options.size || (context === 'profile' ? 32 : 24);
    const showStatus = options.showStatus !== false;

    Logger.avatar(`Avatar details: auraColor=${auraColor}, showAura=${showAura}, size=${size}, showStatus=${showStatus}`);

    // Status dot color based on activity
    const statusDotColor = user.is_active ? '#22c55e' : '#6b7280';

    let html = `<div style="position: relative; width: ${size}px; height: ${size}px;">`;
    
    if (showAura) {
      html += `<div style="position: absolute; top: -2px; left: -2px; width: ${size + 4}px; height: ${size + 4}px; border-radius: 50%; background-color: ${auraColor}; z-index: 1; border: 2px solid ${auraColor};"></div>`;
    }
    
    html += `<img src="${avatarUrl}" alt="${userName}" style="position: relative; z-index: 2; width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; border: 2px solid ${auraColor};" data-avatar-fallback="true" data-avatar-source="${avatarSource}">`;
    
    if (showStatus) {
      html += `<div style="position: absolute; bottom: -2px; right: -2px; width: 8px; height: 8px; border-radius: 50%; background-color: ${statusDotColor}; border: 2px solid white; z-index: 3;"></div>`;
    }
    
    html += `</div>`;

    Logger.avatar(`Generated unified avatar HTML for ${userName} (${avatarSource})`);
    
    return html;
  }

  /**
   * Update avatar in DOM element
   * @param {string} selector - CSS selector for avatar container
   * @param {Object} user - User object
   * @param {string} context - Context
   * @param {Object} options - Additional options
   */
  static updateAvatarInDOM(selector, user, context = 'visibility', options = {}) {
    Logger.avatar(`Updating avatar in DOM: ${selector}`);
    
    const container = document.querySelector(selector);
    if (!container) {
      Logger.warn(`Avatar container not found: ${selector}`, null, 'avatar');
      return false;
    }

    const avatarHTML = this.createUnifiedAvatar(user, context, options);
    container.innerHTML = avatarHTML;
    
    Logger.avatar(`✅ Avatar updated in DOM: ${selector}`);
    return true;
  }

  /**
   * Check if avatar URL is real (not generic)
   * @param {string} avatarUrl - Avatar URL to check
   * @returns {boolean} True if real avatar
   */
  static isRealAvatar(avatarUrl) {
    if (!avatarUrl) return false;
    return !avatarUrl.includes('default-user');
  }

  /**
   * Get avatar source from DOM element
   * @param {HTMLElement} element - Avatar element
   * @returns {string} Avatar source
   */
  static getAvatarSource(element) {
    const img = element.querySelector('img[data-avatar-source]');
    return img ? img.getAttribute('data-avatar-source') : 'unknown';
  }

  /**
   * Batch update multiple avatars
   * @param {Array} users - Array of user objects
   * @param {string} context - Context
   * @param {Object} options - Additional options
   * @returns {Array} Array of avatar data
   */
  static batchUpdateAvatars(users, context = 'visibility', options = {}) {
    Logger.avatar(`Batch updating ${users.length} avatars in context: ${context}`);
    
    const results = users.map(user => {
      const avatarData = this.getAvatarUrl(user, context);
      return {
        ...user,
        ...avatarData,
        avatarHTML: this.createUnifiedAvatar(user, context, options)
      };
    });

    Logger.avatar(`✅ Batch avatar update complete: ${results.length} avatars processed`);
    return results;
  }

  /**
   * Validate avatar URL
   * @param {string} avatarUrl - Avatar URL to validate
   * @returns {Object} Validation result
   */
  static validateAvatarUrl(avatarUrl) {
    if (!avatarUrl) {
      return { valid: false, reason: 'No URL provided' };
    }

    if (!avatarUrl.startsWith('http')) {
      return { valid: false, reason: 'Invalid URL format' };
    }

    if (avatarUrl.includes('default-user')) {
      return { valid: true, isGeneric: true, reason: 'Generic avatar' };
    }

    return { valid: true, isGeneric: false, reason: 'Real avatar' };
  }
}

// Make available globally
window.AvatarUtils = AvatarUtils;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AvatarUtils;
}

Logger.success('AvatarUtils initialized');

