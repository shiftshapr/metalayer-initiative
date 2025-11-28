/**
 * COMPREHENSIVE DIAGNOSTIC SCRIPT
 * Covers: Profile avatar aura, message display, duplicates, visibility, settings
 * Run in browser console: window.runComprehensiveDiagnostic()
 */

async function runComprehensiveDiagnostic() {
  const results = [];

  console.log('🔍 COMPREHENSIVE DIAGNOSTIC: Starting...\n');

  // 1. Profile Avatar Aura Check
  console.log('📋 1. Checking Profile Avatar Aura...');
  const profileAvatarCheck = checkProfileAvatarAura();
  results.push(...profileAvatarCheck);

  // 2. Message Display Check
  console.log('📋 2. Checking Message Display...');
  const messageDisplayCheck = checkMessageDisplay();
  results.push(...messageDisplayCheck);

  // 3. Duplicate Messages Check
  console.log('📋 3. Checking for Duplicate Messages...');
  const duplicateCheck = checkDuplicateMessages();
  results.push(...duplicateCheck);

  // 4. Message Elements Check
  console.log('📋 4. Checking Message Elements...');
  const messageElementsCheck = checkMessageElements();
  results.push(...messageElementsCheck);

  // 5. Visibility Settings Check
  console.log('📋 5. Checking Visibility Settings...');
  const visibilityCheck = checkVisibilitySettings();
  results.push(...visibilityCheck);

  // 6. Settings Page Toggles Check
  console.log('📋 6. Checking Settings Page Toggles...');
  const settingsTogglesCheck = await checkSettingsToggles();
  results.push(...settingsTogglesCheck);

  // 7. Message Field Check
  console.log('📋 7. Checking Message Field...');
  const messageFieldCheck = checkMessageField();
  results.push(...messageFieldCheck);

  // 8. Visibility Status Check
  console.log('📋 8. Checking Visibility Status Display...');
  const visibilityStatusCheck = checkVisibilityStatus();
  results.push(...visibilityStatusCheck);

  // 9. Go Invisible Button Check
  console.log('📋 9. Checking Go Invisible Button...');
  const goInvisibleCheck = checkGoInvisibleButton();
  results.push(...goInvisibleCheck);

  // 10. Action Menu Positioning Check
  console.log('📋 10. Checking Action Menu Positioning...');
  const actionMenuCheck = checkActionMenuPositioning();
  results.push(...actionMenuCheck);

  // 11. Theme Persistence Check
  console.log('📋 11. Checking Theme Persistence...');
  const themePersistenceCheck = checkThemePersistence();
  results.push(...themePersistenceCheck);

  // 12. Edit Message Timing Check
  console.log('📋 12. Checking Edit Message Timing...');
  const editTimingCheck = checkEditMessageTiming();
  results.push(...editTimingCheck);

  // Summary
  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'PASS').length,
    failed: results.filter(r => r.status === 'FAIL').length,
    warnings: results.filter(r => r.status === 'WARN').length
  };

  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log(`Total Checks: ${summary.total}`);
  console.log(`✅ Passed: ${summary.passed}`);
  console.log(`❌ Failed: ${summary.failed}`);
  console.log(`⚠️ Warnings: ${summary.warnings}\n`);

  // Print failed issues
  const failedIssues = results.filter(r => r.status === 'FAIL');
  if (failedIssues.length > 0) {
    console.log('❌ FAILED ISSUES:');
    failedIssues.forEach(issue => {
      console.log(`  - ${issue.category}: ${issue.issue}`);
      console.log(`    Details: ${issue.details}`);
      if (issue.recommendation) {
        console.log(`    Recommendation: ${issue.recommendation}`);
      }
    });
  }

  return { summary, results };
}

