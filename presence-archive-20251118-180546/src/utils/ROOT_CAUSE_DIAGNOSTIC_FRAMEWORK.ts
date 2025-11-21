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

import type {
  DiagnosticResult,
  HeadlineDisplayNameDiagnosticResult,
  CssComputedValuesDiagnosticResult,
  NetworkRequestsDiagnosticResult,
  UserPreferencesManagerDiagnosticResult,
  UserPreferencesManagerState,
  ThemeDiagnosticResult,
  PreferencesColumnStatusResult,
  ApiRequestResponseResult
} from './diagnostics/diagnostic-result-types';

// Type definitions
type DiagnosticFunction = () => Promise<DiagnosticResult>;
type DiagnosticStatus = 'success' | 'failed' | 'error';

interface DiagnosticEntry {
  fn: DiagnosticFunction;
  description: string;
  enabled: boolean;
}

interface DiagnosticRunResult {
  name: string;
  description: string;
  result: DiagnosticResult | null;
  duration: number;
  timestamp: string;
  status: DiagnosticStatus;
  error?: string;
}

type WindowWithDiagnostics = Window & {
  currentUser?: {
    id?: string;
    headline?: string;
    displayName?: string;
    theme?: string;
  };
  api?: {
    request: (url: string, options?: { method: string; body?: string }) => Promise<Record<string, unknown>>;
    getChatHistory?: (communityId: string, conversationId: string | null, uri: string) => Promise<{ conversations?: unknown[]; messages?: unknown[] }>;
  };
  userPreferencesManager?: {
    isInitialized: boolean;
    getPreference: (key: string) => Promise<unknown>;
    savePreference: (key: string, value: unknown, options?: { batch: boolean }) => Promise<unknown>;
  };
  supabase?: {
    from: (table: string) => {
      select: (...args: unknown[]) => {
        eq: (column: string, value: unknown) => unknown;
        is: (column: string, value: unknown) => unknown;
        limit: (count: number) => Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      };
    };
  };
  normalizeUrl?: (url: string) => Promise<{ normalizedUrl: string; pageId: string }>;
  normalizeCurrentUrl?: () => Promise<{ normalizedUrl?: string; pageId?: string; rawUrl?: string }>;
  currentUrlData?: { normalizedUrl?: string; pageId?: string; rawUrl?: string };
  stateManager?: {
    get: (key: string) => Promise<unknown>;
  };
  supabaseRealtimeClient?: {
    getPageUsers: (pageId: string) => Promise<Array<Record<string, unknown>>>;
  };
  visibilityModalHandler?: {
    isInitialized: boolean;
    checkVisibility: () => Promise<boolean>;
  };
  API_BASE_URL?: string;
  ProfileManager?: {
    getTheme?: () => string | null;
  };
  UserPreferencesManager?: {
    getTheme?: () => string | null;
  };
  activeCommunities?: string[];
  currentChatData?: Array<Record<string, unknown>> | Record<string, unknown>;
  currentVisibilityData?: Array<Record<string, unknown>>;
  currentVisibilityDataUnfiltered?: Record<string, unknown>;
  diagnoseAll?: () => Promise<Record<string, DiagnosticResult>>;
  diagnoseIssue?: (issueName: string) => Promise<DiagnosticResult | null>;
  getDiagnosticResults?: () => DiagnosticRunResult[];
  diagnosticFramework?: RootCauseDiagnosticFramework;
}

declare const window: WindowWithDiagnostics;

class RootCauseDiagnosticFramework {
  private diagnostics: Map<string, DiagnosticEntry>;
  private results: DiagnosticRunResult[];
  private startTime: number;

  constructor() {
    this.diagnostics = new Map();
    this.results = [];
    this.startTime = Date.now();
  }

  /**
   * Register a diagnostic function
   */
  register(name: string, diagnosticFn: DiagnosticFunction, description?: string): void {
    this.diagnostics.set(name, {
      fn: diagnosticFn,
      description: description || name,
      enabled: true
    });
  }

