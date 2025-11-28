const getMessagingWindow = () => {
    if (typeof window === 'undefined') {
        return undefined;
    }
    return window;
};
export async function sendLegacyMessage(content, options = {}) {
    const messagingWindow = getMessagingWindow();
    if (!messagingWindow || typeof messagingWindow.sendMessageViaSupabase !== 'function') {
        return null;
    }
    const data = await messagingWindow.sendMessageViaSupabase(content, options.parentId ?? null, options.conversationId ?? null);
    return data ? { success: true, data } : { success: false };
}
export async function reloadLegacyChatHistory() {
    const messagingWindow = getMessagingWindow();
    if (!messagingWindow || typeof messagingWindow.loadChatHistory !== 'function') {
        return;
    }
    await messagingWindow.loadChatHistory();
}
