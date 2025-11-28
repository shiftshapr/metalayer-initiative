/**
 * DIAGNOSTIC SCRIPT: Tabs Not Displaying
 * 
 * Problem: Tabs don't display at all after TabManager integration
 * Root Cause Analysis: Check TabManager initialization, script loading, container, and rendering
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Tabs Not Displaying Analysis');
  console.log('==========================================\n');

  const diagnostics = {
    tabManagerScriptLoaded: false,
    initializeTabManagerLoaded: false,
    tabManagerInitialized: false,
    containerFound: false,
    tabsRendered: false,
    manageButtonFound: false,
    userPreferencesManagerReady: false,
    issues: [],
    recommendations: []
  };

  // 1. Check if TabManager script is loaded
  const tabManagerScripts = Array.from(document.querySelectorAll('script[src*="TabManager"]'));
  diagnostics.tabManagerScriptLoaded = tabManagerScripts.length > 0;
  console.log(`1. TabManager Script Tags: ${diagnostics.tabManagerScriptLoaded ? `✅ Found ${tabManagerScripts.length}` : '❌ Not found'}`);
  tabManagerScripts.forEach(script => {
    console.log(`   ${script.src}`);
  });

  // 2. Check if initializeTabManager is loaded
  diagnostics.initializeTabManagerLoaded = typeof window.getTabManager !== 'undefined' || 
                                           Array.from(document.querySelectorAll('script[src*="initializeTabManager"]')).length > 0;
  console.log(`\n2. initializeTabManager: ${diagnostics.initializeTabManagerLoaded ? '✅ Loaded' : '❌ Not loaded'}`);

  // 3. Check if TabManager instance exists and is initialized
  let tabManagerInstance = null;
  if (window.getTabManager) {
    try {
      tabManagerInstance = window.getTabManager();
      diagnostics.tabManagerInitialized = tabManagerInstance && tabManagerInstance.initialized;
      console.log(`\n3. TabManager Instance: ${tabManagerInstance ? '✅ Found' : '❌ Not found'}`);
      console.log(`   Initialized: ${diagnostics.tabManagerInitialized ? '✅ Yes' : '❌ No'}`);
      if (tabManagerInstance) {
        console.log(`   State:`, tabManagerInstance.getState?.() || 'No getState method');
      }
    } catch (e) {
      console.log(`   Error getting TabManager: ${e.message}`);
    }
  } else {
    console.log(`\n3. TabManager Instance: ❌ getTabManager() not available`);
  }

  // 4. Check for container
  const container = document.querySelector('.sidebar-nav-main');
  diagnostics.containerFound = !!container;
  console.log(`\n4. Container (.sidebar-nav-main): ${diagnostics.containerFound ? '✅ Found' : '❌ Not found'}`);

  if (container) {
    const children = Array.from(container.children);
    console.log(`   Children count: ${children.length}`);
    console.log(`   HTML: ${container.innerHTML.substring(0, 300)}...`);
    
    // Check for tabs
    const tabs = container.querySelectorAll('.main-nav-tab:not(.manage-button)');
    diagnostics.tabsRendered = tabs.length > 0;
    console.log(`   Tabs found: ${tabs.length}`);
    tabs.forEach((tab, i) => {
      console.log(`     Tab ${i + 1}: ${tab.textContent?.trim()} (${tab.getAttribute('data-tab')})`);
    });

    // Check for manage button
    const manageButton = container.querySelector('.manage-button, #tab-manager-button');
    diagnostics.manageButtonFound = !!manageButton;
    console.log(`   Manage button: ${manageButton ? '✅ Found' : '❌ Not found'}`);
  }

  // 5. Check UserPreferencesManager
  diagnostics.userPreferencesManagerReady = !!(window.userPreferencesManager && window.userPreferencesManager.isInitialized);
  console.log(`\n5. UserPreferencesManager: ${diagnostics.userPreferencesManagerReady ? '✅ Ready' : '❌ Not ready'}`);
  if (window.userPreferencesManager) {
    console.log(`   Initialized: ${window.userPreferencesManager.isInitialized}`);
    console.log(`   Available: ${!!window.userPreferencesManager}`);
  }

  // 6. Check for initialization event
  let initEventFired = false;
  const checkEvent = () => {
    // Check if event was already fired (can't detect past events, but can check if TabManager is initialized)
    if (diagnostics.tabManagerInitialized) {
      initEventFired = true;
    }
  };
  checkEvent();
  console.log(`\n6. TabManager Initialization Event: ${initEventFired ? '✅ Fired' : '❌ Not fired'}`);

  // 7. Check console for TabManager logs
  console.log('\n7. Checking for TabManager console logs...');
  console.log('   (Look for "✅ TabManager: Initialized successfully" in console)');
  console.log('   (Look for "✅ TabDisplay: Rendered X tabs" in console)');

  // 8. Check script loading order
  const allScripts = Array.from(document.querySelectorAll('script[src]'));
  const tabManagerScriptIndex = allScripts.findIndex(s => s.src.includes('TabManager'));
  const navManagerScriptIndex = allScripts.findIndex(s => s.src.includes('NavigationManager'));
  console.log(`\n8. Script Loading Order:`);
  console.log(`   NavigationManager index: ${navManagerScriptIndex >= 0 ? navManagerScriptIndex : 'not found'}`);
  console.log(`   TabManager index: ${tabManagerScriptIndex >= 0 ? tabManagerScriptIndex : 'not found'}`);
  if (tabManagerScriptIndex >= 0 && navManagerScriptIndex >= 0) {
    const orderCorrect = tabManagerScriptIndex > navManagerScriptIndex;
    console.log(`   Order: ${orderCorrect ? '✅ Correct (TabManager after NavigationManager)' : '⚠️ TabManager before NavigationManager'}`);
  }

  // 9. Analysis
  console.log('\n==========================================');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('==========================================\n');

  if (!diagnostics.tabManagerScriptLoaded) {
    diagnostics.issues.push({
      type: 'script-not-loaded',
      severity: 'high',
      message: 'TabManager script tags missing from sidepanel.html'
    });
    diagnostics.recommendations.push('Add TabManager script tags to sidepanel.html');
  }

  if (diagnostics.tabManagerScriptLoaded && !diagnostics.tabManagerInitialized) {
    diagnostics.issues.push({
      type: 'not-initialized',
      severity: 'high',
      message: 'TabManager script loaded but not initialized - may be waiting for UserPreferencesManager'
    });
    diagnostics.recommendations.push('Check initializeTabManager.ts - ensure UserPreferencesManager is ready');
  }

  if (!diagnostics.userPreferencesManagerReady && diagnostics.tabManagerScriptLoaded) {
    diagnostics.issues.push({
      type: 'preferences-not-ready',
      severity: 'high',
      message: 'UserPreferencesManager not ready - TabManager initialization may be blocked'
    });
    diagnostics.recommendations.push('Check UserPreferencesManager initialization - TabManager waits for preferenceLoaded event');
  }

  if (diagnostics.containerFound && !diagnostics.tabsRendered && diagnostics.tabManagerInitialized) {
    diagnostics.issues.push({
      type: 'tabs-not-rendered',
      severity: 'high',
      message: 'TabManager initialized but tabs not rendered - render() may not be called'
    });
    diagnostics.recommendations.push('Check TabManager.refreshDisplay() - ensure it\'s called after initialization');
  }

  if (!diagnostics.containerFound) {
    diagnostics.issues.push({
      type: 'container-not-found',
      severity: 'high',
      message: 'Container .sidebar-nav-main not found - TabManager cannot render'
    });
    diagnostics.recommendations.push('Check sidepanel.html - ensure .sidebar-nav-main div exists');
  }

  console.log(`✅ Issues Found: ${diagnostics.issues.length}`);
  diagnostics.issues.forEach((issue, i) => {
    console.log(`   ${i + 1}. [${issue.severity}] ${issue.type}: ${issue.message}`);
  });

  console.log(`\n💡 Recommendations: ${diagnostics.recommendations.length}`);
  diagnostics.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });

  // Store diagnostics
  window.__TABS_NOT_DISPLAYING_DIAGNOSTICS__ = diagnostics;

  console.log('\n✅ Diagnostic complete. Results stored in window.__TABS_NOT_DISPLAYING_DIAGNOSTICS__');
  return diagnostics;
})();




