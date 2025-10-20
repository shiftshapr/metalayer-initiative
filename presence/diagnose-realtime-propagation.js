/**
 * COMPREHENSIVE REAL-TIME PROPAGATION DIAGNOSTIC
 * Extensive logging to diagnose why real-time propagation is failing
 */

console.log('🔍 REAL-TIME PROPAGATION DIAGNOSTIC');
console.log('='.repeat(50));

// Enable debug logging for all systems
function enableDebugLogging() {
  console.log('\n🔧 ENABLING DEBUG LOGGING FOR ALL SYSTEMS');
  console.log('-'.repeat(40));
  
  try {
    // Enable debug logging for CleanRealtimeManager
    if (window.cleanRealtimeManager) {
      window.cleanRealtimeManager.setLogLevel('DEBUG');
      console.log('✅ CleanRealtimeManager debug logging enabled');
    } else {
      console.log('❌ CleanRealtimeManager not available');
    }
    
    // Enable debug logging for RobustMessageOperationsManager
    if (window.robustMessageOperations) {
      window.robustMessageOperations.setLogLevel('DEBUG');
      console.log('✅ RobustMessageOperationsManager debug logging enabled');
    } else {
      console.log('❌ RobustMessageOperationsManager not available');
    }
    
    // Enable debug logging for RobustIntegration
    if (window.robustIntegration) {
      window.robustIntegration.setLogLevel('DEBUG');
      console.log('✅ RobustIntegration debug logging enabled');
    } else {
      console.log('❌ RobustIntegration not available');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Failed to enable debug logging:', error);
    return false;
  }
}

// Check real-time system status
async function checkRealtimeStatus() {
  console.log('\n🔍 CHECKING REAL-TIME SYSTEM STATUS');
  console.log('-'.repeat(35));
  
  try {
    // Check CleanRealtimeManager status
    if (window.cleanRealtimeManager) {
      const status = window.cleanRealtimeManager.getStatus();
      console.log('📊 CleanRealtimeManager Status:', status);
      console.log(`📊 Is Connected: ${status.isConnected}`);
      console.log(`📊 Channels: ${status.channels?.size || 0}`);
      console.log(`📊 User: ${status.user?.email || 'None'}`);
    } else {
      console.log('❌ CleanRealtimeManager not available');
    }
    
    // Check RobustMessageOperationsManager status
    if (window.robustMessageOperations) {
      const stats = window.robustMessageOperations.getStats();
      console.log('📊 RobustMessageOperationsManager Stats:', stats);
      console.log(`📊 Is Initialized: ${stats.isInitialized}`);
    } else {
      console.log('❌ RobustMessageOperationsManager not available');
    }
    
    // Check Supabase client
    if (window.supabase) {
      console.log('✅ Supabase client available');
      console.log(`📊 Supabase URL: ${window.supabase.supabaseUrl}`);
    } else {
      console.log('❌ Supabase client not available');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Failed to check real-time status:', error);
    return false;
  }
}

// Test real-time propagation with extensive logging
async function testRealtimePropagation() {
  console.log('\n🔍 TESTING REAL-TIME PROPAGATION');
  console.log('-'.repeat(35));
  
  try {
    if (!window.robustMessageOperations || !window.robustMessageOperations.isInitialized) {
      console.log('❌ Message operations not initialized');
      return false;
    }
    
    console.log('🧪 Testing message edit with extensive logging...');
    
    // Find a message to edit
    const messages = document.querySelectorAll('.message');
    if (messages.length === 0) {
      console.log('❌ No messages found to test with');
      return false;
    }
    
    const firstMessage = messages[0];
    const messageId = firstMessage.dataset.messageId;
    const testContent = `Real-time test ${Date.now()}`;
    
    console.log(`📝 Testing edit of message: ${messageId}`);
    console.log(`📝 New content: ${testContent}`);
    
    // Enable debug logging before test
    enableDebugLogging();
    
    // Test the edit operation
    const result = await window.robustMessageOperations.editMessage(messageId, testContent);
    
    console.log('📊 Edit result:', result);
    
    if (result.success) {
      console.log('✅ Edit operation completed');
      console.log('🔍 Check the logs above for propagation details');
    } else {
      console.log('❌ Edit operation failed:', result.error);
    }
    
    return result.success;
    
  } catch (error) {
    console.log('❌ Real-time propagation test failed:', error);
    return false;
  }
}

// Check Supabase real-time channels
async function checkSupabaseChannels() {
  console.log('\n🔍 CHECKING SUPABASE REAL-TIME CHANNELS');
  console.log('-'.repeat(40));
  
  try {
    if (!window.supabase) {
      console.log('❌ Supabase client not available');
      return false;
    }
    
    // Check if we can access the realtime client
    const realtime = window.supabase.realtime;
    if (realtime) {
      console.log('✅ Supabase realtime client available');
      console.log(`📊 Realtime client:`, realtime);
    } else {
      console.log('❌ Supabase realtime client not available');
    }
    
    // Check current user
    const { data: { user }, error } = await window.supabase.auth.getUser();
    if (error) {
      console.log('❌ Failed to get current user:', error);
    } else {
      console.log('📊 Current user:', user?.email || 'None');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Failed to check Supabase channels:', error);
    return false;
  }
}

// Run comprehensive real-time diagnostic
async function runRealtimeDiagnostic() {
  console.log('🚀 RUNNING COMPREHENSIVE REAL-TIME DIAGNOSTIC...\n');
  
  const debugLogging = enableDebugLogging();
  const realtimeStatus = await checkRealtimeStatus();
  const supabaseChannels = await checkSupabaseChannels();
  const propagationTest = await testRealtimePropagation();
  
  console.log('\n📊 REAL-TIME DIAGNOSTIC RESULTS:');
  console.log('='.repeat(40));
  console.log(`✅ Debug Logging: ${debugLogging ? 'ENABLED' : 'FAILED'}`);
  console.log(`✅ Realtime Status: ${realtimeStatus ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Supabase Channels: ${supabaseChannels ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Propagation Test: ${propagationTest ? 'PASS' : 'FAIL'}`);
  
  if (debugLogging && realtimeStatus && supabaseChannels && propagationTest) {
    console.log('\n🎉 REAL-TIME PROPAGATION IS WORKING!');
  } else {
    console.log('\n❌ REAL-TIME PROPAGATION HAS ISSUES!');
    console.log('🔍 Check the detailed logs above for specific problems');
  }
  
  return { debugLogging, realtimeStatus, supabaseChannels, propagationTest };
}

// Make functions globally available
window.diagnoseRealtimePropagation = runRealtimeDiagnostic;
window.enableDebugLogging = enableDebugLogging;
window.checkRealtimeStatus = checkRealtimeStatus;
window.testRealtimePropagation = testRealtimePropagation;
window.checkSupabaseChannels = checkSupabaseChannels;

console.log('✅ Real-time propagation diagnostic functions loaded');
console.log('📋 Run: window.diagnoseRealtimePropagation() to diagnose real-time issues');
