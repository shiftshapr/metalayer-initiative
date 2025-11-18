/**
 * REPLY DISPLAY DIAGNOSTIC
 *
 * Diagnoses why replies are not displaying despite successful loading.
 * Checks database values vs query parameters to identify mismatches.
 */
export interface DiagnosticLogEntry {
    time: string;
    event: string;
    timestamp: string;
    [key: string]: unknown;
}
export interface DatabaseCheckResult {
    count?: number;
    replies?: unknown[];
    error?: string;
    errorCode?: string;
    errorDetails?: string;
    errorHint?: string;
}
export interface DatabaseChecks {
    allReplies?: DatabaseCheckResult;
    normalizedPageId?: DatabaseCheckResult;
    originalPageId?: DatabaseCheckResult;
    communityId?: DatabaseCheckResult;
    actualQuery?: DatabaseCheckResult;
}
export interface SchemaInfo {
    actualColumns: string[];
    sampleReply: Record<string, unknown>;
}
export interface DiagnosticResults {
    queryParams: {
        messageId: string;
        pageId: string;
        communityId: string;
    };
    databaseChecks: DatabaseChecks;
    mismatches: string[];
    recommendations: string[];
    schemaInfo?: SchemaInfo;
    actualCommunityId?: string;
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
declare global {
    interface Window {
        supabase?: any;
        diagnoseReplyDisplay?: (messageId: string, pageId: string, communityId: string) => Promise<DiagnosticResults>;
        getReplyDisplayDiagnostic?: () => DiagnosticData;
        __replyDisplayDiagnosticActive?: boolean;
    }
}
export declare function diagnoseReplyDisplay(messageId: string, pageId: string, communityId: string): Promise<DiagnosticResults>;
export declare function getReplyDisplayDiagnostic(): DiagnosticData;
//# sourceMappingURL=REPLY_DISPLAY_DIAGNOSTIC.d.ts.map