  /**
   * Run a specific diagnostic
   */
  async runDiagnostic(name: string): Promise<DiagnosticResult | null> {
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
    } catch (error) {
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
      
      return { timestamp: new Date().toISOString(), error: errorMessage } as DiagnosticResult;
    }
  }

  /**
   * Run all enabled diagnostics
   */
  async runAll(): Promise<Record<string, DiagnosticResult | null>> {
    console.log('🔍 DIAGNOSTIC: === STARTING ROOT CAUSE DIAGNOSTICS ===');
    console.log(`🔍 DIAGNOSTIC: Running ${this.diagnostics.size} diagnostics...`);
    
    const results: Record<string, DiagnosticResult | null> = {};
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
  printSummary(): void {
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
  getResults(): DiagnosticRunResult[] {
    return this.results;
  }

  /**
   * Get results for a specific diagnostic
   */
  getResult(name: string): DiagnosticRunResult | undefined {
    return this.results.find(r => r.name === name);
  }
}

// Global instance
const diagnosticFramework = new RootCauseDiagnosticFramework();

// ============================================================================
// DIAGNOSTIC: Headline and DisplayName Persistence
// ============================================================================

diagnosticFramework.register('headline-displayname-persistence', async (): Promise<HeadlineDisplayNameDiagnosticResult> => {
  const results: HeadlineDisplayNameDiagnosticResult = {
    userId: window.currentUser?.id,
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // Check 1: Chrome Storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const chromeStorage = await new Promise<{ settingsHeadline?: string; displayName?: string }>((resolve) => {
      chrome.storage.local.get(['settingsHeadline', 'displayName'], (result) => {
        resolve(result as { settingsHeadline?: string; displayName?: string });
      });
    });
    
    results.checks.chromeStorage = {
      headline: chromeStorage.settingsHeadline || null,
      displayName: chromeStorage.displayName || null,
      status: chromeStorage.settingsHeadline && chromeStorage.displayName ? 'has_data' : 'missing_data'
    };
  } else {
    results.checks.chromeStorage = { error: 'Chrome storage not available' };
  }

  // Check 2: UserPreferencesManager
  if (window.userPreferencesManager) {
    const headlineRaw = await window.userPreferencesManager.getPreference('headline');
    const displayNameRaw = await window.userPreferencesManager.getPreference('displayName');
    const headline = typeof headlineRaw === 'string' ? headlineRaw : null;
    const displayName = typeof displayNameRaw === 'string' ? displayNameRaw : null;
    results.checks.userPreferencesManager = {
      headline: headline || null,
      displayName: displayName || null,
      isInitialized: window.userPreferencesManager.isInitialized,
      status: headline && displayName ? 'has_data' : 'missing_data'
    };
  } else {
    results.checks.userPreferencesManager = { error: 'UserPreferencesManager not available' };
  }

  // Check 3: window.currentUser
  results.checks.currentUser = {
    headline: window.currentUser?.headline || null,
    displayName: window.currentUser?.displayName || null,
    status: window.currentUser?.headline && window.currentUser?.displayName ? 'has_data' : 'missing_data'
  };

  // Check 4: Database (API)
  if (window.currentUser?.id && window.api) {
    try {
      const apiResponseRaw = await window.api.request(`/v1/users/${window.currentUser.id}`, {
        method: 'GET'
      });
      const apiResponse = apiResponseRaw as Record<string, unknown> | undefined;
      results.checks.database = {
        headline: (typeof apiResponse?.headline === 'string' ? apiResponse.headline : null) || null,
        displayName: (typeof apiResponse?.displayName === 'string' ? apiResponse.displayName : null) || null,
        displayNameSnakeCase: (typeof apiResponse?.display_name === 'string' ? apiResponse.display_name : null) || null, // Check snake_case fallback
        status: (apiResponse?.headline || apiResponse?.displayName) ? 'has_data' : 'null_in_db'
      };
    } catch (error) {
      results.checks.database = { error: error instanceof Error ? error.message : String(error) };
    }
  } else {
    results.checks.database = { error: 'User ID or API not available' };
  }

  // Check 5: Consistency Analysis
  const headlineSources = [
    results.checks.chromeStorage?.headline,
    results.checks.userPreferencesManager?.headline,
    results.checks.currentUser.headline,
    results.checks.database?.headline
  ].filter(v => v !== null && v !== undefined);

  const displayNameSources = [
    results.checks.chromeStorage?.displayName,
    results.checks.userPreferencesManager?.displayName,
    results.checks.currentUser.displayName,
    results.checks.database?.displayName || results.checks.database?.displayName
  ].filter(v => v !== null && v !== undefined);

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
      const verifyHeadlineRaw = await window.api!.request(`/v1/users/${window.currentUser!.id}`, { method: 'GET' });
      const verifyHeadline = verifyHeadlineRaw as Record<string, unknown> | undefined;
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
      const verifyDisplayNameRaw = await window.api!.request(`/v1/users/${window.currentUser!.id}`, { method: 'GET' });
      const verifyDisplayName = verifyDisplayNameRaw as Record<string, unknown> | undefined;
      if (!results.saveTest) results.saveTest = {};
      results.saveTest.displayName = {
        saveResult: displayNameSaveResult,
        savedToDB: (typeof verifyDisplayName?.displayName === 'string' ? verifyDisplayName.displayName : null) === testDisplayName,
        dbValue: typeof verifyDisplayName?.displayName === 'string' ? verifyDisplayName.displayName : undefined,
        expectedValue: testDisplayName
      };
      
      // Restore original values if test values were saved
      if (results.checks.chromeStorage?.headline) {
        await window.userPreferencesManager.savePreference('headline', results.checks.chromeStorage.headline, { batch: false });
      }
      if (results.checks.chromeStorage?.displayName) {
        await window.userPreferencesManager.savePreference('displayName', results.checks.chromeStorage.displayName, { batch: false });
      }
    } catch (error) {
      results.saveTest = { error: error instanceof Error ? error.message : String(error) };
    }
  }

  return results;
}, 'Headline and DisplayName persistence diagnostic');

