/**
 * PRE-RENDER INITIALIZER - Initialize user data before interface rendering
 * Prevents theme flash and ensures profile avatar gets aura color
 */

class PreRenderInitializer {
  constructor() {
    this.isInitialized = false;
    this.userData = null;
    this.themeData = null;
    this.auraColor = null;
    this.avatarUrl = null;
  }

  /**
   * Initialize all pre-render data
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('🔄 PRE-RENDER: Already initialized, skipping');
      return;
    }

    console.log('🚀 PRE-RENDER: Starting pre-render initialization...');
    console.log('📍 PRE-RENDER: Current timestamp:', new Date().toISOString());

    try {
      // Step 1: Authenticate user and get basic profile data
      console.log('🔐 PRE-RENDER: Step 1 - Authenticating user...');
      await this.authenticateUser();
      console.log('✅ PRE-RENDER: Step 1 complete - User authenticated');

      // Step 2: Load theme preference
      console.log('🎨 PRE-RENDER: Step 2 - Loading theme preference...');
      await this.loadThemePreference();
      console.log('✅ PRE-RENDER: Step 2 complete - Theme loaded');

      // Step 3: Load aura color and avatar URL together
      console.log('🖼️ PRE-RENDER: Step 3 - Loading avatar and aura data...');
      await this.loadAvatarAndAuraData();
      console.log('✅ PRE-RENDER: Step 3 complete - Avatar and aura data loaded');

      // Step 4: Apply theme immediately to prevent flash
      console.log('🎨 PRE-RENDER: Step 4 - Applying theme...');
      this.applyThemeImmediately();
      console.log('✅ PRE-RENDER: Step 4 complete - Theme applied');

      // Step 5: Store data globally for other modules
      console.log('💾 PRE-RENDER: Step 5 - Storing data globally...');
      this.storeDataGlobally();
      console.log('✅ PRE-RENDER: Step 5 complete - Data stored globally');

      this.isInitialized = true;
      console.log('🎉 PRE-RENDER: Initialization complete');

      // Dispatch event to notify other modules that pre-render initialization is complete
      document.dispatchEvent(new CustomEvent('preRenderComplete', {
        detail: {
          userData: this.userData,
          themeData: this.themeData,
          auraColor: this.auraColor,
          avatarUrl: this.avatarUrl
        }
      }));
      console.log('📢 PRE-RENDER: Dispatched preRenderComplete event');

      console.log('📊 PRE-RENDER: Final data state:', {
        userId: this.userData?.id,
        theme: this.themeData,
        auraColor: this.auraColor,
        avatarUrl: this.avatarUrl?.substring(0, 50) + '...',
        isInitialized: this.isInitialized
      });

    } catch (error) {
      console.error('❌ PRE-RENDER: Initialization failed:', error);
      console.error('❌ PRE-RENDER: Error details:', error.message);
      console.error('❌ PRE-RENDER: Error stack:', error.stack);
      // Continue with defaults if initialization fails
      this.applyDefaultTheme();
    }
  }

  /**
   * Authenticate user and get basic profile data
   */
  async authenticateUser() {
    console.log('🔐 PRE-RENDER: Authenticating user...');

    // Wait for authentication system to be ready and user ID to be available
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max
    while (!window.currentUser?.id && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
      if (attempts % 10 === 0) { // Log every second
        console.log(`⏳ PRE-RENDER: Waiting for user ID... (${attempts}/${maxAttempts})`);
      }
    }

    if (window.currentUser?.id) {
      // CRITICAL FIX: Copy user data but resolve Promise if auraColor is a Promise
      this.userData = { ...window.currentUser };
      
      // CRITICAL FIX: Resolve Promise if auraColor is a Promise
      if (this.userData.auraColor && typeof this.userData.auraColor === 'object' && typeof this.userData.auraColor.then === 'function') {
        console.log('🔧 PRE-RENDER: auraColor is a Promise, resolving...');
        try {
          const resolvedAuraColor = await this.userData.auraColor;
          console.log('✅ PRE-RENDER: Resolved auraColor Promise to:', resolvedAuraColor);
          this.userData.auraColor = resolvedAuraColor;
        } catch (error) {
          console.warn('⚠️ PRE-RENDER: Failed to resolve auraColor Promise:', error);
          this.userData.auraColor = null; // Treat as missing, will fetch from database
        }
      }

      // CRITICAL FIX: Validate auraColor - treat #ffffff as missing (will fetch from database)
      if (this.userData.auraColor === '#ffffff' || this.userData.auraColor === 'white' || this.userData.auraColor === '#fff') {
        console.log('⚠️ PRE-RENDER: auraColor is fallback white, treating as missing (will fetch from database)');
        this.userData.auraColor = null;
      }

      console.log('✅ PRE-RENDER: User authenticated with ID:', {
        id: this.userData.id,
        email: this.userData.email,
        hasAuraColor: !!this.userData.auraColor,
        auraColor: this.userData.auraColor,
        hasAvatarUrl: !!this.userData.avatarUrl,
        avatarUrl: this.userData.avatarUrl?.substring(0, 50) + '...',
        note: 'auraColor will be fetched from database in loadAvatarAndAuraData() if missing'
      });
    } else {
      console.log('ℹ️ PRE-RENDER: No authenticated user found after waiting');
    }
  }

