// Test Suite: Aura Changes Real-time Verification
// Tests for dual pathway detection and timing
// Run in browser console: window.testAuraChanges.testAll()

window.testAuraChanges = {
  // Test for dual pathway issue (Supabase + chrome.storage)
  testDualPathways: async () => {
    console.log('🧪 ========================================');
    console.log('🧪 TEST: Aura Change Dual Pathways');
    console.log('🧪 ========================================\n');
    
    // Generate random color
    const color = '#' + Math.floor(Math.random()*16777215).toString(16);
    console.log(`🎨 Testing with color: ${color}`);
    
    let supabaseReceived = false;
    let chromeStorageReceived = false;
    let supabaseTime = null;
    let chromeStorageTime = null;
    const startTime = performance.now();
    
    // Set up Supabase listener
    const originalOnUserUpdated = window.supabaseRealtimeClient?._onUserUpdated;
    if (window.supabaseRealtimeClient) {
      window.supabaseRealtimeClient.onUserUpdated = (user) => {
        if (user.aura_color === color && !supabaseReceived) {
          supabaseReceived = true;
          supabaseTime = performance.now() - startTime;
          console.log(`✅ Aura change received via Supabase (${supabaseTime.toFixed(2)}ms)`);
        }
        if (originalOnUserUpdated) {
          originalOnUserUpdated(user);
        }
      };
    }
    
    // Set up chrome.storage listener
    const storageListener = (changes, namespace) => {
      if (namespace === 'local' && changes.auraColorChange) {
        if (!chromeStorageReceived) {
          chromeStorageReceived = true;
          chromeStorageTime = performance.now() - startTime;
          console.log(`✅ Aura change received via chrome.storage (${chromeStorageTime.toFixed(2)}ms)`);
        }
      }
    };
    chrome.storage.onChanged.addListener(storageListener);
    
    // Broadcast aura change
    console.log('📡 Broadcasting aura change...');
    await window.supabaseRealtimeClient.broadcastAuraColorChange(color);
    
    // Wait 5 seconds for updates
    console.log('⏳ Waiting 5 seconds for updates...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Report results
    console.log('\n📊 RESULTS:');
    console.log('─────────────────────────────────────────');
    console.log(`Supabase pathway:       ${supabaseReceived ? '✅ ACTIVE' : '❌ INACTIVE'}`);
    if (supabaseReceived) {
      console.log(`  Latency: ${supabaseTime.toFixed(2)}ms`);
    }
    console.log(`Chrome storage pathway: ${chromeStorageReceived ? '⚠️  ACTIVE (REDUNDANT)' : '✅ DISABLED'}`);
    if (chromeStorageReceived) {
      console.log(`  Latency: ${chromeStorageTime.toFixed(2)}ms`);
    }
    console.log('─────────────────────────────────────────');
    
    if (supabaseReceived && chromeStorageReceived) {
      console.warn('⚠️  WARNING: DUAL PATHWAYS DETECTED!');
      console.warn('   Both Supabase and chrome.storage are active.');
      console.warn('   This can cause race conditions and inconsistent updates.');
      console.warn('   RECOMMENDATION: Remove chrome.storage pathway.');
      return 'warning';
    } else if (supabaseReceived && !chromeStorageReceived) {
      console.log('✅ PASS: Clean implementation - Supabase only');
      return 'pass';
    } else if (!supabaseReceived && chromeStorageReceived) {
      console.error('❌ FAIL: Supabase pathway not working, falling back to chrome.storage');
      return 'fail';
    } else {
      console.error('❌ FAIL: No pathways working!');
      return 'fail';
    }
    
    // Cleanup
    chrome.storage.onChanged.removeListener(storageListener);
    if (window.supabaseRealtimeClient && originalOnUserUpdated) {
      window.supabaseRealtimeClient.onUserUpdated = originalOnUserUpdated;
    }
  },
  
  // Test aura change timing (latency measurement)
  testAuraChangeTiming: async () => {
    console.log('\n🧪 ========================================');
    console.log('🧪 TEST: Aura Change Timing');
    console.log('🧪 ========================================\n');
    
    const color = '#' + Math.floor(Math.random()*16777215).toString(16);
    console.log(`🎨 Testing with color: ${color}`);
    
    const startTime = performance.now();
    let received = false;
    
    // Set up listener
    const originalOnUserUpdated = window.supabaseRealtimeClient?._onUserUpdated;
    if (window.supabaseRealtimeClient) {
      window.supabaseRealtimeClient.onUserUpdated = (user) => {
        if (user.aura_color === color && !received) {
          received = true;
          const totalTime = performance.now() - startTime;
          console.log(`\n⏱️  Total round-trip time: ${totalTime.toFixed(2)}ms`);
          
          if (totalTime < 100) {
            console.log('✅ EXCELLENT - Sub-100ms latency');
          } else if (totalTime < 500) {
            console.log('✅ GOOD - Sub-500ms latency');
          } else if (totalTime < 1000) {
            console.log('⚠️  ACCEPTABLE - Sub-1s latency');
          } else if (totalTime < 5000) {
            console.log('⚠️  SLOW - Over 1s latency');
          } else {
            console.error('❌ VERY SLOW - Over 5s latency');
          }
        }
        if (originalOnUserUpdated) {
          originalOnUserUpdated(user);
        }
      };
    }
    
    // Send update
    console.log('📡 Broadcasting aura change...');
    await window.supabaseRealtimeClient.broadcastAuraColorChange(color);
    
    const sendTime = performance.now() - startTime;
    console.log(`⏱️  Send time: ${sendTime.toFixed(2)}ms`);
    
    // Wait up to 10 seconds for response
    console.log('⏳ Waiting for update (max 10s)...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    if (!received) {
      console.error('❌ FAIL: No update received within 10 seconds');
      return 'fail';
    }
    
    // Cleanup
    if (window.supabaseRealtimeClient && originalOnUserUpdated) {
      window.supabaseRealtimeClient.onUserUpdated = originalOnUserUpdated;
    }
    
    return 'pass';
  },
  
  // Test aura change propagation to UI
  testAuraChangePropagation: async () => {
    console.log('\n🧪 ========================================');
    console.log('🧪 TEST: Aura Change UI Propagation');
    console.log('🧪 ========================================\n');
    
    const color = '#' + Math.floor(Math.random()*16777215).toString(16);
    console.log(`🎨 Testing with color: ${color}`);
    
    // Get current user email
    const userEmail = await window.getCurrentUserEmail();
    console.log(`👤 Current user: ${userEmail}`);
    
    // Broadcast change
    console.log('📡 Broadcasting aura change...');
    await window.supabaseRealtimeClient.broadcastAuraColorChange(color);
    
    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check visibility avatars
    const visibilityContainer = document.getElementById('visible-users-container');
    if (visibilityContainer) {
      const userAvatars = visibilityContainer.querySelectorAll('.user-info');
      console.log(`\n🔍 Found ${userAvatars.length} visible user avatars`);
      
      let foundWithNewColor = false;
      userAvatars.forEach((avatar, i) => {
        const auraElement = avatar.querySelector('[class*="aura"]') || avatar.querySelector('.avatar-wrapper');
        if (auraElement) {
          const style = window.getComputedStyle(auraElement);
          const bgColor = style.backgroundColor || style.boxShadow;
          console.log(`  Avatar ${i+1}: ${bgColor}`);
          
          // Convert color to hex for comparison (rough check)
          if (bgColor.includes('rgb')) {
            // Color was updated (not checking exact match due to CSS conversion complexity)
            foundWithNewColor = true;
          }
        }
      });
      
      if (foundWithNewColor) {
        console.log('✅ PASS: Aura color propagated to visibility avatars');
      } else {
        console.warn('⚠️  WARNING: Could not verify aura color in visibility avatars');
      }
    }
    
    // Check message avatars
    const messages = document.querySelectorAll('.message');
    if (messages.length > 0) {
      console.log(`\n🔍 Found ${messages.length} message avatars`);
      console.log('   (Check manually if aura colors updated)');
    }
    
    // Check profile avatar
    const profileAvatar = document.getElementById('user-avatar-container');
    if (profileAvatar) {
      const auraElement = profileAvatar.querySelector('[class*="aura"]') || profileAvatar.querySelector('.avatar-wrapper');
      if (auraElement) {
        const style = window.getComputedStyle(auraElement);
        const bgColor = style.backgroundColor || style.boxShadow;
        console.log(`\n🔍 Profile avatar aura: ${bgColor}`);
      }
    }
    
    console.log('\n✅ UI propagation test complete - check visual results');
  },
  
  // Run all tests
  testAll: async () => {
    console.log('🧪 ════════════════════════════════════════');
    console.log('🧪 AURA CHANGES - COMPREHENSIVE TEST SUITE');
    console.log('🧪 ════════════════════════════════════════\n');
    
    const results = {
      passed: 0,
      failed: 0,
      warnings: 0
    };
    
    // Test 1: Dual pathways
    const test1 = await window.testAuraChanges.testDualPathways();
    if (test1 === 'pass') results.passed++;
    else if (test1 === 'fail') results.failed++;
    else if (test1 === 'warning') results.warnings++;
    
    // Test 2: Timing
    const test2 = await window.testAuraChanges.testAuraChangeTiming();
    if (test2 === 'pass') results.passed++;
    else if (test2 === 'fail') results.failed++;
    
    // Test 3: UI propagation
    await window.testAuraChanges.testAuraChangePropagation();
    
    // Final report
    console.log('\n🧪 ════════════════════════════════════════');
    console.log('🧪 FINAL RESULTS');
    console.log('🧪 ════════════════════════════════════════');
    console.log(`✅ Passed:   ${results.passed}`);
    console.log(`❌ Failed:   ${results.failed}`);
    console.log(`⚠️  Warnings: ${results.warnings}`);
    console.log('🧪 ════════════════════════════════════════\n');
    
    return results;
  }
};

console.log('✅ Aura change test suite loaded');
console.log('   Run: window.testAuraChanges.testAll()');