// ============================================================================
// DIAGNOSTIC: CSS Computed Values
// ============================================================================

diagnosticFramework.register('css-computed-values', async (): Promise<CssComputedValuesDiagnosticResult> => {
  const results: CssComputedValuesDiagnosticResult = {
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

diagnosticFramework.register('network-requests', async (): Promise<NetworkRequestsDiagnosticResult> => {
  const results: NetworkRequestsDiagnosticResult = {
    timestamp: new Date().toISOString(),
    requests: []
  };

  // Check if Performance API is available
  if (window.performance && window.performance.getEntriesByType) {
    const networkEntries = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    // Filter for API requests
    const apiRequests = networkEntries.filter(entry => 
      entry.name.includes('/v1/users/') || 
      entry.name.includes('/v1/') ||
      entry.initiatorType === 'fetch' ||
      entry.initiatorType === 'xmlhttprequest'
    );

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

diagnosticFramework.register('user-preferences-manager-state', async (): Promise<UserPreferencesManagerDiagnosticResult> => {
  const results: UserPreferencesManagerDiagnosticResult = {
    timestamp: new Date().toISOString(),
    available: !!window.userPreferencesManager,
    state: null
  };

  if (window.userPreferencesManager) {
    const manager = window.userPreferencesManager;
    const managerState: UserPreferencesManagerState = {
      isInitialized: manager.isInitialized,
      userId: (manager as { userId?: string }).userId,
      isOnline: (manager as { isOnline?: boolean }).isOnline,
      preferences: { ...((manager as { preferences?: Record<string, unknown> }).preferences || {}) },
      metrics: ((manager as unknown) as { getMetrics?: () => { saves?: number; errors?: number; retries?: number } }).getMetrics ? ((manager as unknown) as { getMetrics: () => { saves?: number; errors?: number; retries?: number } }).getMetrics() : undefined,
      batchQueueSize: ((manager as unknown) as { batchQueue?: unknown[] }).batchQueue ? ((manager as unknown) as { batchQueue: unknown[] }).batchQueue.length : 0,
      retryQueueSize: ((manager as unknown) as { retryQueue?: unknown[] }).retryQueue ? ((manager as unknown) as { retryQueue: unknown[] }).retryQueue.length : 0
    };
    results.state = managerState;
  }

  return results;
}, 'UserPreferencesManager state diagnostic');

// ============================================================================
// DIAGNOSTIC: Theme Application
// ============================================================================

diagnosticFramework.register('theme-application', async (): Promise<ThemeDiagnosticResult> => {
  const results: ThemeDiagnosticResult = {
    timestamp: new Date().toISOString(),
    theme: {}
  };

  // Check data-theme attributes
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

  // Check Chrome storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const chromeTheme = await new Promise<{ theme?: string }>((resolve) => {
      chrome.storage.local.get(['theme'], (result) => {
        resolve(result as { theme?: string });
      });
    });
    results.theme.chromeStorage = chromeTheme.theme || null;
  }

  // Check UserPreferencesManager
  if (window.userPreferencesManager) {
    const managerThemeRaw = await window.userPreferencesManager.getPreference('theme');
    const managerTheme = typeof managerThemeRaw === 'string' ? managerThemeRaw : null;
    results.theme.userPreferencesManager = managerTheme || null;
  }

  // Check window.currentUser
  results.theme.currentUser = window.currentUser?.theme || null;

  // Check database
  if (window.currentUser?.id && window.api) {
    try {
      const apiResponseRaw = await window.api.request(`/v1/users/${window.currentUser.id}`, { method: 'GET' });
      const apiResponse = apiResponseRaw as Record<string, unknown> | undefined;
      results.theme.database = (typeof apiResponse?.theme === 'string' ? apiResponse.theme : null) || null;
    } catch (error) {
      results.theme.database = { error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Check theme toggle state
  const themeToggle = document.getElementById('theme-toggle') as HTMLInputElement | null;
  if (themeToggle) {
    results.theme.toggleState = {
      checked: themeToggle.checked,
      exists: true
    };
  } else {
    results.theme.toggleState = { exists: false };
  }

  return results;
}, 'Theme application diagnostic');

// ============================================================================
// DIAGNOSTIC: Preferences Column Status
// ============================================================================

diagnosticFramework.register('preferences-column-status', async (): Promise<PreferencesColumnStatusResult> => {
  const results: PreferencesColumnStatusResult = {
    timestamp: new Date().toISOString(),
    migration: {},
    schema: {}
  };

  // Check if preferences column still exists (via API response)
  if (window.currentUser?.id && window.api) {
    try {
      const apiResponseRaw = await window.api.request(`/v1/users/${window.currentUser.id}`, { method: 'GET' });
      const apiResponse = apiResponseRaw as Record<string, unknown> | undefined;
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
    } catch (error) {
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

diagnosticFramework.register('api-request-response', async (): Promise<ApiRequestResponseResult> => {
  const results: ApiRequestResponseResult = {
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
      const response = await window.api!.request(testRequest.url, {
        method: testRequest.method,
        body: JSON.stringify(testRequest.body)
      });
      const duration = Date.now() - startTime;
      
      if (!results.recentRequests) results.recentRequests = [];
      results.recentRequests.push({
        ...testRequest,
        duration,
        success: !!response,
        response: response ? 'received' : 'no response'
      });
      
      // Restore original value
      if (window.userPreferencesManager) {
        const original = await window.userPreferencesManager.getPreference('displayName');
        if (original) {
          await window.userPreferencesManager.savePreference('displayName', original, { batch: false });
        }
      }
    } catch (error) {
      if (!results.errors) results.errors = [];
      results.errors.push({
        type: 'test_request',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  return results;
}, 'API request/response analysis diagnostic');

// ============================================================================
// GLOBAL FUNCTIONS
// ============================================================================

/**
 * Run all diagnostics
 */
export async function diagnoseAll(): Promise<Record<string, DiagnosticResult>> {
  const results = await diagnosticFramework.runAll();
  // Filter out null results
  const filtered: Record<string, DiagnosticResult> = {};
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
export async function diagnoseIssue(issueName: string): Promise<DiagnosticResult | null> {
  return await diagnosticFramework.runDiagnostic(issueName);
}

/**
 * Get diagnostic results
 */
export function getDiagnosticResults(): DiagnosticRunResult[] {
  return diagnosticFramework.getResults();
}

// Export framework instance
export { diagnosticFramework };

// Export to window for backward compatibility
if (typeof window !== 'undefined') {
  window.diagnoseAll = diagnoseAll;
  window.diagnoseIssue = diagnoseIssue;
  window.getDiagnosticResults = getDiagnosticResults;
  window.diagnosticFramework = diagnosticFramework;
  
  console.log('✅ ROOT_CAUSE_DIAGNOSTIC: Framework loaded');
  console.log('   Usage: diagnoseAll() or diagnoseIssue("diagnostic-name")');
}

