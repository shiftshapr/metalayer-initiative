/**
 * BLINDSPOT TRACKER
 * Tracks and analyzes blindspots found during development
 * 
 * Usage: Run in console to get blindspot analysis
 */

console.log('🔍 BLINDSPOT TRACKER');
console.log('===================');

// Blindspot categories and their occurrences
const blindspotCategories = {
  'Database Issues': {
    'UUID contamination': 0,
    'Data quality problems': 0,
    'Constraint violations': 0
  },
  'Real-time System': {
    'Subscription timing': 0,
    'Connection reliability': 0,
    'Cross-tab sync': 0,
    'Error recovery': 0
  },
  'Module Dependencies': {
    'Script loading order': 0,
    'Function availability': 0,
    'Circular dependencies': 0
  },
  'Architectural Patterns': {
    'Timeout vs real-time': 0,
    'COMP method violations': 0,
    'State management issues': 0
  },
  'UI/UX Issues': {
    'Modal styling problems': 0,
    'Count propagation': 0,
    'Visual artifacts': 0
  }
};

// Known blindspots from current session
const currentBlindspots = [
  {
    id: 'uuid-database-cleanup',
    category: 'Database Issues',
    subcategory: 'UUID contamination',
    description: 'UUIDs stored as user_email values causing 400 errors',
    severity: 'HIGH',
    occurrences: 1,
    firstSeen: '2025-01-29',
    lastSeen: '2025-01-29',
    status: 'IDENTIFIED',
    solution: 'Add email validation filter and database cleanup migration'
  },
  {
    id: 'realtime-subscription-timing',
    category: 'Real-time System',
    subcategory: 'Subscription timing',
    description: 'Reaction subscriptions may not establish immediately',
    severity: 'MEDIUM',
    occurrences: 1,
    firstSeen: '2025-01-29',
    lastSeen: '2025-01-29',
    status: 'IDENTIFIED',
    solution: 'Add subscription status checks and reconnection logic'
  },
  {
    id: 'cross-tab-sync',
    category: 'Real-time System',
    subcategory: 'Cross-tab sync',
    description: 'Reaction counts may not sync across browser tabs',
    severity: 'MEDIUM',
    occurrences: 1,
    firstSeen: '2025-01-29',
    lastSeen: '2025-01-29',
    status: 'IDENTIFIED',
    solution: 'Monitor real-time system and add fallback mechanisms'
  },
  {
    id: 'error-recovery-missing',
    category: 'Real-time System',
    subcategory: 'Error recovery',
    description: 'No fallback mechanism if real-time connection fails',
    severity: 'HIGH',
    occurrences: 1,
    firstSeen: '2025-01-29',
    lastSeen: '2025-01-29',
    status: 'IDENTIFIED',
    solution: 'Implement fallback polling and robust error handling'
  },
  {
    id: 'script-loading-order',
    category: 'Module Dependencies',
    subcategory: 'Script loading order',
    description: 'CanopiModule.js loading before dependencies causing undefined errors',
    severity: 'HIGH',
    occurrences: 1,
    firstSeen: '2025-01-29',
    lastSeen: '2025-01-29',
    status: 'FIXED',
    solution: 'Reordered scripts in sidepanel.html'
  },
  {
    id: 'timeout-vs-realtime',
    category: 'Architectural Patterns',
    subcategory: 'Timeout vs real-time',
    description: 'Using setTimeout instead of real-time COMP method',
    severity: 'MEDIUM',
    occurrences: 1,
    firstSeen: '2025-01-29',
    lastSeen: '2025-01-29',
    status: 'FIXED',
    solution: 'Replaced timeouts with real-time system calls'
  }
];

// Update category counts
function updateCategoryCounts() {
  currentBlindspots.forEach(blindspot => {
    if (blindspotCategories[blindspot.category] && 
        blindspotCategories[blindspot.category][blindspot.subcategory] !== undefined) {
      blindspotCategories[blindspot.category][blindspot.subcategory] = blindspot.occurrences;
    }
  });
}

