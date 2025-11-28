/**
 * Window References Audit Script
 * 
 * Analyzes window reference patterns to identify best practice violations
 * and migration opportunities.
 * 
 * Usage: Run in browser console or as Node.js script
 */

(function() {
  console.log('🔍 WINDOW REFERENCES AUDIT');
  console.log('============================\n');

  const audit = {
    timestamp: new Date().toISOString(),
    categories: {
      necessary: [],
      migration: [],
      legacy: [],
      typeChecks: []
    },
    patterns: {},
    recommendations: []
  };

  // This script analyzes patterns - actual file analysis would need to be done server-side
  // For now, we'll analyze the runtime window object
  
  if (typeof window === 'undefined') {
    console.log('⚠️ Running in Node.js context - analyzing patterns only');
    console.log('\nWindow Reference Categories:');
    console.log('1. NECESSARY (Keep):');
    console.log('   - Browser APIs: window.location, window.document, window.chrome');
    console.log('   - Extension APIs: chrome.tabs, chrome.storage');
    console.log('   - DOM APIs: window.getComputedStyle, window.addEventListener');
    console.log('\n2. MIGRATION CANDIDATES (Move to Module Graph):');
    console.log('   - window.currentUser → stateManager.getState("currentUser")');
    console.log('   - window.getState → stateManager.getState()');
    console.log('   - window.setState → stateManager.setState()');
    console.log('   - window.api → moduleGraph.apiService or APIService');
    console.log('   - window.supabase → moduleGraph.supabaseService');
    console.log('   - window.loadChatHistory → moduleGraph.messageLoadingService.loadMessages()');
    console.log('\n3. LEGACY (Remove/Deprecate):');
    console.log('   - window.__CANOPI_MODULE_GRAPH__ (temporary migration bridge)');
    console.log('   - window.currentChatData → stateManager.getState("chat.data")');
    console.log('   - window.currentUrlData → stateManager.getState("currentUrlData")');
    console.log('   - window.currentVisibilityData → visibilityManager.getState()');
    console.log('\n4. TYPE CHECKS (Keep but improve):');
    console.log('   - typeof window !== "undefined" → Use proper type guards');
    console.log('   - window as Window & {...} → Use global.d.ts types');
    
    return audit;
  }

  const win = window;

  // Analyze actual window object
  console.log('1. Window Object Analysis:');
  const windowKeys = Object.keys(win).filter(key => 
    key.startsWith('__CANOPI_') ||
    key.startsWith('current') ||
    key.includes('State') ||
    key.includes('Manager') ||
    key === 'api' ||
    key === 'supabase' ||
    key === 'loadChatHistory'
  );
  
  console.log(`   Found ${windowKeys.length} application-specific properties`);
  console.log('   Keys:', windowKeys.slice(0, 20).join(', '));
  
  audit.patterns.windowKeys = windowKeys.length;

  // Categorize window references
  console.log('\n2. Categorization:');
  
  // Necessary browser APIs
  const necessary = [
    'location', 'document', 'chrome', 'getComputedStyle', 
    'addEventListener', 'removeEventListener', 'localStorage',
    'sessionStorage', 'navigator', 'history'
  ];
  audit.categories.necessary = necessary;
  console.log(`   ✅ Necessary browser APIs: ${necessary.length} (keep as-is)`);
  
  // Migration candidates
  const migrationCandidates = [
    'currentUser', 'getState', 'setState', 'api', 'supabase',
    'loadChatHistory', 'currentChatData', 'currentUrlData',
    'currentVisibilityData', 'getCurrentUserEmail', 'getCurrentUserId'
  ];
  audit.categories.migration = migrationCandidates;
  console.log(`   ⚠️ Migration candidates: ${migrationCandidates.length} (move to module graph)`);
  
  // Legacy/temporary
  const legacy = [
    '__CANOPI_MODULE_GRAPH__', '__CANOPI_SIDEPANEL_READY__',
    '__DISABLE_LEGACY_SIDEPANEL__', '__BUILD_INFO__'
  ];
  audit.categories.legacy = legacy;
  console.log(`   🔴 Legacy/temporary: ${legacy.length} (remove after migration)`);
  
  // Type checks
  audit.categories.typeChecks = ['typeof window', 'window === undefined'];
  console.log(`   ℹ️ Type checks: ${audit.categories.typeChecks.length} (improve patterns)`);

  // Recommendations
  console.log('\n3. Best Practice Recommendations:');
  
  audit.recommendations.push({
    priority: 'HIGH',
    category: 'Migration',
    issue: 'window.currentUser',
    solution: 'Use stateManager.getState("currentUser") from module graph',
    impact: 'Reduces coupling, improves testability'
  });
  
  audit.recommendations.push({
    priority: 'HIGH',
    category: 'Migration',
    issue: 'window.getState / window.setState',
    solution: 'Use stateManager instance from module graph',
    impact: 'Eliminates global state access'
  });
  
  audit.recommendations.push({
    priority: 'HIGH',
    category: 'Migration',
    issue: 'window.api',
    solution: 'Use APIService or moduleGraph.apiService',
    impact: 'Better dependency injection, type safety'
  });
  
  audit.recommendations.push({
    priority: 'MEDIUM',
    category: 'Migration',
    issue: 'window.loadChatHistory',
    solution: 'Use moduleGraph.messageLoadingService.loadMessages()',
    impact: 'Consistent with module architecture'
  });
  
  audit.recommendations.push({
    priority: 'MEDIUM',
    category: 'Type Safety',
    issue: 'window as Window & {...}',
    solution: 'Use proper types from global.d.ts, avoid type assertions',
    impact: 'Better type safety, fewer runtime errors'
  });
  
  audit.recommendations.push({
    priority: 'LOW',
    category: 'Cleanup',
    issue: 'typeof window !== "undefined"',
    solution: 'Use proper type guards or environment checks',
    impact: 'Cleaner code, better tree-shaking'
  });

  audit.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. [${rec.priority}] ${rec.issue}`);
    console.log(`      → ${rec.solution}`);
    console.log(`      Impact: ${rec.impact}\n`);
  });

  // Summary
  console.log('============================');
  console.log('📋 SUMMARY');
  console.log('============================');
  console.log(`Window Keys Found: ${windowKeys.length}`);
  console.log(`Necessary APIs: ${necessary.length} (keep)`);
  console.log(`Migration Candidates: ${migrationCandidates.length} (fix)`);
  console.log(`Legacy/Temporary: ${legacy.length} (remove)`);
  console.log(`\nRecommendations: ${audit.recommendations.length}`);
  console.log(`  High Priority: ${audit.recommendations.filter(r => r.priority === 'HIGH').length}`);
  console.log(`  Medium Priority: ${audit.recommendations.filter(r => r.priority === 'MEDIUM').length}`);
  console.log(`  Low Priority: ${audit.recommendations.filter(r => r.priority === 'LOW').length}`);
  
  console.log('\n📋 Full Audit:', JSON.stringify(audit, null, 2));
  
  return audit;
})();

