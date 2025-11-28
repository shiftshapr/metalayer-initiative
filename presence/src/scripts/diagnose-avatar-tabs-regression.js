/**
 * Diagnostic Script: Avatar Border/Glow and Tab Visibility Regression
 * 
 * PURPOSE: Diagnose why profile avatar has border and no glow, and why tabs are not visible
 * 
 * USAGE: Copy this entire script and paste into browser console on a page with Canopi extension loaded
 * 
 * OUTPUT: Console logs with diagnostic results, issues found, and recommendations
 * 
 * CRITICAL: This is pure JavaScript - NO TypeScript syntax, NO imports/exports
 */

(async function() {
  'use strict';
  
  console.log('🔍 DIAGNOSTIC: Avatar Border/Glow and Tab Visibility Regression');
  console.log('==============================================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    issues: [],
    recommendations: []
  };
  
  // Check 1: Avatar elements and styling
  console.log('\n📋 Check 1: Avatar Elements and Styling');
  const avatarElements = document.querySelectorAll('.profile-avatar, .item-avatar, [class*="avatar"], [data-avatar]');
  console.log(`  Found ${avatarElements.length} avatar elements`);
  
  const avatarStyles = [];
  avatarElements.forEach((el, idx) => {
    const computed = window.getComputedStyle(el);
    const img = el.querySelector('img') || (el.tagName === 'IMG' ? el : null);
    const imgComputed = img ? window.getComputedStyle(img) : null;
    
    const styleInfo = {
      index: idx,
      element: el.className || el.tagName,
      hasBorder: computed.borderWidth !== '0px' || (imgComputed && imgComputed.borderWidth !== '0px'),
      borderWidth: computed.borderWidth || (imgComputed ? imgComputed.borderWidth : 'none'),
      borderColor: computed.borderColor || (imgComputed ? imgComputed.borderColor : 'none'),
      hasBoxShadow: computed.boxShadow !== 'none',
      boxShadow: computed.boxShadow,
      hasGlow: computed.boxShadow && computed.boxShadow.includes('rgba') && computed.boxShadow.includes('0 0'),
      hasAura: !!el.querySelector('.avatar-aura'),
      zIndex: computed.zIndex,
      position: computed.position
    };
    
    avatarStyles.push(styleInfo);
    console.log(`  Element ${idx + 1}:`, styleInfo);
    
    if (styleInfo.hasBorder && !styleInfo.hasGlow) {
      results.issues.push(`Avatar element ${idx + 1} has border but no glow`);
    }
    if (!styleInfo.hasAura && el.className.includes('profile-avatar')) {
      results.issues.push(`Profile avatar ${idx + 1} missing aura element`);
    }
  });
  
  results.checks.avatarElements = {
    count: avatarElements.length,
    styles: avatarStyles
  };
  
  // Check 2: AvatarUtils usage
  console.log('\n📋 Check 2: AvatarUtils and Avatar Generation');
  if (window.AvatarUtils || window.avatarUtils) {
    console.log('  AvatarUtils available:', !!window.AvatarUtils || !!window.avatarUtils);
  } else {
    console.log('  AvatarUtils not available on window');
    results.issues.push('AvatarUtils not available on window object');
  }
  
  // Check 3: Tab visibility
  console.log('\n📋 Check 3: Tab Visibility');
  const tabElements = document.querySelectorAll('.main-nav-tab, [data-tab], [role="tab"]');
  console.log(`  Found ${tabElements.length} tab elements`);
  
  const tabInfo = [];
  tabElements.forEach((tab, idx) => {
    const computed = window.getComputedStyle(tab);
    const tabData = {
      index: idx,
      id: tab.getAttribute('data-tab') || tab.id || 'unknown',
      label: tab.textContent?.trim() || 'no label',
      visible: computed.display !== 'none' && computed.visibility !== 'hidden',
      display: computed.display,
      visibility: computed.visibility,
      isManage: tab.getAttribute('data-tab') === 'manage-tab' || tab.id === 'tab-manager-button'
    };
    
    tabInfo.push(tabData);
    console.log(`  Tab ${idx + 1}:`, tabData);
    
    if (!tabData.visible && !tabData.isManage) {
      results.issues.push(`Tab "${tabData.id}" is not visible`);
    }
  });
  
  results.checks.tabs = {
    count: tabElements.length,
    tabs: tabInfo,
    visibleCount: tabInfo.filter(t => t.visible).length,
    manageOnly: tabInfo.filter(t => t.visible && !t.isManage).length === 0
  };
  
  if (results.checks.tabs.manageOnly) {
    results.issues.push('Only Manage tab is visible - other tabs are hidden');
  }
  
  // Check 4: TabManager state
  console.log('\n📋 Check 4: TabManager State');
  if (window.tabContextManager || window.TabManager) {
    console.log('  TabManager available');
    try {
      const tabManager = window.tabContextManager || window.TabManager;
      if (tabManager.getState) {
        const state = tabManager.getState();
        console.log('  TabManager state:', state);
        results.checks.tabManagerState = state;
        
        if (state && state.tabs) {
          const visibleTabs = state.tabs.filter(t => t.visible);
          const builtInTabs = state.tabs.filter(t => t.builtIn);
          const hiddenBuiltInTabs = builtInTabs.filter(t => !t.visible);
          
          console.log(`  Total tabs: ${state.tabs.length}`);
          console.log(`  Built-in tabs: ${builtInTabs.length}`);
          console.log(`  Visible tabs: ${visibleTabs.length}`);
          console.log(`  Hidden built-in tabs: ${hiddenBuiltInTabs.length}`);
          console.log('  Visible tab IDs:', visibleTabs.map(t => t.id));
          console.log('  All tab IDs:', state.tabs.map(t => ({ id: t.id, visible: t.visible, builtIn: t.builtIn })));
          
          if (visibleTabs.length === 0 || (visibleTabs.length === 1 && visibleTabs[0].id === 'manage-tab')) {
            results.issues.push('TabManager state shows no visible tabs (or only manage-tab)');
          }
          
          if (hiddenBuiltInTabs.length > 0) {
            results.issues.push(`Built-in tabs are hidden: ${hiddenBuiltInTabs.map(t => t.id).join(', ')}`);
          }
        }
        
        // Check getActiveTab method
        if (tabManager.getActiveTab) {
          const activeTab = tabManager.getActiveTab();
          console.log(`  Active tab: ${activeTab || 'none'}`);
        }
      } else {
        console.log('  TabManager.getState() not available');
        results.issues.push('TabManager.getState() method not available');
      }
    } catch (error) {
      console.error('  Error accessing TabManager state:', error);
      results.issues.push('Error accessing TabManager state: ' + error.message);
    }
  } else {
    console.log('  TabManager not available on window');
    results.issues.push('TabManager not available on window object - check initializeTabManager.ts');
  }
  
  // Check 5: CSS for avatar glow
  console.log('\n📋 Check 5: CSS Rules for Avatar Glow');
  const styleSheets = Array.from(document.styleSheets);
  let foundGlowRules = false;
  
  styleSheets.forEach((sheet, sheetIdx) => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach((rule, ruleIdx) => {
        if (rule.selectorText && (
          rule.selectorText.includes('avatar') || 
          rule.selectorText.includes('aura') ||
          rule.selectorText.includes('glow')
        )) {
          if (rule.style && (rule.style.boxShadow || rule.style.filter)) {
            console.log(`  Found rule: ${rule.selectorText}`);
            console.log(`    box-shadow: ${rule.style.boxShadow || 'none'}`);
            console.log(`    filter: ${rule.style.filter || 'none'}`);
            foundGlowRules = true;
          }
        }
      });
    } catch (e) {
      // Cross-origin stylesheets may throw
    }
  });
  
  if (!foundGlowRules) {
    results.issues.push('No CSS rules found for avatar glow/box-shadow');
  }
  
  results.checks.cssGlowRules = foundGlowRules;
  
  // Check 6: Avatar aura generation
  console.log('\n📋 Check 6: Avatar Aura Generation');
  const auraElements = document.querySelectorAll('.avatar-aura, [class*="aura"]');
  console.log(`  Found ${auraElements.length} aura elements`);
  
  const auraDetails = [];
  auraElements.forEach((el, idx) => {
    const computed = window.getComputedStyle(el);
    const inlineStyle = el.getAttribute('style') || '';
    const hasInlineBoxShadow = inlineStyle.includes('box-shadow') || inlineStyle.includes('boxShadow');
    
    const auraInfo = {
      index: idx,
      background: computed.backgroundColor,
      boxShadow: computed.boxShadow,
      boxShadowComputed: computed.boxShadow,
      hasInlineBoxShadow: hasInlineBoxShadow,
      inlineStyle: inlineStyle.substring(0, 100), // First 100 chars
      zIndex: computed.zIndex,
      position: computed.position,
      parent: el.parentElement?.className || 'no parent'
    };
    
    auraDetails.push(auraInfo);
    console.log(`  Aura ${idx + 1}:`, auraInfo);
    
    // Check if box-shadow is none despite inline style
    if (hasInlineBoxShadow && computed.boxShadow === 'none') {
      results.issues.push(`Aura element ${idx + 1} has inline box-shadow but computed value is 'none' - CSS override detected`);
    }
  });
  
  results.checks.auraElements = {
    count: auraElements.length,
    details: auraDetails
  };
  
  if (auraElements.length === 0) {
    results.issues.push('No aura elements found - avatar glow may not be rendering');
  }
  
  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('====================');
  console.log(`Issues found: ${results.issues.length}`);
  results.issues.forEach((issue, idx) => {
    console.log(`  ${idx + 1}. ${issue}`);
  });
  
  console.log('\n💡 Recommendations:');
  if (results.issues.length > 0) {
    if (results.issues.some(i => i.includes('border') || i.includes('glow'))) {
      results.recommendations.push('Check AvatarUtils.ts - ensure showAura is true and aura is rendered with box-shadow');
      results.recommendations.push('Check CSS for .avatar-aura - should have box-shadow for glow effect');
      results.recommendations.push('Verify avatar image does not have border styles applied');
    }
    if (results.issues.some(i => i.includes('tab') || i.includes('TabManager'))) {
      results.recommendations.push('Check TabManager configuration - verify tabs have visible: true');
      results.recommendations.push('Check TabDisplay.render() - ensure visible tabs are being rendered');
      results.recommendations.push('Verify TabManager state is loaded correctly from storage');
    }
  } else {
    results.recommendations.push('No issues found - avatar and tabs appear to be working correctly');
  }
  
  results.recommendations.forEach((rec, idx) => {
    console.log(`  ${idx + 1}. ${rec}`);
  });
  
  console.log('\n📋 Full Results Object:');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
})();

