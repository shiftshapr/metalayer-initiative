// Diagnostic Tool: Visibility Issue Analyzer
// Console-callable function to debug why users show up when on different pages

window.diagnoseVisibilityIssue = async function() {
  console.log('\n🔍 ========================================');
  console.log('🔍 VISIBILITY ISSUE DIAGNOSTIC');
  console.log('🔍 ========================================\n');

  const report = {
    timestamp: new Date().toISOString(),
    currentUser: null,
    currentPage: null,
    visibilityData: null,
    supabaseData: null,
    issues: []
  };

  try {
    // 1. Check current user
    console.log('📋 STEP 1: Checking current user...');
    const userEmail = await window.getCurrentUserEmail();
    report.currentUser = {
      email: userEmail,
      userId: window.currentUser?.userId,
      name: window.currentUser?.name
    };
    console.log('✅ Current user:', report.currentUser);

    // 2. Check current page
    console.log('\n📋 STEP 2: Checking current page...');
    const tab = await chrome.tabs.query({ active: true, currentWindow: true });
    const actualUrl = tab[0]?.url;
    
    report.currentPage = {
      actualUrl: actualUrl,
      cachedUrl: window.cachedUrlData?.rawUrl,
      cachedPageId: window.cachedUrlData?.pageId,
      realtimePageId: window.supabaseRealtimeClient?.currentPage?.pageId,
      realtimePageUrl: window.supabaseRealtimeClient?.currentPage?.pageUrl
    };
    
    console.log('   Actual browser URL:', actualUrl);
    console.log('   Cached URL:', report.currentPage.cachedUrl);
    console.log('   Cached page_id:', report.currentPage.cachedPageId);
    console.log('   Realtime page_id:', report.currentPage.realtimePageId);
    console.log('   Realtime page URL:', report.currentPage.realtimePageUrl);

    // Check for mismatches
    if (actualUrl !== report.currentPage.cachedUrl) {
      const issue = `⚠️ MISMATCH: Actual URL (${actualUrl}) != Cached URL (${report.currentPage.cachedUrl})`;
      console.warn(issue);
      report.issues.push(issue);
    }
    
    if (actualUrl !== report.currentPage.realtimePageUrl) {
      const issue = `⚠️ MISMATCH: Actual URL (${actualUrl}) != Realtime URL (${report.currentPage.realtimePageUrl})`;
      console.warn(issue);
      report.issues.push(issue);
    }

    // 3. Check visibility data in memory
    console.log('\n📋 STEP 3: Checking visibility data in memory...');
    report.visibilityData = {
      count: window.currentVisibilityData?.active?.length || 0,
      users: window.currentVisibilityData?.active?.map(u => ({
        email: u.email,
        name: u.name,
        lastSeen: u.lastSeen,
        enterTime: u.enterTime,
        isActive: u.isActive,
        pageId: 'N/A' // Not stored in visibility data
      })) || []
    };
    
    console.log(`   Found ${report.visibilityData.count} users in visibility list:`);
    report.visibilityData.users.forEach((u, i) => {
      console.log(`   ${i+1}. ${u.email} - Active: ${u.isActive}, Enter: ${u.enterTime}`);
    });

    // 4. Check Supabase user_presence table directly
    console.log('\n📋 STEP 4: Checking Supabase user_presence table...');
    
    if (!window.supabaseRealtimeClient?.supabase) {
      console.error('❌ Supabase client not initialized!');
      report.issues.push('Supabase client not initialized');
    } else {
      // Query for ALL records for current user
      const { data: myPresence, error: myError } = await window.supabaseRealtimeClient.supabase
        .from('user_presence')
        .select('*')
        .eq('user_email', userEmail);

      if (myError) {
        console.error('❌ Error querying my presence:', myError);
        report.issues.push(`Supabase query error: ${myError.message}`);
      } else {
        console.log(`\n   📊 MY PRESENCE RECORDS (${myPresence.length} total):`);
        myPresence.forEach((record, i) => {
          console.log(`   ${i+1}. Page: ${record.page_id}`);
          console.log(`      URL: ${record.page_url}`);
          console.log(`      Active: ${record.is_active}`);
          console.log(`      Last seen: ${record.last_seen}`);
          console.log(`      Enter time: ${record.enter_time}`);
          console.log('');

          // Check for stale presence
          if (record.page_id !== report.currentPage.cachedPageId && record.is_active) {
            const issue = `⚠️ GHOST PRESENCE: Still marked active on old page: ${record.page_id}`;
            console.warn(`      ${issue}`);
            report.issues.push(issue);
          }
        });
      }

      // Query for ALL records for current page
      const pageId = report.currentPage.cachedPageId || report.currentPage.realtimePageId;
      if (pageId) {
        const { data: pagePresence, error: pageError } = await window.supabaseRealtimeClient.supabase
          .from('user_presence')
          .select('*')
          .eq('page_id', pageId)
          .eq('is_active', true);

        if (pageError) {
          console.error('❌ Error querying page presence:', pageError);
          report.issues.push(`Supabase page query error: ${pageError.message}`);
        } else {
          console.log(`\n   📊 ACTIVE USERS ON CURRENT PAGE (${pagePresence.length} total):`);
          pagePresence.forEach((record, i) => {
            console.log(`   ${i+1}. User: ${record.user_email}`);
            console.log(`      Active: ${record.is_active}`);
            console.log(`      Last seen: ${record.last_seen}`);
            console.log(`      Enter time: ${record.enter_time}`);
            
            // Check if last_seen is stale
            const lastSeen = new Date(record.last_seen);
            const ageSeconds = (Date.now() - lastSeen.getTime()) / 1000;
            console.log(`      Age: ${ageSeconds.toFixed(1)}s ago`);
            
            if (ageSeconds > 30) {
              const issue = `⚠️ STALE PRESENCE: ${record.user_email} last seen ${ageSeconds.toFixed(1)}s ago (>30s threshold)`;
              console.warn(`      ${issue}`);
              report.issues.push(issue);
            }
            console.log('');
          });

          report.supabaseData = {
            myRecords: myPresence?.length || 0,
            pageRecords: pagePresence?.length || 0,
            pageUsers: pagePresence?.map(r => r.user_email) || []
          };
        }
      }
    }

    // 5. Check backend API response
    console.log('\n📋 STEP 5: Checking backend API response...');
    try {
      const result = await chrome.storage.local.get(['activeCommunities']);
      const communities = result.activeCommunities || ['comm-001'];
      
      // Call backend API
      const API_URL = window.METALAYER_API_URL || 'https://api.themetalayer.org';
      const user = await window.authManager.getCurrentUser();
      
      const response = await fetch(`${API_URL}/v1/presence/url?url=${encodeURIComponent(actualUrl)}&communityIds=${communities.join(',')}&minutes=0.5`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
          'x-user-name': user.name || user.email,
          'x-user-avatar': user.avatarUrl || ''
        }
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const apiData = await response.json();
      
      console.log(`   Backend returned ${apiData.active?.length || 0} active users:`);
      apiData.active?.forEach((u, i) => {
        console.log(`   ${i+1}. ${u.email} - Active: ${u.isActive}, Page: ${apiData.pageId}`);
      });

      report.backendData = {
        pageId: apiData.pageId,
        userCount: apiData.active?.length || 0,
        users: apiData.active?.map(u => u.email) || []
      };

      // Check for discrepancies
      if (apiData.pageId !== pageId) {
        const issue = `⚠️ MISMATCH: Backend page_id (${apiData.pageId}) != Frontend page_id (${pageId})`;
        console.warn(issue);
        report.issues.push(issue);
      }

    } catch (error) {
      console.error('❌ Backend API error:', error);
      report.issues.push(`Backend API error: ${error.message}`);
    }

    // 6. Summary
    console.log('\n📋 DIAGNOSTIC SUMMARY:');
    console.log('========================================');
    if (report.issues.length === 0) {
      console.log('✅ No issues detected!');
    } else {
      console.log(`❌ Found ${report.issues.length} issue(s):`);
      report.issues.forEach((issue, i) => {
        console.log(`   ${i+1}. ${issue}`);
      });
    }
    console.log('========================================\n');

    // Return full report
    window.lastVisibilityDiagnostic = report;
    console.log('📋 Full report saved to: window.lastVisibilityDiagnostic');
    console.log('📋 To view: console.log(window.lastVisibilityDiagnostic)');
    
    return report;

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    report.issues.push(`Diagnostic error: ${error.message}`);
    return report;
  }
};

console.log('✅ Visibility diagnostic loaded! Run: diagnoseVisibilityIssue()');



