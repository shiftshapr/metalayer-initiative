// Unified Authentication System for Supabase Real-time
// This replaces all the fragmented auth systems with one working solution

class UnifiedAuth {
  constructor() {
    this.supabase = null;
    this.isAuthenticated = false;
    this.currentUser = null;
    this.session = null;
  }

  async initialize(supabaseClient) {
    this.supabase = supabaseClient;
    console.log('🔐 UNIFIED AUTH: Initializing unified authentication system...');
    
    // Check for existing session
    await this.checkExistingSession();
    
    return this.isAuthenticated;
  }

  async checkExistingSession() {
    if (!this.supabase) {
      console.error('❌ UNIFIED AUTH: Supabase client not available');
      return false;
    }

    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (session && session.user) {
        this.session = session;
        this.currentUser = session.user;
        this.isAuthenticated = true;
        console.log('✅ UNIFIED AUTH: Existing session found:', session.user.email);
        console.log('✅ UNIFIED AUTH: Session expires at:', new Date(session.expires_at * 1000));
        return true;
      } else {
        console.log('ℹ️ UNIFIED AUTH: No existing session');
        return false;
      }
    } catch (error) {
      console.error('❌ UNIFIED AUTH: Error checking session:', error);
      return false;
    }
  }

  async authenticateUser(userEmail, userName) {
    console.log('🔐 UNIFIED AUTH: Authenticating user for real-time...');
    console.log('🔐 UNIFIED AUTH: Email:', userEmail);
    console.log('🔐 UNIFIED AUTH: Name:', userName);

    if (!this.supabase) {
      console.error('❌ UNIFIED AUTH: Supabase client not available');
      return false;
    }

    try {
      // Check if already authenticated
      if (this.isAuthenticated && this.currentUser && this.currentUser.email === userEmail) {
        console.log('✅ UNIFIED AUTH: User already authenticated');
        return true;
      }

      // Create a valid email format for testing
      const validEmail = userEmail.includes('@') ? userEmail : `${userEmail}@domain.com`;
      console.log('🔐 UNIFIED AUTH: Using email:', validEmail);

      // Try to sign in with email/password
      const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
        email: validEmail,
        password: 'password123'
      });

      if (signInError) {
        console.log('ℹ️ UNIFIED AUTH: Sign in failed, trying to create user...');
        
        // Try to create user with valid email
        const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
          email: validEmail,
          password: 'password123',
          options: {
            data: {
              name: userName,
              avatar_url: null
            }
          }
        });

        if (signUpError) {
          console.error('❌ UNIFIED AUTH: User creation failed:', signUpError.message);
          console.log('🔧 UNIFIED AUTH: Trying anonymous authentication instead...');
          
          // Fallback: Use anonymous authentication
          const { data: anonData, error: anonError } = await this.supabase.auth.signInAnonymously();
          
          if (anonError) {
            console.error('❌ UNIFIED AUTH: Anonymous auth also failed:', anonError.message);
            return false;
          }
          
          console.log('✅ UNIFIED AUTH: Anonymous authentication successful');
          this.session = anonData.session;
          this.currentUser = anonData.user;
          this.isAuthenticated = true;
          return true;
        }

        console.log('✅ UNIFIED AUTH: User created and authenticated:', signUpData.user.email);
        this.session = signUpData.session;
        this.currentUser = signUpData.user;
        this.isAuthenticated = true;
        return true;
      } else {
        console.log('✅ UNIFIED AUTH: User signed in successfully:', signInData.user.email);
        this.session = signInData.session;
        this.currentUser = signInData.user;
        this.isAuthenticated = true;
        return true;
      }

    } catch (error) {
      console.error('❌ UNIFIED AUTH: Authentication failed:', error);
      return false;
    }
  }

  async testRealtimeConnection(pageId) {
    console.log('🧪 UNIFIED AUTH: Testing real-time connection...');
    
    if (!this.isAuthenticated) {
      console.error('❌ UNIFIED AUTH: Not authenticated, cannot test real-time');
      return false;
    }

    if (!this.supabase) {
      console.error('❌ UNIFIED AUTH: Supabase client not available');
      return false;
    }

    try {
      const topic = `page:messages:${pageId}`;
      console.log('📡 UNIFIED AUTH: Testing subscription to topic:', topic);
      
      let subscriptionWorking = false;
      let eventReceived = false;
      
      const channel = this.supabase.channel(topic, {
        config: {
          broadcast: { self: true, ack: true },
          private: true
        }
      })
      .on('broadcast', { event: 'INSERT' }, (payload) => {
        console.log('🔔 UNIFIED AUTH: INSERT event received:', payload);
        eventReceived = true;
      })
      .subscribe((status) => {
        console.log('📡 UNIFIED AUTH: Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          subscriptionWorking = true;
          console.log('✅ UNIFIED AUTH: Real-time subscription successful!');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ UNIFIED AUTH: Channel error');
        } else if (status === 'TIMED_OUT') {
          console.error('❌ UNIFIED AUTH: Timed out');
        } else if (status === 'CLOSED') {
          console.error('❌ UNIFIED AUTH: Channel closed');
        }
      });
      
      // Wait for result
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Cleanup
      await this.supabase.removeChannel(channel);
      
      console.log('📋 UNIFIED AUTH TEST RESULTS:');
      console.log('📊 Subscription Working:', subscriptionWorking);
      console.log('📊 Events Received:', eventReceived);
      
      return subscriptionWorking;
      
    } catch (error) {
      console.error('❌ UNIFIED AUTH: Real-time test failed:', error);
      return false;
    }
  }

  getAuthStatus() {
    return {
      isAuthenticated: this.isAuthenticated,
      user: this.currentUser,
      session: this.session,
      email: this.currentUser?.email,
      expiresAt: this.session?.expires_at
    };
  }

  async signOut() {
    if (this.supabase) {
      await this.supabase.auth.signOut();
    }
    this.isAuthenticated = false;
    this.currentUser = null;
    this.session = null;
    console.log('🔐 UNIFIED AUTH: User signed out');
  }
}

// Create global instance
const unifiedAuth = new UnifiedAuth();

// Export functions for use in other files
if (typeof window !== 'undefined') {
  window.unifiedAuth = unifiedAuth;
  window.initializeUnifiedAuth = async (supabaseClient) => {
    return await unifiedAuth.initialize(supabaseClient);
  };
  window.authenticateUserForRealtime = async (userEmail, userName) => {
    return await unifiedAuth.authenticateUser(userEmail, userName);
  };
  window.testRealtimeWithUnifiedAuth = async (pageId) => {
    return await unifiedAuth.testRealtimeConnection(pageId);
  };
  window.getUnifiedAuthStatus = () => {
    return unifiedAuth.getAuthStatus();
  };
}

console.log('🔐 UNIFIED AUTH: Unified authentication system loaded');
console.log('🔐 UNIFIED AUTH: Use initializeUnifiedAuth(supabase) to initialize');
console.log('🔐 UNIFIED AUTH: Use authenticateUserForRealtime(email, name) to authenticate');
console.log('🔐 UNIFIED AUTH: Use testRealtimeWithUnifiedAuth(pageId) to test real-time');
