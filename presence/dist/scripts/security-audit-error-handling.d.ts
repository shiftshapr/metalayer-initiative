/**
 * Security Audit: Error Handling Information Leakage
 *
 * RED Phase Security Audit
 *
 * Checks for:
 * 1. Sensitive information in error messages exposed to users
 * 2. Stack traces exposed in production
 * 3. API keys, tokens, or secrets in error logs
 * 4. User data in error messages
 * 5. Internal system details in error responses
 */
interface SecurityIssue {
    file: string;
    line: number;
    type: 'sensitive_data' | 'stack_trace_exposure' | 'internal_details' | 'user_data_leak' | 'secret_exposure';
    severity: 'critical' | 'high' | 'medium';
    description: string;
    codeSnippet: string;
    recommendation: string;
}
declare function runAudit(): void;
export { runAudit, type SecurityIssue };
//# sourceMappingURL=security-audit-error-handling.d.ts.map