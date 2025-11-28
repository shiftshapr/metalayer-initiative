/**
 * Diagnostic Script: Tab Manager Manage Button Missing
 * 
 * Problem: Manage button not displaying in tab navigation
 * Root Cause Analysis: Check TabManager initialization, rendering, and DOM state
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Tab Manager Manage Button Analysis');
  console.log('==============================================\n');

  const diagnostics = {
    tabManagerLoaded: false,
    tabManagerInitialized: false,
    containerFound: false,
    manageButtonFound: false,
    hardcodedTabsFound: false,
    issues: [],
    recommendations: []
  };

  // 1. Check if TabManager module is loaded
  diagnostics.tabManagerLoaded = typeof window.TabManager !== 'undefined' || 
                                  typeof window.getTabManager !== 'undefined';
  console.log(`1. TabManager Module Loaded: ${diagnostics.tabManagerLoaded ? '✅ Yes' : '❌ No'}`);

  // 2. Check if TabManager instance exists
  let tabManagerInstance = null;
  if (window.getTabManager) {
    try {
      tabManagerInstance = window.getTabManager();
      diagnostics.tabManagerInitialized = tabManagerInstance && tabManagerInstance.initialized;
      console.log(`2. TabManager Instance: ${tabManagerInstance ? '✅ Found' : '❌ Not found'}`);
      console.log(`   Initialized: ${diagnostics.tabManagerInitialized ? '✅ Yes' : '❌ No'}`);
    } catch (e) {
      console.log(`   Error getting TabManager: ${e.message}`);
    }
  }

  // 3. Check for container
  const container = document.querySelector('.sidebar-nav-main');
  diagnostics.containerFound = !!container;
  console.log(`\n3. Container (.sidebar-nav-main): ${diagnostics.containerFound ? '✅ Found' : '❌ Not found'}`);

  if (container) {
    console.log(`   Children count: ${container.children.length}`);
    console.log(`   HTML: ${container.innerHTML.substring(0, 200)}...`);
  }

  // 4. Check for manage button
  const manageButton = document.querySelector('.manage-button, #tab-manager-button, .main-nav-tab.manage-button');
  diagnostics.manageButtonFound = !!manageButton;
  console.log(`\n4. Manage Button: ${diagnostics.manageButtonFound ? '✅ Found' : '❌ Not found'}`);

  if (manageButton) {
    const style = getComputedStyle(manageButton);
    console.log(`   Display: ${style.display}`);
    console.log(`   Visibility: ${style.visibility}`);
    console.log(`   Opacity: ${style.opacity}`);
    console.log(`   Text: ${manageButton.textContent}`);
  }

  // 5. Check for hardcoded tabs (should be replaced by TabManager)
  const hardcodedTabs = document.querySelectorAll('.sidebar-nav-main > .main-nav-tab:not(.manage-button)');
  diagnostics.hardcodedTabsFound = hardcodedTabs.length > 0;
  console.log(`\n5. Hardcoded Tabs: ${diagnostics.hardcodedTabsFound ? `⚠️ Found ${hardcodedTabs.length}` : '✅ None (replaced by TabManager)'}`);

  if (hardcodedTabsFound) {
    console.log('   Hardcoded tabs still present - TabManager may not be rendering');
    hardcodedTabs.forEach((tab, i) => {
      console.log(`   Tab ${i + 1}: ${tab.textContent?.trim()} (${tab.getAttribute('data-tab')})`);
    });
  }

  // 6. Check for TabManager script tags
  const tabManagerScripts = Array.from(document.querySelectorAll('script[src*="TabManager"], script[src*="tab-manager"]'));
  console.log(`\n6. TabManager Script Tags: ${tabManagerScripts.length > 0 ? `✅ Found ${tabManagerScripts.length}` : '❌ Not found'}`);
  tabManagerScripts.forEach(script => {
    console.log(`   ${script.src}`);
  });

  // 7. Check initialization event
  let initEventFired = false;
  const checkInit = () => {
    document.addEventListener('tabManager:initialized', () => {
      initEventFired = true;
      console.log('\n⏱️  TabManager initialization event fired');
    }, { once: true });
  };
  checkInit();

  // 8. Check console for TabManager logs
  console.log('\n7. Checking for TabManager console logs...');
  console.log('   (Look for "✅ TabManager: Initialized successfully" in console)');

  // 9. Analysis
  console.log('\n==============================================');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('==============================================\n');

  if (!diagnostics.tabManagerLoaded) {
    diagnostics.issues.push({
      type: 'module-not-loaded',
      severity: 'high',
      message: 'TabManager module not loaded - check script tags in sidepanel.html'
    });
    diagnostics.recommendations.push('Add TabManager script tags to sidepanel.html');
  }

  if (diagnostics.tabManagerLoaded && !diagnostics.tabManagerInitialized) {
    diagnostics.issues.push({
      type: 'not-initialized',
      severity: 'high',
      message: 'TabManager loaded but not initialized'
    });
    diagnostics.recommendations.push('Check initializeTabManager.js - may be waiting for UserPreferencesManager');
  }

  if (diagnostics.hardcodedTabsFound && diagnostics.tabManagerInitialized) {
    diagnostics.issues.push({
      type: 'hardcoded-tabs-not-replaced',
      severity: 'high',
      message: 'TabManager initialized but hardcoded tabs still present - render() may not be called'
    });
    diagnostics.recommendations.push('Ensure TabManager.refreshDisplay() is called after initialization');
  }

  if (!diagnostics.manageButtonFound && diagnostics.tabManagerInitialized) {
    diagnostics.issues.push({
      type: 'manage-button-not-rendered',
      severity: 'high',
      message: 'TabManager initialized but manage button not in DOM'
    });
    diagnostics.recommendations.push('Check TabDisplay.render() - manage button creation may be failing');
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
  window.__TAB_MANAGER_BUTTON_DIAGNOSTICS__ = diagnostics;

  console.log('\n✅ Diagnostic complete. Results stored in window.__TAB_MANAGER_BUTTON_DIAGNOSTICS__');
  return diagnostics;
})();




