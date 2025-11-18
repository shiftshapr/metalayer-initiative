/**
 * COMPREHENSIVE LOADING AND REPLY DIAGNOSTIC
 *
 * Diagnoses:
 * 1. Loading flow issues (theme flashing, overlay timing, blank screen)
 * 2. Reply loading issues (pageId normalization, AppUser table name)
 * 3. AppUser 400 errors (table name case sensitivity)
 * 4. Theme initialization timing
 */
type DiagnosticSeverity = 'error' | 'warning';
interface DiagnosticIssue {
    severity: DiagnosticSeverity;
    category: string;
    issue: string;
    fix: string;
    details?: any;
    currentPageId?: string;
    normalizedPageId?: string;
    tests?: any[];
    messageId?: string;
    hasReplies?: boolean;
    replyCount?: number;
}
interface DiagnosticData {
    appUserTableTests?: AppUserTableTest[];
    correctAppUserTableName?: string;
    currentPageId?: string;
    pageIdTests?: PageIdTest[];
    correctPageIdFormat?: string;
    loadingState?: LoadingState;
    themeState?: ThemeState;
    focusedMessage?: FocusedMessage;
    repliesInDOM?: number;
    messageInChatData?: {
        hasReplies?: boolean;
        replyCount?: number;
    };
}
interface AppUserTableTest {
    tableName: string;
    success: boolean;
    error?: {
        code?: string;
        message?: string;
        details?: string;
        hint?: string;
    } | {
        message?: string;
    };
    data: string;
}
interface PageIdTest {
    pageId: string;
    matches: number;
    replies: number;
    mainMessages: number;
    error?: string | null;
}
interface LoadingState {
    hasOverlay: boolean;
    isLoading: boolean;
    visibility: string;
    opacity: string;
    messagesCount: number;
}
interface ThemeState {
    bodyTheme: string | null;
    htmlTheme: string | null;
    storedTheme: string | null;
    userPrefsTheme: string | null;
    mismatch: boolean;
}
interface FocusedMessage {
    messageId: string | null;
    hasReplies: boolean;
    replyCount: number;
}
interface ComprehensiveDiagnosticResult {
    startTime: number;
    issues: DiagnosticIssue[];
    recommendations: string[];
    data: DiagnosticData;
}
declare const diagnostic: ComprehensiveDiagnosticResult;
declare function runDiagnostic(): Promise<ComprehensiveDiagnosticResult>;
export { runDiagnostic, diagnostic };
//# sourceMappingURL=COMPREHENSIVE_LOADING_AND_REPLY_DIAGNOSTIC.d.ts.map