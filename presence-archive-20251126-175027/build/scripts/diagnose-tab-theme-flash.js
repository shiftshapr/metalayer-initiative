/**
 * Diagnostic Script: Tab Manager Theme Flash Issue
 * 
 * Problem: Tab system background flashes black on initial load in light mode
 * Root Cause Analysis: Check CSS variable initialization and fallback values
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Tab Theme Flash Analysis');
  console.log('=====================================\n');

  const diagnostics = {
    themeAttribute: null,
    cssVariables: {},
    tabManagerStyles: {},
    timing: {},
    issues: [],
    recommendations: []
  };

  // 1. Check current theme attribute
  diagnostics.themeAttribute = document.documentElement.getAttribute('data-theme') || 
                               document.body.getAttribute('data-theme') || 
                               'not set';
  console.log(`1. Theme Attribute: ${diagnostics.themeAttribute}`);

  // 2. Check CSS variable values
  const computedStyle = getComputedStyle(document.documentElement);
  const cssVars = [
    '--background-primary',
    '--background-secondary',
    '--background-hover',
    '--text-primary',
    '--text-secondary',
    '--border-color'
  ];

  cssVars.forEach(varName => {
    const value = computedStyle.getPropertyValue(varName).trim();
    diagnostics.cssVariables[varName] = value || 'NOT SET';
    console.log(`   ${varName}: ${value || 'NOT SET'}`);
  });

  // 3. Check tab manager modal styles
  const tabManagerModal = document.querySelector('.tab-manager-modal');
  if (tabManagerModal) {
    const modalStyle = getComputedStyle(tabManagerModal);
    diagnostics.tabManagerStyles.modalBackground = modalStyle.backgroundColor;
    console.log(`\n2. Tab Manager Modal Background: ${modalStyle.backgroundColor}`);
  } else {
    console.log('\n2. Tab Manager Modal: Not found in DOM');
  }

  const tabManagerContent = document.querySelector('.tab-manager-modal-content');
  if (tabManagerContent) {
    const contentStyle = getComputedStyle(tabManagerContent);
    diagnostics.tabManagerStyles.contentBackground = contentStyle.backgroundColor;
    console.log(`   Modal Content Background: ${contentStyle.backgroundColor}`);
  }

  // 4. Check sidebar-nav-main styles
  const sidebarNav = document.querySelector('.sidebar-nav-main');
  if (sidebarNav) {
    const navStyle = getComputedStyle(sidebarNav);
    diagnostics.tabManagerStyles.navBackground = navStyle.backgroundColor;
    console.log(`\n3. Sidebar Nav Background: ${navStyle.backgroundColor}`);
  }

  // 5. Check timing - when is theme applied?
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const newTheme = document.documentElement.getAttribute('data-theme');
        console.log(`\n⏱️  Theme changed to: ${newTheme} at ${Date.now()}`);
        diagnostics.timing.themeChangeTime = Date.now();
      }
    });
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  // 6. Check for dark fallback values in tab-manager.css
  const styleSheets = Array.from(document.styleSheets);
  let tabManagerSheet = null;
  
  styleSheets.forEach(sheet => {
    try {
      if (sheet.href && sheet.href.includes('tab-manager.css')) {
        tabManagerSheet = sheet;
      }
    } catch (e) {
      // Cross-origin stylesheet
    }
  });

  if (tabManagerSheet) {
    console.log('\n4. Tab Manager CSS Sheet Found');
    try {
      const rules = Array.from(tabManagerSheet.cssRules || []);
      const darkFallbacks = [];
      
      rules.forEach(rule => {
        if (rule.style) {
          const bg = rule.style.background || rule.style.backgroundColor;
          if (bg && (bg.includes('#000') || bg.includes('#16181C') || bg.includes('rgb(0, 0, 0)'))) {
            darkFallbacks.push({
              selector: rule.selectorText,
              property: bg.includes('background:') ? 'background' : 'backgroundColor',
              value: bg
            });
          }
        }
      });

      if (darkFallbacks.length > 0) {
        console.log('   ⚠️  Found dark fallback values:');
        darkFallbacks.forEach(fb => {
          console.log(`      ${fb.selector}: ${fb.value}`);
          diagnostics.issues.push({
            type: 'dark-fallback',
            selector: fb.selector,
            value: fb.value
          });
        });
      }
    } catch (e) {
      console.log('   ⚠️  Could not analyze CSS rules:', e.message);
    }
  }

  // 7. Check if CSS variables are set before tab-manager.css loads
  const tabManagerLink = document.querySelector('link[href*="tab-manager.css"]');
  if (tabManagerLink) {
    console.log('\n5. Tab Manager CSS Link Found');
    console.log(`   Loaded: ${tabManagerLink.sheet ? 'Yes' : 'No'}`);
    
    // Check load order
    const allLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const tabManagerIndex = allLinks.findIndex(link => link.href.includes('tab-manager.css'));
    const sidepanelIndex = allLinks.findIndex(link => link.href.includes('sidepanel.css'));
    
    console.log(`   Load Order: sidepanel.css (${sidepanelIndex}), tab-manager.css (${tabManagerIndex})`);
    
    if (tabManagerIndex < sidepanelIndex) {
      diagnostics.issues.push({
        type: 'load-order',
        message: 'tab-manager.css loads before sidepanel.css (theme variables)'
      });
      diagnostics.recommendations.push('Ensure tab-manager.css loads after sidepanel.css');
    }
  }

  // 8. Analysis and recommendations
  console.log('\n=====================================');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('=====================================\n');

  if (diagnostics.themeAttribute === 'light') {
    const hasDarkFallbacks = diagnostics.tabManagerStyles.contentBackground?.includes('rgb(0, 0, 0)') ||
                             diagnostics.tabManagerStyles.contentBackground?.includes('#000');
    
    if (hasDarkFallbacks) {
      console.log('❌ ISSUE IDENTIFIED: Dark fallback values in light mode');
      diagnostics.issues.push({
        type: 'theme-mismatch',
        severity: 'high',
        message: 'Tab manager uses dark fallbacks (#000) in light mode'
      });
      diagnostics.recommendations.push('Update tab-manager.css fallback values to match light theme defaults');
    }
  }

  if (diagnostics.cssVariables['--background-primary'] === 'NOT SET' || 
      diagnostics.cssVariables['--background-primary'] === '') {
    console.log('❌ ISSUE IDENTIFIED: CSS variables not initialized');
    diagnostics.issues.push({
      type: 'css-variables-not-set',
      severity: 'high',
      message: 'CSS variables not available when tab-manager.css loads'
    });
    diagnostics.recommendations.push('Ensure CSS variables are defined before tab-manager.css');
  }

  console.log(`\n✅ Issues Found: ${diagnostics.issues.length}`);
  diagnostics.issues.forEach((issue, i) => {
    console.log(`   ${i + 1}. [${issue.severity || 'medium'}] ${issue.type}: ${issue.message || issue.selector || ''}`);
  });

  console.log(`\n💡 Recommendations: ${diagnostics.recommendations.length}`);
  diagnostics.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });

  // Store diagnostics for later reference
  window.__TAB_THEME_DIAGNOSTICS__ = diagnostics;

  console.log('\n✅ Diagnostic complete. Results stored in window.__TAB_THEME_DIAGNOSTICS__');
  return diagnostics;
})();




