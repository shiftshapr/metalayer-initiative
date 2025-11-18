/**
 * FOCUS MODE REPLY TRACE
 *
 * Enhanced diagnostic to trace reply loading and DOM insertion in focus mode.
 */
export interface TraceEntry {
    time: string;
    event: string;
    timestamp: string;
    [key: string]: unknown;
}
export interface TraceSummary {
    totalEvents: number;
    replyLoaderCalls: number;
    replyLoaderResults: number;
    addMessageCalls: number;
    messagesInDOM: number;
    messagesNotInDOM: number;
}
export interface TraceData {
    traces: TraceEntry[];
    summary: TraceSummary;
}
interface ReplyLoader {
    loadAllReplies: (messageId: string, pageId: string, communityId: string) => Promise<unknown[]>;
}
declare global {
    interface Window {
        ReplyLoader?: ReplyLoader;
        addMessageToFocus?: (message: Record<string, unknown>, isReply?: boolean) => Promise<unknown>;
        getFocusModeReplyTrace?: () => TraceData;
        __focusModeReplyTraceActive?: boolean;
    }
}
export declare function getFocusModeReplyTrace(): TraceData;
export {};
//# sourceMappingURL=FOCUS_MODE_REPLY_TRACE.d.ts.map