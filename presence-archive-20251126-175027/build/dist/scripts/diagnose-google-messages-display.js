/**
 * Diagnostic Script: Messages Not Displaying on google.com
 *
 * Root Cause Analysis:
 * 1. Check if currentUrlData.pageId is set correctly for google.com
 * 2. Verify normalizeUrl generates correct pageId for google.com
 * 3. Check if loadChatHistory is being called with correct parameters
 * 4. Verify message system initialization
 * 5. Check if messages are being blocked by validation logic
 * 6. Verify API calls are being made with correct pageId
 */
export async function diagnoseGoogleMessagesDisplay() {
    const results = {
        timestamp: new Date().toISOString(),
        currentUrl: window.location.href,
        currentUrlData: {
            exists: false,
            pageId: null,
            rawUrl: null,
            normalizedUrl: null
        },
        normalizeUrlFunction: {
            exists: false,
            testResult: null
        },
        loadChatHistory: {
            exists: false,
            lastCallParams: null
        },
        messageSystem: {
            initialized: false,
            messageSystemIntegration: false,
            unifiedMessageDisplay: false
        },
        validationChecks: {
            pageIdBlocked: false,
            reason: null
        },
        apiCalls: {
            lastCall: null,
            messagesEndpoint: null
        },
        messagesContainer: {
            exists: false,
            messageCount: 0,
            renderedMessages: []
        },
        recommendations: []
    };
    console.log('🔍 DIAGNOSTIC: Starting google.com messages display diagnostic...');
    // 1. Check currentUrlData
    if (window.stateManagerInstance) {
        const urlData = window.stateManagerInstance.getState('currentUrlData');
        if (urlData) {
            results.currentUrlData = {
                exists: true,
                pageId: urlData.pageId || null,
                rawUrl: urlData.rawUrl || null,
                normalizedUrl: urlData.normalizedUrl || null
            };
        }
    }
    // Also check window.currentUrlData
    if (window.currentUrlData) {
        if (!results.currentUrlData.exists) {
            results.currentUrlData = {
                exists: true,
                pageId: window.currentUrlData.pageId || null,
                rawUrl: window.currentUrlData.rawUrl || null,
                normalizedUrl: window.currentUrlData.normalizedUrl || null
            };
        }
    }
    // 2. Test normalizeUrl function
    if (typeof window.normalizeUrl === 'function') {
        results.normalizeUrlFunction.exists = true;
        try {
            const testUrl = 'https://www.google.com';
            const normalized = await window.normalizeUrl(testUrl);
            results.normalizeUrlFunction.testResult = normalized;
            // Check if pageId is generated correctly
            if (!normalized.pageId) {
                results.recommendations.push('normalizeUrl does not generate pageId for google.com');
            }
            else if (normalized.pageId.includes('sidepanel') || normalized.pageId.startsWith('chrome://')) {
                results.recommendations.push(`normalizeUrl generates invalid pageId: ${normalized.pageId}`);
            }
        }
        catch (error) {
            results.normalizeUrlFunction.testResult = { error: String(error) };
        }
    }
    else {
        results.recommendations.push('window.normalizeUrl function not available');
    }
    // 3. Check loadChatHistory
    results.loadChatHistory.exists = typeof window.loadChatHistory === 'function';
    // Check if loadChatHistory would be blocked
    if (results.currentUrlData.pageId) {
        const pageId = results.currentUrlData.pageId;
        if (pageId.includes('_sidepanel_html') ||
            pageId.includes('sidepanel') ||
            pageId.startsWith('chrome-extension://') ||
            pageId.startsWith('chrome://')) {
            results.validationChecks.pageIdBlocked = true;
            results.validationChecks.reason = `pageId "${pageId}" matches blocking pattern`;
            results.recommendations.push(`loadChatHistory is blocked: ${results.validationChecks.reason}`);
        }
    }
    else {
        results.recommendations.push('currentUrlData.pageId is missing - loadChatHistory will return early');
    }
    // 4. Check message system
    results.messageSystem.messageSystemIntegration = !!window.messageSystemIntegration;
    results.messageSystem.unifiedMessageDisplay = !!window.unifiedMessageDisplay;
    results.messageSystem.initialized = results.messageSystem.messageSystemIntegration &&
        results.messageSystem.unifiedMessageDisplay;
    if (!results.messageSystem.initialized) {
        results.recommendations.push('Message system not fully initialized');
    }
    // 5. Check messages container
    const messagesContainer = document.querySelector('.chat-messages');
    if (messagesContainer) {
        results.messagesContainer.exists = true;
        const messages = Array.from(messagesContainer.querySelectorAll('.message, [data-message-id]'));
        results.messagesContainer.messageCount = messages.length;
        results.messagesContainer.renderedMessages = messages.slice(0, 5).map((el) => {
            const msgEl = el;
            return {
                id: msgEl.getAttribute('data-message-id') || 'unknown',
                pageId: msgEl.getAttribute('data-page-id') || 'unknown',
                hasContent: !!msgEl.querySelector('.message-content')
            };
        });
    }
    else {
        results.recommendations.push('.chat-messages container not found in DOM');
    }
    // 6. Check messageStore for cached messages
    if (window.messageStore && results.currentUrlData.pageId) {
        try {
            const cacheEntry = window.messageStore.get(results.currentUrlData.pageId, null);
            if (cacheEntry) {
                results.apiCalls.lastCall = {
                    cached: true,
                    messageCount: cacheEntry.items?.length || 0,
                    status: cacheEntry.status
                };
            }
        }
        catch (error) {
            // Ignore
        }
    }
    // Generate recommendations
    if (!results.currentUrlData.exists) {
        results.recommendations.push('CRITICAL: currentUrlData not set - ensure TabController or CommunityLoaders initializes it');
    }
    if (results.currentUrlData.pageId && !results.messagesContainer.messageCount) {
        results.recommendations.push('Messages may be loading but not rendering - check UnifiedMessageDisplay.render()');
    }
    if (results.validationChecks.pageIdBlocked) {
        results.recommendations.push('CRITICAL: pageId validation is blocking loadChatHistory - check MessagesModule.js line 1258');
    }
    console.log('📊 DIAGNOSTIC RESULTS:', results);
    return results;
}
// Export for use in browser console
if (typeof window !== 'undefined') {
    window.diagnoseGoogleMessagesDisplay = diagnoseGoogleMessagesDisplay;
    console.log('✅ Diagnostic script loaded. Run: window.diagnoseGoogleMessagesDisplay()');
}
