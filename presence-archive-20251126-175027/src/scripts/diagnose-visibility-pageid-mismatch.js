/**
 * Diagnostic Script: Visibility PageId Mismatch
 * 
 * This script diagnoses why users on the same page (google.com) don't see each other:
 * - Checks pageId normalization consistency
 * - Checks database presence records for pageId variations
 * - Identifies if query is too strict (exact match vs domain-based)
 * 
 * Usage: Run in browser console
 */

(async function() {
  console.log('🔍 DIAGNOSTIC: Visibility PageId Mismatch');
  console.log('================================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    currentPageId: null,
    normalizedUrl: null,
    rawUrl: null,
    pageIdVariations: [],
    databaseRecords: null,
    issues: []
  };

  // 1. Get current pageId and URL
  console.log('1. Checking Current PageId and URL...');
  try {
    const stateManager = window.stateManager || (window.__CANOPI_MODULE_GRAPH__ && window.__CANOPI_MODULE_GRAPH__.stateManager);
    if (stateManager) {
      let state;
      if (stateManager.getAll) {
        const getAllResult = stateManager.getAll();
        state = getAllResult instanceof Promise ? await getAllResult : getAllResult;
      } else if (stateManager.getState) {
        state = stateManager.getState();
      }
      
      if (state && state.currentUrlData) {
        results.currentPageId = state.currentUrlData.pageId;
        results.rawUrl = state.currentUrlData.rawUrl;
        results.normalizedUrl = state.currentUrlData.normalizedUrl;
        console.log('   Current PageId:', results.currentPageId);
        console.log('   Raw URL:', results.rawUrl);
        console.log('   Normalized URL:', results.normalizedUrl);
      }
    }
  } catch (error) {
    results.issues.push('Error getting current pageId: ' + error.message);
    console.log('   ❌ Error:', error.message);
  }

  // 2. Test pageId normalization
  console.log('\n2. Testing PageId Normalization...');
  if (results.rawUrl && window.normalizeUrl) {
    try {
      const normalized = await window.normalizeUrl(results.rawUrl);
      console.log('   Normalized result:', normalized);
      
      if (normalized.pageId !== results.currentPageId) {
        results.issues.push('PageId mismatch: State has "' + results.currentPageId + '" but normalizeUrl returns "' + normalized.pageId + '"');
        console.log('   ❌ MISMATCH: State pageId="' + results.currentPageId + '", Normalized="' + normalized.pageId + '"');
      } else {
        console.log('   ✅ PageId matches normalized result');
      }
      
      // Generate possible pageId variations
      const urlObj = new URL(results.rawUrl);
      const hostname = urlObj.hostname.replace(/^www\./, '');
      const basePageId = hostname.replace(/[^a-zA-Z0-9]/g, '_');
      results.pageIdVariations = [
        basePageId,
        basePageId + '_',
        hostname.replace(/\./g, '_'),
        hostname.replace(/\./g, '_') + '_'
      ];
      console.log('   Possible pageId variations:', results.pageIdVariations);
    } catch (error) {
      results.issues.push('Error normalizing URL: ' + error.message);
      console.log('   ❌ Error:', error.message);
    }
  } else {
    results.issues.push('normalizeUrl function or rawUrl not available');
    console.log('   ⚠️ Cannot test normalization');
  }

  // 3. Check database records (if Supabase client available)
  console.log('\n3. Checking Database Presence Records...');
  try {
    const supabase = window.supabase;
    if (supabase && results.currentPageId) {
      // Query for exact pageId match
      const exactMatch = await supabase
        .from('user_presence')
        .select('user_id, page_id, last_seen, is_active')
        .eq('page_id', results.currentPageId)
        .eq('is_active', true);
      
      console.log('   Exact pageId match:', {
        count: exactMatch.data?.length || 0,
        pageId: results.currentPageId,
        records: exactMatch.data || []
      });
      
      // Query for all active users (to see what pageIds exist)
      const allActive = await supabase
        .from('user_presence')
        .select('user_id, page_id, last_seen, is_active')
        .eq('is_active', true)
        .limit(50);
      
      if (allActive.data && allActive.data.length > 0) {
        const pageIdCounts = {};
        allActive.data.forEach(function(record) {
          const pid = record.page_id;
          if (pid) {
            pageIdCounts[pid] = (pageIdCounts[pid] || 0) + 1;
          }
        });
        
        console.log('   All active presence records (sample):', {
          total: allActive.data.length,
          uniquePageIds: Object.keys(pageIdCounts).length,
          pageIdCounts: pageIdCounts
        });
        
        // Check if there are similar pageIds (same domain, different paths)
        const similarPageIds = Object.keys(pageIdCounts).filter(function(pid) {
          // Check if pageId starts with same domain pattern
          if (results.currentPageId && results.currentPageId.startsWith('google_com')) {
            return pid.startsWith('google_com');
          }
          return false;
        });
        
        if (similarPageIds.length > 0) {
          console.log('   ⚠️ Found similar pageIds (same domain):', similarPageIds);
          results.issues.push('Found ' + similarPageIds.length + ' similar pageIds for same domain - query may be too strict');
        }
      }
      
      results.databaseRecords = {
        exactMatch: exactMatch.data?.length || 0,
        allActive: allActive.data?.length || 0
      };
    } else {
      results.issues.push('Supabase client not available or no pageId');
      console.log('   ⚠️ Cannot query database');
    }
  } catch (error) {
    results.issues.push('Error querying database: ' + error.message);
    console.log('   ❌ Error:', error.message);
  }

  // 4. Check VisibilityManager query logic
  console.log('\n4. Checking VisibilityManager Query Logic...');
  const visibilityManager = window.__CANOPI_MODULE_GRAPH__ && window.__CANOPI_MODULE_GRAPH__.visibilityManager;
  if (visibilityManager && results.currentPageId) {
    try {
      const users = await visibilityManager.refreshVisibilityAvatars(results.currentPageId);
      console.log('   Query result:', {
        pageId: results.currentPageId,
        userCount: users.length,
        users: users.map(function(u) {
          return {
            id: u.id,
            name: u.name,
            pageId: u.pageId || u.page_id
          };
        })
      });
      
      if (users.length === 0 && results.databaseRecords && results.databaseRecords.allActive > 0) {
        results.issues.push('Query returned 0 users but database has active records - possible pageId mismatch');
        console.log('   ❌ Query returned 0 users but database has active records');
      }
    } catch (error) {
      results.issues.push('Error querying VisibilityManager: ' + error.message);
      console.log('   ❌ Error:', error.message);
    }
  } else {
    results.issues.push('VisibilityManager not available');
    console.log('   ⚠️ VisibilityManager not available');
  }

  // Summary
  console.log('\n================================================');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('================================================');
  console.log('Issues Found:', results.issues.length);
  for (var i = 0; i < results.issues.length; i++) {
    console.log('  ' + (i + 1) + '. ' + results.issues[i]);
  }
  
  console.log('\n✅ Expected Behavior:');
  console.log('  - Users on same domain should see each other');
  console.log('  - PageId normalization should be consistent');
  console.log('  - Database query should find users with matching pageId');
  
  console.log('\n🔧 Root Cause Analysis:');
  console.log('  1. PageId normalization: Check if same URL produces same pageId');
  console.log('  2. Database records: Check if presence records use consistent pageId format');
  console.log('  3. Query logic: Check if getPageUsers() uses exact match (may be too strict)');
  console.log('  4. Domain-based matching: Consider matching by domain instead of exact pageId');
  
  console.log('\n📋 Full Results:', JSON.stringify(results, null, 2));
  
  return results;
})();

