/**
 * Diagnostic script to identify Supabase library loading issues
 * Run this in browser console on timeline page
 */

console.log('🔍 DIAGNOSTIC: Checking Supabase library loading...');

// Check 1: Is supabase.min.js loaded?
const supabaseScript = Array.from(document.scripts).find(s => 
  s.src && s.src.includes('supabase.min.js')
);
console.log('1. Supabase script tag:', supabaseScript ? '✅ Found' : '❌ Not found');
if (supabaseScript) {
  console.log('   Script src:', supabaseScript.src);
  console.log('   Script type:', supabaseScript.type);
}

// Check 2: Is global supabase object available?
console.log('2. Global supabase object:', typeof supabase !== 'undefined' ? '✅ Available' : '❌ Not available');
if (typeof supabase !== 'undefined') {
  console.log('   supabase type:', typeof supabase);
  console.log('   supabase keys:', Object.keys(supabase || {}).slice(0, 10));
  console.log('   supabase.createClient:', typeof supabase.createClient);
}

// Check 3: Is window.supabase available?
console.log('3. window.supabase:', typeof window.supabase !== 'undefined' ? '✅ Available' : '❌ Not available');
if (typeof window.supabase !== 'undefined') {
  console.log('   window.supabase type:', typeof window.supabase);
  console.log('   window.supabase.createClient:', typeof window.supabase.createClient);
}

// Check 4: Check for webpack chunk
console.log('4. Webpack chunk:', typeof self !== 'undefined' && self.webpackChunksupabase ? '✅ Found' : '❌ Not found');

// Check 5: Try to import Supabase as module
(async () => {
  try {
    const supabaseModule = await import('/presence/lib/supabase.min.js');
    console.log('5. ES6 Module import:', '✅ Success');
    console.log('   Module exports:', Object.keys(supabaseModule || {}).slice(0, 10));
    console.log('   createClient:', typeof supabaseModule.createClient);
  } catch (e) {
    console.log('5. ES6 Module import:', '❌ Failed');
    console.log('   Error:', e.message);
  }
})();

// Check 6: SUPABASE_URL and SUPABASE_ANON_KEY
console.log('6. Config variables:');
console.log('   SUPABASE_URL:', typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '❌ Not defined');
console.log('   SUPABASE_ANON_KEY:', typeof SUPABASE_ANON_KEY !== 'undefined' ? (SUPABASE_ANON_KEY ? '✅ Defined' : '❌ Empty') : '❌ Not defined');

console.log('✅ Diagnostic complete');




