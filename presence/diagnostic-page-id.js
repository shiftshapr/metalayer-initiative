// TE2 DIAGNOSTIC: Check current vs expected page_id
// Run this in the browser console to diagnose page_id mismatch

window.diagnoseCachedPageId = function() {
  console.log('🔍 === PAGE_ID DIAGNOSTIC ===');
  console.log('');
  
  const currentUrl = window.location.href;
  console.log('📍 Current URL:', currentUrl);
  console.log('');
  
  // Check cached URL data
  if (window.lastNormalizedData) {
    console.log('💾 CACHED URL DATA:');
    console.log('  rawUrl:', window.lastNormalizedData.rawUrl);
    console.log('  normalizedUrl:', window.lastNormalizedData.normalizedUrl);
    console.log('  pageId:', window.lastNormalizedData.pageId);
    console.log('');
    
    // Check if it has triple underscores (BAD)
    const hasTripleUnderscores = window.lastNormalizedData.pageId.includes('___');
    if (hasTripleUnderscores) {
      console.error('❌ PROBLEM DETECTED: Cached page_id has TRIPLE underscores!');
      console.error('❌ This means the extension is using OLD cached data.');
      console.error('❌ SOLUTION: Hard refresh the extension to clear the cache.');
      console.error('');
      console.error('📋 Steps to fix:');
      console.error('   1. Right-click the extension icon');
      console.error('   2. Select "Reload extension" or "Manage extensions"');
      console.error('   3. Click the reload button on the extension card');
      console.error('');
    } else {
      console.log('✅ Cached page_id looks correct (single underscores)');
      console.log('');
    }
  } else {
    console.log('⚠️  No cached URL data found in window.lastNormalizedData');
    console.log('');
  }
  
  // Show what the CORRECT page_id should be
  const expectedPageId = currentUrl
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')  // Collapse multiple underscores
    .substring(0, 100);
  
  console.log('✅ EXPECTED page_id (with single underscores):');
  console.log('  ', expectedPageId);
  console.log('');
  
  if (window.lastNormalizedData) {
    if (window.lastNormalizedData.pageId === expectedPageId) {
      console.log('✅✅ MATCH! Extension is using the correct page_id');
    } else {
      console.error('❌❌ MISMATCH! Extension is using WRONG page_id');
      console.error('Expected:', expectedPageId);
      console.error('Actual:  ', window.lastNormalizedData.pageId);
    }
  }
  
  console.log('');
  console.log('🔍 === END DIAGNOSTIC ===');
};

// Auto-run on load
window.diagnoseCachedPageId();

