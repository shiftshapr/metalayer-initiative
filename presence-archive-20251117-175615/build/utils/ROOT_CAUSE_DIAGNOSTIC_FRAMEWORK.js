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
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ DIAGNOSTIC: "${name}" failed:`, error);
      
      this.results.push({
        name,
        description: diagnostic.description,
        error: error.message,
        duration,
        timestamp: new Date().toISOString(),
        status: 'error'
      });
      
      return { error: error.message };
    }
  }

  /**
   * Run all enabled diagnostics
   */
  async runAll() {
    console.log('🔍 DIAGNOSTIC: === STARTING ROOT CAUSE DIAGNOSTICS ===');
    console.log(`🔍 DIAGNOSTIC: Running ${this.diagnostics.size} diagnostics...`);
    
    const results = {};
    for (const [name, diagnostic] of this.diagnostics.entries()) {
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
    checks: {}
  };

  // Check 1: Chrome Storage
  const chromeStorage = await chrome.storage.local.get(['settingsHeadline', 'displayName']);
  results.checks.chromeStorage = {
    headline: chromeStorage.settingsHeadline || null,
    displayName: chromeStorage.displayName || null,
    status: chromeStorage.settingsHeadline && chromeStorage.displayName ? 'has_data' : 'missing_data'
  };

  // Check 2: UserPreferencesManager
  if (window.userPreferencesManager) {
    const headline = await window.userPreferencesManager.getPreference('headline');
    const displayName = await window.userPreferencesManager.getPreference('displayName');
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
      const apiResponse = await window.api.request(`/v1/users/${window.currentUser.id}`, {
        method: 'GET'
      });
      results.checks.database = {
        headline: apiResponse?.headline || null,
        displayName: apiResponse?.displayName || null,
        display_name: apiResponse?.display_name || null, // Check snake_case fallback
        status: (apiResponse?.headline || apiResponse?.displayName) ? 'has_data' : 'null_in_db'
      };
    } catch (error) {
      results.checks.database = { error: error.message };
    }
  } else {
    results.checks.database = { error: 'User ID or API not available' };
  }

  // Check 5: Consistency Analysis
  const headlineSources = [
    results.checks.chromeStorage.headline,
    results.checks.userPreferencesManager?.headline,
    results.checks.currentUser.headline,
    results.checks.database?.headline
  ].filter(v => v !== null && v !== undefined);

  const displayNameSources = [
    results.checks.chromeStorage.displayName,
    results.checks.userPreferencesManager?.displayName,
    results.checks.currentUser.displayName,
    results.checks.database?.displayName || results.checks.database?.display_name
  ].filter(v => v !== null && v !== undefined);

  results.consistency = {
    headline: {
      uniqueValues: [...new Set(headlineSources)],
      isConsistent: headlineSources.length <= 1 || new Set(headlineSources).size === 1,
      sourceCount: headlineSources.length
    },
    displayName: {
      uniqueValues: [...new Set(displayNameSources)],
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
      const verifyHeadline = await window.api.request(`/v1/users/${window.currentUser.id}`, { method: 'GET' });
      results.saveTest = {
        headline: {
          saveResult: headlineSaveResult,
          savedToDB: verifyHeadline?.headline === testHeadline,
          dbValue: verifyHeadline?.headline,
          expectedValue: testHeadline
        }
      };
      
      // Test displayName save
      const displayNameSaveResult = await window.userPreferencesManager.savePreference('displayName', testDisplayName, { batch: false });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for save
      
      // Verify displayName was saved
      const verifyDisplayName = await window.api.request(`/v1/users/${window.currentUser.id}`, { method: 'GET' });
      results.saveTest.displayName = {
        saveResult: displayNameSaveResult,
        savedToDB: verifyDisplayName?.displayName === testDisplayName,
        dbValue: verifyDisplayName?.displayName,
        expectedValue: testDisplayName
      };
      
      // Restore original values if test values were saved
      if (results.checks.chromeStorage.headline) {
        await window.userPreferencesManager.savePreference('headline', results.checks.chromeStorage.headline, { batch: false });
      }
      if (results.checks.chromeStorage.displayName) {
        await window.userPreferencesManager.savePreference('displayName', results.checks.chromeStorage.displayName, { batch: false });
      }
    } catch (error) {
      results.saveTest = { error: error.message };
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

diagnosticFramework.register('user-preferences-manager-state', async () => {
  const results = {
    timestamp: new Date().toISOString(),
    available: !!window.userPreferencesManager,
    state: null
  };

  if (window.userPreferencesManager) {
    const manager = window.userPreferencesManager;
    results.state = {
      isInitialized: manager.isInitialized,
      userId: manager.userId,
      isOnline: manager.isOnline,
      preferences: { ...manager.preferences },
      metrics: manager.getMetrics ? manager.getMetrics() : null,
      batchQueueSize: manager.batchQueue ? manager.batchQueue.length : 0,
      retryQueueSize: manager.retryQueue ? manager.retryQueue.length : 0
    };
  }

  return results;
}, 'UserPreferencesManager state diagnostic');

// ============================================================================
// DIAGNOSTIC: Theme Application
// ============================================================================

diagnosticFramework.register('theme-application', async () => {
  const results = {
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
  const chromeTheme = await chrome.storage.local.get(['theme']);
  results.theme.chromeStorage = chromeTheme.theme || null;

  // Check UserPreferencesManager
  if (window.userPreferencesManager) {
    const managerTheme = await window.userPreferencesManager.getPreference('theme');
    results.theme.userPreferencesManager = managerTheme || null;
  }

  // Check window.currentUser
  results.theme.currentUser = window.currentUser?.theme || null;

  // Check database
  if (window.currentUser?.id && window.api) {
    try {
      const apiResponse = await window.api.request(`/v1/users/${window.currentUser.id}`, { method: 'GET' });
      results.theme.database = apiResponse?.theme || null;
    } catch (error) {
      results.theme.database = { error: error.message };
    }
  }

  // Check theme toggle state
  const themeToggle = document.getElementById('theme-toggle');
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

diagnosticFramework.register('preferences-column-status', async () => {
  const results = {
    timestamp: new Date().toISOString(),
    migration: {},
    schema: {}
  };

  // Check if preferences column still exists (via API response)
  if (window.currentUser?.id && window.api) {
    try {
      const apiResponse = await window.api.request(`/v1/users/${window.currentUser.id}`, { method: 'GET' });
      results.migration = {
        preferencesInResponse: 'preferences' in apiResponse,
        preferencesValue: apiResponse?.preferences || null,
        hasNewColumns: {
          theme: 'theme' in apiResponse,
          headline: 'headline' in apiResponse,
          displayName: 'displayName' in apiResponse || 'display_name' in apiResponse,
          auraIntensity: 'auraIntensity' in apiResponse || 'aura_intensity' in apiResponse
        }
      };
    } catch (error) {
      results.migration = { error: error.message };
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
      results.errors.push({
        type: 'test_request',
        error: error.message,
        stack: error.stack
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
async function diagnoseAll() {
  return await diagnosticFramework.runAll();
}

/**
 * Run a specific diagnostic
 */
async function diagnoseIssue(issueName) {
  return await diagnosticFramework.runDiagnostic(issueName);
}

/**
 * Get diagnostic results
 */
function getDiagnosticResults() {
  return diagnosticFramework.getResults();
}

// Export to window
if (typeof window !== 'undefined') {
  window.diagnoseAll = diagnoseAll;
  window.diagnoseIssue = diagnoseIssue;
  window.getDiagnosticResults = getDiagnosticResults;
  window.diagnosticFramework = diagnosticFramework;
  
  console.log('✅ ROOT_CAUSE_DIAGNOSTIC: Framework loaded');
  console.log('   Available diagnostics:', Array.from(diagnosticFramework.diagnostics.keys()));
  console.log('   Usage: diagnoseAll() or diagnoseIssue("diagnostic-name")');
}

