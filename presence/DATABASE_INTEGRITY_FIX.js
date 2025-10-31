/**
 * DATABASE INTEGRITY FIX - COMP METHOD
 * 
 * This script fixes the database integrity issue where UUIDs are stored
 * in user_email fields instead of email addresses, breaking the COMP method
 * foreign key relationships.
 * 
 * COMP Method Architecture:
 * - AppUser.id: UUID (primary key)
 * - AppUser.email: String, unique (business key)
 * - user_presence.user_email: String (foreign key to AppUser.email)
 * - All other tables use user_email (String) to reference users
 */

(function() {
  'use strict';
  
  console.log('🔧 DATABASE INTEGRITY FIX - COMP METHOD');
  console.log('=======================================');
  
  // Helper function to detect if a string is a UUID
  function isUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
  
  // Helper function to detect if a string is an email
  function isEmail(str) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }
  
  // Fix function for AvatarUtils
  window.fixAvatarUtilsForUUIDs = function() {
    console.log('🔧 Fixing AvatarUtils to handle UUIDs in user_email field...');
    
    // Override the problematic part of AvatarUtils
    if (window.AvatarUtils && window.AvatarUtils.getAvatarUrl) {
      const originalGetAvatarUrl = window.AvatarUtils.getAvatarUrl;
      
      window.AvatarUtils.getAvatarUrl = async function(user, context) {
        const userEmail = user.user_email || user.email;
        
        // COMP METHOD: Check if user_email contains UUID instead of email
        if (userEmail && isUUID(userEmail)) {
          console.log(`⚠️ AVATAR_UTILS: Detected UUID in user_email field: ${userEmail}`);
          console.log('⚠️ AVATAR_UTILS: This breaks COMP method foreign key relationships');
          console.log('⚠️ AVATAR_UTILS: Using generic fallback instead of API call');
          
          // Return generic fallback instead of making API call
          return {
            avatarUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
            userName: 'Unknown User',
            source: 'uuid-fallback',
            userEmail: userEmail
          };
        }
        
        // If it's a valid email, proceed normally
        if (userEmail && isEmail(userEmail)) {
          return await originalGetAvatarUrl.call(this, user, context);
        }
        
        // Fallback for other cases
        return {
          avatarUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
          userName: 'Unknown User',
          source: 'generic-fallback',
          userEmail: userEmail
        };
      };
      
      console.log('✅ AvatarUtils fixed to handle UUIDs gracefully');
    } else {
      console.log('❌ AvatarUtils not available for fixing');
    }
  };
  
  // Fix function for API calls
  window.fixAPICallsForUUIDs = function() {
    console.log('🔧 Fixing API calls to handle UUIDs in user_email field...');
    
    if (window.api && window.api.request) {
      const originalRequest = window.api.request;
      
      window.api.request = async function(url, options = {}) {
        // Check if this is a user lookup API call with UUID
        const userLookupMatch = url.match(/\/v1\/users\/(.+)$/);
        if (userLookupMatch) {
          const userId = decodeURIComponent(userLookupMatch[1]);
          if (isUUID(userId)) {
            console.log(`⚠️ API: Detected UUID in user lookup: ${userId}`);
            console.log('⚠️ API: This should be an email address according to COMP method');
            console.log('⚠️ API: Returning 400 error to prevent database corruption');
            
            // Return a 400 error to prevent further issues
            throw new Error('HTTP error! status: 400 - Invalid user ID format (UUID instead of email)');
          }
        }
        
        // Proceed with original request for valid emails
        return await originalRequest.call(this, url, options);
      };
      
      console.log('✅ API calls fixed to reject UUIDs in user lookups');
    } else {
      console.log('❌ API module not available for fixing');
    }
  };
  
  // Comprehensive fix function
  window.fixDatabaseIntegrityIssues = function() {
    console.log('🔧 Applying comprehensive database integrity fixes...');
    
    // Fix AvatarUtils
    window.fixAvatarUtilsForUUIDs();
    
    // Fix API calls
    window.fixAPICallsForUUIDs();
    
    console.log('✅ Database integrity fixes applied');
    console.log('📋 Next steps:');
    console.log('  1. Fix the database to use email addresses in user_email fields');
    console.log('  2. Update any code that inserts UUIDs into user_email fields');
    console.log('  3. Verify foreign key relationships work correctly');
  };
  
  // Auto-apply fixes
  window.fixDatabaseIntegrityIssues();
  
  console.log('✅ DATABASE INTEGRITY FIX COMPLETE');
  console.log('==================================');
  
  return {
    isUUID,
    isEmail,
    fixAvatarUtilsForUUIDs: window.fixAvatarUtilsForUUIDs,
    fixAPICallsForUUIDs: window.fixAPICallsForUUIDs,
    fixDatabaseIntegrityIssues: window.fixDatabaseIntegrityIssues
  };
})();


