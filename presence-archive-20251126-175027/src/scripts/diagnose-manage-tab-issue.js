/**
 * Diagnostic Script: Manage Tab Display Issue
 * 
 * This script diagnoses why the manage tab doesn't properly show/hide when switching tabs.
 * 
 * Usage: Run in browser console after page loads
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Manage Tab Display Issue');
  console.log('==========================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    manageButton: null,
    manageTabContent: null,
    modalElement: null,
    tabSwitching: null,
    issues: []
  };

  // 1. Check if manage button exists and has proper attributes
  console.log('1. Checking Manage Button...');
  const manageButton = document.getElementById('tab-manager-button') || 
                       document.querySelector('.manage-button');
  results.manageButton = {
    exists: !!manageButton,
    hasDataTab: manageButton?.hasAttribute('data-tab'),
    dataTabValue: manageButton?.getAttribute('data-tab'),
    className: manageButton?.className,
    clickHandler: manageButton ? 'present' : 'missing'
  };
  
  if (!manageButton) {
    results.issues.push('Manage button not found');
  } else if (!manageButton.hasAttribute('data-tab')) {
    results.issues.push('Manage button missing data-tab attribute');
  }
  console.log('   Manage Button:', results.manageButton);

  // 2. Check if manage-tab content exists
  console.log('\n2. Checking Manage Tab Content...');
  const manageTabContent = document.getElementById('manage-tab');
  results.manageTabContent = {
    exists: !!manageTabContent,
    hasActiveClass: manageTabContent?.classList.contains('active'),
    hasMainTabContentClass: manageTabContent?.classList.contains('main-tab-content'),
    isVisible: manageTabContent ? 
      window.getComputedStyle(manageTabContent).display !== 'none' : null
  };
  
  if (!manageTabContent) {
    results.issues.push('manage-tab content div not found in HTML');
  }
  console.log('   Manage Tab Content:', results.manageTabContent);

  // 3. Check if modal element exists
  console.log('\n3. Checking Modal Element...');
  const modalElement = document.getElementById('tab-manager-modal');
  results.modalElement = {
    exists: !!modalElement,
    isVisible: modalElement ? 
      window.getComputedStyle(modalElement).display !== 'none' : null,
    isInBody: modalElement?.parentElement === document.body
  };
  console.log('   Modal Element:', results.modalElement);

  // 4. Check tab switching behavior
  console.log('\n4. Checking Tab Switching Logic...');
  const allTabs = document.querySelectorAll('.main-nav-tab[data-tab]');
  const allTabContents = document.querySelectorAll('.main-tab-content');
  results.tabSwitching = {
    totalTabs: allTabs.length,
    totalTabContents: allTabContents.length,
    activeTabs: Array.from(allTabs).filter(t => t.classList.contains('active')).length,
    activeTabContents: Array.from(allTabContents).filter(t => t.classList.contains('active')).length,
    tabIds: Array.from(allTabs).map(t => t.getAttribute('data-tab')),
    contentIds: Array.from(allTabContents).map(t => t.id)
  };
  console.log('   Tab Switching:', results.tabSwitching);

  // 5. Check if manage button is in tab list
  console.log('\n5. Checking Manage Button Integration...');
  const navMain = document.querySelector('.sidebar-nav-main');
  const manageButtonInNav = navMain?.contains(manageButton);
  results.manageButtonIntegration = {
    inNavMain: manageButtonInNav,
    navMainExists: !!navMain,
    allNavTabs: navMain ? Array.from(navMain.querySelectorAll('.main-nav-tab')).map(t => ({
      id: t.id,
      dataTab: t.getAttribute('data-tab'),
      className: t.className,
      isActive: t.classList.contains('active')
    })) : []
  };
  console.log('   Manage Button Integration:', results.manageButtonIntegration);

  // 6. Summary
  console.log('\n==========================================');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('==========================================');
  console.log('Issues Found:', results.issues.length);
  results.issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
  
  console.log('\n✅ Expected State:');
  console.log('  - Manage button should have data-tab="manage-tab"');
  console.log('  - manage-tab content div should exist with class "main-tab-content"');
  console.log('  - Modal should be moved into manage-tab content (or removed)');
  console.log('  - Tab switching should show/hide manage-tab content like other tabs');
  
  console.log('\n📋 Full Results:', JSON.stringify(results, null, 2));
  
  return results;
})();

