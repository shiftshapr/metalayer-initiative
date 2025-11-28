/**
 * COMPREHENSIVE DIAGNOSTIC SCRIPT
 * Covers: Profile avatar aura, message display, duplicates, visibility, settings
 * Run in browser console: window.runComprehensiveDiagnostic()
 */
export async function runComprehensiveDiagnostic() {
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
    const settingsTogglesCheck = checkSettingsToggles();
    results.push(...settingsTogglesCheck);
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
    }
    else {
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
        }
        else {
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
    if (stateManager) {
        const currentUser = stateManager.getState('currentUser');
        if (currentUser?.auraColor) {
            results.push({
                category: 'Profile Avatar',
                issue: 'Aura color in stateManager',
                status: 'PASS',
                details: `stateManager.currentUser.auraColor = ${currentUser.auraColor}`
            });
        }
        else {
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
        if (hasIcons)
            messagesWithIcons++;
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
        if (hasActionMenu)
            messagesWithActionMenu++;
    });
    results.push({
        category: 'Message Display',
        issue: 'Action menu present',
        status: messagesWithActionMenu === messages.length ? 'PASS' : 'WARN',
        details: `${messagesWithActionMenu} of ${messages.length} messages have action menu`,
        recommendation: messagesWithActionMenu < messages.length ? 'Check UnifiedMessageRenderer generates action menu HTML' : undefined
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
    }
    else {
        results.push({
            category: 'Duplicate Messages',
            issue: 'No duplicate messages',
            status: 'PASS',
            details: `All ${messageIds.length} messages have unique IDs`
        });
    }
    // Check stateManager chat.data for duplicates
    const stateManager = window.stateManagerInstance;
    if (stateManager) {
        const chatData = stateManager.getState('chat.data');
        if (chatData) {
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
    if (stateManager) {
        const chatData = stateManager.getState('chat.data');
        if (chatData) {
            let foundCount = 0;
            let notFoundCount = 0;
            const notFoundIds = [];
            chatData.forEach(msg => {
                const element = document.querySelector(`[data-message-id="${msg.id}"]`);
                if (element) {
                    foundCount++;
                }
                else {
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
function checkSettingsToggles() {
    const results = [];
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
    // Check if visibilitySettingsManager is available
    const visibilitySettingsManager = window.visibilitySettingsManager;
    results.push({
        category: 'Settings Toggles',
        issue: 'VisibilitySettingsManager available',
        status: visibilitySettingsManager ? 'PASS' : 'FAIL',
        details: visibilitySettingsManager ? 'visibilitySettingsManager found on window' : 'visibilitySettingsManager not found',
        recommendation: !visibilitySettingsManager ? 'Ensure VisibilitySettingsManager is initialized and exported to window' : undefined
    });
    return results;
}
// Export to window
if (typeof window !== 'undefined') {
    window.runComprehensiveDiagnostic = runComprehensiveDiagnostic;
    console.log('✅ Comprehensive diagnostic script loaded! Run: window.runComprehensiveDiagnostic()');
}
