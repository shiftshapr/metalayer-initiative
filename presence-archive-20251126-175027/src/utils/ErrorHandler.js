"use strict";
/**
 * Error Handler Utility
 *
 * Centralized error handling utilities for consistent error processing,
 * logging, and user feedback across the Canopi application.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = handleError;
exports.handleAsyncError = handleAsyncError;
exports.withErrorHandling = withErrorHandling;
exports.errorBoundary = errorBoundary;
exports.handleAPIError = handleAPIError;
exports.handleStorageError = handleStorageError;
exports.handleAuthError = handleAuthError;
exports.safeAsync = safeAsync;
var Logger_js_1 = require("./Logger.js");
var ErrorTypes_js_1 = require("./ErrorTypes.js");
/**
 * Default error handling options
 */
var DEFAULT_OPTIONS = {
    log: true,
    logLevel: 'error',
    rethrow: false,
    showUserNotification: false,
    userMessage: '',
    context: {},
    reportToService: false
};
/**
 * Handle an error with consistent logging and optional user feedback
 *
 * @param error - The error to handle (can be unknown type)
 * @param options - Error handling options
 * @returns The processed CanopiError (if not rethrown)
 * @throws The error if rethrow is true
 */
function handleError(error, options) {
    if (options === void 0) { options = {}; }
    var opts = __assign(__assign({}, DEFAULT_OPTIONS), options);
    // Convert to CanopiError if needed
    var canopiError = (0, ErrorTypes_js_1.toCanopiError)(error, 'UNKNOWN_ERROR', opts.context);
    // Log the error
    if (opts.log) {
        var logData = {
            error: canopiError.toJSON(),
            context: opts.context,
            stack: (0, ErrorTypes_js_1.getErrorStack)(error)
        };
        switch (opts.logLevel) {
            case 'warn':
                Logger_js_1.Logger.warn(opts.userMessage || canopiError.message, logData, opts.context.component || 'error-handler');
                break;
            case 'info':
                Logger_js_1.Logger.info(opts.userMessage || canopiError.message, logData, opts.context.component || 'error-handler');
                break;
            case 'debug':
                Logger_js_1.Logger.debug(opts.userMessage || canopiError.message, logData, opts.context.component || 'error-handler');
                break;
            case 'error':
            default:
                Logger_js_1.Logger.error(opts.userMessage || canopiError.message, logData, opts.context.component || 'error-handler');
                break;
        }
    }
    // Show user notification if requested
    if (opts.showUserNotification) {
        var userMessage = opts.userMessage || (0, ErrorTypes_js_1.getErrorMessage)(error);
        showErrorNotification(userMessage, canopiError.code);
    }
    // Report to error service if critical
    if (opts.reportToService) {
        reportErrorToService(canopiError, opts.context);
    }
    // Rethrow if requested
    if (opts.rethrow) {
        throw canopiError;
    }
    return canopiError;
}
/**
 * Handle an error in an async operation with proper error handling
 *
 * @param operation - The async operation to execute
 * @param options - Error handling options
 * @returns The result of the operation or undefined if error occurred
 */
