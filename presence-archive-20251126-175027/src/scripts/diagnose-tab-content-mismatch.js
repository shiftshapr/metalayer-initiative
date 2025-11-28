/**
 * Diagnostic Script: Tab Content Mismatch on Load
 * 
 * This script diagnoses why the tab button shows one tab but content shows another on page load.
 * 
 * Usage: Run in browser console after page loads
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Tab Content Mismatch on Load');
  console.log('============================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    activeTabButton: null,
    activeTabContent: null,
    savedCurrentTab: null,
    issues: []
  };

  // 1. Check active tab button
  console.log('1. Checking Active Tab Button...');
  const activeTabButton = document.querySelector('.main-nav-tab.active');
  const activeTabButtonId = activeTabButton?.getAttribute('data-tab');
  results.activeTabButton = {
    exists: !!activeTabButton,
    tabId: activeTabButtonId,
    text: activeTabButton?.textContent?.trim()
  };
  console.log('   Active Tab Button:', results.activeTabButton);

  // 2. Check active tab content
  console.log('\n2. Checking Active Tab Content...');
  const activeTabContents = Array.from(document.querySelectorAll('.main-tab-content.active'));
  const activeTabContentIds = activeTabContents.map(c => c.id);
  results.activeTabContent = {
    count: activeTabContents.length,
    ids: activeTabContentIds,
    firstId: activeTabContentIds[0] || null
  };
  console.log('   Active Tab Content:', results.activeTabContent);

  // 3. Check saved current tab from TabManager
  console.log('\n3. Checking Saved Current Tab...');
  const tabManager = window.tabContextManager || 
                     (window.__CANOPI_MODULE_GRAPH__ && window.__CANOPI_MODULE_GRAPH__.tabManager);
  let savedCurrentTab = null;
  if (tabManager?.getCurrentTab) {
    savedCurrentTab = tabManager.getCurrentTab();
  } else {
    // Try to get from chrome storage
    chrome?.storage?.local?.get(['tabManagerConfig'], (result) => {
      if (result.tabManagerConfig) {
        try {
          const config = JSON.parse(result.tabManagerConfig);
          savedCurrentTab = config.currentTab;
        } catch (e) {
          console.log('   Could not parse tabManagerConfig');
        }
      }
    });
  }
  results.savedCurrentTab = savedCurrentTab;
  console.log('   Saved Current Tab:', savedCurrentTab);

  // 4. Check for mismatch
  console.log('\n4. Checking for Mismatch...');
  const buttonTabId = activeTabButtonId;
  const contentTabId = activeTabContentIds[0];
  const mismatch = buttonTabId && contentTabId && buttonTabId !== contentTabId;
  
  if (mismatch) {
    results.issues.push(`Mismatch: Button shows "${buttonTabId}" but content shows "${contentTabId}"`);
    console.log(`   ❌ MISMATCH DETECTED: Button="${buttonTabId}", Content="${contentTabId}"`);
  } else if (buttonTabId && !contentTabId) {
    results.issues.push(`No active tab content found, but button shows "${buttonTabId}"`);
    console.log(`   ❌ No active content found`);
  } else if (!buttonTabId && contentTabId) {
    results.issues.push(`No active tab button found, but content shows "${contentTabId}"`);
    console.log(`   ❌ No active button found`);
  } else {
    console.log(`   ✅ Match: Button="${buttonTabId}", Content="${contentTabId}"`);
  }

  // 5. Check if triggerTabSwitch was called on init
  console.log('\n5. Checking Initialization...');
  const tabManagerInitialized = document.querySelector('.main-nav-tab') !== null;
  results.initialization = {
    tabManagerInitialized,
    tabButtonsExist: document.querySelectorAll('.main-nav-tab').length > 0,
    tabContentsExist: document.querySelectorAll('.main-tab-content').length > 0
  };
  console.log('   Initialization:', results.initialization);

  // Summary
  console.log('\n============================================');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('============================================');
  console.log('Issues Found:', results.issues.length);
  results.issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
  
  console.log('\n✅ Expected State:');
  console.log('  - Active tab button should match active tab content');
  console.log('  - triggerTabSwitch() should be called after refreshDisplay() on init');
  console.log('  - Tab content visibility should be updated on initialization');
  
  console.log('\n📋 Full Results:', JSON.stringify(results, null, 2));
  
  return results;
})();

