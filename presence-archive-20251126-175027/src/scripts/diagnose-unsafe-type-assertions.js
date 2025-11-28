/**
 * Diagnostic Script: Unsafe Type Assertions in RealtimeManager
 * 
 * This script diagnoses unsafe type assertions (window.supabase casts)
 * that bypass TypeScript type checking.
 * 
 * Usage: Run in browser console
 */

(function() {
  console.log('🔍 DIAGNOSTIC: Unsafe Type Assertions');
  console.log('=========================================\n');

  const results = {
    timestamp: new Date().toISOString(),
    unsafeAssertions: [],
    recommendations: []
  };

  // Check if RealtimeManager module is available
  const moduleGraph = window.__CANOPI_MODULE_GRAPH__;
  const realtimeManager = moduleGraph?.realtimeManager;
  
  // Check if supabaseServiceInstance is available
  const supabaseService = moduleGraph?.supabaseService;
  
  // Check window.supabase usage
  const hasWindowSupabase = typeof window.supabase !== 'undefined';
  const hasSupabaseService = !!supabaseService;
  
  console.log('📊 MODULE AVAILABILITY:');
  console.log('  - RealtimeManager:', !!realtimeManager);
  console.log('  - SupabaseService:', hasSupabaseService);
  console.log('  - window.supabase:', hasWindowSupabase);
  console.log('');

  // Check for unsafe patterns
  if (hasWindowSupabase && !hasSupabaseService) {
    results.unsafeAssertions.push({
      issue: 'window.supabase exists but supabaseServiceInstance not available',
      severity: 'high',
      recommendation: 'Ensure SupabaseService is initialized before RealtimeManager'
    });
  }

  if (hasWindowSupabase && hasSupabaseService) {
    results.unsafeAssertions.push({
      issue: 'Both window.supabase and supabaseServiceInstance exist - potential unsafe casts',
      severity: 'medium',
      recommendation: 'Use supabaseServiceInstance.getClient() instead of window.supabase'
    });
  }

  // Check if supabaseService has getClient method
  if (hasSupabaseService) {
    try {
      const client = supabaseService.getClient();
      console.log('✅ SupabaseService.getClient() available');
      console.log('  - Client type:', typeof client);
      console.log('  - Has .from method:', typeof client?.from === 'function');
      console.log('  - Has .channel method:', typeof client?.channel === 'function');
    } catch (error) {
      results.unsafeAssertions.push({
        issue: 'SupabaseService.getClient() failed: ' + error.message,
        severity: 'high',
        recommendation: 'Ensure SupabaseService is initialized before calling getClient()'
      });
    }
  }

  // Recommendations
  results.recommendations = [
    'Replace all window.supabase casts with supabaseServiceInstance.getClient()',
    'Remove unsafe type assertions: (window as unknown) as Window & { supabase?: SupabaseClient }',
    'Add proper error handling for getClient() calls',
    'Ensure SupabaseService is initialized before RealtimeManager uses it'
  ];

  // Summary
  console.log('\n=========================================');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('=========================================');
  console.log('Unsafe Assertions Found:', results.unsafeAssertions.length);
  results.unsafeAssertions.forEach((issue, i) => {
    console.log(`  ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.issue}`);
    console.log(`     Recommendation: ${issue.recommendation}`);
  });
  
  console.log('\n💡 RECOMMENDATIONS:');
  results.recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
  
  return results;
})();

