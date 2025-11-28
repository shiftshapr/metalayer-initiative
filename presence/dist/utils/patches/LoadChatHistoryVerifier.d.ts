/**
 * LoadChatHistoryVerifier
 *
 * Ensures loadChatHistory is available and backend is healthy before dependent modules run.
 * Replaces polling retry loop with event-driven health checks.
 */
/**
 * Verify loadChatHistory is available and backend is healthy
 */
export declare function verifyLoadChatHistory(): Promise<void>;
export default verifyLoadChatHistory;
//# sourceMappingURL=LoadChatHistoryVerifier.d.ts.map