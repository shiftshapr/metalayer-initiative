"use strict";
/**
 * MessageStore - Centralized message cache and state management
 *
 * Features:
 * - Per pageId + parentId cache keys
 * - Keyset pagination support
 * - Event emitter for UI updates
 * - Real-time event merging
 */
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
exports.MessageStore = exports.messageStore = void 0;
exports.resolveMessagesEndpoint = resolveMessagesEndpoint;
var StateManager_js_1 = require("../core/StateManager.js");
var APIConfig_js_1 = require("../core/APIConfig.js");
var ErrorHandler_js_1 = require("../utils/ErrorHandler.js");
var Logger_js_1 = require("../utils/Logger.js");
var DEFAULT_MESSAGES_PATH = '/api/messages';
var FALLBACK_API_BASE = APIConfig_js_1.API_CONFIG.baseUrl;
function resolveApiBaseUrl() {
    var _a;
    var apiState = StateManager_js_1.stateManagerInstance.getState('api');
    var baseFromState = apiState === null || apiState === void 0 ? void 0 : apiState.baseURL;
    var win = typeof window !== 'undefined'
        ? window
        : undefined;
    var baseFromWindow = (win === null || win === void 0 ? void 0 : win.API_URL) || (win === null || win === void 0 ? void 0 : win.API_BASE_URL) || (win === null || win === void 0 ? void 0 : win.apiBaseURL) || ((_a = win === null || win === void 0 ? void 0 : win.config) === null || _a === void 0 ? void 0 : _a.API_URL);
    var baseUrl = baseFromState || baseFromWindow || FALLBACK_API_BASE;
    return baseUrl.replace(/\/$/, '');
}
function resolveMessagesEndpoint(path) {
    if (path === void 0) { path = DEFAULT_MESSAGES_PATH; }
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    var normalizedPath = path.startsWith('/') ? path : "/".concat(path);
    return "".concat(resolveApiBaseUrl()).concat(normalizedPath);
}
var MessageStore = /** @class */ (function () {
    function MessageStore(apiBaseUrl) {
        if (apiBaseUrl === void 0) { apiBaseUrl = DEFAULT_MESSAGES_PATH; }
        this.cache = new Map();
        this.listeners = new Map();
        this.apiBaseUrl = apiBaseUrl;
        this.setupEventListeners();
    }
    MessageStore.prototype.getCacheKey = function (pageId, parentId) {
        return "".concat(pageId, "|").concat(parentId || 'null');
    };
    MessageStore.prototype.on = function (event, listener) {
        var _this = this;
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(listener);
        return function () {
            var _a;
            (_a = _this.listeners.get(event)) === null || _a === void 0 ? void 0 : _a.delete(listener);
        };
    };
    MessageStore.prototype.emit = function (event, data) {
        var _a;
        (_a = this.listeners.get(event)) === null || _a === void 0 ? void 0 : _a.forEach(function (listener) {
            try {
                listener(data);
            }
            catch (error) {
                (0, ErrorHandler_js_1.handleError)(error, {
                    log: true,
                    logLevel: 'error',
                    context: {
                        operation: 'catch',
                        component: 'MessageStore'
                    }
                });
                ;
            }
        });
    };
    MessageStore.prototype.setupEventListeners = function () {
        var _this = this;
        if (typeof window !== 'undefined') {
            window.addEventListener('realtime-message', (function (event) {
                _this.handleRealtimeMessage(event.detail || {});
            }));
            window.addEventListener('realtime-message-updated', (function (event) {
                _this.handleRealtimeUpdate(event.detail || {});
            }));
            window.addEventListener('realtime-message-deleted', (function (event) {
                _this.handleRealtimeDelete(event.detail || {});
            }));
        }
    };
    MessageStore.prototype.get = function (pageId, parentId) {
        var key = this.getCacheKey(pageId, parentId);
        return this.cache.get(key) || null;
    };
    MessageStore.prototype.getStatus = function (pageId, parentId) {
        var entry = this.get(pageId, parentId);
        return (entry === null || entry === void 0 ? void 0 : entry.status) || 'idle';
    };
    MessageStore.prototype.load = function (pageId_1) {
        return __awaiter(this, arguments, void 0, function (pageId, parentId, options) {
            var key, _a, limit, _b, cursor, _c, includeTopReply, _d, communityId, existingEntry, params, endpoint, response, data, entry, error_1;
            if (parentId === void 0) { parentId = null; }
            if (options === void 0) { options = {}; }
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        key = this.getCacheKey(pageId, parentId);
                        _a = options.limit, limit = _a === void 0 ? 10 : _a, _b = options.cursor, cursor = _b === void 0 ? null : _b, _c = options.includeTopReply, includeTopReply = _c === void 0 ? parentId === null : _c, _d = options.communityId, communityId = _d === void 0 ? 'abe5ec85-4ba6-456f-adaf-03d7d51cecf4' : _d;
                        existingEntry = this.cache.get(key);
                        if (existingEntry) {
                            existingEntry.status = 'loading';
                            this.emit('statusChange', { key: key, status: 'loading' });
                        }
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 4, , 5]);
                        params = new URLSearchParams({
                            pageId: pageId,
                            limit: limit.toString(),
                            includeTopReply: includeTopReply.toString(),
                            communityId: communityId
                        });
                        if (parentId) {
                            params.append('parentId', parentId);
                        }
                        else {
                            params.append('parentId', 'null');
                        }
                        if (cursor) {
                            params.append('cursor', cursor);
                        }
                        endpoint = resolveMessagesEndpoint(this.apiBaseUrl);
                        return [4 /*yield*/, fetch("".concat(endpoint, "?").concat(params.toString()))];
                    case 2:
                        response = _e.sent();
                        if (!response.ok) {
                            throw new Error("API error: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _e.sent();
                        entry = {
                            items: cursor ? __spreadArray(__spreadArray([], ((existingEntry === null || existingEntry === void 0 ? void 0 : existingEntry.items) || []), true), data.items, true) : data.items,
                            nextCursor: data.nextCursor,
                            status: data.hasMore ? 'ready' : 'exhausted',
                            lastFetched: Date.now(),
                            parent: data.parent || (existingEntry === null || existingEntry === void 0 ? void 0 : existingEntry.parent) || null
                        };
                        this.cache.set(key, entry);
                        this.emit('update', { key: key, data: entry });
                        this.emit('statusChange', { key: key, status: entry.status });
                        return [2 /*return*/, data];
                    case 4:
                        error_1 = _e.sent();
                        (0, ErrorHandler_js_1.handleError)(error_1, {
                            log: true,
                            logLevel: 'error',
                            context: {
                                operation: 'catch',
                                component: 'MessageStore'
                            }
                        });
                        ;
                        if (existingEntry) {
                            existingEntry.status = 'error';
                            this.emit('statusChange', { key: key, status: 'error' });
                        }
                        this.emit('error', { key: key, error: error_1 });
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    MessageStore.prototype.loadNextPage = function (pageId_1) {
        return __awaiter(this, arguments, void 0, function (pageId, parentId) {
            var entry;
            if (parentId === void 0) { parentId = null; }
            return __generator(this, function (_a) {
                entry = this.get(pageId, parentId);
                if (!entry || !entry.nextCursor || entry.status === 'exhausted') {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, this.load(pageId, parentId, { cursor: entry.nextCursor })];
            });
        });
    };
    MessageStore.prototype.handleRealtimeMessage = function (message) {
        var pageId = message.page_id || message.pageId;
        var parentId = message.parent_id || message.parentId || null;
        if (!pageId) {
            Logger_js_1.Logger.warn('⚠️ MessageStore.handleRealtimeMessage: Missing pageId', message, 'general');
            return;
        }
        var key = this.getCacheKey(pageId, parentId);
        var entry = this.cache.get(key);
        // If cache entry doesn't exist, create it
        if (!entry) {
            Logger_js_1.Logger.debug("\uD83D\uDCDD MessageStore: Creating new cache entry for ".concat(key), null, 'general');
            entry = {
                items: [],
                nextCursor: null,
                status: 'ready',
                lastFetched: Date.now(),
                parent: null
            };
            this.cache.set(key, entry);
        }
        var normalized = this.normalizeMessage(message);
        // Check if message already exists (prevent duplicates)
        var existingIndex = entry.items.findIndex(function (m) { return m.id === normalized.id; });
        if (existingIndex >= 0) {
            Logger_js_1.Logger.debug("\uD83D\uDCDD MessageStore: Message ".concat(normalized.id, " already in cache, updating"), 'general');
            entry.items[existingIndex] = normalized;
        }
        else {
            Logger_js_1.Logger.debug("\uD83D\uDCDD MessageStore: Adding new message ".concat(normalized.id, " to cache (key: ").concat(key, ")"), null, 'general');
            entry.items.unshift(normalized);
        }
        Logger_js_1.Logger.debug("\uD83D\uDCDD MessageStore: Emitting update event for key ".concat(key, " with ").concat(entry.items.length, " messages"), null, 'general');
        this.emit('update', { key: key, data: entry });
    };
    MessageStore.prototype.handleRealtimeUpdate = function (message) {
        // Implementation for handling updates
        this.emit('messageUpdated', message);
    };
    MessageStore.prototype.handleRealtimeDelete = function (messageId) {
        // Implementation for handling deletes
        this.emit('messageDeleted', { id: messageId });
    };
    MessageStore.prototype.normalizeMessage = function (message) {
        // Handle Supabase format: user_id instead of authorId, and may need to fetch author
        var authorId = message.authorId || message.user_id || '';
        var normalized = {
            id: message.id || '',
            content: message.content || '',
            authorId: authorId,
            pageId: message.page_id || message.pageId,
            parentId: message.parent_id || message.parentId || null,
            author: message.author, // May be undefined for real-time messages - will need to be fetched
            createdAt: (message.createdAt || message.created_at || undefined),
            updatedAt: (message.updatedAt || message.updated_at || undefined),
            communityId: (message.communityId || message.community_id || undefined),
            status: message.status
        };
        // If author is missing but we have authorId, log a warning
        if (!normalized.author && authorId) {
            Logger_js_1.Logger.warn("\u26A0\uFE0F MessageStore.normalizeMessage: Message ".concat(normalized.id, " missing author info (authorId: ").concat(authorId, ")"), null, 'general');
        }
        return normalized;
    };
    return MessageStore;
}());
exports.MessageStore = MessageStore;
// Export singleton instance
exports.messageStore = new MessageStore();
