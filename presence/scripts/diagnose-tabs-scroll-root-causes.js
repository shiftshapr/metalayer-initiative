/**
 * DIAGNOSTIC: Tabs Hidden & Scroll Substrate Root Cause Analysis
 * 
 * Targets 2 critical UI issues:
 * 1. Loading messages hides tabs - tabs should NEVER be hidden
 * 2. Scroll substrate needs better treatment in dark mode
 * 
 * Root cause analysis before fixing.
 */

/**
 * Run all diagnostics
 */
function runTabsScrollDiagnostics() {
  const diagnostics = [];
  
  // Issue 1: Loading messages hides tabs
  const tabsResult = diagnoseTabsHiddenIssue();
  diagnostics.push(tabsResult);
  
  // Issue 2: Scroll substrate needs better treatment in dark mode
  const scrollResult = diagnoseScrollSubstrateIssue();
  diagnostics.push(scrollResult);
  
  // Issue 3: JavaScript may hide tabs during loading
  const jsResult = diagnoseJavaScriptTabHiding();
  diagnostics.push(jsResult);
  
  const critical = diagnostics.filter(d => d.severity === 'critical').length;
  const high = diagnostics.filter(d => d.severity === 'high').length;
  const medium = diagnostics.filter(d => d.severity === 'medium').length;
  
  console.log('=== TABS & SCROLL ROOT CAUSE DIAGNOSTICS ===\n');
  
  diagnostics.forEach((diag, i) => {
    const severityIcon = diag.severity === 'critical' ? '🔴' : diag.severity === 'high' ? '🟡' : '🟢';
    console.log(`${i + 1}. ${severityIcon} ${diag.issue}`);
    console.log(`   Root Cause: ${diag.rootCause}`);
    console.log(`   Location: ${diag.location}`);
    console.log(`   Evidence:`);
    diag.evidence.forEach(ev => console.log(`     - ${ev}`));
    if (diag.codePath && diag.codePath.length > 0) {
      console.log(`   Code Path:`);
      diag.codePath.forEach(path => console.log(`     - ${path}`));
    }
    console.log(`   Recommendation: ${diag.recommendation}`);
    console.log('');
  });
  
  console.log(`=== SUMMARY ===`);
  console.log(`🔴 Critical: ${critical}`);
  console.log(`🟡 High: ${high}`);
  console.log(`🟢 Medium: ${medium}`);
  console.log(`Total Issues: ${diagnostics.length}`);
  
  return { diagnostics, summary: { critical, high, medium } };
}

/**
 * Issue 1: Loading messages hides tabs
 */
