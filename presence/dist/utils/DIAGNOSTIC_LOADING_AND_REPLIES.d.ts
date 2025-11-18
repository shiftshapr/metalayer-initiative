/**
 * DIAGNOSTIC SCRIPT: Loading Indicator & Reply Loading
 *
 * Traces loading indicator behavior and reply loading failures
 * to identify root causes.
 */
interface DiagnosticLogEntry {
    time: string;
    event: string;
    [key: string]: any;
}
interface DiagnosticSummary {
    totalEvents: number;
    loadChatHistoryCalls: number;
    overlayChanges: number;
    replyLoads: number;
    errors: number;
}
interface DiagnosticData {
    logs: DiagnosticLogEntry[];
    summary: DiagnosticSummary;
}
export declare function getLoadingReplyDiagnostic(): DiagnosticData;
export {};
//# sourceMappingURL=DIAGNOSTIC_LOADING_AND_REPLIES.d.ts.map