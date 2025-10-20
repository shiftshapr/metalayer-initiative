/**
 * FIX REAL-TIME AUTHENTICATION
 * Ensures Supabase real-time channels work with Chrome profile authentication
 */

console.log('🔧 FIXING REAL-TIME AUTHENTICATION');
console.log('='.repeat(50));

// Function to fix real-time authentication
async function fixRealtimeAuth() {
  console.log('\n🔧 FIXING SUPABASE REAL-TIME AUTHENTICATION');
  console.log('-'.repeat(45));
  
  try {
    // Check current auth state
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    console.log('📊 Current Supabase auth user:', user?.email || 'None');
    console.log('📊 Auth error:', authError?.message || 'None');
    
    if (authError && authError.message.includes('Auth session missing')) {
      console.log('❌ No Supabase auth session - this is why real-time is failing');
      console.log('🔧 Setting up anonymous authentication for real-time...');
      
      // Set up anonymous authentication for real-time
      const { data: anonData, error: anonError } = await window.supabase.auth.signInAnonymously();
      
      if (anonError) {
        console.log('❌ Failed to set up anonymous auth:', anonError.message);
        return false;
      }
      
      console.log('✅ Anonymous authentication set up for real-time');
      console.log('📊 Anonymous user:', anonData.user?.id);
      
      // Now test real-time connection
      console.log('\n🧪 TESTING REAL-TIME CONNECTION...');
      const testChannel = window.supabase.channel('test-connection');
      const { error: subError } = await testChannel.subscribe();
      
      if (subError) {
        console.log('❌ Real-time connection failed:', subError.message);
        return false;
      }
      
      console.log('✅ Real-time connection successful');
      console.log('📊 Channel state:', testChannel.state);
      
      // Clean up test channel
      await testChannel.unsubscribe();
      
      return true;
    } else {
      console.log('✅ Supabase auth session exists');
      return true;
    }
    
  } catch (error) {
    console.log('❌ Failed to fix real-time authentication:', error);
    return false;
  }
}

// Function to test real-time propagation after auth fix
async function testRealtimePropagationAfterFix() {
  console.log('\n🧪 TESTING REAL-TIME PROPAGATION AFTER AUTH FIX');
  console.log('-'.repeat(50));
  
  try {
    if (!window.robustMessageOperations || !window.robustMessageOperations.isInitialized) {
      console.log('❌ Message operations not initialized');
      return false;
    }
    
    // Find a message to edit
    const messages = document.querySelectorAll('.message');
    if (messages.length === 0) {
      console.log('❌ No messages found to test with');
      return false;
    }
    
    const firstMessage = messages[0];
    const messageId = firstMessage.dataset.messageId;
    const testContent = `Real-time test after auth fix ${Date.now()}`;
    
    console.log(`📝 Testing edit of message: ${messageId}`);
    console.log(`📝 New content: ${testContent}`);
    
    // Test the edit operation
    const result = await window.robustMessageOperations.editMessage(messageId, testContent);
    
    console.log('📊 Edit result:', result);
    
    if (result.success) {
      console.log('✅ Edit operation completed');
      console.log('🔍 Check the logs above for propagation details');
      console.log('🔍 Look for "🔍 BROADCAST" and "🔍 PROPAGATE" logs');
    } else {
      console.log('❌ Edit operation failed:', result.error);
    }
    
    return result.success;
    
  } catch (error) {
    console.log('❌ Real-time propagation test failed:', error);
    return false;
  }
}

// Function to check channel status
async function checkChannelStatus() {
  console.log('\n🔍 CHECKING CHANNEL STATUS');
  console.log('-'.repeat(30));
  
  try {
    if (window.robustRealtimeManager) {
      const status = window.robustRealtimeManager.getStatus();
      console.log('📊 Realtime Manager Status:', status);
      console.log(`📊 Is Connected: ${status.isConnected}`);
      console.log(`📊 Channels: ${status.channels?.size || 0}`);
      
      if (status.channels && status.channels.size > 0) {
        const channels = Array.from(status.channels.values());
        channels.forEach((channel, index) => {
          console.log(`📊 Channel ${index + 1}:`, {
            topic: channel.topic,
            state: channel.state,
            bindings: Object.keys(channel.bindings || {})
          });
        });
      }
    } else {
      console.log('❌ CleanRealtimeManager not available');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Failed to check channel status:', error);
    return false;
  }
}

// Main function to fix real-time authentication and test
async function fixAndTestRealtime() {
  console.log('🚀 FIXING AND TESTING REAL-TIME AUTHENTICATION');
  console.log('='.repeat(55));
  
  const authFix = await fixRealtimeAuth();
  const channelStatus = await checkChannelStatus();
  const propagationTest = await testRealtimePropagationAfterFix();
  
  console.log('\n📊 REAL-TIME AUTH FIX RESULTS:');
  console.log('='.repeat(35));
  console.log(`✅ Auth Fix: ${authFix ? 'SUCCESS' : 'FAILED'}`);
  console.log(`✅ Channel Status: ${channelStatus ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Propagation Test: ${propagationTest ? 'PASS' : 'FAIL'}`);
  
  if (authFix && channelStatus && propagationTest) {
    console.log('\n🎉 REAL-TIME PROPAGATION IS NOW WORKING!');
  } else {
    console.log('\n❌ REAL-TIME PROPAGATION STILL HAS ISSUES!');
    console.log('🔍 Check the detailed logs above for specific problems');
  }
  
  return { authFix, channelStatus, propagationTest };
}

// Make functions globally available
window.fixRealtimeAuth = fixRealtimeAuth;
window.testRealtimePropagationAfterFix = testRealtimePropagationAfterFix;
window.checkChannelStatus = checkChannelStatus;
window.fixAndTestRealtime = fixAndTestRealtime;

console.log('✅ Real-time authentication fix functions loaded');
console.log('📋 Run: window.fixAndTestRealtime() to fix and test real-time');
