/**
 * DIAGNOSTIC SCRIPT: Community Dropdown and Logo Issues
 * PURPOSE: Diagnose why dropdown and logo are not working
 * USAGE: Copy this entire script and paste into browser console
 */

(function() {
  console.log('🔍 === DROPDOWN & LOGO DIAGNOSTIC ===\n');
  
  const results = {
    dropdown: {},
    logo: {},
    issues: [],
    fixes: []
  };
  
  // 1. Check Logo
  console.log('1️⃣ Checking Logo...');
  const logo = document.getElementById('primary-community-logo');
  if (logo) {
    const logoStyles = window.getComputedStyle(logo);
    const logoSrc = logo.src;
    const logoDisplay = logoStyles.display;
    const logoVisibility = logoStyles.visibility;
    const logoOpacity = logoStyles.opacity;
    const logoWidth = logoStyles.width;
    const logoHeight = logoStyles.height;
    
    results.logo = {
      found: true,
      src: logoSrc,
      display: logoDisplay,
      visibility: logoVisibility,
      opacity: logoOpacity,
      width: logoWidth,
      height: logoHeight,
      complete: logo.complete,
      naturalWidth: logo.naturalWidth,
      naturalHeight: logo.naturalHeight
    };
    
    console.log('   ✅ Logo element found');
    console.log('   📍 Logo src:', logoSrc);
    console.log('   📍 Logo display:', logoDisplay);
    console.log('   📍 Logo visibility:', logoVisibility);
    console.log('   📍 Logo opacity:', logoOpacity);
    console.log('   📍 Logo dimensions:', logoWidth, 'x', logoHeight);
    console.log('   📍 Logo loaded:', logo.complete, '| Natural size:', logo.naturalWidth, 'x', logo.naturalHeight);
    
    if (logoDisplay === 'none') {
      results.issues.push('Logo has display: none');
      results.fixes.push('Set logo.style.display = "block"');
    }
    if (logoVisibility === 'hidden') {
      results.issues.push('Logo has visibility: hidden');
      results.fixes.push('Set logo.style.visibility = "visible"');
    }
    if (logoOpacity === '0') {
      results.issues.push('Logo has opacity: 0');
      results.fixes.push('Set logo.style.opacity = "1"');
    }
    if (!logo.complete || logo.naturalWidth === 0) {
      results.issues.push('Logo image not loaded');
      console.log('   ⚠️ Logo image failed to load');
      if (logoSrc && !logoSrc.startsWith('http') && !logoSrc.startsWith('/')) {
        results.issues.push('Logo src is not a valid URL');
        results.fixes.push('Logo src must be absolute URL or path starting with /');
      }
    }
  } else {
    results.logo.found = false;
    results.issues.push('Logo element not found');
    console.log('   ❌ Logo element NOT found');
  }
  
  // 2. Check Dropdown
  console.log('\n2️⃣ Checking Dropdown...');
  const trigger = document.querySelector('.community-dropdown-trigger');
  const panel = document.getElementById('community-dropdown-panel');
  const communityList = document.querySelector('.community-list');
  
  if (trigger) {
    console.log('   ✅ Dropdown trigger found');
    const triggerStyles = window.getComputedStyle(trigger);
    console.log('   📍 Trigger display:', triggerStyles.display);
    console.log('   📍 Trigger pointer-events:', triggerStyles.pointerEvents);
    console.log('   📍 Trigger cursor:', triggerStyles.cursor);
    
    // Check for click listeners
    const listeners = getEventListeners ? getEventListeners(trigger) : null;
    if (listeners) {
      console.log('   📍 Click listeners:', Object.keys(listeners));
      results.dropdown.hasListener = listeners.click && listeners.click.length > 0;
    } else {
      console.log('   ⚠️ Cannot check listeners (DevTools only)');
    }
  } else {
    results.issues.push('Dropdown trigger not found');
    console.log('   ❌ Dropdown trigger NOT found');
  }
  
  if (panel) {
    console.log('   ✅ Dropdown panel found');
    const panelStyles = window.getComputedStyle(panel);
    const inlineDisplay = panel.style.display;
    const computedDisplay = panelStyles.display;
    const panelPosition = panelStyles.position;
    const panelZIndex = panelStyles.zIndex;
    const panelTop = panelStyles.top;
    const panelRight = panelStyles.right;
    const panelVisibility = panelStyles.visibility;
    const panelOpacity = panelStyles.opacity;
    
    results.dropdown.panel = {
      found: true,
      inlineDisplay: inlineDisplay,
      computedDisplay: computedDisplay,
      position: panelPosition,
      zIndex: panelZIndex,
      top: panelTop,
      right: panelRight,
      visibility: panelVisibility,
      opacity: panelOpacity,
      hasShowClass: panel.classList.contains('show')
    };
    
    console.log('   📍 Panel inline display:', inlineDisplay || 'none');
    console.log('   📍 Panel computed display:', computedDisplay);
    console.log('   📍 Panel position:', panelPosition);
    console.log('   📍 Panel z-index:', panelZIndex);
    console.log('   📍 Panel top:', panelTop);
    console.log('   📍 Panel right:', panelRight);
    console.log('   📍 Panel visibility:', panelVisibility);
    console.log('   📍 Panel opacity:', panelOpacity);
    console.log('   📍 Panel has .show class:', panel.classList.contains('show'));
    
    if (computedDisplay === 'none' && inlineDisplay !== 'block') {
      results.issues.push('Dropdown panel is hidden');
      results.fixes.push('Set panel.style.display = "block" and panel.classList.add("show")');
    }
    if (parseInt(panelZIndex) < 1000) {
      results.issues.push('Dropdown z-index might be too low');
    }
  } else {
    results.dropdown.panel = { found: false };
    results.issues.push('Dropdown panel not found');
    console.log('   ❌ Dropdown panel NOT found');
  }
  
  if (communityList) {
    const listItems = communityList.children;
    console.log('   ✅ Community list found');
    console.log('   📍 Communities in list:', listItems.length);
    results.dropdown.communitiesCount = listItems.length;
    
    Array.from(listItems).forEach((item, index) => {
      const name = item.querySelector('.community-name')?.textContent || 'Unknown';
      const hasCheckbox = !!item.querySelector('.community-checkbox');
      const hasMenuBtn = !!item.querySelector('.community-menu-btn');
      console.log(`   📍 Community ${index + 1}: ${name} (checkbox: ${hasCheckbox}, menu: ${hasMenuBtn})`);
    });
  } else {
    results.issues.push('Community list not found');
    console.log('   ❌ Community list NOT found');
  }
  
  // 3. Check Header Structure
  console.log('\n3️⃣ Checking Header Structure...');
  const headerLeft = document.querySelector('.header-left');
  const logoContainer = document.querySelector('.logo-container');
  
  if (headerLeft) {
    const headerStyles = window.getComputedStyle(headerLeft);
    console.log('   ✅ Header-left found');
    console.log('   📍 Header-left display:', headerStyles.display);
    console.log('   📍 Header-left flex:', headerStyles.flex);
  } else {
    results.issues.push('Header-left not found');
    console.log('   ❌ Header-left NOT found');
  }
  
  if (logoContainer) {
    const containerStyles = window.getComputedStyle(logoContainer);
    console.log('   ✅ Logo container found');
    console.log('   📍 Container display:', containerStyles.display);
    console.log('   📍 Container visibility:', containerStyles.visibility);
  } else {
    results.issues.push('Logo container not found');
    console.log('   ❌ Logo container NOT found');
  }
  
  // 4. Summary
  console.log('\n📊 === DIAGNOSTIC SUMMARY ===');
  console.log('Issues found:', results.issues.length);
  results.issues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue}`);
  });
  
  if (results.fixes.length > 0) {
    console.log('\n💡 Suggested Fixes:');
    results.fixes.forEach((fix, i) => {
      console.log(`   ${i + 1}. ${fix}`);
    });
  }
  
  // 5. Manual Test Functions
  console.log('\n🔧 Manual Test Functions:');
  console.log('   Run: testLogo() - to test logo visibility');
  console.log('   Run: testDropdown() - to test dropdown toggle');
  console.log('   Run: fixLogo() - to force logo visibility');
  console.log('   Run: fixDropdown() - to force dropdown visibility');
  
  window.testLogo = function() {
    if (logo) {
      logo.style.display = 'block';
      logo.style.visibility = 'visible';
      logo.style.opacity = '1';
      console.log('✅ Logo forced visible');
      console.log('   Current src:', logo.src);
      console.log('   Computed display:', window.getComputedStyle(logo).display);
    }
  };
  
  window.testDropdown = function() {
    if (panel) {
      const isVisible = panel.style.display === 'block' || panel.classList.contains('show');
      if (isVisible) {
        panel.style.display = 'none';
        panel.classList.remove('show');
        console.log('✅ Dropdown hidden');
      } else {
        panel.style.display = 'block';
        panel.classList.add('show');
        console.log('✅ Dropdown shown');
      }
      console.log('   Computed display:', window.getComputedStyle(panel).display);
    }
  };
  
  window.fixLogo = function() {
    if (logo) {
      logo.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; width: 24px !important; height: 24px !important;';
      console.log('✅ Logo CSS forced');
    }
  };
  
  window.fixDropdown = function() {
    if (panel) {
      panel.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
      panel.classList.add('show');
      console.log('✅ Dropdown CSS forced');
    }
  };
  
  return results;
})();