function checkProfileAvatarAura() {
  const results = [];

  // Check if profile avatar container exists
  const avatarContainer = document.querySelector('#user-avatar-container, .user-avatar-container, [data-user-avatar]');
  if (!avatarContainer) {
    results.push({
      category: 'Profile Avatar',
      issue: 'Avatar container not found',
      status: 'FAIL',
      details: 'No avatar container element found in DOM',
      recommendation: 'Ensure ProfileManager creates avatar container on initialization'
    });
    return results;
  }

  // Check for aura element
  const auraElement = avatarContainer.querySelector('.avatar-aura, .avatar-aura-background, [class*="aura"]');
  if (!auraElement) {
    results.push({
      category: 'Profile Avatar',
      issue: 'Aura element not found',
      status: 'FAIL',
      details: 'Avatar container exists but no aura element found',
      recommendation: 'Check AvatarUtils.createUnifiedAvatar() is generating aura HTML'
    });
  } else {
    // Check aura color
    const computedStyle = window.getComputedStyle(auraElement);
    const bgColor = computedStyle.backgroundColor;
    const isWhite = bgColor.includes('255, 255, 255') || bgColor === 'rgba(255, 255, 255, 0.3)' || bgColor === 'rgb(255, 255, 255)';
    
    if (isWhite) {
      results.push({
        category: 'Profile Avatar',
        issue: 'Aura color is white/transparent',
        status: 'FAIL',
        details: `Aura background color: ${bgColor}. Expected user's aura color.`,
        recommendation: 'Check getCurrentUserAuraColor() returns correct color, and AvatarUtils applies it'
      });
    } else {
      results.push({
        category: 'Profile Avatar',
        issue: 'Aura element found with color',
        status: 'PASS',
        details: `Aura background color: ${bgColor}`
      });
    }
  }

  // Check currentUser auraColor in stateManager
  const stateManager = window.stateManagerInstance;
  if (stateManager && typeof stateManager.getState === 'function') {
    const currentUser = stateManager.getState('currentUser');
    if (currentUser && currentUser.auraColor) {
      results.push({
        category: 'Profile Avatar',
        issue: 'Aura color in stateManager',
        status: 'PASS',
        details: `stateManager.currentUser.auraColor = ${currentUser.auraColor}`
      });
    } else {
      results.push({
        category: 'Profile Avatar',
        issue: 'No aura color in stateManager',
        status: 'WARN',
        details: 'currentUser.auraColor is missing or undefined',
        recommendation: 'Check API fetch for aura color and stateManager update'
      });
    }
  }

  return results;
}

function checkMessageDisplay() {
  const results = [];

  const chatContainer = document.querySelector('#chat-messages, .chat-messages, [data-chat-messages]');
  if (!chatContainer) {
    results.push({
      category: 'Message Display',
      issue: 'Chat container not found',
      status: 'FAIL',
      details: 'No chat messages container found in DOM',
      recommendation: 'Ensure chat container exists in sidepanel.html'
    });
    return results;
  }

  const messages = chatContainer.querySelectorAll('[data-message-id]');
  results.push({
    category: 'Message Display',
    issue: 'Message elements found',
    status: messages.length > 0 ? 'PASS' : 'FAIL',
    details: `Found ${messages.length} message elements in DOM`
  });

  // Check for icons
  let messagesWithIcons = 0;
  messages.forEach(msg => {
    const hasIcons = msg.querySelector('.message-actions, .action-dots-btn, [class*="icon"]');
    if (hasIcons) messagesWithIcons++;
  });

  results.push({
    category: 'Message Display',
    issue: 'Message icons present',
    status: messagesWithIcons === messages.length ? 'PASS' : 'WARN',
    details: `${messagesWithIcons} of ${messages.length} messages have icons`,
    recommendation: messagesWithIcons < messages.length ? 'Ensure renderMessageElement includes action menu' : undefined
  });

  // Check for action menu
  let messagesWithActionMenu = 0;
  messages.forEach(msg => {
    const hasActionMenu = msg.querySelector('.action-dropdown, .action-menu');
    if (hasActionMenu) messagesWithActionMenu++;
  });

  results.push({
    category: 'Message Display',
    issue: 'Action menu present',
    status: messagesWithActionMenu === messages.length ? 'PASS' : 'WARN',
    details: `${messagesWithActionMenu} of ${messages.length} messages have action menu`,
    recommendation: messagesWithActionMenu < messages.length ? 'Check UnifiedMessageRenderer generates action menu HTML' : undefined
  });

  // Check for community name display
  let messagesWithCommunity = 0;
  messages.forEach(msg => {
    const senderName = msg.querySelector('.message-sender-name');
    if (senderName && senderName.textContent && senderName.textContent.includes('•')) {
      messagesWithCommunity++;
    }
  });

  results.push({
    category: 'Message Display',
    issue: 'Community name displayed',
    status: messages.length === 0 ? 'WARN' : (messagesWithCommunity > 0 ? 'PASS' : 'WARN'),
    details: `${messagesWithCommunity} of ${messages.length} messages show community name`,
    recommendation: messagesWithCommunity === 0 && messages.length > 0 ? 'Ensure renderMessageElement passes communityName to UnifiedMessageRenderer' : undefined
  });

  // Check for message info (author, time)
  let messagesWithInfo = 0;
  messages.forEach(msg => {
    const hasSenderName = msg.querySelector('.message-sender-name, .message-author, .author-name');
    const hasTime = msg.querySelector('.message-time, .message-time-new');
    if (hasSenderName && hasTime) {
      messagesWithInfo++;
    }
  });

  results.push({
    category: 'Message Display',
    issue: 'Message info (author, time) present',
    status: messagesWithInfo === messages.length ? 'PASS' : 'WARN',
    details: `${messagesWithInfo} of ${messages.length} messages have author and time info`,
    recommendation: messagesWithInfo < messages.length ? 'Ensure UnifiedMessageRenderer includes sender name and formatted time' : undefined
  });

  return results;
}