function diagnoseTabsHiddenIssue() {
  const evidence = [];
  
  // Check if tabs container exists
  const tabsContainer = document.querySelector('.sidebar-nav-main');
  if (!tabsContainer) {
    evidence.push('Tabs container (.sidebar-nav-main) not found in DOM');
    return {
      issue: 'Loading messages hides tabs',
      rootCause: 'Tabs container missing from DOM',
      location: 'sidepanel.html - .sidebar-nav-main',
      severity: 'critical',
      evidence,
      recommendation: 'Verify tabs container exists in HTML'
    };
  }
  
  evidence.push(`Tabs container found: ${tabsContainer.tagName}`);
  
  // Check computed styles
  const tabsComputed = window.getComputedStyle(tabsContainer);
  const display = tabsComputed.display;
  const visibility = tabsComputed.visibility;
  const opacity = tabsComputed.opacity;
  const height = tabsComputed.height;
  const maxHeight = tabsComputed.maxHeight;
  
  evidence.push(`Display: ${display}`);
  evidence.push(`Visibility: ${visibility}`);
  evidence.push(`Opacity: ${opacity}`);
  evidence.push(`Height: ${height}`);
  evidence.push(`Max-height: ${maxHeight}`);
  
  // Check if tabs are hidden
  const isHidden = display === 'none' || visibility === 'hidden' || opacity === '0' || height === '0px' || maxHeight === '0px';
  
  if (isHidden) {
    evidence.push('⚠️ Tabs are currently HIDDEN');
  } else {
    evidence.push('✅ Tabs are visible');
  }
  
  // Check individual tab buttons
  const tabButtons = tabsContainer.querySelectorAll('.main-nav-tab');
  evidence.push(`Tab buttons found: ${tabButtons.length}`);
  
  tabButtons.forEach((tab, i) => {
    if (i < 3) { // Check first 3
      const tabComputed = window.getComputedStyle(tab);
      const tabDisplay = tabComputed.display;
      const tabVisibility = tabComputed.visibility;
      evidence.push(`Tab ${i + 1} (${tab.textContent?.trim()}): display=${tabDisplay}, visibility=${tabVisibility}`);
    }
  });
  
  // Check for CSS classes that might hide tabs
  const hiddenClasses = ['hidden', 'hide', 'invisible', 'display-none', 'visibility-hidden'];
  hiddenClasses.forEach(className => {
    if (tabsContainer.classList.contains(className)) {
      evidence.push(`⚠️ Container has class: ${className}`);
    }
  });
  
  // Check parent containers
  const parent = tabsContainer.parentElement;
  if (parent) {
    const parentComputed = window.getComputedStyle(parent);
    const parentDisplay = parentComputed.display;
    const parentVisibility = parentComputed.visibility;
    evidence.push(`Parent container display: ${parentDisplay}, visibility: ${parentVisibility}`);
    
    if (parentDisplay === 'none' || parentVisibility === 'hidden') {
      evidence.push('⚠️ Parent container is hidden - this would hide tabs');
    }
  }
  
  // Check if message loading triggers any hide/show logic
  const hasLoadChatHistory = window.loadChatHistory || (window.MessagesModule && window.MessagesModule.loadChatHistory);
  evidence.push(`loadChatHistory available: ${!!hasLoadChatHistory}`);
  
  // Check for event listeners that might hide tabs
  const tabElements = Array.from(tabButtons);
  tabElements.forEach((tab, i) => {
    if (i < 2) {
      const listeners = tab.__listeners || [];
      evidence.push(`Tab ${i + 1} listeners: ${listeners.length}`);
    }
  });
  
  // Check CSS rules that might affect tabs during loading
  const stylesheets = Array.from(document.styleSheets);
  let cssRulesFound = 0;
  stylesheets.forEach((sheet, sheetIndex) => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach((rule) => {
        if (rule.selectorText && (
          rule.selectorText.includes('.sidebar-nav-main') ||
          rule.selectorText.includes('.main-nav-tab') ||
          rule.selectorText.includes('loading') ||
          rule.selectorText.includes('chat-messages')
        )) {
          if (rule.style && (
            rule.style.display === 'none' ||
            rule.style.visibility === 'hidden' ||
            rule.style.opacity === '0'
          )) {
            cssRulesFound++;
            evidence.push(`⚠️ CSS rule found: ${rule.selectorText} - ${rule.style.cssText}`);
          }
        }
      });
    } catch (e) {
      // Cross-origin stylesheets may throw
    }
  });
  
  evidence.push(`CSS rules that might hide tabs: ${cssRulesFound}`);
  
  return {
    issue: 'Loading messages hides tabs',
    rootCause: isHidden 
      ? 'Tabs are hidden via CSS (display:none, visibility:hidden, opacity:0, or height:0) or parent container is hidden'
      : 'Tabs may be hidden during message loading via JavaScript (class manipulation, style changes, or parent container hiding)',
    location: 'UIManager.ts or CSS - tab visibility logic during message loading',
    severity: 'critical',
    evidence,
    recommendation: 'Ensure tabs container (.sidebar-nav-main) is NEVER hidden. Check: 1) CSS rules, 2) JavaScript class/style manipulation during loadChatHistory, 3) Parent container visibility, 4) Loading overlay that might cover tabs',
    codePath: [
      'UIManager.ts - tab switching logic',
      'MessageLoadingService.ts - loadChatHistory()',
      'UnifiedMessageDisplay.ts - render()',
      'sidepanel.css - .sidebar-nav-main rules'
    ]
  };
}

/**
 * Issue 2: Scroll substrate needs better treatment in dark mode
 */
