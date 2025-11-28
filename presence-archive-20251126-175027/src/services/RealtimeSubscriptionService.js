"use strict";
/**
 * RealtimeSubscriptionService - Handles Supabase real-time subscriptions only
 *
 * Separated from write logic for cleaner architecture.
 * Uses anon key + RLS for secure, filtered subscriptions.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseRealtimeApi = exports.RealtimeSubscriptionService = void 0;
exports.initializeRealtimeSubscriptionService = initializeRealtimeSubscriptionService;
exports.getRealtimeSubscriptionService = getRealtimeSubscriptionService;
var MessageStore_js_1 = require("./MessageStore.js");
var ErrorHandler_js_1 = require("../utils/ErrorHandler.js");
var Logger_js_1 = require("../utils/Logger.js");
var RealtimeSubscriptionService = /** @class */ (function () {
    function RealtimeSubscriptionService(supabaseClient) {
        this.channels = new Map();
        this.isInitialized = false;
        this.supabase = supabaseClient;
    }
    /**
     * Initialize the service
     */
    RealtimeSubscriptionService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.isInitialized) {
                    return [2 /*return*/, true];
                }
                if (!this.supabase || !this.supabase.realtime) {
                    Logger_js_1.Logger.error('RealtimeSubscriptionService: Supabase client not available', null, 'general');
                    return [2 /*return*/, false];
                }
                this.isInitialized = true;
                Logger_js_1.Logger.debug('✅ RealtimeSubscriptionService: Initialized', null, 'general');
                return [2 /*return*/, true];
            });
        });
    };
    /**
     * Subscribe to messages for a page
     */
    RealtimeSubscriptionService.prototype.subscribeToPage = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var pageId, onError, initialized, channelName_1, channel;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pageId = config.pageId, onError = config.onError;
                        if (!!this.isInitialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        initialized = _a.sent();
                        if (!initialized) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 2;
                    case 2:
                        // Unsubscribe from existing channel for this page if any
                        this.unsubscribeFromPage(pageId);
                        try {
                            channelName_1 = "messages:".concat(pageId);
                            channel = this.supabase.channel(channelName_1);
                            // Set up INSERT listener
                            channel.on('postgres_changes', {
                                event: 'INSERT',
                                schema: 'public',
                                table: 'messages',
                                filter: "page_id=eq.".concat(pageId)
                            }, function (payload) {
                                if (payload.new) {
                                    _this.handleMessageInsert(payload.new);
                                }
                            });
                            // Set up UPDATE listener
                            channel.on('postgres_changes', {
                                event: 'UPDATE',
                                schema: 'public',
                                table: 'messages',
                                filter: "page_id=eq.".concat(pageId)
                            }, function (payload) {
                                if (payload.new) {
                                    _this.handleMessageUpdate(payload.new);
                                }
                            });
                            // Set up DELETE listener
                            channel.on('postgres_changes', {
                                event: 'DELETE',
                                schema: 'public',
                                table: 'messages',
                                filter: "page_id=eq.".concat(pageId)
                            }, function (payload) {
                                if (payload.old) {
                                    _this.handleMessageDelete(payload.old);
                                }
                            });
                            channel.subscribe(function (status, err) {
                                if (err) {
                                    Logger_js_1.Logger.error('RealtimeSubscriptionService: Subscription error:', err, 'general');
                                    if (onError) {
                                        onError(err);
                                    }
                                    _this.showNotification('Real-time connection error. Some updates may be delayed.');
                                }
                                else if (status === 'SUBSCRIBED') {
                                    Logger_js_1.Logger.debug("\u2705 RealtimeSubscriptionService: Subscribed to ".concat(channelName_1), null, 'general');
                                }
                            });
                            this.channels.set(pageId, channel);
                            return [2 /*return*/, true];
                        }
                        catch (error) {
                            (0, ErrorHandler_js_1.handleError)(error, {
                                log: true,
                                logLevel: 'error',
                                context: {
                                    operation: 'catch',
                                    component: 'RealtimeSubscriptionService',
                                    pageId: pageId
                                }
                            });
                            ;
                            if (onError) {
                                onError(error instanceof Error ? error : new Error(String(error)));
                            }
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Unsubscribe from a page
     */
    RealtimeSubscriptionService.prototype.unsubscribeFromPage = function (pageId) {
        var channel = this.channels.get(pageId);
        if (channel) {
            // Supabase client has removeChannel method
            if (this.supabase && typeof this.supabase.removeChannel === 'function') {
                this.supabase.removeChannel(channel);
            }
            else {
                // Fallback: unsubscribe from channel directly
                if (typeof channel.unsubscribe === 'function') {
                    channel.unsubscribe();
                }
            }
            this.channels.delete(pageId);
            Logger_js_1.Logger.debug("\u2705 RealtimeSubscriptionService: Unsubscribed from ".concat(pageId), null, 'general');
        }
    };
    /**
     * Unsubscribe from all pages
     */
    RealtimeSubscriptionService.prototype.unsubscribeAll = function () {
        for (var _i = 0, _a = this.channels; _i < _a.length; _i++) {
            var pageId = _a[_i][0];
            this.unsubscribeFromPage(pageId);
        }
    };
    /**
     * Handle message insert (new message)
     */
    RealtimeSubscriptionService.prototype.handleMessageInsert = function (message) {
        Logger_js_1.Logger.debug('📨 RealtimeSubscriptionService: New message:', message.id, 'general');
        // Dispatch event for MessageStore to handle
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('realtime-message', {
                detail: message
            }));
        }
        // Also update MessageStore directly
        MessageStore_js_1.messageStore['handleRealtimeMessage'](message);
    };
    /**
     * Handle message update
     */
    RealtimeSubscriptionService.prototype.handleMessageUpdate = function (message) {
        Logger_js_1.Logger.debug('✏️ RealtimeSubscriptionService: Message updated:', message.id, 'general');
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('realtime-message-updated', {
                detail: message
            }));
        }
        // Update MessageStore
        MessageStore_js_1.messageStore['handleRealtimeUpdate'](message);
    };
    /**
     * Handle message delete
     */
    RealtimeSubscriptionService.prototype.handleMessageDelete = function (message) {
        Logger_js_1.Logger.debug('🗑️ RealtimeSubscriptionService: Message deleted:', message.id, 'general');
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('realtime-message-deleted', {
                detail: message
            }));
        }
        // Update MessageStore
        var messageId = (message && typeof message === 'object' && 'id' in message ? message.id : undefined) || (message && typeof message === 'object' && 'message_id' in message ? message.message_id : undefined);
        if (messageId && typeof messageId === 'string') {
            MessageStore_js_1.messageStore['handleRealtimeDelete'](messageId);
        }
    };
    /**
     * Show notification (if callback is set)
     */
    RealtimeSubscriptionService.prototype.showNotification = function (message) {
        if (this.errorNotificationCallback) {
            this.errorNotificationCallback(message);
        }
        else if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(message);
        }
    };
    /**
     * Set error notification callback
     */
    RealtimeSubscriptionService.prototype.setErrorNotificationCallback = function (callback) {
        this.errorNotificationCallback = callback;
    };
    /**
     * Get subscription status
     */
    RealtimeSubscriptionService.prototype.getSubscriptionStatus = function (pageId) {
        return this.channels.has(pageId) ? 'subscribed' : 'unsubscribed';
    };
    return RealtimeSubscriptionService;
}());
exports.RealtimeSubscriptionService = RealtimeSubscriptionService;
// Export singleton (will be initialized with Supabase client)
var realtimeSubscriptionService = null;
function initializeRealtimeSubscriptionService(supabaseClient) {
    if (!realtimeSubscriptionService) {
        realtimeSubscriptionService = new RealtimeSubscriptionService(supabaseClient);
    }
    return realtimeSubscriptionService;
}
function getRealtimeSubscriptionService() {
    return realtimeSubscriptionService;
}
exports.supabaseRealtimeApi = {
    RealtimeSubscriptionService: RealtimeSubscriptionService,
    initializeRealtimeSubscriptionService: initializeRealtimeSubscriptionService,
    getRealtimeSubscriptionService: getRealtimeSubscriptionService
};
exports.default = exports.supabaseRealtimeApi;
