/**
 * Canopi Diagnostic Script
 * Comprehensive diagnostic tool to identify and fix all remaining issues
 * 
 * Usage: Run this in the browser console or inject it into the sidepanel
 */

(function() {
  'use strict';

  const diagnostic = {
    results: {
      critical: [],
      warnings: [],
      info: [],
      fixes: []
    },

    // Check all critical function availability
    checkFunctionAvailability() {
      console.log('🔍 DIAGNOSTIC: Checking function availability...');
      
      const functions = [
        'window.loadChatHistory',
        'window.handleBookmarkToggle',
        'window.addMessageToChat',
        'window.handleMessageFocus',
        'window.sendMessageViaSupabase',
        'window.sendChatMessage',
        'window.addMessageActionListeners',
        'window.loadMessageBookmarks',
        'window.CanopiModule',
        'window.api',
        'window.currentUser',
        'window.setState',
        'window.getState',
        'window.supabaseClient'
      ];

      functions.forEach(funcName => {
        const parts = funcName.split('.');
        let obj = window;
        let exists = true;
        
        for (let i = 1; i < parts.length; i++) {
          obj = obj[parts[i]];
          if (obj === undefined) {
            exists = false;
            break;
          }
        }
        
        if (exists && typeof obj === 'function') {
          this.results.info.push(`✅ ${funcName} is available`);
        } else if (exists) {
          this.results.info.push(`⚠️ ${funcName} exists but is not a function (type: ${typeof obj})`);
        } else {
          this.results.critical.push(`❌ ${funcName} is NOT available`);
        }
      });

      // Check handleBookmarkToggle specifically
      if (typeof window.handleBookmarkToggle !== 'function') {
        this.results.critical.push('❌ window.handleBookmarkToggle is not a function - bookmarks will not work');
        
        // Try to find it in CanopiModule
        if (window.CanopiModule && typeof window.CanopiModule.handleBookmarkToggle === 'function') {
          this.results.fixes.push('🔧 FIX: window.handleBookmarkToggle should be set from CanopiModule.handleBookmarkToggle');
        }
      }

      // Check loadChatHistory
      if (typeof window.loadChatHistory !== 'function') {
        this.results.critical.push('❌ window.loadChatHistory is not a function - chat history will not load');
        
        if (window.CanopiModule && typeof window.CanopiModule.loadChatHistory === 'function') {
          this.results.fixes.push('🔧 FIX: window.loadChatHistory should be set from CanopiModule.loadChatHistory');
        }
      }
    },

    // Check DOM structure
    checkDOMStructure() {
      console.log('🔍 DIAGNOSTIC: Checking DOM structure...');
      
      const selectors = [
        '.chat-messages',
        '.chat-input-area',
        '.focus-messages-container',
        '.focus-back-row',
        '.focus-message-input-container',
        '.message',
        '.message-reply',
        '.message-footer',
        '.message-header-new',
        '[data-theme]'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          this.results.info.push(`✅ Found ${elements.length} element(s) matching "${selector}"`);
        } else {
          this.results.warnings.push(`⚠️ No elements found matching "${selector}"`);
        }
      });

      // Check focus mode structure
      const focusContainer = document.querySelector('.focus-messages-container');
      if (focusContainer) {
        const parentMessage = focusContainer.querySelector('.message:not(.message-reply)');
        const inputContainer = focusContainer.querySelector('.focus-message-input-container');
        const replies = focusContainer.querySelectorAll('.message-reply');
        
        if (parentMessage && inputContainer) {
          const parentRect = parentMessage.getBoundingClientRect();
          const inputRect = inputContainer.getBoundingClientRect();
          
          if (inputRect.top < parentRect.bottom) {
            this.results.critical.push('❌ Reply input is BEFORE parent message - should be AFTER');
          } else {
            this.results.info.push('✅ Reply input is correctly positioned after parent message');
          }
        }
        
        if (parentMessage && replies.length > 0) {
          const parentRect = parentMessage.getBoundingClientRect();
          const firstReplyRect = replies[0].getBoundingClientRect();
          
          if (inputContainer) {
            const inputRect = inputContainer.getBoundingClientRect();
            if (inputRect.top > firstReplyRect.top) {
              this.results.critical.push('❌ Reply input is AFTER replies - should be BETWEEN parent and replies');
            }
          }
        }
      }

      // Check message padding
      const messages = document.querySelectorAll('.message, .message-reply');
      messages.forEach((msg, index) => {
        const computed = window.getComputedStyle(msg);
        const paddingTop = parseInt(computed.paddingTop) || 0;
        
        if (paddingTop !== 8) {
          this.results.warnings.push(`⚠️ Message ${index} has padding-top: ${paddingTop}px (expected 8px)`);
        }
      });
    },

    // Check event listeners
    checkEventListeners() {
      console.log('🔍 DIAGNOSTIC: Checking event listeners...');
      
      const bookmarkButtons = document.querySelectorAll('.bookmark-btn, [data-bookmark-btn]');
      bookmarkButtons.forEach((btn, index) => {
        const messageId = btn.closest('.message')?.dataset?.messageId || 'unknown';
        const hasPointerEvents = window.getComputedStyle(btn).pointerEvents !== 'none';
        const hasCursor = window.getComputedStyle(btn).cursor === 'pointer';
        const isDisabled = btn.disabled;
        const opacity = window.getComputedStyle(btn).opacity;
        
        if (!hasPointerEvents) {
          this.results.critical.push(`❌ Bookmark button ${index} (message ${messageId}) has pointer-events: none`);
        }
        
        if (!hasCursor || isDisabled) {
          this.results.warnings.push(`⚠️ Bookmark button ${index} (message ${messageId}) may not be clickable (cursor: ${window.getComputedStyle(btn).cursor}, disabled: ${isDisabled})`);
        }
        
        if (parseFloat(opacity) < 0.5) {
          this.results.warnings.push(`⚠️ Bookmark button ${index} (message ${messageId}) has low opacity: ${opacity}`);
        }
      });

      // Check other action buttons in focus mode
      if (document.querySelector('.focus-messages-container')) {
        const actionButtons = document.querySelectorAll('.focus-messages-container .inline-reply-btn, .focus-messages-container .reaction-btn, .focus-messages-container .share-btn, .focus-messages-container .repost-btn');
        actionButtons.forEach((btn, index) => {
          const pointerEvents = window.getComputedStyle(btn).pointerEvents;
          if (pointerEvents === 'none') {
            this.results.critical.push(`❌ Action button ${index} in focus mode has pointer-events: none`);
          }
        });
      }
    },

    // Check API endpoints
    async checkAPIEndpoints() {
      console.log('🔍 DIAGNOSTIC: Checking API endpoints...');
      
      if (!window.api || typeof window.api.request !== 'function') {
        this.results.critical.push('❌ window.api.request is not available');
        return;
      }

      if (!window.currentUser || !window.currentUser.id) {
        this.results.critical.push('❌ window.currentUser.id is not available');
        return;
      }

      // Test update-preferences endpoint
      try {
        const testResponse = await window.api.request('/v1/users/update-preferences', {
          method: 'POST',
          body: JSON.stringify({
            userId: window.currentUser.id,
            preferences: {
              theme: 'light',
              test: true
            }
          })
        });
        
        if (testResponse) {
          this.results.info.push('✅ /v1/users/update-preferences endpoint is working');
        } else {
          this.results.warnings.push('⚠️ /v1/users/update-preferences returned null/undefined');
        }
      } catch (error) {
        if (error.message && error.message.includes('400')) {
          this.results.critical.push('❌ /v1/users/update-preferences returns 400 Bad Request - check request body format');
          this.results.fixes.push('🔧 FIX: Ensure request body includes { userId, preferences: { theme } }');
        } else {
          this.results.warnings.push(`⚠️ /v1/users/update-preferences error: ${error.message}`);
        }
      }
    },

    // Check dark mode
    checkDarkMode() {
      console.log('🔍 DIAGNOSTIC: Checking dark mode...');
      
      const body = document.body;
      const html = document.documentElement;
      const bodyTheme = body.getAttribute('data-theme');
      const htmlTheme = html.getAttribute('data-theme');
      
      if (bodyTheme !== htmlTheme) {
        this.results.warnings.push(`⚠️ Theme mismatch: body has "${bodyTheme}", html has "${htmlTheme}"`);
        this.results.fixes.push('🔧 FIX: Ensure both body and documentElement have the same data-theme attribute');
      }

      // Check theme toggle button
      const themeToggle = document.querySelector('#theme-toggle, [data-theme-toggle]');
      if (themeToggle) {
        const hasListener = themeToggle.onclick !== null || 
                          Array.from(themeToggle.classList).some(c => c.includes('theme'));
        
        if (!hasListener) {
          this.results.critical.push('❌ Theme toggle button has no click listener');
        }
        
        const pointerEvents = window.getComputedStyle(themeToggle).pointerEvents;
        if (pointerEvents === 'none') {
          this.results.critical.push('❌ Theme toggle button has pointer-events: none');
        }
      } else {
        this.results.warnings.push('⚠️ Theme toggle button not found');
      }

      // Check CSS variables
      const root = getComputedStyle(document.documentElement);
      const textPrimary = root.getPropertyValue('--text-primary');
      const backgroundPrimary = root.getPropertyValue('--background-primary');
      
      if (!textPrimary || !backgroundPrimary) {
        this.results.warnings.push('⚠️ CSS variables --text-primary or --background-primary not defined');
      }
    },

    // Check loading state
    checkLoadingState() {
      console.log('🔍 DIAGNOSTIC: Checking loading state...');
      
      const chatMessages = document.querySelector('.chat-messages');
      if (!chatMessages) {
        this.results.warnings.push('⚠️ .chat-messages container not found');
        return;
      }

      const loadingIndicator = chatMessages.querySelector('.chat-loading-indicator');
      const messages = chatMessages.querySelectorAll('.message, .message-reply');
      
      if (loadingIndicator && messages.length > 0) {
        this.results.warnings.push('⚠️ Loading indicator is visible while messages are displayed');
      }

      // Check if messages are hidden during loading
      messages.forEach((msg, index) => {
        const display = window.getComputedStyle(msg).display;
        const visibility = window.getComputedStyle(msg).visibility;
        const opacity = parseFloat(window.getComputedStyle(msg).opacity);
        
        if (loadingIndicator && display !== 'none' && visibility !== 'hidden' && opacity > 0) {
          this.results.warnings.push(`⚠️ Message ${index} is visible during loading (should be hidden)`);
        }
      });
    },

    // Check date placement in focus mode
    checkDatePlacement() {
      console.log('🔍 DIAGNOSTIC: Checking date placement...');
      
      const focusMessages = document.querySelectorAll('.focus-messages-container .message');
      focusMessages.forEach((msg, index) => {
        const header = msg.querySelector('.message-header-new');
        const footer = msg.querySelector('.message-footer');
        const dateInHeader = header?.querySelector('.message-time-new');
        const dateInFooter = footer?.querySelector('.focus-date, .message-time-new');
        
        if (dateInHeader && !dateInFooter) {
          this.results.warnings.push(`⚠️ Message ${index} has date in header but not in footer (focus mode should have date in footer)`);
        }
        
        if (dateInFooter) {
          const footerChildren = Array.from(footer.children);
          const dateIndex = footerChildren.indexOf(dateInFooter);
          const iconsStartIndex = footerChildren.findIndex(child => 
            child.classList.contains('inline-reply-btn') || 
            child.classList.contains('reaction-btn')
          );
          
          if (iconsStartIndex !== -1 && dateIndex > iconsStartIndex) {
            this.results.critical.push(`❌ Message ${index}: Date is AFTER icons in footer (should be BEFORE)`);
          }
        }
      });
    },

    // Check reply display
    checkReplyDisplay() {
      console.log('🔍 DIAGNOSTIC: Checking reply display...');
      
      const focusContainer = document.querySelector('.focus-messages-container');
      if (!focusContainer) {
        return;
      }

      const replies = focusContainer.querySelectorAll('.message-reply');
      replies.forEach((reply, index) => {
        const display = window.getComputedStyle(reply).display;
        const visibility = window.getComputedStyle(reply).visibility;
        const opacity = parseFloat(window.getComputedStyle(reply).opacity);
        
        if (display === 'none' || visibility === 'hidden' || opacity === 0) {
          this.results.critical.push(`❌ Reply ${index} is hidden in focus mode (should be visible)`);
        }

        // Check inline styles
        const inlineDisplay = reply.style.display;
        const inlineVisibility = reply.style.visibility;
        
        if (inlineDisplay === 'none' || inlineVisibility === 'hidden') {
          this.results.warnings.push(`⚠️ Reply ${index} has inline styles that hide it`);
        }
      });
    },

    // Generate fix recommendations
    generateFixes() {
      console.log('🔧 DIAGNOSTIC: Generating fix recommendations...');
      
      // Fix 1: Ensure handleBookmarkToggle is available
      if (this.results.critical.some(r => r.includes('handleBookmarkToggle'))) {
        this.results.fixes.push({
          priority: 'CRITICAL',
          issue: 'handleBookmarkToggle not available',
          fix: `
// In CanopiModule.js, ensure handleBookmarkToggle is exported to window:
window.handleBookmarkToggle = handleBookmarkToggle;

// In sidepanel.js or initialization, ensure it's available:
if (window.CanopiModule && !window.handleBookmarkToggle) {
  window.handleBookmarkToggle = window.CanopiModule.handleBookmarkToggle;
}
          `
        });
      }

      // Fix 2: Fix reply input placement
      if (this.results.critical.some(r => r.includes('Reply input is BEFORE') || r.includes('Reply input is AFTER replies'))) {
        this.results.fixes.push({
          priority: 'CRITICAL',
          issue: 'Reply input placement incorrect',
          fix: `
// In handleMessageFocus, ensure input is inserted AFTER parent message but BEFORE replies:
const parentMessage = focusContainer.querySelector('.message:not(.message-reply)');
if (parentMessage && parentMessage.nextSibling) {
  parentMessage.parentNode.insertBefore(messageInputContainer, parentMessage.nextSibling);
} else {
  focusContainer.appendChild(messageInputContainer);
}
          `
        });
      }

      // Fix 3: Fix dark mode toggle
      if (this.results.critical.some(r => r.includes('Theme toggle'))) {
        this.results.fixes.push({
          priority: 'CRITICAL',
          issue: 'Dark mode toggle not working',
          fix: `
// In UIManager.js, ensure setTheme updates both body and documentElement:
document.body.setAttribute('data-theme', theme);
document.documentElement.setAttribute('data-theme', theme);

// Ensure API call includes userId:
await window.api.request('/v1/users/update-preferences', {
  method: 'POST',
  body: JSON.stringify({
    userId: window.currentUser.id, // CRITICAL: Must include userId
    preferences: { theme: theme }
  })
});
          `
        });
      }

      // Fix 4: Hide messages during loading
      if (this.results.warnings.some(r => r.includes('visible during loading'))) {
        this.results.fixes.push({
          priority: 'HIGH',
          issue: 'Messages visible during loading',
          fix: `
// In loadChatHistory, hide all messages before loading:
const existingMessages = chatMessages.querySelectorAll('.message, .message-reply, .focus-messages-container');
existingMessages.forEach(msg => {
  msg.style.display = 'none';
  msg.style.visibility = 'hidden';
});

// Show loading indicator
chatMessages.innerHTML = '<div class="chat-loading-indicator">Loading...</div>';

// After loading, remove indicator and show messages
          `
        });
      }

      // Fix 5: Fix date placement
      if (this.results.critical.some(r => r.includes('Date is AFTER icons'))) {
        this.results.fixes.push({
          priority: 'HIGH',
          issue: 'Date placement in footer incorrect',
          fix: `
// In addMessageToChat, for focus mode, place date first in footer:
const dateInFooter = isDateInFocusMode ? 
  '<span class="message-time-new focus-date" style="...">${formattedTime}</span>' : '';

messageDiv.innerHTML = \`
  ...
  <div class="message-footer">
    ${dateInFooter}
    ${replyButton}
    ${reactionButton}
    ...
  </div>
\`;
          `
        });
      }

      // Fix 6: Fix padding consistency
      if (this.results.warnings.some(r => r.includes('padding-top'))) {
        this.results.fixes.push({
          priority: 'MEDIUM',
          issue: 'Message padding inconsistent',
          fix: `
// In sidepanel.css, add !important rules:
.chat-messages .message,
.chat-messages .message-reply {
  padding-top: 8px !important;
  margin-top: 0 !important;
}
          `
        });
      }
    },

    // Run all diagnostics
    async runAll() {
      console.log('🚀 DIAGNOSTIC: Starting comprehensive diagnostic...');
      console.log('='.repeat(80));
      
      this.checkFunctionAvailability();
      this.checkDOMStructure();
      this.checkEventListeners();
      await this.checkAPIEndpoints();
      this.checkDarkMode();
      this.checkLoadingState();
      this.checkDatePlacement();
      this.checkReplyDisplay();
      this.generateFixes();
      
      console.log('='.repeat(80));
      console.log('📊 DIAGNOSTIC RESULTS:');
      console.log('='.repeat(80));
      
      if (this.results.critical.length > 0) {
        console.log('\n❌ CRITICAL ISSUES:');
        this.results.critical.forEach(issue => console.log(`  ${issue}`));
      }
      
      if (this.results.warnings.length > 0) {
        console.log('\n⚠️ WARNINGS:');
        this.results.warnings.forEach(warning => console.log(`  ${warning}`));
      }
      
      if (this.results.info.length > 0) {
        console.log('\nℹ️ INFO:');
        this.results.info.slice(0, 20).forEach(info => console.log(`  ${info}`));
        if (this.results.info.length > 20) {
          console.log(`  ... and ${this.results.info.length - 20} more`);
        }
      }
      
      if (this.results.fixes.length > 0) {
        console.log('\n🔧 FIX RECOMMENDATIONS:');
        this.results.fixes.forEach((fix, index) => {
          if (typeof fix === 'object') {
            console.log(`\n  ${index + 1}. [${fix.priority}] ${fix.issue}`);
            console.log(`     ${fix.fix.split('\n').join('\n     ')}`);
          } else {
            console.log(`  ${index + 1}. ${fix}`);
          }
        });
      }
      
      console.log('\n' + '='.repeat(80));
      console.log(`📈 SUMMARY: ${this.results.critical.length} critical, ${this.results.warnings.length} warnings, ${this.results.info.length} info`);
      console.log('='.repeat(80));
      
      return this.results;
    }
  };

  // Export to window for console access
  window.CanopiDiagnostic = diagnostic;
  
  // Auto-run if in sidepanel context
  if (document.querySelector('.chat-messages') || document.querySelector('.focus-messages-container')) {
    console.log('🔍 DIAGNOSTIC: Auto-running diagnostic in sidepanel context...');
    setTimeout(() => diagnostic.runAll(), 1000);
  }
  
  console.log('✅ DIAGNOSTIC: Diagnostic script loaded. Run window.CanopiDiagnostic.runAll() to execute.');
})();


