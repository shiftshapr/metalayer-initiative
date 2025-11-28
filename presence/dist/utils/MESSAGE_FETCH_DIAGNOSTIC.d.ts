type DiagnosticResult = {
    apiBaseUrl: string;
    requestUrl: string;
    status: number | 'FAILED';
    ok: boolean;
    pageId?: string;
    error?: string;
};
declare function runMessageFetchDiagnostic(): Promise<DiagnosticResult>;
export { runMessageFetchDiagnostic };
//# sourceMappingURL=MESSAGE_FETCH_DIAGNOSTIC.d.ts.map