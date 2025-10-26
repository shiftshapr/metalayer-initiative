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
    console.log(`Getting avatar for ${user.user_email || user.email} in context: ${context}`);
    
    let avatarUrl = null;
    let userName = user.user_email?.split('@')[0] || user.email?.split('@')[0] || 'user';
    let userHandle = userName;
    let avatarSource = 'none';

    try {
      // SD1 FIX: PRIORITY 1 - Check if user object already has avatar_url (from user_presence table)
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
      
      // PRIORITY 2: For current user, use user_metadata (same as profile avatar system)
      if (!avatarUrl) {
        const currentUser = window.currentUser || {};
        if ((user.user_email || user.email) === currentUser.email && currentUser.user_metadata?.avatar_url) {
          avatarUrl = currentUser.user_metadata.avatar_url;
          userName = currentUser.user_metadata.full_name || userName;
          avatarSource = 'current_user_metadata';
          console.log(`✅ Using current user metadata for ${user.user_email || user.email} - avatarUrl: ${avatarUrl}`);
        }
      }
      
      // PRIORITY 3: For other users, use visibility data (same as profile avatar system)
      if (!avatarUrl) {
        console.log(`🔍 SD1 AVATAR DEBUG: Checking visibility data for ${user.user_email || user.email}`);
        console.log(`🔍 SD1 AVATAR DEBUG: currentVisibilityDataUnfiltered exists: ${!!window.currentVisibilityDataUnfiltered}`);
        
        if (window.currentVisibilityDataUnfiltered && window.currentVisibilityDataUnfiltered.active) {
          console.log(`🔍 SD1 AVATAR DEBUG: visibility data active array length: ${window.currentVisibilityDataUnfiltered.active.length}`);
          console.log(`🔍 SD1 AVATAR DEBUG: visibility data users:`, window.currentVisibilityDataUnfiltered.active.map(u => ({
            email: u.email,
            userId: u.userId,
            id: u.id,
            avatarUrl: u.avatarUrl
          })));
          
          const userInVisibility = window.currentVisibilityDataUnfiltered.active.find(
            u => u.email === (user.user_email || user.email) || 
                 u.userId === (user.user_email || user.email) || 
                 u.id === (user.user_email || user.email)
          );
          
          console.log(`🔍 SD1 AVATAR DEBUG: userInVisibility found: ${!!userInVisibility}`);
          if (userInVisibility) {
            console.log(`🔍 SD1 AVATAR DEBUG: userInVisibility details:`, userInVisibility);
          }
          
          if (userInVisibility && userInVisibility.avatarUrl) {
            avatarUrl = userInVisibility.avatarUrl;
            userName = userInVisibility.name || userName;
            avatarSource = 'visibility_data';
            console.log(`✅ Found REAL avatar in visibility data for ${user.user_email || user.email} - avatarUrl: ${avatarUrl}`);
          } else {
            console.log(`ℹ️ User ${user.user_email || user.email} not found in visibility data`);
            
            // COMP METHOD: Try to get avatar from database directly for remote users
            try {
              if (window.supabase && window.supabase.from) {
                const userEmail = user.user_email || user.email;
                
                // Query database for user avatar data
                if (userEmail) {
                  const { data: userData, error } = await window.supabase
                    .from('user_presence')
                    .select('avatar_url, user_name, aura_color')
                    .eq('user_email', userEmail)
                    .order('updated_at', { ascending: false })
                    .limit(1);
                  
                  if (!error && userData && userData.length > 0 && userData[0].avatar_url) {
                    avatarUrl = userData[0].avatar_url;
                    userName = userData[0].user_name || userName;
                    avatarSource = 'database_direct';
                    console.log(`✅ Found avatar in database for ${userEmail} - avatarUrl: ${avatarUrl}`);
                  } else if (error) {
                    console.log(`⚠️ Database query failed for ${userEmail}:`, error.message);
                  }
                } else {
                  console.log(`⚠️ Skipping database lookup for test email: ${userEmail}`);
                }
              }
            } catch (dbError) {
              console.log(`⚠️ Database lookup failed for ${user.user_email || user.email}:`, dbError);
            }
          }
        } else {
          console.log(`ℹ️ No unfiltered visibility data available`);
        }
        
        // PRIORITY 3.5: Check if current user has real avatar in window.currentUser
        if (!avatarUrl && window.currentUser && (user.user_email || user.email) === window.currentUser.email) {
          if (window.currentUser.avatarUrl && !window.currentUser.avatarUrl.includes('default-user')) {
            avatarUrl = window.currentUser.avatarUrl;
            avatarSource = 'window_currentUser';
            console.log(`✅ Using window.currentUser avatar for ${user.user_email || user.email} - avatarUrl: ${avatarUrl}`);
          }
        }
      }
    } catch (error) {
      console.error(`Exception processing avatar for ${user.user_email || user.email}`, error, 'avatar');
    }

    // CRITICAL FIX: Enhanced avatar URL validation and fallback
    if (!avatarUrl || avatarUrl.trim() === '') {
      console.log(`⚠️ No avatar URL found, using generic for ${user.user_email || user.email}`);
      avatarUrl = `https://lh3.googleusercontent.com/a/default-user=s96-c`;
      avatarSource = 'generic-fallback';
    } else if (avatarUrl.includes('default-user')) {
      console.log(`⚠️ Avatar URL contains default-user, treating as generic for ${user.user_email || user.email}`);
      avatarSource = 'generic-fallback';
    } else if (!avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
      console.log(`⚠️ Invalid avatar URL format, using generic for ${user.user_email || user.email}: ${avatarUrl}`);
      avatarUrl = `https://lh3.googleusercontent.com/a/default-user=s96-c`;
      avatarSource = 'generic-fallback';
    } else {
      // SD1 FIX: Ensure we don't treat real avatars as generic
      console.log(`✅ SD1 FIX: Using REAL avatar for ${user.user_email || user.email}: ${avatarUrl}`);
    }

    console.log(`Avatar result: ${user.user_email || user.email} - avatarUrl: ${avatarUrl}, source: ${avatarSource}, name: ${userName}`);

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
    console.log(`Creating unified avatar for ${user.user_email || user.email} in context: ${context}`);

    const avatarData = await this.getAvatarUrl(user, context);
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

    console.log(`Avatar details: auraColor=${auraColor}, showAura=${showAura}, size=${size}, showStatus=${showStatus}`);

    // Status dot color based on activity
    const statusDotColor = user.is_active ? '#22c55e' : '#6b7280';

    let html = `<div style="position: relative; width: ${size}px; height: ${size}px;" data-user-email="${user.user_email || user.email}" data-user-id="${user.user_email || user.email}">`;
    
    if (showAura) {
      html += `<div style="position: absolute; top: -2px; left: -2px; width: ${size + 4}px; height: ${size + 4}px; border-radius: 50%; background-color: ${auraColor}; z-index: 1; border: 2px solid ${auraColor};"></div>`;
    }
    
    html += `<img src="${avatarUrl}" alt="${userName}" style="position: relative; z-index: 2; width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; border: 2px solid ${auraColor};" data-avatar-fallback="true" data-avatar-source="${avatarSource}" data-user-email="${user.user_email || user.email}" data-user-id="${user.user_email || user.email}">`;
    
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

