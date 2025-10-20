/**
 * LOGGER - Production-Ready Logging System
 * Configurable logging with runtime level control
 * 
 * Features:
 * - Multiple log levels (DEBUG, INFO, WARN, ERROR)
 * - Runtime level toggling
 * - Consistent formatting
 * - Module-based logging
 * - Production-ready output
 */

class Logger {
  static levels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    SILENT: 4
  };
  
  static currentLevel = Logger.levels.INFO;
  static moduleColors = {
    'RealtimeManager': '#4CAF50',
    'AuthManager': '#2196F3', 
    'StateManager': '#FF9800',
    'EventBus': '#9C27B0',
    'LifecycleManager': '#607D8B',
    'VisibilityManager': '#795548',
    'ChatManager': '#E91E63',
    'SupabaseService': '#00BCD4',
    'SidepanelCore': '#8BC34A'
  };
  
  /**
   * Set logging level at runtime
   */
  static setLevel(level) {
    if (typeof level === 'string') {
      this.currentLevel = this.levels[level.toUpperCase()] || this.levels.INFO;
    } else {
      this.currentLevel = level;
    }
    console.log(`🔧 Logger: Level set to ${this.getCurrentLevelName()}`);
  }
  
  /**
   * Get current level name
   */
  static getCurrentLevelName() {
    return Object.keys(this.levels).find(key => this.levels[key] === this.currentLevel) || 'INFO';
  }
  
  /**
   * Get module color for consistent styling
   */
  static getModuleColor(module) {
    return this.moduleColors[module] || '#666666';
  }
  
  /**
   * Format log message with consistent styling
   */
  static formatMessage(level, module, message, data = null) {
    const timestamp = new Date().toISOString().substr(11, 12);
    const color = this.getModuleColor(module);
    const levelIcon = this.getLevelIcon(level);
    
    const formattedMessage = `${levelIcon} [${module}] ${message}`;
    
    if (data !== null && data !== undefined) {
      return [formattedMessage, data];
    }
    
    return formattedMessage;
  }
  
  /**
   * Get icon for log level
   */
  static getLevelIcon(level) {
    const icons = {
      DEBUG: '🔍',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌'
    };
    return icons[level] || 'ℹ️';
  }
  
  /**
   * Debug level logging
   */
  static debug(module, message, data = null) {
    if (this.currentLevel <= this.levels.DEBUG) {
      const formatted = this.formatMessage('DEBUG', module, message, data);
      if (Array.isArray(formatted)) {
        console.log(formatted[0], formatted[1]);
      } else {
        console.log(formatted);
      }
    }
  }
  
  /**
   * Info level logging
   */
  static info(module, message, data = null) {
    if (this.currentLevel <= this.levels.INFO) {
      const formatted = this.formatMessage('INFO', module, message, data);
      if (Array.isArray(formatted)) {
        console.log(formatted[0], formatted[1]);
      } else {
        console.log(formatted);
      }
    }
  }
  
  /**
   * Warning level logging
   */
  static warn(module, message, data = null) {
    if (this.currentLevel <= this.levels.WARN) {
      const formatted = this.formatMessage('WARN', module, message, data);
      if (Array.isArray(formatted)) {
        console.warn(formatted[0], formatted[1]);
      } else {
        console.warn(formatted);
      }
    }
  }
  
  /**
   * Error level logging
   */
  static error(module, message, data = null) {
    if (this.currentLevel <= this.levels.ERROR) {
      const formatted = this.formatMessage('ERROR', module, message, data);
      if (Array.isArray(formatted)) {
        console.error(formatted[0], formatted[1]);
      } else {
        console.error(formatted);
      }
    }
  }
  
  /**
   * Success logging (INFO level with success icon)
   */
  static success(module, message, data = null) {
    if (this.currentLevel <= this.levels.INFO) {
      const timestamp = new Date().toISOString().substr(11, 12);
      const color = this.getModuleColor(module);
      const formattedMessage = `✅ [${module}] ${message}`;
      
      if (data !== null && data !== undefined) {
        console.log(formattedMessage, data);
      } else {
        console.log(formattedMessage);
      }
    }
  }
  
  /**
   * Performance timing
   */
  static time(module, label) {
    if (this.currentLevel <= this.levels.DEBUG) {
      console.time(`⏱️ [${module}] ${label}`);
    }
  }
  
  static timeEnd(module, label) {
    if (this.currentLevel <= this.levels.DEBUG) {
      console.timeEnd(`⏱️ [${module}] ${label}`);
    }
  }
  
  /**
   * Group logging for related operations
   */
  static group(module, label) {
    if (this.currentLevel <= this.levels.DEBUG) {
      console.group(`📦 [${module}] ${label}`);
    }
  }
  
  static groupEnd(module) {
    if (this.currentLevel <= this.levels.DEBUG) {
      console.groupEnd();
    }
  }
  
  /**
   * Avatar logging (compatibility method for AvatarUtils)
   */
  static avatar(module, message, data = null) {
    // This is a compatibility method for AvatarUtils
    this.info(module, message, data);
  }

  /**
   * Get current configuration
   */
  static getConfig() {
    return {
      level: this.getCurrentLevelName(),
      numericLevel: this.currentLevel,
      availableLevels: Object.keys(this.levels),
      moduleColors: this.moduleColors
    };
  }
}

// Global instance
window.Logger = Logger;

// Convenience methods for common modules
window.logDebug = (module, message, data) => Logger.debug(module, message, data);
window.logInfo = (module, message, data) => Logger.info(module, message, data);
window.logWarn = (module, message, data) => Logger.warn(module, message, data);
window.logError = (module, message, data) => Logger.error(module, message, data);
window.logSuccess = (module, message, data) => Logger.success(module, message, data);

console.log('🔧 Enhanced Logger initialized');
console.log('📋 Logger: Use Logger.setLevel("DEBUG") to enable debug logging');
console.log('📋 Logger: Use Logger.setLevel("SILENT") to disable all logging');
