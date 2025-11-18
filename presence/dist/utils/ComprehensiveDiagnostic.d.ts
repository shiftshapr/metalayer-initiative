/**
 * COMPREHENSIVE DIAGNOSTIC TOOL
 * Root Cause Analysis for Messages and Visibility Tab Issues
 */
interface DiagnosticResults {
    timestamp: string;
    urlNormalization: UrlNormalizationDiagnostic;
    messageLoading: MessageLoadingDiagnostic;
    visibilityTab: VisibilityTabDiagnostic;
    apiConnectivity: ApiConnectivityDiagnostic;
    databaseQueries: DatabaseQueriesDiagnostic;
    errors: DiagnosticError[];
    moduleDiagnostics: Record<string, ModuleDiagnosticResult>;
}
interface UrlNormalizationDiagnostic {
    rawUri?: string;
    normalizedUrl?: string;
    pageId?: string;
    normalizationWorking?: boolean;
    normalizeCurrentUrlWorking?: boolean;
    currentUrlData?: any;
    windowCurrentUrlData?: any;
    error?: string;
    stack?: string;
}
interface MessageLoadingDiagnostic {
    loadChatHistoryAvailable?: boolean;
    communities?: number;
    activeCommunities?: string[];
    activeCommunitiesCount?: number;
    apiAvailable?: boolean;
    testApiCall?: {
        success: boolean;
        conversations?: number;
        messages?: number;
        response?: any;
        error?: string;
        stack?: string;
    };
    supabaseAvailable?: boolean;
    supabaseFromAvailable?: boolean;
    chatMessagesElement?: boolean;
    chatMessagesVisible?: boolean;
    chatMessagesContent?: string;
    messageElementsCount?: number;
    error?: string;
    stack?: string;
}
interface VisibilityTabDiagnostic {
    visibilityTabElement?: boolean;
    visibilityTabActive?: boolean;
    visibilityTabDisplay?: string;
    updateVisibleTabAvailable?: boolean;
    visibilityManagerAvailable?: boolean;
    currentVisibilityData?: any;
    currentVisibilityDataUnfiltered?: any;
    currentUser?: any;
    currentUserId?: string;
    visibilityModalElement?: boolean;
    visibilityModalDisplay?: string;
    visibilityModalZIndex?: string;
    visibilityModalHandlerAvailable?: boolean;
    visibilityModalHandlerInitialized?: boolean;
    visibilityCheck?: {
        isVisible?: boolean;
        working?: boolean;
        error?: string;
    };
    pageUsers?: {
        count?: number;
        users?: any[];
        working?: boolean;
        error?: string;
    };
    error?: string;
    stack?: string;
}
interface ApiConnectivityDiagnostic {
    apiModuleAvailable?: boolean;
    apiGetChatHistoryAvailable?: boolean;
    apiBaseUrl?: string;
    healthCheck?: {
        success?: boolean;
        status?: number;
        statusText?: string;
        error?: string;
    };
    error?: string;
    stack?: string;
}
interface DatabaseQueriesDiagnostic {
    supabaseAvailable?: boolean;
    messagesQuery?: {
        success?: boolean;
        count?: number;
        error?: string;
        sample?: any[];
    };
    presenceQuery?: {
        success?: boolean;
        count?: number;
        error?: string;
        sample?: any[];
    };
    error?: string;
    stack?: string;
}
interface DiagnosticError {
    type: string;
    message: string;
    stack?: string;
}
interface ModuleDiagnosticResult {
    success: boolean;
    timestamp?: string;
    summary?: any;
    error?: string;
}
declare class ComprehensiveDiagnostic {
    private results;
    constructor();
    runFullDiagnostic(): Promise<DiagnosticResults>;
    diagnoseUrlNormalization(): Promise<void>;
    diagnoseMessageLoading(): Promise<void>;
    diagnoseVisibilityTab(): Promise<void>;
    diagnoseApiConnectivity(): Promise<void>;
    diagnoseDatabaseQueries(): Promise<void>;
    runModuleDiagnostics(): Promise<void>;
    generateReport(): DiagnosticResults;
}
export { ComprehensiveDiagnostic };
//# sourceMappingURL=ComprehensiveDiagnostic.d.ts.map