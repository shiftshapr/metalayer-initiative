/**
 * Centralized Logger System for Chrome Extension
 * Replaces 1,102+ scattered console statements with structured logging
 * 
 * Features:
 * - Module-based logging (VISIBILITY, SUPABASE, AUTH, etc.)
 * - Log levels (DEBUG, INFO, WARN, ERROR)
 * - Performance tracking
 * - Production-safe logging
 * - Structured data logging
 */

class Logger {
  static LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };

  static currentLevel = Logger.LOG_LEVELS.DEBUG;
  static isProduction = false;
  static performanceMetrics = new Map();

  /**
   * Configure logger settings
   */
  static configure(options = {}) {
    this.currentLevel = options.level || Logger.LOG_LEVELS.DEBUG;
    this.isProduction = options.production || false;
    
    if (this.isProduction) {
      this.currentLevel = Logger.LOG_LEVELS.ERROR; // Only errors in production
    }
  }

  /**
   * Core logging method
   */
  static _log(level, module, message, data = null, performance = false) {
    if (level < this.currentLevel) return;

    const timestamp = new Date().toISOString();
    const levelName = Object.keys(Logger.LOG_LEVELS)[level];
    const prefix = `[${timestamp}] [${levelName}] [${module}]`;
    
    // Performance tracking
    if (performance) {
      const startTime = this.performanceMetrics.get(performance);
      if (startTime) {
        const duration = Date.now() - startTime;
        message += ` (${duration}ms)`;
        this.performanceMetrics.delete(performance);
      }
    }

    // Structured logging
    const logData = {
      timestamp,
      level: levelName,
      module,
      message,
      data: data ? (typeof data === 'object' ? JSON.stringify(data, null, 2) : data) : null
    };

    // Console output with appropriate method
    const consoleMethod = level >= Logger.LOG_LEVELS.ERROR ? 'error' : 
                         level >= Logger.LOG_LEVELS.WARN ? 'warn' : 'log';
    
    if (data) {
      console[consoleMethod](`${prefix} ${message}`, data);
    } else {
      console[consoleMethod](`${prefix} ${message}`);
    }

    // Store in window for debugging (development only)
    if (!this.isProduction && typeof window !== 'undefined') {
      if (!window.logHistory) window.logHistory = [];
      window.logHistory.push(logData);
      if (window.logHistory.length > 1000) window.logHistory.shift(); // Keep last 1000 logs
    }
  }

  /**
   * Debug level logging
   */
  static debug(module, message, data = null) {
    this._log(Logger.LOG_LEVELS.DEBUG, module, message, data);
  }

  /**
   * Info level logging
   */
  static info(module, message, data = null) {
    this._log(Logger.LOG_LEVELS.INFO, module, message, data);
  }

  /**
   * Warning level logging
   */
  static warn(module, message, data = null) {
    this._log(Logger.LOG_LEVELS.WARN, module, message, data);
  }

  /**
   * Error level logging
   */
  static error(module, message, data = null) {
    this._log(Logger.LOG_LEVELS.ERROR, module, message, data);
  }

  /**
   * Performance tracking
   */
  static startPerformance(operationId) {
    this.performanceMetrics.set(operationId, Date.now());
    this.debug('PERFORMANCE', `Started: ${operationId}`);
  }

  static endPerformance(operationId, message = 'Completed') {
    this._log(Logger.LOG_LEVELS.INFO, 'PERFORMANCE', message, null, operationId);
  }

  /**
   * Flow tracking for complex operations
   */
  static startFlow(flowName, data = null) {
    this.info('FLOW', `🚀 Started: ${flowName}`, data);
    this.startPerformance(flowName);
  }

  static stepFlow(flowName, step, data = null) {
    this.debug('FLOW', `📋 ${flowName} - ${step}`, data);
  }

  static endFlow(flowName, success = true, data = null) {
    this.endPerformance(flowName, `✅ ${flowName} ${success ? 'SUCCESS' : 'FAILED'}`);
    this.info('FLOW', `🏁 Completed: ${flowName} (${success ? 'SUCCESS' : 'FAILED'})`, data);
  }

  /**
   * Module-specific logging methods
   */
  static visibility(message, data = null) {
    this.debug('VISIBILITY', message, data);
  }

  static supabase(message, data = null) {
    this.debug('SUPABASE', message, data);
  }

  static auth(message, data = null) {
    this.debug('AUTH', message, data);
  }

  static presence(message, data = null) {
    this.debug('PRESENCE', message, data);
  }

  static message(message, data = null) {
    this.debug('MESSAGE', message, data);
  }

  static aura(message, data = null) {
    this.debug('AURA', message, data);
  }

  static websocket(message, data = null) {
    this.debug('WEBSOCKET', message, data);
  }

  /**
   * Get log history for debugging
   */
  static getHistory(module = null, limit = 100) {
    if (typeof window === 'undefined' || !window.logHistory) return [];
    
    let logs = window.logHistory;
    if (module) {
      logs = logs.filter(log => log.module === module);
    }
    
    return logs.slice(-limit);
  }

  /**
   * Clear log history
   */
  static clearHistory() {
    if (typeof window !== 'undefined') {
      window.logHistory = [];
    }
  }

  /**
   * Export logs for debugging
   */
  static exportLogs(module = null) {
    const logs = this.getHistory(module);
    const exportData = {
      timestamp: new Date().toISOString(),
      module: module || 'ALL',
      logCount: logs.length,
      logs: logs
    };
    
    console.log('📊 LOG EXPORT:', exportData);
    return exportData;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Logger;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.Logger = Logger;
}

console.log('✅ Logger system initialized');

