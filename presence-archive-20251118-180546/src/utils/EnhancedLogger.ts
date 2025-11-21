/**
 * ENHANCED LOGGING SYSTEM - TypeScript Version
 * 
 * Centralized logging system with levels, filtering, and structured output.
 * Replaces scattered console.log statements throughout the codebase.
 * 
 * Note: This may conflict with existing Logger.ts - consider merging or renaming.
 */

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'SUCCESS';
type LogContext = 'general' | 'avatar' | 'presence' | 'auth' | 'visibility' | 'realtime';

// Type definitions for logging
type LogData = string | number | boolean | object | Error | null | undefined;

interface LogMetadata {
  timestamp?: Date;
  level?: 'debug' | 'info' | 'warn' | 'error';
  context?: string;
  userId?: string;
  [key: string]: unknown; // Allow additional metadata
}

interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  data?: LogData;
  metadata?: LogMetadata;
  timestamp: string;
  context: string;
}

interface TimerResult {
  end: () => void;
}

interface TraceResult {
  exit: (result?: LogData) => void;
}

// Log transformer type with generics
type LogTransformer<T = LogEntry> = (entry: LogEntry) => T;

// Log filter type
type LogFilter = (entry: LogEntry) => boolean;

class EnhancedLogger {
  static readonly LOG_LEVELS: Record<LogLevel, number> = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    SUCCESS: 4
  };

  private static currentLevel: number = this.LOG_LEVELS.DEBUG;
  private static isEnabled: boolean = true;
  private static logHistory: LogEntry[] = [];
  private static readonly maxHistorySize: number = 1000;

  /**
   * Set the minimum log level to display
   */
  static setLevel(level: string): void {
    const upperLevel = level.toUpperCase() as LogLevel;
    this.currentLevel = this.LOG_LEVELS[upperLevel] || this.LOG_LEVELS.DEBUG;
  }

  /**
   * Enable or disable logging
   */
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Core logging method
   */
  static log(level: string, message: string, data: LogData = null, context: LogContext = 'general'): void {
    if (!this.isEnabled) return;

    const upperLevel = level.toUpperCase() as LogLevel;
    const levelNum = this.LOG_LEVELS[upperLevel];
    if (levelNum === undefined || levelNum > this.currentLevel) return;

    const timestamp = new Date().toISOString();
    
    const logEntry: LogEntry = {
      timestamp,
      level: upperLevel,
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
    
    switch(upperLevel) {
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
  private static formatMessage(logEntry: LogEntry): string {
    const emojis: Record<LogLevel, string> = {
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
  private static generateLogId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  /**
   * Context-specific logging methods
   */
  static avatar(message: string, data: LogData = null): void {
    this.log('debug', message, data, 'avatar');
  }

  static presence(message: string, data: LogData = null): void {
    this.log('debug', message, data, 'presence');
  }

  static auth(message: string, data: LogData = null): void {
    this.log('debug', message, data, 'auth');
  }

  static visibility(message: string, data: LogData = null): void {
    this.log('debug', message, data, 'visibility');
  }

  static realtime(message: string, data: LogData = null): void {
    this.log('debug', message, data, 'realtime');
  }

  static error(message: string, data: LogData = null, context: LogContext = 'general'): void {
    this.log('error', message, data, context);
  }

  static warn(message: string, data: LogData = null, context: LogContext = 'general'): void {
    this.log('warn', message, data, context);
  }

  static info(message: string, data: LogData = null, context: LogContext = 'general'): void {
    this.log('info', message, data, context);
  }

  static debug(message: string, data: LogData = null, context: LogContext = 'general'): void {
    this.log('debug', message, data, context);
  }

  static success(message: string, data: LogData = null, context: LogContext = 'general'): void {
    this.log('success', message, data, context);
  }

  /**
   * Get log history
   */
  static getHistory(level: string | null = null, context: string | null = null, limit: number = 100): LogEntry[] {
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
  static clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Export logs as JSON
   */
  static exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  /**
   * Performance timing
   */
  static time(label: string): TimerResult {
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
  static group<T>(label: string, fn: () => T): T {
    console.group(`📁 ${label}`);
    const result = fn();
    console.groupEnd();
    return result;
  }

  /**
   * Log function entry/exit
   */
  static trace(functionName: string, args: LogData = null): TraceResult {
    this.debug(`Entering: ${functionName}`, args);
    return {
      exit: (result: LogData = null) => {
        this.debug(`Exiting: ${functionName}`, result);
      }
    };
  }
}

// Make available globally for backward compatibility
if (typeof window !== 'undefined') {
  (window as typeof window & { Logger: typeof EnhancedLogger }).Logger = EnhancedLogger;
}

// Initialize with default settings
EnhancedLogger.setLevel('debug');
EnhancedLogger.setEnabled(true);

console.log('🔧 Enhanced Logger initialized');

export default EnhancedLogger;
export { EnhancedLogger };

