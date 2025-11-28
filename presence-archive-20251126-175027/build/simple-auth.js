// Simple Authentication for Real-time
// This provides a quick way to authenticate users for real-time subscriptions

async function quickAuthForRealtime() {
  console.log('🔐 QUICK AUTH: Starting quick authentication for real-time...');
  
  if (!window.supabase) {
    console.error('❌ QUICK AUTH: Supabase client not available');
    return false;
  }
  
  try {
    // Check if already authenticated
    const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
    
    if (session) {
      console.log('✅ QUICK AUTH: Already authenticated:', session.user.email);
      return true;
    }
    
    console.log('🔐 QUICK AUTH: No session found, creating test user...');
    
    // Create a test user for real-time
    const testEmail = 'test@example.com';
    const testPassword = 'test-password-123';
    
    // Try to sign up a test user
    const { data: signUpData, error: signUpError } = await window.supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User',
          avatar_url: null
        }
      }
    });
    
    if (signUpError) {
      console.log('ℹ️ QUICK AUTH: User might already exist, trying sign in...');
      
      // Try to sign in instead
      const { data: signInData, error: signInError } = await window.supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (signInError) {
        console.error('❌ QUICK AUTH: Sign in failed:', signInError.message);
        return false;
      }
      
      console.log('✅ QUICK AUTH: Signed in:', signInData.user.email);
      return true;
    } else {
      console.log('✅ QUICK AUTH: User created and signed in:', signUpData.user.email);
      return true;
    }
    
  } catch (error) {
    console.error('❌ QUICK AUTH: Exception during authentication:', error);
    return false;
  }
}

// Test real-time after authentication
async function testRealtimeAfterQuickAuth() {
  console.log('🧪 REALTIME TEST: Testing real-time after quick authentication...');
  
  const authSuccess = await quickAuthForRealtime();
  
  if (!authSuccess) {
    console.error('❌ REALTIME TEST: Authentication failed');
    return false;
  }
  
  // Test real-time subscription
  const pageId = 'test-page-123';
  const topic = 'page:messages:' + pageId;
  
  console.log('📡 REALTIME TEST: Testing subscription with topic:', topic);
  
  let subscriptionWorking = false;
  let eventReceived = false;
  
  const channel = window.supabase.channel(topic, {
    config: {
      broadcast: { self: true, ack: true },
      private: true
    }
  })
  .on('broadcast', { event: 'INSERT' }, (payload) => {
    console.log('🔔 REALTIME TEST: INSERT event received:', payload);
    eventReceived = true;
  })
  .subscribe((status) => {
    console.log('📡 REALTIME TEST: Subscription status:', status);
    
    if (status === 'SUBSCRIBED') {
      subscriptionWorking = true;
      console.log('✅ REALTIME TEST: Subscription successful with authenticated user!');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('❌ REALTIME TEST: Channel error');
    } else if (status === 'TIMED_OUT') {
      console.error('❌ REALTIME TEST: Timed out');
    } else if (status === 'CLOSED') {
      console.error('❌ REALTIME TEST: Channel closed');
    }
  });
  
  // Wait for result
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Cleanup
  await window.supabase.removeChannel(channel);
  
  console.log('\\n📋 REALTIME TEST RESULTS:');
  console.log('📊 Authentication:', authSuccess);
  console.log('📊 Subscription Working:', subscriptionWorking);
  console.log('📊 Events Received:', eventReceived);
  
  if (subscriptionWorking) {
    console.log('🎉 SUCCESS: Real-time is now working with authenticated user!');
    return true;
  } else {
    console.log('❌ FAILURE: Real-time still not working');
    return false;
  }
}

// Export functions
if (typeof window !== 'undefined') {
  window.quickAuthForRealtime = quickAuthForRealtime;
  window.testRealtimeAfterQuickAuth = testRealtimeAfterQuickAuth;
}

console.log('🔐 SIMPLE AUTH: Quick authentication functions loaded');
console.log('🔐 SIMPLE AUTH: Use quickAuthForRealtime() to authenticate');
console.log('🔐 SIMPLE AUTH: Use testRealtimeAfterQuickAuth() to test real-time');


