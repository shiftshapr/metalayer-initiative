"use strict";
/**
 * STATEMANAGER - Centralized State Management
 * TypeScript + ES6 Module
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setActiveCommunitiesState = exports.setState = exports.getState = exports.StateManager = exports.stateManagerInstance = void 0;
var ErrorHandler_js_1 = require("../utils/ErrorHandler.js");
var Logger_js_1 = require("../utils/Logger.js");
var APIConfig_js_1 = require("./APIConfig.js");
var StateManager = /** @class */ (function () {
    function StateManager() {
        this.maxHistorySize = 100;
        this.state = {
            chat: {
                data: [],
                lastLoadedUri: null,
                focusedMessage: null,
                previousView: null,
                lastMessageCount: 0,
                lastMessageId: null,
                isPolling: false
            },
            avatars: {
                user: {
                    current: null,
                    customColor: null,
                    defaultColor: null
                },
                visibility: [],
                message: [],
                combined: []
            },
            ui: {
                activeModal: null,
                debugMode: false,
                theme: 'auto',
                activeCommunities: [],
                primaryCommunity: null,
                currentCommunity: null
            },
            sync: {
                isConnected: false,
                lastSyncTime: null,
                pendingMessages: [],
                retryCount: 0
            },
            api: {
                baseUrl: APIConfig_js_1.API_CONFIG.baseUrl,
                isOnline: true,
                lastRequestTime: null,
                requestCount: 0,
                errorCount: 0
            },
            extension: {
                build: '2025-01-24-010',
                reloadTimestamp: null,
                isInitialized: false,
                version: '1.0.0'
            }
        };
        this.subscribers = new Map();
        this.history = [];
        this.initialize();
    }
    StateManager.prototype.initialize = function (initialState) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        Logger_js_1.Logger.debug('🏗️ StateManager: Initializing...', null, 'state');
                        if (initialState) {
                            this.mergeState(initialState);
                        }
                        this.setState('extension.reloadTimestamp', new Date().toISOString());
                        this.setState('extension.isInitialized', true);
                        return [4 /*yield*/, this.loadPersistedState()];
                    case 1:
                        _a.sent();
                        Logger_js_1.Logger.debug('✅ StateManager: Initialized successfully', null, 'state');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        (0, ErrorHandler_js_1.handleError)(error_1, {
                            log: true,
                            logLevel: 'error',
                            context: {
                                operation: 'initialize',
                                component: 'StateManager'
                            }
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StateManager.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, value, _i, keys_1, k;
            return __generator(this, function (_a) {
                keys = key.split('.');
                value = this.state;
                for (_i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    k = keys_1[_i];
                    if (value === null || value === undefined) {
                        return [2 /*return*/, undefined];
                    }
                    if (typeof value === 'object' && k in value) {
                        value = value[k];
                    }
                    else {
                        return [2 /*return*/, undefined];
                    }
                }
                return [2 /*return*/, value];
            });
        });
    };
    StateManager.prototype.set = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setState(key, value);
                return [2 /*return*/];
            });
        });
    };
    StateManager.prototype.getAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, __assign({}, this.state)];
            });
        });
    };
    StateManager.prototype.getState = function (path) {
        var keys = path.split('.');
        var current = this.state;
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var key = keys_2[_i];
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            }
            else {
                return undefined;
            }
        }
        return current;
    };
    StateManager.prototype.setState = function (path, value, persist) {
        if (persist === void 0) { persist = false; }
        var keys = path.split('.');
        var lastKey = keys.pop();
        if (!lastKey)
            return;
        var current = this.state;
        for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
            var key = keys_3[_i];
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }
        var oldValue = current[lastKey];
        current[lastKey] = value;
        this.addToHistory(path, oldValue, value);
        this.notifySubscribers(path, value, oldValue);
        if (persist) {
            this.persistState(path, value);
        }
        Logger_js_1.Logger.debug("\uD83D\uDD04 StateManager: ".concat(path, " = ").concat(JSON.stringify(value)), null, 'state');
    };
    StateManager.prototype.subscribe = function (path, callback) {
        var _this = this;
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Set());
        }
        this.subscribers.get(path).add(callback);
        return function () {
            var pathSubscribers = _this.subscribers.get(path);
            if (pathSubscribers) {
                pathSubscribers.delete(callback);
                if (pathSubscribers.size === 0) {
                    _this.subscribers.delete(path);
                }
            }
        };
    };
    StateManager.prototype.getHistory = function (path) {
        if (path) {
            return this.history.filter(function (h) { return h.path === path; });
        }
        return __spreadArray([], this.history, true);
    };
    StateManager.prototype.getSnapshot = function () {
        return {
            state: __assign({}, this.state),
            historySize: this.history.length,
            subscriberCount: Array.from(this.subscribers.values()).reduce(function (sum, set) { return sum + set.size; }, 0)
        };
    };
    StateManager.prototype.resetState = function (path) {
        if (path) {
            var keys = path.split('.');
            var current = this.state;
            for (var _i = 0, _a = keys.slice(0, -1); _i < _a.length; _i++) {
                var key = _a[_i];
                current = current[key];
            }
            delete current[keys[keys.length - 1]];
        }
        else {
            this.state = this.getInitialState();
        }
    };
    StateManager.prototype.cleanup = function () {
        Logger_js_1.Logger.debug('🧹 StateManager: Cleaning up...', null, 'state');
        this.subscribers.clear();
        this.history = [];
        this.state = this.getInitialState();
        Logger_js_1.Logger.debug('✅ StateManager: Cleanup complete', null, 'state');
    };
    StateManager.prototype.persistState = function (_path, _value) {
        return __awaiter(this, void 0, void 0, function () {
            var currentState_1, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (typeof chrome === 'undefined' || !((_a = chrome.storage) === null || _a === void 0 ? void 0 : _a.local)) {
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.getAll()];
                    case 2:
                        currentState_1 = _b.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                chrome.storage.local.set({ stateManager: currentState_1 }, function () {
                                    resolve();
                                });
                            })];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _b.sent();
                        (0, ErrorHandler_js_1.handleError)(error_2, {
                            log: true,
                            logLevel: 'error',
                            context: {
                                operation: 'catch',
                                component: 'State'
                            }
                        });
                        ;
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    StateManager.prototype.mergeState = function (newState) {
        this.state = __assign(__assign({}, this.state), newState);
    };
    StateManager.prototype.loadPersistedState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (typeof chrome === 'undefined' || !((_a = chrome.storage) === null || _a === void 0 ? void 0 : _a.local)) {
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, new Promise(function (resolve) {
                                chrome.storage.local.get(['stateManager'], function (data) {
                                    resolve(data);
                                });
                            })];
                    case 2:
                        result = _b.sent();
                        if (result.stateManager) {
                            this.mergeState(result.stateManager);
                            Logger_js_1.Logger.debug('✅ StateManager: Persisted state loaded', null, 'state');
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _b.sent();
                        (0, ErrorHandler_js_1.handleError)(error_3, {
                            log: true,
                            logLevel: 'error',
                            context: {
                                operation: 'catch',
                                component: 'State'
                            }
                        });
                        ;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StateManager.prototype.notifySubscribers = function (path, newValue, oldValue) {
        var pathSubscribers = this.subscribers.get(path);
        if (pathSubscribers) {
            pathSubscribers.forEach(function (callback) {
                try {
                    callback(newValue, oldValue, path);
                }
                catch (error) {
                    (0, ErrorHandler_js_1.handleError)(error, {
                        log: true,
                        logLevel: 'error',
                        context: {
                            operation: 'catch',
                            component: 'State'
                        }
                    });
                    ;
                }
            });
        }
        var wildcardSubscribers = this.subscribers.get('*');
        if (wildcardSubscribers) {
            wildcardSubscribers.forEach(function (callback) {
                try {
                    callback(newValue, oldValue, path);
                }
                catch (error) {
                    (0, ErrorHandler_js_1.handleError)(error, {
                        log: true,
                        logLevel: 'error',
                        context: {
                            operation: 'catch',
                            component: 'State'
                        }
                    });
                    ;
                }
            });
        }
    };
    StateManager.prototype.addToHistory = function (path, oldValue, newValue) {
        this.history.push({
            timestamp: Date.now(),
            path: path,
            oldValue: oldValue,
            newValue: newValue
        });
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    };
    StateManager.prototype.getInitialState = function () {
        return {
            chat: {
                data: [],
                lastLoadedUri: null,
                focusedMessage: null,
                previousView: null,
                lastMessageCount: 0,
                lastMessageId: null,
                isPolling: false
            },
            avatars: {
                user: {
                    current: null,
                    customColor: null,
                    defaultColor: null
                },
                visibility: [],
                message: [],
                combined: []
            },
            ui: {
                activeModal: null,
                debugMode: false,
                theme: 'auto',
                activeCommunities: [],
                primaryCommunity: null,
                currentCommunity: null
            },
            sync: {
                isConnected: false,
                lastSyncTime: null,
                pendingMessages: [],
                retryCount: 0
            },
            api: {
                baseUrl: APIConfig_js_1.API_CONFIG.baseUrl,
                isOnline: true,
                lastRequestTime: null,
                requestCount: 0,
                errorCount: 0
            },
            extension: {
                build: '2025-01-24-010',
                reloadTimestamp: null,
                isInitialized: false,
                version: '1.0.0'
            }
        };
    };
    return StateManager;
}());
exports.StateManager = StateManager;
// Create singleton instance
var stateManagerInstance = new StateManager();
exports.stateManagerInstance = stateManagerInstance;
exports.default = StateManager;
var normalizeCommunityIds = function (value) {
    if (!Array.isArray(value)) {
        return [];
    }
    var unique = new Set();
    value.forEach(function (id) {
        if (typeof id === 'string') {
            var trimmed = id.trim();
            if (trimmed.length > 0) {
                unique.add(trimmed);
            }
        }
    });
    return Array.from(unique);
};
// Export convenience functions that use the singleton
var getState = function (key) { return stateManagerInstance.getState(key); };
exports.getState = getState;
var setState = function (key, value, persist) {
    if (persist === void 0) { persist = false; }
    return stateManagerInstance.setState(key, value, persist);
};
exports.setState = setState;
var setActiveCommunitiesState = function (communities, persist) {
    if (persist === void 0) { persist = false; }
    var normalized = normalizeCommunityIds(communities);
    stateManagerInstance.setState('ui.activeCommunities', normalized, persist);
    stateManagerInstance.setState('activeCommunities', normalized, persist);
    if (typeof window !== 'undefined') {
        window.activeCommunities = __spreadArray([], normalized, true);
    }
};
exports.setActiveCommunitiesState = setActiveCommunitiesState;
// Export stateManagerInstance to window for diagnostic scripts and module access
if (typeof window !== 'undefined') {
    window.stateManagerInstance = stateManagerInstance;
    Object.defineProperty(window, 'stateManagerInstance', {
        value: stateManagerInstance,
        writable: true,
        configurable: true,
        enumerable: true
    });
    window.getState = exports.getState;
    window.setState = exports.setState;
    window.activeCommunities = normalizeCommunityIds(stateManagerInstance.getState('ui.activeCommunities'));
    Logger_js_1.Logger.debug('✅ StateManager: stateManagerInstance exported to window', null, 'state');
}