function checkDuplicateMessages() {
  const results = [];

  const chatContainer = document.querySelector('#chat-messages, .chat-messages, [data-chat-messages]');
  if (!chatContainer) {
    return results;
  }

  const messageElements = Array.from(chatContainer.querySelectorAll('[data-message-id]'));
  const messageIds = messageElements.map(el => el.getAttribute('data-message-id')).filter(Boolean);
  
  const uniqueIds = new Set(messageIds);
  const duplicates = messageIds.filter((id, index) => messageIds.indexOf(id) !== index);

  if (duplicates.length > 0) {
    results.push({
      category: 'Duplicate Messages',
      issue: 'Duplicate message IDs found',
      status: 'FAIL',
      details: `Found ${duplicates.length} duplicate message IDs: ${[...new Set(duplicates)].join(', ')}`,
      recommendation: 'Check UnifiedMessageDisplay.render() clears container before rendering, and addMessageToChat() checks for existing messages'
    });
  } else {
    results.push({
      category: 'Duplicate Messages',
      issue: 'No duplicate messages',
      status: 'PASS',
      details: `All ${messageIds.length} messages have unique IDs`
    });
  }

  // Check stateManager chat.data for duplicates
  const stateManager = window.stateManagerInstance;
  if (stateManager && typeof stateManager.getState === 'function') {
    const chatData = stateManager.getState('chat.data');
    if (chatData && Array.isArray(chatData)) {
      const stateIds = chatData.map(m => m.id);
      const stateDuplicates = stateIds.filter((id, index) => stateIds.indexOf(id) !== index);
      
      if (stateDuplicates.length > 0) {
        results.push({
          category: 'Duplicate Messages',
          issue: 'Duplicate messages in stateManager',
          status: 'FAIL',
          details: `stateManager.chat.data has ${stateDuplicates.length} duplicate IDs`,
          recommendation: 'Check loadChatHistory() and setCurrentChatData() for duplicate prevention'
        });
      }
    }
  }

  return results;
}

function checkMessageElements() {
  const results = [];

  // Check if messages can be found by ID (for reaction updates)
  const stateManager = window.stateManagerInstance;
  if (stateManager && typeof stateManager.getState === 'function') {
    const chatData = stateManager.getState('chat.data');
    if (chatData && Array.isArray(chatData)) {
      let foundCount = 0;
      let notFoundCount = 0;
      const notFoundIds = [];

      chatData.forEach(msg => {
        const element = document.querySelector(`[data-message-id="${msg.id}"]`);
        if (element) {
          foundCount++;
        } else {
          notFoundCount++;
          notFoundIds.push(msg.id);
        }
      });

      results.push({
        category: 'Message Elements',
        issue: 'Message elements findable by ID',
        status: notFoundCount === 0 ? 'PASS' : 'FAIL',
        details: `${foundCount} found, ${notFoundCount} not found${notFoundIds.length > 0 ? `. Missing IDs: ${notFoundIds.slice(0, 5).join(', ')}${notFoundIds.length > 5 ? '...' : ''}` : ''}`,
        recommendation: notFoundCount > 0 ? 'Ensure renderMessageElement sets data-message-id attribute and messages are appended to DOM' : undefined
      });
    }
  }

  return results;
}