  /**
   * Load theme preference from database
   */
  async loadThemePreference() {
    if (!this.userData?.id || !window.api) {
      console.log('ℹ️ PRE-RENDER: Skipping theme load (no user/API)');
      return;
    }

    console.log('🎨 PRE-RENDER: Loading theme preference...');

    try {
      const response = await window.api.request('/v1/users/preferences', {
        method: 'GET',
        headers: {
          'X-User-Id': this.userData.id
        }
      });

      if (response?.preferences?.theme) {
        this.themeData = response.preferences.theme;
        console.log('✅ PRE-RENDER: Theme loaded:', this.themeData);
      } else {
        this.themeData = 'light'; // Default
        console.log('ℹ️ PRE-RENDER: Using default theme');
      }
    } catch (error) {
      console.warn('⚠️ PRE-RENDER: Theme load failed, using default:', error);
      this.themeData = 'light';
    }
  }

  /**
   * Load avatar URL and aura color together
   */
  async loadAvatarAndAuraData() {
    if (!this.userData?.id || !window.api) {
      console.log('ℹ️ PRE-RENDER: Skipping avatar/aura load (no user/API)');
      return;
    }

    console.log('🖼️ PRE-RENDER: Loading avatar and aura data from database...');

    try {
      // CRITICAL FIX: Always fetch from database to get correct auraColor (not Promise)
      // This ensures we get the actual database value (#33aa33) instead of Promise that resolves to #ffffff
      // Database is the source of truth, auth data may be stale/wrong
      const userResponse = await window.api.request(`/v1/users/${this.userData.id}`, {
        method: 'GET'
      });

      if (userResponse) {
        // Extract avatar URL and aura color from database response
        this.avatarUrl = userResponse.avatar_url || userResponse.avatarUrl;
        this.auraColor = userResponse.aura_color || userResponse.auraColor;

        // CRITICAL FIX: Validate auraColor - treat #ffffff as missing
        if (this.auraColor === '#ffffff' || this.auraColor === 'white' || this.auraColor === '#fff') {
          console.log('⚠️ PRE-RENDER: Database returned fallback white, treating as missing');
          this.auraColor = null;
        }

        console.log('✅ PRE-RENDER: Avatar URL loaded from database:', this.avatarUrl);
        console.log('🎨 PRE-RENDER: Aura color loaded from database:', this.auraColor);
        console.log('📊 PRE-RENDER: Full user response from database:', {
          id: userResponse.id,
          avatar_url: userResponse.avatar_url,
          avatarUrl: userResponse.avatarUrl,
          aura_color: userResponse.aura_color,
          auraColor: userResponse.auraColor,
          email: userResponse.email,
          name: userResponse.name
        });

        // CRITICAL FIX: Update window.currentUser with fetched data so other modules can use it
        if (window.currentUser && this.auraColor) {
          window.currentUser.auraColor = this.auraColor; // Set as string, not Promise
          window.currentUser.aura_color = this.auraColor;
          console.log('✅ PRE-RENDER: Updated window.currentUser.auraColor from database:', this.auraColor);
        }
        if (window.currentUser && this.avatarUrl) {
          window.currentUser.avatarUrl = this.avatarUrl;
          console.log('✅ PRE-RENDER: Updated window.currentUser.avatarUrl from database');
        }
      } else {
        console.log('⚠️ PRE-RENDER: No user response from database');
      }
    } catch (error) {
      console.warn('⚠️ PRE-RENDER: Avatar/aura load failed:', error);
    }
  }

  /**
   * Apply theme immediately to prevent flash
   */
  applyThemeImmediately() {
    const theme = this.themeData || 'light';
    console.log('🎨 PRE-RENDER: Applying theme immediately:', theme);

    const body = document.body;
    const html = document.documentElement;

    if (theme === 'dark') {
      body.setAttribute('data-theme', 'dark');
      html.setAttribute('data-theme', 'dark');
    } else {
      body.setAttribute('data-theme', 'light');
      html.setAttribute('data-theme', 'light');
    }

    console.log('✅ PRE-RENDER: Theme applied to prevent flash');
  }

  /**
   * Apply default theme if initialization fails
   */
  applyDefaultTheme() {
    console.log('🎨 PRE-RENDER: Applying default theme');
    const body = document.body;
    const html = document.documentElement;

    body.setAttribute('data-theme', 'light');
    html.setAttribute('data-theme', 'light');
  }

  /**
   * Store loaded data globally for other modules
   */
  storeDataGlobally() {
    console.log('💾 PRE-RENDER: Storing data globally...');

    // Update currentUser with loaded data
    if (window.currentUser) {
      if (this.avatarUrl) {
        window.currentUser.avatarUrl = this.avatarUrl;
        window.currentUser.avatar_url = this.avatarUrl;
      }
      if (this.auraColor) {
        window.currentUser.auraColor = this.auraColor;
        window.currentUser.aura_color = this.auraColor;
      }
    }

    // Store theme preference
    if (this.themeData && window.setState) {
      window.setState('theme', this.themeData);
    }

    console.log('✅ PRE-RENDER: Data stored globally for other modules');
  }

  /**
   * Get pre-render data for other modules
   */
  getPreRenderData() {
    return {
      userData: this.userData,
      themeData: this.themeData,
      auraColor: this.auraColor,
      avatarUrl: this.avatarUrl,
      isInitialized: this.isInitialized
    };
  }
}

// Create global instance
window.preRenderInitializer = new PreRenderInitializer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PreRenderInitializer;
}
