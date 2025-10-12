// Modern Structured Logging System
// Implements structured logging, log levels, and performance monitoring

(function() {
  'use strict';

  class ModernLogger {
    constructor() {
      this.logLevels = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3,
        TRACE: 4
      };
      
      this.currentLevel = this.logLevels.INFO;
      this.logHistory = [];
      this.maxHistorySize = 1000;
      this.performanceMetrics = new Map();
      
      // Initialize log level from config
      if (window.configManager) {
        const configLevel = window.configManager.get('logLevel');
        this.setLogLevel(configLevel);
      }
      
      console.log('📝 LOGGER: Modern logging system initialized');
    }

    setLogLevel(level) {
      if (typeof level === 'string') {
        this.currentLevel = this.logLevels[level.toUpperCase()] || this.logLevels.INFO;
      } else {
        this.currentLevel = level;
      }
      console.log(`📝 LOGGER: Log level set to ${this.getCurrentLevelName()}`);
    }

    getCurrentLevelName() {
      return Object.keys(this.logLevels).find(key => this.logLevels[key] === this.currentLevel);
    }

    shouldLog(level) {
      return level <= this.currentLevel;
    }

    formatMessage(level, category, message, data) {
      const timestamp = new Date().toISOString();
      const levelName = Object.keys(this.logLevels)[level];
      const logEntry = {
        timestamp,
        level: levelName,
        category,
        message,
        data: data || null,
        performance: this.getPerformanceContext()
      };
      
      return logEntry;
    }

    getPerformanceContext() {
      return {
        memoryUsage: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        } : null,
        timing: {
          navigation: performance.timing ? {
            loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
            domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
          } : null
        }
      };
    }

    log(level, category, message, data = null) {
      if (!this.shouldLog(level)) {
        return;
      }

      const logEntry = this.formatMessage(level, category, message, data);
      
      // Add to history
      this.logHistory.push(logEntry);
      if (this.logHistory.length > this.maxHistorySize) {
        this.logHistory.shift();
      }
      
      // Console output with appropriate method
      const consoleMethod = this.getConsoleMethod(level);
      const formattedMessage = this.formatConsoleMessage(logEntry);
      
      if (data) {
        consoleMethod(formattedMessage, data);
      } else {
        consoleMethod(formattedMessage);
      }
      
      // Performance tracking
      this.trackLogPerformance(category, level);
    }

    getConsoleMethod(level) {
      switch (level) {
        case this.logLevels.ERROR: return console.error;
        case this.logLevels.WARN: return console.warn;
        case this.logLevels.INFO: return console.info;
        case this.logLevels.DEBUG: return console.debug;
        case this.logLevels.TRACE: return console.trace;
        default: return console.log;
      }
    }

    formatConsoleMessage(logEntry) {
      const emoji = this.getLevelEmoji(logEntry.level);
      return `${emoji} ${logEntry.level}: [${logEntry.category}] ${logEntry.message}`;
    }

    getLevelEmoji(level) {
      const emojis = {
        ERROR: '❌',
        WARN: '⚠️',
        INFO: 'ℹ️',
        DEBUG: '🐛',
        TRACE: '🔍'
      };
      return emojis[level] || '📝';
    }

    trackLogPerformance(category, level) {
      const key = `${category}_${level}`;
      const count = this.performanceMetrics.get(key) || 0;
      this.performanceMetrics.set(key, count + 1);
    }

    // Convenience methods
    error(category, message, data) {
      this.log(this.logLevels.ERROR, category, message, data);
    }

    warn(category, message, data) {
      this.log(this.logLevels.WARN, category, message, data);
    }

    info(category, message, data) {
      this.log(this.logLevels.INFO, category, message, data);
    }

    debug(category, message, data) {
      this.log(this.logLevels.DEBUG, category, message, data);
    }

    trace(category, message, data) {
      this.log(this.logLevels.TRACE, category, message, data);
    }

    // Performance logging
    startTimer(operation) {
      const startTime = performance.now();
      this.performanceMetrics.set(`${operation}_start`, startTime);
      this.debug('PERFORMANCE', `Timer started for: ${operation}`);
    }

    endTimer(operation) {
      const endTime = performance.now();
      const startTime = this.performanceMetrics.get(`${operation}_start`);
      
      if (startTime) {
        const duration = endTime - startTime;
        this.performanceMetrics.delete(`${operation}_start`);
        this.info('PERFORMANCE', `Operation completed: ${operation}`, { duration: `${duration.toFixed(2)}ms` });
        return duration;
      }
      
      this.warn('PERFORMANCE', `Timer not found for operation: ${operation}`);
      return null;
    }

    // Structured logging for specific categories
    logUserAction(action, details) {
      this.info('USER_ACTION', action, {
        timestamp: Date.now(),
        details,
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }

    logApiCall(method, url, status, duration) {
      this.info('API_CALL', `${method} ${url}`, {
        method,
        url,
        status,
        duration: `${duration}ms`,
        timestamp: Date.now()
      });
    }

    logError(error, context) {
      this.error('ERROR', error.message, {
        stack: error.stack,
        context,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }

    logSecurityEvent(event, details) {
      this.warn('SECURITY', event, {
        ...details,
        timestamp: Date.now(),
        severity: 'medium'
      });
    }

    // Log analysis
    getLogStats() {
      const stats = {
        totalLogs: this.logHistory.length,
        levelDistribution: {},
        categoryDistribution: {},
        performanceMetrics: Object.fromEntries(this.performanceMetrics),
        recentErrors: this.logHistory
          .filter(log => log.level === 'ERROR')
          .slice(-10)
      };
      
      // Calculate distributions
      this.logHistory.forEach(log => {
        stats.levelDistribution[log.level] = (stats.levelDistribution[log.level] || 0) + 1;
        stats.categoryDistribution[log.category] = (stats.categoryDistribution[log.category] || 0) + 1;
      });
      
      return stats;
    }

    // Export logs
    exportLogs(format = 'json') {
      const logs = this.logHistory.slice(-100); // Last 100 logs
      
      if (format === 'json') {
        return JSON.stringify(logs, null, 2);
      } else if (format === 'csv') {
        const headers = ['timestamp', 'level', 'category', 'message'];
        const csv = [headers.join(',')];
        
        logs.forEach(log => {
          const row = headers.map(header => {
            const value = log[header] || '';
            return `"${value.toString().replace(/"/g, '""')}"`;
          });
          csv.push(row.join(','));
        });
        
        return csv.join('\n');
      }
      
      return logs;
    }

    // Clear logs
    clearLogs() {
      this.logHistory = [];
      this.performanceMetrics.clear();
      console.log('📝 LOGGER: Logs cleared');
    }
  }

  // Create global logger instance
  window.logger = new ModernLogger();
  
  // Expose convenience methods globally
  window.logError = (category, message, data) => window.logger.error(category, message, data);
  window.logWarn = (category, message, data) => window.logger.warn(category, message, data);
  window.logInfo = (category, message, data) => window.logger.info(category, message, data);
  window.logDebug = (category, message, data) => window.logger.debug(category, message, data);
  window.logTrace = (category, message, data) => window.logger.trace(category, message, data);

  console.log('✅ LOGGER: Modern structured logging system initialized');
})();









