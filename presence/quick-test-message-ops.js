/**
 * QUICK TEST FOR MESSAGE OPERATIONS
 * Simple test to verify the robust system works
 */

console.log('🧪 QUICK MESSAGE OPERATIONS TEST');
console.log('='.repeat(40));

// Test if the robust message operations manager is available
function testModuleAvailability() {
  console.log('\n🔍 TEST 1: Module Availability');
  console.log('-'.repeat(25));
  
  const checks = {
    'RobustMessageOperationsManager': typeof window.robustMessageOperations !== 'undefined',
    'Supabase Client': typeof window.supabase !== 'undefined',
    'Realtime Manager': typeof window.robustRealtimeManager !== 'undefined',
    'Current User': typeof window.currentUser !== 'undefined'
  };
  
  console.log('📊 Module Status:');
  Object.entries(checks).forEach(([name, available]) => {
    console.log(`${available ? '✅' : '❌'} ${name}: ${available ? 'Available' : 'Missing'}`);
  });
  
  const allAvailable = Object.values(checks).every(Boolean);
  console.log(`\n${allAvailable ? '✅' : '❌'} All modules: ${allAvailable ? 'Available' : 'Some missing'}`);
  
  return allAvailable;
}

// Test initialization
async function testInitialization() {
  console.log('\n🔍 TEST 2: Initialization');
  console.log('-'.repeat(25));
  
  try {
    if (!window.robustMessageOperations) {
      throw new Error('RobustMessageOperationsManager not available');
    }
    
    if (window.robustMessageOperations.isInitialized) {
      console.log('✅ Message operations already initialized');
      return true;
    }
    
    console.log('🔧 Initializing message operations...');
    const result = await window.robustMessageOperations.initialize(
      window.supabase,
      window.robustRealtimeManager
    );
    
    if (result) {
      console.log('✅ Message operations initialized successfully');
      return true;
    } else {
      throw new Error('Initialization failed');
    }
    
  } catch (error) {
    console.log('❌ Initialization failed:', error.message);
    return false;
  }
}

// Test basic functionality
async function testBasicFunctionality() {
  console.log('\n🔍 TEST 3: Basic Functionality');
  console.log('-'.repeat(25));
  
  try {
    if (!window.robustMessageOperations || !window.robustMessageOperations.isInitialized) {
      throw new Error('Message operations not initialized');
    }
    
    // Test logging
    console.log('🔧 Testing logging system...');
    window.robustMessageOperations.setLogLevel('DEBUG');
    window.robustMessageOperations.log('DEBUG', 'Test log message');
    
    // Test stats
    console.log('📊 Testing stats system...');
    const stats = window.robustMessageOperations.getStats();
    console.log('📊 Stats:', stats);
    
    console.log('✅ Basic functionality working');
    return true;
    
  } catch (error) {
    console.log('❌ Basic functionality test failed:', error.message);
    return false;
  }
}

// Run all quick tests
async function runQuickTests() {
  console.log('🚀 RUNNING QUICK TESTS...\n');
  
  const test1 = testModuleAvailability();
  const test2 = await testInitialization();
  const test3 = await testBasicFunctionality();
  
  console.log('\n📊 QUICK TEST RESULTS:');
  console.log('='.repeat(30));
  console.log(`✅ Module Availability: ${test1 ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Initialization: ${test2 ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Basic Functionality: ${test3 ? 'PASS' : 'FAIL'}`);
  
  const allPassed = test1 && test2 && test3;
  
  if (allPassed) {
    console.log('\n🎉 QUICK TESTS PASSED!');
    console.log('✅ Robust message operations system is ready');
    console.log('📋 Run window.testMessageOperations() for full testing');
  } else {
    console.log('\n❌ QUICK TESTS FAILED!');
    console.log('🔧 System needs more work before full testing');
  }
  
  return allPassed;
}

// Make functions globally available
window.quickTestMessageOps = runQuickTests;
window.testModuleAvailability = testModuleAvailability;
window.testInitialization = testInitialization;
window.testBasicFunctionality = testBasicFunctionality;

console.log('✅ Quick test functions loaded');
console.log('📋 Run: window.quickTestMessageOps() to test the system');
