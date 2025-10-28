/**
 * AvatarUtils Checker - External file for CSP compliance
 * Ensures AvatarUtils is available before other modules load
 */

let retryCount = 0;
const MAX_RETRIES = 50; // Maximum 5 seconds of retries

// COMP METHOD: Ensure AvatarUtils is available before other modules load
function checkAvatarUtils() {
  if (typeof AvatarUtils === 'undefined') {
    retryCount++;
    if (retryCount < MAX_RETRIES) {
      console.warn(`⚠️ AvatarUtils not loaded! Retry ${retryCount}/${MAX_RETRIES}...`);
      setTimeout(checkAvatarUtils, 100);
    } else {
      console.error('🚨 CRITICAL: AvatarUtils failed to load after maximum retries!');
      // Create a fallback AvatarUtils to prevent crashes
      window.AvatarUtils = {
        getAvatarUrl: () => ({ avatarUrl: null, userName: 'User', source: 'fallback' }),
        createUnifiedAvatar: async (user) => `<div class="avatar" style="width: 32px; height: 32px; border-radius: 50%; background: ${window.AVATAR_FALLBACK_COLOR}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">${(user.name || user.email || 'U').charAt(0).toUpperCase()}</div>`
      };
    }
  } else {
    console.log('✅ AvatarUtils loaded successfully');
    // Make sure it's available globally
    window.AvatarUtils = AvatarUtils;
  }
}

// Start checking immediately
checkAvatarUtils();
