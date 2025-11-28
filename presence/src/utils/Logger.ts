/**
 * ENHANCED LOGGING SYSTEM - Centralized Logging
 * TypeScript + ES6 Module
 *
 * Production Mode: In production (NODE_ENV=production), DEBUG logs are stripped at build time
 * or filtered at runtime. Only ERROR and WARN logs are emitted in production.
 *
 * Usage:
 *   Logger.debug('Debug message', data, 'context');  // Only in development
 *   Logger.info('Info message', data, 'context');    // Development only
 *   Logger.warn('Warning message', data, 'context'); // Always logged
 *   Logger.error('Error message', data, 'context');   // Always logged
 */

export interface LogData {
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  context: string;
  message: string;
  data: unknown;
  id: string;
}

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

class Logger {
  static readonly LOG_LEVELS: Record<string, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    SUCCESS: 1
  };

  private static readonly isProduction: boolean =
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') ||
    (typeof window !== 'undefined' && (window as Window & { __PRODUCTION__?: boolean }).__PRODUCTION__ === true);

  static currentLevel: number = Logger.isProduction
    ? Logger.LOG_LEVELS.WARN ?? 2
    : Logger.LOG_LEVELS.DEBUG ?? 0;

  static isEnabled: boolean = true;
  static logHistory: LogEntry[] = [];
  static maxHistorySize: number = 1000;
  private static debugContextAllowlist: Set<string> | null = null;

  static setLevel(level: string): void {
    const levelKey = level.toUpperCase();
    const levelValue = this.LOG_LEVELS[levelKey];
    const debugLevel = this.LOG_LEVELS.DEBUG;
    this.currentLevel = (levelValue !== undefined) ? levelValue : (debugLevel !== undefined ? debugLevel : 0);
  }

  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  static log(level: string, message: string, data: unknown = null, context: string = 'general'): void {
    if (!this.isEnabled) return;
    const levelKey = level.toUpperCase();
    const levelNum = this.LOG_LEVELS[levelKey];
    if (levelNum === undefined || levelNum > this.currentLevel) return;

    // In production, skip DEBUG and INFO logs entirely (no console output, no history)
    if (this.isProduction && (levelKey === 'DEBUG' || levelKey === 'INFO' || levelKey === 'SUCCESS')) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level: level.toUpperCase(),
      context: context.toUpperCase(),
      message,
      data,
      id: this.generateLogId()
    };

    // Only store in history if not production or if it's WARN/ERROR
    if (!this.isProduction || levelKey === 'WARN' || levelKey === 'ERROR') {
      this.logHistory.push(logEntry);
      if (this.logHistory.length > this.maxHistorySize) {
        this.logHistory.shift();
      }
    }

    const formattedMessage = this.formatMessage(logEntry);
    switch (level.toUpperCase()) {
      case 'ERROR':
        Logger.error(formattedMessage, data, 'general');
        break;
      case 'WARN':
        Logger.warn(formattedMessage, data, 'general');
        break;
      case 'INFO':
        console.info(formattedMessage, data);
        break;
      case 'DEBUG':
        console.debug(formattedMessage, data);
        break;
      case 'SUCCESS':
        Logger.debug(formattedMessage, data, 'general');
        break;
      default:
        Logger.debug(formattedMessage, data, 'general');
    }
  }

  static formatMessage(logEntry: LogEntry): string {
    const emojis: Record<string, string> = {
      ERROR: '❌',
      WARN: '⚠️',
      INFO: 'ℹ️',
      DEBUG: '🔍',
      SUCCESS: '✅'
    };
    const emoji = emojis[logEntry.level] || '📝';
    return `${emoji} ${logEntry.message}`;
  }

  static generateLogId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  static avatar(message: string, data: unknown = null): void {
    this.log('debug', message, data, 'avatar');
  }

  static presence(message: string, data: unknown = null): void {
    this.log('debug', message, data, 'presence');
  }

  static auth(message: string, data: unknown = null): void {
    this.log('debug', message, data, 'auth');
  }

  static visibility(message: string, data: unknown = null): void {
    this.log('debug', message, data, 'visibility');
  }

  static realtime(message: string, data: unknown = null): void {
    this.log('debug', message, data, 'realtime');
  }

  // Instance methods for interface compliance
  error(message: string, ...args: unknown[]): void {
    Logger.log('error', message, args.length > 0 ? args : null, 'general');
  }

  warn(message: string, ...args: unknown[]): void {
    Logger.log('warn', message, args.length > 0 ? args : null, 'general');
  }

  info(message: string, ...args: unknown[]): void {
    Logger.log('info', message, args.length > 0 ? args : null, 'general');
  }

  debug(message: string, ...args: unknown[]): void {
    Logger.log('debug', message, args.length > 0 ? args : null, 'general');
  }

  setLevel(level: LogLevel): void {
    Logger.setLevel(level);
  }

  log(level: string, message: string, data: unknown = null, context: string = 'general'): void {
    Logger.log(level, message, data, context);
  }

  // Static convenience methods
  static error(message: string, data: unknown = null, context: string = 'general'): void {
    this.log('error', message, data, context);
  }

  static warn(message: string, data: unknown = null, context: string = 'general'): void {
    this.log('warn', message, data, context);
  }

  static info(message: string, data: unknown = null, context: string = 'general'): void {
    this.log('info', message, data, context);
  }

  static debug(message: string, data: unknown = null, context: string = 'general'): void {
    this.log('debug', message, data, context);
  }

  static success(message: string, data: unknown = null, context: string = 'general'): void {
    this.log('success', message, data, context);
  }

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

  static clearHistory(): void {
    this.logHistory = [];
  }

  static exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  private static normalizeContext(context: string): string {
    return (context || 'general').toLowerCase();
  }

  static configureDebugContexts(contexts: string[] | null | undefined): void {
    if (!Array.isArray(contexts) || contexts.length === 0) {
      this.debugContextAllowlist = null;
      return;
    }
    this.debugContextAllowlist = new Set(contexts
      .map(ctx => (typeof ctx === 'string' ? this.normalizeContext(ctx) : null))
      .filter((ctx): ctx is string => Boolean(ctx)));
  }

  private static loadDebugContextAllowlistFromWindow(): void {
    if (typeof window === 'undefined') return;
    const win = window as Window & { __DEBUG_CONTEXTS__?: string[] };
    if (Array.isArray(win.__DEBUG_CONTEXTS__)) {
      this.configureDebugContexts(win.__DEBUG_CONTEXTS__);
    }
  }

  static isDebugEnabled(context: string = 'general'): boolean {
    if (!this.isEnabled) return false;
    const normalizedContext = this.normalizeContext(context);
    const debugLevel = this.LOG_LEVELS.DEBUG ?? 0;
    const hasAllowlist = this.debugContextAllowlist && this.debugContextAllowlist.size > 0;
    if (this.currentLevel > debugLevel) {
      return false;
    }
    if (this.isProduction) {
      return hasAllowlist ? this.debugContextAllowlist!.has(normalizedContext) : false;
    }
    if (hasAllowlist) {
      return this.debugContextAllowlist!.has(normalizedContext);
    }
    return true;
  }

  static time(label: string): { end: () => void } {
    const start = performance.now();
    return {
      end: () => {
        const duration = performance.now() - start;
        this.log('debug', `${label}: ${duration.toFixed(2)}ms`);
      }
    };
  }

  static group<T>(label: string, fn: () => T): T {
    console.group(label);
    try {
      return fn();
    } finally {
      console.groupEnd();
    }
  }

  static trace(functionName: string, args?: unknown): { exit: (result?: unknown) => void } {
    this.log('debug', `→ ${functionName}`, args);
    return {
      exit: (result?: unknown) => {
        this.log('debug', `← ${functionName}`, result);
      }
    };
  }

  /**
   * Check if Logger is in production mode
   */
  static isProductionMode(): boolean {
    return this.isProduction;
  }

  /**
   * Initialize Logger with environment-based settings
   * Call this early in application startup
   */
  static initialize(): void {
    this.loadDebugContextAllowlistFromWindow();
    if (this.isProduction) {
      this.setLevel('WARN'); // Only WARN and ERROR in production
      Logger.info('Logger initialized in PRODUCTION mode - DEBUG/INFO logs disabled');
    } else {
      this.setLevel('DEBUG'); // All logs in development
      Logger.debug('Logger initialized in DEVELOPMENT mode - all logs enabled');
    }
  }
}

// Auto-initialize on module load
Logger.initialize();

export { Logger };
export default Logger;





