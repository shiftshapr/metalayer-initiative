// Modern Environment Configuration System
// Replaces hardcoded URLs with environment-based configuration

(function() {
  'use strict';

  class ConfigManager {
    constructor() {
      this.config = {
        // Development (VPS deployment with domain)
        development: {
          apiUrl: 'https://api.themetalayer.org',
          wsUrl: 'wss://api.themetalayer.org/ws',
          supabaseUrl: 'https://zwxomzkmncwzwryvudwu.supabase.co',
          supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM',
          debugMode: true,
          logLevel: 'debug'
        },
        // Production
        production: {
          apiUrl: 'https://api.themetalayer.org',
          wsUrl: 'wss://api.themetalayer.org/ws',
          supabaseUrl: 'https://zwxomzkmncwzwryvudwu.supabase.co',
          supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM',
          debugMode: false,
          logLevel: 'error'
        },
        // Staging
        staging: {
          apiUrl: 'https://api.themetalayer.org/staging',
          wsUrl: 'wss://api.themetalayer.org/staging/ws',
          supabaseUrl: 'https://zwxomzkmncwzwryvudwu.supabase.co',
          supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eG9temttbmN3endyeXZ1ZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Njg2ODQsImV4cCI6MjA3NTI0NDY4NH0.CoceGOzumiF6aYVGQSWily93snNYh9N9C4p8lrjrTyM',
          debugMode: true,
          logLevel: 'info'
        }
      };
      
      this.currentEnvironment = this.detectEnvironment();
      this.activeConfig = this.config[this.currentEnvironment];
      
      console.log(`🔧 CONFIG: Environment detected: ${this.currentEnvironment}`);
      console.log(`🔧 CONFIG: API URL: ${this.activeConfig.apiUrl}`);
      console.log(`🔧 CONFIG: WebSocket URL: ${this.activeConfig.wsUrl}`);
    }

    detectEnvironment() {
      // Check for environment indicators
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        // Force development mode if local server is available
        // This ensures we use localhost:3003 instead of production
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
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
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
  window.SUPABASE_URL = window.configManager.get('supabaseUrl');
  window.SUPABASE_ANON_KEY = window.configManager.get('supabaseAnonKey');
  window.DEBUG_MODE = window.configManager.get('debugMode');
  window.LOG_LEVEL = window.configManager.get('logLevel');

  console.log('✅ CONFIG: Modern configuration system initialized');
})();
