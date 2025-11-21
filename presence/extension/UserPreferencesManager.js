"use strict";
/**
 * USER PREFERENCES MANAGER - TypeScript Version
 * Unified preference management system - Single source of truth for all user preferences
 *
 * Handles:
 * - Loading preferences (Chrome storage → Database fallback)
 * - Saving preferences (Chrome storage + Database)
 * - Event emission (EventBus + DOM events)
 * - Error handling and retry logic
 * - Data validation and integrity
 *
 * Based on: PREFERENCE_MANAGEMENT_PLAN.md
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
exports.UserPreferencesManager = void 0;
/**
 * USER PREFERENCES MANAGER
 * Unified preference management system - Single source of truth for all user preferences
 *
 * Handles:
 * - Loading preferences (Chrome storage → Database fallback)
 * - Saving preferences (Chrome storage + Database)
 * - Event emission (EventBus + DOM events)
 * - Error handling and retry logic
 * - Data validation and integrity
 *
 * Based on: PREFERENCE_MANAGEMENT_PLAN.md
 */
var UserPreferencesManager = /** @class */ (function () {
    function UserPreferencesManager() {
        this.userId = null;
        this.preferences = {};
        this.isInitialized = false;
        this.isLoading = false;
        this.isSaving = false;
        this.retryQueue = [];
        this.retryInterval = null;
        this.batchQueue = [];
        this.batchTimeout = null;
        this.batchDelay = 500;
        this.offlineListeners = [];
        // Metrics for monitoring
        this.metrics = {
            loads: { success: 0, failure: 0, totalTime: 0 },
            saves: { success: 0, failure: 0, totalTime: 0 },
            retries: { success: 0, failure: 0 },
            errors: []
        };
        // Offline detection
        this.isOnline = navigator.onLine !== false;
        this.setupOfflineDetection();
        // Preference schema (all as database columns)
        this.schema = {
            theme: {
                chromeKey: 'theme',
                dbColumn: 'theme',
                defaultValue: 'light',
                validator: function (v) { return ['light', 'dark', 'auto'].includes(v); },
                uiComponents: ['profile', 'settings', 'all']
            },
            auraColor: {
                chromeKey: 'auraColor',
                dbColumn: 'aura_color',
                defaultValue: '#98d416',
                validator: function (v) { return /^#[0-9A-Fa-f]{6}$/i.test(v); },
                uiComponents: ['avatars', 'profile', 'settings']
            },
            auraIntensity: {
                chromeKey: 'auraIntensity',
                dbColumn: 'aura_intensity',
                defaultValue: 0.5,
                validator: function (v) { return typeof v === 'number' && v >= 0 && v <= 1; },
                uiComponents: ['avatars', 'settings']
            },
            isVisible: {
                chromeKey: 'visibilityEnabled',
                dbColumn: 'is_visible',
                defaultValue: true,
                validator: function (v) { return typeof v === 'boolean'; },
                uiComponents: ['avatars', 'profile', 'settings', 'visibility']
            },
            globalAvailability: {
                chromeKey: 'availability',
                dbColumn: 'global_availability',
                defaultValue: 'AVAILABLE',
                validator: function (v) { return ['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE'].includes(v); },
                uiComponents: ['profile', 'settings', 'visibility']
            },
            headline: {
                chromeKey: 'settingsHeadline',
                dbColumn: 'headline',
                defaultValue: '',
                validator: function (v) { return v === '' || (typeof v === 'string' && v.length >= 20 && v.length <= 1000); },
                uiComponents: ['profile', 'settings']
            },
            displayName: {
                chromeKey: 'displayName',
                dbColumn: 'displayName', // FIX: Match Prisma schema (camelCase, not snake_case)
                defaultValue: '',
                validator: function (v) { return v === '' || (typeof v === 'string' && v.length >= 4 && v.length <= 16); },
                uiComponents: ['profile', 'settings', 'avatars']
            }
        };
        console.log('✅ USER_PREFERENCES_MANAGER: Initialized');
    }
    /**
     * Initialize preferences manager
     * Must be called after user authentication
     */
    UserPreferencesManager.prototype.initialize = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isInitialized) {
                            console.log('⚠️ USER_PREFERENCES_MANAGER: Already initialized');
                            return [2 /*return*/];
                        }
                        if (!userId) {
                            console.warn('⚠️ USER_PREFERENCES_MANAGER: No userId provided, waiting...');
                            // Wait for userId with longer timeout and better detection
                            return [2 /*return*/, new Promise(function (resolve) {
                                    var attempts = 0;
                                    var maxAttempts = 50; // 25 seconds (500ms * 50)
                                    var checkUser = setInterval(function () {
                                        var _a;
                                        attempts++;
                                        var currentUserId = (_a = window.currentUser) === null || _a === void 0 ? void 0 : _a.id;
                                        if (currentUserId) {
                                            clearInterval(checkUser);
                                            console.log("\u2705 USER_PREFERENCES_MANAGER: Found userId after ".concat(attempts, " attempts: ").concat(currentUserId));
                                            _this.initialize(currentUserId).then(resolve);
                                            return;
                                        }
                                        // Log progress every 5 seconds
                                        if (attempts % 10 === 0) {
                                            console.log("\u23F3 USER_PREFERENCES_MANAGER: Waiting for userId... (".concat(attempts, "/").concat(maxAttempts, ")"));
                                        }
                                        if (attempts >= maxAttempts) {
                                            clearInterval(checkUser);
                                            console.warn('⚠️ USER_PREFERENCES_MANAGER: Timeout waiting for userId - will initialize when userId becomes available');
                                            // Don't fail - just return false, initialization will happen when userId is available
                                            resolve(false);
                                        }
                                    }, 500);
                                })];
                        }
                        this.userId = userId;
                        console.log('🔧 USER_PREFERENCES_MANAGER: Initializing for user:', userId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Load all preferences
                        return [4 /*yield*/, this.loadAllPreferences()];
                    case 2:
                        // Load all preferences
                        _a.sent();
                        // Start retry queue processor
                        this.startRetryProcessor();
                        // Emit loaded event
                        this.emitPreferenceLoaded();
                        this.isInitialized = true;
                        console.log('✅ USER_PREFERENCES_MANAGER: Initialization complete');
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _a.sent();
                        console.error('❌ USER_PREFERENCES_MANAGER: Initialization failed:', error_1);
                        this.metrics.errors.push({ type: 'initialization', error: error_1.message, timestamp: Date.now() });
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load all preferences (Chrome storage → Database fallback)
     */
    UserPreferencesManager.prototype.loadAllPreferences = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, chromePrefs, dbPrefs, mergedPrefs, _i, _a, _b, key, config, chromeValue, dbValue, duration, error_2, duration;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (this.isLoading) {
                            console.log('⚠️ USER_PREFERENCES_MANAGER: Already loading, skipping...');
                            return [2 /*return*/];
                        }
                        this.isLoading = true;
                        startTime = Date.now();
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 8, 9, 10]);
                        console.log('📖 USER_PREFERENCES_MANAGER: Loading all preferences...');
                        return [4 /*yield*/, this.loadFromChromeStorage()];
                    case 2:
                        chromePrefs = _d.sent();
                        console.log('✅ USER_PREFERENCES_MANAGER: Loaded from Chrome storage:', Object.keys(chromePrefs).length, 'preferences');
                        return [4 /*yield*/, this.loadFromDatabase()];
                    case 3:
                        dbPrefs = _d.sent();
                        console.log('✅ USER_PREFERENCES_MANAGER: Loaded from database:', Object.keys(dbPrefs).length, 'preferences');
                        mergedPrefs = {};
                        _i = 0, _a = Object.entries(this.schema);
                        _d.label = 4;
                    case 4:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        _b = _a[_i], key = _b[0], config = _b[1];
                        chromeValue = chromePrefs[config.chromeKey];
                        dbValue = dbPrefs[key];
                        // Prefer Chrome storage (cache), fallback to database (authoritative), then default
                        mergedPrefs[key] = chromeValue !== undefined && chromeValue !== null
                            ? chromeValue
                            : (dbValue !== undefined && dbValue !== null ? dbValue : config.defaultValue);
                        if (!(chromeValue === undefined && dbValue !== undefined && dbValue !== null)) return [3 /*break*/, 6];
                        return [4 /*yield*/, chrome.storage.local.set((_c = {}, _c[config.chromeKey] = dbValue, _c))];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7:
                        this.preferences = mergedPrefs;
                        // Update window.currentUser immediately
                        this.updateCurrentUser();
                        // Apply preferences to UI immediately
                        this.applyPreferencesToUI();
                        duration = Date.now() - startTime;
                        this.metrics.loads.success++;
                        this.metrics.loads.totalTime += duration;
                        this.log('load', 'success', duration);
                        return [2 /*return*/, this.preferences];
                    case 8:
                        error_2 = _d.sent();
                        duration = Date.now() - startTime;
                        this.metrics.loads.failure++;
                        this.metrics.errors.push({ type: 'load', error: error_2.message, timestamp: Date.now() });
                        this.log('load', 'failure', duration, error_2);
                        throw error_2;
                    case 9:
                        this.isLoading = false;
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load preferences from Chrome storage
     */
    UserPreferencesManager.prototype.loadFromChromeStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chromeKeys, storageData, prefs, _i, _a, _b, key, config;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        chromeKeys = Object.values(this.schema).map(function (c) { return c.chromeKey; }).filter(function (k) { return k; });
                        return [4 /*yield*/, chrome.storage.local.get(chromeKeys)];
                    case 1:
                        storageData = _c.sent();
                        prefs = {};
                        for (_i = 0, _a = Object.entries(this.schema); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], config = _b[1];
                            if (config.chromeKey && storageData[config.chromeKey] !== undefined) {
                                prefs[key] = storageData[config.chromeKey];
                            }
                        }
                        return [2 /*return*/, prefs];
                }
            });
        });
    };
    /**
     * Load preferences from database (COLUMNS ONLY - no JSON fallback)
     */
    UserPreferencesManager.prototype.loadFromDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, prefs, _i, _a, _b, key, config, dbValue, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.userId || !window.api) {
                            console.log('⚠️ USER_PREFERENCES_MANAGER: Cannot load from database (no userId or API)');
                            throw new Error('Cannot load preferences: userId or API not available');
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, window.api.request("/v1/users/".concat(this.userId), {
                                method: 'GET'
                            })];
                    case 2:
                        response = _c.sent();
                        if (!response) {
                            throw new Error('Empty response from API');
                        }
                        prefs = {};
                        for (_i = 0, _a = Object.entries(this.schema); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], config = _b[1];
                            dbValue = response[config.dbColumn];
                            if (dbValue !== undefined && dbValue !== null) {
                                prefs[key] = dbValue; // Map by preference key
                            }
                            else {
                                // Use default if column doesn't exist or is null
                                prefs[key] = config.defaultValue;
                            }
                        }
                        return [2 /*return*/, prefs];
                    case 3:
                        error_3 = _c.sent();
                        console.error('❌ USER_PREFERENCES_MANAGER: Database load failed:', error_3);
                        throw error_3; // Don't silently fail - we need database columns
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a single preference
     */
    UserPreferencesManager.prototype.getPreference = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.schema[key]) {
                            console.warn("\u26A0\uFE0F USER_PREFERENCES_MANAGER: Unknown preference key: ".concat(key));
                            return [2 /*return*/, null];
                        }
                        if (!!this.isInitialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize(this.userId || ((_a = window.currentUser) === null || _a === void 0 ? void 0 : _a.id))];
                    case 1:
                        _c.sent();
                        _c.label = 2;
                    case 2: return [2 /*return*/, (_b = this.preferences[key]) !== null && _b !== void 0 ? _b : this.schema[key].defaultValue];
                }
            });
        });
    };
    /**
     * Save a single preference (supports batching)
     */
    UserPreferencesManager.prototype.savePreference = function (key_1, value_1) {
        return __awaiter(this, arguments, void 0, function (key, value, options) {
            var config, oldValue, error_4;
            var _a;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.schema[key]) {
                            console.error("\u274C USER_PREFERENCES_MANAGER: Unknown preference key: ".concat(key));
                            return [2 /*return*/, false];
                        }
                        config = this.schema[key];
                        oldValue = this.preferences[key];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        // Step 1: Validate
                        if (!this.validatePreference(key, value)) {
                            console.error("\u274C USER_PREFERENCES_MANAGER: Invalid value for ".concat(key, ":"), value);
                            return [2 /*return*/, false];
                        }
                        // Step 2: Update local state immediately
                        this.preferences[key] = value;
                        // Step 3: Update Chrome storage (fast, always succeeds)
                        return [4 /*yield*/, chrome.storage.local.set((_a = {}, _a[config.chromeKey] = value, _a))];
                    case 2:
                        // Step 3: Update Chrome storage (fast, always succeeds)
                        _b.sent();
                        console.log("\u2705 USER_PREFERENCES_MANAGER: Saved ".concat(key, " to Chrome storage"));
                        // Step 4: Update window.currentUser (immediate)
                        this.updateCurrentUser();
                        // Step 5: Emit change event (immediate)
                        this.emitPreferenceChanged(key, value, oldValue, 'user');
                        // Step 6: Apply to UI immediately (CRITICAL FIX: Update UI after save)
                        this.applyPreferencesToUI();
                        if (!!options.skipDatabase) return [3 /*break*/, 5];
                        if (!(options.batch === true || options.batch === undefined)) return [3 /*break*/, 3];
                        // Add to batch queue (default behavior)
                        this.addToBatch(key, value);
                        return [3 /*break*/, 5];
                    case 3: 
                    // Save immediately (no batching) - CRITICAL FIX: Must await to ensure save completes
                    return [4 /*yield*/, this.saveToDatabaseImmediate(key, value)];
                    case 4:
                        // Save immediately (no batching) - CRITICAL FIX: Must await to ensure save completes
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, true];
                    case 6:
                        error_4 = _b.sent();
                        console.error("\u274C USER_PREFERENCES_MANAGER: Failed to save preference ".concat(key, ":"), error_4);
                        this.metrics.errors.push({ type: 'save', key: key, error: error_4.message, timestamp: Date.now() });
                        this.emitPreferenceSaveFailed(key, value, error_4);
                        return [2 /*return*/, false];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save multiple preferences in a batch
     */
    UserPreferencesManager.prototype.savePreferences = function (preferences_1) {
        return __awaiter(this, arguments, void 0, function (preferences, options) {
            var results, oldValues, _i, _a, _b, key, value, chromeUpdates, _c, _d, _e, key, value, config, _f, _g, _h, key, value;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        console.log("\uD83D\uDCE6 USER_PREFERENCES_MANAGER: Batching ".concat(Object.keys(preferences).length, " preferences"));
                        results = {};
                        oldValues = {};
                        // Step 1: Validate all preferences
                        for (_i = 0, _a = Object.entries(preferences); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], value = _b[1];
                            if (!this.schema[key]) {
                                console.error("\u274C USER_PREFERENCES_MANAGER: Unknown preference key: ".concat(key));
                                results[key] = false;
                                continue;
                            }
                            if (!this.validatePreference(key, value)) {
                                console.error("\u274C USER_PREFERENCES_MANAGER: Invalid value for ".concat(key, ":"), value);
                                results[key] = false;
                                continue;
                            }
                            oldValues[key] = this.preferences[key];
                        }
                        chromeUpdates = {};
                        for (_c = 0, _d = Object.entries(preferences); _c < _d.length; _c++) {
                            _e = _d[_c], key = _e[0], value = _e[1];
                            if (results[key] === false)
                                continue;
                            this.preferences[key] = value;
                            config = this.schema[key];
                            chromeUpdates[config.chromeKey] = value;
                        }
                        // Step 3: Update Chrome storage (batch update)
                        return [4 /*yield*/, chrome.storage.local.set(chromeUpdates)];
                    case 1:
                        // Step 3: Update Chrome storage (batch update)
                        _j.sent();
                        console.log("\u2705 USER_PREFERENCES_MANAGER: Saved ".concat(Object.keys(chromeUpdates).length, " preferences to Chrome storage"));
                        // Step 4: Update window.currentUser
                        this.updateCurrentUser();
                        // Step 5: Emit change events
                        for (_f = 0, _g = Object.entries(preferences); _f < _g.length; _f++) {
                            _h = _g[_f], key = _h[0], value = _h[1];
                            if (results[key] === false)
                                continue;
                            this.emitPreferenceChanged(key, value, oldValues[key], 'user');
                        }
                        if (!!options.skipDatabase) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.saveBatchToDatabase(preferences)];
                    case 2:
                        _j.sent();
                        _j.label = 3;
                    case 3: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Add preference to batch queue
     */
    UserPreferencesManager.prototype.addToBatch = function (key, value) {
        var _this = this;
        // Remove existing entry for this key if present
        this.batchQueue = this.batchQueue.filter(function (item) { return item.key !== key; });
        // Add new entry
        this.batchQueue.push({ key: key, value: value, timestamp: Date.now() });
        // Clear existing timeout
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
        }
        // Set new timeout to flush batch
        this.batchTimeout = setTimeout(function () {
            _this.flushBatch();
        }, this.batchDelay);
        console.log("\uD83D\uDCE6 USER_PREFERENCES_MANAGER: Added ".concat(key, " to batch (queue size: ").concat(this.batchQueue.length, ")"));
    };
    /**
     * Flush batch queue to database
     */
    UserPreferencesManager.prototype.flushBatch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var batch, preferences, _i, batch_1, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.batchQueue.length === 0) {
                            return [2 /*return*/];
                        }
                        batch = __spreadArray([], this.batchQueue, true);
                        this.batchQueue = [];
                        this.batchTimeout = null;
                        console.log("\uD83D\uDCE6 USER_PREFERENCES_MANAGER: Flushing batch (".concat(batch.length, " items)"));
                        preferences = {};
                        for (_i = 0, batch_1 = batch; _i < batch_1.length; _i++) {
                            item = batch_1[_i];
                            preferences[item.key] = item.value;
                        }
                        // Save batch to database
                        return [4 /*yield*/, this.saveBatchToDatabase(preferences)];
                    case 1:
                        // Save batch to database
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save batch to database
     */
    UserPreferencesManager.prototype.saveBatchToDatabase = function (preferences) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, key, value, updates, _c, _d, _e, key, value, config, startTime, response, duration, error_5, duration, isOfflineError, _f, _g, _h, key, value;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (!this.userId || !window.api) {
                            console.warn('⚠️ USER_PREFERENCES_MANAGER: Cannot save batch (no userId or API)');
                            return [2 /*return*/];
                        }
                        // Check if offline
                        if (!this.isOnline) {
                            console.log('🌐 USER_PREFERENCES_MANAGER: Offline, queueing batch for sync');
                            // Queue each preference for retry when online
                            for (_i = 0, _a = Object.entries(preferences); _i < _a.length; _i++) {
                                _b = _a[_i], key = _b[0], value = _b[1];
                                this.queueForRetry(key, value);
                            }
                            return [2 /*return*/];
                        }
                        updates = {};
                        for (_c = 0, _d = Object.entries(preferences); _c < _d.length; _c++) {
                            _e = _d[_c], key = _e[0], value = _e[1];
                            config = this.schema[key];
                            if (config) {
                                updates[config.dbColumn] = value;
                            }
                        }
                        if (Object.keys(updates).length === 0) {
                            return [2 /*return*/];
                        }
                        startTime = Date.now();
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, window.api.request("/v1/users/".concat(this.userId), {
                                method: 'PATCH',
                                body: JSON.stringify(updates)
                            })];
                    case 2:
                        response = _j.sent();
                        if (!response) {
                            throw new Error('Empty response from API');
                        }
                        duration = Date.now() - startTime;
                        this.metrics.saves.success++;
                        this.metrics.saves.totalTime += duration;
                        this.log('save', 'success', duration);
                        console.log("\u2705 USER_PREFERENCES_MANAGER: Saved batch (".concat(Object.keys(updates).length, " preferences) to database"));
                        return [2 /*return*/, response];
                    case 3:
                        error_5 = _j.sent();
                        duration = Date.now() - startTime;
                        this.metrics.saves.failure++;
                        this.metrics.errors.push({ type: 'save', error: error_5.message, timestamp: Date.now() });
                        this.log('save', 'failure', duration, error_5);
                        console.error("\u274C USER_PREFERENCES_MANAGER: Failed to save batch to database:", error_5);
                        isOfflineError = error_5.message.includes('Failed to fetch') ||
                            error_5.message.includes('NetworkError') ||
                            error_5.message.includes('network') ||
                            !this.isOnline;
                        if (isOfflineError) {
                            console.log('🌐 USER_PREFERENCES_MANAGER: Network error detected, queueing for sync');
                            this.isOnline = false; // Update offline status
                        }
                        // Queue each preference for individual retry
                        for (_f = 0, _g = Object.entries(preferences); _f < _g.length; _f++) {
                            _h = _g[_f], key = _h[0], value = _h[1];
                            this.queueForRetry(key, value);
                            this.emitPreferenceSaveFailed(key, value, error_5);
                        }
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save to database immediately (no batching)
     * FIX: Properly await the save to ensure it completes
     */
    UserPreferencesManager.prototype.saveToDatabaseImmediate = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, response, duration, error_6, duration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.saveToDatabase(key, value)];
                    case 2:
                        response = _a.sent();
                        duration = Date.now() - startTime;
                        this.metrics.saves.success++;
                        this.metrics.saves.totalTime += duration;
                        this.log('save', 'success', duration);
                        console.log("\u2705 USER_PREFERENCES_MANAGER: Saved ".concat(key, " to database"));
                        return [2 /*return*/, response];
                    case 3:
                        error_6 = _a.sent();
                        duration = Date.now() - startTime;
                        this.metrics.saves.failure++;
                        this.metrics.errors.push({ type: 'save', key: key, error: error_6.message, timestamp: Date.now() });
                        this.log('save', 'failure', duration, error_6);
                        console.error("\u274C USER_PREFERENCES_MANAGER: Failed to save ".concat(key, " to database:"), error_6);
                        // Queue for retry
                        this.queueForRetry(key, value);
                        // Emit error event
                        this.emitPreferenceSaveFailed(key, value, error_6);
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save preference to database with retry logic
     */
    UserPreferencesManager.prototype.saveToDatabase = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var config, maxRetries, lastError, startTime, _loop_1, this_1, attempt, state_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.userId || !window.api) {
                            throw new Error('No userId or API available');
                        }
                        // Check if offline
                        if (!this.isOnline) {
                            throw new Error('Offline: Cannot save to database');
                        }
                        config = this.schema[key];
                        maxRetries = 3;
                        startTime = Date.now();
                        _loop_1 = function (attempt) {
                            var response, error_7, isOfflineError, delay_1;
                            var _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        // Check if still online before each attempt
                                        if (!this_1.isOnline) {
                                            throw new Error('Offline: Cannot save to database');
                                        }
                                        _c.label = 1;
                                    case 1:
                                        _c.trys.push([1, 3, , 6]);
                                        return [4 /*yield*/, window.api.request("/v1/users/".concat(this_1.userId), {
                                                method: 'PATCH',
                                                body: JSON.stringify((_b = {},
                                                    _b[config.dbColumn] = value,
                                                    _b))
                                            })];
                                    case 2:
                                        response = _c.sent();
                                        if (!response) {
                                            throw new Error('Empty response from API');
                                        }
                                        return [2 /*return*/, { value: response }];
                                    case 3:
                                        error_7 = _c.sent();
                                        lastError = error_7;
                                        isOfflineError = error_7.message.includes('Failed to fetch') ||
                                            error_7.message.includes('NetworkError') ||
                                            error_7.message.includes('network');
                                        if (isOfflineError) {
                                            this_1.isOnline = false; // Update offline status
                                            throw new Error('Offline: Cannot save to database');
                                        }
                                        if (!(attempt < maxRetries)) return [3 /*break*/, 5];
                                        delay_1 = Math.pow(2, attempt) * 1000;
                                        console.log("\u26A0\uFE0F USER_PREFERENCES_MANAGER: Retry ".concat(attempt, "/").concat(maxRetries, " for ").concat(key, " after ").concat(delay_1, "ms"));
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay_1); })];
                                    case 4:
                                        _c.sent();
                                        _c.label = 5;
                                    case 5: return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        attempt = 1;
                        _a.label = 1;
                    case 1:
                        if (!(attempt <= maxRetries)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _a.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4: throw lastError;
                }
            });
        });
    };
    /**
     * Validate preference value
     */
    UserPreferencesManager.prototype.validatePreference = function (key, value) {
        var config = this.schema[key];
        if (!config) {
            return false;
        }
        if (config.validator) {
            return config.validator(value);
        }
        return true;
    };
    /**
     * Update window.currentUser with current preferences
     */
    UserPreferencesManager.prototype.updateCurrentUser = function () {
        if (!window.currentUser) {
            return;
        }
        // Update direct properties for backward compatibility
        window.currentUser.theme = this.preferences.theme;
        window.currentUser.auraColor = this.preferences.auraColor;
        window.currentUser.auraIntensity = this.preferences.auraIntensity;
        window.currentUser.isVisible = this.preferences.isVisible;
        window.currentUser.visibilityEnabled = this.preferences.isVisible;
        window.currentUser.globalAvailability = this.preferences.globalAvailability;
        window.currentUser.availability = this.preferences.globalAvailability;
        window.currentUser.headline = this.preferences.headline;
        window.currentUser.displayName = this.preferences.displayName;
    };
    /**
     * Apply preferences to UI immediately after loading
     */
    UserPreferencesManager.prototype.applyPreferencesToUI = function () {
        // Apply theme to DOM
        if (this.preferences.theme) {
            document.documentElement.setAttribute('data-theme', this.preferences.theme);
            document.body.setAttribute('data-theme', this.preferences.theme);
            // Update theme toggle in settings tab if exists
            var themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.checked = this.preferences.theme === 'dark';
                if (window.visibilitySettingsManager && typeof window.visibilitySettingsManager.updateThemeStatus === 'function') {
                    window.visibilitySettingsManager.updateThemeStatus();
                }
            }
            // Update profile menu theme icon/text
            var themeIconMenu = document.getElementById('theme-icon-menu');
            var themeTextMenu = document.getElementById('theme-text-menu');
            if (themeIconMenu) {
                themeIconMenu.textContent = this.preferences.theme === 'dark' ? '☀️' : '🌙';
            }
            if (themeTextMenu) {
                themeTextMenu.textContent = this.preferences.theme === 'dark' ? 'Light mode' : 'Dark mode';
            }
        }
        // Apply visibility to toggle if exists
        if (this.preferences.isVisible !== undefined) {
            var visibilityToggle = document.getElementById('visibility-toggle');
            if (visibilityToggle) {
                visibilityToggle.checked = this.preferences.isVisible;
                if (window.visibilitySettingsManager && typeof window.visibilitySettingsManager.updateVisibilityStatus === 'function') {
                    window.visibilitySettingsManager.updateVisibilityStatus();
                }
            }
        }
        // Apply headline to input if exists
        if (this.preferences.headline !== undefined) {
            var headlineInput = document.getElementById('settings-headline-input');
            if (headlineInput && headlineInput.value !== this.preferences.headline) {
                headlineInput.value = this.preferences.headline;
                if (window.settingsHeadlineManager && typeof window.settingsHeadlineManager.updateCharCount === 'function') {
                    window.settingsHeadlineManager.updateCharCount();
                }
            }
        }
        // Apply display name to input if exists
        if (this.preferences.displayName !== undefined) {
            var displayNameInput = document.getElementById('display-name-input');
            if (displayNameInput && displayNameInput.value !== this.preferences.displayName) {
                displayNameInput.value = this.preferences.displayName;
                if (window.displayNameManager && typeof window.displayNameManager.updateCharCount === 'function') {
                    window.displayNameManager.updateCharCount();
                }
            }
        }
        // Trigger avatar refresh for aura changes
        if (this.preferences.auraColor || this.preferences.auraIntensity !== undefined) {
            if (typeof window.refreshAllMessageAvatars === 'function') {
                window.refreshAllMessageAvatars();
            }
            if (typeof window.refreshVisibilityAvatars === 'function') {
                window.refreshVisibilityAvatars();
            }
        }
        console.log('✅ USER_PREFERENCES_MANAGER: Applied preferences to UI');
    };
    /**
     * Queue failed save for retry
     */
    UserPreferencesManager.prototype.queueForRetry = function (key, value) {
        var failedSave = {
            key: key,
            value: value,
            timestamp: Date.now(),
            attempts: 0
        };
        this.retryQueue.push(failedSave);
        console.log("\uD83D\uDCCB USER_PREFERENCES_MANAGER: Queued ".concat(key, " for retry (queue size: ").concat(this.retryQueue.length, ")"));
        // Store in localStorage as backup
        try {
            var storedQueue = JSON.parse(localStorage.getItem('failedPreferenceSaves') || '[]');
            storedQueue.push(failedSave);
            localStorage.setItem('failedPreferenceSaves', JSON.stringify(storedQueue));
        }
        catch (error) {
            console.warn('⚠️ USER_PREFERENCES_MANAGER: Failed to store retry queue:', error);
        }
    };
    /**
     * Start retry processor
     */
    UserPreferencesManager.prototype.startRetryProcessor = function () {
        var _this = this;
        if (this.retryInterval) {
            return;
        }
        // Process retry queue every 30 seconds
        this.retryInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.processRetryQueue()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, 30000);
        // Also process on next load
        this.processRetryQueue();
    };
    /**
     * Setup offline detection
     */
    UserPreferencesManager.prototype.setupOfflineDetection = function () {
        var _this = this;
        // Listen for online/offline events
        window.addEventListener('online', function () {
            _this.handleOnline();
        });
        window.addEventListener('offline', function () {
            _this.handleOffline();
        });
        // Initial check
        this.isOnline = navigator.onLine !== false;
        console.log("\uD83C\uDF10 USER_PREFERENCES_MANAGER: Initial online status: ".concat(this.isOnline));
    };
    /**
     * Handle going online
     */
    UserPreferencesManager.prototype.handleOnline = function () {
        var wasOffline = !this.isOnline;
        this.isOnline = true;
        console.log('🌐 USER_PREFERENCES_MANAGER: Connection restored, processing sync queue');
        // Process retry queue when coming back online
        if (wasOffline) {
            this.processRetryQueue();
            // Flush any pending batch
            if (this.batchQueue.length > 0) {
                this.flushBatch();
            }
        }
        // Notify listeners
        this.offlineListeners.forEach(function (listener) {
            if (typeof listener === 'function') {
                listener({ online: true });
            }
        });
    };
    /**
     * Handle going offline
     */
    UserPreferencesManager.prototype.handleOffline = function () {
        this.isOnline = false;
        console.log('🌐 USER_PREFERENCES_MANAGER: Connection lost, will queue saves for sync');
        // Notify listeners
        this.offlineListeners.forEach(function (listener) {
            if (typeof listener === 'function') {
                listener({ online: false });
            }
        });
    };
    /**
     * Add offline status listener
     */
    UserPreferencesManager.prototype.addOfflineListener = function (listener) {
        this.offlineListeners.push(listener);
    };
    /**
     * Remove offline status listener
     */
    UserPreferencesManager.prototype.removeOfflineListener = function (listener) {
        this.offlineListeners = this.offlineListeners.filter(function (l) { return l !== listener; });
    };
    /**
     * Process retry queue (only if online)
     */
    UserPreferencesManager.prototype.processRetryQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queue, _i, queue_1, item, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isOnline) {
                            console.log('🌐 USER_PREFERENCES_MANAGER: Skipping retry queue (offline)');
                            return [2 /*return*/];
                        }
                        if (this.retryQueue.length === 0) {
                            return [2 /*return*/];
                        }
                        console.log("\uD83D\uDD04 USER_PREFERENCES_MANAGER: Processing retry queue (".concat(this.retryQueue.length, " items)"));
                        queue = __spreadArray([], this.retryQueue, true);
                        this.retryQueue = [];
                        _i = 0, queue_1 = queue;
                        _a.label = 1;
                    case 1:
                        if (!(_i < queue_1.length)) return [3 /*break*/, 6];
                        item = queue_1[_i];
                        // Check if still online before each retry
                        if (!this.isOnline) {
                            console.log('🌐 USER_PREFERENCES_MANAGER: Went offline during retry, re-queuing');
                            this.retryQueue.push(item);
                            return [3 /*break*/, 5];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.saveToDatabase(item.key, item.value)];
                    case 3:
                        _a.sent();
                        this.metrics.retries.success++;
                        console.log("\u2705 USER_PREFERENCES_MANAGER: Retry successful for ".concat(item.key));
                        return [3 /*break*/, 5];
                    case 4:
                        error_8 = _a.sent();
                        item.attempts++;
                        if (item.attempts < 5) {
                            // Re-queue if not too many attempts
                            this.retryQueue.push(item);
                        }
                        else {
                            this.metrics.retries.failure++;
                            console.error("\u274C USER_PREFERENCES_MANAGER: Retry failed for ".concat(item.key, " after ").concat(item.attempts, " attempts"));
                        }
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        // Update localStorage
                        try {
                            localStorage.setItem('failedPreferenceSaves', JSON.stringify(this.retryQueue));
                        }
                        catch (error) {
                            console.warn('⚠️ USER_PREFERENCES_MANAGER: Failed to update retry queue storage:', error);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Emit preference changed event
     */
    UserPreferencesManager.prototype.emitPreferenceChanged = function (key, value, oldValue, source) {
        if (source === void 0) { source = 'user'; }
        var eventData = {
            key: key,
            value: value,
            oldValue: oldValue,
            source: source,
            timestamp: Date.now()
        };
        // EventBus event
        if (window.eventBus && typeof window.eventBus.emit === 'function') {
            window.eventBus.emit('preference:changed', eventData);
        }
        // DOM event
        window.dispatchEvent(new CustomEvent('preferenceChanged', {
            detail: eventData
        }));
        console.log("\uD83D\uDCE2 USER_PREFERENCES_MANAGER: Emitted preference changed: ".concat(key), eventData);
    };
    /**
     * Emit preference loaded event
     */
    UserPreferencesManager.prototype.emitPreferenceLoaded = function () {
        var eventData = {
            preferences: __assign({}, this.preferences),
            timestamp: Date.now()
        };
        // EventBus event
        if (window.eventBus && typeof window.eventBus.emit === 'function') {
            window.eventBus.emit('preference:loaded', eventData);
        }
        // DOM event
        window.dispatchEvent(new CustomEvent('preferenceLoaded', {
            detail: eventData
        }));
        console.log('📢 USER_PREFERENCES_MANAGER: Emitted preference loaded');
    };
    /**
     * Emit preference save failed event
     */
    UserPreferencesManager.prototype.emitPreferenceSaveFailed = function (key, value, error) {
        var eventData = {
            key: key,
            value: value,
            error: error.message,
            timestamp: Date.now()
        };
        // EventBus event
        if (window.eventBus && typeof window.eventBus.emit === 'function') {
            window.eventBus.emit('preference:saveFailed', eventData);
        }
        // DOM event
        window.dispatchEvent(new CustomEvent('preferenceSaveFailed', {
            detail: eventData
        }));
    };
    /**
     * Log operation
     */
    UserPreferencesManager.prototype.log = function (operation, status, duration, error) {
        if (error === void 0) { error = null; }
        var logEntry = {
            operation: operation,
            status: status,
            duration: duration,
            error: error === null || error === void 0 ? void 0 : error.message,
            timestamp: Date.now(),
            userId: this.userId
        };
        // Send to monitoring service if available
        if (window.monitoringService && typeof window.monitoringService.log === 'function') {
            window.monitoringService.log('preference', logEntry);
        }
        // Console log
        var emoji = status === 'success' ? '✅' : '❌';
        console.log("".concat(emoji, " [PREFERENCE_MANAGER] ").concat(operation, " ").concat(status, " (").concat(duration, "ms)"), logEntry);
    };
    /**
     * Get metrics
     */
    UserPreferencesManager.prototype.getMetrics = function () {
        return __assign(__assign({}, this.metrics), { retryQueueSize: this.retryQueue.length, isInitialized: this.isInitialized, isLoading: this.isLoading, isSaving: this.isSaving });
    };
    /**
     * Validate preference integrity
     */
    UserPreferencesManager.prototype.validateIntegrity = function () {
        return __awaiter(this, void 0, void 0, function () {
            var checks, chromePrefs, dbPrefs, _i, _a, _b, key, config, chromeValue, dbValue, currentValue;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        checks = [];
                        return [4 /*yield*/, this.loadFromChromeStorage()];
                    case 1:
                        chromePrefs = _c.sent();
                        return [4 /*yield*/, this.loadFromDatabase()];
                    case 2:
                        dbPrefs = _c.sent();
                        for (_i = 0, _a = Object.entries(this.schema); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], config = _b[1];
                            chromeValue = chromePrefs[config.chromeKey];
                            dbValue = dbPrefs[config.dbColumn];
                            currentValue = this.preferences[key];
                            if (chromeValue !== undefined && dbValue !== undefined && chromeValue !== dbValue) {
                                checks.push({
                                    type: 'mismatch',
                                    key: key,
                                    chromeValue: chromeValue,
                                    dbValue: dbValue,
                                    currentValue: currentValue
                                });
                            }
                        }
                        if (checks.length > 0) {
                            console.warn('⚠️ USER_PREFERENCES_MANAGER: Integrity issues found:', checks);
                        }
                        return [2 /*return*/, checks.length === 0];
                }
            });
        });
    };
    return UserPreferencesManager;
}());
exports.UserPreferencesManager = UserPreferencesManager;
// Create singleton instance
var userPreferencesManager = new UserPreferencesManager();
// Export for global access
if (typeof window !== 'undefined') {
    window.UserPreferencesManager = UserPreferencesManager;
    window.userPreferencesManager = userPreferencesManager;
    // Convenience functions
    window.getPreference = function (key) { return userPreferencesManager.getPreference(key); };
    window.savePreference = function (key, value, options) { return userPreferencesManager.savePreference(key, value, options); };
}
console.log('✅ USER_PREFERENCES_MANAGER: Module loaded');
exports.default = userPreferencesManager;
