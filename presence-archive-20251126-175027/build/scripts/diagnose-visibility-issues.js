/**
 * VISIBILITY ISSUES DIAGNOSTIC SCRIPT
 * 
 * Root Cause Analysis:
 * 1. Users not seeing each other (0 visible)
 * 2. Content duplication (0 visible appears twice)
 * 
 * Checks:
 * - Page ID resolution
 * - VisibilityManager initialization
 * - Realtime subscription status
 * - State management
 * - UI component initialization
 * - Duplicate rendering
 */

const results = [];

function addResult(check, status, message, details = null) {
  results.push({ check, status, message, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${check}: ${message}`, details || '');
}

/**
 * Check 1: Page ID Resolution
 */
function checkPageIdResolution() {
  const win = typeof window !== 'undefined' ? window : null;

  // Check tabContextManager
  if (win?.tabContextManager) {
    const tab = win.tabContextManager.getTabContainer('visibility-tab');
    if (tab?.dataset?.pageId) {
      addResult('Page ID Resolution', 'PASS', `Found in tab container: ${tab.dataset.pageId}`, {
        source: 'tab-container',
        pageId: tab.dataset.pageId
      });
      return;
    }
  }

  // Check currentUrlData
  if (win?.currentUrlData?.pageId) {
    addResult('Page ID Resolution', 'PASS', `Found in currentUrlData: ${win.currentUrlData.pageId}`, {
      source: 'current-url-data',
      pageId: win.currentUrlData.pageId
    });
    return;
  }

  // Check DOM attribute
  if (typeof document !== 'undefined') {
    const firstMessage = document.querySelector('[data-page-id]');
    const pageIdAttr = firstMessage?.getAttribute('data-page-id');
    if (pageIdAttr) {
      addResult('Page ID Resolution', 'PASS', `Found in DOM: ${pageIdAttr}`, {
        source: 'dom-attribute',
        pageId: pageIdAttr
      });
      return;
    }
  }

  // Check stateManager (async - will be handled separately)
  if (win?.stateManagerInstance && typeof win.stateManagerInstance.getState === 'function') {
    // Note: This is async, will be checked in async phase
    // For now, just note that stateManager exists
  }

  addResult('Page ID Resolution', 'FAIL', 'No page ID found in any source', {
    checked: ['tab-container', 'current-url-data', 'dom-attribute']
  });
}

/**
 * Check 2: VisibilityManager Initialization
 */
async function checkVisibilityManagerInit() {
  // Use ES6 modules - import from buildGraph
  // Try extension path first (runtime), then source path (development)
  try {
    let buildModuleGraph;
    try {
      const module = await import('/sidepanel/buildGraph.js');
      buildModuleGraph = module.buildModuleGraph;
    } catch (e) {
      // Fallback to relative path
      const module = await import('../sidepanel/buildGraph.js');
      buildModuleGraph = module.buildModuleGraph;
    }
    const graph = await buildModuleGraph();
    
    if (graph.visibilityManager) {
      const mgr = graph.visibilityManager;
      addResult('VisibilityManager Init', 'PASS', 'VisibilityManager found via ES6 modules', {
        currentUserEmail: mgr.currentUserEmail || 'null',
        isActive: mgr.isActive,
        currentPageId: mgr.currentPageId || 'null'
      });
    } else {
      addResult('VisibilityManager Init', 'FAIL', 'VisibilityManager not in buildModuleGraph return', {});
    }
  } catch (error) {
    addResult('VisibilityManager Init', 'FAIL', 'Error importing buildModuleGraph', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Check 3: Realtime Subscription
 */
function checkRealtimeSubscription() {
  const win = typeof window !== 'undefined' ? window : null;

  if (!win?.supabase) {
    addResult('Realtime Subscription', 'FAIL', 'Supabase client not found', {});
    return;
  }

  try {
    const channel = win.supabase.channel('presence');
    if (channel) {
      addResult('Realtime Subscription', 'PASS', 'Supabase channel available', {
        note: 'Channel created successfully (actual subscription status unknown)'
      });
    } else {
      addResult('Realtime Subscription', 'FAIL', 'Cannot create Supabase channel', {});
    }
  } catch (error) {
    addResult('Realtime Subscription', 'FAIL', 'Error creating Supabase channel', { error });
  }
}

/**
 * Check 4: State Management
 */
async function checkStateManagement() {
  // Use ES6 modules - import from buildGraph
  // Try extension path first (runtime), then source path (development)
  try {
    let buildModuleGraph;
    try {
      const module = await import('/sidepanel/buildGraph.js');
      buildModuleGraph = module.buildModuleGraph;
    } catch (e) {
      // Fallback to relative path
      const module = await import('../sidepanel/buildGraph.js');
      buildModuleGraph = module.buildModuleGraph;
    }
    const graph = await buildModuleGraph();
    
    if (!graph.visibilityState) {
      addResult('State Management', 'FAIL', 'VisibilityState not in buildModuleGraph return', {});
      return;
    }

    const state = graph.visibilityState;
    const users = state.getUsers();
    const currentUserEmail = state.getCurrentUserEmail();
    const isActive = state.getIsActive();

    addResult('State Management', 'PASS', 'VisibilityState found via ES6 modules', {
      userCount: users.length,
      currentUserEmail: currentUserEmail || 'null',
      isActive
    });

    if (users.length === 0) {
      addResult('State Users', 'WARN', 'No users in state', {
        note: 'This could be normal if no users are visible, or could indicate a problem'
      });
    }
  } catch (error) {
    addResult('State Management', 'FAIL', 'Error importing buildModuleGraph', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Check 5: UI Component Initialization (Duplication)
 */
function checkUIComponentInit() {
  if (typeof document === 'undefined') {
    addResult('UI Component Init', 'WARN', 'Document not available', {});
    return;
  }

  // Check for visibility tab container
  const visibilityTab = document.getElementById('visibility-tab');
  if (!visibilityTab) {
    addResult('UI Component Init', 'FAIL', 'Visibility tab container not found', {
      selector: '#visibility-tab'
    });
    return;
  }

  // Check for duplicate "0 visible" or "visible-users" containers
  const visibleUsersContainers = visibilityTab.querySelectorAll('.visible-users');
  const visibleCountElements = visibilityTab.querySelectorAll('.visible-count');

  if (visibleUsersContainers.length > 1) {
    addResult('UI Component Duplication', 'FAIL', `Found ${visibleUsersContainers.length} .visible-users containers`, {
      count: visibleUsersContainers.length,
      note: 'VisibilityTab.render() may be called multiple times without cleanup'
    });
  } else if (visibleUsersContainers.length === 1) {
    addResult('UI Component Duplication', 'PASS', 'Single .visible-users container found', {});
  } else {
    addResult('UI Component Duplication', 'WARN', 'No .visible-users container found', {
      note: 'Component may not have rendered yet'
    });
  }

  if (visibleCountElements.length > 1) {
    addResult('UI Component Duplication', 'FAIL', `Found ${visibleCountElements.length} .visible-count elements`, {
      count: visibleCountElements.length
    });
  }

  // Check for VisibilityUIEvents via ES6 modules
  // Note: This check is async but called from sync function - will be handled in main diagnostic

  // Check container innerHTML for duplication patterns
  if (visibilityTab) {
    const innerHTML = visibilityTab.innerHTML;
    const visibleCountMatches = innerHTML.match(/visible/g) || [];
    const zeroVisibleMatches = innerHTML.match(/0 visible/g) || [];
    
    if (zeroVisibleMatches.length > 1) {
      addResult('UI Content Duplication', 'FAIL', `Found ${zeroVisibleMatches.length} instances of "0 visible"`, {
        count: zeroVisibleMatches.length,
        note: 'Content is duplicated in the DOM'
      });
    }
  }
}

/**
 * Check 6: VisibilityTab Render Calls
 */
function checkRenderCalls() {
  // Override console.log to track render calls
  const originalLog = console.log;
  let renderCallCount = 0;
  const renderCalls = [];

  console.log = (...args) => {
    const firstArg = args[0];
    const message = firstArg ? String(firstArg) : '';
    if (message.includes('VISIBILITY_TAB: Rendered')) {
      renderCallCount++;
      renderCalls.push(message);
    }
    originalLog.apply(console, args);
  };

  // Wait a bit to catch render calls
  setTimeout(() => {
    console.log = originalLog;
    if (renderCallCount > 1) {
      addResult('Render Calls', 'FAIL', `VisibilityTab.render() called ${renderCallCount} times`, {
        calls: renderCalls,
        note: 'Multiple renders may cause duplication'
      });
    } else if (renderCallCount === 1) {
      addResult('Render Calls', 'PASS', 'VisibilityTab.render() called once', {});
    } else {
      addResult('Render Calls', 'WARN', 'No render calls detected in last 2 seconds', {
        note: 'May need to wait longer or trigger a render'
      });
    }
  }, 2000);
}

/**
 * Check 7: Database Query
 */
async function checkDatabaseQuery() {
  const win = typeof window !== 'undefined' ? window : null;

  if (!win?.supabase) {
    addResult('Database Query', 'FAIL', 'Supabase client not available', {});
    return;
  }

  // Get current page ID
  let pageId = null;
  if (win.stateManagerInstance) {
    try {
      const urlData = await win.stateManagerInstance.getState('currentUrlData');
      pageId = urlData?.pageId || null;
    } catch (error) {
      addResult('Database Query', 'WARN', 'Error getting pageId from stateManager', { error });
    }
  }

  if (!pageId) {
    addResult('Database Query', 'WARN', 'Cannot test database query - no pageId available', {
      note: 'Fix page ID resolution first'
    });
    return;
  }

  try {
    const { data, error } = await win.supabase
      .from('presence')
      .select('*, AppUser(*)')
      .eq('page_id', pageId)
      .eq('is_visible', true);

    if (error) {
      addResult('Database Query', 'FAIL', 'Database query error', {
        error: error instanceof Error ? error.message : String(error),
        pageId
      });
      return;
    }

    const users = data || [];
    addResult('Database Query', 'PASS', `Query returned ${users.length} users`, {
      pageId,
      userCount: users.length,
      users: users.map((u) => {
        const record = u;
        return {
          userId: record.user_id,
          email: record.AppUser?.email,
          name: record.AppUser?.name
        };
      })
    });
  } catch (error) {
    addResult('Database Query', 'FAIL', 'Exception during database query', {
      error: error instanceof Error ? error.message : String(error),
      pageId
    });
  }
}

/**
 * Check UI Component Init (async version)
 */
async function checkUIComponentInitAsync() {
  // Use ES6 modules - import from buildGraph
  // Try extension path first (runtime), then source path (development)
  try {
    let buildModuleGraph;
    try {
      const module = await import('/sidepanel/buildGraph.js');
      buildModuleGraph = module.buildModuleGraph;
    } catch (e) {
      // Fallback to relative path
      const module = await import('../sidepanel/buildGraph.js');
      buildModuleGraph = module.buildModuleGraph;
    }
    const graph = await buildModuleGraph();
    
    if (graph.visibilityUIEvents) {
      addResult('UI Component Init', 'PASS', 'VisibilityUIEvents found via ES6 modules', {
        hasVisibilityTab: !!graph.visibilityUIEvents.visibilityTab
      });
    } else {
      addResult('UI Component Init', 'WARN', 'VisibilityUIEvents not in buildModuleGraph return', {
        note: 'Component may not be initialized'
      });
    }
  } catch (error) {
    addResult('UI Component Init', 'WARN', 'Error importing buildModuleGraph', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Main diagnostic function
 */
async function runVisibilityDiagnostic() {
  console.log('🔍 VISIBILITY DIAGNOSTIC: Starting...\n');
  console.log('📦 Using ES6 modules (no window globals)\n');

  // Run synchronous checks
  checkPageIdResolution();
  checkRealtimeSubscription();
  checkUIComponentInit();
  checkRenderCalls();

  // Run async checks (ES6 module imports)
  await checkVisibilityManagerInit();
  await checkStateManagement();
  await checkUIComponentInitAsync();
  await checkDatabaseQuery();

  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warnCount = results.filter(r => r.status === 'WARN').length;

  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`⚠️  Warnings: ${warnCount}`);

  if (failCount > 0) {
    console.log('\n❌ FAILED CHECKS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.check}: ${r.message}`);
    });
  }

  if (warnCount > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`  - ${r.check}: ${r.message}`);
    });
  }

  // Root cause analysis
  console.log('\n🔍 ROOT CAUSE ANALYSIS:');
  
  const pageIdFailed = results.some(r => r.check.includes('Page ID') && r.status === 'FAIL');
  if (pageIdFailed) {
    console.log('  ❌ Page ID resolution is failing - this prevents refreshVisibilityAvatars from working');
    console.log('     → Fix: Ensure pageId is set in tabContextManager or currentUrlData');
  }

  const duplicationFailed = results.some(r => r.check.includes('Duplication') && r.status === 'FAIL');
  if (duplicationFailed) {
    console.log('  ❌ UI duplication detected - VisibilityTab.render() may be called multiple times');
    console.log('     → Fix: Ensure cleanup() is called before re-initialization, or prevent multiple subscriptions');
  }

  const dbQueryFailed = results.some(r => r.check.includes('Database Query') && r.status === 'FAIL');
  if (dbQueryFailed) {
    console.log('  ❌ Database query is failing - users cannot be fetched');
    console.log('     → Fix: Check Supabase connection and query syntax');
  }

  const noUsers = results.some(r => r.check.includes('State Users') && r.status === 'WARN');
  if (noUsers && !pageIdFailed && !dbQueryFailed) {
    console.log('  ⚠️  No users in state - this may be normal if no users are visible on the page');
  }

  return results;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.runVisibilityDiagnostic = runVisibilityDiagnostic;
  console.log('✅ VISIBILITY DIAGNOSTIC: Loaded. Run window.runVisibilityDiagnostic() to start.');
}

// Also export for Node.js/CommonJS if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runVisibilityDiagnostic };
}

