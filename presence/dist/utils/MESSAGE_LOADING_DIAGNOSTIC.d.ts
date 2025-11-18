/**
 * MESSAGE LOADING DIAGNOSTIC
 *
 * Diagnoses why messages are not loading/displaying
 */
interface ApiResult {
    communityId: string;
    success: boolean;
    duration?: string;
    response?: {
        hasConversations: boolean;
        conversationCount: number;
        conversations: Array<{
            id: string;
            postCount: number;
            hasPosts: boolean;
        }>;
    };
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}
interface DatabaseMessage {
    id: string;
    body?: string;
    parentId?: string | null;
    createdAt?: string;
    pageId?: string;
}
interface DatabaseResult {
    communityId: string;
    success: boolean;
    messageCount?: number;
    messages?: DatabaseMessage[];
    error?: string;
}
interface DiagnosticResults {
    timestamp: string;
    pageInfo: {
        rawUrl: string;
        normalizedUrl?: string;
        pageId?: string;
        hasUrlData: boolean;
    };
    communities: {
        activeCommunities: string[];
        activeCount: number;
        allCommunities: Array<{
            id: string;
            name: string;
        }>;
        hasCommunities: boolean;
    };
    apiCalls: {
        tested: boolean;
        results?: ApiResult[];
        totalCalls?: number;
        successfulCalls?: number;
        failedCalls?: number;
        reason?: string;
    };
    databaseCheck: {
        tested: boolean;
        results?: DatabaseResult[];
        totalQueries?: number;
        successfulQueries?: number;
        error?: string;
        reason?: string;
    };
    domState: {
        chatMessagesExists: boolean;
        messageCount: number;
        messageIds: (string | null)[];
        hasEmptyState: boolean;
        hasLoadingOverlay: boolean;
        focusMode: boolean;
        isVisible: boolean;
        opacity: string | null;
    };
    errors: string[];
}
export declare function runMessageLoadingDiagnostic(): Promise<DiagnosticResults>;
export {};
//# sourceMappingURL=MESSAGE_LOADING_DIAGNOSTIC.d.ts.map