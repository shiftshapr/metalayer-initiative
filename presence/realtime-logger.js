/**
 * COMPREHENSIVE REAL-TIME LOGGING SYSTEM
 * Provides detailed logging for messages, visibility, and aura real-time updates
 */

class RealtimeLogger {
  constructor() {
    this.logLevel = 'debug'; // debug, info, warn, error
    this.logHistory = [];
    this.maxHistorySize = 1000;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  generateSessionId() {
//     return 'rt_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  log(level, category, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      sessionId: this.sessionId,
      level,
      category,
      message,
      data,
      elapsed: Date.now() - this.startTime
    };

    // Add to history
    this.logHistory.push(logEntry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Console output with formatting
    const prefix = `[${timestamp}] [${this.sessionId}] [${level.toUpperCase()}] [${category}]`;
    const fullMessage = `${prefix} ${message}`;
    
    if (data) {
      console.log(fullMessage, data);
    } else {
      console.log(fullMessage);
    }

    // Store in chrome storage for debugging
    this.storeLogEntry(logEntry);
  }

  async storeLogEntry(logEntry) {
    try {
      const result = await chrome.storage.local.get(['realtimeLogs']);
      const logs = result.realtimeLogs || [];
      logs.push(logEntry);
      
      // Keep only last 500 entries
      if (logs.length > 500) {
        logs.splice(0, logs.length - 500);
      }
      
      await chrome.storage.local.set({ realtimeLogs: logs });
    } catch (error) {
      console.error('Failed to store log entry:', error);
    }
  }

  // Category-specific logging methods
  websocket(level, message, data = null) {
    this.log(level, 'WEBSOCKET', message, data);
  }

  supabase(level, message, data = null) {
    this.log(level, 'SUPABASE', message, data);
  }

  aura(level, message, data = null) {
    this.log(level, 'AURA', message, data);
  }

  message(level, message, data = null) {
    this.log(level, 'MESSAGE', message, data);
  }

  visibility(level, message, data = null) {
    this.log(level, 'VISIBILITY', message, data);
  }

  presence(level, message, data = null) {
    this.log(level, 'PRESENCE', message, data);
  }

  error(level, message, data = null) {
    this.log(level, 'ERROR', message, data);
  }

  // Flow tracking methods
  startFlow(flowName, data = null) {
    this.log('info', 'FLOW_START', `Starting flow: ${flowName}`, data);
  }

  endFlow(flowName, success = true, data = null) {
    const level = success ? 'info' : 'error';
    this.log(level, 'FLOW_END', `Flow completed: ${flowName} (success: ${success})`, data);
  }

  stepFlow(flowName, step, data = null) {
    this.log('debug', 'FLOW_STEP', `${flowName} - ${step}`, data);
  }

  // Performance tracking
  startTimer(timerName) {
    const timer = {
      name: timerName,
      start: Date.now(),
      sessionId: this.sessionId
    };
    return timer;
  }

  endTimer(timer, data = null) {
    const duration = Date.now() - timer.start;
    this.log('info', 'PERFORMANCE', `Timer ${timer.name}: ${duration}ms`, data);
    return duration;
  }

  // Get log history
  getHistory(category = null, level = null) {
    let filtered = this.logHistory;
    
    if (category) {
      filtered = filtered.filter(entry => entry.category === category);
    }
    
    if (level) {
      filtered = filtered.filter(entry => entry.level === level);
    }
    
    return filtered;
  }

  // Export logs for debugging
  exportLogs() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      logs: this.logHistory,
      summary: this.getLogSummary()
    };
  }

  getLogSummary() {
    const categories = {};
    const levels = {};
    
    this.logHistory.forEach(entry => {
      categories[entry.category] = (categories[entry.category] || 0) + 1;
      levels[entry.level] = (levels[entry.level] || 0) + 1;
    });
    
    return { categories, levels, total: this.logHistory.length };
  }

  // Clear logs
  clearLogs() {
    this.logHistory = [];
    chrome.storage.local.remove(['realtimeLogs']);
  }
}

// Global instance
window.realtimeLogger = new RealtimeLogger();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealtimeLogger;
}



