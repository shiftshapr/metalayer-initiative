"use strict";
/**
 * Reload Sequence Diagnostic
 * Tracks ALL function calls during reload to identify theme changes
 */
(function () {
    'use strict';
    console.log('🔍 RELOAD_DIAGNOSTIC: Starting comprehensive reload sequence tracking...');
    const functionCallLog = [];
    const themeChangeLog = [];
    // Track all function calls
    const originalFunction = Function.prototype.constructor;
    const trackedFunctions = new Set();
    // Intercept setAttribute calls on document.body and document.documentElement
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name, value) {
        if (name === 'data-theme' && (this === document.body || this === document.documentElement)) {
            const oldValue = this.getAttribute('data-theme');
            const stack = new Error().stack || 'No stack trace';
            const caller = stack.split('\n')[2]?.trim() || 'unknown';
            themeChangeLog.push({
                timestamp: new Date().toISOString(),
                oldValue: oldValue || 'NOT SET',
                newValue: value || 'NOT SET',
                source: caller,
                stack: stack
            });
            console.log('🔍 THEME_CHANGE: ========================================');
            console.log('🔍 THEME_CHANGE: ⚠️ THEME CHANGE DETECTED');
            console.log('🔍 THEME_CHANGE: Element:', this === document.body ? 'document.body' : 'document.documentElement');
            console.log('🔍 THEME_CHANGE: Old value:', oldValue || 'NOT SET');
            console.log('🔍 THEME_CHANGE: New value:', value || 'NOT SET');
            console.log('🔍 THEME_CHANGE: Caller:', caller);
            console.log('🔍 THEME_CHANGE: Full stack:', stack);
            console.log('🔍 THEME_CHANGE: ========================================');
        }
        return originalSetAttribute.call(this, name, value);
    };
    // Track specific functions that might change theme
    const functionsToTrack = [
        'loadChatHistory',
        'loadAllPreferences',
        'applyPreferencesToUI',
        'updateThemeEverywhere',
        'saveTheme',
        'loadSettings',
        'initialize',
        'updateAllThemeUI',
        'toggleTheme',
        'loadDefaultView',
        'render',
        'onMessageUpdate',
        'handleUserChange',
        'initializeAuthFlow',
        'loadFromDatabase',
        'loadFromChromeStorage',
        'setState',
        'getState'
    ];
    // Wrap window functions
    functionsToTrack.forEach((funcName) => {
        const win = window;
        if (win[funcName] && typeof win[funcName] === 'function') {
            const original = win[funcName];
            trackedFunctions.add(funcName);
            win[funcName] = function (...args) {
                const timestamp = new Date().toISOString();
                const stack = new Error().stack || 'No stack trace';
                const caller = stack.split('\n')[2]?.trim() || 'unknown';
                // Check theme before call
                const themeBefore = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                functionCallLog.push({
                    timestamp,
                    functionName: funcName,
                    args: args.map(arg => {
                        if (typeof arg === 'object' && arg !== null) {
                            try {
                                return JSON.stringify(arg).substring(0, 200);
                            }
                            catch {
                                return '[Object]';
                            }
                        }
                        return String(arg).substring(0, 200);
                    }),
                    stack: stack
                });
                console.log(`🔍 FUNCTION_CALL: ${funcName}()`);
                console.log(`🔍 FUNCTION_CALL: Theme before: ${themeBefore}`);
                console.log(`🔍 FUNCTION_CALL: Caller: ${caller}`);
                console.log(`🔍 FUNCTION_CALL: Args:`, args);
                try {
                    const result = original.apply(this, args);
                    // Check theme after call (with delay for async)
                    setTimeout(() => {
                        const themeAfter = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                        if (themeBefore !== themeAfter) {
                            console.log(`🔍 FUNCTION_CALL: ⚠️ ${funcName}() CHANGED THEME!`);
                            console.log(`🔍 FUNCTION_CALL: Before: ${themeBefore} -> After: ${themeAfter}`);
                            console.log(`🔍 FUNCTION_CALL: Full stack:`, stack);
                        }
                    }, 100);
                    return result;
                }
                catch (error) {
                    console.error(`🔍 FUNCTION_CALL: ${funcName}() ERROR:`, error);
                    throw error;
                }
            };
        }
    });
    // Track UserPreferencesManager methods
    const trackUserPreferencesManager = () => {
        const win = window;
        if (win.userPreferencesManager) {
            const manager = win.userPreferencesManager;
            // Wrap initialize
            if (manager.initialize && typeof manager.initialize === 'function') {
                const original = manager.initialize;
                manager.initialize = function (...args) {
                    const themeBefore = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                    console.log(`🔍 USER_PREFERENCES_MANAGER.initialize() called`);
                    console.log(`🔍 Theme before: ${themeBefore}`);
                    const result = original.apply(this, args);
                    setTimeout(() => {
                        const themeAfter = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                        if (themeBefore !== themeAfter) {
                            console.log(`🔍 ⚠️ USER_PREFERENCES_MANAGER.initialize() CHANGED THEME!`);
                            console.log(`🔍 Before: ${themeBefore} -> After: ${themeAfter}`);
                        }
                    }, 100);
                    return result;
                };
            }
            // Wrap applyPreferencesToUI
            if (manager.applyPreferencesToUI && typeof manager.applyPreferencesToUI === 'function') {
                const original = manager.applyPreferencesToUI;
                manager.applyPreferencesToUI = function (...args) {
                    const themeBefore = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                    const stack = new Error().stack || 'No stack trace';
                    console.log(`🔍 USER_PREFERENCES_MANAGER.applyPreferencesToUI() called`);
                    console.log(`🔍 Theme before: ${themeBefore}`);
                    console.log(`🔍 Stack:`, stack);
                    const result = original.apply(this, args);
                    setTimeout(() => {
                        const themeAfter = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                        if (themeBefore !== themeAfter) {
                            console.log(`🔍 ⚠️ USER_PREFERENCES_MANAGER.applyPreferencesToUI() CHANGED THEME!`);
                            console.log(`🔍 Before: ${themeBefore} -> After: ${themeAfter}`);
                            console.log(`🔍 Full stack:`, stack);
                        }
                    }, 100);
                    return result;
                };
            }
            // Wrap loadAllPreferences
            if (manager.loadAllPreferences && typeof manager.loadAllPreferences === 'function') {
                const original = manager.loadAllPreferences;
                manager.loadAllPreferences = function (...args) {
                    const themeBefore = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                    const stack = new Error().stack || 'No stack trace';
                    console.log(`🔍 USER_PREFERENCES_MANAGER.loadAllPreferences() called`);
                    console.log(`🔍 Theme before: ${themeBefore}`);
                    console.log(`🔍 Stack:`, stack);
                    const result = original.apply(this, args);
                    setTimeout(() => {
                        const themeAfter = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                        if (themeBefore !== themeAfter) {
                            console.log(`🔍 ⚠️ USER_PREFERENCES_MANAGER.loadAllPreferences() CHANGED THEME!`);
                            console.log(`🔍 Before: ${themeBefore} -> After: ${themeAfter}`);
                            console.log(`🔍 Full stack:`, stack);
                        }
                    }, 100);
                    return result;
                };
            }
        }
        else {
            // Retry if not available yet
            setTimeout(trackUserPreferencesManager, 500);
        }
    };
    // Track ProfileManager methods
    const trackProfileManager = () => {
        const win = window;
        if (win.profileManager) {
            const manager = win.profileManager;
            // Wrap updateThemeEverywhere
            if (manager.updateThemeEverywhere && typeof manager.updateThemeEverywhere === 'function') {
                const original = manager.updateThemeEverywhere;
                manager.updateThemeEverywhere = function (...args) {
                    const themeBefore = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                    const stack = new Error().stack || 'No stack trace';
                    console.log(`🔍 PROFILE_MANAGER.updateThemeEverywhere() called`);
                    console.log(`🔍 Theme before: ${themeBefore}`);
                    console.log(`🔍 Args:`, args);
                    console.log(`🔍 Stack:`, stack);
                    const result = original.apply(this, args);
                    setTimeout(() => {
                        const themeAfter = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                        if (themeBefore !== themeAfter) {
                            console.log(`🔍 ⚠️ PROFILE_MANAGER.updateThemeEverywhere() CHANGED THEME!`);
                            console.log(`🔍 Before: ${themeBefore} -> After: ${themeAfter}`);
                            console.log(`🔍 Full stack:`, stack);
                        }
                    }, 100);
                    return result;
                };
            }
            // Wrap updateAllThemeUI
            if (manager.updateAllThemeUI && typeof manager.updateAllThemeUI === 'function') {
                const original = manager.updateAllThemeUI;
                manager.updateAllThemeUI = function (...args) {
                    const themeBefore = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                    const stack = new Error().stack || 'No stack trace';
                    console.log(`🔍 PROFILE_MANAGER.updateAllThemeUI() called`);
                    console.log(`🔍 Theme before: ${themeBefore}`);
                    console.log(`🔍 Args:`, args);
                    console.log(`🔍 Stack:`, stack);
                    const result = original.apply(this, args);
                    setTimeout(() => {
                        const themeAfter = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                        if (themeBefore !== themeAfter) {
                            console.log(`🔍 ⚠️ PROFILE_MANAGER.updateAllThemeUI() CHANGED THEME!`);
                            console.log(`🔍 Before: ${themeBefore} -> After: ${themeAfter}`);
                            console.log(`🔍 Full stack:`, stack);
                        }
                    }, 100);
                    return result;
                };
            }
        }
        else {
            // Retry if not available yet
            setTimeout(trackProfileManager, 500);
        }
    };
    // Track VisibilitySettingsManager methods
    const trackVisibilitySettingsManager = () => {
        const win = window;
        if (win.visibilitySettingsManager) {
            const manager = win.visibilitySettingsManager;
            // Wrap saveTheme
            if (manager.saveTheme && typeof manager.saveTheme === 'function') {
                const original = manager.saveTheme;
                manager.saveTheme = function (...args) {
                    const themeBefore = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                    const stack = new Error().stack || 'No stack trace';
                    console.log(`🔍 VISIBILITY_SETTINGS_MANAGER.saveTheme() called`);
                    console.log(`🔍 Theme before: ${themeBefore}`);
                    console.log(`🔍 Stack:`, stack);
                    const result = original.apply(this, args);
                    setTimeout(() => {
                        const themeAfter = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                        if (themeBefore !== themeAfter) {
                            console.log(`🔍 ⚠️ VISIBILITY_SETTINGS_MANAGER.saveTheme() CHANGED THEME!`);
                            console.log(`🔍 Before: ${themeBefore} -> After: ${themeAfter}`);
                            console.log(`🔍 Full stack:`, stack);
                        }
                    }, 100);
                    return result;
                };
            }
            // Wrap loadSettings
            if (manager.loadSettings && typeof manager.loadSettings === 'function') {
                const original = manager.loadSettings;
                manager.loadSettings = function (...args) {
                    const themeBefore = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                    const stack = new Error().stack || 'No stack trace';
                    console.log(`🔍 VISIBILITY_SETTINGS_MANAGER.loadSettings() called`);
                    console.log(`🔍 Theme before: ${themeBefore}`);
                    console.log(`🔍 Stack:`, stack);
                    const result = original.apply(this, args);
                    setTimeout(() => {
                        const themeAfter = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'NOT SET';
                        if (themeBefore !== themeAfter) {
                            console.log(`🔍 ⚠️ VISIBILITY_SETTINGS_MANAGER.loadSettings() CHANGED THEME!`);
                            console.log(`🔍 Before: ${themeBefore} -> After: ${themeAfter}`);
                            console.log(`🔍 Full stack:`, stack);
                        }
                    }, 100);
                    return result;
                };
            }
        }
        else {
            // Retry if not available yet
            setTimeout(trackVisibilitySettingsManager, 500);
        }
    };
    // Start tracking managers
    trackUserPreferencesManager();
    trackProfileManager();
    trackVisibilitySettingsManager();
    // Export diagnostic functions
    window.getReloadSequenceLog = () => {
        console.log('🔍 RELOAD_DIAGNOSTIC: ========================================');
        console.log('🔍 RELOAD_DIAGNOSTIC: Function Call Log (all calls)');
        console.log('🔍 RELOAD_DIAGNOSTIC: ========================================');
        functionCallLog.forEach((entry, index) => {
            console.log(`\n[${index + 1}] ${entry.timestamp}`);
            console.log(`  Function: ${entry.functionName}()`);
            console.log(`  Args:`, entry.args);
            console.log(`  Caller: ${entry.stack.split('\n')[2]?.trim() || 'unknown'}`);
        });
        console.log('🔍 RELOAD_DIAGNOSTIC: ========================================');
        return functionCallLog;
    };
    window.getThemeChangeLog = () => {
        console.log('🔍 RELOAD_DIAGNOSTIC: ========================================');
        console.log('🔍 RELOAD_DIAGNOSTIC: Theme Change Log (all changes)');
        console.log('🔍 RELOAD_DIAGNOSTIC: ========================================');
        themeChangeLog.forEach((entry, index) => {
            console.log(`\n[${index + 1}] ${entry.timestamp}`);
            console.log(`  Old: ${entry.oldValue} -> New: ${entry.newValue}`);
            console.log(`  Source: ${entry.source}`);
            console.log(`  Stack: ${entry.stack.split('\n').slice(1, 8).join('\n')}`);
        });
        console.log('🔍 RELOAD_DIAGNOSTIC: ========================================');
        return themeChangeLog;
    };
    window.getReloadSequenceSummary = () => {
        console.log('🔍 RELOAD_DIAGNOSTIC: ========================================');
        console.log('🔍 RELOAD_DIAGNOSTIC: Reload Sequence Summary');
        console.log('🔍 RELOAD_DIAGNOSTIC: ========================================');
        console.log(`Total function calls tracked: ${functionCallLog.length}`);
        console.log(`Total theme changes: ${themeChangeLog.length}`);
        console.log(`\nFunction call order:`);
        functionCallLog.forEach((entry, index) => {
            console.log(`  ${index + 1}. ${entry.functionName}()`);
        });
        console.log(`\nTheme changes:`);
        themeChangeLog.forEach((entry, index) => {
            console.log(`  ${index + 1}. ${entry.oldValue} -> ${entry.newValue} (from ${entry.source})`);
        });
        console.log('🔍 RELOAD_DIAGNOSTIC: ========================================');
        return {
            functionCalls: functionCallLog,
            themeChanges: themeChangeLog,
            summary: {
                totalFunctionCalls: functionCallLog.length,
                totalThemeChanges: themeChangeLog.length,
                functionCallOrder: functionCallLog.map(e => e.functionName),
                themeChangeSequence: themeChangeLog.map(e => `${e.oldValue} -> ${e.newValue}`)
            }
        };
    };
    console.log('✅ RELOAD_DIAGNOSTIC: Reload sequence tracking initialized');
    console.log('📋 RELOAD_DIAGNOSTIC: Call window.getReloadSequenceLog() to see all function calls');
    console.log('📋 RELOAD_DIAGNOSTIC: Call window.getThemeChangeLog() to see all theme changes');
    console.log('📋 RELOAD_DIAGNOSTIC: Call window.getReloadSequenceSummary() to see summary');
})();