function handleAsyncError(operation_1) {
    return __awaiter(this, arguments, void 0, function (operation, options) {
        var error_1;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, operation()];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_1 = _a.sent();
                    handleError(error_1, options);
                    return [2 /*return*/, undefined];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Wrap an async function with error handling
 *
 * @param fn - The async function to wrap
 * @param options - Error handling options
 * @returns Wrapped function that handles errors
 */
function withErrorHandling(fn, options) {
    var _this = this;
    if (options === void 0) { options = {}; }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fn.apply(void 0, args)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        handleError(error_2, __assign(__assign({}, options), { context: __assign(__assign({}, options.context), { functionName: fn.name || 'anonymous' }) }));
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
}
/**
 * Create an error boundary for async operations
 *
 * @param operation - The async operation
 * @param errorHandler - Custom error handler
 * @returns Result or handled error
 */
function errorBoundary(operation, errorHandler) {
    return __awaiter(this, void 0, void 0, function () {
        var error_3, canopiError;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 5]);
                    return [4 /*yield*/, operation()];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_3 = _a.sent();
                    if (!errorHandler) return [3 /*break*/, 4];
                    return [4 /*yield*/, errorHandler(error_3)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    canopiError = (0, ErrorTypes_js_1.toCanopiError)(error_3);
                    handleError(canopiError, {
                        log: true,
                        rethrow: false,
                        context: { operation: 'errorBoundary' }
                    });
                    throw canopiError;
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Show error notification to user
 */
function showErrorNotification(message, code) {
    var _a;
    // Check if NotificationManager is available
    var win = window;
    if ((_a = win.notificationManager) === null || _a === void 0 ? void 0 : _a.show) {
        win.notificationManager.show(message, 'error');
    }
    else {
        // Fallback to console
        Logger_js_1.Logger.error("[".concat(code || 'ERROR', "] ").concat(message), null, 'error');
    }
}
/**
 * Report error to error reporting service (placeholder for future implementation)
 */
function reportErrorToService(error, context) {
    // TODO: Integrate with error reporting service (e.g., Sentry, LogRocket)
    // For now, just log it
    Logger_js_1.Logger.error('Error reported to service', {
        error: error.toJSON(),
        context: context
    }, 'error-reporting');
}
/**
 * Standard error handler for API calls
 */
function handleAPIError(error, endpoint, method, context) {
    var apiError;
    if ((0, ErrorTypes_js_1.isCanopiError)(error) && error instanceof ErrorTypes_js_1.APIError) {
        apiError = error;
    }
    else {
        var message = (0, ErrorTypes_js_1.getErrorMessage)(error);
        var statusCode = (error === null || error === void 0 ? void 0 : error.status) ||
            (error === null || error === void 0 ? void 0 : error.statusCode);
        apiError = new ErrorTypes_js_1.APIError(message, statusCode, endpoint, method, context, error);
    }
    handleError(apiError, {
        log: true,
        logLevel: 'error',
        context: __assign(__assign({}, context), { endpoint: apiError.endpoint, method: apiError.method, statusCode: apiError.statusCode })
    });
    return apiError;
}
/**
 * Standard error handler for storage operations
 */
function handleStorageError(error, storageType, key, context) {
    var storageError;
    if ((0, ErrorTypes_js_1.isCanopiError)(error) && error instanceof ErrorTypes_js_1.StorageError) {
        storageError = error;
    }
    else {
        var message = (0, ErrorTypes_js_1.getErrorMessage)(error);
        storageError = new ErrorTypes_js_1.StorageError(message, storageType, key, context, error);
    }
    handleError(storageError, {
        log: true,
        logLevel: 'warn', // Storage errors are often non-critical
        context: __assign(__assign({}, context), { storageType: storageError.storageType, key: storageError.key })
    });
    return storageError;
}
/**
 * Standard error handler for authentication errors
 */
function handleAuthError(error, context) {
    var authError;
    if ((0, ErrorTypes_js_1.isCanopiError)(error) && error instanceof ErrorTypes_js_1.AuthenticationError) {
        authError = error;
    }
    else {
        var message = (0, ErrorTypes_js_1.getErrorMessage)(error);
        authError = new ErrorTypes_js_1.AuthenticationError(message, context, error);
    }
    handleError(authError, {
        log: true,
        logLevel: 'error',
        showUserNotification: true,
        userMessage: 'Authentication failed. Please try again.',
        context: context
    });
    return authError;
}
/**
 * Create a safe async wrapper that never throws
 */
function safeAsync(operation, defaultValue, context) {
    var _this = this;
    return function () { return __awaiter(_this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, operation()];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_4 = _a.sent();
                    handleError(error_4, {
                        log: true,
                        logLevel: 'warn',
                        context: context
                    });
                    return [2 /*return*/, defaultValue];
                case 3: return [2 /*return*/];
            }
        });
    }); };
}
