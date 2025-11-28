/**
 * Diagnostic Script: Manage Tab and Settings Tab Selector Issues
 * 
 * Diagnoses:
 * 1. Manage tab selector line not displaying
 * 2. Navigation stuck on Manage tab
 * 3. Settings tab selector line positioning inconsistent
 * 
 * Usage: Copy and paste into browser console
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Manage Tab and Settings Tab Selector Issues');
  console.log('==========================================================\n');

  const result = {
    timestamp: new Date().toISOString(),
    manageTab: {
      button: {
        exists: false,
        hasActiveClass: false,
        hasDataTab: false,
        dataTabValue: null,
        selectorLineVisible: false
      },
      content: {
        exists: false,
        hasActiveClass: false,
        isVisible: false
      }
    },
    settingsTab: {
      button: {
        exists: false,
        hasActiveClass: false,
        selectorLineVisible: false,
        selectorLinePosition: {
          bottom: null,
          height: null,
          left: null,
          right: null
        }
      }
    },
    otherTabs: {
      count: 0,
      activeCount: 0,
      selectorLinePositions: []
    },
    tabSwitching: {
      manageTabStaysActive: false,
      canSwitchAway: false
    },
    issues: []
  };

  if (typeof document === 'undefined') {
    result.issues.push('Document not available');
    console.log('❌ Document not available');
    return result;
  }

  // Check Manage tab button
  console.log('1. Checking Manage Tab Button...');
  const manageButton = document.querySelector('[data-tab="manage-tab"]') || 
                       document.querySelector('#tab-manager-button');
  if (manageButton) {
    result.manageTab.button.exists = true;
    result.manageTab.button.hasActiveClass = manageButton.classList.contains('active');
    result.manageTab.button.hasDataTab = manageButton.hasAttribute('data-tab');
    result.manageTab.button.dataTabValue = manageButton.getAttribute('data-tab');
    
    // Check selector line (border-bottom)
    const styles = window.getComputedStyle(manageButton);
    result.manageTab.button.selectorLineVisible = 
      styles.borderBottomColor !== 'transparent' && 
      styles.borderBottomWidth !== '0px' &&
      manageButton.classList.contains('active');
    
    console.log('   Manage Button:', {
      exists: true,
      hasActiveClass: result.manageTab.button.hasActiveClass,
      hasDataTab: result.manageTab.button.hasDataTab,
      dataTabValue: result.manageTab.button.dataTabValue,
      selectorLineVisible: result.manageTab.button.selectorLineVisible,
      borderBottom: styles.borderBottom,
      borderBottomColor: styles.borderBottomColor
    });
    
    if (!result.manageTab.button.hasDataTab) {
      result.issues.push('Manage button missing data-tab attribute');
    }
    if (result.manageTab.button.hasActiveClass && !result.manageTab.button.selectorLineVisible) {
      result.issues.push('Manage tab is active but selector line not visible');
    }
  } else {
    result.issues.push('Manage tab button not found');
    console.log('   ❌ Manage Button: Not found');
  }

  // Check Manage tab content
  console.log('\n2. Checking Manage Tab Content...');
  const manageContent = document.getElementById('manage-tab');
  if (manageContent) {
    result.manageTab.content.exists = true;
    result.manageTab.content.hasActiveClass = manageContent.classList.contains('active');
    const contentStyles = window.getComputedStyle(manageContent);
    result.manageTab.content.isVisible = 
      contentStyles.display !== 'none' && 
      contentStyles.visibility !== 'hidden';
    
    console.log('   Manage Tab Content:', {
      exists: true,
      hasActiveClass: result.manageTab.content.hasActiveClass,
      isVisible: result.manageTab.content.isVisible,
      display: contentStyles.display,
      visibility: contentStyles.visibility
    });
  } else {
    result.issues.push('Manage tab content not found');
    console.log('   ❌ Manage Tab Content: Not found');
  }

  // Check Settings tab button
  console.log('\n3. Checking Settings Tab Button...');
  const settingsButton = document.querySelector('[data-tab="settings-tab"]');
  if (settingsButton) {
    result.settingsTab.button.exists = true;
    result.settingsTab.button.hasActiveClass = settingsButton.classList.contains('active');
    
    // Check selector line position
    const settingsStyles = window.getComputedStyle(settingsButton);
    result.settingsTab.button.selectorLineVisible = 
      settingsStyles.borderBottomColor !== 'transparent' && 
      settingsStyles.borderBottomWidth !== '0px' &&
      settingsButton.classList.contains('active');
    
    result.settingsTab.button.selectorLinePosition = {
      bottom: settingsStyles.borderBottom,
      height: settingsStyles.height,
      left: settingsStyles.paddingLeft,
      right: settingsStyles.paddingRight
    };
    
    console.log('   Settings Tab Button:', {
      exists: true,
      hasActiveClass: result.settingsTab.button.hasActiveClass,
      selectorLineVisible: result.settingsTab.button.selectorLineVisible,
      borderBottom: settingsStyles.borderBottom,
      borderBottomColor: settingsStyles.borderBottomColor,
      borderBottomWidth: settingsStyles.borderBottomWidth
    });
  } else {
    result.issues.push('Settings tab button not found');
    console.log('   ❌ Settings Tab Button: Not found');
  }

  // Check other tabs for comparison
  console.log('\n4. Checking Other Tabs for Comparison...');
  const allTabs = document.querySelectorAll('.main-nav-tab[data-tab]:not([data-tab="manage-tab"]):not([data-tab="settings-tab"])');
  result.otherTabs.count = allTabs.length;
  
  allTabs.forEach((tab) => {
    const tabElement = tab;
    const tabId = tabElement.getAttribute('data-tab');
    if (tabElement.classList.contains('active')) {
      result.otherTabs.activeCount++;
    }
    
    const tabStyles = window.getComputedStyle(tabElement);
    result.otherTabs.selectorLinePositions.push({
      tabId: tabId || 'unknown',
      borderBottom: tabStyles.borderBottom,
      borderBottomColor: tabStyles.borderBottomColor,
      borderBottomWidth: tabStyles.borderBottomWidth
    });
  });

  console.log('   Other Tabs:', {
    count: result.otherTabs.count,
    activeCount: result.otherTabs.activeCount,
    selectorLinePositions: result.otherTabs.selectorLinePositions
  });

  // Check if Settings tab selector position matches other tabs
  if (result.settingsTab.button.selectorLinePosition.bottom && result.otherTabs.selectorLinePositions.length > 0) {
    const settingsBorderBottom = result.settingsTab.button.selectorLinePosition.bottom;
    const otherTabsBorderBottom = result.otherTabs.selectorLinePositions[0]?.borderBottom;
    if (settingsBorderBottom !== otherTabsBorderBottom) {
      result.issues.push(`Settings tab selector line position (${settingsBorderBottom}) does not match other tabs (${otherTabsBorderBottom})`);
    }
  }

  // Test tab switching
  console.log('\n5. Testing Tab Switching...');
  if (manageButton && manageButton.classList.contains('active')) {
    // Try to switch to another tab
    const otherTab = document.querySelector('.main-nav-tab[data-tab]:not([data-tab="manage-tab"])');
    if (otherTab) {
      console.log('   Attempting to switch away from Manage tab...');
      otherTab.click();
      setTimeout(() => {
        result.tabSwitching.manageTabStaysActive = manageButton.classList.contains('active');
        result.tabSwitching.canSwitchAway = !result.tabSwitching.manageTabStaysActive;
        if (result.tabSwitching.manageTabStaysActive) {
          result.issues.push('Cannot switch away from Manage tab - navigation stuck');
          console.log('   ❌ Navigation stuck on Manage tab');
        } else {
          console.log('   ✅ Successfully switched away from Manage tab');
        }
      }, 100);
    }
  } else {
    console.log('   ℹ️ Manage tab is not currently active, skipping switch test');
  }

  // Summary
  console.log('\n==========================================================');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('==========================================================');
  console.log('Issues Found:', result.issues.length);
  result.issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
  
  console.log('\n✅ Expected State:');
  console.log('  - Manage button should have data-tab="manage-tab"');
  console.log('  - Manage button should show selector line when active');
  console.log('  - manage-tab content div should exist with class "main-tab-content"');
  console.log('  - Tab switching should work (can switch away from Manage)');
  console.log('  - Settings tab selector line should match other tabs');
  
  console.log('\n📋 Full Results:', JSON.stringify(result, null, 2));
  
  return result;
})();

