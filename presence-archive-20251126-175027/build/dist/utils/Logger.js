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
class Logger {
    static setLevel(level) {
        const levelKey = level.toUpperCase();
        const levelValue = this.LOG_LEVELS[levelKey];
        const debugLevel = this.LOG_LEVELS.DEBUG;
        this.currentLevel = (levelValue !== undefined) ? levelValue : (debugLevel !== undefined ? debugLevel : 0);
    }
    static setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    static log(level, message, data = null, context = 'general') {
        if (!this.isEnabled)
            return;
        const levelKey = level.toUpperCase();
        const levelNum = this.LOG_LEVELS[levelKey];
        if (levelNum === undefined || levelNum > this.currentLevel)
            return;
        // In production, skip DEBUG and INFO logs entirely (no console output, no history)
        if (this.isProduction && (levelKey === 'DEBUG' || levelKey === 'INFO' || levelKey === 'SUCCESS')) {
            return;
        }
        const timestamp = new Date().toISOString();
        const logEntry = {
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
    static generateLogId() {
        return Math.random().toString(36).substring(2, 11);
    }
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
    // Instance methods for interface compliance
    error(message, ...args) {
        Logger.log('error', message, args.length > 0 ? args : null, 'general');
    }
    warn(message, ...args) {
        Logger.log('warn', message, args.length > 0 ? args : null, 'general');
    }
    info(message, ...args) {
        Logger.log('info', message, args.length > 0 ? args : null, 'general');
    }
    debug(message, ...args) {
        Logger.log('debug', message, args.length > 0 ? args : null, 'general');
    }
    setLevel(level) {
        Logger.setLevel(level);
    }
    log(level, message, data = null, context = 'general') {
        Logger.log(level, message, data, context);
    }
    // Static convenience methods
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
    static clearHistory() {
        this.logHistory = [];
    }
    static exportLogs() {
        return JSON.stringify(this.logHistory, null, 2);
    }
    static normalizeContext(context) {
        return (context || 'general').toLowerCase();
    }
    static configureDebugContexts(contexts) {
        if (!Array.isArray(contexts) || contexts.length === 0) {
            this.debugContextAllowlist = null;
            return;
        }
        this.debugContextAllowlist = new Set(contexts
            .map(ctx => (typeof ctx === 'string' ? this.normalizeContext(ctx) : null))
            .filter((ctx) => Boolean(ctx)));
    }
    static loadDebugContextAllowlistFromWindow() {
        if (typeof window === 'undefined')
            return;
        const win = window;
        if (Array.isArray(win.__DEBUG_CONTEXTS__)) {
            this.configureDebugContexts(win.__DEBUG_CONTEXTS__);
        }
    }
    static isDebugEnabled(context = 'general') {
        if (!this.isEnabled)
            return false;
        const normalizedContext = this.normalizeContext(context);
        const debugLevel = this.LOG_LEVELS.DEBUG ?? 0;
        const hasAllowlist = this.debugContextAllowlist && this.debugContextAllowlist.size > 0;
        if (this.currentLevel > debugLevel) {
            return false;
        }
        if (this.isProduction) {
            return hasAllowlist ? this.debugContextAllowlist.has(normalizedContext) : false;
        }
        if (hasAllowlist) {
            return this.debugContextAllowlist.has(normalizedContext);
        }
        return true;
    }
    static time(label) {
        const start = performance.now();
        return {
            end: () => {
                const duration = performance.now() - start;
                this.log('debug', `${label}: ${duration.toFixed(2)}ms`);
            }
        };
    }
    static group(label, fn) {
        console.group(label);
        try {
            return fn();
        }
        finally {
            console.groupEnd();
        }
    }
    static trace(functionName, args) {
        this.log('debug', `→ ${functionName}`, args);
        return {
            exit: (result) => {
                this.log('debug', `← ${functionName}`, result);
            }
        };
    }
    /**
     * Check if Logger is in production mode
     */
    static isProductionMode() {
        return this.isProduction;
    }
    /**
     * Initialize Logger with environment-based settings
     * Call this early in application startup
     */
    static initialize() {
        this.loadDebugContextAllowlistFromWindow();
        if (this.isProduction) {
            this.setLevel('WARN'); // Only WARN and ERROR in production
            Logger.info('Logger initialized in PRODUCTION mode - DEBUG/INFO logs disabled');
        }
        else {
            this.setLevel('DEBUG'); // All logs in development
            Logger.debug('Logger initialized in DEVELOPMENT mode - all logs enabled');
        }
    }
}
Logger.LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    SUCCESS: 1
};
// Detect production mode
Logger.isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production' ||
    typeof window !== 'undefined' && window.__PRODUCTION__ === true;
// In production, default to WARN level (only WARN and ERROR)
// In development, default to DEBUG level (all logs)
Logger.currentLevel = Logger.isProduction
    ? Logger.LOG_LEVELS.WARN ?? 2
    : Logger.LOG_LEVELS.DEBUG ?? 0;
Logger.isEnabled = true;
Logger.logHistory = [];
Logger.maxHistorySize = 1000;
Logger.debugContextAllowlist = null;
// Auto-initialize on module load
Logger.initialize();
export { Logger };
export default Logger;
// Export removed - use ES6 imports instead of window.Logger
//# sourceMappingURL=Logger.js.map