function checkVisibilitySettings() {
  const results = [];

  const visibilityToggle = document.getElementById('visibility-toggle');
  if (!visibilityToggle) {
    results.push({
      category: 'Visibility Settings',
      issue: 'Visibility toggle not found',
      status: 'FAIL',
      details: 'Element #visibility-toggle not found in DOM',
      recommendation: 'Check sidepanel.html has visibility toggle element'
    });
    return results;
  }

  // Check if event listener is attached
  const hasHandler = visibilityToggle.getAttribute('data-handler-attached') === 'true';
  results.push({
    category: 'Visibility Settings',
    issue: 'Visibility toggle event listener',
    status: hasHandler ? 'PASS' : 'FAIL',
    details: hasHandler ? 'Event listener attached' : 'Event listener not attached',
    recommendation: !hasHandler ? 'Call VisibilitySettingsManager.ensureEventListeners() when settings tab opens' : undefined
  });

  // Check status select
  const statusSelect = document.getElementById('status-select');
  if (statusSelect) {
    const hasStatusHandler = statusSelect.getAttribute('data-handler-attached') === 'true';
    results.push({
      category: 'Visibility Settings',
      issue: 'Status select event listener',
      status: hasStatusHandler ? 'PASS' : 'FAIL',
      details: hasStatusHandler ? 'Event listener attached' : 'Event listener not attached',
      recommendation: !hasStatusHandler ? 'Ensure setupEventListeners() attaches status select handler' : undefined
    });
  }

  return results;
}

async function checkSettingsToggles() {
  const results = [];

  // Check visibility toggle
  const visibilityToggle = document.getElementById('visibility-toggle');
  if (visibilityToggle) {
    const hasHandler = visibilityToggle.getAttribute('data-handler-attached') === 'true';
    results.push({
      category: 'Settings Toggles',
      issue: 'Visibility toggle event listener',
      status: hasHandler ? 'PASS' : 'FAIL',
      details: hasHandler ? 'Event listener attached' : 'Event listener not attached',
      recommendation: !hasHandler ? 'Call VisibilitySettingsManager.ensureEventListeners() when settings tab opens' : undefined
    });
    
    // Test if toggle actually works (check if it logs when clicked)
    const testClick = () => {
      const beforeChecked = visibilityToggle.checked;
      visibilityToggle.click();
      const afterChecked = visibilityToggle.checked;
      visibilityToggle.checked = beforeChecked; // Reset
      return beforeChecked !== afterChecked;
    };
    results.push({
      category: 'Settings Toggles',
      issue: 'Visibility toggle functional',
      status: testClick() ? 'PASS' : 'WARN',
      details: 'Toggle state changes when clicked',
      recommendation: !testClick() ? 'Check visibility toggle event listener is properly attached' : undefined
    });
  }

  // Check status select
  const statusSelect = document.getElementById('status-select');
  if (statusSelect) {
    const hasHandler = statusSelect.getAttribute('data-handler-attached') === 'true';
    results.push({
      category: 'Settings Toggles',
      issue: 'Status select event listener',
      status: hasHandler ? 'PASS' : 'FAIL',
      details: hasHandler ? 'Event listener attached' : 'Event listener not attached',
      recommendation: !hasHandler ? 'Ensure setupEventListeners() attaches status select handler' : undefined
    });
  }

  // Check theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const hasHandler = themeToggle.getAttribute('data-handler-attached') === 'true';
    results.push({
      category: 'Settings Toggles',
      issue: 'Theme toggle event listener',
      status: hasHandler ? 'PASS' : 'FAIL',
      details: hasHandler ? 'Event listener attached' : 'Event listener not attached',
      recommendation: !hasHandler ? 'Call VisibilitySettingsManager.ensureEventListeners() when settings tab opens' : undefined
    });
  }

  // Check if visibilitySettingsManager is available (ES6 module import)
  let visibilitySettingsManager = null;
  try {
    const module = await import('../../extension/features/VisibilitySettingsManager.js');
    visibilitySettingsManager = module.visibilitySettingsManagerInstance || null;
  } catch (error) {
    console.warn('⚠️ DIAGNOSTIC: Failed to import VisibilitySettingsManager:', error);
  }
  results.push({
    category: 'Settings Toggles',
    issue: 'VisibilitySettingsManager available',
    status: visibilitySettingsManager ? 'PASS' : 'FAIL',
    details: visibilitySettingsManager ? 'visibilitySettingsManager found via ES6 import' : 'visibilitySettingsManager not found',
    recommendation: !visibilitySettingsManager ? 'Ensure VisibilitySettingsManager is initialized and exported as ES6 module' : undefined
  });

  return results;
}

