/**
 * Diagnostic Script: Visibility Profiles Not Showing
 * 
 * This script diagnoses why two profiles on the same page (google.com) don't see each other.
 * 
 * Usage: Run in browser console
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Visibility Profiles Not Showing');
  console.log('===============================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    currentPageId: null,
    databasePresenceRecords: [],
    visibilityUsers: [],
    issues: [],
    recommendations: []
  };

  // 1. Check current pageId from state
  console.log('1. Checking Current PageId...');
  const win = window;
  const urlData = win.currentUrlData;
  const currentPageId = urlData?.pageId;
  results.currentPageId = currentPageId;
  console.log('   Current PageId (from state):', currentPageId);
  console.log('');

  // 2. Check visibility users from state
  console.log('2. Checking Visibility Users...');
  const moduleGraph = win.__CANOPI_MODULE_GRAPH__;
  const visibilityState = moduleGraph?.visibilityManager?.getState?.();
  const visibilityUsers = visibilityState?.getUsers?.() || [];
  results.visibilityUsers = visibilityUsers;
  console.log('   Users:', { count: visibilityUsers.length, users: visibilityUsers });
  console.log('');

  // 3. Check database directly for presence records
  console.log('3. Checking Database Presence Records...');
  (async function() {
    try {
      const supabase = win.supabase;
      if (!supabase) {
        results.issues.push('Supabase client not available on window');
        console.log('   ❌ Supabase client not available');
        return;
      }

      // Query all presence records for current pageId
      if (currentPageId) {
        const { data: presenceData, error: presenceError } = await supabase
          .from('user_presence')
          .select('user_id, page_id, last_seen, is_active, AppUser(email, name, handle)')
          .eq('page_id', currentPageId);

        if (presenceError) {
          results.issues.push(`Database query error: ${presenceError.message}`);
          console.log('   ❌ Database query error:', presenceError);
        } else {
          results.databasePresenceRecords = presenceData || [];
          console.log('   Database records for pageId "' + currentPageId + '":', {
            count: presenceData?.length || 0,
            records: presenceData || []
          });

          // Check for records with similar pageIds (in case of normalization issues)
          const { data: allPresenceData } = await supabase
            .from('user_presence')
            .select('user_id, page_id, last_seen, is_active')
            .eq('is_active', true)
            .limit(20);

          console.log('   All active presence records (first 20):', {
            count: allPresenceData?.length || 0,
            pageIds: allPresenceData?.map(r => r.page_id) || []
          });

          // Check for google.com related pageIds
          const googlePageIds = (allPresenceData || []).filter(r => 
            r.page_id && (r.page_id.includes('google') || r.page_id.includes('com'))
          );
          if (googlePageIds.length > 0) {
            console.log('   Google-related pageIds found:', googlePageIds.map(r => ({
              page_id: r.page_id,
              user_id: r.user_id,
              is_active: r.is_active
            })));
            if (googlePageIds.length > 0 && googlePageIds[0].page_id !== currentPageId) {
              results.issues.push(`PageId mismatch: Current pageId is "${currentPageId}" but database has "${googlePageIds[0].page_id}"`);
              results.recommendations.push('Check pageId normalization - different pageIds for same domain');
            }
          }
        }
      } else {
        results.issues.push('No currentPageId available');
        console.log('   ⚠️ No currentPageId available');
      }

      // 4. Check VisibilityManager status
      console.log('');
      console.log('4. Checking VisibilityManager Status...');
      const visibilityManager = moduleGraph?.visibilityManager;
      if (visibilityManager) {
        const status = visibilityManager.getStatus?.();
        console.log('   VisibilityManager Status:', status);
        
        if (status?.currentPageId !== currentPageId) {
          results.issues.push(`VisibilityManager currentPageId (${status?.currentPageId}) doesn't match state currentPageId (${currentPageId})`);
        }
      } else {
        results.issues.push('VisibilityManager not available in module graph');
        console.log('   ❌ VisibilityManager not available');
      }

      // 5. Test manual refresh
      console.log('');
      console.log('5. Testing Manual Refresh...');
      if (currentPageId && visibilityManager) {
        try {
          console.log('   Attempting manual refresh with pageId:', currentPageId);
          const refreshedUsers = await visibilityManager.refreshVisibilityAvatars(currentPageId);
          console.log('   ✅ Manual refresh completed:', { userCount: refreshedUsers?.length || 0 });
          
          const stateAfterRefresh = visibilityManager.getState?.();
          const usersAfterRefresh = stateAfterRefresh?.getUsers?.() || [];
          console.log('   VisibilityState after refresh:', { count: usersAfterRefresh.length, users: usersAfterRefresh });
          
          if (refreshedUsers.length === 0 && results.databasePresenceRecords.length > 0) {
            results.issues.push('Manual refresh returned 0 users but database has records - query mismatch');
            results.recommendations.push('Check getPageUsers query logic - may be filtering incorrectly');
          }
        } catch (refreshError) {
          results.issues.push(`Manual refresh failed: ${refreshError.message}`);
          console.log('   ❌ Manual refresh failed:', refreshError);
        }
      }

      // 6. Check pageId generation
      console.log('');
      console.log('6. Checking PageId Generation...');
      const currentUrl = window.location.href;
      console.log('   Current URL:', currentUrl);
      console.log('   Current PageId:', currentPageId);
      
      // Try to normalize URL manually
      try {
        const urlObj = new URL(currentUrl);
        const hostname = urlObj.hostname.replace(/^www\./, '');
        const normalizedUrl = hostname + urlObj.pathname;
        const expectedPageId = normalizedUrl.replace(/[^a-zA-Z0-9]/g, '_');
        console.log('   Expected PageId (from URL normalization):', expectedPageId);
        
        if (expectedPageId !== currentPageId) {
          results.issues.push(`PageId mismatch: Expected "${expectedPageId}" but got "${currentPageId}"`);
          results.recommendations.push('Check URL normalization logic - pageId generation may be inconsistent');
        }
      } catch (urlError) {
        console.log('   ⚠️ Could not parse URL:', urlError);
      }

      // Summary
      console.log('');
      console.log('================================================');
      console.log('📊 DIAGNOSTIC SUMMARY');
      console.log('================================================');
      console.log('Issues Found:', results.issues.length);
      results.issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
      
      if (results.recommendations.length > 0) {
        console.log('');
        console.log('Recommendations:');
        results.recommendations.forEach((rec, i) => {
          console.log(`   ${i + 1}. ${rec}`);
        });
      }

      console.log('');
      console.log('📋 Full Results:', JSON.stringify(results, null, 2));

      return results;
    } catch (error) {
      console.error('❌ Diagnostic error:', error);
      results.issues.push(`Diagnostic script error: ${error.message}`);
      return results;
    }
  })();

  // Return promise for async results
  return new Promise((resolve) => {
    setTimeout(() => resolve(results), 2000);
  });
})();

