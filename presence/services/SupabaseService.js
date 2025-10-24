/**
 * SupabaseService - Following COMP Method Exactly
 * Direct initialization without waiting loops
 */

class SupabaseService {
  constructor() {
    this.logLevel = 'INFO';
    this.isInitialized = false;
  }

  /**
   * Initialize SupabaseService (FOLLOWING COMP)
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('⚠️ SUPABASE: Already initialized');
      return;
    }

    try {
      // COMP METHOD: Direct initialization
      if (typeof supabase === 'undefined') {
        console.error('❌ SUPABASE: supabase library not loaded');
        throw new Error('Supabase library not available');
      }
      
      window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ SUPABASE: Global client initialized successfully');
      console.log('✅ SUPABASE: URL:', SUPABASE_URL);
      console.log('✅ SUPABASE: Key present:', !!SUPABASE_ANON_KEY);
      console.log('✅ SUPABASE: Client methods available:', Object.keys(window.supabase).slice(0, 10));
      
      // CRITICAL FIX: Set up Supabase authentication after user login
      console.log('🔧 SUPABASE: Setting up authentication listener...');
      window.supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔔 SUPABASE AUTH: Auth state changed:', event);
        if (session) {
          console.log('✅ SUPABASE AUTH: User authenticated:', session.user.email);
          console.log('✅ SUPABASE AUTH: Session expires at:', new Date(session.expires_at * 1000));
          
          // Initialize RobustIntegration now that user is authenticated
          if (window.robustIntegration && !window.robustIntegration.isInitialized) {
            console.log('🔗 AUTH: Initializing RobustIntegration after authentication...');
            window.robustIntegration.initialize().then(success => {
              if (success) {
                console.log('✅ AUTH: RobustIntegration initialized successfully');
              } else {
                console.error('❌ AUTH: RobustIntegration initialization failed');
              }
            });
          }
        } else {
          console.log('❌ SUPABASE AUTH: User not authenticated');
        }
      });
      
      this.isInitialized = true;
      console.log('✅ SUPABASE: SupabaseService initialized successfully');
      
    } catch (error) {
      console.error('❌ SUPABASE: Initialization failed:', error);
      throw error;
    }
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.SupabaseService = SupabaseService;
  
  // Auto-initialize SupabaseService when DOM is loaded (FOLLOWING COMP)
  function initializeSupabaseService() {
    // COMP METHOD: Direct initialization without waiting loops
    if (typeof supabase === 'undefined') {
      console.error('❌ SUPABASE: supabase library not loaded');
      return;
    }
    
    console.log('✅ SUPABASE: Library loaded, initializing service...');
    const supabaseService = new SupabaseService();
    supabaseService.initialize().then(() => {
      console.log('✅ SupabaseService initialized and connected');
    }).catch(error => {
      console.error('❌ SUPABASE: SupabaseService initialization failed:', error);
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSupabaseService);
  } else {
    // DOM is already loaded
    initializeSupabaseService();
  }
}