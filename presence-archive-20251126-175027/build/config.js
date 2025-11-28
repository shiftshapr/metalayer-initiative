// Modern Environment Configuration System
// Replaces hardcoded URLs with environment-based configuration

(function() {
  'use strict';
  
  // Avatar fallback color configuration
  let AVATAR_FALLBACK_COLOR = '#ffffff'; // Default fallback
  
  // Try to import if available (when loaded as module)
  if (typeof window !== 'undefined' && window.AVATAR_FALLBACK_COLOR) {
    AVATAR_FALLBACK_COLOR = window.AVATAR_FALLBACK_COLOR;
  }

  class ConfigManager {
    constructor() {
      this.config = {
        // Development (VPS deployment with domain)
        development: {
          apiUrl: 'http://216.238.91.120:3002',
          wsUrl: 'ws://216.238.91.120:3002/ws',
          supabaseUrl: 'https://zwxomzkmncwzwryvudwu.supabase.co',
          supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM',
          debugMode: true,
          logLevel: 'debug',
          // User-configurable settings
          lastSeenThresholdDays: 30 // Default: 1 month (30 days)
        },
        // Production
        production: {
          apiUrl: 'https://api.canopi.live',
          wsUrl: 'wss://api.canopi.live/ws',
          supabaseUrl: 'https://zwxomzkmncwzwryvudwu.supabase.co',
          supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM',
          debugMode: false,
          logLevel: 'error',
          // User-configurable settings
          lastSeenThresholdDays: 30 // Default: 1 month (30 days)
        },
        // Staging
        staging: {
          apiUrl: 'https://api.themetalayer.org/staging',
          wsUrl: 'ws://216.238.91.120:3002/staging/ws',
          supabaseUrl: 'https://zwxomzkmncwzwryvudwu.supabase.co',
          supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM',
          debugMode: true,
          logLevel: 'info',
          // User-configurable settings
          lastSeenThresholdDays: 30 // Default: 1 month (30 days)
        }
      };
      
      this.currentEnvironment = this.detectEnvironment();
      this.activeConfig = this.config[this.currentEnvironment];
      
      // Export resolved API endpoints so TypeScript modules can consume them
      if (typeof window !== 'undefined') {
        window.API_BASE_URL = this.activeConfig.apiUrl;
        if (!window.API_FALLBACK_URL) {
          const productionApi = this.config.production?.apiUrl || 'https://api.themetalayer.org';
          window.API_FALLBACK_URL = productionApi;
        }
      }
      
      console.log(`🔧 CONFIG: Environment detected: ${this.currentEnvironment}`);
      console.log(`🔧 CONFIG: API URL: ${this.activeConfig.apiUrl}`);
      console.log(`🔧 CONFIG: WebSocket URL: ${this.activeConfig.wsUrl}`);
    }

    detectEnvironment() {
      // Check for environment indicators
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        // Force development mode if local server is available
        // This ensures we use VPS IP instead of production
        return 'development';
        
        // Check if we're in development mode
        if (chrome.runtime.getManifest().name.includes('Development')) {
          return 'development';
        }
        
        // Check for staging indicators
        if (window.location.hostname.includes('staging')) {
          return 'staging';
        }
        
        // Default to production for extension
        return 'production';
      }
      
      // Fallback detection
      if (window.location.hostname === '216.238.91.120' || window.location.hostname === '127.0.0.1') {
        return 'development';
      }
      
      if (window.location.hostname.includes('staging')) {
        return 'staging';
      }
      
      return 'production';
    }

    get(key) {
      return this.activeConfig[key];
    }

    getAll() {
      return { ...this.activeConfig };
    }

    isDevelopment() {
      return this.currentEnvironment === 'development';
    }

    isProduction() {
      return this.currentEnvironment === 'production';
    }

    isStaging() {
      return this.currentEnvironment === 'staging';
    }

    // Dynamic configuration updates
    updateConfig(updates) {
      this.activeConfig = { ...this.activeConfig, ...updates };
      console.log('🔧 CONFIG: Configuration updated:', updates);
    }

    // Get configurable threshold settings
    getLastSeenThreshold() {
      const days = this.activeConfig.lastSeenThresholdDays || 30;
      
      // Convert to milliseconds
      const totalMs = days * 24 * 60 * 60 * 1000;
      
      console.log(`🔧 CONFIG: Last seen threshold: ${days} days (${totalMs}ms)`);
      return totalMs;
    }

    // Set configurable threshold settings
    setLastSeenThreshold(days) {
      this.activeConfig.lastSeenThresholdDays = days;
      
      console.log(`🔧 CONFIG: Last seen threshold updated: ${days} days`);
      
      // Store in StateManager for persistence
      if (typeof window.setState === 'function') {
        window.setState('lastSeenThresholdDays', days);
      }
    }

    // Load user settings from Chrome storage
    async loadUserSettings() {
      if (typeof window.getState === 'function') {
        try {
          const result = await window.getState('lastSeenThresholdDays');
          
          if (result !== undefined && result !== null) {
            this.activeConfig.lastSeenThresholdDays = result;
            
            console.log('🔧 CONFIG: User settings loaded from StateManager:', {
              days: result
            });
          }
        } catch (error) {
          console.error('🔧 CONFIG: Failed to load user settings:', error);
        }
      }
    }

    // Environment-specific feature flags
    getFeatureFlags() {
      return {
        enableWebSocket: true,
        enablePolling: this.isDevelopment(), // Only in development
        enableDebugLogging: this.activeConfig.debugMode,
        enablePerformanceMonitoring: true,
        enableErrorReporting: this.isProduction(),
        enableAnalytics: this.isProduction()
      };
    }
  }

  // Create global config instance
  window.configManager = new ConfigManager();
  
  // Expose commonly used config values
  window.METALAYER_API_URL = window.configManager.get('apiUrl');
  window.METALAYER_WS_URL = window.configManager.get('wsUrl');
  window.API_BASE_URL = window.configManager.get('apiUrl');
  window.SUPABASE_URL = window.configManager.get('supabaseUrl');
  window.SUPABASE_ANON_KEY = window.configManager.get('supabaseAnonKey');
  window.DEBUG_MODE = window.configManager.get('debugMode');
  window.LOG_LEVEL = window.configManager.get('logLevel');
  
  // COMP METHOD: Single source of truth for avatar fallback color
  // Export to window for files not yet migrated (temporary during migration)
  window.AVATAR_FALLBACK_COLOR = AVATAR_FALLBACK_COLOR;
  console.log('✅ CONFIG: AVATAR_FALLBACK_COLOR set:', AVATAR_FALLBACK_COLOR);

  console.log('✅ CONFIG: Modern configuration system initialized');
})();
