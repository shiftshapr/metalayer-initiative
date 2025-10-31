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
  static async getAvatarUrl(user, context = 'visibility') {
    console.log(`Getting avatar for ${user.id || user.user_id || user.name || 'unknown'} in context: ${context}`);
    
    let avatarUrl = null;
    let userName = user.name || 'user';
    let userHandle = userName;
    let avatarSource = 'none';

    // CRITICAL FIX: Validate user object to prevent null/undefined calls
    // Accept UUID-only users (id/user_id) per new COMP scheme
    if (!user || (!user.id && !user.user_id && !user.name)) {
      console.log(`❌ AVATAR_UTILS: Invalid user object:`, user);
      return {
        avatarUrl: `https://lh3.googleusercontent.com/a/default-user=s96-c`,
        source: 'generic-fallback',
        userName: 'unknown',
        userHandle: 'unknown'
      };
    }

    try {
      // SD3: Read-through cache to avoid initial generic flash
      const cacheId = user.id || user.user_id || null;
      if (!avatarUrl && cacheId && typeof window !== 'undefined' && window.localStorage) {
        try {
          const cached = window.localStorage.getItem(`avatarCache:${cacheId}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.avatarUrl && !parsed.avatarUrl.includes('default-user')) {
              avatarUrl = parsed.avatarUrl;
              userName = parsed.userName || userName;
              avatarSource = parsed.source || 'cache';
              console.log(`✅ AVATAR_UTILS: Using cached avatar for ${cacheId}: ${avatarUrl}`);
            }
          }
        } catch (e) {
          // ignore cache errors
        }
      }
      // SD1 FIX: PRIORITY 1 - Check if user object already has avatar_url (from AppUser table)
      if (user.avatar_url && !user.avatar_url.includes('default-user')) {
        avatarUrl = user.avatar_url;
        avatarSource = 'user_presence_table';
        console.log(`✅ SD1 FIX: Using avatar_url from user object (user_presence): ${avatarUrl}`);
      }
      
      // SD1 FIX: PRIORITY 1.5 - Check if user object has avatarUrl (camelCase) - for profile avatars
      if (!avatarUrl && user.avatarUrl && !user.avatarUrl.includes('default-user')) {
        avatarUrl = user.avatarUrl;
        avatarSource = 'user_object_avatarUrl';
        console.log(`✅ SD1 FIX: Using avatarUrl from user object (profile): ${avatarUrl}`);
      }
      
      // REMOVED: Any API reads to /v1/users/:id. Avatars must come from
      // provided user data (profile/presence/current user context) only.
      
      // PRIORITY 2: For current user, use user_metadata
      if (!avatarUrl) {
        const currentUser = window.currentUser || {};
        if ((user.id || user.user_id) === (currentUser.id || currentUser.user_id) && currentUser.user_metadata?.avatar_url) {
          avatarUrl = currentUser.user_metadata.avatar_url;
          userName = currentUser.user_metadata.full_name || userName;
          avatarSource = 'current_user_metadata';
          console.log(`✅ Using current user metadata for ${user.id || user.user_id} - avatarUrl: ${avatarUrl}`);
        }
      }
      
      // PRIORITY 3: For other users, use visibility data (same as profile avatar system)
      if (!avatarUrl) {
        console.log(`🔍 SD1 AVATAR DEBUG: Checking visibility data for ${user.id || user.user_id}`);
        console.log(`🔍 SD1 AVATAR DEBUG: currentVisibilityDataUnfiltered exists: ${!!window.currentVisibilityDataUnfiltered}`);
        
        if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
          console.log(`🔍 SD1 AVATAR DEBUG: visibility data active array length: ${window.currentVisibilityDataUnfiltered.active.length}`);
          console.log(`🔍 SD1 AVATAR DEBUG: visibility data users:`, window.currentVisibilityDataUnfiltered.active.map(u => ({
            email: u.email,
            userId: u.userId,
            id: u.id,
            avatarUrl: u.avatarUrl
          })));
          
          const targetId = user.id || user.user_id || null;
          const userInVisibility = window.currentVisibilityDataUnfiltered.active.find(u => (
            targetId && (u.userId === targetId || u.id === targetId)
          ));
          
          console.log(`🔍 SD1 AVATAR DEBUG: userInVisibility found: ${!!userInVisibility}`);
          if (userInVisibility) {
            console.log(`🔍 SD1 AVATAR DEBUG: userInVisibility details:`, userInVisibility);
          }
          
          if (userInVisibility && userInVisibility.avatarUrl && !userInVisibility.avatarUrl.includes('default-user')) {
            avatarUrl = userInVisibility.avatarUrl;
            userName = userInVisibility.name || userName;
            avatarSource = 'visibility_data';
            console.log(`✅ Found REAL avatar in visibility data for ${user.id || user.user_id} - avatarUrl: ${avatarUrl}`);
          } else {
            console.log(`ℹ️ User ${user.id || user.user_id} not found in visibility data or has generic avatar`);
            
            // COMP METHOD: Database query removed - now using AppUser table via API (Priority 2 above)
          }
        } else {
          console.log(`ℹ️ No unfiltered visibility data available`);
        }
        
        // PRIORITY 5: Check if current user has real avatar in window.currentUser
        if (!avatarUrl && window.currentUser && (user.id || user.user_id) === (window.currentUser.id || window.currentUser.user_id)) {
          if (window.currentUser.avatarUrl && !window.currentUser.avatarUrl.includes('default-user')) {
            avatarUrl = window.currentUser.avatarUrl;
            avatarSource = 'window_currentUser';
            console.log(`✅ Using window.currentUser avatar for ${user.id || user.user_id} - avatarUrl: ${avatarUrl}`);
          }
        }
      }
    } catch (error) {
      console.error(`Exception processing avatar for ${user.id || user.user_id}`, error, 'avatar');
    }

    // CRITICAL CHANGE: No generic fallback allowed. If no valid URL, return none.
    if (!avatarUrl || avatarUrl.trim() === '') {
      console.log(`⛔ No real avatar URL for ${user.id || user.user_id}; returning none`);
      avatarUrl = null;
      avatarSource = 'none';
    } else if (!avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
      console.log(`⛔ Invalid avatar URL format for ${user.id || user.user_id}: ${avatarUrl}`);
      avatarUrl = null;
      avatarSource = 'none';
    } else {
      // CRITICAL FIX: Accept ANY valid HTTP/HTTPS URL as real avatar
      // daveroom's avatarUrl (https://lh3.googleusercontent.com/a/defa) should be treated as real
      console.log(`✅ AVATAR_UTILS: Using REAL avatar for ${user.id || user.user_id}: ${avatarUrl}`);
    }

    // SD3: Write-through cache for next render to prevent flash
    try {
      if (cacheId && typeof window !== 'undefined' && window.localStorage && avatarUrl) {
        const payload = JSON.stringify({ avatarUrl, userName, source: avatarSource, ts: Date.now() });
        window.localStorage.setItem(`avatarCache:${cacheId}`, payload);
      }
    } catch (e) {
      // ignore cache errors
    }

    console.log(`Avatar result: ${user.id || user.user_id || user.name || 'unknown'} - avatarUrl: ${avatarUrl}, source: ${avatarSource}, name: ${userName}`);

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
  static async createUnifiedAvatar(user, context = 'visibility', options = {}) {
    console.log(`Creating unified avatar for ${user.id || user.user_id || user.name || 'unknown'} in context: ${context}`);

    const avatarData = await this.getAvatarUrl(user, context);
    const {
      avatarUrl,
      source: avatarSource,
      userName,
      userHandle
    } = avatarData;

    // If no real avatar, optionally render generic only if explicitly allowed
    if (!avatarUrl) {
      if (options && options.allowGenericOnDeleted) {
        const size = options.size || (context === 'profile' ? 32 : 24);
        const auraColor = user.aura_color || user.auraColor || window.AVATAR_FALLBACK_COLOR;
        let html = `<div style="position: relative; width: ${size}px; height: ${size}px;" data-user-id="${user.id || user.user_id || user.userId}">`;
        if (options.showAura !== false) {
          html += `<div style="position: absolute; top: -2px; left: -2px; width: ${size + 4}px; height: ${size + 4}px; border-radius: 50%; background-color: ${auraColor}; z-index: 1; border: 2px solid ${auraColor};"></div>`;
        }
        html += `<img src="https://lh3.googleusercontent.com/a/default-user=s96-c" alt="${userName}" style="position: relative; z-index: 2; width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; border: 2px solid ${auraColor};" data-avatar-source="generic-fallback" data-user-id="${user.id || user.user_id || user.userId}">`;
        if (options.showStatus !== false) {
          const statusDotColor = user.is_active ? '#22c55e' : '#6b7280';
          html += `<div style="position: absolute; bottom: -2px; right: -2px; width: 8px; height: 8px; border-radius: 50%; background-color: ${statusDotColor}; border: 2px solid white; z-index: 3;"></div>`;
        }
        html += `</div>`;
        return html;
      }
      // Always render an <img> element to keep DOM structure consistent,
      // even when no real avatar is available. The src will be empty and
      // the browser will display a broken image icon, which is preferable
      // to missing <img> tags in our UI contract.
      const size = options.size || (context === 'profile' ? 32 : 24);
      const auraColor = user.aura_color || user.auraColor || window.AVATAR_FALLBACK_COLOR;
      let html = `<div style="position: relative; width: ${size}px; height: ${size}px;" data-user-id="${user.id || user.user_id || user.userId}">`;
      if (options.showAura !== false) {
        html += `<div style="position: absolute; top: -2px; left: -2px; width: ${size + 4}px; height: ${size + 4}px; border-radius: 50%; background-color: ${auraColor}; z-index: 1; border: 2px solid ${auraColor};"></div>`;
      }
      html += `<img src="" alt="${userName}" style="position: relative; z-index: 2; width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; border: 2px solid ${auraColor};" data-avatar-source="none" data-user-id="${user.id || user.user_id || user.userId}" referrerpolicy="no-referrer">`;
      if (options.showStatus !== false) {
        const statusDotColor = user.is_active ? '#22c55e' : '#6b7280';
        html += `<div style="position: absolute; bottom: -2px; right: -2px; width: 8px; height: 8px; border-radius: 50%; background-color: ${statusDotColor}; border: 2px solid white; z-index: 3;"></div>`;
      }
      html += `</div>`;
      return html;
    }

    // COMP METHOD: Only use white fallback when auraColor is null/undefined
    const auraColor = user.aura_color || user.auraColor || window.AVATAR_FALLBACK_COLOR;
    const showAura = options.showAura !== false;
    const size = options.size || (context === 'profile' ? 32 : 24);
    const showStatus = options.showStatus !== false;

    console.log(`Avatar details: auraColor=${auraColor}, showAura=${showAura}, size=${size}, showStatus=${showStatus}`);

    // Status dot color based on activity
    const statusDotColor = user.is_active ? '#22c55e' : '#6b7280';

    let html = `<div style="position: relative; width: ${size}px; height: ${size}px;" data-user-id="${user.id || user.user_id || user.userId}">`;
    
    if (showAura) {
      html += `<div style="position: absolute; top: -2px; left: -2px; width: ${size + 4}px; height: ${size + 4}px; border-radius: 50%; background-color: ${auraColor}; z-index: 1; border: 2px solid ${auraColor};"></div>`;
    }
    
    // For message avatars, set src immediately.
    html += `<img src="${avatarUrl}" alt="${userName}" style="position: relative; z-index: 2; width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; border: 2px solid ${auraColor};" data-avatar-source="${avatarSource}" data-user-id="${user.id || user.user_id || user.userId}">`;
    
    if (showStatus) {
      html += `<div style="position: absolute; bottom: -2px; right: -2px; width: 8px; height: 8px; border-radius: 50%; background-color: ${statusDotColor}; border: 2px solid white; z-index: 3;"></div>`;
    }
    
    html += `</div>`;

    console.log(`Generated unified avatar HTML for ${userName} (${avatarSource})`);
    
    return html;
  }

  /**
   * Update avatar in DOM element
   * @param {string} selector - CSS selector for avatar container
   * @param {Object} user - User object
   * @param {string} context - Context
   * @param {Object} options - Additional options
   */
  static async updateAvatarInDOM(selector, user, context = 'visibility', options = {}) {
    console.log(`Updating avatar in DOM: ${selector}`);
    
    const container = document.querySelector(selector);
    if (!container) {
      console.warn(`Avatar container not found: ${selector}`, null, 'avatar');
      return false;
    }

    const avatarHTML = await this.createUnifiedAvatar(user, context, options);
    container.innerHTML = avatarHTML;

    // SD3: After inserting, preload and set src to avoid flashing placeholder
    const img = container.querySelector('img[data-avatar-src]');
    if (img) {
      const src = img.getAttribute('data-avatar-src');
      if (src) {
        const pre = new Image();
        pre.onload = () => {
          img.setAttribute('src', src);
        };
        pre.onerror = () => {
          img.setAttribute('src', 'https://lh3.googleusercontent.com/a/default-user=s96-c');
        };
        pre.referrerPolicy = 'no-referrer';
        pre.src = src;
      }
    }

    console.log(`✅ Avatar updated in DOM: ${selector}`);
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
  static async batchUpdateAvatars(users, context = 'visibility', options = {}) {
    console.log(`Batch updating ${users.length} avatars in context: ${context}`);
    
    const results = await Promise.all(users.map(async user => {
      const avatarData = await this.getAvatarUrl(user, context);
      return {
        ...user,
        ...avatarData,
        avatarHTML: await this.createUnifiedAvatar(user, context, options)
      };
    }));

    console.log(`✅ Batch avatar update complete: ${results.length} avatars processed`);
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

console.log('AvatarUtils initialized');