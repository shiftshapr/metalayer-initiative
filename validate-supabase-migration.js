
// Migration Validation Script
// Run this in the browser console to validate the Supabase real-time migration

console.log('🔍 Validating Supabase real-time migration...');

// Check if Supabase client is loaded
if (typeof createClient === 'undefined') {
  console.error('❌ Supabase client not loaded');
} else {
  console.log('✅ Supabase client loaded');
}

// Check if SupabaseRealtimeClient is available
if (typeof SupabaseRealtimeClient === 'undefined') {
  console.error('❌ SupabaseRealtimeClient not loaded');
} else {
  console.log('✅ SupabaseRealtimeClient loaded');
}

// Check if old WebSocket functions are replaced
if (typeof sendWebSocketMessage !== 'undefined') {
  console.warn('⚠️  Old sendWebSocketMessage function still exists');
} else {
  console.log('✅ Old WebSocket functions removed');
}

if (typeof sendSupabaseMessage !== 'undefined') {
  console.log('✅ New sendSupabaseMessage function available');
} else {
  console.error('❌ New sendSupabaseMessage function not found');
}

// Test Supabase real-time client initialization
if (window.supabaseRealtimeClient) {
  console.log('✅ Supabase real-time client initialized');
  console.log('📊 Client stats:', window.supabaseRealtimeClient.getStats());
} else {
  console.warn('⚠️  Supabase real-time client not initialized');
}

console.log('🔍 Migration validation complete');
