/**
 * LoadChatHistoryVerifier
 *
 * Ensures loadChatHistory is available and backend is healthy before dependent modules run.
 * Replaces polling retry loop with event-driven health checks.
 */
import { getBackendHealthService } from '../../services/BackendHealthService.js';
import { Logger } from '../Logger.js';
const MAX_WAIT_MS = 10000; // 10 seconds max wait
const INITIAL_CHECK_DELAY_MS = 150;
const logStatus = (message, ...args) => {
    Logger.debug(`[LoadChatHistoryVerifier] ${message}`, args.length > 0 ? args[0] : null, 'load-chat-history');
};
const dispatchCanopiModuleEvent = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('canopimodule-loaded'));
    }
};
const dispatchBackendReadyEvent = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('backend-ready'));
    }
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * Verify loadChatHistory is available and backend is healthy
 */
export async function verifyLoadChatHistory() {
    if (typeof window === 'undefined') {
        return;
    }
    const globalWindow = window;
    const startTime = Date.now();
    // Step 1: Wait for loadChatHistory function to be available
    for (let attempt = 1; attempt <= 20; attempt++) {
        if (typeof globalWindow.loadChatHistory === 'function') {
            logStatus(`loadChatHistory available (attempt ${attempt})`);
            break;
        }
        if (attempt === 1) {
            Logger.warn('⚠️ LoadChatHistoryVerifier: loadChatHistory not available yet, waiting for CanopiModule init', null, 'load-chat-history');
        }
        await wait(INITIAL_CHECK_DELAY_MS);
        // Timeout check
        if (Date.now() - startTime >= MAX_WAIT_MS) {
            Logger.error(`❌ LoadChatHistoryVerifier: loadChatHistory not available after ${MAX_WAIT_MS}ms`, null, 'load-chat-history');
            return;
        }
    }
    if (typeof globalWindow.loadChatHistory !== 'function') {
        Logger.error(`❌ LoadChatHistoryVerifier: loadChatHistory not available after 20 attempts`, null, 'load-chat-history');
        return;
    }
    // Step 2: Wait for backend to be healthy (with timeout)
    try {
        const healthService = getBackendHealthService();
        const isHealthy = await healthService.waitForHealthy({ timeout: 5000 });
        if (isHealthy) {
            logStatus('Backend is healthy, proceeding');
            dispatchBackendReadyEvent();
            dispatchCanopiModuleEvent();
        }
        else {
            Logger.warn('⚠️ LoadChatHistoryVerifier: Backend not healthy after timeout, but loadChatHistory is available', null, 'load-chat-history');
            // Still dispatch events - modules can handle offline state
            dispatchBackendReadyEvent();
            dispatchCanopiModuleEvent();
            // Subscribe to health changes and dispatch when backend recovers
            healthService.subscribe((state) => {
                if (state.status === 'healthy') {
                    Logger.info('✅ LoadChatHistoryVerifier: Backend recovered, dispatching ready event', null, 'load-chat-history');
                    dispatchBackendReadyEvent();
                }
            });
        }
    }
    catch (error) {
        Logger.warn('⚠️ LoadChatHistoryVerifier: Error checking backend health, proceeding anyway', error, 'load-chat-history');
        // Still dispatch events - modules can handle offline state
        dispatchBackendReadyEvent();
        dispatchCanopiModuleEvent();
    }
}
// Auto-run on module load
if (typeof window !== 'undefined') {
    verifyLoadChatHistory().catch((error) => {
        Logger.error('❌ LoadChatHistoryVerifier: Failed to verify', error, 'load-chat-history');
    });
}
export default verifyLoadChatHistory;
