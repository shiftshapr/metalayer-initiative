/**
 * ENHANCED LOGGING SYSTEM - Centralized Logging
 * TypeScript + ES6 Module
 */
class Logger {
    static setLevel(level) {
        const levelKey = level.toUpperCase();
        this.currentLevel = this.LOG_LEVELS[levelKey] || this.LOG_LEVELS.DEBUG;
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
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            context: context.toUpperCase(),
            message,
            data,
            id: this.generateLogId()
        };
        this.logHistory.push(logEntry);
        if (this.logHistory.length > this.maxHistorySize) {
            this.logHistory.shift();
        }
        const formattedMessage = this.formatMessage(logEntry);
        switch (level.toUpperCase()) {
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
}
Logger.LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    SUCCESS: 1
};
Logger.currentLevel = Logger.LOG_LEVELS.DEBUG;
Logger.isEnabled = true;
Logger.logHistory = [];
Logger.maxHistorySize = 1000;
export { Logger };
export default Logger;
// Export Logger to window for module access
if (typeof window !== 'undefined') {
    window.Logger = Logger;
    // Also set as a property that can be checked immediately
    Object.defineProperty(window, 'Logger', {
        value: Logger,
        writable: false,
        configurable: true,
        enumerable: true
    });
}
