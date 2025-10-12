/**
 * CONSOLE TEST FUNCTIONS FOR SUPABASE INITIALIZATION FIX
 * These functions are automatically loaded when the extension loads
 * Run: runAllSupabaseTests() in the Chrome DevTools Console
 */

// Test 1: Check if window.supabase client is initialized
window.testSupabaseClient = function() {
  console.log("🔍 TEST 1: Checking Supabase client initialization...");
  console.log("================================================================================");
  
  console.log("typeof window.supabase:", typeof window.supabase);
  console.log("window.supabase:", window.supabase);
  
  if (!window.supabase) {
    console.error("❌ TEST 1 FAILED: window.supabase is undefined");
    return false;
  }
  
  console.log("window.supabase.from:", typeof window.supabase.from);
  console.log("window.supabase.auth:", typeof window.supabase.auth);
  console.log("window.supabase.storage:", typeof window.supabase.storage);
  
  if (typeof window.supabase.from !== 'function') {
    console.error("❌ TEST 1 FAILED: window.supabase.from is not a function");
    return false;
  }
  
  console.log("✅ TEST 1 PASSED: Supabase client is properly initialized");
  return true;
};

// Test 2: Check if SupabaseRealtimeClient is initialized
window.testSupabaseRealtimeClient = function() {
  console.log("\n🔍 TEST 2: Checking SupabaseRealtimeClient initialization...");
  console.log("================================================================================");
  
  console.log("typeof window.supabaseRealtimeClient:", typeof window.supabaseRealtimeClient);
  
  if (!window.supabaseRealtimeClient) {
    console.error("❌ TEST 2 FAILED: window.supabaseRealtimeClient is undefined");
    return false;
  }
  
  console.log("window.supabaseRealtimeClient.supabase:", typeof window.supabaseRealtimeClient.supabase);
  
  if (!window.supabaseRealtimeClient.supabase) {
    console.error("❌ TEST 2 FAILED: window.supabaseRealtimeClient.supabase is null");
    return false;
  }
  
  console.log("window.supabaseRealtimeClient.supabase.from:", typeof window.supabaseRealtimeClient.supabase.from);
  
  if (typeof window.supabaseRealtimeClient.supabase.from !== 'function') {
    console.error("❌ TEST 2 FAILED: SupabaseRealtimeClient.supabase is not a valid client");
    return false;
  }
  
  console.log("✅ TEST 2 PASSED: SupabaseRealtimeClient is properly initialized");
  return true;
};

// Test 3: Check if presence tracking uses Supabase (not API fallback)
window.testPresenceUsesSupabase = function() {
  console.log("\n🔍 TEST 3: Checking if presence uses Supabase...");
  console.log("================================================================================");
  
  console.log("Look in the console logs above for:");
  console.log("✅ GOOD: No '⚠️ PRESENCE: Supabase real-time client not available' message");
  console.log("✅ GOOD: No '❌ SUPABASE: Real-time client not initialized' message");
  console.log("❌ BAD: If you see those messages, presence is using API fallback");
  
  // Check if both previous tests passed
  const test1 = window.testSupabaseClient();
  const test2 = window.testSupabaseRealtimeClient();
  
  if (test1 && test2) {
    console.log("✅ TEST 3 PASSED: Both Supabase client and real-time client are initialized");
    console.log("✅ Presence tracking should be using Supabase real-time");
    return true;
  } else {
    console.error("❌ TEST 3 FAILED: One or more Supabase components not initialized");
    return false;
  }
};

// Test 4: Run all tests
window.runAllSupabaseTests = function() {
  console.log("🧪 RUNNING ALL SUPABASE TESTS...");
  console.log("================================================================================\n");
  
  const test1 = window.testSupabaseClient();
  const test2 = window.testSupabaseRealtimeClient();
  const test3 = window.testPresenceUsesSupabase();
  
  console.log("\n\n📊 TEST SUMMARY:");
  console.log("================================================================================");
  console.log("TEST 1 (Supabase Client):", test1 ? "✅ PASSED" : "❌ FAILED");
  console.log("TEST 2 (SupabaseRealtimeClient):", test2 ? "✅ PASSED" : "❌ FAILED");
  console.log("TEST 3 (Presence Uses Supabase):", test3 ? "✅ PASSED" : "❌ FAILED");
  
  const allPassed = test1 && test2 && test3;
  console.log("\n" + (allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"));
  
  if (allPassed) {
    console.log("\n🎉 SUCCESS! Supabase is fully initialized and presence tracking is working!");
  } else {
    console.log("\n❌ FAILURE! Check the error messages above for details.");
  }
  
  return allPassed;
};

// Auto-log when this script is loaded
console.log("✅ Supabase test functions loaded!");
console.log("📝 Run: runAllSupabaseTests() to test Supabase initialization");