function checkMessageField() {
  const results = [];

  const chatTextarea = document.getElementById('chat-textarea');
  if (!chatTextarea) {
    results.push({
      category: 'Message Field',
      issue: 'Chat textarea not found',
      status: 'FAIL',
      details: 'Element #chat-textarea not found in DOM',
      recommendation: 'Check sidepanel.html has chat-textarea element'
    });
    return results;
  }

  // Check if readonly (should be readonly to open modal on click)
  const isReadonly = chatTextarea.hasAttribute('readonly');
  results.push({
    category: 'Message Field',
    issue: 'Message field is readonly',
    status: isReadonly ? 'PASS' : 'FAIL',
    details: isReadonly ? 'Textarea is readonly (will open modal on click)' : 'Textarea is not readonly',
    recommendation: !isReadonly ? 'Add readonly attribute to chat-textarea' : undefined
  });

  // Check height (should be single row ~38px)
  const computedStyle = window.getComputedStyle(chatTextarea);
  const height = parseInt(computedStyle.height) || 0;
  const maxHeight = parseInt(computedStyle.maxHeight) || 0;
  const isSingleRow = height <= 45 && maxHeight <= 45;
  results.push({
    category: 'Message Field',
    issue: 'Message field is single row height',
    status: isSingleRow ? 'PASS' : 'FAIL',
    details: `Height: ${height}px, Max-height: ${maxHeight}px`,
    recommendation: !isSingleRow ? 'Set height and max-height to 38px for single row' : undefined
  });

  // Check if click handler is attached (check for openMessageModal)
  const hasOpenModal = typeof window.openMessageModal === 'function';
  results.push({
    category: 'Message Field',
    issue: 'openMessageModal function available',
    status: hasOpenModal ? 'PASS' : 'WARN',
    details: hasOpenModal ? 'openMessageModal function found' : 'openMessageModal function not found',
    recommendation: !hasOpenModal ? 'Ensure UnifiedMessageModal is loaded and exported to window' : undefined
  });

  return results;
}

function checkVisibilityStatus() {
  const results = [];

  const visibilityTab = document.getElementById('visibility-tab');
  if (!visibilityTab) {
    return results;
  }

  const userItems = visibilityTab.querySelectorAll('.item');
  if (userItems.length === 0) {
    results.push({
      category: 'Visibility Status',
      issue: 'No visible users to check',
      status: 'WARN',
      details: 'No users found in visibility tab',
      recommendation: 'Check if users are being detected and rendered'
    });
    return results;
  }

  let hasStatusDisplay = 0;
  let missingStatusDisplay = 0;

  userItems.forEach(item => {
    const statusEl = item.querySelector('.user-status');
    if (statusEl && statusEl.textContent) {
      hasStatusDisplay++;
      const statusText = statusEl.textContent.trim();
      // Check if status shows "Last seen" or "Online"
      if (statusText.includes('Last seen') || statusText.includes('Online')) {
        // Good
      } else {
        missingStatusDisplay++;
      }
    } else {
      missingStatusDisplay++;
    }
  });

  results.push({
    category: 'Visibility Status',
    issue: 'Visibility status display',
    status: missingStatusDisplay === 0 ? 'PASS' : 'FAIL',
    details: `${hasStatusDisplay} users with status, ${missingStatusDisplay} missing status`,
    recommendation: missingStatusDisplay > 0 ? 'Ensure VisibilityManager.renderVisibleUsers() adds .user-status element with Last seen/Online text' : undefined
  });

  return results;
}

