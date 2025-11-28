// API ZERO USERS COMPREHENSIVE DIAGNOSTIC
// Run this in the browser console to diagnose why API returns 0 users

(async function() {
  console.log('🔍 === API ZERO USERS DIAGNOSTIC START ===');
  
  const currentUrlData = window.currentUrlData || {};
  const pageId = currentUrlData.pageId || 'google_com_';
  const pageUrl = currentUrlData.normalizedUrl || 'google.com/';
  
  console.log('\n--- Current Page Context ---');
  console.log('Page ID:', pageId);
  console.log('Page URL:', pageUrl);
  console.log('Current User ID:', window.currentUser?.id);
  console.log('Current User Email:', window.currentUser?.email);
  
  console.log('\n--- Step 1: Test API Endpoint Directly ---');
  try {
    const apiResponse = await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`, { method: 'GET' });
    console.log('✅ API Response:', apiResponse);
    console.log('✅ Users returned:', apiResponse?.active?.length || 0);
    if (apiResponse?.active && apiResponse.active.length > 0) {
      console.log('✅ Users:', apiResponse.active.map(u => ({ name: u.name, id: u.id, status: u.status })));
    } else {
      console.warn('⚠️ API returned 0 users');
    }
  } catch (error) {
    console.error('❌ API Call failed:', error);
  }
  
  console.log('\n--- Step 2: Direct Supabase Query (if available) ---');
  if (window.supabase && window.supabaseClient) {
    try {
      // Query user_presence directly
      const { data: presenceData, error: presenceError } = await window.supabaseClient
        .from('user_presence')
        .select(`
          *,
          AppUser (
            id,
            email,
            name,
            avatarUrl,
            auraColor
          )
        `)
        .eq('page_id', pageId)
        .order('last_seen', { ascending: false });
      
      if (presenceError) {
        console.error('❌ Supabase query error:', presenceError);
      } else {
        console.log('✅ Direct Supabase query found:', presenceData?.length || 0, 'presence records');
        if (presenceData && presenceData.length > 0) {
          presenceData.forEach((p, idx) => {
            const lastSeen = p.last_seen ? new Date(p.last_seen) : null;
            const diffMs = lastSeen ? (Date.now() - lastSeen.getTime()) : null;
            const diffMinutes = diffMs ? Math.floor(diffMs / 60000) : null;
            const cutoff24h = new Date(Date.now() - (24 * 60 * 60 * 1000));
            const within24h = lastSeen && lastSeen >= cutoff24h;
            
            console.log(`   Record ${idx + 1}:`);
            console.log(`     user_id: ${p.user_id}`);
            console.log(`     page_id: ${p.page_id}`);
            console.log(`     last_seen: ${p.last_seen} (${diffMinutes} minutes ago)`);
            console.log(`     Within 24h: ${within24h ? '✅ YES' : '❌ NO'}`);
            console.log(`     is_active: ${p.is_active}`);
            console.log(`     AppUser present: ${p.AppUser ? '✅ YES' : '❌ NO'}`);
            if (p.AppUser) {
              console.log(`     AppUser name: ${p.AppUser.name}`);
              console.log(`     AppUser email: ${p.AppUser.email}`);
            }
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Direct Supabase query not available:', error);
    }
  } else {
    console.warn('⚠️ Supabase client not available in window');
  }
  
  console.log('\n--- Step 3: Check Backend Logs Instructions ---');
  console.log('If API returns 0 but Supabase query finds users, check backend server logs for:');
  console.log('   - "Query WITHOUT date filter found X users"');
  console.log('   - "Query WITH date filter found X users"');
  console.log('   - "Date filter is excluding all users"');
  console.log('   - Prisma query errors');
  console.log('\nTo check backend logs, run on server:');
  console.log('   tail -100 /home/ubuntu/canopi/server.log | grep PRESENCE_SERVICE');
  
  console.log('\n--- Step 4: Server Restart Check ---');
  console.log('⚠️ IMPORTANT: Backend code changes require server restart!');
  console.log('If you just updated presenceService.js, restart the server:');
  console.log('   pm2 restart app  (if using PM2)');
  console.log('   OR kill and restart the node process');
  
  console.log('\n--- Step 5: API vs Database Comparison ---');
  const apiUsers = (await window.api.request(`/v1/presence/url?url=${encodeURIComponent(pageUrl)}`, { method: 'GET' }))?.active || [];
  
  if (window.supabaseClient) {
    const { data: dbUsers } = await window.supabaseClient
      .from('user_presence')
      .select('*, AppUser(*)')
      .eq('page_id', pageId);
    
    console.log('API returned:', apiUsers.length, 'users');
    console.log('Database has:', dbUsers?.length || 0, 'presence records');
    
    if (apiUsers.length === 0 && dbUsers && dbUsers.length > 0) {
      console.error('❌ MISMATCH: Database has users but API returns 0!');
      console.error('   This indicates a backend filtering issue.');
      console.error('   Check backend logs for Prisma query results.');
    } else if (apiUsers.length === dbUsers?.length) {
      console.log('✅ Counts match');
    }
  }
  
  console.log('\n🔍 === API ZERO USERS DIAGNOSTIC END ===');
  
  return {
    pageId,
    pageUrl,
    apiUsersCount: apiUsers.length,
    currentUserId: window.currentUser?.id,
    timestamp: new Date().toISOString()
  };
})();

