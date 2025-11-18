/**
 * COMPREHENSIVE LOADING AND REPLY DIAGNOSTIC
 * 
 * Diagnoses:
 * 1. Loading flow issues (theme flashing, overlay timing, blank screen)
 * 2. Reply loading issues (pageId normalization, AppUser table name)
 * 3. AppUser 400 errors (table name case sensitivity)
 * 4. Theme initialization timing
 */

(function() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 COMPREHENSIVE LOADING AND REPLY DIAGNOSTIC');
  console.log('═══════════════════════════════════════════════════════════');

  const diagnostic = {
    startTime: performance.now(),
    issues: [],
    recommendations: [],
    data: {}
  };

  // ============================================
  // 1. APPUSER TABLE NAME DIAGNOSTIC
  // ============================================
  async function checkAppUserTableName() {
    console.log('\n📊 [1] Checking AppUser table name case sensitivity...');
    
    if (!window.supabase) {
      diagnostic.issues.push({
        severity: 'error',
        category: 'AppUser',
        issue: 'Supabase client not available',
        fix: 'Ensure window.supabase is initialized'
      });
      return;
    }

    const testUserId = window.currentUser?.id || '550e8400-e29b-41d4-a716-446655440001';
    const tableNames = ['AppUser', 'appuser', 'app_user', 'App_User'];
    
    diagnostic.data.appUserTableTests = [];
    
    for (const tableName of tableNames) {
      try {
        const { data, error } = await window.supabase
          .from(tableName)
          .select('id, name, handle, avatar_url, aura_color')
          .eq('id', testUserId)
          .maybeSingle();
        
        const result = {
          tableName,
          success: !error && data !== null,
          error: error ? {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          } : null,
          data: data ? 'Found' : 'Not found'
        };
        
        diagnostic.data.appUserTableTests.push(result);
        
        if (!error && data) {
          console.log(`✅ AppUser table name is: "${tableName}"`);
          diagnostic.data.correctAppUserTableName = tableName;
          return tableName;
        } else if (error) {
          console.log(`❌ "${tableName}": ${error.message} (${error.code})`);
        } else {
          console.log(`⚠️ "${tableName}": No error but no data`);
        }
      } catch (err) {
        console.log(`❌ "${tableName}": Exception - ${err.message}`);
        diagnostic.data.appUserTableTests.push({
          tableName,
          success: false,
          error: { message: err.message },
          data: 'Exception'
        });
      }
    }
    
    diagnostic.issues.push({
      severity: 'error',
      category: 'AppUser',
      issue: 'Could not determine correct AppUser table name',
      fix: 'Check Supabase schema - table might be case-sensitive',
      tests: diagnostic.data.appUserTableTests
    });
    
    return null;
  }

  // ============================================
  // 2. PAGEID NORMALIZATION DIAGNOSTIC
  // ============================================
  async function checkPageIdNormalization() {
    console.log('\n📊 [2] Checking pageId normalization for replies...');
    
    if (!window.supabase) {
      diagnostic.issues.push({
        severity: 'error',
        category: 'pageId',
        issue: 'Supabase client not available',
        fix: 'Ensure window.supabase is initialized'
      });
      return;
    }

    // Get current page info
    const currentUri = window.location?.href || '';
    let normalizedUrlData = null;
    let currentPageId = null;
    
    if (window.normalizeUrl) {
      try {
        normalizedUrlData = await window.normalizeUrl(currentUri);
        currentPageId = normalizedUrlData?.pageId;
      } catch (err) {
        console.warn('⚠️ Error normalizing URL:', err);
      }
    }
    
    if (!currentPageId) {
      // Try to get from active tab
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.url) {
          normalizedUrlData = await window.normalizeUrl(tabs[0].url);
          currentPageId = normalizedUrlData?.pageId;
        }
      } catch (err) {
        console.warn('⚠️ Error getting tab URL:', err);
      }
    }
    
    console.log('🔍 Current pageId:', currentPageId);
    diagnostic.data.currentPageId = currentPageId;
    
    if (!currentPageId) {
      diagnostic.issues.push({
        severity: 'warning',
        category: 'pageId',
        issue: 'Could not determine current pageId',
        fix: 'Check window.normalizeUrl and active tab'
      });
      return;
    }

    // Check what pageIds actually exist in the database for replies
    const communityId = window.activeCommunities?.[0];
    if (!communityId) {
      diagnostic.issues.push({
        severity: 'warning',
        category: 'pageId',
        issue: 'No active community ID',
        fix: 'Ensure window.activeCommunities is set'
      });
      return;
    }

    console.log('🔍 Checking replies in database with different pageId formats...');
    
    // Test different pageId variations
    const pageIdVariations = [
      currentPageId, // Original
      currentPageId.replace(/_+$/, ''), // Without trailing underscores
      currentPageId + '_', // With trailing underscore
      currentPageId.replace(/^([^_]+)_/, '$1_'), // Normalized format
    ].filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates
    
    diagnostic.data.pageIdTests = [];
    
    for (const testPageId of pageIdVariations) {
      try {
        // Check for any messages with this pageId
        const { data: messages, error } = await window.supabase
          .from('messages')
          .select('id, page_id, parent_id, community_id')
          .eq('page_id', testPageId)
          .eq('community_id', communityId)
          .is('deleted_at', null)
          .limit(10);
        
        const replyCount = messages?.filter(m => m.parent_id !== null).length || 0;
        const mainMessageCount = messages?.filter(m => m.parent_id === null).length || 0;
        
        const result = {
          pageId: testPageId,
          matches: messages?.length || 0,
          replies: replyCount,
          mainMessages: mainMessageCount,
          error: error ? error.message : null
        };
        
        diagnostic.data.pageIdTests.push(result);
        
        if (messages && messages.length > 0) {
          console.log(`✅ pageId "${testPageId}": ${messages.length} messages (${replyCount} replies, ${mainMessageCount} main)`);
          
          if (replyCount > 0) {
            console.log(`   📝 Found ${replyCount} replies with this pageId format!`);
            diagnostic.data.correctPageIdFormat = testPageId;
          }
        } else if (error) {
          console.log(`❌ pageId "${testPageId}": Error - ${error.message}`);
        } else {
          console.log(`⚠️ pageId "${testPageId}": No messages found`);
        }
      } catch (err) {
        console.log(`❌ pageId "${testPageId}": Exception - ${err.message}`);
        diagnostic.data.pageIdTests.push({
          pageId: testPageId,
          matches: 0,
          error: err.message
        });
      }
    }
    
    // Check if normalization is causing issues
    const normalizedPageId = currentPageId.replace(/_+$/, '').trim();
    const hasTrailingUnderscore = currentPageId.endsWith('_');
    
    if (hasTrailingUnderscore && normalizedPageId !== currentPageId) {
      diagnostic.issues.push({
        severity: 'error',
        category: 'pageId',
        issue: `pageId normalization removes trailing underscore: "${currentPageId}" -> "${normalizedPageId}"`,
        fix: 'ReplyLoader normalizes pageId but database might have trailing underscore. Check if replies exist with original pageId format.',
        currentPageId,
        normalizedPageId,
        tests: diagnostic.data.pageIdTests
      });
    }
  }

  // ============================================
  // 3. LOADING FLOW DIAGNOSTIC
  // ============================================
  function checkLoadingFlow() {
    console.log('\n📊 [3] Checking loading flow timing...');
    
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) {
      diagnostic.issues.push({
        severity: 'warning',
        category: 'loading',
        issue: 'Chat messages container not found',
        fix: 'DOM might not be ready yet'
      });
      return;
    }

    // Check overlay state
    const overlay = chatMessages.querySelector('.chat-loading-overlay, .chat-loading-indicator');
    const isLoading = chatMessages.classList.contains('is-loading');
    const visibility = window.getComputedStyle(chatMessages).visibility;
    const opacity = window.getComputedStyle(chatMessages).opacity;
    
    diagnostic.data.loadingState = {
      hasOverlay: !!overlay,
      isLoading,
      visibility,
      opacity,
      messagesCount: chatMessages.querySelectorAll('.message').length
    };
    
    console.log('🔍 Loading state:', diagnostic.data.loadingState);
    
    if (overlay && !isLoading) {
      diagnostic.issues.push({
        severity: 'warning',
        category: 'loading',
        issue: 'Overlay exists but container not marked as loading',
        fix: 'Overlay cleanup might be incomplete'
      });
    }
    
    if (isLoading && !overlay) {
      diagnostic.issues.push({
        severity: 'warning',
        category: 'loading',
        issue: 'Container marked as loading but no overlay found',
        fix: 'Overlay might have been removed prematurely'
      });
    }
    
    if (visibility === 'hidden' || opacity === '0') {
      diagnostic.issues.push({
        severity: 'error',
        category: 'loading',
        issue: `Chat container is hidden (visibility: ${visibility}, opacity: ${opacity})`,
        fix: 'Force visibility restoration in loadChatHistory finally block'
      });
    }
  }

  // ============================================
  // 4. THEME FLASHING DIAGNOSTIC
  // ============================================
  function checkThemeFlashing() {
    console.log('\n📊 [4] Checking theme initialization...');
    
    const body = document.body;
    const html = document.documentElement;
    const bodyTheme = body.getAttribute('data-theme') || body.className.match(/theme-(\w+)/)?.[1];
    const htmlTheme = html.getAttribute('data-theme') || html.className.match(/theme-(\w+)/)?.[1];
    
    const storedTheme = localStorage.getItem('theme') || localStorage.getItem('userTheme');
    const userPrefsTheme = window.UserPreferencesManager?.getTheme?.() || null;
    
    diagnostic.data.themeState = {
      bodyTheme,
      htmlTheme,
      storedTheme,
      userPrefsTheme,
      mismatch: bodyTheme !== htmlTheme || bodyTheme !== storedTheme
    };
    
    console.log('🔍 Theme state:', diagnostic.data.themeState);
    
    if (diagnostic.data.themeState.mismatch) {
      diagnostic.issues.push({
        severity: 'warning',
        category: 'theme',
        issue: 'Theme mismatch between body, html, and storage',
        fix: 'Ensure theme is set synchronously before DOM render',
        details: diagnostic.data.themeState
      });
    }
    
    // Check if theme is set early enough
    if (!storedTheme && !userPrefsTheme) {
      diagnostic.issues.push({
        severity: 'warning',
        category: 'theme',
        issue: 'No theme found in storage or preferences',
        fix: 'Set default theme before page load to prevent flash'
      });
    }
  }

  // ============================================
  // 5. REPLY LOADING DIAGNOSTIC
  // ============================================
  async function checkReplyLoading() {
    console.log('\n📊 [5] Checking reply loading for focused message...');
    
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    
    const isFocusMode = chatMessages.classList.contains('focus-mode-active');
    if (!isFocusMode) {
      console.log('ℹ️ Not in focus mode, skipping reply check');
      return;
    }
    
    // Find the focused message
    const focusedMessage = chatMessages.querySelector('.message[data-message-id]');
    if (!focusedMessage) {
      console.log('ℹ️ No focused message found');
      return;
    }
    
    const messageId = focusedMessage.getAttribute('data-message-id');
    const hasRepliesAttr = focusedMessage.getAttribute('data-has-replies');
    const replyCountAttr = focusedMessage.getAttribute('data-reply-count');
    
    console.log('🔍 Focused message:', {
      messageId,
      hasReplies: hasRepliesAttr,
      replyCount: replyCountAttr
    });
    
    diagnostic.data.focusedMessage = {
      messageId,
      hasReplies: hasRepliesAttr === 'true',
      replyCount: parseInt(replyCountAttr) || 0
    };
    
    // Check if replies exist in DOM
    const repliesInDOM = chatMessages.querySelectorAll('.message-reply, [data-parent-id]');
    console.log(`🔍 Replies in DOM: ${repliesInDOM.length}`);
    
    diagnostic.data.repliesInDOM = repliesInDOM.length;
    
    if (diagnostic.data.focusedMessage.hasReplies && repliesInDOM.length === 0) {
      diagnostic.issues.push({
        severity: 'error',
        category: 'replies',
        issue: `Message has replies (count: ${diagnostic.data.focusedMessage.replyCount}) but none in DOM`,
        fix: 'Check ReplyLoader.loadAllReplies - might be pageId normalization issue',
        messageId,
        hasReplies: diagnostic.data.focusedMessage.hasReplies,
        replyCount: diagnostic.data.focusedMessage.replyCount
      });
    }
    
    // Check currentChatData
    if (window.currentChatData) {
      const messageInData = window.currentChatData.find(m => m.id === messageId);
      if (messageInData) {
        console.log('🔍 Message in currentChatData:', {
          id: messageInData.id,
          hasReplies: messageInData.hasReplies,
          replyCount: messageInData.replyCount
        });
        diagnostic.data.messageInChatData = {
          hasReplies: messageInData.hasReplies,
          replyCount: messageInData.replyCount
        };
      }
    }
  }

  // ============================================
  // MAIN DIAGNOSTIC RUNNER
  // ============================================
  async function runDiagnostic() {
    console.log('🚀 Starting comprehensive diagnostic...\n');
    
    // Run all diagnostics
    await checkAppUserTableName();
    await checkPageIdNormalization();
    checkLoadingFlow();
    checkThemeFlashing();
    await checkReplyLoading();
    
    // Generate report
    const elapsed = (performance.now() - diagnostic.startTime).toFixed(2);
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 DIAGNOSTIC REPORT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`⏱️  Elapsed: ${elapsed}ms\n`);
    
    // Issues summary
    const errors = diagnostic.issues.filter(i => i.severity === 'error');
    const warnings = diagnostic.issues.filter(i => i.severity === 'warning');
    
    console.log(`❌ Errors: ${errors.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}\n`);
    
    if (errors.length > 0) {
      console.log('❌ ERRORS:');
      errors.forEach((issue, i) => {
        console.log(`\n${i + 1}. [${issue.category}] ${issue.issue}`);
        console.log(`   Fix: ${issue.fix}`);
        if (issue.details) console.log(`   Details:`, issue.details);
      });
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      warnings.forEach((issue, i) => {
        console.log(`\n${i + 1}. [${issue.category}] ${issue.issue}`);
        console.log(`   Fix: ${issue.fix}`);
      });
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (diagnostic.data.correctAppUserTableName) {
      console.log(`1. Use "${diagnostic.data.correctAppUserTableName}" as AppUser table name in APIModule.js`);
    } else if (errors.some(e => e.category === 'AppUser')) {
      console.log('1. Fix AppUser table name - check Supabase schema for correct case');
    }
    
    if (diagnostic.data.correctPageIdFormat) {
      console.log(`2. Use pageId format "${diagnostic.data.correctPageIdFormat}" for reply queries (do not normalize)`);
    } else if (errors.some(e => e.category === 'pageId')) {
      console.log('2. Check pageId normalization - replies might be stored with trailing underscore');
    }
    
    if (errors.some(e => e.category === 'loading')) {
      console.log('3. Ensure visibility is forced in loadChatHistory finally block');
    }
    
    if (warnings.some(w => w.category === 'theme')) {
      console.log('4. Set theme synchronously before DOM render to prevent flash');
    }
    
    if (errors.some(e => e.category === 'replies')) {
      console.log('5. Check ReplyLoader - pageId normalization might be removing trailing underscore needed for queries');
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ Diagnostic complete');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Store globally for access
    window.comprehensiveDiagnostic = diagnostic;
    
    return diagnostic;
  }

  // Auto-run after a delay to ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runDiagnostic, 2000);
    });
  } else {
    setTimeout(runDiagnostic, 2000);
  }

  // Expose for manual running
  window.runComprehensiveDiagnostic = runDiagnostic;
})();

