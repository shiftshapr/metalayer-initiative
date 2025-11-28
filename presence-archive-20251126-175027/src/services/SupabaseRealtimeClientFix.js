"use strict";
/**
 * SUPABASE REALTIME CLIENT FIX
 *
 * ROOT CAUSE FIX: SupabaseRealtimeClient.getPageUsers() fallback query doesn't include
 * AppUser relation and has restrictive 24-hour filter. This patch fixes it.
 *
 * This module patches SupabaseRealtimeClient.getPageUsers() at runtime to:
 * 1. Skip API endpoint if it returns 401 (Unauthorized)
 * 2. Use direct database query with AppUser relation
 * 3. Filter by is_active = true instead of 24-hour time window
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
exports.supabaseRealtimeApi = void 0;
exports.applySupabaseRealtimeClientFix = applySupabaseRealtimeClientFix;
exports.initializeSupabaseRealtimeServices = initializeSupabaseRealtimeServices;
// Auto-apply patch when module loads
var ErrorHandler_js_1 = require("../utils/ErrorHandler.js");
var Logger_js_1 = require("../utils/Logger.js");
var RealtimeSubscriptionService_js_1 = require("./RealtimeSubscriptionService.js");
var mapServerPresenceUser = function (user, pageId) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var isActive = (_b = (_a = user.isActive) !== null && _a !== void 0 ? _a : user.is_active) !== null && _b !== void 0 ? _b : true;
    var lastSeen = (_d = (_c = user.lastSeen) !== null && _c !== void 0 ? _c : user.last_seen) !== null && _d !== void 0 ? _d : null;
    return {
        id: (_g = (_f = (_e = user.id) !== null && _e !== void 0 ? _e : user.userId) !== null && _f !== void 0 ? _f : user.user_id) !== null && _g !== void 0 ? _g : '',
        email: (_j = (_h = user.email) !== null && _h !== void 0 ? _h : user.user_email) !== null && _j !== void 0 ? _j : 'unknown@unknown',
        handle: user.handle,
        name: user.name,
        avatarUrl: (_l = (_k = user.avatarUrl) !== null && _k !== void 0 ? _k : user.avatar_url) !== null && _l !== void 0 ? _l : undefined,
        auraColor: (_o = (_m = user.auraColor) !== null && _m !== void 0 ? _m : user.aura_color) !== null && _o !== void 0 ? _o : '#ffffff',
        isActive: isActive,
        status: (_p = user.status) !== null && _p !== void 0 ? _p : (isActive ? 'online' : lastSeen ? 'recently_seen' : 'offline'),
        lastSeen: lastSeen || undefined,
        pageId: pageId
    };
};
var mapPresenceRecord = function (record, fallbackPageId) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    var isActive = (_a = record.is_active) !== null && _a !== void 0 ? _a : false;
    var lastSeen = (_b = record.last_seen) !== null && _b !== void 0 ? _b : null;
    return {
        id: (_c = record.user_id) !== null && _c !== void 0 ? _c : '',
        email: (_e = (_d = record.AppUser) === null || _d === void 0 ? void 0 : _d.email) !== null && _e !== void 0 ? _e : '',
        handle: (_g = (_f = record.AppUser) === null || _f === void 0 ? void 0 : _f.handle) !== null && _g !== void 0 ? _g : undefined,
        name: (_j = (_h = record.AppUser) === null || _h === void 0 ? void 0 : _h.name) !== null && _j !== void 0 ? _j : undefined,
        avatarUrl: (_o = (_l = (_k = record.AppUser) === null || _k === void 0 ? void 0 : _k.avatar_url) !== null && _l !== void 0 ? _l : (_m = record.AppUser) === null || _m === void 0 ? void 0 : _m.avatarUrl) !== null && _o !== void 0 ? _o : undefined,
        auraColor: (_s = (_q = (_p = record.AppUser) === null || _p === void 0 ? void 0 : _p.aura_color) !== null && _q !== void 0 ? _q : (_r = record.AppUser) === null || _r === void 0 ? void 0 : _r.auraColor) !== null && _s !== void 0 ? _s : '#ffffff',
        isActive: isActive,
        status: isActive ? 'online' : 'offline',
        lastSeen: lastSeen || undefined,
        pageId: (_t = record.page_id) !== null && _t !== void 0 ? _t : fallbackPageId
    };
};
var supabaseRealtimePatchScheduled = false;
var supabaseRealtimePatchApplied = false;
var createPatchedGetPageUsers = function () {
    return function patchedGetPageUsers(pageId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabaseClient, win, rawUrl, params, currentUser, headers, apiUrl, resp, j, active, serverUsers, serverErr_1, queryBuilder, _a, data, error, records, error_1;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 9, , 10]);
                        Logger_js_1.Logger.debug('👁️ SUPABASE_CLIENT: Getting users for page:', pageId, 'general');
                        if (!this.supabase) {
                            Logger_js_1.Logger.error('❌ SUPABASE_CLIENT: Client not initialized', null, 'general');
                            return [2 /*return*/, []];
                        }
                        supabaseClient = this.supabase;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, , 7]);
                        win = window;
                        rawUrl = ((_b = win.currentUrlData) === null || _b === void 0 ? void 0 : _b.rawUrl) || ((_c = window.location) === null || _c === void 0 ? void 0 : _c.href) || '';
                        params = new URLSearchParams({ url: rawUrl });
                        currentUser = win.currentUser || {};
                        // UUID ONLY - no email headers
                        headers = __assign({ 'Content-Type': 'application/json' }, (currentUser.id ? { 'X-User-Id': currentUser.id, 'x-user-id': currentUser.id } : {}));
                        apiUrl = win.METALAYER_API_URL;
                        if (!apiUrl) return [3 /*break*/, 5];
                        return [4 /*yield*/, fetch("".concat(apiUrl, "/v1/presence/url?").concat(params), { headers: headers })];
                    case 2:
                        resp = _d.sent();
                        if (!resp.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, resp.json()];
                    case 3:
                        j = _d.sent();
                        active = Array.isArray(j === null || j === void 0 ? void 0 : j.active) ? j.active : [];
                        serverUsers = active.map(function (user) { return mapServerPresenceUser(user, pageId); });
                        Logger_js_1.Logger.debug('✅ SUPABASE_CLIENT: Using server-enriched presence users:', serverUsers.length, 'general');
                        return [2 /*return*/, serverUsers];
                    case 4:
                        if (resp.status === 401) {
                            Logger_js_1.Logger.warn('⚠️ SUPABASE_CLIENT: presence/url failed with 401 (Unauthorized), using direct database query', null, 'general');
                        }
                        else {
                            Logger_js_1.Logger.warn('⚠️ SUPABASE_CLIENT: presence/url failed', { status: resp.status }, 'general');
                        }
                        _d.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        serverErr_1 = _d.sent();
                        (0, ErrorHandler_js_1.handleError)(serverErr_1, {
                            log: true,
                            logLevel: 'warn',
                            context: {
                                operation: 'handleRealtimeError',
                                component: 'SupabaseRealtimeClientFix'
                            }
                        });
                        return [3 /*break*/, 7];
                    case 7:
                        queryBuilder = supabaseClient
                            .from('user_presence')
                            .select('user_id, page_id, last_seen, is_active, AppUser(email, name, handle, avatarUrl, auraColor)')
                            .eq('page_id', pageId)
                            .eq('is_active', true);
                        return [4 /*yield*/, queryBuilder.order('last_seen', { ascending: false })];
                    case 8:
                        _a = _d.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            Logger_js_1.Logger.error('❌ SUPABASE_CLIENT: Failed to get page users:', error, 'general');
                            return [2 /*return*/, []];
                        }
                        if (!data || data.length === 0) {
                            Logger_js_1.Logger.debug('ℹ️ SUPABASE_CLIENT: No active users found for pageId:', pageId, 'general');
                            return [2 /*return*/, []];
                        }
                        records = data;
                        Logger_js_1.Logger.debug('✅ SUPABASE_CLIENT: Found active users for page', { count: records.length, pageId: pageId }, 'general');
                        return [2 /*return*/, records.map(function (record) { return mapPresenceRecord(record, pageId); })];
                    case 9:
                        error_1 = _d.sent();
                        (0, ErrorHandler_js_1.handleError)(error_1, {
                            log: true,
                            logLevel: 'error',
                            context: {
                                operation: 'catch',
                                component: 'SupabaseRealtimeClientFix'
                            }
                        });
                        return [2 /*return*/, []];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
};
function applySupabaseRealtimeClientFix() {
    if (supabaseRealtimePatchApplied || supabaseRealtimePatchScheduled) {
        return;
    }
    if (typeof window === 'undefined') {
        return;
    }
    supabaseRealtimePatchScheduled = true;
    var checkAndPatch = function () {
        var _a;
        var win = window;
        var proto = (_a = win.SupabaseRealtimeClient) === null || _a === void 0 ? void 0 : _a.prototype;
        if (!proto) {
            setTimeout(checkAndPatch, 100);
            return;
        }
        var currentImpl = proto.getPageUsers;
        if (currentImpl === null || currentImpl === void 0 ? void 0 : currentImpl.__supabasePatched) {
            supabaseRealtimePatchApplied = true;
            return;
        }
        var patched = createPatchedGetPageUsers();
        patched.__supabasePatched = true;
        proto.getPageUsers = patched;
        supabaseRealtimePatchApplied = true;
        Logger_js_1.Logger.debug('✅ SUPABASE_REALTIME_CLIENT_FIX: Patched getPageUsers to use AppUser relation and proper filtering', null, 'general');
    };
    checkAndPatch();
}
var supabaseRealtimeInitPromise = null;
var supabaseRealtimeDomGuardsAttached = false;
var supabaseRealtimeSubscribedPages = new Set();
var getSupabaseClient = function (options) {
    var _a;
    if (options.supabaseClient) {
        return options.supabaseClient;
    }
    if (typeof window === 'undefined') {
        return null;
    }
    return (_a = window.supabase) !== null && _a !== void 0 ? _a : null;
};
var attachRealtimeDomGuards = function (service) {
    if (supabaseRealtimeDomGuardsAttached || typeof window === 'undefined') {
        return;
    }
    window.addEventListener('beforeunload', function () { return service.unsubscribeAll(); });
    window.addEventListener('metalayer:unsubscribe-realtime', function () { return service.unsubscribeAll(); });
    supabaseRealtimeDomGuardsAttached = true;
};
function initializeSupabaseRealtimeServices() {
    return __awaiter(this, arguments, void 0, function (options) {
        var supabaseClient, service, subscribeConfig, subscribed;
        var _this = this;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof window === 'undefined') {
                        Logger_js_1.Logger.debug('ℹ️ SupabaseRealtimeServices: Skipping initialization (no window)', null, 'general');
                        return [2 /*return*/, null];
                    }
                    applySupabaseRealtimeClientFix();
                    supabaseClient = getSupabaseClient(options);
                    if (!supabaseClient) {
                        Logger_js_1.Logger.warn('⚠️ SupabaseRealtimeServices: Supabase client missing, cannot initialize realtime services', null, 'general');
                        supabaseRealtimeInitPromise = null;
                        return [2 /*return*/, null];
                    }
                    if (!supabaseRealtimeInitPromise) {
                        supabaseRealtimeInitPromise = (function () { return __awaiter(_this, void 0, void 0, function () {
                            var service, ready;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        service = (0, RealtimeSubscriptionService_js_1.initializeRealtimeSubscriptionService)(supabaseClient);
                                        return [4 /*yield*/, service.initialize()];
                                    case 1:
                                        ready = _a.sent();
                                        if (!ready) {
                                            Logger_js_1.Logger.error('❌ SupabaseRealtimeServices: Realtime subscription service failed to initialize', null, 'general');
                                            return [2 /*return*/, null];
                                        }
                                        attachRealtimeDomGuards(service);
                                        return [2 /*return*/, service];
                                }
                            });
                        }); })().catch(function (error) {
                            supabaseRealtimeInitPromise = null;
                            (0, ErrorHandler_js_1.handleError)(error, {
                                log: true,
                                logLevel: 'error',
                                context: {
                                    operation: 'initializeSupabaseRealtimeServices',
                                    component: 'SupabaseRealtimeClientFix'
                                }
                            });
                            return null;
                        });
                    }
                    return [4 /*yield*/, supabaseRealtimeInitPromise];
                case 1:
                    service = _a.sent();
                    if (!service) {
                        supabaseRealtimeInitPromise = null;
                        return [2 /*return*/, null];
                    }
                    subscribeConfig = options.subscribeConfig;
                    if (!(subscribeConfig === null || subscribeConfig === void 0 ? void 0 : subscribeConfig.pageId)) return [3 /*break*/, 4];
                    if (!supabaseRealtimeSubscribedPages.has(subscribeConfig.pageId)) return [3 /*break*/, 2];
                    Logger_js_1.Logger.debug('ℹ️ SupabaseRealtimeServices: Page already subscribed, skipping duplicate wiring', { pageId: subscribeConfig.pageId }, 'general');
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, service.subscribeToPage(subscribeConfig)];
                case 3:
                    subscribed = _a.sent();
                    if (subscribed) {
                        supabaseRealtimeSubscribedPages.add(subscribeConfig.pageId);
                    }
                    _a.label = 4;
                case 4: return [2 /*return*/, service];
            }
        });
    });
}
exports.supabaseRealtimeApi = {
    applySupabaseRealtimeClientFix: applySupabaseRealtimeClientFix,
    initializeSupabaseRealtimeServices: initializeSupabaseRealtimeServices
};
exports.default = exports.supabaseRealtimeApi;
if (typeof window !== 'undefined') {
    applySupabaseRealtimeClientFix();
}
