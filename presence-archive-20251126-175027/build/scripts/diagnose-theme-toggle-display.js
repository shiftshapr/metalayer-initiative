/**
 * Diagnostic Script: Theme Toggle Display Issue
 * 
 * Problem: Profile menu theme toggle always displays "Dark mode" regardless of current theme
 * Objective: Show opposite of current theme (if light mode, show "Dark mode"; if dark mode, show "Light mode")
 * 
 * Root Cause Analysis:
 * - sidepanel.html line 186 has hardcoded "Dark mode" text
 * - updateThemeEverywhere() in ProfileManager.ts should update theme-text (line 3448)
 * - May not be called on initial load or when menu opens
 * - Need to check if theme detection is working correctly
 */

(function diagnoseThemeToggleDisplay() {
  console.log('=== Theme Toggle Display Diagnostic ===');
  
  const results = {
    timestamp: new Date().toISOString(),
    issue: 'Theme toggle always shows "Dark mode" instead of opposite of current theme',
    target: 'Show "Light mode" when in dark theme, "Dark mode" when in light theme',
    findings: [],
    recommendations: []
  };

  // Check current theme from DOM
  const currentTheme = document.body.getAttribute('data-theme') || 
                       document.documentElement.getAttribute('data-theme') || 
                       'light';
  
  results.findings.push({
    severity: 'info',
    message: `Current DOM theme: ${currentTheme}`,
    element: document.body
  });
  console.log('Current theme:', currentTheme);

  // Check theme-text element
  const themeText = document.getElementById('theme-text');
  if (!themeText) {
    results.findings.push({
      severity: 'error',
      message: 'theme-text element not found in DOM'
    });
    console.error('❌ theme-text element not found');
  } else {
    const currentText = themeText.textContent || '';
    const expectedText = currentTheme === 'dark' ? 'Light mode' : 'Dark mode';
    const isCorrect = currentText === expectedText;
    
    results.findings.push({
      severity: isCorrect ? 'info' : 'error',
      message: `theme-text shows: "${currentText}", expected: "${expectedText}"`,
      element: themeText,
      isCorrect: isCorrect
    });
    
    if (isCorrect) {
      console.log('✓ theme-text is correct:', currentText);
    } else {
      console.error('❌ theme-text is incorrect:', currentText, 'expected:', expectedText);
    }
  }

  // Check theme-icon element
  const themeIcon = document.getElementById('theme-icon');
  if (!themeIcon) {
    results.findings.push({
      severity: 'error',
      message: 'theme-icon element not found in DOM'
    });
    console.error('❌ theme-icon element not found');
  } else {
    const currentIcon = themeIcon.textContent || '';
    const expectedIcon = currentTheme === 'dark' ? '☀️' : '🌙';
    const isCorrect = currentIcon === expectedIcon;
    
    results.findings.push({
      severity: isCorrect ? 'info' : 'error',
      message: `theme-icon shows: "${currentIcon}", expected: "${expectedIcon}"`,
      element: themeIcon,
      isCorrect: isCorrect
    });
    
    if (isCorrect) {
      console.log('✓ theme-icon is correct:', currentIcon);
    } else {
      console.error('❌ theme-icon is incorrect:', currentIcon, 'expected:', expectedIcon);
    }
  }

  // Check if updateThemeEverywhere exists
  const hasUpdateFunction = typeof window.updateThemeEverywhere === 'function';
  results.findings.push({
    severity: hasUpdateFunction ? 'info' : 'warning',
    message: hasUpdateFunction 
      ? 'updateThemeEverywhere function is available' 
      : 'updateThemeEverywhere function not found on window'
  });
  console.log('updateThemeEverywhere available:', hasUpdateFunction);

  // Check if ProfileManager is initialized
  const hasProfileManager = typeof window.profileManager !== 'undefined';
  results.findings.push({
    severity: hasProfileManager ? 'info' : 'warning',
    message: hasProfileManager 
      ? 'ProfileManager is available' 
      : 'ProfileManager not found on window'
  });
  console.log('ProfileManager available:', hasProfileManager);

  // Recommendations
  if (themeText && !results.findings.find(f => f.message.includes('theme-text') && f.isCorrect === false)) {
    results.recommendations.push({
      action: 'Update on menu open',
      description: 'Ensure theme-text is updated when profile menu opens',
      code: `// In ProfileManager.ts, when showing user menu:
const currentTheme = document.body.getAttribute('data-theme') || 'light';
const themeText = document.getElementById('theme-text');
if (themeText) {
  themeText.textContent = currentTheme === 'dark' ? 'Light mode' : 'Dark mode';
}`
    });
  } else {
    results.recommendations.push({
      action: 'Fix updateThemeEverywhere call',
      description: 'Ensure updateThemeEverywhere is called on initial load and theme changes',
      note: 'Check if function is being called when profile menu opens'
    });
  }

  results.recommendations.push({
    action: 'Remove hardcoded text',
    description: 'Remove hardcoded "Dark mode" from sidepanel.html, initialize dynamically',
    code: `<span id="theme-text"></span>`
  });

  console.log('=== Diagnostic Complete ===');
  console.log('Findings:', results.findings);
  console.log('Recommendations:', results.recommendations);
  
  return results;
})();




