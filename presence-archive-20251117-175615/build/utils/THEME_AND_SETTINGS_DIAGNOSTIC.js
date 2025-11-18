/**
 * THEME AND SETTINGS DIAGNOSTIC
 * Comprehensive diagnostic to verify theme toggle and settings functionality
 */

(function() {
  'use strict';

  console.log('🔍 DIAGNOSTIC: Initializing Theme and Settings Diagnostic...');

  // Diagnostic results storage
  const diagnosticResults = {
    profileMenuThemeToggle: { status: 'pending', details: [] },
    settingsTabThemeToggle: { status: 'pending', details: [] },
    visibilityToggle: { status: 'pending', details: [] },
    repliesInFocusMode: { status: 'pending', details: [] },
    headlineLoading: { status: 'pending', details: [] },
    displayNameLoading: { status: 'pending', details: [] }
  };

  /**
   * Test Profile Menu Theme Toggle
   */
  function testProfileMenuThemeToggle() {
    console.log('🔍 DIAGNOSTIC: Testing Profile Menu Theme Toggle...');
    
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIconMenu = document.getElementById('theme-icon-menu');
    const themeTextMenu = document.getElementById('theme-text-menu');
    
    if (!themeToggleBtn) {
      diagnosticResults.profileMenuThemeToggle.status = 'FAILED';
      diagnosticResults.profileMenuThemeToggle.details.push('❌ Theme toggle button not found');
      return;
    }
    
    diagnosticResults.profileMenuThemeToggle.details.push('✅ Theme toggle button found');
    
    if (!themeIconMenu) {
      diagnosticResults.profileMenuThemeToggle.details.push('⚠️ Theme icon menu element not found');
    } else {
      diagnosticResults.profileMenuThemeToggle.details.push('✅ Theme icon menu element found');
    }
    
    if (!themeTextMenu) {
      diagnosticResults.profileMenuThemeToggle.details.push('⚠️ Theme text menu element not found');
    } else {
      diagnosticResults.profileMenuThemeToggle.details.push('✅ Theme text menu element found');
    }
    
    // Check if event listener is attached
    const hasClickHandler = themeToggleBtn.onclick !== null || 
                           themeToggleBtn.getAttribute('data-handler-attached') === 'true';
    
    if (hasClickHandler) {
      diagnosticResults.profileMenuThemeToggle.details.push('✅ Click handler attached');
    } else {
      diagnosticResults.profileMenuThemeToggle.details.push('⚠️ Click handler may not be attached');
    }
    
    // Check current theme state
    const currentTheme = document.body.getAttribute('data-theme') || 
                        document.documentElement.getAttribute('data-theme') || 'light';
    diagnosticResults.profileMenuThemeToggle.details.push(`📊 Current theme: ${currentTheme}`);
    
    // Check if updateThemeEverywhere function exists
    if (typeof window.updateThemeEverywhere === 'function') {
      diagnosticResults.profileMenuThemeToggle.details.push('✅ updateThemeEverywhere function available');
    } else {
      diagnosticResults.profileMenuThemeToggle.details.push('❌ updateThemeEverywhere function NOT available');
    }
    
    diagnosticResults.profileMenuThemeToggle.status = 'PASSED';
  }

  /**
   * Test Settings Tab Theme Toggle
   */
  function testSettingsTabThemeToggle() {
    console.log('🔍 DIAGNOSTIC: Testing Settings Tab Theme Toggle...');
    
    const themeToggle = document.getElementById('theme-toggle');
    const themeStatusText = document.getElementById('theme-status-text');
    const themeToggleSlider = document.getElementById('theme-toggle-slider');
    
    if (!themeToggle) {
      diagnosticResults.settingsTabThemeToggle.status = 'FAILED';
      diagnosticResults.settingsTabThemeToggle.details.push('❌ Theme toggle checkbox not found');
      return;
    }
    
    diagnosticResults.settingsTabThemeToggle.details.push('✅ Theme toggle checkbox found');
    
    if (!themeStatusText) {
      diagnosticResults.settingsTabThemeToggle.details.push('⚠️ Theme status text not found');
    } else {
      diagnosticResults.settingsTabThemeToggle.details.push('✅ Theme status text found');
    }
    
    if (!themeToggleSlider) {
      diagnosticResults.settingsTabThemeToggle.details.push('⚠️ Theme toggle slider not found');
    } else {
      diagnosticResults.settingsTabThemeToggle.details.push('✅ Theme toggle slider found');
    }
    
    // Check if VisibilitySettingsManager is initialized
    if (window.visibilitySettingsManager && window.visibilitySettingsManager.isInitialized) {
      diagnosticResults.settingsTabThemeToggle.details.push('✅ VisibilitySettingsManager initialized');
    } else {
      diagnosticResults.settingsTabThemeToggle.details.push('❌ VisibilitySettingsManager NOT initialized');
    }
    
    // Check current toggle state
    const isChecked = themeToggle.checked;
    diagnosticResults.settingsTabThemeToggle.details.push(`📊 Toggle checked: ${isChecked}`);
    
    // Check if event listener is attached
    const hasChangeHandler = themeToggle.getAttribute('data-handler-attached') === 'true';
    if (hasChangeHandler) {
      diagnosticResults.settingsTabThemeToggle.details.push('✅ Change handler attached');
    } else {
      diagnosticResults.settingsTabThemeToggle.details.push('⚠️ Change handler may not be attached');
    }
    
    diagnosticResults.settingsTabThemeToggle.status = 'PASSED';
  }

  /**
   * Test Visibility Toggle
   */
  function testVisibilityToggle() {
    console.log('🔍 DIAGNOSTIC: Testing Visibility Toggle...');
    
    const visibilityToggle = document.getElementById('visibility-toggle');
    const visibilityModal = document.getElementById('visibility-access-modal');
    const goVisibleBtn = document.getElementById('go-visible-btn');
    const cancelVisibilityBtn = document.getElementById('cancel-visibility-btn');
    
    if (!visibilityToggle) {
      diagnosticResults.visibilityToggle.status = 'FAILED';
      diagnosticResults.visibilityToggle.details.push('❌ Visibility toggle not found');
      return;
    }
    
    diagnosticResults.visibilityToggle.details.push('✅ Visibility toggle found');
    
    if (!visibilityModal) {
      diagnosticResults.visibilityToggle.details.push('❌ Visibility modal not found');
    } else {
      diagnosticResults.visibilityToggle.details.push('✅ Visibility modal found');
      const modalDisplay = visibilityModal.style.display;
      diagnosticResults.visibilityToggle.details.push(`📊 Modal display: ${modalDisplay || 'none'}`);
    }
    
    if (!goVisibleBtn) {
      diagnosticResults.visibilityToggle.details.push('❌ Go Visible button not found');
    } else {
      diagnosticResults.visibilityToggle.details.push('✅ Go Visible button found');
    }
    
    if (!cancelVisibilityBtn) {
      diagnosticResults.visibilityToggle.details.push('❌ Cancel Visibility button not found');
    } else {
      diagnosticResults.visibilityToggle.details.push('✅ Cancel Visibility button found');
    }
    
    // Check if VisibilityModalHandler is initialized
    if (window.visibilityModalHandler && window.visibilityModalHandler.isInitialized) {
      diagnosticResults.visibilityToggle.details.push('✅ VisibilityModalHandler initialized');
    } else {
      diagnosticResults.visibilityToggle.details.push('❌ VisibilityModalHandler NOT initialized');
    }
    
    // Check current visibility state
    const isVisible = visibilityToggle.checked;
    diagnosticResults.visibilityToggle.details.push(`📊 Visibility enabled: ${isVisible}`);
    
    diagnosticResults.visibilityToggle.status = 'PASSED';
  }

  /**
   * Test Replies in Focus Mode
   */
  function testRepliesInFocusMode() {
    console.log('🔍 DIAGNOSTIC: Testing Replies in Focus Mode...');
    
    // Check if ReplyLoader is available
    if (window.ReplyLoader && typeof window.ReplyLoader.loadAllReplies === 'function') {
      diagnosticResults.repliesInFocusMode.details.push('✅ ReplyLoader utility available');
    } else {
      diagnosticResults.repliesInFocusMode.details.push('❌ ReplyLoader utility NOT available');
    }
    
    // Check for focus mode messages
    const focusMessages = document.querySelectorAll('.focus-message, [data-focus-mode="true"]');
    diagnosticResults.repliesInFocusMode.details.push(`📊 Focus mode messages found: ${focusMessages.length}`);
    
    // Check for replies in focus mode
    const focusReplies = document.querySelectorAll('.focus-message .message-reply, .focus-message .thread-reply');
    diagnosticResults.repliesInFocusMode.details.push(`📊 Replies in focus mode: ${focusReplies.length}`);
    
    // Check for hidden replies
    const hiddenReplies = Array.from(focusReplies).filter(reply => {
      return reply.style.display === 'none' || 
             reply.dataset.pendingVisibility === 'true' ||
             reply.offsetWidth === 0 ||
             reply.offsetHeight === 0;
    });
    
    if (hiddenReplies.length > 0) {
      diagnosticResults.repliesInFocusMode.details.push(`⚠️ Found ${hiddenReplies.length} hidden replies`);
      hiddenReplies.forEach((reply, idx) => {
        const msgId = reply.dataset.messageId || 'unknown';
        diagnosticResults.repliesInFocusMode.details.push(`  - Reply ${idx + 1}: ${msgId} (display: ${reply.style.display}, width: ${reply.offsetWidth}, height: ${reply.offsetHeight})`);
      });
    } else {
      diagnosticResults.repliesInFocusMode.details.push('✅ No hidden replies found');
    }
    
    diagnosticResults.repliesInFocusMode.status = 'PASSED';
  }

  /**
   * Test Headline Loading
   */
  async function testHeadlineLoading() {
    console.log('🔍 DIAGNOSTIC: Testing Headline Loading...');
    
    const headlineInput = document.getElementById('settings-headline-input');
    
    if (!headlineInput) {
      diagnosticResults.headlineLoading.status = 'FAILED';
      diagnosticResults.headlineLoading.details.push('❌ Headline input not found');
      return;
    }
    
    diagnosticResults.headlineLoading.details.push('✅ Headline input found');
    
    // Check if SettingsHeadlineManager is initialized
    if (window.settingsHeadlineManager) {
      if (window.settingsHeadlineManager.isInitialized) {
        diagnosticResults.headlineLoading.details.push('✅ SettingsHeadlineManager initialized');
      } else {
        diagnosticResults.headlineLoading.details.push('⚠️ SettingsHeadlineManager exists but not initialized');
      }
      
      // Check current headline value
      const currentHeadline = window.settingsHeadlineManager.currentHeadline || '';
      diagnosticResults.headlineLoading.details.push(`📊 Current headline: "${currentHeadline.substring(0, 50)}${currentHeadline.length > 50 ? '...' : ''}"`);
      
      // Check input value
      const inputValue = headlineInput.value || '';
      diagnosticResults.headlineLoading.details.push(`📊 Input value: "${inputValue.substring(0, 50)}${inputValue.length > 50 ? '...' : ''}"`);
      
      // Check if values match
      if (currentHeadline === inputValue) {
        diagnosticResults.headlineLoading.details.push('✅ Headline and input value match');
      } else {
        diagnosticResults.headlineLoading.details.push('⚠️ Headline and input value do NOT match');
      }
    } else {
      diagnosticResults.headlineLoading.details.push('❌ SettingsHeadlineManager NOT found');
    }
    
    // Check Chrome storage
    try {
      const storageData = await chrome.storage.local.get(['settingsHeadline']);
      if (storageData.settingsHeadline) {
        diagnosticResults.headlineLoading.details.push(`📊 Chrome storage headline: "${storageData.settingsHeadline.substring(0, 50)}${storageData.settingsHeadline.length > 50 ? '...' : ''}"`);
      } else {
        diagnosticResults.headlineLoading.details.push('⚠️ No headline in Chrome storage');
      }
    } catch (error) {
      diagnosticResults.headlineLoading.details.push(`❌ Error reading Chrome storage: ${error.message}`);
    }
    
    diagnosticResults.headlineLoading.status = 'PASSED';
  }

  /**
   * Test Display Name Loading
   */
  async function testDisplayNameLoading() {
    console.log('🔍 DIAGNOSTIC: Testing Display Name Loading...');
    
    const displayNameInput = document.getElementById('display-name-input');
    
    if (!displayNameInput) {
      diagnosticResults.displayNameLoading.status = 'FAILED';
      diagnosticResults.displayNameLoading.details.push('❌ Display name input not found');
      return;
    }
    
    diagnosticResults.displayNameLoading.details.push('✅ Display name input found');
    
    // Check if DisplayNameManager is initialized
    if (window.displayNameManager) {
      if (window.displayNameManager.isInitialized) {
        diagnosticResults.displayNameLoading.details.push('✅ DisplayNameManager initialized');
      } else {
        diagnosticResults.displayNameLoading.details.push('⚠️ DisplayNameManager exists but not initialized');
      }
      
      // Check current display name value
      const currentDisplayName = window.displayNameManager.currentDisplayName || '';
      diagnosticResults.displayNameLoading.details.push(`📊 Current display name: "${currentDisplayName}"`);
      
      // Check input value
      const inputValue = displayNameInput.value || '';
      diagnosticResults.displayNameLoading.details.push(`📊 Input value: "${inputValue}"`);
      
      // Check if values match
      if (currentDisplayName === inputValue) {
        diagnosticResults.displayNameLoading.details.push('✅ Display name and input value match');
      } else {
        diagnosticResults.displayNameLoading.details.push('⚠️ Display name and input value do NOT match');
      }
    } else {
      diagnosticResults.displayNameLoading.details.push('❌ DisplayNameManager NOT found');
    }
    
    // Check Chrome storage
    try {
      const storageData = await chrome.storage.local.get(['displayName']);
      if (storageData.displayName) {
        diagnosticResults.displayNameLoading.details.push(`📊 Chrome storage display name: "${storageData.displayName}"`);
      } else {
        diagnosticResults.displayNameLoading.details.push('⚠️ No display name in Chrome storage');
      }
    } catch (error) {
      diagnosticResults.displayNameLoading.details.push(`❌ Error reading Chrome storage: ${error.message}`);
    }
    
    diagnosticResults.displayNameLoading.status = 'PASSED';
  }

  /**
   * Run all diagnostics
   */
  async function runAllDiagnostics() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔍 THEME AND SETTINGS DIAGNOSTIC - STARTING');
    console.log('═══════════════════════════════════════════════════════════');
    
    testProfileMenuThemeToggle();
    testSettingsTabThemeToggle();
    testVisibilityToggle();
    testRepliesInFocusMode();
    await testHeadlineLoading();
    await testDisplayNameLoading();
    
    // Print results
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 DIAGNOSTIC RESULTS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    Object.keys(diagnosticResults).forEach(key => {
      const result = diagnosticResults[key];
      const statusIcon = result.status === 'PASSED' ? '✅' : result.status === 'FAILED' ? '❌' : '⚠️';
      console.log(`${statusIcon} ${key.toUpperCase().replace(/([A-Z])/g, ' $1').trim()}: ${result.status}`);
      result.details.forEach(detail => {
        console.log(`   ${detail}`);
      });
      console.log('');
    });
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔍 THEME AND SETTINGS DIAGNOSTIC - COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    
    // Return results for programmatic access
    return diagnosticResults;
  }

  // Make diagnostic available globally
  window.runThemeAndSettingsDiagnostic = runAllDiagnostics;
  
  // Auto-run after a short delay to ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runAllDiagnostics, 2000);
    });
  } else {
    setTimeout(runAllDiagnostics, 2000);
  }
  
  console.log('✅ DIAGNOSTIC: Theme and Settings Diagnostic loaded. Call runThemeAndSettingsDiagnostic() to run manually.');
})();








