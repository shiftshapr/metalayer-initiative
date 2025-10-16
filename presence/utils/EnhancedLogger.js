/**
 * SD1 ENHANCED LOGGING SYSTEM
 * 
 * Centralized logging system with levels, filtering, and structured output.
 * Replaces scattered console.log statements throughout the codebase.
 */

class EnhancedLogger {
  static LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    SUCCESS: 4
  };

  static currentLevel = this.LOG_LEVELS.DEBUG;
  static isEnabled = true;
  static logHistory = [];
  static maxHistorySize = 1000;

  /**
   * Set the minimum log level to display
   * @param {string} level - 'error', 'warn', 'info', 'debug', 'success'
   */
  static setLevel(level) {
    this.currentLevel = this.LOG_LEVELS[level.toUpperCase()] || this.LOG_LEVELS.DEBUG;
  }

  /**
   * Enable or disable logging
   * @param {boolean} enabled - Whether logging is enabled
   */
  static setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Core logging method
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {*} data - Additional data to log
   * @param {string} context - Context (e.g., 'avatar', 'presence', 'auth')
   */
  static log(level, message, data = null, context = 'general') {
    if (!this.isEnabled) return;

    const levelNum = this.LOG_LEVELS[level.toUpperCase()];
    if (levelNum === undefined || levelNum > this.currentLevel) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${context.toUpperCase()}]`;
    
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      context: context.toUpperCase(),
      message,
      data,
      id: this.generateLogId()
    };

    // Add to history
    this.logHistory.push(logEntry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Format and output
    const formattedMessage = this.formatMessage(logEntry);
    
    switch(level.toUpperCase()) {
      case 'ERROR':
        console.error(formattedMessage, data);
        break;
      case 'WARN':
        console.warn(formattedMessage, data);
        break;
      case 'INFO':
        console.info(formattedMessage, data);
        break;
      case 'DEBUG':
        console.debug(formattedMessage, data);
        break;
      case 'SUCCESS':
        console.log(formattedMessage, data);
        break;
      default:
        console.log(formattedMessage, data);
    }
  }

  /**
   * Format log message with emojis and structure
   */
  static formatMessage(logEntry) {
    const emojis = {
      ERROR: '❌',
      WARN: '⚠️',
      INFO: 'ℹ️',
      DEBUG: '🔍',
      SUCCESS: '✅'
    };

    const emoji = emojis[logEntry.level] || '📝';
    return `${emoji} ${logEntry.message}`;
  }

  /**
   * Generate unique log ID
   */
  static generateLogId() {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Context-specific logging methods
   */
  static avatar(message, data = null) {
    this.log('debug', message, data, 'avatar');
  }

  static presence(message, data = null) {
    this.log('debug', message, data, 'presence');
  }

  static auth(message, data = null) {
    this.log('debug', message, data, 'auth');
  }

  static visibility(message, data = null) {
    this.log('debug', message, data, 'visibility');
  }

  static realtime(message, data = null) {
    this.log('debug', message, data, 'realtime');
  }

  static error(message, data = null, context = 'general') {
    this.log('error', message, data, context);
  }

  static warn(message, data = null, context = 'general') {
    this.log('warn', message, data, context);
  }

  static info(message, data = null, context = 'general') {
    this.log('info', message, data, context);
  }

  static debug(message, data = null, context = 'general') {
    this.log('debug', message, data, context);
  }

  static success(message, data = null, context = 'general') {
    this.log('success', message, data, context);
  }

  /**
   * Get log history
   */
  static getHistory(level = null, context = null, limit = 100) {
    let filtered = this.logHistory;
    
    if (level) {
      filtered = filtered.filter(entry => entry.level === level.toUpperCase());
    }
    
    if (context) {
      filtered = filtered.filter(entry => entry.context === context.toUpperCase());
    }
    
    return filtered.slice(-limit);
  }

  /**
   * Clear log history
   */
  static clearHistory() {
    this.logHistory = [];
  }

  /**
   * Export logs as JSON
   */
  static exportLogs() {
    return JSON.stringify(this.logHistory, null, 2);
  }

  /**
   * Performance timing
   */
  static time(label) {
    console.time(`⏱️ ${label}`);
    return {
      end: () => {
        console.timeEnd(`⏱️ ${label}`);
        this.success(`Timer completed: ${label}`);
      }
    };
  }

  /**
   * Group related logs
   */
  static group(label, fn) {
    console.group(`📁 ${label}`);
    const result = fn();
    console.groupEnd();
    return result;
  }

  /**
   * Log function entry/exit
   */
  static trace(functionName, args = null) {
    this.debug(`Entering: ${functionName}`, args);
    return {
      exit: (result = null) => {
        this.debug(`Exiting: ${functionName}`, result);
      }
    };
  }
}

// Make available globally
window.Logger = EnhancedLogger;

// Initialize with default settings
EnhancedLogger.setLevel('debug');
EnhancedLogger.setEnabled(true);

console.log('🔧 Enhanced Logger initialized');

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedLogger;
}
