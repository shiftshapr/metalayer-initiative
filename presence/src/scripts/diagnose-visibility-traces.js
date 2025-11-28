/**
 * Diagnostic Script: Visibility Trace Display
 * 
 * PURPOSE: Diagnose visibility trace display issues - time formatting, trace limits, real-time updates
 * 
 * USAGE: Copy this entire script and paste into browser console on a page with Canopi extension loaded
 * 
 * OUTPUT: Console logs with diagnostic results, issues found, and recommendations
 * 
 * CRITICAL: This is pure JavaScript - NO TypeScript syntax, NO imports/exports
 */

(async function() {
  'use strict';
  
  console.log('🔍 DIAGNOSTIC: Visibility Trace Display');
  console.log('========================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    issues: [],
    recommendations: []
  };
  
  // Check 1: VisibilityManager and time formatting functions
  console.log('\n📋 Check 1: VisibilityManager Time Formatting');
  if (window.VisibilityManager) {
    console.log('  VisibilityManager available');
    
    // Check formatTimeDisplay
    if (typeof VisibilityManager.formatTimeDisplay === 'function') {
      console.log('  formatTimeDisplay available');
      
      // Test various time scenarios
      const now = new Date();
      const testCases = [
        { time: new Date(now.getTime() - 30 * 1000), expected: 'Just arrived', label: '30 seconds ago' },
        { time: new Date(now.getTime() - 2 * 60 * 1000), expected: 'Online for', label: '2 minutes ago' },
        { time: new Date(now.getTime() - 2 * 60 * 60 * 1000), expected: 'Online for', label: '2 hours ago' },
        { time: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), expected: 'Online for', label: '2 days ago' }
      ];
      
      testCases.forEach(test => {
        const result = VisibilityManager.formatTimeDisplay(test.time.toISOString());
        console.log(`  Test "${test.label}": "${result}"`);
        if (!result.includes(test.expected)) {
          results.issues.push(`formatTimeDisplay failed for ${test.label}: expected "${test.expected}" but got "${result}"`);
        }
      });
    } else {
      console.log('  formatTimeDisplay NOT available');
      results.issues.push('VisibilityManager.formatTimeDisplay function not available');
    }
    
    // Check formatLastSeenDisplay
    if (typeof VisibilityManager.formatLastSeenDisplay === 'function') {
      console.log('  formatLastSeenDisplay available');
      
      const now = new Date();
      const testCases = [
        { time: new Date(now.getTime() - 30 * 1000), expected: 'Just left', label: '30 seconds ago' },
        { time: new Date(now.getTime() - 2 * 60 * 1000), expected: 'Last seen', label: '2 minutes ago' },
        { time: new Date(now.getTime() - 2 * 60 * 60 * 1000), expected: 'Last seen', label: '2 hours ago' }
      ];
      
      testCases.forEach(test => {
        const result = VisibilityManager.formatLastSeenDisplay(test.time.toISOString());
        console.log(`  Test "${test.label}": "${result}"`);
        if (!result.includes(test.expected)) {
          results.issues.push(`formatLastSeenDisplay failed for ${test.label}: expected "${test.expected}" but got "${result}"`);
        }
      });
    } else {
      console.log('  formatLastSeenDisplay NOT available');
      results.issues.push('VisibilityManager.formatLastSeenDisplay function not available');
    }
  } else {
    console.log('  VisibilityManager NOT available on window');
    results.issues.push('VisibilityManager not available on window object');
  }
  
  // Check 2: Trace limit setting
  console.log('\n📋 Check 2: Trace Limit Setting');
  if (window.userPreferencesManager) {
    console.log('  UserPreferencesManager available');
    
    try {
      const traceLimit = await window.userPreferencesManager.getPreference('visibilityTraceLimit');
      console.log(`  Current trace limit: ${traceLimit !== null && traceLimit !== undefined ? traceLimit : 'not set (default: 30 days)'}`);
      
      if (traceLimit === null || traceLimit === undefined) {
        results.issues.push('Trace limit preference not set - should default to 30 days');
      }
    } catch (error) {
      console.error('  Error getting trace limit:', error);
      results.issues.push('Error accessing trace limit preference: ' + error.message);
    }
  } else {
    console.log('  UserPreferencesManager NOT available');
    results.issues.push('UserPreferencesManager not available - cannot check trace limit');
  }
  
  // Check 3: Visibility tab and status displays
  console.log('\n📋 Check 3: Visibility Tab Status Displays');
  const visibilityTab = document.getElementById('visibility-tab');
  if (visibilityTab) {
    console.log('  Visibility tab found');
    
    const statusElements = visibilityTab.querySelectorAll('.user-status');
    console.log(`  Found ${statusElements.length} status elements`);
    
    statusElements.forEach((el, idx) => {
      const text = el.textContent || '';
      console.log(`  Status ${idx + 1}: "${text}"`);
      
      // Check if status text matches expected patterns
      const validPatterns = [
        /^Just arrived$/,
        /^Just left$/,
        /^Online for \d+ (min|mins|hour|hours|day|days|year|years)$/,
        /^Last seen \d+ (min|mins|hour|hours|day|days|year|years) ago$/
      ];
      
      const matches = validPatterns.some(pattern => pattern.test(text));
      if (!matches && text.trim() !== '') {
        results.issues.push(`Status element ${idx + 1} has unexpected format: "${text}"`);
      }
    });
  } else {
    console.log('  Visibility tab NOT found');
    results.issues.push('Visibility tab element not found in DOM');
  }
  
  // Check 4: Avatar status dots
  console.log('\n📋 Check 4: Avatar Status Dots');
  const avatarStatusDots = document.querySelectorAll('.avatar-status');
  console.log(`  Found ${avatarStatusDots.length} status dots`);
  
  avatarStatusDots.forEach((dot, idx) => {
    const computed = window.getComputedStyle(dot);
    const bgColor = computed.backgroundColor;
    const colors = {
      green: bgColor.includes('rgb(0, 128, 0)') || bgColor.includes('rgb(34, 197, 94)') || bgColor.includes('#22c55e'),
      gray: bgColor.includes('rgb(128, 128, 128)') || bgColor.includes('rgb(107, 114, 128)') || bgColor.includes('#6b7280'),
      red: bgColor.includes('rgb(255, 0, 0)') || bgColor.includes('rgb(239, 68, 68)') || bgColor.includes('#ef4444'),
      yellow: bgColor.includes('rgb(255, 255, 0)') || bgColor.includes('rgb(234, 179, 8)') || bgColor.includes('#eab308')
    };
    
    const colorType = Object.keys(colors).find(key => colors[key]) || 'unknown';
    console.log(`  Status dot ${idx + 1}: ${colorType} (${bgColor})`);
    
    if (colorType === 'unknown') {
      results.issues.push(`Status dot ${idx + 1} has unrecognized color: ${bgColor}`);
    }
  });
  
  // Check 5: Real-time update mechanism
  console.log('\n📋 Check 5: Real-time Update Mechanism');
  if (window.visibilityStatusRefreshInterval) {
    console.log('  visibilityStatusRefreshInterval found');
    console.log(`  Interval ID: ${window.visibilityStatusRefreshInterval}`);
  } else {
    console.log('  visibilityStatusRefreshInterval NOT found');
    results.issues.push('Real-time status refresh interval not set up');
  }
  
  // Check 6: Current visibility data
  console.log('\n📋 Check 6: Current Visibility Data');
  if (window.currentVisibilityData) {
    const data = window.currentVisibilityData;
    const users = data.active || [];
    console.log(`  Found ${users.length} visible users`);
    
    users.forEach((user, idx) => {
      console.log(`  User ${idx + 1}:`, {
        name: user.name,
        isActive: user.isActive,
        lastSeen: user.lastSeen,
        pageId: user.page_id || user.pageId
      });
      
      // Check if user has required fields
      if (!user.lastSeen && !user.isActive) {
        results.issues.push(`User ${idx + 1} (${user.name}) missing both lastSeen and isActive`);
      }
    });
  } else {
    console.log('  currentVisibilityData NOT available');
    results.issues.push('currentVisibilityData not available on window');
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
    if (results.issues.some(i => i.includes('formatTimeDisplay') || i.includes('formatLastSeenDisplay'))) {
      results.recommendations.push('Update time formatting functions to match new requirements (Just arrived, Just left, proper units)');
    }
    if (results.issues.some(i => i.includes('trace limit'))) {
      results.recommendations.push('Add trace limit setting to Visibility Settings in Settings Tab');
    }
    if (results.issues.some(i => i.includes('real-time') || i.includes('refresh'))) {
      results.recommendations.push('Ensure real-time update mechanism is working (interval-based updates)');
    }
  } else {
    results.recommendations.push('No issues found - visibility traces appear to be working correctly');
  }
  
  results.recommendations.forEach((rec, idx) => {
    console.log(`  ${idx + 1}. ${rec}`);
  });
  
  console.log('\n📋 Full Results Object:');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
})();



