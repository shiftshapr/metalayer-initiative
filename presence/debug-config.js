// Debug configuration for the Metalayer extension
// This controls the verbosity of debug logging

const DEBUG_CONFIG = {
  // Master debug switch
  enabled: false, // Set to true for development, false for production
  
  // Individual debug categories
  categories: {
    // Core functionality
    auth: false,
    presence: false,
    chat: false,
    aura: false,
    visibility: false,
    
    // API calls
    api: false,
    supabase: false,
    
    // UI interactions
    ui: false,
    modals: false,
    
    // Performance monitoring
    performance: false,
    
    // Error logging (always enabled)
    errors: true
  },
  
  // Log levels
  levels: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    VERBOSE: 4
  },
  
  // Current log level (only show this level and above)
  currentLevel: 1 // Only show WARN and ERROR by default
};

// Debug logger class
class DebugLogger {
  constructor(config = DEBUG_CONFIG) {
    this.config = config;
  }
  
  log(level, category, message, ...args) {
    if (!this.config.enabled) return;
    
    const levelNum = this.config.levels[level] || 0;
    if (levelNum > this.config.currentLevel) return;
    
    if (this.config.categories[category] === false) return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${category.toUpperCase()}]`;
    
    switch (level) {
      case 'ERROR':
        console.error(prefix, message, ...args);
        break;
      case 'WARN':
        console.warn(prefix, message, ...args);
        break;
      case 'INFO':
        console.info(prefix, message, ...args);
        break;
      case 'DEBUG':
        console.log(prefix, message, ...args);
        break;
      case 'VERBOSE':
        console.log(prefix, message, ...args);
        break;
      default:
        console.log(prefix, message, ...args);
    }
  }
  
  error(category, message, ...args) {
    this.log('ERROR', category, message, ...args);
  }
  
  warn(category, message, ...args) {
    this.log('WARN', category, message, ...args);
  }
  
  info(category, message, ...args) {
    this.log('INFO', category, message, ...args);
  }
  
  debug(category, message, ...args) {
    this.log('DEBUG', category, message, ...args);
  }
  
  verbose(category, message, ...args) {
    this.log('VERBOSE', category, message, ...args);
  }
  
  // Enable specific categories for debugging
  enableCategory(category) {
    this.config.categories[category] = true;
  }
  
  // Disable specific categories
  disableCategory(category) {
    this.config.categories[category] = false;
  }
  
  // Set log level
  setLevel(level) {
    this.config.currentLevel = this.config.levels[level] || 1;
  }
  
  // Enable all debug logging
  enableAll() {
    this.config.enabled = true;
    Object.keys(this.config.categories).forEach(category => {
      this.config.categories[category] = true;
    });
    this.config.currentLevel = this.config.levels.DEBUG;
  }
  
  // Disable all debug logging
  disableAll() {
    this.config.enabled = false;
  }
}

// Create global debug logger instance
window.debugLogger = new DebugLogger();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DebugLogger, DEBUG_CONFIG };
}