// Analyze blindspot patterns
function analyzeBlindspotPatterns() {
  console.log('\n📊 BLINDSPOT ANALYSIS');
  console.log('=====================');
  
  updateCategoryCounts();
  
  // Total blindspots
  const totalBlindspots = currentBlindspots.length;
  console.log(`📈 Total blindspots identified: ${totalBlindspots}`);
  
  // By severity
  const severityCounts = currentBlindspots.reduce((acc, bs) => {
    acc[bs.severity] = (acc[bs.severity] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n🚨 By Severity:');
  Object.entries(severityCounts).forEach(([severity, count]) => {
    const emoji = severity === 'HIGH' ? '🔴' : severity === 'MEDIUM' ? '🟡' : '🟢';
    console.log(`  ${emoji} ${severity}: ${count}`);
  });
  
  // By status
  const statusCounts = currentBlindspots.reduce((acc, bs) => {
    acc[bs.status] = (acc[bs.status] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📋 By Status:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    const emoji = status === 'FIXED' ? '✅' : status === 'IDENTIFIED' ? '🔍' : '⏳';
    console.log(`  ${emoji} ${status}: ${count}`);
  });
  
  // By category
  console.log('\n📂 By Category:');
  Object.entries(blindspotCategories).forEach(([category, subcategories]) => {
    const totalInCategory = Object.values(subcategories).reduce((sum, count) => sum + count, 0);
    console.log(`  📁 ${category}: ${totalInCategory} blindspots`);
    
    Object.entries(subcategories).forEach(([subcategory, count]) => {
      if (count > 0) {
        console.log(`    - ${subcategory}: ${count}`);
      }
    });
  });
}

// Get recurring blindspots
function getRecurringBlindspots() {
  console.log('\n🔄 RECURRING BLINDSPOTS');
  console.log('======================');
  
  const recurring = currentBlindspots.filter(bs => bs.occurrences > 1);
  
  if (recurring.length === 0) {
    console.log('✅ No recurring blindspots found');
    return [];
  }
  
  recurring.forEach(blindspot => {
    console.log(`🔄 ${blindspot.id}: ${blindspot.occurrences} occurrences`);
    console.log(`   Category: ${blindspot.category} > ${blindspot.subcategory}`);
    console.log(`   Description: ${blindspot.description}`);
    console.log(`   Status: ${blindspot.status}`);
  });
  
  return recurring;
}

// Get high-priority blindspots
function getHighPriorityBlindspots() {
  console.log('\n🚨 HIGH-PRIORITY BLINDSPOTS');
  console.log('===========================');
  
  const highPriority = currentBlindspots.filter(bs => bs.severity === 'HIGH');
  
  if (highPriority.length === 0) {
    console.log('✅ No high-priority blindspots');
    return [];
  }
  
  highPriority.forEach(blindspot => {
    console.log(`🔴 ${blindspot.id}`);
    console.log(`   Category: ${blindspot.category} > ${blindspot.subcategory}`);
    console.log(`   Description: ${blindspot.description}`);
    console.log(`   Status: ${blindspot.status}`);
    console.log(`   Solution: ${blindspot.solution}`);
    console.log('');
  });
  
  return highPriority;
}

// Generate recommendations
function generateRecommendations() {
  console.log('\n💡 RECOMMENDATIONS');
  console.log('==================');
  
  // Database issues
  const dbIssues = currentBlindspots.filter(bs => bs.category === 'Database Issues');
  if (dbIssues.length > 0) {
    console.log('🗄️ Database Issues:');
    console.log('  - Implement data validation at API level');
    console.log('  - Add database constraints for email fields');
    console.log('  - Create cleanup migration scripts');
    console.log('  - Add monitoring for data quality');
  }
  
  // Real-time issues
  const rtIssues = currentBlindspots.filter(bs => bs.category === 'Real-time System');
  if (rtIssues.length > 0) {
    console.log('⚡ Real-time System:');
    console.log('  - Add subscription health monitoring');
    console.log('  - Implement automatic reconnection');
    console.log('  - Add fallback polling mechanisms');
    console.log('  - Create real-time system diagnostics');
  }
  
  // Module dependency issues
  const depIssues = currentBlindspots.filter(bs => bs.category === 'Module Dependencies');
  if (depIssues.length > 0) {
    console.log('🔗 Module Dependencies:');
    console.log('  - Create dependency graph visualization');
    console.log('  - Add automated dependency validation');
    console.log('  - Implement module loading order tests');
    console.log('  - Add circular dependency detection');
  }
  
  // Architectural pattern issues
  const archIssues = currentBlindspots.filter(bs => bs.category === 'Architectural Patterns');
  if (archIssues.length > 0) {
    console.log('🏗️ Architectural Patterns:');
    console.log('  - Create COMP method compliance checker');
    console.log('  - Add architectural pattern validation');
    console.log('  - Implement code review guidelines');
    console.log('  - Add automated pattern detection');
  }
}

// Run full analysis
function runBlindspotAnalysis() {
  console.log('\n🚀 RUNNING FULL BLINDSPOT ANALYSIS');
  console.log('===================================');
  
  analyzeBlindspotPatterns();
  getRecurringBlindspots();
  getHighPriorityBlindspots();
  generateRecommendations();
  
  console.log('\n📊 SUMMARY');
  console.log('==========');
  console.log(`Total blindspots: ${currentBlindspots.length}`);
  console.log(`High priority: ${currentBlindspots.filter(bs => bs.severity === 'HIGH').length}`);
  console.log(`Fixed: ${currentBlindspots.filter(bs => bs.status === 'FIXED').length}`);
  console.log(`Identified: ${currentBlindspots.filter(bs => bs.status === 'IDENTIFIED').length}`);
  
  return {
    total: currentBlindspots.length,
    highPriority: currentBlindspots.filter(bs => bs.severity === 'HIGH').length,
    fixed: currentBlindspots.filter(bs => bs.status === 'FIXED').length,
    identified: currentBlindspots.filter(bs => bs.status === 'IDENTIFIED').length
  };
}

// Make functions globally available
window.analyzeBlindspotPatterns = analyzeBlindspotPatterns;
window.getRecurringBlindspots = getRecurringBlindspots;
window.getHighPriorityBlindspots = getHighPriorityBlindspots;
window.generateRecommendations = generateRecommendations;
window.runBlindspotAnalysis = runBlindspotAnalysis;

console.log('✅ Blindspot tracker loaded');
console.log('📋 Available functions:');
console.log('  - analyzeBlindspotPatterns()');
console.log('  - getRecurringBlindspots()');
console.log('  - getHighPriorityBlindspots()');
console.log('  - generateRecommendations()');
console.log('  - runBlindspotAnalysis()');
console.log('\n🚀 Run runBlindspotAnalysis() for full analysis!');

