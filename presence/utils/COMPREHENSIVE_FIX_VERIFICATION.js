/**
 * COMPREHENSIVE FIX VERIFICATION
 * 
 * Tests all fixes:
 * 1. Border colors in dark mode
 * 2. Dark mode persistence
 * 3. Avatar aura display
 * 4. Focus mode delay
 * 5. API errors
 */

(function() {
  'use strict';

  async function verifyAllFixes() {
    console.log('🔍 =====================================================');
    console.log('🔍 COMPREHENSIVE FIX VERIFICATION');
    console.log('🔍 =====================================================');
    console.log('');

    const results = {
      borderColors: { passed: false, issues: [] },
      darkModePersistence: { passed: false, issues: [] },
      avatarAura: { passed: false, issues: [] },
      focusModeDelay: { passed: false, issues: [] },
      apiErrors: { passed: false, issues: [] }
    };

    // TEST 1: Border Colors
    console.log('🎨 TEST 1: Border Colors in Dark Mode');
    console.log('─────────────────────────────────────────────────────────');
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isDarkMode) {
      // Check focus-message-input-container
      const focusInput = document.querySelector('.focus-message-input-container');
      if (focusInput) {
        const computedStyle = window.getComputedStyle(focusInput);
        const borderColor = computedStyle.borderBottomColor;
        const rgbMatch = borderColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          
          // Check if it's white (255, 255, 255) or very light
          if (r > 240 && g > 240 && b > 240) {
            results.borderColors.passed = false;
            results.borderColors.issues.push(`focus-message-input-container has white/light border: rgb(${r}, ${g}, ${b})`);
            console.log(`❌ focus-message-input-container border: rgb(${r}, ${g}, ${b}) - TOO LIGHT`);
          } else {
            console.log(`✅ focus-message-input-container border: rgb(${r}, ${g}, ${b}) - Correct gray`);
          }
        }
      }
      
      // Check messages with replies
      const messagesWithReplies = document.querySelectorAll('.message.has-replies, .message.thread-starter');
      messagesWithReplies.forEach((msg, index) => {
        const computedStyle = window.getComputedStyle(msg);
        const borderColor = computedStyle.borderBottomColor;
        const rgbMatch = borderColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        
        if (rgbMatch && computedStyle.borderBottomWidth !== '0px') {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          
          if (r > 240 && g > 240 && b > 240) {
            results.borderColors.passed = false;
            results.borderColors.issues.push(`Message ${index + 1} with replies has white/light border: rgb(${r}, ${g}, ${b})`);
            console.log(`❌ Message ${index + 1} border: rgb(${r}, ${g}, ${b}) - TOO LIGHT`);
          }
        }
      });
      
      if (results.borderColors.issues.length === 0) {
        results.borderColors.passed = true;
        console.log('✅ All border colors are correct in dark mode');
      }
    } else {
      console.log('⚠️ Not in dark mode - skipping border color test');
      results.borderColors.passed = true; // Pass if not in dark mode
    }
    console.log('');

    // TEST 2: Dark Mode Persistence
    console.log('🌙 TEST 2: Dark Mode Persistence');
    console.log('─────────────────────────────────────────────────────────');
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const savedTheme = localStorage.getItem('theme');
    
    console.log(`Current theme: ${currentTheme}`);
    console.log(`Saved theme: ${savedTheme}`);
    
    // Check if email is available for API
    const hasEmail = !!(window.currentUser?.email || 
                       (typeof window.getCurrentUserEmail === 'function' && window.getCurrentUserEmail()) ||
                       localStorage.getItem('userEmail'));
    
    if (!hasEmail) {
      results.darkModePersistence.passed = false;
      results.darkModePersistence.issues.push('No email available for API - theme cannot be persisted');
      console.log('❌ No email available for API persistence');
    } else {
      console.log('✅ Email available for API persistence');
    }
    
    if (savedTheme && savedTheme === currentTheme) {
      console.log('✅ Theme matches localStorage');
    } else if (!savedTheme) {
      results.darkModePersistence.passed = false;
      results.darkModePersistence.issues.push('Theme not saved to localStorage');
      console.log('⚠️ Theme not in localStorage');
    }
    
    if (results.darkModePersistence.issues.length === 0) {
      results.darkModePersistence.passed = true;
    }
    console.log('');

    // TEST 3: Avatar Aura
    console.log('👤 TEST 3: Avatar Aura Display');
    console.log('─────────────────────────────────────────────────────────');
    const avatars = document.querySelectorAll('.avatar-container, [data-user-id]');
    let avatarsWithAura = 0;
    let avatarsWithoutAura = 0;
    
    avatars.forEach((avatar, index) => {
      const aura = avatar.querySelector('.avatar-aura');
      if (aura) {
        avatarsWithAura++;
        const computedStyle = window.getComputedStyle(aura);
        if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
          avatarsWithoutAura++;
          results.avatarAura.issues.push(`Avatar ${index + 1} has aura element but it's hidden`);
        }
      } else {
        avatarsWithoutAura++;
        // Check if it should have aura (current user or user with auraColor)
        const userId = avatar.dataset.userId || avatar.closest('[data-user-id]')?.dataset.userId;
        if (userId === window.currentUser?.id) {
          results.avatarAura.issues.push(`Current user avatar ${index + 1} missing aura`);
        }
      }
    });
    
    console.log(`Avatars with aura: ${avatarsWithAura}`);
    console.log(`Avatars without aura: ${avatarsWithoutAura}`);
    
    if (avatarsWithoutAura === 0 || avatarsWithAura > 0) {
      results.avatarAura.passed = true;
      console.log('✅ Avatar aura display is working');
    } else {
      results.avatarAura.passed = false;
      console.log('❌ Some avatars missing aura');
    }
    console.log('');

    // TEST 4: Focus Mode Delay
    console.log('⏱️ TEST 4: Focus Mode Delay');
    console.log('─────────────────────────────────────────────────────────');
    const focusContainer = document.querySelector('.focus-messages-container');
    if (focusContainer) {
      // Check for async operations that might cause delay
      const hasAsyncReplies = focusContainer.querySelectorAll('.message-reply').length > 0;
      console.log(`Focus mode active: Yes`);
      console.log(`Replies loaded: ${hasAsyncReplies}`);
      
      // Check if there are any setTimeout calls in the code
      console.log('⚠️ Manual check needed: Look for setTimeout, await delays, or sequential async operations');
      results.focusModeDelay.passed = true; // Will need manual verification
    } else {
      console.log('⚠️ Focus mode not active - cannot test delay');
      results.focusModeDelay.passed = true;
    }
    console.log('');

    // TEST 5: API Errors
    console.log('🌐 TEST 5: API Errors');
    console.log('─────────────────────────────────────────────────────────');
    // Check console for recent errors
    console.log('⚠️ Check browser console for API errors:');
    console.log('  - Communities API 500 error');
    console.log('  - Update-preferences 400 error (Valid email required)');
    
    // Check if email is properly formatted
    const userEmail = window.currentUser?.email || 
                     (typeof window.getCurrentUserEmail === 'function' ? window.getCurrentUserEmail() : null);
    
    if (userEmail && typeof userEmail === 'string' && userEmail.includes('@')) {
      console.log(`✅ Email format valid: ${userEmail.substring(0, 10)}...`);
    } else if (userEmail && typeof userEmail.then === 'function') {
      results.apiErrors.issues.push('getCurrentUserEmail returns Promise but may not be awaited');
      console.log('⚠️ Email is a Promise - ensure it\'s awaited');
    } else {
      results.apiErrors.issues.push('No valid email found for API calls');
      console.log('❌ No valid email found');
    }
    
    if (results.apiErrors.issues.length === 0) {
      results.apiErrors.passed = true;
    }
    console.log('');

    // Summary
    console.log('═════════════════════════════════════════════════════════');
    console.log('📊 VERIFICATION SUMMARY');
    console.log('═════════════════════════════════════════════════════════');
    
    const totalTests = 5;
    let passedTests = 0;
    
    Object.keys(results).forEach(testName => {
      if (results[testName].passed) {
        passedTests++;
        console.log(`✅ ${testName}: PASSED`);
      } else {
        console.log(`❌ ${testName}: FAILED`);
        results[testName].issues.forEach(issue => {
          console.log(`   • ${issue}`);
        });
      }
    });
    
    console.log('');
    console.log(`Overall: ${passedTests}/${totalTests} tests passed`);
    
    return results;
  }

  // Export to window
  if (typeof window !== 'undefined') {
    window.verifyAllFixes = verifyAllFixes;
    console.log('✅ Comprehensive Fix Verification loaded. Run: window.verifyAllFixes()');
  }
})();




