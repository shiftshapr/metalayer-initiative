// User Authentication for Supabase Real-time
// This function authenticates a user with Supabase for real-time subscriptions

async function authenticateUserWithSupabase(supabase, userEmail, userName) {
  console.log('🔐 AUTH: Starting Supabase authentication for real-time...');
  console.log('🔐 AUTH: User email:', userEmail);
  console.log('🔐 AUTH: User name:', userName);
  
  try {
    // Check if user already has a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (session && session.user) {
      console.log('✅ AUTH: User already authenticated:', session.user.email);
      console.log('✅ AUTH: Session expires at:', new Date(session.expires_at * 1000));
      return { success: true, session, user: session.user };
    }
    
    console.log('🔐 AUTH: No existing session, creating new authentication...');
    
    // For Chrome extensions, we need to create a user account or sign in
    // Since we have Google OAuth, we can use the email to create/sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
      email: userEmail,
      options: {
        data: {
          name: userName,
          avatar_url: null
        }
      }
    });
    
    if (authError) {
      console.error('❌ AUTH: OTP sign-in failed:', authError.message);
      
      // Try alternative: create user account directly
      console.log('🔐 AUTH: Trying direct user creation...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userEmail,
        password: 'temp-password-' + Date.now(), // Temporary password
        options: {
          data: {
            name: userName,
            avatar_url: null
          }
        }
      });
      
      if (signUpError) {
        console.error('❌ AUTH: User creation failed:', signUpError.message);
        return { success: false, error: signUpError.message };
      }
      
      console.log('✅ AUTH: User created successfully');
      return { success: true, user: signUpData.user };
    }
    
    console.log('✅ AUTH: OTP sent to email');
    console.log('🔐 AUTH: Check your email for the OTP code');
    
    // For testing, you can manually enter the OTP
    // In production, you'd handle this in your UI
    return { success: true, needsOTP: true, authData };
    
  } catch (error) {
    console.error('❌ AUTH: Authentication failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Function to complete OTP verification
async function completeOTPVerification(supabase, otpCode) {
  console.log('🔐 AUTH: Completing OTP verification...');
  
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      token: otpCode,
      type: 'email'
    });
    
    if (sessionError) {
      console.error('❌ AUTH: OTP verification failed:', sessionError.message);
      return { success: false, error: sessionError.message };
    }
    
    console.log('✅ AUTH: OTP verified successfully');
    console.log('✅ AUTH: User authenticated:', sessionData.user.email);
    
    return { success: true, session: sessionData.session, user: sessionData.user };
    
  } catch (error) {
    console.error('❌ AUTH: OTP verification failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Function to test real-time with authenticated user
async function testRealtimeWithAuth(supabase, pageId) {
  console.log('🧪 TEST: Testing real-time with authenticated user...');
  
  // Check authentication status
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (!session) {
    console.error('❌ TEST: No authenticated session');
    return { success: false, error: 'No authenticated session' };
  }
  
  console.log('✅ TEST: User authenticated:', session.user.email);
  
  // Test real-time subscription
  const topic = `page:messages:${pageId}`;
  console.log('📡 TEST: Using topic:', topic);
  
  let subscriptionWorking = false;
  let eventReceived = false;
  
  const channel = supabase.channel(topic, {
    config: {
      broadcast: { self: true, ack: true },
      private: true
    }
  })
  .on('broadcast', { event: 'INSERT' }, (payload) => {
    console.log('🔔 TEST: INSERT event received:', payload);
    eventReceived = true;
  })
  .on('broadcast', { event: 'UPDATE' }, (payload) => {
    console.log('🔔 TEST: UPDATE event received:', payload);
    eventReceived = true;
  })
  .on('broadcast', { event: 'DELETE' }, (payload) => {
    console.log('🔔 TEST: DELETE event received:', payload);
    eventReceived = true;
  })
  .subscribe((status) => {
    console.log('📡 TEST: Subscription status:', status);
    
    if (status === 'SUBSCRIBED') {
      subscriptionWorking = true;
      console.log('✅ TEST: Real-time subscription successful with authenticated user!');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('❌ TEST: Channel error');
    } else if (status === 'TIMED_OUT') {
      console.error('❌ TEST: Timed out');
    } else if (status === 'CLOSED') {
      console.error('❌ TEST: Channel closed');
    }
  });
  
  // Wait for subscription result
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Cleanup
  await supabase.removeChannel(channel);
  
  return {
    success: subscriptionWorking,
    eventReceived: eventReceived,
    status: subscriptionWorking ? 'WORKING' : 'FAILED'
  };
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
  window.authenticateUserWithSupabase = authenticateUserWithSupabase;
  window.completeOTPVerification = completeOTPVerification;
  window.testRealtimeWithAuth = testRealtimeWithAuth;
}

console.log('🔐 AUTH: Authentication functions loaded');
console.log('🔐 AUTH: Use authenticateUserWithSupabase(supabase, email, name) to authenticate');
console.log('🔐 AUTH: Use testRealtimeWithAuth(supabase, pageId) to test real-time');