function checkGoInvisibleButton() {
  const results = [];

  const goInvisibleBtn = document.getElementById('go-invisible-btn');
  if (!goInvisibleBtn) {
    results.push({
      category: 'Go Invisible Button',
      issue: 'Go Invisible button not found',
      status: 'FAIL',
      details: 'Element #go-invisible-btn not found in DOM',
      recommendation: 'Check VisibilityManager creates go-invisible-btn element'
    });
    return results;
  }

  // Check if button has click handler (check if setVisibilityStatus is available)
  const hasSetVisibilityStatus = typeof window.setVisibilityStatus === 'function';
  results.push({
    category: 'Go Invisible Button',
    issue: 'setVisibilityStatus function available',
    status: hasSetVisibilityStatus ? 'PASS' : 'WARN',
    details: hasSetVisibilityStatus ? 'setVisibilityStatus function found' : 'setVisibilityStatus function not found',
    recommendation: !hasSetVisibilityStatus ? 'Ensure setVisibilityStatus is exported to window' : undefined
  });

  // Check button color in light theme
  const theme = document.body.getAttribute('data-theme') || 'light';
  const computedStyle = window.getComputedStyle(goInvisibleBtn);
  const color = computedStyle.color;
  const isDarkInLight = theme === 'light' && (color.includes('rgb(51, 51, 51)') || color.includes('#333') || color.includes('var(--text-primary)'));
  results.push({
    category: 'Go Invisible Button',
    issue: 'Button color in light theme',
    status: theme === 'dark' ? 'PASS' : (isDarkInLight ? 'PASS' : 'FAIL'),
    details: `Theme: ${theme}, Color: ${color}`,
    recommendation: theme === 'light' && !isDarkInLight ? 'Set button color to var(--text-primary) or dark color in light theme' : undefined
  });

  // Check if button navigates to Discuss tab (check if switchTab is available)
  const hasSwitchTab = typeof window.switchTab === 'function';
  results.push({
    category: 'Go Invisible Button',
    issue: 'switchTab function available for navigation',
    status: hasSwitchTab ? 'PASS' : 'WARN',
    details: hasSwitchTab ? 'switchTab function found' : 'switchTab function not found',
    recommendation: !hasSwitchTab ? 'Ensure switchTab is exported to window for navigation after going invisible' : undefined
  });

  return results;
}

function checkActionMenuPositioning() {
  const results = [];

  const actionMenus = document.querySelectorAll('.action-dropdown');
  if (actionMenus.length === 0) {
    results.push({
      category: 'Action Menu Positioning',
      issue: 'No action menus found',
      status: 'WARN',
      details: 'No .action-dropdown elements found in DOM',
      recommendation: 'Check if messages are rendered with action menus'
    });
    return results;
  }

  let onScreenCount = 0;
  let offScreenCount = 0;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  actionMenus.forEach(menu => {
    const rect = menu.getBoundingClientRect();
    const isOnScreen = rect.left >= 0 && rect.right <= viewportWidth && 
                      rect.top >= 0 && rect.bottom <= viewportHeight;
    if (isOnScreen) {
      onScreenCount++;
    } else {
      offScreenCount++;
    }
  });

  results.push({
    category: 'Action Menu Positioning',
    issue: 'Action menus positioned on screen',
    status: offScreenCount === 0 ? 'PASS' : 'FAIL',
    details: `${onScreenCount} on screen, ${offScreenCount} off screen`,
    recommendation: offScreenCount > 0 ? 'Check addMessageActionListeners() positioning logic ensures dropdowns stay within viewport bounds' : undefined
  });

  // Check if action menus have proper positioning styles
  let hasPositioning = 0;
  let missingPositioning = 0;
  actionMenus.forEach(menu => {
    const computedStyle = window.getComputedStyle(menu);
    const position = computedStyle.position;
    if (position === 'absolute' || position === 'fixed') {
      hasPositioning++;
    } else {
      missingPositioning++;
    }
  });

  results.push({
    category: 'Action Menu Positioning',
    issue: 'Action menus have positioning styles',
    status: missingPositioning === 0 ? 'PASS' : 'FAIL',
    details: `${hasPositioning} with positioning, ${missingPositioning} without`,
    recommendation: missingPositioning > 0 ? 'Ensure action-dropdown has position: absolute or fixed' : undefined
  });

  return results;
}

