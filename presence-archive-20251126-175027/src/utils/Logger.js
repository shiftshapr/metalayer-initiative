"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.setLevel = function (level) {
        var levelKey = level.toUpperCase();
        var levelValue = this.LOG_LEVELS[levelKey];
        var debugLevel = this.LOG_LEVELS.DEBUG;
        this.currentLevel = (levelValue !== undefined) ? levelValue : (debugLevel !== undefined ? debugLevel : 0);
    };
    Logger.setEnabled = function (enabled) {
        this.isEnabled = enabled;
    };
    Logger.log = function (level, message, data, context) {
        if (data === void 0) { data = null; }
        if (context === void 0) { context = 'general'; }
        if (!this.isEnabled)
            return;
        var levelKey = level.toUpperCase();
        var levelNum = this.LOG_LEVELS[levelKey];
        if (levelNum === undefined || levelNum > this.currentLevel)
            return;
        // In production, skip DEBUG and INFO logs entirely (no console output, no history)
        if (this.isProduction && (levelKey === 'DEBUG' || levelKey === 'INFO' || levelKey === 'SUCCESS')) {
            return;
        }
        var timestamp = new Date().toISOString();
        var logEntry = {
            timestamp: timestamp,
            level: level.toUpperCase(),
            context: context.toUpperCase(),
            message: message,
            data: data,
            id: this.generateLogId()
        };
        // Only store in history if not production or if it's WARN/ERROR
        if (!this.isProduction || levelKey === 'WARN' || levelKey === 'ERROR') {
            this.logHistory.push(logEntry);
            if (this.logHistory.length > this.maxHistorySize) {
                this.logHistory.shift();
            }
        }
        var formattedMessage = this.formatMessage(logEntry);
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
    };
    Logger.formatMessage = function (logEntry) {
        var emojis = {
            ERROR: '❌',
            WARN: '⚠️',
            INFO: 'ℹ️',
            DEBUG: '🔍',
            SUCCESS: '✅'
        };
        var emoji = emojis[logEntry.level] || '📝';
        return "".concat(emoji, " ").concat(logEntry.message);
    };
    Logger.generateLogId = function () {
        return Math.random().toString(36).substring(2, 11);
    };
    Logger.avatar = function (message, data) {
        if (data === void 0) { data = null; }
        this.log('debug', message, data, 'avatar');
    };
    Logger.presence = function (message, data) {
        if (data === void 0) { data = null; }
        this.log('debug', message, data, 'presence');
    };
    Logger.auth = function (message, data) {
        if (data === void 0) { data = null; }
        this.log('debug', message, data, 'auth');
    };
    Logger.visibility = function (message, data) {
        if (data === void 0) { data = null; }
        this.log('debug', message, data, 'visibility');
    };
    Logger.realtime = function (message, data) {
        if (data === void 0) { data = null; }
        this.log('debug', message, data, 'realtime');
    };
    // Instance methods for interface compliance
    Logger.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        Logger.log('error', message, args.length > 0 ? args : null, 'general');
    };
    Logger.prototype.warn = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        Logger.log('warn', message, args.length > 0 ? args : null, 'general');
    };
    Logger.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        Logger.log('info', message, args.length > 0 ? args : null, 'general');
    };
    Logger.prototype.debug = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        Logger.log('debug', message, args.length > 0 ? args : null, 'general');
    };
    Logger.prototype.setLevel = function (level) {
        Logger.setLevel(level);
    };
    Logger.prototype.log = function (level, message, data, context) {
        if (data === void 0) { data = null; }
        if (context === void 0) { context = 'general'; }
        Logger.log(level, message, data, context);
    };
    // Static convenience methods
    Logger.error = function (message, data, context) {
        if (data === void 0) { data = null; }
        if (context === void 0) { context = 'general'; }
        this.log('error', message, data, context);
    };
    Logger.warn = function (message, data, context) {
        if (data === void 0) { data = null; }
        if (context === void 0) { context = 'general'; }
        this.log('warn', message, data, context);
    };
    Logger.info = function (message, data, context) {
        if (data === void 0) { data = null; }
        if (context === void 0) { context = 'general'; }
        this.log('info', message, data, context);
    };
    Logger.debug = function (message, data, context) {
        if (data === void 0) { data = null; }
        if (context === void 0) { context = 'general'; }
        this.log('debug', message, data, context);
    };
    Logger.success = function (message, data, context) {
        if (data === void 0) { data = null; }
        if (context === void 0) { context = 'general'; }
        this.log('success', message, data, context);
    };
    Logger.getHistory = function (level, context, limit) {
        if (level === void 0) { level = null; }
        if (context === void 0) { context = null; }
        if (limit === void 0) { limit = 100; }
        var filtered = this.logHistory;
        if (level) {
            filtered = filtered.filter(function (entry) { return entry.level === level.toUpperCase(); });
        }
        if (context) {
            filtered = filtered.filter(function (entry) { return entry.context === context.toUpperCase(); });
        }
        return filtered.slice(-limit);
    };
    Logger.clearHistory = function () {
        this.logHistory = [];
    };
    Logger.exportLogs = function () {
        return JSON.stringify(this.logHistory, null, 2);
    };
    Logger.normalizeContext = function (context) {
        return (context || 'general').toLowerCase();
    };
    Logger.configureDebugContexts = function (contexts) {
        var _this = this;
        if (!Array.isArray(contexts) || contexts.length === 0) {
            this.debugContextAllowlist = null;
            return;
        }
        this.debugContextAllowlist = new Set(contexts
            .map(function (ctx) { return (typeof ctx === 'string' ? _this.normalizeContext(ctx) : null); })
            .filter(function (ctx) { return Boolean(ctx); }));
    };
    Logger.loadDebugContextAllowlistFromWindow = function () {
        if (typeof window === 'undefined')
            return;
        var win = window;
        if (Array.isArray(win.__DEBUG_CONTEXTS__)) {
            this.configureDebugContexts(win.__DEBUG_CONTEXTS__);
        }
    };
    Logger.isDebugEnabled = function (context) {
        var _a;
        if (context === void 0) { context = 'general'; }
        if (!this.isEnabled)
            return false;
        var normalizedContext = this.normalizeContext(context);
        var debugLevel = (_a = this.LOG_LEVELS.DEBUG) !== null && _a !== void 0 ? _a : 0;
        var hasAllowlist = this.debugContextAllowlist && this.debugContextAllowlist.size > 0;
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
    };
    Logger.time = function (label) {
        var _this = this;
        var start = performance.now();
        return {
            end: function () {
                var duration = performance.now() - start;
                _this.log('debug', "".concat(label, ": ").concat(duration.toFixed(2), "ms"));
            }
        };
    };
    Logger.group = function (label, fn) {
        console.group(label);
        try {
            return fn();
        }
        finally {
            console.groupEnd();
        }
    };
    Logger.trace = function (functionName, args) {
        var _this = this;
        this.log('debug', "\u2192 ".concat(functionName), args);
        return {
            exit: function (result) {
                _this.log('debug', "\u2190 ".concat(functionName), result);
            }
        };
    };
    /**
     * Check if Logger is in production mode
     */
    Logger.isProductionMode = function () {
        return this.isProduction;
    };
    /**
     * Initialize Logger with environment-based settings
     * Call this early in application startup
     */
    Logger.initialize = function () {
        this.loadDebugContextAllowlistFromWindow();
        if (this.isProduction) {
            this.setLevel('WARN'); // Only WARN and ERROR in production
            Logger.info('Logger initialized in PRODUCTION mode - DEBUG/INFO logs disabled');
        }
        else {
            this.setLevel('DEBUG'); // All logs in development
            Logger.debug('Logger initialized in DEVELOPMENT mode - all logs enabled');
        }
    };
    var _a, _b, _c;
    Logger.LOG_LEVELS = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        SUCCESS: 1
    };
    // Detect production mode
    Logger.isProduction = typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.NODE_ENV) === 'production' ||
        typeof window !== 'undefined' && window.__PRODUCTION__ === true;
    // In production, default to WARN level (only WARN and ERROR)
    // In development, default to DEBUG level (all logs)
    Logger.currentLevel = Logger.isProduction
        ? (_b = Logger.LOG_LEVELS.WARN) !== null && _b !== void 0 ? _b : 2
        : (_c = Logger.LOG_LEVELS.DEBUG) !== null && _c !== void 0 ? _c : 0;
    Logger.isEnabled = true;
    Logger.logHistory = [];
    Logger.maxHistorySize = 1000;
    Logger.debugContextAllowlist = null;
    return Logger;
}());
exports.Logger = Logger;
// Auto-initialize on module load
Logger.initialize();
exports.default = Logger;
// Export removed - use ES6 imports instead of window.Logger
