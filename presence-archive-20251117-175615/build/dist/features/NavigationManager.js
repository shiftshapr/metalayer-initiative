/**
* NavigationManager.ts
*
* Handles navigation between tabs and views, including URL navigation and target highlighting.
* Also includes diagnostic functions for testing and debugging.
*/
import { Logger } from '../utils/Logger.js';
import { stateManagerInstance } from '../core/StateManager.js';
import { supabaseServiceInstance } from '../services/SupabaseService.js';
import { updateUserAuraInUI } from './AuraColorModal.js';
const legacyContext = globalThis;
const getCurrentUser = () => stateManagerInstance.getState('currentUser');
const getCurrentUrlData = () => stateManagerInstance.getState('currentUrlData') || legacyContext.currentUrlData;
const getSupabaseClient = () => {
    try {
        return supabaseServiceInstance.getClient();
    }
    catch {
        return legacyContext.supabase || null;
    }
};
const getRealtimeClient = () => {
    const stateClient = stateManagerInstance.getState('supabaseRealtimeClient');
    return stateClient || legacyContext.supabaseRealtimeClient || null;
};
const getChannelNames = (client) => {
    if (!client?.channels)
        return [];
    const { channels } = client;
    if (channels instanceof Map) {
        return Array.from(channels.keys());
    }
    if (typeof channels === 'object' && channels && 'keys' in channels && typeof channels.keys === 'function') {
        return Array.from(channels.keys());
    }
    if (Array.isArray(channels)) {
        return channels;
    }
    return Object.keys(channels);
};
const getChannelCount = (client) => {
    if (!client?.channels)
        return 0;
    const { channels } = client;
    if (channels instanceof Map) {
        return channels.size;
    }
    if (typeof channels === 'object' && channels && 'size' in channels && typeof channels.size === 'number') {
        return channels.size;
    }
    return getChannelNames(client).length;
};
const getRefreshVisibilityAvatars = () => legacyContext.refreshVisibilityAvatars;
const getConvertSupabaseMessageFn = () => legacyContext.convertSupabaseMessageToAPIFormat;
const getAddMessageToChatFn = () => legacyContext.addMessageToChat;
// SD1 Working Console Diagnostic Functions
export function quickStatus() {
    const supabaseClient = getSupabaseClient();
    const realtimeClient = getRealtimeClient();
    const currentUser = getCurrentUser();
    const currentUrlData = getCurrentUrlData();
    console.log('⚡ QUICK STATUS CHECK:');
    console.log('⚡ Supabase client:', !!supabaseClient);
    console.log('⚡ Supabase realtime client:', !!realtimeClient);
    console.log('⚡ Current user:', !!currentUser);
    console.log('⚡ Current URL data:', !!currentUrlData);
    console.log('⚡ Channels active:', getChannelCount(realtimeClient));
    console.log('⚡ Is connected:', realtimeClient?.isConnected || false);
    console.log('⚡ Current page:', currentUrlData?.pageId || 'NOT SET - CRITICAL ERROR');
    console.log('⚡ Current URL (raw):', currentUrlData?.rawUrl || 'NOT SET');
    console.log('⚡ Current URL (normalized):', currentUrlData?.normalizedUrl || 'NOT SET');
    console.log('⚡ Current user id:', currentUser?.id || 'null');
    console.log('⚡ Current user avatar:', currentUser?.avatarUrl || 'null');
    console.log('⚡ Current user aura:', currentUser?.auraColor || 'null');
    // CRITICAL: Check if currentUrlData is null and warn
    if (!currentUrlData) {
        console.error('❌ CRITICAL ERROR: currentUrlData is null!');
        console.error('❌ This should NEVER happen in a browser extension!');
        console.error('❌ The extension should always know what page it\'s on.');
    }
}
;
export async function testMessage() {
    console.log('📝 Testing message sending...');
    const realtimeClient = getRealtimeClient();
    if (realtimeClient?.sendMessage) {
        try {
            await realtimeClient.sendMessage('TEST MESSAGE ' + Date.now());
            console.log('✅ Message sent successfully');
        }
        catch (error) {
            console.error('❌ Message sending failed:', error);
        }
    }
    else {
        console.log('❌ No real-time client available');
    }
}
;
export function testAura(color = '#ff0000') {
    console.log('🎨 Testing aura color change...');
    const currentUser = getCurrentUser();
    if (!currentUser?.email) {
        console.log('❌ No current user available');
        return;
    }
    updateUserAuraInUI(currentUser.email, color);
    console.log('✅ Aura color change triggered');
}
;
export async function testMessageSystem() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 MESSAGE SYSTEM TEST');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    const supabaseClient = getSupabaseClient();
    const realtimeClient = getRealtimeClient();
    const currentUser = getCurrentUser();
    const currentUrlData = getCurrentUrlData();
    // Test 1: Prerequisites
    console.log('📋 TEST 1: Prerequisites');
    console.log('  ✓ Supabase client:', !!supabaseClient);
    console.log('  ✓ Realtime client:', !!realtimeClient);
    console.log('  ✓ Current user:', !!currentUser);
    console.log('  ✓ Current page:', !!currentUrlData);
    console.log('  ✓ User email:', currentUser?.email || 'MISSING');
    console.log('  ✓ Page ID:', currentUrlData?.pageId || 'MISSING');
    console.log('');
    if (!realtimeClient?.sendMessage || !currentUser || !currentUrlData) {
        console.error('❌ Prerequisites not met. Cannot test message system.');
        return;
    }
    // Test 2: Send message
    console.log('📋 TEST 2: Sending test message');
    const testContent = `TEST MESSAGE ${Date.now()}`;
    console.log('  Content:', testContent);
    try {
        const message = await realtimeClient.sendMessage(testContent);
        console.log('  ✅ Message sent successfully');
        console.log('  ✅ Message ID:', message?.id);
        console.log('  ✅ Is UUID:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(message?.id));
        console.log('');
        // Test 3: Check UI
        console.log('📋 TEST 3: Checking UI');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const messageDiv = document.querySelector(`[data-message-id="${message.id}"]`);
        console.log('  ✓ Message in DOM:', !!messageDiv);
        if (messageDiv) {
            const authorElement = messageDiv.querySelector('[data-avatar-source]');
            const avatarSource = authorElement?.dataset?.avatarSource;
            console.log('  ✓ Avatar source:', avatarSource);
            console.log('  ✓ Has delete button:', !!messageDiv.querySelector('[data-action="delete"]'));
        }
        console.log('');
        // Test 4: Delete message
        if (message?.id) {
            console.log('📋 TEST 4: Deleting test message');
            if (realtimeClient.deleteMessage) {
                await realtimeClient.deleteMessage(message.id);
            }
            console.log('  ✅ Delete command sent');
            await new Promise(resolve => setTimeout(resolve, 1000));
            const stillExists = document.querySelector(`[data-message-id="${message.id}"]`);
            console.log('  ✓ Message removed from UI:', !stillExists);
        }
        console.log('');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
    }
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🏁 MESSAGE SYSTEM TEST COMPLETED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
}
;
export async function testVisibility() {
    console.log('👁️ Testing visibility system...');
    try {
        const refreshFn = getRefreshVisibilityAvatars();
        if (refreshFn) {
            await refreshFn();
            console.log('✅ Visibility refresh completed');
        }
        else {
            console.log('⚠️ Visibility refresh function not available');
        }
    }
    catch (error) {
        console.error('❌ Visibility test failed:', error);
    }
}
;
export function checkSubscriptions() {
    console.log('📡 Checking real-time subscriptions...');
    const realtimeClient = getRealtimeClient();
    if (realtimeClient) {
        const channels = getChannelNames(realtimeClient);
        console.log('📡 Active channels:', channels);
        console.log('📡 Channel count:', getChannelCount(realtimeClient));
        if (channels.length > 0) {
            console.log('✅ Real-time subscriptions are active');
        }
        else {
            console.log('❌ No active real-time subscriptions');
        }
    }
    else {
        console.log('❌ No real-time client available');
    }
}
;
export async function testDatabase() {
    console.log('🗄️ Testing database connection...');
    const supabaseClient = getSupabaseClient();
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('user_presence')
                .select('count')
                .limit(1);
            if (error) {
                console.error('❌ Database error:', error);
            }
            else {
                console.log('✅ Database connection successful');
            }
        }
        catch (error) {
            console.error('❌ Database test failed:', error);
        }
    }
    else {
        console.log('❌ No Supabase client available');
    }
}
;
export function testEventHandlers() {
    console.log('🔧 Testing event handlers...');
    const realtimeClient = getRealtimeClient();
    if (realtimeClient) {
        const handlers = {
            onUserJoined: typeof realtimeClient.onUserJoined,
            onUserLeft: typeof realtimeClient.onUserLeft,
            onUserUpdated: typeof realtimeClient.onUserUpdated,
            onNewMessage: typeof realtimeClient.onNewMessage,
            onMessageDeleted: typeof realtimeClient.onMessageDeleted,
            onVisibilityChanged: typeof realtimeClient.onVisibilityChanged
        };
        console.log('📊 Event handlers status:', handlers);
        const allHandlers = Object.values(handlers).every(h => h === 'function');
        if (allHandlers) {
            console.log('✅ All event handlers are properly set up');
        }
        else {
            console.log('❌ Some event handlers are missing');
        }
    }
    else {
        console.log('❌ No real-time client available');
    }
}
;
export async function testMessagePropagation() {
    console.log('💬 Testing message propagation UI...');
    try {
        const currentUser = getCurrentUser();
        const convertFn = getConvertSupabaseMessageFn();
        const addMessageFn = getAddMessageToChatFn();
        if (!convertFn || !addMessageFn) {
            console.warn('⚠️ Message propagation helpers not available');
            return;
        }
        // Test the conversion function
        const testSupabaseMessage = {
            id: 'test-uuid-123',
            user_email: currentUser?.email || 'user@example.com',
            content: 'Test message for propagation',
            created_at: new Date().toISOString(),
            page_id: 'test-page'
        };
        console.log('💬 Test Supabase message:', testSupabaseMessage);
        const converted = convertFn(testSupabaseMessage);
        console.log('💬 Converted message:', converted);
        // Test addMessageToChat with converted message
        console.log('💬 Testing addMessageToChat with converted message...');
        await addMessageFn(converted);
        console.log('✅ Message propagation test completed');
    }
    catch (error) {
        console.error('❌ Message propagation test failed:', error);
    }
}
;
export async function testVisibilityUI() {
    console.log('👁️ Testing visibility UI updates...');
    try {
        // Check current DOM state
        const beforeAvatars = document.querySelectorAll('.avatar-container, .user-avatar, .presence-avatar');
        console.log('👁️ Avatars before refresh:', beforeAvatars.length);
        // Force visibility refresh
        const refreshFn = getRefreshVisibilityAvatars();
        if (refreshFn) {
            await refreshFn();
        }
        else {
            console.log('⚠️ Visibility refresh function not available');
        }
        // Check DOM state after refresh
        setTimeout(() => {
            const afterAvatars = document.querySelectorAll('.avatar-container, .user-avatar, .presence-avatar');
            console.log('👁️ Avatars after refresh:', afterAvatars.length);
            console.log('👁️ DOM update successful:', afterAvatars.length > 0);
        }, 200);
        console.log('✅ Visibility UI test completed');
    }
    catch (error) {
        console.error('❌ Visibility UI test failed:', error);
    }
}
;
export async function runFullTest() {
    console.log('🚀 SD1: Running Full Diagnostic Test');
    quickStatus();
    await testDatabase();
    checkSubscriptions();
    testEventHandlers();
    await testMessage();
    testAura('#00ff00');
    await testVisibility();
    await testMessagePropagation();
    await testVisibilityUI();
    console.log('🏁 SD1: Full diagnostic completed');
}
;
// Test functions removed after successful testing
// Abstracted Navigation System
class NavigationManager {
    constructor() {
        this.logger = new Logger();
        this.initialize();
    }
    async initialize() {
        console.log('🧭 NAVIGATION: Navigation manager initialized');
    }
    async navigateToUrl(url, target) {
        try {
            console.log('🧭 NAVIGATION: Navigating to URL:', url, 'with target:', target);
            // Get current active tab
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const activeTab = tabs[0];
            if (activeTab && activeTab.url === url) {
                // Already on the target page, just focus and highlight
                if (target) {
                    await this.focusAndHighlight(target);
                }
            }
            else if (activeTab && activeTab.id) {
                // Navigate to the URL
                await chrome.tabs.update(activeTab.id, { url: url });
                // Wait for page to load, then highlight
                setTimeout(() => {
                    if (target) {
                        this.focusAndHighlight(target);
                    }
                }, 2000);
            }
        }
        catch (error) {
            console.error('🧭 NAVIGATION: Error navigating:', error);
        }
    }
    async focusAndHighlight(target) {
        try {
            if (!target)
                return;
            console.log('🧭 NAVIGATION: Focusing and highlighting target:', target);
            // Send message to content script to highlight the target
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const activeTab = tabs[0];
            if (activeTab && activeTab.id) {
                await chrome.tabs.sendMessage(activeTab.id, {
                    type: 'HIGHLIGHT_TARGET',
                    target: target
                });
            }
        }
        catch (error) {
            console.error('🧭 NAVIGATION: Error focusing target:', error);
        }
    }
}
// Create singleton instance
const navigationManagerInstance = new NavigationManager();
// Export as ES6 module (pure - no window exports needed for re-launch)
export { NavigationManager, navigationManagerInstance };
export default NavigationManager;
//# sourceMappingURL=NavigationManager.js.map