function diagnoseScrollSubstrateIssue() {
  const evidence = [];
  
  // Check if dark mode is active
  const html = document.documentElement;
  const body = document.body;
  const isDarkMode = html.classList.contains('dark') || 
                     body.classList.contains('dark') ||
                     html.getAttribute('data-theme') === 'dark' ||
                     window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  evidence.push(`Dark mode active: ${isDarkMode}`);
  
  // Find scroll containers
  const scrollContainers = [
    document.querySelector('.chat-messages'),
    document.querySelector('.sidebar-content'),
    document.querySelector('.main-tab-content'),
    document.body,
    document.documentElement
  ].filter(Boolean);
  
  evidence.push(`Scroll containers found: ${scrollContainers.length}`);
  
  scrollContainers.forEach((container, i) => {
    if (i < 3) { // Check first 3
      const computed = window.getComputedStyle(container);
      const overflowY = computed.overflowY;
      const overflowX = computed.overflowX;
      const scrollbarWidth = computed.scrollbarWidth || 'auto';
      
      evidence.push(`Container ${i + 1} (${container.className || container.tagName}):`);
      evidence.push(`  overflow-y: ${overflowY}`);
      evidence.push(`  overflow-x: ${overflowX}`);
      evidence.push(`  scrollbar-width: ${scrollbarWidth}`);
      
      // Check scrollbar styling
      const scrollbarColor = computed.scrollbarColor || 'not set';
      const scrollbarTrackColor = computed.getPropertyValue('--scrollbar-track-color') || 'not set';
      const scrollbarThumbColor = computed.getPropertyValue('--scrollbar-thumb-color') || 'not set';
      
      evidence.push(`  scrollbar-color: ${scrollbarColor}`);
      evidence.push(`  --scrollbar-track-color: ${scrollbarTrackColor}`);
      evidence.push(`  --scrollbar-thumb-color: ${scrollbarThumbColor}`);
      
      // Check background colors
      const backgroundColor = computed.backgroundColor;
      const backgroundImage = computed.backgroundImage;
      evidence.push(`  background-color: ${backgroundColor}`);
      evidence.push(`  background-image: ${backgroundImage !== 'none' ? 'set' : 'none'}`);
      
      // Check if scrollbar is visible
      const hasScrollbar = container.scrollHeight > container.clientHeight;
      evidence.push(`  Has scrollbar: ${hasScrollbar} (scrollHeight: ${container.scrollHeight}, clientHeight: ${container.clientHeight})`);
    }
  });
  
  // Check CSS for scrollbar styling
  const stylesheets = Array.from(document.styleSheets);
  let scrollbarRulesFound = 0;
  let darkModeScrollbarRules = 0;
  
  stylesheets.forEach((sheet) => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach((rule) => {
        if (rule.selectorText && (
          rule.selectorText.includes('scrollbar') ||
          rule.selectorText.includes('::-webkit-scrollbar') ||
          rule.selectorText.includes('scrollbar-track') ||
          rule.selectorText.includes('scrollbar-thumb')
        )) {
          scrollbarRulesFound++;
          evidence.push(`Scrollbar CSS rule: ${rule.selectorText}`);
          
          if (rule.selectorText.includes('dark') || rule.selectorText.includes('.dark')) {
            darkModeScrollbarRules++;
            evidence.push(`  ⚠️ Dark mode scrollbar rule: ${rule.selectorText}`);
          }
        }
      });
    } catch (e) {
      // Cross-origin stylesheets may throw
    }
  });
  
  evidence.push(`Total scrollbar CSS rules: ${scrollbarRulesFound}`);
  evidence.push(`Dark mode scrollbar rules: ${darkModeScrollbarRules}`);
  
  // Check for CSS variables for scrollbar colors
  const rootStyles = window.getComputedStyle(document.documentElement);
  const scrollbarVars = [
    '--scrollbar-track-color',
    '--scrollbar-thumb-color',
    '--scrollbar-width',
    '--scrollbar-border-radius'
  ];
  
  scrollbarVars.forEach(varName => {
    const value = rootStyles.getPropertyValue(varName);
    if (value) {
      evidence.push(`CSS variable ${varName}: ${value}`);
    } else {
      evidence.push(`CSS variable ${varName}: not set`);
    }
  });
  
  // Check substrate (background behind scrollable content)
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    const chatComputed = window.getComputedStyle(chatMessages);
    const chatBg = chatComputed.backgroundColor;
    const chatBgImage = chatComputed.backgroundImage;
    const parent = chatMessages.parentElement;
    const parentBg = parent ? window.getComputedStyle(parent).backgroundColor : 'unknown';
    
    evidence.push(`Chat messages background: ${chatBg}`);
    evidence.push(`Chat messages background-image: ${chatBgImage !== 'none' ? 'set' : 'none'}`);
    evidence.push(`Parent background: ${parentBg}`);
    
    // Check if substrate is visible/appropriate in dark mode
    if (isDarkMode) {
      const bgColor = chatComputed.backgroundColor;
      const rgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        evidence.push(`Background brightness: ${brightness.toFixed(1)} (0=black, 255=white)`);
        
        if (brightness > 200) {
          evidence.push('⚠️ Background is too light for dark mode');
        } else if (brightness < 50) {
          evidence.push('⚠️ Background is too dark (may need subtle contrast)');
        }
      }
    }
  }
  
  return {
    issue: 'Scroll substrate needs better treatment in dark mode',
    rootCause: isDarkMode
      ? 'Scrollbar styling and/or substrate background not optimized for dark mode - may be too light, too dark, or missing contrast'
      : 'Scrollbar styling exists but may not have dark mode variants',
    location: 'sidepanel.css - scrollbar styling and dark mode rules',
    severity: 'high',
    evidence,
    recommendation: 'Add dark mode scrollbar styling: 1) Use CSS variables for scrollbar colors, 2) Style ::-webkit-scrollbar-track and ::-webkit-scrollbar-thumb for dark mode, 3) Ensure substrate background has appropriate contrast in dark mode, 4) Consider using scrollbar-color property for Firefox',
    codePath: [
      'sidepanel.css - scrollbar styling',
      'sidepanel.css - dark mode rules',
      'UserPreferencesManager.ts - theme switching'
    ]
  };
}

