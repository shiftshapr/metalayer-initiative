/**
 * DIAGNOSTIC: Why Messages Don't Load on google.com
 * 
 * Root Cause Analysis:
 * 1. Wrong URL detected (sidepanel.html instead of google.com)
 * 2. Visibility tab blocking message loading
 * 3. No active communities
 * 4. API not initialized
 * 5. loadChatHistory not being called with correct pageId
 * 
 * NOTE: Plain JavaScript only - no ES6 imports/exports
 * Must run directly in browser console
 */

(function() {
    'use strict';
    
    const results = {
        timestamp: new Date().toISOString(),
        issues: [],
        checks: {},
        recommendations: []
    };
    
    function addIssue(severity, message, details = null) {
        results.issues.push({ severity, message, details, timestamp: Date.now() });
        const icon = severity === 'critical' ? '🔴' : severity === 'high' ? '🟡' : '🟢';
        console.log(`${icon} ${severity.toUpperCase()}: ${message}`);
        if (details) {
            console.log('   Details:', details);
        }
    }
    
    function addCheck(name, status, value = null) {
        results.checks[name] = { status, value, timestamp: Date.now() };
    }
    
    function addRecommendation(message) {
        results.recommendations.push(message);
    }
    
    async function checkActiveTabUrl() {
        console.log('\n🔍 CHECK 1: Active Tab URL');
        console.log('───────────────────────────────────────────────────────────');
        
        try {
            // Get active tab URL
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tabs || tabs.length === 0) {
                addIssue('critical', 'No active tab found');
                return null;
            }
            
            const activeTab = tabs[0];
            const tabUrl = activeTab.url;
            console.log('Active tab URL:', tabUrl);
            addCheck('activeTabUrl', 'found', tabUrl);
            
            if (!tabUrl) {
                addIssue('critical', 'Active tab has no URL');
                return null;
            }
            
            if (tabUrl.includes('sidepanel.html') || tabUrl.includes('chrome-extension://')) {
                addIssue('critical', 'Diagnostic running in sidepanel context, not actual tab', {
                    detectedUrl: tabUrl,
                    expected: 'https://www.google.com/'
                });
                addRecommendation('Run diagnostic from the actual google.com tab, not sidepanel');
                return null;
            }
            
            if (!tabUrl.includes('google.com')) {
                addIssue('high', 'Active tab is not google.com', { url: tabUrl });
                addRecommendation('Navigate to google.com and run diagnostic again');
            } else {
                console.log('✅ Active tab is google.com');
                addCheck('isGoogleCom', 'yes', tabUrl);
            }
            
            return tabUrl;
        } catch (error) {
            addIssue('critical', 'Failed to get active tab URL', error.message);
            return null;
        }
    }
    
    async function checkUrlNormalization(tabUrl) {
        console.log('\n🔍 CHECK 2: URL Normalization');
        console.log('───────────────────────────────────────────────────────────');
        
        if (!tabUrl) {
            addIssue('critical', 'Cannot check URL normalization - no tab URL');
            return null;
        }
        
        try {
            // Check window.normalizeUrl
            const normalizeUrlFn = window.normalizeUrl;
            if (!normalizeUrlFn || typeof normalizeUrlFn !== 'function') {
                addIssue('critical', 'window.normalizeUrl not available', {
                    note: 'This was removed in ES6 migration - should use ES6 module'
                });
                addRecommendation('Ensure normalizeUrl is available via ES6 import or window fallback');
                return null;
            }
            
            const normalized = await normalizeUrlFn(tabUrl);
            console.log('Normalized URL:', normalized);
            addCheck('normalizeUrl', 'working', normalized);
            
            if (!normalized || !normalized.pageId) {
                addIssue('critical', 'URL normalization returned no pageId', normalized);
                return null;
            }
            
            const expectedPageId = 'google_com_';
            if (normalized.pageId !== expectedPageId) {
                addIssue('high', 'PageId mismatch', {
                    expected: expectedPageId,
                    actual: normalized.pageId,
                    normalizedUrl: normalized.normalizedUrl
                });
            } else {
                console.log('✅ PageId correct:', normalized.pageId);
                addCheck('pageId', 'correct', normalized.pageId);
            }
            
            return normalized;
        } catch (error) {
            addIssue('critical', 'URL normalization failed', error.message);
            return null;
        }
    }
    
    async function checkCurrentUrlData() {
        console.log('\n🔍 CHECK 3: Current URL Data in State');
        console.log('───────────────────────────────────────────────────────────');
        
        const currentUrlData = window.currentUrlData;
        console.log('window.currentUrlData:', currentUrlData);
        addCheck('windowCurrentUrlData', currentUrlData ? 'set' : 'not set', currentUrlData);
        
        if (!currentUrlData) {
            addIssue('high', 'window.currentUrlData is not set');
            addRecommendation('Ensure currentUrlData is set when tab changes');
            return null;
        }
        
        if (currentUrlData.pageId !== 'google_com_') {
            addIssue('high', 'currentUrlData has wrong pageId', {
                expected: 'google_com_',
                actual: currentUrlData.pageId,
                rawUrl: currentUrlData.rawUrl
            });
        } else {
            console.log('✅ currentUrlData.pageId correct:', currentUrlData.pageId);
        }
        
        // Check stateManager
        const stateManager = window.stateManagerInstance || window.stateManager;
        if (stateManager) {
            try {
                const stateUrlData = stateManager.getState ? stateManager.getState('currentUrlData') : null;
                console.log('StateManager currentUrlData:', stateUrlData);
                addCheck('stateManagerUrlData', stateUrlData ? 'set' : 'not set', stateUrlData);
                
                if (!stateUrlData || stateUrlData.pageId !== 'google_com_') {
                    addIssue('high', 'StateManager currentUrlData missing or incorrect', stateUrlData);
                }
            } catch (error) {
                addIssue('medium', 'Failed to check StateManager currentUrlData', error.message);
            }
        }
        
        return currentUrlData;
    }
    
    async function checkActiveTab() {
        console.log('\n🔍 CHECK 4: Active Tab (Discuss vs Visibility)');
        console.log('───────────────────────────────────────────────────────────');
        
        const discussTab = document.getElementById('discuss-tab');
        const visibilityTab = document.getElementById('visibility-tab');
        
        const discussActive = discussTab && discussTab.classList.contains('active');
        const visibilityActive = visibilityTab && visibilityTab.classList.contains('active');
        
        console.log('Discuss tab active:', discussActive);
        console.log('Visibility tab active:', visibilityActive);
        addCheck('discussTabActive', discussActive ? 'yes' : 'no');
        addCheck('visibilityTabActive', visibilityActive ? 'yes' : 'no');
        
        if (visibilityActive && !discussActive) {
            addIssue('critical', 'Visibility tab is active - messages will not load', {
                note: 'CanopiModule.js skips loadChatHistory when visibility tab is active',
                codeLocation: 'CanopiModule.js:1313'
            });
            addRecommendation('Switch to Discuss tab to load messages');
            addRecommendation('Check if visibility tab should block message loading');
        } else if (discussActive) {
            console.log('✅ Discuss tab is active - messages should load');
        } else {
            addIssue('high', 'Neither tab appears active', {
                discussTab: !!discussTab,
                visibilityTab: !!visibilityTab
            });
        }
    }
    
    async function checkCommunities() {
        console.log('\n🔍 CHECK 5: Active Communities');
        console.log('───────────────────────────────────────────────────────────');
        
        const stateManager = window.stateManagerInstance || window.stateManager;
        let activeCommunities = [];
        
        if (stateManager && stateManager.getState) {
            try {
                activeCommunities = stateManager.getState('activeCommunities') || [];
            } catch (error) {
                console.warn('Failed to get activeCommunities from stateManager:', error);
            }
        }
        
        // Also check window
        if (!activeCommunities || activeCommunities.length === 0) {
            activeCommunities = window.activeCommunities || [];
        }
        
        console.log('Active communities:', activeCommunities);
        addCheck('activeCommunities', activeCommunities.length > 0 ? 'found' : 'none', activeCommunities);
        
        if (activeCommunities.length === 0) {
            addIssue('critical', 'No active communities - messages cannot load', {
                note: 'loadChatHistory requires activeCommunities parameter'
            });
            addRecommendation('Ensure at least one community is active');
            addRecommendation('Check CommunitiesModule initialization');
        } else {
            console.log('✅ Active communities found:', activeCommunities.length);
        }
    }
    
    async function checkLoadChatHistory() {
        console.log('\n🔍 CHECK 6: loadChatHistory Function');
        console.log('───────────────────────────────────────────────────────────');
        
        const loadChatHistoryFn = window.loadChatHistory;
        console.log('loadChatHistory available:', !!loadChatHistoryFn);
        addCheck('loadChatHistoryAvailable', loadChatHistoryFn ? 'yes' : 'no');
        
        if (!loadChatHistoryFn) {
            addIssue('critical', 'loadChatHistory function not available');
            addRecommendation('Check if MessagesModule.js is loaded');
            return;
        }
        
        // Check if it's being called
        console.log('Checking if loadChatHistory was called...');
        
        // Check currentUrlData to see what pageId it would use
        const currentUrlData = window.currentUrlData;
        if (currentUrlData && currentUrlData.pageId) {
            console.log('Expected pageId for loadChatHistory:', currentUrlData.pageId);
            addCheck('expectedPageId', 'set', currentUrlData.pageId);
            
            if (currentUrlData.pageId !== 'google_com_') {
                addIssue('high', 'loadChatHistory would be called with wrong pageId', {
                    expected: 'google_com_',
                    actual: currentUrlData.pageId
                });
            }
        }
    }
    
    async function checkMessagesInDOM() {
        console.log('\n🔍 CHECK 7: Messages in DOM');
        console.log('───────────────────────────────────────────────────────────');
        
        const discussTab = document.getElementById('discuss-tab');
        if (!discussTab) {
            addIssue('high', 'Discuss tab element not found');
            return;
        }
        
        const messageContainers = discussTab.querySelectorAll('.chat-messages');
        console.log('Message containers found:', messageContainers.length);
        
        let totalMessages = 0;
        messageContainers.forEach((container, index) => {
            const messages = container.querySelectorAll('[data-message-id]');
            const count = messages.length;
            totalMessages += count;
            console.log(`Container ${index + 1}: ${count} messages`);
        });
        
        console.log('Total messages in DOM:', totalMessages);
        addCheck('messagesInDOM', totalMessages > 0 ? 'found' : 'none', totalMessages);
        
        if (totalMessages === 0) {
            addIssue('critical', 'No messages found in DOM', {
                containers: messageContainers.length,
                note: 'Messages should be loaded for google.com pageId'
            });
        } else {
            console.log('✅ Messages found in DOM');
        }
    }
    
    async function checkAPI() {
        console.log('\n🔍 CHECK 8: API Availability');
        console.log('───────────────────────────────────────────────────────────');
        
        const api = window.api;
        console.log('API available:', !!api);
        addCheck('apiAvailable', api ? 'yes' : 'no');
        
        if (!api) {
            addIssue('high', 'API not available', {
                note: 'Messages may still load via Supabase directly'
            });
        } else {
            const getChatHistory = api.getChatHistory;
            console.log('api.getChatHistory available:', !!getChatHistory);
            addCheck('apiGetChatHistory', getChatHistory ? 'yes' : 'no');
            
            if (!getChatHistory) {
                addIssue('medium', 'api.getChatHistory not available');
            }
        }
    }
    
    async function checkSupabaseMessages() {
        console.log('\n🔍 CHECK 9: Supabase Messages Query');
        console.log('───────────────────────────────────────────────────────────');
        
        const supabase = window.supabase;
        if (!supabase) {
            addIssue('high', 'Supabase client not available');
            return;
        }
        
        try {
            const pageId = 'google_com_';
            console.log('Querying messages for pageId:', pageId);
            
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('page_id', pageId)
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (error) {
                addIssue('high', 'Supabase messages query failed', error.message);
                addCheck('supabaseMessagesQuery', 'error', error.message);
            } else {
                const count = data ? data.length : 0;
                console.log('Messages found in database:', count);
                addCheck('supabaseMessagesCount', 'found', count);
                
                if (count === 0) {
                    addIssue('medium', 'No messages found in database for google.com', {
                        pageId: pageId,
                        note: 'This might be expected if no messages have been sent'
                    });
                } else {
                    console.log('✅ Messages exist in database');
                    addIssue('high', 'Messages exist in database but not in DOM', {
                        databaseCount: count,
                        domCount: 0,
                        note: 'loadChatHistory should load these messages'
                    });
                }
            }
        } catch (error) {
            addIssue('high', 'Failed to query Supabase messages', error.message);
        }
    }
    
    async function runDiagnostic() {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🔍 DIAGNOSTIC: Why Messages Don\'t Load on google.com');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('Timestamp:', results.timestamp);
        console.log('');
        
        // Run all checks
        const tabUrl = await checkActiveTabUrl();
        const normalized = await checkUrlNormalization(tabUrl);
        await checkCurrentUrlData();
        await checkActiveTab();
        await checkCommunities();
        await checkLoadChatHistory();
        await checkMessagesInDOM();
        await checkAPI();
        await checkSupabaseMessages();
        
        // Summary
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('📊 DIAGNOSTIC SUMMARY');
        console.log('═══════════════════════════════════════════════════════════');
        
        const critical = results.issues.filter(i => i.severity === 'critical').length;
        const high = results.issues.filter(i => i.severity === 'high').length;
        const medium = results.issues.filter(i => i.severity === 'medium').length;
        
        console.log(`🔴 Critical Issues: ${critical}`);
        console.log(`🟡 High Priority: ${high}`);
        console.log(`🟢 Medium Priority: ${medium}`);
        console.log('');
        
        if (results.recommendations.length > 0) {
            console.log('💡 RECOMMENDATIONS:');
            results.recommendations.forEach((rec, i) => {
                console.log(`   ${i + 1}. ${rec}`);
            });
            console.log('');
        }
        
        // Store results globally
        window.googleMessagesDiagnosticResults = results;
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📋 Full results available in window.googleMessagesDiagnosticResults');
        console.log('═══════════════════════════════════════════════════════════');
        
        return results;
    }
    
    // Auto-run if in browser console
    if (typeof window !== 'undefined') {
        window.diagnoseGoogleMessages = runDiagnostic;
        console.log('✅ Diagnostic loaded. Run: diagnoseGoogleMessages()');
    }
    
    // Export for manual execution
    return { run: runDiagnostic, results };
})();




