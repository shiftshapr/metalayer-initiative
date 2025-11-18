/**
 * UserNameExtractor - Loosely coupled utility for extracting user names
 * Handles various sources: Google profile, user metadata, email fallback
 */

class UserNameExtractor {
  /**
   * Extract user name from various sources with fallback chain
   * @param {Object} user - User object from any source
   * @returns {string} - Best available user name
   */
  static extractUserName(user) {
    if (!user) return 'User';
    
    // Priority 1: Google profile full name from user_metadata
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    // Priority 2: Direct name field
    if (user.name) {
      return user.name;
    }
    
    // Priority 3: Google profile name from metadata
    if (user.user_metadata?.name) {
      return user.user_metadata.name;
    }
    
    // Priority 4: Email prefix fallback
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    // Priority 5: User email from different field
    if (user.user_email) {
      return user.user_email.split('@')[0];
    }
    
    // Final fallback
    return 'User';
  }
  
  /**
   * Extract user name with Google Chrome profile priority
   * @param {Object} user - User object
   * @returns {string} - User name with Google profile priority
   */
  static extractGoogleUserName(user) {
    if (!user) return 'User';
    
    // Google Chrome profile has highest priority
    if (user.provider === 'chrome_profile' && user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    // Fall back to standard extraction
    return this.extractUserName(user);
  }
  
  /**
   * Extract user name for database storage
   * @param {Object} user - User object
   * @returns {string} - User name suitable for database
   */
  static extractForDatabase(user) {
    const name = this.extractGoogleUserName(user);
    
    // Sanitize for database storage
    return name.trim().substring(0, 100); // Limit length
  }
  
  /**
   * Extract user name for display
   * @param {Object} user - User object
   * @returns {string} - User name suitable for display
   */
  static extractForDisplay(user) {
    return this.extractGoogleUserName(user);
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.UserNameExtractor = UserNameExtractor;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserNameExtractor;
}


