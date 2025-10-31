// API_DIAGNOSTIC_CONSOLE.js
// Enhanced diagnostic script for API issues
// Run this in the browser console to diagnose API problems

(async function() {
    console.log('🚀 API DIAGNOSTIC CONSOLE');
    console.log('==========================');
    
    // --- 1. Check API Module Availability ---
    console.log('\n--- 1. API Module Check ---');
    if (window.api && typeof window.api.request === 'function') {
        console.log('✅ API Module: Available');
        console.log('  - Base URL:', window.api.baseURL || 'Unknown');
        console.log('  - Request method:', typeof window.api.request);
    } else {
        console.log('❌ API Module: Not available');
        return;
    }
    
    // --- 2. Test Reactions API ---
    console.log('\n--- 2. Reactions API Test ---');
    try {
        const testMessageId = '12c72d07-ec8e-4e66-a372-0f975a71baa2';
        const reactionsResponse = await window.api.request(`/v1/reactions/${testMessageId}`);
        
        console.log('✅ Reactions API Response:');
        console.log('  - Success:', reactionsResponse.success);
        console.log('  - Reactions count:', reactionsResponse.reactions?.length || 0);
        console.log('  - Message:', reactionsResponse.message);
        
        if (reactionsResponse.reactions && reactionsResponse.reactions.length > 0) {
            const firstReaction = reactionsResponse.reactions[0];
            console.log('  - First reaction AppUser data:', firstReaction.AppUser ? 'Present' : 'Missing');
            if (firstReaction.AppUser) {
                console.log('    - User id:', firstReaction.AppUser.id);
                console.log('    - User name:', firstReaction.AppUser.name);
                console.log('    - Avatar URL:', firstReaction.AppUser.avatarUrl ? 'Present' : 'Missing');
            }
        }
    } catch (error) {
        console.log('❌ Reactions API Error:', error.message);
        console.log('  - Error type:', error.constructor.name);
        console.log('  - Full error:', error);
    }
    
    // --- 3. Test Presence API ---
    console.log('\n--- 3. Presence API Test ---');
    try {
        const presenceEvent = {
            pageId: 'diagnostic-page-' + Date.now(),
            kind: 'ENTER',
            pageUrl: 'https://example.com/diagnostic'
        };
        
        const presenceResponse = await window.api.request('/v1/presence/event', {
            method: 'POST',
            body: JSON.stringify(presenceEvent),
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': window.currentUser?.id || 'test-user-id',
                'x-user-name': window.currentUser?.name || 'Test User',
                'x-user-avatar': window.currentUser?.avatarUrl || ''
            }
        });
        
        console.log('✅ Presence API Response:');
        console.log('  - Success:', presenceResponse.success);
        console.log('  - User presence ID:', presenceResponse.userPresence?.id || 'None');
        console.log('  - Message:', presenceResponse.message);
    } catch (error) {
        console.log('❌ Presence API Error:', error.message);
        console.log('  - Error type:', error.constructor.name);
        console.log('  - Full error:', error);
    }
    
    // --- 4. Test Chat History API ---
    console.log('\n--- 4. Chat History API Test ---');
    try {
        const chatResponse = await window.api.request('/v1/chat/history?communityId=test-community&pageId=test-page');
        
        console.log('✅ Chat History API Response:');
        console.log('  - Success:', chatResponse.success);
        console.log('  - Messages count:', chatResponse.messages?.length || 0);
        
        if (chatResponse.messages && chatResponse.messages.length > 0) {
            const firstMessage = chatResponse.messages[0];
            console.log('  - First message author data:', firstMessage.author ? 'Present' : 'Missing');
            if (firstMessage.author) {
                console.log('    - Author email:', firstMessage.author.email);
                console.log('    - Author name:', firstMessage.author.name);
                console.log('    - Author avatar:', firstMessage.author.avatarUrl ? 'Present' : 'Missing');
            }
        }
    } catch (error) {
        console.log('❌ Chat History API Error:', error.message);
        console.log('  - Error type:', error.constructor.name);
        console.log('  - Full error:', error);
    }
    
    // --- 5. Test User Lookup API ---
    console.log('\n--- 5. User Lookup API Test ---');
    try {
        const testEmail = window.currentUser?.email || 'themetalayer@gmail.com';
        const userResponse = await window.api.request(`/v1/users/${encodeURIComponent(testEmail)}`);
        
        console.log('✅ User Lookup API Response:');
        console.log('  - Success:', userResponse.success);
        console.log('  - User ID:', userResponse.user?.id || 'None');
        console.log('  - User email:', userResponse.user?.email || 'None');
        console.log('  - User name:', userResponse.user?.name || 'None');
        console.log('  - Avatar URL:', userResponse.user?.avatarUrl ? 'Present' : 'Missing');
    } catch (error) {
        console.log('❌ User Lookup API Error:', error.message);
        console.log('  - Error type:', error.constructor.name);
        console.log('  - Full error:', error);
    }
    
    // --- 6. Network Connectivity Test ---
    console.log('\n--- 6. Network Connectivity Test ---');
    try {
        const startTime = Date.now();
        const testResponse = await fetch('http://216.238.91.120:3002/health', {
            method: 'GET',
            mode: 'cors'
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log('✅ Network Test:');
        console.log('  - Server reachable:', testResponse.ok);
        console.log('  - Response time:', responseTime + 'ms');
        console.log('  - Status:', testResponse.status);
    } catch (error) {
        console.log('❌ Network Test Failed:', error.message);
        console.log('  - This indicates server connectivity issues');
    }
    
    // --- 7. Current User Context ---
    console.log('\n--- 7. Current User Context ---');
    if (window.currentUser) {
        console.log('✅ Current User:');
        console.log('  - Email:', window.currentUser.email);
        console.log('  - ID:', window.currentUser.id);
        console.log('  - Name:', window.currentUser.name);
        console.log('  - Avatar:', window.currentUser.avatarUrl ? 'Present' : 'Missing');
    } else {
        console.log('❌ Current User: Not set');
        console.log('  - This may cause authentication issues');
    }
    
    // --- 8. Browser Console Errors ---
    console.log('\n--- 8. Browser Console Errors ---');
    console.log('Check the browser console for any red error messages');
    console.log('Common issues:');
    console.log('  - CORS errors: Server not allowing requests from this origin');
    console.log('  - 500 errors: Server-side errors (check server logs)');
    console.log('  - 404 errors: API endpoints not found');
    console.log('  - Network errors: Server not running or unreachable');
    
    console.log('\n🎉 API DIAGNOSTIC COMPLETE!');
    console.log('============================');
    console.log('If all tests passed, the API is working correctly.');
    console.log('If any tests failed, check the error messages above.');
})();
