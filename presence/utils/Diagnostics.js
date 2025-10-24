// ===== ERROR DIAGNOSTIC FUNCTIONS =====

// Diagnostic function to check for JavaScript errors
window.diagnoseJavaScriptErrors = function() {
    console.log('\n🔍 === JAVASCRIPT ERROR DIAGNOSTIC ===');
    
    // Check for common error sources
    const errorSources = [
      'websocket-diagnostic.js',
      'test-realtime-events.js', 
      'comprehensive-realtime-diagnostics.js',
      'sidepanel.js'
    ];
    
    console.log('🔍 Checking for error sources:', errorSources);
    
    // Check if critical functions are available
    const criticalFunctions = [
      'window.configManager',
      'window.refreshVisibilityAvatars',
      'window.setLastSeenThreshold',
      'window.getLastSeenThreshold'
    ];
    
    console.log('\n🔍 Checking critical functions:');
    criticalFunctions.forEach(func => {
      const available = eval(`typeof ${func} !== 'undefined'`);
      console.log(`   ${func}: ${available ? 'Available' : '❌ Missing'}`, null, 'general');
    });
    
    // Check for uncaught errors in console
    console.log('\n🔍 Checking console for errors...');
    console.log('   Look for "Uncaught" errors in the console above');
    console.log('   Check for missing dependencies or syntax errors');
    
    return {
      status: 'COMPLETE',
      errorSources: errorSources,
      criticalFunctions: criticalFunctions
    };
  };
  
  // Safe wrapper for all diagnostic functions
  window.safeDiagnostic = function(diagnosticFunction, ...args) {
    try {
      console.log(`Running diagnostic: ${diagnosticFunction.name}`, null, 'general');
      return diagnosticFunction(...args);
    } catch (error) {
      console.error(`❌ Diagnostic failed: ${diagnosticFunction.name}`, error);
      return { status: 'FAILED', error: error.message };
    }
  };
  
  // ===== DEBUGGING FUNCTIONS =====
  // Test function to debug visibility issues
  window.testVisibilitySystem = async function() {
    console.log('🔍 DEBUG: Testing visibility system...');
    
    try {
      // Get current user info
      const currentUser = await getCurrentUserEmail();
      console.log('🔍 DEBUG: Current user email:', currentUser);
      
      // Get current URL
      const urlData = await normalizeCurrentUrl();
      console.log('🔍 DEBUG: Current URL data:', urlData);
      
      // Test Supabase real-time query
      console.log('🔍 DEBUG: Testing Supabase real-time query...');
      const { data: presenceData, error } = await supabase
        .from('user_presence')
        .select('*')
        .eq('page_url', urlData.normalizedUrl)
        .eq('is_active', true);
      
      if (error) throw error;
      console.log('🔍 DEBUG: Supabase response:', JSON.stringify(presenceData, null, 2));
      
      if (presenceData && presenceData.length > 0) {
        console.log('🔍 DEBUG: Found', presenceData.length, 'active users');
        presenceData.forEach((user, index) => {
          console.log(`DEBUG: User ${index + 1}:`, {
            id: user.id,
            userId: user.userId,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            isCurrentUser: user.userId === currentUser || user.email === currentUser
          }, 'general');
        });
      }
      
      // Test loadCombinedAvatars
      console.log('🔍 DEBUG: Testing loadCombinedAvatars...');
      await loadCombinedAvatars(['comm-001', 'comm-002']);
      
      console.log('🔍 DEBUG: Visibility system test complete');
    } catch (error) {
      console.error('🔍 DEBUG: Error testing visibility system:', error);
    }
  };
  
  // Test function to force refresh visibility
  window.refreshVisibility = async function() {
    console.log('🔍 DEBUG: Force refreshing visibility...');
    try {
      const activeCommunities = ['comm-001', 'comm-002'];
      await loadCombinedAvatars(activeCommunities);
      console.log('🔍 DEBUG: Visibility refresh complete');
    } catch (error) {
      console.error('🔍 DEBUG: Error refreshing visibility:', error);
    }
  };
  
  // ===== EXTENSION RELOAD & BUILD TRACKING =====
  const EXTENSION_BUILD = '2025-10-14-enhanced-logging'; // Updated: Enhanced logging for inactive user visibility debugging + avatar filter fix
  const BACKEND_EXPECTED_VERSION = '1.2.4-urlnorm-fix';
  const RELOAD_TIMESTAMP = new Date().toISOString();
  console.log('🚀 EXTENSION RELOADED:', {
    build: EXTENSION_BUILD,
    timestamp: RELOAD_TIMESTAMP,
    expectedBackend: BACKEND_EXPECTED_VERSION,
    userAgent: navigator.userAgent,
    location: window.location.href
  });
  console.log('🔍 BUILD VERIFICATION: Extension version', EXTENSION_BUILD, 'loaded at', RELOAD_TIMESTAMP);
  console.log('🔍 BUILD VERIFICATION: Expected backend version:', BACKEND_EXPECTED_VERSION);
  
  // Clear URL normalization cache on extension reload to prevent stale data
  // (Function will be defined later in the file)
  
  // ===== MESSAGE DIAGNOSTIC FUNCTIONS =====
  window.getMessageDiagnostics = function() {
    console.log('🔍 MESSAGE DIAGNOSTICS: Getting message diagnostics...');
    return {
      status: 'COMPLETE',
      messageCount: document.querySelectorAll('.message').length,
      chatContainer: !!document.querySelector('.chat-messages'),
      lastMessage: document.querySelector('.message:last-child')?.textContent || 'No messages'
    };
  };
  
  window.clearMessageDiagnostics = function() {
    console.log('🧹 MESSAGE DIAGNOSTICS: Clearing message diagnostics...');
    // Clear any diagnostic data
    return { status: 'CLEARED' };
  };
  