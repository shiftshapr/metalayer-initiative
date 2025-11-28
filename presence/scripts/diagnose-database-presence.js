/**
 * Database Presence Diagnostic
 * 
 * Analyzes presence data in the database to understand why profiles aren't showing up.
 * Checks:
 * 1. What presence records exist for google.com
 * 2. How page_id is normalized/stored
 * 3. Whether data exists but query is wrong
 * 4. Whether visibility settings are filtering users
 */

(function() {
  'use strict';

  async function diagnoseDatabasePresence() {
    console.group('🔍 Database Presence Diagnostic');
    
    if (!window.supabase) {
      console.error('❌ Supabase client not available');
      console.groupEnd();
      return;
    }

    // Get current page context
    const currentUrl = window.location?.href || 'unknown';
    const currentUrlData = window.currentUrlData || {};
    const pageId = currentUrlData.pageId || 'google_com_';
    
    console.log('Current URL:', currentUrl);
    console.log('Current pageId:', pageId);
    console.log('currentUrlData:', currentUrlData);

    // Try multiple page_id variations for google.com
    const pageIdVariations = [
      pageId,
      'google_com_',
      'google.com',
      'https://www.google.com/',
      'https://www.google.com',
      'www.google.com',
      'google.com/'
    ];

    console.group('📊 Step 1: Query user_presence table');
    for (const testPageId of pageIdVariations) {
      try {
        console.log(`\n🔍 Querying page_id: "${testPageId}"`);
        
        const { data, error } = await window.supabase
          .from('user_presence')
          .select('*, AppUser(*)')
          .eq('page_id', testPageId);

        if (error) {
          console.error(`  ❌ Error:`, error);
        } else {
          console.log(`  ✅ Found ${data?.length || 0} records`);
          if (data && data.length > 0) {
            console.table(data.map(record => ({
              user_id: record.user_id,
              user_name: record.user_name,
              page_id: record.page_id,
              page_url: record.page_url,
              is_active: record.is_active,
              last_seen: record.last_seen,
              enter_time: record.enter_time,
              user_email: record.AppUser?.email || 'N/A',
              user_name_from_appuser: record.AppUser?.name || 'N/A'
            })));
          }
        }
      } catch (err) {
        console.error(`  ❌ Exception querying "${testPageId}":`, err);
      }
    }
    console.groupEnd();

    // Check all presence records (to see what page_ids actually exist)
    console.group('📊 Step 2: All presence records (last 20)');
    try {
      const { data, error } = await window.supabase
        .from('user_presence')
        .select('*, AppUser(*)')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ Error:', error);
      } else {
        console.log(`✅ Found ${data?.length || 0} total recent records`);
        if (data && data.length > 0) {
          console.table(data.map(record => ({
            user_id: record.user_id,
            user_name: record.user_name,
            page_id: record.page_id,
            page_url: record.page_url?.substring(0, 50),
            is_active: record.is_active,
            last_seen: record.last_seen,
            updated_at: record.updated_at,
            user_email: record.AppUser?.email || 'N/A'
          })));
          
          // Group by page_id to see what pages have presence
          const pageIdGroups = {};
          data.forEach(record => {
            const pid = record.page_id;
            if (!pageIdGroups[pid]) {
              pageIdGroups[pid] = [];
            }
            pageIdGroups[pid].push(record);
          });
          
          console.log('\n📋 Presence records grouped by page_id:');
          Object.keys(pageIdGroups).forEach(pid => {
            console.log(`  ${pid}: ${pageIdGroups[pid].length} user(s)`);
          });
        }
      }
    } catch (err) {
      console.error('❌ Exception:', err);
    }
    console.groupEnd();

    // Check if there's a 'presence' table (old name) vs 'user_presence'
    console.group('📊 Step 3: Check table names');
    try {
      // Try querying 'presence' table (old name that might still be used - but should be user_presence)
      const { data: presenceData, error: presenceError } = await window.supabase
        .from('presence')
        .select('*')
        .limit(5)
        .catch(() => ({ data: null, error: { message: 'Table does not exist' } }));
      
      if (presenceError) {
        console.log('ℹ️ "presence" table does not exist (expected if using user_presence)');
      } else {
        console.warn('⚠️ "presence" table exists! Found', presenceData?.length || 0, 'records');
        console.log('This might be the issue - code might be querying wrong table');
      }
    } catch (err) {
      console.log('ℹ️ "presence" table does not exist (expected)');
    }
    console.groupEnd();

    // Check current user visibility settings
    console.group('📊 Step 4: Current User Visibility');
    const currentUser = window.currentUser;
    if (currentUser) {
      console.log('Current user:', {
        id: currentUser.id,
        email: currentUser.email,
        isVisible: currentUser.isVisible,
        visibilityEnabled: currentUser.visibilityEnabled
      });
      
      // Check Chrome storage
      try {
        const storage = await chrome.storage.local.get(['visibilityEnabled', 'isVisible']);
        console.log('Chrome storage visibility:', storage);
      } catch (err) {
        console.log('Could not read Chrome storage:', err);
      }
    } else {
      console.warn('⚠️ No current user found');
    }
    console.groupEnd();

    // Check what VisibilityManager is actually querying
    console.group('📊 Step 5: VisibilityManager Query Check');
    if (window.supabaseRealtimeClient && typeof window.supabaseRealtimeClient.getPageUsers === 'function') {
      try {
        console.log('Testing getPageUsers with pageId:', pageId);
        const users = await window.supabaseRealtimeClient.getPageUsers(pageId);
        console.log('getPageUsers returned:', users?.length || 0, 'users');
        if (users && users.length > 0) {
          console.table(users.map(u => ({
            id: u.id,
            email: u.email,
            name: u.name,
            page_id: u.page_id,
            isActive: u.isActive,
            lastSeen: u.lastSeen
          })));
        }
      } catch (err) {
        console.error('Error calling getPageUsers:', err);
      }
    } else {
      console.warn('⚠️ supabaseRealtimeClient.getPageUsers not available');
    }
    console.groupEnd();

    console.groupEnd();
  }

  if (typeof window !== 'undefined') {
    window.diagnoseDatabasePresence = diagnoseDatabasePresence;
    console.log('✅ Database Presence Diagnostic loaded. Run window.diagnoseDatabasePresence()');
  }
})();

