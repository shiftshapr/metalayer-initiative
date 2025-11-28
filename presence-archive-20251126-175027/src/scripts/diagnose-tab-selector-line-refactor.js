/**
 * Diagnostic Script: Tab Selector Line Refactor Analysis
 * 
 * Comprehensive diagnosis of tab selector line issues and manage tab padding
 * 
 * Usage: Copy and paste into browser console
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Tab Selector Line Refactor Analysis');
  console.log('==========================================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    tabButtons: {
      all: [],
      active: null,
      issues: []
    },
    selectorLines: {
      settings: null,
      manage: null,
      other: [],
      issues: []
    },
    manageTabContent: {
      exists: false,
      padding: null,
      issues: []
    },
    cssRules: {
      loaded: false,
      rules: [],
      issues: []
    },
    recommendations: []
  };

  if (typeof document === 'undefined') {
    results.tabButtons.issues.push('Document not available');
    console.log('❌ Document not available');
    return results;
  }

  // 1. Check all tab buttons
  console.log('1. Analyzing Tab Buttons...');
  const allTabButtons = document.querySelectorAll('.main-nav-tab[data-tab]');
  results.tabButtons.all = Array.from(allTabButtons).map(btn => {
    const tabId = btn.getAttribute('data-tab');
    const isActive = btn.classList.contains('active');
    const styles = window.getComputedStyle(btn);
    
    return {
      tabId: tabId,
      isActive: isActive,
      hasActiveClass: isActive,
      borderBottom: styles.borderBottom,
      borderBottomColor: styles.borderBottomColor,
      borderBottomWidth: styles.borderBottomWidth,
      borderBottomStyle: styles.borderBottomStyle,
      color: styles.color,
      fontWeight: styles.fontWeight
    };
  });

  const activeTab = results.tabButtons.all.find(t => t.isActive);
  results.tabButtons.active = activeTab;

  console.log(`   Found ${results.tabButtons.all.length} tab buttons`);
  console.log(`   Active tab: ${activeTab ? activeTab.tabId : 'none'}`);

  // 2. Check selector lines for Settings and Manage
  console.log('\n2. Analyzing Selector Lines...');
  
  const settingsButton = document.querySelector('[data-tab="settings-tab"]');
  if (settingsButton) {
    const styles = window.getComputedStyle(settingsButton);
    const isActive = settingsButton.classList.contains('active');
    const hasSelectorLine = isActive && 
      styles.borderBottomColor !== 'transparent' && 
      styles.borderBottomColor !== 'rgba(0, 0, 0, 0)' &&
      parseFloat(styles.borderBottomWidth) >= 3;
    
    results.selectorLines.settings = {
      isActive: isActive,
      hasSelectorLine: hasSelectorLine,
      borderBottom: styles.borderBottom,
      borderBottomColor: styles.borderBottomColor,
      borderBottomWidth: styles.borderBottomWidth,
      borderBottomStyle: styles.borderBottomStyle,
      color: styles.color,
      fontWeight: styles.fontWeight
    };

    if (isActive && !hasSelectorLine) {
      results.selectorLines.issues.push('Settings tab is active but selector line not visible');
    }

    console.log('   Settings Tab:', {
      active: isActive,
      selectorLineVisible: hasSelectorLine,
      borderBottom: styles.borderBottom,
      borderBottomColor: styles.borderBottomColor
    });
  } else {
    results.selectorLines.issues.push('Settings tab button not found');
    console.log('   ❌ Settings Tab Button: Not found');
  }

  const manageButton = document.querySelector('[data-tab="manage-tab"]');
  if (manageButton) {
    const styles = window.getComputedStyle(manageButton);
    const isActive = manageButton.classList.contains('active');
    const hasSelectorLine = isActive && 
      styles.borderBottomColor !== 'transparent' && 
      styles.borderBottomColor !== 'rgba(0, 0, 0, 0)' &&
      parseFloat(styles.borderBottomWidth) >= 3;
    
    results.selectorLines.manage = {
      isActive: isActive,
      hasSelectorLine: hasSelectorLine,
      borderBottom: styles.borderBottom,
      borderBottomColor: styles.borderBottomColor,
      borderBottomWidth: styles.borderBottomWidth,
      borderBottomStyle: styles.borderBottomStyle,
      color: styles.color,
      fontWeight: styles.fontWeight
    };

    if (isActive && !hasSelectorLine) {
      results.selectorLines.issues.push('Manage tab is active but selector line not visible');
    }

    console.log('   Manage Tab:', {
      active: isActive,
      selectorLineVisible: hasSelectorLine,
      borderBottom: styles.borderBottom,
      borderBottomColor: styles.borderBottomColor
    });
  } else {
    results.selectorLines.issues.push('Manage tab button not found');
    console.log('   ❌ Manage Tab Button: Not found');
  }

  // Check other tabs for comparison
  const otherTabs = results.tabButtons.all.filter(t => 
    t.tabId !== 'settings-tab' && t.tabId !== 'manage-tab'
  );
  results.selectorLines.other = otherTabs.map(tab => {
    const btn = document.querySelector(`[data-tab="${tab.tabId}"]`);
    if (btn) {
      const styles = window.getComputedStyle(btn);
      const hasSelectorLine = tab.isActive && 
        styles.borderBottomColor !== 'transparent' && 
        styles.borderBottomColor !== 'rgba(0, 0, 0, 0)' &&
        parseFloat(styles.borderBottomWidth) >= 3;
      
      return {
        tabId: tab.tabId,
        isActive: tab.isActive,
        hasSelectorLine: hasSelectorLine,
        borderBottom: styles.borderBottom,
        borderBottomColor: styles.borderBottomColor
      };
    }
    return null;
  }).filter(Boolean);

  // 3. Check manage tab content padding
  console.log('\n3. Analyzing Manage Tab Content...');
  const manageTabContent = document.getElementById('manage-tab');
  if (manageTabContent) {
    results.manageTabContent.exists = true;
    const styles = window.getComputedStyle(manageTabContent);
    results.manageTabContent.padding = {
      top: styles.paddingTop,
      right: styles.paddingRight,
      bottom: styles.paddingBottom,
      left: styles.paddingLeft,
      all: styles.padding
    };

    const hasNoPadding = parseFloat(styles.paddingTop) === 0 && 
      parseFloat(styles.paddingRight) === 0 &&
      parseFloat(styles.paddingBottom) === 0 &&
      parseFloat(styles.paddingLeft) === 0;

    if (hasNoPadding) {
      results.manageTabContent.issues.push('Manage tab content has no padding - content touching container sides');
    }

    console.log('   Manage Tab Content:', {
      exists: true,
      padding: results.manageTabContent.padding.all,
      paddingTop: styles.paddingTop,
      paddingRight: styles.paddingRight,
      paddingBottom: styles.paddingBottom,
      paddingLeft: styles.paddingLeft
    });
  } else {
    results.manageTabContent.issues.push('Manage tab content not found');
    console.log('   ❌ Manage Tab Content: Not found');
  }

  // 4. Check CSS rules
  console.log('\n4. Analyzing CSS Rules...');
  const styleSheets = Array.from(document.styleSheets);
  let foundSidepanelCSS = false;
  let foundTabManagerCSS = false;

  styleSheets.forEach(sheet => {
    try {
      if (sheet.href && (sheet.href.includes('sidepanel.css') || sheet.href.includes('tab-manager.css'))) {
        if (sheet.href.includes('sidepanel.css')) {
          foundSidepanelCSS = true;
        }
        if (sheet.href.includes('tab-manager.css')) {
          foundTabManagerCSS = true;
        }

        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule.selectorText) {
            if (rule.selectorText.includes('.main-nav-tab') && 
                (rule.selectorText.includes('.active') || rule.selectorText.includes('manage-button') || rule.selectorText.includes('settings-tab'))) {
              results.cssRules.rules.push({
                selector: rule.selectorText,
                href: sheet.href,
                style: rule.style.cssText
              });
            }
          }
        });
      }
    } catch (e) {
      // Cross-origin stylesheets may throw errors
    }
  });

  results.cssRules.loaded = foundSidepanelCSS && foundTabManagerCSS;
  if (!foundSidepanelCSS) {
    results.cssRules.issues.push('sidepanel.css not found in loaded stylesheets');
  }
  if (!foundTabManagerCSS) {
    results.cssRules.issues.push('tab-manager.css not found in loaded stylesheets');
  }

  console.log('   CSS Files:', {
    sidepanelCSS: foundSidepanelCSS,
    tabManagerCSS: foundTabManagerCSS,
    relevantRules: results.cssRules.rules.length
  });

  // Generate recommendations
  if (results.selectorLines.issues.length > 0) {
    results.recommendations.push('Fix selector line CSS rules - ensure active tabs show 4px blue border-bottom');
  }
  if (results.manageTabContent.issues.length > 0) {
    results.recommendations.push('Add padding to manage tab content (e.g., padding: 16px)');
  }
  if (results.cssRules.issues.length > 0) {
    results.recommendations.push('Verify CSS files are loaded correctly');
  }

  // Summary
  console.log('\n==========================================================');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('==========================================================');
  console.log('Tab Buttons:', results.tabButtons.all.length);
  console.log('Active Tab:', results.tabButtons.active ? results.tabButtons.active.tabId : 'none');
  console.log('Selector Line Issues:', results.selectorLines.issues.length);
  results.selectorLines.issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
  console.log('Manage Tab Content Issues:', results.manageTabContent.issues.length);
  results.manageTabContent.issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
  console.log('CSS Rule Issues:', results.cssRules.issues.length);
  results.cssRules.issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
  console.log('\nRecommendations:');
  results.recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
  
  console.log('\n📋 Full Results:', JSON.stringify(results, null, 2));
  
  return results;
})();

