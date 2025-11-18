/**
 * DIAGNOSTIC: User ID and Messages Loading
 *
 * Diagnoses why window.currentUser.id is null and messages aren't loading
 */
interface CurrentUserData {
    exists: boolean;
    id: string | null;
    userId: string | null;
    email: string | null;
    name: string | null;
    hasId: boolean;
    fullObject: any | null;
}
interface AuthenticationResults {
    authManagerExists: boolean;
    getCurrentUserResult?: string;
    authUserEmail?: string | null;
    authUserId?: string | null;
    error?: string;
}
interface ApiResults {
    apiExists: boolean;
    testCallSuccess?: boolean;
    testResponseId?: string | null;
    testResponseError?: string | null;
    error?: string;
    errorDetails?: any;
    emailAvailable?: boolean;
    recentErrors?: Array<{
        url: string;
        status?: number;
    }>;
}
interface MessagesResults {
    chatContainerExists: boolean;
    messageCount: number;
    chatContainerVisible: boolean;
    loadChatHistoryAvailable: boolean;
}
interface PreferencesResults {
    managerExists: boolean;
    isInitialized?: boolean;
    userId?: string;
    waitingForUserId?: boolean;
}
interface DiagnosticError {
    type: string;
    message?: string;
    recommendation?: string;
    error?: string;
    apiId?: string;
}
interface DiagnosticResults {
    timestamp: string;
    currentUser: CurrentUserData;
    authentication: AuthenticationResults;
    api: ApiResults;
    messages: MessagesResults;
    preferences: PreferencesResults;
    errors: DiagnosticError[];
}
/**
 * Diagnoses user ID and messages loading issues
 */
export declare function diagnoseUserIdAndMessages(): Promise<DiagnosticResults>;
export {};
//# sourceMappingURL=DIAGNOSTIC_USER_ID_MESSAGES.d.ts.map