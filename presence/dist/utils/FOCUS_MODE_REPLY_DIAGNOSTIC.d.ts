/**
 * FOCUS MODE REPLY DIAGNOSTIC
 *
 * Diagnoses why replies don't load in focus mode despite showing in default view.
 * Traces communityId resolution and message data structure.
 */
export interface DiagnosticLogEntry {
    time: string;
    event: string;
    timestamp: string;
    [key: string]: unknown;
}
export interface MessageData {
    id?: string;
    communityId?: string;
    pageId?: string;
    parentId?: string;
    hasReplies?: boolean;
    replyCount?: number;
    error?: string;
    database?: MessageData;
    currentChatData?: MessageData | null;
    dom?: {
        dataset: {
            messageId?: string;
            communityId?: string;
            pageId?: string;
            hasReplies?: string;
            replyCount?: string;
        };
    } | null;
}
export interface CommunityIdResolution {
    step1MsgCommunityId: string | null;
    step2MessageCommunityId: string | null;
    step3ActiveCommunities: string | null;
    final: string | null;
}
export interface ReplyLoading {
    replyCount?: number;
    replies?: unknown[];
    queryParams?: {
        parentId: string;
        pageId: string;
        communityId: string;
    };
    error?: string;
}
export interface FocusModeState {
    hasFocusModeClass: boolean;
    dataset: {
        focusMode?: string;
        focusMessageId?: string;
    };
    activeCommunities?: string[];
    currentPageId?: string;
}
export interface DiagnosticResults {
    messageId: string;
    messageData: MessageData;
    communityIdResolution: CommunityIdResolution;
    replyLoading: ReplyLoading;
    recommendations: string[];
    focusModeState?: FocusModeState;
    error?: string;
    stack?: string;
}
export interface DiagnosticSummary {
    totalEvents: number;
    errors: number;
}
export interface DiagnosticData {
    logs: DiagnosticLogEntry[];
    summary: DiagnosticSummary;
}
export declare function diagnoseFocusModeReplies(messageId: string): Promise<DiagnosticResults>;
export declare function getFocusModeReplyDiagnostic(): DiagnosticData;
//# sourceMappingURL=FOCUS_MODE_REPLY_DIAGNOSTIC.d.ts.map