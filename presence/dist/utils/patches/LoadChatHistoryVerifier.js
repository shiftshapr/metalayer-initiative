/**
 * LoadChatHistoryVerifier
 * Ensures CanopiModule exports loadChatHistory before dependent modules run.
 */
const MAX_RETRIES = 20;
const RETRY_DELAY_MS = 150;
const logStatus = (message, ...args) => {
    console.log(`[LoadChatHistoryVerifier] ${message}`, ...args);
};
const dispatchCanopiModuleEvent = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('canopimodule-loaded'));
    }
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const verifyLoadChatHistory = async () => {
    if (typeof window === 'undefined') {
        return;
    }
    const globalWindow = window;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        if (typeof globalWindow.loadChatHistory === 'function') {
            logStatus(`loadChatHistory available (attempt ${attempt})`);
            dispatchCanopiModuleEvent();
            return;
        }
        if (attempt === 1) {
            console.warn('⚠️ LoadChatHistoryVerifier: loadChatHistory not available yet, waiting for CanopiModule init');
        }
        await wait(RETRY_DELAY_MS);
    }
    console.error('❌ LoadChatHistoryVerifier: loadChatHistory not available after %d retries', MAX_RETRIES);
};
verifyLoadChatHistory();
export { verifyLoadChatHistory };
//# sourceMappingURL=LoadChatHistoryVerifier.js.map