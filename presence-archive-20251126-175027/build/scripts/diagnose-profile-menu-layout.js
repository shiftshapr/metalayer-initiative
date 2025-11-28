/**
 * Diagnostic Script: Profile Menu Layout Issue
 * 
 * Problem: "Signed in as" text and user name are displayed on separate lines
 * Objective: Show "Signed in as [username]" on the same line
 * 
 * Root Cause Analysis:
 * - sidepanel.html lines 178-179 have two separate divs
 * - Line 178: Static "Signed in as" text
 * - Line 179: Dynamic user-menu-name div populated by ProfileManager.ts
 * 
 * Solution: Combine into single div with inline display
 */

(function diagnoseProfileMenuLayout() {
  console.log('=== Profile Menu Layout Diagnostic ===');
  
  const results = {
    timestamp: new Date().toISOString(),
    issue: 'Profile menu shows "Signed in as" and username on separate lines',
    target: 'Combine into single line: "Signed in as [username]"',
    findings: [],
    recommendations: []
  };

  // Check HTML structure
  const userMenu = document.getElementById('user-menu');
  if (!userMenu) {
    results.findings.push({
      severity: 'error',
      message: 'user-menu element not found in DOM'
    });
    console.error('❌ user-menu element not found');
    return results;
  }

  // Check for "Signed in as" div
  const signedInAsDiv = Array.from(userMenu.children).find(
    child => child.textContent?.trim() === 'Signed in as'
  );
  
  if (!signedInAsDiv) {
    results.findings.push({
      severity: 'error',
      message: '"Signed in as" div not found'
    });
    console.error('❌ "Signed in as" div not found');
  } else {
    results.findings.push({
      severity: 'info',
      message: 'Found "Signed in as" div',
      element: signedInAsDiv,
      styles: window.getComputedStyle(signedInAsDiv)
    });
    console.log('✓ Found "Signed in as" div:', signedInAsDiv);
  }

  // Check for user-menu-name div
  const userMenuName = document.getElementById('user-menu-name');
  if (!userMenuName) {
    results.findings.push({
      severity: 'error',
      message: 'user-menu-name element not found'
    });
    console.error('❌ user-menu-name element not found');
  } else {
    const currentName = userMenuName.textContent || '(empty)';
    results.findings.push({
      severity: 'info',
      message: `Found user-menu-name with value: "${currentName}"`,
      element: userMenuName,
      styles: window.getComputedStyle(userMenuName)
    });
    console.log('✓ Found user-menu-name:', currentName);
  }

  // Check if they're siblings
  if (signedInAsDiv && userMenuName) {
    const areSiblings = signedInAsDiv.parentElement === userMenuName.parentElement;
    results.findings.push({
      severity: areSiblings ? 'info' : 'warning',
      message: areSiblings 
        ? 'Elements are siblings (can be combined)' 
        : 'Elements are not siblings - may need restructuring'
    });
    console.log('Sibling check:', areSiblings ? '✓ Same parent' : '⚠ Different parents');
  }

  // Recommendations
  results.recommendations.push({
    action: 'Combine divs',
    description: 'Merge lines 178-179 in sidepanel.html into single div',
    code: `<div style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 0.9em; color: #666;">
  Signed in as <span id="user-menu-name" style="font-weight: bold;"></span>
</div>`
  });

  results.recommendations.push({
    action: 'Update ProfileManager.ts',
    description: 'Ensure updateUserInfo() still works with new structure',
    note: 'Should work as-is since it targets #user-menu-name by ID'
  });

  console.log('=== Diagnostic Complete ===');
  console.log('Findings:', results.findings);
  console.log('Recommendations:', results.recommendations);
  
  return results;
})();