function checkThemePersistence() {
  const results = [];

  // Check current theme
  const currentTheme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'light';
  results.push({
    category: 'Theme Persistence',
    issue: 'Theme attribute set on DOM',
    status: currentTheme ? 'PASS' : 'FAIL',
    details: `Current theme: ${currentTheme}`,
    recommendation: !currentTheme ? 'Ensure theme is set on document.body or document.documentElement' : undefined
  });

  // Check if UserPreferencesManager respects DOM theme
  const userPreferencesManager = window.userPreferencesManager;
  if (userPreferencesManager && userPreferencesManager.isInitialized) {
    results.push({
      category: 'Theme Persistence',
      issue: 'UserPreferencesManager initialized',
      status: 'PASS',
      details: 'UserPreferencesManager is initialized and should respect DOM theme'
    });
  } else {
    results.push({
      category: 'Theme Persistence',
      issue: 'UserPreferencesManager not initialized',
      status: 'WARN',
      details: 'UserPreferencesManager may not be initialized yet',
      recommendation: 'Wait for UserPreferencesManager to initialize, or check initialization logic'
    });
  }

  return results;
}

function checkEditMessageTiming() {
  const results = [];

  // Check if unified renderer is available for edit logic
  const unifiedRenderer = window.UnifiedMessageRenderer;
  const hasUnifiedRenderer = unifiedRenderer && typeof unifiedRenderer.renderMessage === 'function';
  results.push({
    category: 'Edit Message Timing',
    issue: 'UnifiedMessageRenderer available',
    status: hasUnifiedRenderer ? 'PASS' : 'WARN',
    details: hasUnifiedRenderer ? 'UnifiedMessageRenderer found' : 'UnifiedMessageRenderer not found',
    recommendation: !hasUnifiedRenderer ? 'Ensure UnifiedMessageRenderer exports renderMessage/renderMessageHTML to window' : undefined
  });

  // Check if getMessageActionsMenu respects canEdit
  const hasGetMessageActionsMenu = typeof window.getMessageActionsMenu === 'function';
  results.push({
    category: 'Edit Message Timing',
    issue: 'getMessageActionsMenu function available',
    status: hasGetMessageActionsMenu ? 'PASS' : 'WARN',
    details: hasGetMessageActionsMenu ? 'getMessageActionsMenu function found' : 'getMessageActionsMenu function not found',
    recommendation: !hasGetMessageActionsMenu ? 'Ensure getMessageActionsMenu is exported to window' : undefined
  });

  // Check messages for edit buttons (should only show if message is < 1 hour old and user is owner)
  const chatContainer = document.querySelector('#chat-messages, .chat-messages, [data-chat-messages]');
  if (chatContainer) {
    const messages = chatContainer.querySelectorAll('[data-message-id]');
    let messagesWithEditButton = 0;
    let messagesWithEditButtonOld = 0; // Messages > 1 hour old that shouldn't have edit button
    
    messages.forEach(msg => {
      const editBtn = msg.querySelector('.edit-btn, [class*="edit"]');
      if (editBtn) {
        messagesWithEditButton++;
        // Check message age
        const createdAt = msg.getAttribute('data-created-at') || msg.dataset.createdAt;
        if (createdAt) {
          const messageTime = new Date(createdAt);
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          if (messageTime < oneHourAgo) {
            messagesWithEditButtonOld++;
          }
        }
      }
    });

    results.push({
      category: 'Edit Message Timing',
      issue: 'Edit button timing enforcement',
      status: messagesWithEditButtonOld === 0 ? 'PASS' : 'FAIL',
      details: `${messagesWithEditButton} messages with edit button, ${messagesWithEditButtonOld} messages > 1 hour old with edit button (should be 0)`,
      recommendation: messagesWithEditButtonOld > 0 ? 'Ensure canEdit logic checks message age (< 1 hour) and user ownership' : undefined
    });
  }

  return results;
}

// Export to window (plain JavaScript, no ES6 exports)
if (typeof window !== 'undefined') {
  window.runComprehensiveDiagnostic = runComprehensiveDiagnostic;
  console.log('✅ Comprehensive diagnostic script loaded! Run: window.runComprehensiveDiagnostic()');
}