/**
 * Check for JavaScript that might hide tabs during loading
 */
function diagnoseJavaScriptTabHiding() {
  const evidence = [];
  
  // Check UIManager for tab hiding logic
  const uiManager = window.UIManager || window.uiManager;
  evidence.push(`UIManager available: ${!!uiManager}`);
  
  // Check for loadChatHistory and its effects
  const loadChatHistory = window.loadChatHistory || (window.MessagesModule && window.MessagesModule.loadChatHistory);
  evidence.push(`loadChatHistory available: ${!!loadChatHistory}`);
  
  // Check for loading states
  const loadingStates = [
    window.isLoadingMessages,
    window.isLoadingChat,
    window.loadingState,
    window.chatLoading
  ].filter(Boolean);
  
  evidence.push(`Loading state variables: ${loadingStates.length}`);
  
  // Check for event listeners on tabs container
  const tabsContainer = document.querySelector('.sidebar-nav-main');
  if (tabsContainer) {
    // Check for data attributes that might indicate state
    const dataAttrs = Array.from(tabsContainer.attributes)
      .filter(attr => attr.name.startsWith('data-'))
      .map(attr => `${attr.name}="${attr.value}"`);
    evidence.push(`Tabs container data attributes: ${dataAttrs.join(', ') || 'none'}`);
    
    // Check for inline styles
    const inlineStyle = tabsContainer.getAttribute('style');
    if (inlineStyle) {
      evidence.push(`⚠️ Tabs container has inline style: ${inlineStyle}`);
    }
  }
  
  // Check for overlay/loading indicators that might cover tabs
  const overlays = document.querySelectorAll('[class*="loading"], [class*="overlay"], [id*="loading"], [id*="overlay"]');
  evidence.push(`Loading/overlay elements found: ${overlays.length}`);
  
  overlays.forEach((overlay, i) => {
    if (i < 3) {
      const computed = window.getComputedStyle(overlay);
      const display = computed.display;
      const zIndex = computed.zIndex;
      const position = computed.position;
      evidence.push(`Overlay ${i + 1} (${overlay.className}): display=${display}, z-index=${zIndex}, position=${position}`);
      
      if (display !== 'none' && (zIndex === 'auto' || parseInt(zIndex) > 100)) {
        evidence.push(`  ⚠️ Overlay might cover tabs (z-index: ${zIndex})`);
      }
    }
  });
  
  return {
    issue: 'JavaScript may hide tabs during loading',
    rootCause: 'JavaScript code (UIManager, loadChatHistory, or loading overlays) may be hiding tabs during message loading',
    location: 'UIManager.ts or message loading code - tab visibility manipulation',
    severity: 'critical',
    evidence,
    recommendation: 'Review JavaScript code that runs during loadChatHistory: 1) Check UIManager tab switching logic, 2) Check for loading overlay that covers tabs, 3) Ensure no class/style manipulation hides tabs, 4) Verify z-index of overlays doesn\'t cover tabs',
    codePath: [
      'UIManager.ts - switchTab() or showTab()',
      'MessageLoadingService.ts - loadChatHistory()',
      'UnifiedMessageDisplay.ts - render()',
      'Loading overlay components'
    ]
  };
}

// Make function available globally for browser console
if (typeof window !== 'undefined') {
  window.runTabsScrollDiagnostics = runTabsScrollDiagnostics;
  
  // Auto-run if script is loaded directly
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTabsScrollDiagnostics);
  } else {
    runTabsScrollDiagnostics();
  }
}





