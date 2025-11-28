/**
 * ROOT CAUSE DIAGNOSTIC FRAMEWORK
 *
 * Comprehensive diagnostic system for identifying root causes of issues.
 * This framework should be used for ALL problems being worked on, regardless
 * of whether a solution is being provided.
 *
 * Usage:
 *   - Call diagnoseIssue('issueName') to run specific diagnostics
 *   - Call diagnoseAll() to run all available diagnostics
 *   - Check console for detailed diagnostic output
 */
import { getErrorBoundaryRecords } from './ErrorHandlingPolicy.js';
import { Logger } from './Logger.js';
import { API_CONFIG } from '../core/APIConfig.js';
class RootCauseDiagnosticFramework {
    constructor() {
        this.diagnostics = new Map();
        this.results = [];
        this.startTime = Date.now();
    }
    /**
     * Register a diagnostic function
     */
    register(name, diagnosticFn, description) {
        this.diagnostics.set(name, {
            fn: diagnosticFn,
            description: description || name,
            enabled: true
        });
    }
    /**
     * Run a specific diagnostic
     */
    async runDiagnostic(name) {
        const diagnostic = this.diagnostics.get(name);
        if (!diagnostic || !diagnostic.enabled) {
            console.warn(`⚠️ DIAGNOSTIC: Diagnostic "${name}" not found or disabled`);
            return null;
        }
        console.log(`🔍 DIAGNOSTIC: Running "${name}" - ${diagnostic.description}`);
        const startTime = Date.now();
        try {
            const result = await diagnostic.fn();
            const duration = Date.now() - startTime;
            this.results.push({
                name,
                description: diagnostic.description,
                result,
                duration,
                timestamp: new Date().toISOString(),
                status: result?.error ? 'failed' : 'success'
            });
            console.log(`✅ DIAGNOSTIC: "${name}" completed in ${duration}ms`);
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ DIAGNOSTIC: "${name}" failed:`, error);
            this.results.push({
                name,
                description: diagnostic.description,
                error: errorMessage,
                duration,
                timestamp: new Date().toISOString(),
                status: 'error',
                result: null
            });
            return { timestamp: new Date().toISOString(), error: errorMessage };
        }
    }
    /**
     * Run all enabled diagnostics
     */
    async runAll() {
        console.log('🔍 DIAGNOSTIC: === STARTING ROOT CAUSE DIAGNOSTICS ===');
        console.log(`🔍 DIAGNOSTIC: Running ${this.diagnostics.size} diagnostics...`);
        const results = {};
        const entries = Array.from(this.diagnostics.entries());
        for (const [name, diagnostic] of entries) {
            if (diagnostic.enabled) {
                results[name] = await this.runDiagnostic(name);
                // Small delay between diagnostics
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        const totalDuration = Date.now() - this.startTime;
        console.log(`🔍 DIAGNOSTIC: === DIAGNOSTICS COMPLETE (${totalDuration}ms) ===`);
        this.printSummary();
        return results;
    }
    /**
     * Print diagnostic summary
     */
    printSummary() {
        console.log('\n📊 DIAGNOSTIC SUMMARY:');
        console.log('═'.repeat(60));
        const successful = this.results.filter(r => r.status === 'success').length;
        const failed = this.results.filter(r => r.status === 'failed' || r.status === 'error').length;
        console.log(`✅ Successful: ${successful}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📋 Total: ${this.results.length}`);
        if (failed > 0) {
            console.log('\n❌ Failed Diagnostics:');
            this.results
                .filter(r => r.status === 'failed' || r.status === 'error')
                .forEach(r => {
                console.log(`  - ${r.name}: ${r.error || 'Unknown error'}`);
            });
        }
        console.log('═'.repeat(60));
    }
    /**
     * Get diagnostic results
     */
    getResults() {
        return this.results;
    }
    /**
     * Get results for a specific diagnostic
     */
    getResult(name) {
        return this.results.find(r => r.name === name);
    }
}
// Global instance
const diagnosticFramework = new RootCauseDiagnosticFramework();
// ============================================================================
// DIAGNOSTIC: Headline and DisplayName Persistence
// ============================================================================
diagnosticFramework.register('headline-displayname-persistence', async () => {
    const results = {
        userId: window.currentUser?.id,
        timestamp: new Date().toISOString(),
        checks: {
            chromeStorage: undefined,
            userPreferencesManager: undefined,
            database: undefined
        }
    };
    // Check 1: Chrome Storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const chromeStorage = await new Promise((resolve) => {
            chrome.storage.local.get(['settingsHeadline', 'displayName'], (result) => {
                resolve(result);
            });
        });
        if (results.checks) {
            results.checks.chromeStorage = {
                headline: chromeStorage.settingsHeadline || null,
                displayName: chromeStorage.displayName || null,
                status: chromeStorage.settingsHeadline && chromeStorage.displayName ? 'has_data' : 'missing_data'
            };
        }
    }
    else {
        if (results.checks) {
            results.checks.chromeStorage = { error: 'Chrome storage not available' };
        }
    }
    // Check 2: UserPreferencesManager
    if (window.userPreferencesManager && results.checks) {
        const headlineRaw = await window.userPreferencesManager.getPreference('headline');
        const displayNameRaw = await window.userPreferencesManager.getPreference('displayName');
        const headline = typeof headlineRaw === 'string' ? headlineRaw : null;
        const displayName = typeof displayNameRaw === 'string' ? displayNameRaw : null;
        if (results.checks) {
            results.checks.userPreferencesManager = {
                headline: headline || null,
                displayName: displayName || null,
                status: headline && displayName ? 'has_data' : 'missing_data'
            };
        }
    }
    else {
        if (results.checks) {
            results.checks.userPreferencesManager = { error: 'UserPreferencesManager not available' };
        }
    }
    // Check 3: window.currentUser
    if (results.checks) {
        const currentUser = window.currentUser;
        results.checks.currentUser = {
            headline: currentUser?.headline || null,
            displayName: currentUser?.displayName || null,
            status: currentUser?.headline && currentUser?.displayName ? 'has_data' : 'missing_data'
        };
    }
    // Check 4: Database (API)
    if (window.currentUser?.id && window.api && results.checks) {
        try {
            const apiResponseRaw = await window.api.request(`/v1/users/${window.currentUser.id}`, {
                method: 'GET'
            });
            const apiResponse = apiResponseRaw;
            if (results.checks) {
                results.checks.database = {
                    headline: (typeof apiResponse?.headline === 'string' ? apiResponse.headline : null) || null,
                    displayName: (typeof apiResponse?.displayName === 'string' ? apiResponse.displayName : null) || null,
                    status: (apiResponse?.headline || apiResponse?.displayName) ? 'has_data' : 'null_in_db'
                };
            }
        }
        catch (error) {
            if (results.checks) {
                results.checks.database = { error: error instanceof Error ? error.message : String(error) };
            }
        }
    }
    else {
        if (results.checks) {
            results.checks.database = { error: 'User ID or API not available' };
        }
    }
    // Check 5: Consistency Analysis
    const headlineSources = results.checks ? [
        results.checks.chromeStorage?.headline,
        results.checks.userPreferencesManager?.headline,
        results.checks.currentUser?.headline,
        results.checks.database?.headline
    ].filter(v => v !== null && v !== undefined) : [];
    const displayNameSources = results.checks ? [
        results.checks.chromeStorage?.displayName,
        results.checks.userPreferencesManager?.displayName,
        results.checks.currentUser?.displayName,
        results.checks.database?.displayName
    ].filter(v => v !== null && v !== undefined) : [];
    results.consistency = {
        headline: {
            uniqueValues: Array.from(new Set(headlineSources)),
            isConsistent: headlineSources.length <= 1 || new Set(headlineSources).size === 1,
            sourceCount: headlineSources.length
        },
        displayName: {
            uniqueValues: Array.from(new Set(displayNameSources)),
            isConsistent: displayNameSources.length <= 1 || new Set(displayNameSources).size === 1,
            sourceCount: displayNameSources.length
        }
    };
    // Check 6: Save Operation Test
    if (window.userPreferencesManager && window.userPreferencesManager.isInitialized) {
        try {
            const testHeadline = 'Diagnostic test headline - this should be saved to database';
            const testDisplayName = 'TestName';
            console.log('🔍 DIAGNOSTIC: Testing save operations...');
            // Test headline save
            const headlineSaveResult = await window.userPreferencesManager.savePreference('headline', testHeadline, { batch: false });
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for save
            // Verify headline was saved
            const verifyHeadlineRaw = await window.api.request(`/v1/users/${window.currentUser.id}`, { method: 'GET' });
            const verifyHeadline = verifyHeadlineRaw;
            results.saveTest = {
                headline: {
                    saveResult: headlineSaveResult,
                    savedToDB: (typeof verifyHeadline?.headline === 'string' ? verifyHeadline.headline : null) === testHeadline,
                    dbValue: typeof verifyHeadline?.headline === 'string' ? verifyHeadline.headline : undefined,
                    expectedValue: testHeadline
                }
            };
            // Test displayName save
            const displayNameSaveResult = await window.userPreferencesManager.savePreference('displayName', testDisplayName, { batch: false });
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for save
            // Verify displayName was saved
            const verifyDisplayNameRaw = await window.api.request(`/v1/users/${window.currentUser.id}`, { method: 'GET' });
            const verifyDisplayName = verifyDisplayNameRaw;
            if (!results.saveTest)
                results.saveTest = {};
            results.saveTest.displayName = {
                saveResult: displayNameSaveResult,
                savedToDB: (typeof verifyDisplayName?.displayName === 'string' ? verifyDisplayName.displayName : null) === testDisplayName,
                dbValue: typeof verifyDisplayName?.displayName === 'string' ? verifyDisplayName.displayName : undefined,
                expectedValue: testDisplayName
            };
            // Restore original values if test values were saved
            if (results.checks?.chromeStorage?.headline) {
                await window.userPreferencesManager.savePreference('headline', results.checks.chromeStorage.headline, { batch: false });
            }
            if (results.checks?.chromeStorage?.displayName) {
                await window.userPreferencesManager.savePreference('displayName', results.checks.chromeStorage.displayName, { batch: false });
            }
        }
        catch (error) {
            results.saveTest = { error: error instanceof Error ? error.message : String(error) };
        }
    }
    return results;
}, 'Headline and DisplayName persistence diagnostic');
// ============================================================================
// DIAGNOSTIC: CSS Computed Values
// ============================================================================
diagnosticFramework.register('css-computed-values', async () => {
    const results = {
        timestamp: new Date().toISOString(),
        elements: []
    };
    // Common elements to check
    const selectors = [
        '#theme-toggle',
        '#theme-toggle-slider',
        '#display-name-input',
        '#settings-headline-input',
        '.modal-content',
        '[data-theme="dark"]',
        '[data-theme="light"]',
        'body',
        'html'
    ];
    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            const computed = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            results.elements.push({
                selector: selector + (elements.length > 1 ? `[${index}]` : ''),
                exists: true,
                computed: {
                    display: computed.display,
                    visibility: computed.visibility,
                    opacity: computed.opacity,
                    color: computed.color,
                    backgroundColor: computed.backgroundColor,
                    width: computed.width,
                    height: computed.height,
                    margin: computed.margin,
                    padding: computed.padding,
                    border: computed.border,
                    position: computed.position,
                    zIndex: computed.zIndex,
                    fontSize: computed.fontSize,
                    fontWeight: computed.fontWeight
                },
                boundingRect: {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    left: rect.left,
                    right: rect.right,
                    bottom: rect.bottom
                },
                attributes: {
                    dataTheme: element.getAttribute('data-theme'),
                    className: element.className,
                    id: element.id
                }
            });
        });
        if (elements.length === 0) {
            results.elements.push({
                selector,
                exists: false
            });
        }
    }
    return results;
}, 'CSS computed values diagnostic');
// ============================================================================
// DIAGNOSTIC: Network Requests
// ============================================================================
diagnosticFramework.register('network-requests', async () => {
    const results = {
        timestamp: new Date().toISOString(),
        requests: []
    };
    // Check if Performance API is available
    if (window.performance && window.performance.getEntriesByType) {
        const networkEntries = window.performance.getEntriesByType('resource');
        // Filter for API requests
        const apiRequests = networkEntries.filter(entry => entry.name.includes('/v1/users/') ||
            entry.name.includes('/v1/') ||
            entry.initiatorType === 'fetch' ||
            entry.initiatorType === 'xmlhttprequest');
        results.requests = apiRequests.slice(-20).map(entry => ({
            url: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
            type: entry.initiatorType,
            startTime: entry.startTime,
            responseEnd: entry.responseEnd
        }));
    }
    return results;
}, 'Network requests diagnostic');
// ============================================================================
// DIAGNOSTIC: UserPreferencesManager State
// ============================================================================
diagnosticFramework.register('user-preferences-manager-state', async () => {
    const results = {
        timestamp: new Date().toISOString(),
        available: !!window.userPreferencesManager,
        state: null
    };
    if (window.userPreferencesManager) {
        const manager = window.userPreferencesManager;
        const managerState = {
            isInitialized: manager.isInitialized,
            userId: manager.userId,
            isOnline: manager.isOnline,
            preferences: { ...(manager.preferences || {}) },
            metrics: manager.getMetrics ? manager.getMetrics() : undefined,
            batchQueueSize: manager.batchQueue ? manager.batchQueue.length : 0,
            retryQueueSize: manager.retryQueue ? manager.retryQueue.length : 0
        };
        results.state = managerState;
    }
    return results;
}, 'UserPreferencesManager state diagnostic');
// ============================================================================
// DIAGNOSTIC: Active community state alignment
// ============================================================================
diagnosticFramework.register('active-community-state-alignment', async () => {
    const timestamp = new Date().toISOString();
    const issues = [];
    const recommendations = [];
    const toStringArray = (value) => {
        if (Array.isArray(value)) {
            return value.filter((item) => typeof item === 'string');
        }
        return [];
    };
    const readStateArray = async (path) => {
        try {
            if (window.stateManagerInstance && typeof window.stateManagerInstance.getState === 'function') {
                const value = window.stateManagerInstance.getState(path);
                return toStringArray(value);
            }
            if (window.stateManager && typeof window.stateManager.get === 'function') {
                const value = await window.stateManager.get(path);
                return toStringArray(value);
            }
        }
        catch (error) {
            issues.push(`Error reading ${path}: ${error instanceof Error ? error.message : String(error)}`);
        }
        return [];
    };
    const uiActiveCommunities = await readStateArray('ui.activeCommunities');
    const legacyActiveCommunities = await readStateArray('activeCommunities');
    const windowActiveCommunities = toStringArray(window.activeCommunities);
    const windowGetStateCommunities = toStringArray(typeof window.getState === 'function' ? window.getState('ui.activeCommunities') : undefined);
    const arraysMatch = (a, b) => {
        if (a.length !== b.length) {
            return false;
        }
        const setA = new Set(a);
        return b.every(item => setA.has(item));
    };
    if (uiActiveCommunities.length === 0) {
        issues.push('ui.activeCommunities is empty – chat/history fetches will fail.');
        recommendations.push('Ensure CommunityLoaders seeds ui.activeCommunities before calling loadChatHistory.');
    }
    if (!arraysMatch(uiActiveCommunities, legacyActiveCommunities)) {
        issues.push('Legacy activeCommunities array diverges from ui.activeCommunities.');
        recommendations.push('Use a shared helper to write both ui.activeCommunities and the legacy key in lockstep.');
    }
    if (!arraysMatch(uiActiveCommunities, windowActiveCommunities)) {
        issues.push('window.activeCommunities does not reflect the StateManager ui path.');
        recommendations.push('Hydrate window.activeCommunities whenever the state changes so VisibilityManager stays in sync.');
    }
    if (windowGetStateCommunities.length === 0 && typeof window.getState !== 'function') {
        issues.push('window.getState is unavailable, so diagnostics/tests cannot read ui.activeCommunities.');
        recommendations.push('Expose getState/setState on window alongside stateManagerInstance.');
    }
    if (issues.length === 0) {
        recommendations.push('Active community state is consistent across all surfaces.');
    }
    return {
        timestamp,
        uiActiveCommunities,
        legacyActiveCommunities,
        windowActiveCommunities,
        windowGetStateCommunities,
        issues,
        recommendations
    };
}, 'Ensures active community selections stay consistent across StateManager and window globals');
diagnosticFramework.register('load-history-registration', async () => {
    const timestamp = new Date().toISOString();
    const issues = [];
    const recommendations = [];
    const win = window;
    const loadChatHistoryAvailable = typeof win.loadChatHistory === 'function';
    const stateManagerAvailable = typeof win.stateManagerInstance?.getState === 'function';
    if (!loadChatHistoryAvailable) {
        issues.push('window.loadChatHistory is not registered; LoadChatHistoryVerifier will fail.');
        recommendations.push('Ensure MessagesModule exports loadChatHistory to window during initialization.');
    }
    if (!stateManagerAvailable) {
        issues.push('stateManagerInstance is unavailable or missing getState().');
        recommendations.push('Initialize StateManager before bootstrapping messaging modules.');
    }
    const activeCommunityCount = (() => {
        if (stateManagerAvailable) {
            const uiCommunities = win.stateManagerInstance.getState('ui.activeCommunities');
            if (Array.isArray(uiCommunities)) {
                return uiCommunities.length;
            }
        }
        if (Array.isArray(win.activeCommunities)) {
            return win.activeCommunities.length;
        }
        return 0;
    })();
    if (activeCommunityCount === 0) {
        issues.push('No active communities detected; loadChatHistory will exit early.');
        recommendations.push('Seed ui.activeCommunities before invoking loadChatHistory (CommunityLoaders).');
    }
    if (issues.length === 0) {
        recommendations.push('loadChatHistory is registered and prerequisites satisfied.');
    }
    return {
        timestamp,
        loadChatHistoryAvailable,
        stateManagerAvailable,
        activeCommunityCount,
        issues,
        recommendations
    };
}, 'Confirms loadChatHistory is bound to window and prerequisites (state manager + communities) are ready');
// ============================================================================
// DIAGNOSTIC: Theme Application
// ============================================================================
diagnosticFramework.register('theme-application', async () => {
    const results = {
        timestamp: new Date().toISOString(),
        theme: {
            dataAttributes: undefined,
            computedStyles: undefined,
            userPreferencesManager: undefined,
            currentUser: undefined,
            database: undefined,
            toggleState: undefined
        }
    };
    // Check data-theme attributes
    if (results.theme) {
        results.theme.dataAttributes = {
            body: document.body.getAttribute('data-theme'),
            html: document.documentElement.getAttribute('data-theme')
        };
        // Check computed styles
        const bodyComputed = window.getComputedStyle(document.body);
        const htmlComputed = window.getComputedStyle(document.documentElement);
        results.theme.computedStyles = {
            body: {
                backgroundColor: bodyComputed.backgroundColor,
                color: bodyComputed.color
            },
            html: {
                backgroundColor: htmlComputed.backgroundColor,
                color: htmlComputed.color
            }
        };
    }
    // Check Chrome storage
    if (results.theme && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const chromeTheme = await new Promise((resolve) => {
            chrome.storage.local.get(['theme'], (result) => {
                resolve(result);
            });
        });
        results.theme.chromeStorage = chromeTheme.theme || null;
    }
    // Check UserPreferencesManager
    if (results.theme && window.userPreferencesManager) {
        const managerThemeRaw = await window.userPreferencesManager.getPreference('theme');
        const managerTheme = typeof managerThemeRaw === 'string' ? managerThemeRaw : null;
        results.theme.userPreferencesManager = managerTheme || null;
    }
    // Check window.currentUser
    if (results.theme) {
        const currentUser = window.currentUser;
        results.theme.currentUser = (currentUser && typeof currentUser.theme === 'string' ? currentUser.theme : null) || null;
    }
    // Check database
    if (results.theme && window.currentUser?.id && window.api) {
        try {
            const apiResponseRaw = await window.api.request(`/v1/users/${window.currentUser.id}`, { method: 'GET' });
            const apiResponse = apiResponseRaw;
            results.theme.database = (typeof apiResponse?.theme === 'string' ? apiResponse.theme : null) || null;
        }
        catch (error) {
            if (results.theme) {
                results.theme.database = null;
            }
            if (!results.errors)
                results.errors = [];
            results.errors.push({
                type: 'theme_database_check',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    // Check theme toggle state
    if (results.theme) {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            results.theme.toggleState = {
                checked: themeToggle.checked,
                exists: true
            };
        }
        else {
            results.theme.toggleState = { exists: false };
        }
    }
    return results;
}, 'Theme application diagnostic');
// ============================================================================
// DIAGNOSTIC: User Hover currentUser alignment
// ============================================================================
diagnosticFramework.register('user-hover-current-user', async () => {
    const timestamp = new Date().toISOString();
    const stateManagerUser = typeof window.stateManagerInstance?.getState === 'function'
        ? window.stateManagerInstance.getState('currentUser')
        : null;
    const modalInstance = window.userHoverModal;
    const viewerUserId = typeof modalInstance?.getViewerUserId === 'function'
        ? modalInstance.getViewerUserId()
        : null;
    const result = {
        timestamp,
        windowCurrentUserId: typeof window.currentUser?.id === 'string' ? window.currentUser.id : null,
        stateManagerCurrentUserId: typeof stateManagerUser?.id === 'string' ? stateManagerUser.id : null,
        windowHasCurrentUser: Boolean(window.currentUser?.id),
        stateManagerHasCurrentUser: Boolean(stateManagerUser?.id),
        userHoverModal: {
            exists: Boolean(modalInstance),
            hasInitialize: typeof modalInstance?.initialize === 'function',
            viewerUserId,
            domAttached: typeof document !== 'undefined' ? Boolean(document.getElementById('user-hover-modal')) : false
        },
        issues: []
    };
    if (!result.windowHasCurrentUser) {
        result.issues.push('window.currentUser missing or missing id');
    }
    if (!result.stateManagerHasCurrentUser) {
        result.issues.push('stateManagerInstance currentUser missing or missing id');
    }
    if (result.windowHasCurrentUser && result.stateManagerHasCurrentUser && result.windowCurrentUserId !== result.stateManagerCurrentUserId) {
        result.issues.push('window.currentUser.id does not match stateManagerInstance currentUser id');
    }
    if (result.userHoverModal?.viewerUserId && result.stateManagerCurrentUserId && result.userHoverModal.viewerUserId !== result.stateManagerCurrentUserId) {
        result.issues.push('UserHoverModal cached viewer id out of sync with stateManagerInstance currentUser');
    }
    if (!result.userHoverModal?.exists) {
        result.issues.push('UserHoverModal instance missing from window');
    }
    return result;
}, 'Verifies UserHoverModal viewer ID stays aligned with global/current state');
// ============================================================================
// DIAGNOSTIC: Load Chat History Connectivity
// ============================================================================
diagnosticFramework.register('backend-connectivity', async () => {
    const timestamp = new Date().toISOString();
    const issues = [];
    const checks = [];
    const resolvedBase = (typeof window !== 'undefined' && window.API_BASE_URL)
        || API_CONFIG.baseUrl;
    const baseUrl = resolvedBase.replace(/\/$/, '');
    const fallbackUrlCandidate = API_CONFIG.fallbackUrl?.replace(/\/$/, '');
    const fallbackUrl = fallbackUrlCandidate && fallbackUrlCandidate !== baseUrl ? fallbackUrlCandidate : undefined;
    const runCheck = async (url) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                cache: 'no-store',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const latency = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start);
            if (!response.ok) {
                return { status: 'failed', latencyMs: latency, error: `HTTP ${response.status}`, note: response.statusText };
            }
            return { status: 'success', latencyMs: latency };
        }
        catch (error) {
            clearTimeout(timeoutId);
            return { status: 'failed', error: error instanceof Error ? error.message : String(error) };
        }
    };
    const baseCheck = await runCheck(baseUrl);
    checks.push({ url: baseUrl, ...baseCheck });
    if (baseCheck.status === 'failed') {
        issues.push(`Primary API host unreachable: ${baseCheck.error || 'unknown error'}`);
    }
    if (fallbackUrl) {
        const fallbackCheck = await runCheck(fallbackUrl);
        checks.push({ url: fallbackUrl, ...fallbackCheck });
        if (fallbackCheck.status === 'failed') {
            issues.push(`Fallback API host unreachable: ${fallbackCheck.error || 'unknown error'}`);
        }
    }
    return {
        timestamp,
        baseUrl,
        fallbackUrl,
        checks,
        issues
    };
}, 'Validates connectivity to the configured API base URL and fallback host');
diagnosticFramework.register('load-chat-history-connectivity', async () => {
    const timestamp = new Date().toISOString();
    const issues = [];
    // Get API base URL
    const apiBaseURL = typeof window !== 'undefined' && window.API_BASE_URL
        ? window.API_BASE_URL
        : (typeof window !== 'undefined' && window.stateManagerInstance?.getState
            ? window.stateManagerInstance.getState('api')?.baseURL
            : null) || API_CONFIG.baseUrl;
    // Get backend health service state
    const backendHealth = typeof window !== 'undefined' && window.backendHealthService
        ? window.backendHealthService.getState()
        : (typeof window !== 'undefined' && window.stateManagerInstance?.getState
            ? window.stateManagerInstance.getState('system.backendHealth')
            : null);
    const result = {
        timestamp,
        apiBaseURL,
        backendHealth: backendHealth ? {
            status: backendHealth.status,
            lastChecked: backendHealth.lastChecked,
            lastError: backendHealth.lastError,
            retryDelayMs: backendHealth.retryDelayMs,
            consecutiveFailures: backendHealth.consecutiveFailures
        } : null,
        connectivityChecks: {},
        issues: []
    };
    // Check base URL connectivity
    try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(apiBaseURL, {
            method: 'HEAD',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        result.connectivityChecks.baseURL = {
            success: response.ok || response.status === 404 || response.status === 405,
            status: response.status,
            duration
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.connectivityChecks.baseURL = {
            success: false,
            error: errorMessage
        };
        issues.push(`Base URL unreachable: ${errorMessage}`);
    }
    // Check messages endpoint
    const currentUrlData = typeof window !== 'undefined' && window.stateManagerInstance?.getState
        ? window.stateManagerInstance.getState('currentUrlData')
        : null;
    const pageId = currentUrlData?.pageId || 'test-page';
    try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const messagesUrl = `${apiBaseURL}/api/messages?pageId=${encodeURIComponent(pageId)}&limit=1`;
        const response = await fetch(messagesUrl, {
            method: 'GET',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        result.connectivityChecks.messagesEndpoint = {
            success: response.ok || response.status === 404,
            status: response.status,
            duration
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.connectivityChecks.messagesEndpoint = {
            success: false,
            error: errorMessage
        };
        issues.push(`Messages endpoint unreachable: ${errorMessage}`);
    }
    // Check users endpoint
    const currentUser = typeof window !== 'undefined' && window.currentUser
        ? window.currentUser
        : (typeof window !== 'undefined' && window.stateManagerInstance?.getState
            ? window.stateManagerInstance.getState('currentUser')
            : null);
    const userId = currentUser?.id;
    if (userId) {
        try {
            const startTime = Date.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const usersUrl = `${apiBaseURL}/v1/users/${encodeURIComponent(userId)}`;
            const response = await fetch(usersUrl, {
                method: 'GET',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const duration = Date.now() - startTime;
            result.connectivityChecks.usersEndpoint = {
                success: response.ok || response.status === 404,
                status: response.status,
                duration
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            result.connectivityChecks.usersEndpoint = {
                success: false,
                error: errorMessage
            };
            issues.push(`Users endpoint unreachable: ${errorMessage}`);
        }
    }
    else {
        issues.push('No current user ID available for users endpoint check');
    }
    // Analyze health state
    if (backendHealth) {
        if (backendHealth.status === 'offline') {
            issues.push(`Backend health status: ${backendHealth.status} (${backendHealth.consecutiveFailures} consecutive failures)`);
        }
        if (backendHealth.lastError) {
            issues.push(`Last backend error: ${backendHealth.lastError}`);
        }
    }
    else {
        issues.push('BackendHealthService not initialized');
    }
    // Check if all connectivity checks failed
    const allFailed = Object.values(result.connectivityChecks).every(check => check && !check.success);
    if (allFailed) {
        issues.push('All connectivity checks failed - backend appears offline');
    }
    result.issues = issues;
    return result;
}, 'Verifies backend connectivity for loadChatHistory and identifies connection issues');
// ============================================================================
// DIAGNOSTIC: Preferences Column Status
// ============================================================================
diagnosticFramework.register('preferences-column-status', async () => {
    const results = {
        timestamp: new Date().toISOString(),
        migration: {},
        schema: {}
    };
    // Check if preferences column still exists (via API response)
    if (window.currentUser?.id && window.api) {
        try {
            const apiResponseRaw = await window.api.request(`/v1/users/${window.currentUser.id}`, { method: 'GET' });
            const apiResponse = apiResponseRaw;
            results.migration = {
                preferencesInResponse: apiResponse ? 'preferences' in apiResponse : false,
                preferencesValue: apiResponse?.preferences || null,
                hasNewColumns: {
                    theme: apiResponse ? 'theme' in apiResponse : false,
                    headline: apiResponse ? 'headline' in apiResponse : false,
                    displayName: apiResponse ? ('displayName' in apiResponse || 'display_name' in apiResponse) : false,
                    auraIntensity: apiResponse ? ('auraIntensity' in apiResponse || 'aura_intensity' in apiResponse) : false
                }
            };
        }
        catch (error) {
            results.migration = { error: error instanceof Error ? error.message : String(error) };
        }
    }
    // Check Prisma schema (if accessible)
    results.schema = {
        note: 'Prisma schema check requires server-side access',
        recommendation: 'Check prisma/schema.prisma to verify preferences field is removed'
    };
    return results;
}, 'Preferences column migration status diagnostic');
// ============================================================================
// DIAGNOSTIC: API Request/Response Analysis
// ============================================================================
diagnosticFramework.register('api-request-response', async () => {
    const results = {
        timestamp: new Date().toISOString(),
        recentRequests: [],
        errors: []
    };
    // Monitor fetch requests (if possible)
    if (window.api && window.currentUser?.id) {
        try {
            // Test a user update request
            const testRequest = {
                url: `/v1/users/${window.currentUser.id}`,
                method: 'PATCH',
                body: { displayName: 'TEST_DIAGNOSTIC' }
            };
            const startTime = Date.now();
            const response = await window.api.request(testRequest.url, {
                method: testRequest.method,
                body: JSON.stringify(testRequest.body)
            });
            const duration = Date.now() - startTime;
            if (results.recentRequests) {
                results.recentRequests.push({
                    ...testRequest,
                    duration,
                    success: !!response,
                    response: response ? 'received' : 'no response'
                });
            }
            // Restore original value
            if (window.userPreferencesManager) {
                const original = await window.userPreferencesManager.getPreference('displayName');
                if (original) {
                    await window.userPreferencesManager.savePreference('displayName', original, { batch: false });
                }
            }
        }
        catch (error) {
            if (results.errors) {
                results.errors.push({
                    type: 'test_request',
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined
                });
            }
        }
    }
    return results;
}, 'API request/response analysis diagnostic');
// ============================================================================
// DIAGNOSTIC: Sidepanel Settings Injections
// ============================================================================
diagnosticFramework.register('sidepanel-settings-injections', async () => {
    const moduleGraph = window.__CANOPI_MODULE_GRAPH__;
    const notes = [];
    const result = {
        timestamp: new Date().toISOString(),
        windowFlags: {
            hasModuleGraph: Boolean(moduleGraph),
            moduleGraphKeys: moduleGraph ? Object.keys(moduleGraph) : [],
            isSidepanelReady: Boolean(window.__CANOPI_SIDEPANEL_READY__),
            disableLegacyFlag: Boolean(window.__DISABLE_LEGACY_SIDEPANEL__)
        },
        storageContracts: {
            hasUserPreferencesManager: Boolean(window.userPreferencesManager),
            isUserPreferencesInitialized: Boolean(window.userPreferencesManager?.isInitialized),
            hasUnifiedSettingsStorage: Boolean(window.unifiedSettingsStorage?.getSetting),
            hasSaveSetting: typeof window.saveSetting === 'function',
            hasGetSetting: typeof window.getSetting === 'function'
        },
        managers: {
            displayNameManager: {
                registered: Boolean(window.displayNameManager),
                hasInitialize: typeof window.displayNameManager?.initialize === 'function'
            },
            settingsHeadlineManager: {
                registered: Boolean(window.settingsHeadlineManager),
                hasInitialize: typeof window.settingsHeadlineManager?.initialize === 'function'
            }
        },
        notes
    };
    if (!result.storageContracts.hasUserPreferencesManager) {
        notes.push('UserPreferencesManager not found on window');
    }
    else if (!result.storageContracts.isUserPreferencesInitialized) {
        notes.push('UserPreferencesManager present but not initialized');
    }
    if (!result.storageContracts.hasUnifiedSettingsStorage) {
        notes.push('window.unifiedSettingsStorage.getSetting missing');
    }
    if (!result.storageContracts.hasSaveSetting || !result.storageContracts.hasGetSetting) {
        notes.push('window.getSetting/saveSetting helpers unavailable');
    }
    if (!result.managers.displayNameManager.registered || !result.managers.settingsHeadlineManager.registered) {
        notes.push('DisplayNameManager or SettingsHeadlineManager was not registered via helper');
    }
    if (!result.windowFlags.hasModuleGraph) {
        notes.push('Module graph not exposed to window.__CANOPI_MODULE_GRAPH__');
    }
    return result;
}, 'Validates window injections, storage contracts, and manager registration for Slice E');
// ============================================================================
// DIAGNOSTIC: Realtime Presence Typing
// ============================================================================
diagnosticFramework.register('realtime-presence-typing', async () => {
    const result = {
        timestamp: new Date().toISOString(),
        hasClient: typeof window.supabaseRealtimeClient?.getPageUsers === 'function',
        pageId: null,
        sampleCount: 0,
        issues: []
    };
    const realtimeClient = window.supabaseRealtimeClient;
    if (!realtimeClient || typeof realtimeClient.getPageUsers !== 'function') {
        result.issues.push('supabaseRealtimeClient.getPageUsers not available on window');
        return result;
    }
    const currentPageId = window.currentUrlData?.pageId ||
        (typeof window.currentUrlData?.rawUrl === 'string' ? window.currentUrlData?.rawUrl : null) ||
        null;
    result.pageId = currentPageId;
    if (!currentPageId) {
        result.issues.push('No pageId detected via window.currentUrlData');
        return result;
    }
    try {
        const users = await realtimeClient.getPageUsers(currentPageId);
        if (!Array.isArray(users)) {
            result.issues.push('getPageUsers returned a non-array payload');
            return result;
        }
        result.sampleCount = users.length;
        result.samples = users.slice(0, 3).map((user) => ({
            id: user.id ?? '',
            email: user.email ?? '',
            isActive: user.isActive ?? false,
            auraColor: user.auraColor ?? '#ffffff',
            keys: Object.keys(user ?? {})
        }));
        const snakeCaseKeys = ['user_email', 'user_id', 'aura_color', 'avatar_url', 'enter_time', 'last_seen'];
        if (result.samples.length === 0) {
            result.issues.push('getPageUsers returned empty array');
        }
        else {
            result.samples.forEach((sample, index) => {
                if (!sample.id) {
                    result.issues.push(`Sample[${index}] missing camelCase "id"`);
                }
                if (!sample.email) {
                    result.issues.push(`Sample[${index}] missing camelCase "email"`);
                }
                if (snakeCaseKeys.some((key) => sample.keys.includes(key))) {
                    result.issues.push(`Sample[${index}] contains snake_case keys: ${sample.keys.filter((key) => snakeCaseKeys.includes(key)).join(', ')}`);
                }
            });
        }
    }
    catch (error) {
        result.issues.push(`Error executing realtime-presence-typing diagnostic: ${error instanceof Error ? error.message : String(error)}`);
    }
    return result;
}, 'Ensures SupabaseRealtimeClientFix emits VisibilityUser arrays without snake_case duplicates');
// ============================================================================
// DIAGNOSTIC: Profile Logging Firehose (Slice 5)
// ============================================================================
diagnosticFramework.register('profile-logging-firehose', async () => {
    const timestamp = new Date().toISOString();
    const environment = Logger.isProductionMode()
        ? 'production'
        : (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' ? 'development' : 'unknown');
    const history = Logger.getHistory('DEBUG', 'PROFILE');
    const sd1BurstLogCount = history.filter(entry => entry.message.includes('SD1 PROFILE DEBUG')).length;
    const warnings = [];
    const debugGuardEnabled = typeof Logger.isDebugEnabled === 'function' ? Logger.isDebugEnabled('profile') : !Logger.isProductionMode();
    if (Logger.isProductionMode() && sd1BurstLogCount > 0) {
        warnings.push('Production build should not emit SD1 PROFILE DEBUG logs.');
    }
    if (!Logger.isProductionMode() && sd1BurstLogCount > 4) {
        warnings.push('ProfileManager is still emitting more than 4 SD1 PROFILE DEBUG logs per update.');
    }
    const recentMessages = history.slice(-5).map(entry => entry.message);
    return {
        timestamp,
        environment,
        loggerLevel: String(Logger.currentLevel ?? ''),
        profileDebugLogCount: history.length,
        sd1BurstLogCount,
        debugGuardEnabled,
        recentMessages,
        warnings: warnings.length ? warnings : undefined
    };
}, 'Counts ProfileManager SD1 debug bursts and verifies guard configuration');
// ============================================================================
// DIAGNOSTIC: Slice 8 Error Handling Consistency
// ============================================================================
diagnosticFramework.register('slice8-error-handling-consistency', async () => {
    const timestamp = new Date().toISOString();
    const records = getErrorBoundaryRecords();
    const requiredBoundaries = [
        { component: 'MessagesModule', operation: 'initializeMessageSystem', severity: 'fatal' },
        { component: 'MessagesModule', operation: 'loadChatHistory', severity: 'fatal' },
        { component: 'MessagesModule', operation: 'sendChatMessage', severity: 'recoverable' },
        { component: 'RealtimeManager', operation: 'initializeSupabaseRealtimeClient', severity: 'fatal' },
        { component: 'RealtimeManager', operation: 'sendPresenceEvent', severity: 'recoverable' },
        { component: 'SupabaseService', operation: 'initialize', severity: 'fatal' },
        { component: 'SupabaseService', operation: 'getPageUsers', severity: 'recoverable' }
    ];
    const latestByKey = new Map();
    records.forEach(record => {
        if (!record.component || !record.operation) {
            return;
        }
        const key = `${record.component}:${record.operation}`;
        const existing = latestByKey.get(key);
        const existingTimestamp = existing?.timestamp ? Date.parse(existing.timestamp) : 0;
        const incomingTimestamp = record.timestamp ? Date.parse(record.timestamp) : 0;
        if (!existing || incomingTimestamp >= existingTimestamp) {
            latestByKey.set(key, record);
        }
    });
    const missingBoundaries = requiredBoundaries
        .filter(req => !latestByKey.has(`${req.component}:${req.operation}`))
        .map(req => ({ ...req, status: 'missing' }));
    const severityMismatches = [];
    const fatalWithoutRethrow = [];
    const recoverableRethrow = [];
    latestByKey.forEach((record, key) => {
        const [component, operation] = key.split(':');
        const expected = requiredBoundaries.find(req => req.component === component && req.operation === operation);
        if (expected && record.severity && record.severity !== expected.severity) {
            severityMismatches.push({
                component,
                operation,
                expectedSeverity: expected.severity,
                actualSeverity: record.severity
            });
        }
        if ((record.severity === 'fatal' || expected?.severity === 'fatal') && record.success === false && record.rethrown === false) {
            fatalWithoutRethrow.push({ component, operation, recordedSeverity: record.severity });
        }
        if ((record.severity === 'recoverable' || expected?.severity === 'recoverable') && record.rethrown) {
            recoverableRethrow.push({ component, operation });
        }
    });
    return {
        timestamp,
        totalRecordedBoundaries: records.length,
        requiredBoundaryCount: requiredBoundaries.length,
        latestObservedBoundaries: Array.from(latestByKey.entries()).map(([key, record]) => ({
            key,
            severity: record.severity,
            success: record.success,
            rethrown: record.rethrown,
            timestamp: record.timestamp
        })),
        missingBoundaries: missingBoundaries.length ? missingBoundaries : undefined,
        severityMismatches: severityMismatches.length ? severityMismatches : undefined,
        fatalWithoutRethrow: fatalWithoutRethrow.length ? fatalWithoutRethrow : undefined,
        recoverableRethrow: recoverableRethrow.length ? recoverableRethrow : undefined,
        sampleRecentRecords: records.slice(-10)
    };
}, 'Validates that slice 8 modules register error boundaries and respect severity/rethrow contracts');
// ============================================================================
// GLOBAL FUNCTIONS
// ============================================================================
/**
 * Run all diagnostics
 */
export async function diagnoseAll() {
    const results = await diagnosticFramework.runAll();
    // Filter out null results
    const filtered = {};
    for (const [key, value] of Object.entries(results)) {
        if (value !== null) {
            filtered[key] = value;
        }
    }
    return filtered;
}
/**
 * Run a specific diagnostic
 */
export async function diagnoseIssue(issueName) {
    return await diagnosticFramework.runDiagnostic(issueName);
}
/**
 * Get diagnostic results
 */
export function getDiagnosticResults() {
    return diagnosticFramework.getResults();
}
// Export framework instance
export { diagnosticFramework };
// Export to window for backward compatibility
if (typeof window !== 'undefined') {
    window.diagnoseAll = diagnoseAll;
    window.diagnoseIssue = diagnoseIssue;
    window.getDiagnosticResults = getDiagnosticResults;
    // Type assertion needed due to intersection type requirement from window type definition
    window.diagnosticFramework = diagnosticFramework;
    console.log('✅ ROOT_CAUSE_DIAGNOSTIC: Framework loaded');
    console.log('   Usage: diagnoseAll() or diagnoseIssue("diagnostic-name")');
}
//# sourceMappingURL=ROOT_CAUSE_DIAGNOSTIC_FRAMEWORK.js.map