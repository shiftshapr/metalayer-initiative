"use strict";
/**
 * Error Types for Canopi Application
 *
 * Standardized error types for consistent error handling across the application.
 * All custom errors extend the base CanopiError class for consistent structure.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateError = exports.ConfigurationError = exports.ValidationError = exports.NetworkError = exports.StorageError = exports.AuthorizationError = exports.AuthenticationError = exports.APIError = exports.CanopiError = void 0;
exports.isCanopiError = isCanopiError;
exports.isAPIError = isAPIError;
exports.isAuthenticationError = isAuthenticationError;
exports.isAuthorizationError = isAuthorizationError;
exports.getErrorMessage = getErrorMessage;
exports.getErrorStack = getErrorStack;
exports.toCanopiError = toCanopiError;
/**
 * Base error class for all Canopi application errors
 */
var CanopiError = /** @class */ (function (_super) {
    __extends(CanopiError, _super);
    function CanopiError(message, code, context, originalError) {
        var _this = _super.call(this, message) || this;
        _this.name = 'CanopiError';
        _this.code = code;
        _this.context = context;
        _this.timestamp = new Date().toISOString();
        _this.originalError = originalError;
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, CanopiError);
        }
        return _this;
    }
    /**
     * Convert error to JSON for logging/transmission
     */
    CanopiError.prototype.toJSON = function () {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            timestamp: this.timestamp,
            stack: this.stack,
            originalError: this.originalError instanceof Error
                ? {
                    name: this.originalError.name,
                    message: this.originalError.message,
                    stack: this.originalError.stack
                }
                : this.originalError
        };
    };
    return CanopiError;
}(Error));
exports.CanopiError = CanopiError;
/**
 * API-related errors
 */
var APIError = /** @class */ (function (_super) {
    __extends(APIError, _super);
    function APIError(message, statusCode, endpoint, method, context, originalError) {
        var _this = _super.call(this, message, 'API_ERROR', __assign(__assign({}, context), { statusCode: statusCode, endpoint: endpoint, method: method }), originalError) || this;
        _this.name = 'APIError';
        _this.statusCode = statusCode;
        _this.endpoint = endpoint;
        _this.method = method;
        return _this;
    }
    return APIError;
}(CanopiError));
exports.APIError = APIError;
/**
 * Authentication-related errors
 */
var AuthenticationError = /** @class */ (function (_super) {
    __extends(AuthenticationError, _super);
    function AuthenticationError(message, context, originalError) {
        var _this = _super.call(this, message, 'AUTH_ERROR', context, originalError) || this;
        _this.name = 'AuthenticationError';
        return _this;
    }
    return AuthenticationError;
}(CanopiError));
exports.AuthenticationError = AuthenticationError;
/**
 * Authorization-related errors (permissions)
 */
var AuthorizationError = /** @class */ (function (_super) {
    __extends(AuthorizationError, _super);
    function AuthorizationError(message, context, originalError) {
        var _this = _super.call(this, message, 'AUTHORIZATION_ERROR', context, originalError) || this;
        _this.name = 'AuthorizationError';
        return _this;
    }
    return AuthorizationError;
}(CanopiError));
exports.AuthorizationError = AuthorizationError;
/**
 * Storage-related errors (localStorage, chrome.storage, etc.)
 */
var StorageError = /** @class */ (function (_super) {
    __extends(StorageError, _super);
    function StorageError(message, storageType, key, context, originalError) {
        var _this = _super.call(this, message, 'STORAGE_ERROR', __assign(__assign({}, context), { storageType: storageType, key: key }), originalError) || this;
        _this.name = 'StorageError';
        _this.storageType = storageType;
        _this.key = key;
        return _this;
    }
    return StorageError;
}(CanopiError));
exports.StorageError = StorageError;
/**
 * Network-related errors
 */
var NetworkError = /** @class */ (function (_super) {
    __extends(NetworkError, _super);
    function NetworkError(message, url, context, originalError) {
        var _this = _super.call(this, message, 'NETWORK_ERROR', __assign(__assign({}, context), { url: url }), originalError) || this;
        _this.name = 'NetworkError';
        _this.url = url;
        return _this;
    }
    return NetworkError;
}(CanopiError));
exports.NetworkError = NetworkError;
/**
 * Validation errors (input validation, data validation)
 */
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message, field, value, context, originalError) {
        var _this = _super.call(this, message, 'VALIDATION_ERROR', __assign(__assign({}, context), { field: field, value: value }), originalError) || this;
        _this.name = 'ValidationError';
        _this.field = field;
        _this.value = value;
        return _this;
    }
    return ValidationError;
}(CanopiError));
exports.ValidationError = ValidationError;
/**
 * Configuration errors (missing env vars, invalid config)
 */
var ConfigurationError = /** @class */ (function (_super) {
    __extends(ConfigurationError, _super);
    function ConfigurationError(message, configKey, context, originalError) {
        var _this = _super.call(this, message, 'CONFIGURATION_ERROR', __assign(__assign({}, context), { configKey: configKey }), originalError) || this;
        _this.name = 'ConfigurationError';
        _this.configKey = configKey;
        return _this;
    }
    return ConfigurationError;
}(CanopiError));
exports.ConfigurationError = ConfigurationError;
/**
 * State management errors
 */
var StateError = /** @class */ (function (_super) {
    __extends(StateError, _super);
    function StateError(message, stateKey, context, originalError) {
        var _this = _super.call(this, message, 'STATE_ERROR', __assign(__assign({}, context), { stateKey: stateKey }), originalError) || this;
        _this.name = 'StateError';
        _this.stateKey = stateKey;
        return _this;
    }
    return StateError;
}(CanopiError));
exports.StateError = StateError;
/**
 * Type guard to check if error is a CanopiError
 */
function isCanopiError(error) {
    return error instanceof CanopiError;
}
/**
 * Type guard to check if error is an APIError
 */
function isAPIError(error) {
    return error instanceof APIError;
}
/**
 * Type guard to check if error is an AuthenticationError
 */
function isAuthenticationError(error) {
    return error instanceof AuthenticationError;
}
/**
 * Type guard to check if error is an AuthorizationError
 */
function isAuthorizationError(error) {
    return error instanceof AuthorizationError;
}
/**
 * Extract error message from unknown error type
 */
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    return 'Unknown error occurred';
}
/**
 * Extract error stack from unknown error type
 */
function getErrorStack(error) {
    if (error instanceof Error) {
        return error.stack;
    }
    return undefined;
}
/**
 * Convert unknown error to CanopiError
 */
function toCanopiError(error, defaultCode, context) {
    if (defaultCode === void 0) { defaultCode = 'UNKNOWN_ERROR'; }
    if (isCanopiError(error)) {
        return error;
    }
    var message = getErrorMessage(error);
    return new CanopiError(message, defaultCode, context, error);
}
