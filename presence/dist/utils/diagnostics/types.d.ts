/**
 * Diagnostic Types
 * Strong typings for diagnostic modules and structured logging
 */
export type DiagnosticStatus = 'pass' | 'fail' | 'warn';
export interface DiagnosticLogEntry {
    id: string;
    name: string;
    status: DiagnosticStatus;
    summary: string;
    category: 'messages' | 'visibility' | 'api' | 'state' | 'formatting' | 'root-cause';
    timestamp?: string;
    metrics?: Record<string, number | string | boolean>;
    issues?: string[];
}
export interface AvatarCheckResult {
    totalMessages: number;
    messagesWithAvatars: number;
    messagesWithoutAvatars: number;
    avatarIssues: Array<{
        messageId: string | null;
        index: number;
        reason: string;
    }>;
}
export interface IconCheckResult {
    totalMessages: number;
    messagesWithIcons: number;
    messagesWithoutIcons: number;
    missingIcons: Array<{
        messageId: string | null;
        index: number;
        missing: Record<string, boolean>;
    }>;
}
export interface ActionCheckResult extends IconCheckResult {
}
export interface OrderCheckResult {
    totalMessages: number;
    isDescending: boolean;
    orderIssues: Array<{
        position: number;
        current: string | null;
        next: string | null;
        currentTime: string | null;
        nextTime: string | null;
    }>;
}
export interface ReplyCheckResult {
    totalReplies: number;
    visibleReplies: number;
    hiddenReplies: number;
    threadStarters: number;
    visibleSample: Array<{
        messageId: string | null;
        parentId: string | null;
    }>;
}
export interface InfoCheckResult {
    totalMessages: number;
    messagesWithTime: number;
    messagesWithSender: number;
    messagesWithContent: number;
    missingInfo: Array<{
        messageId: string | null;
        index: number;
        missing: Record<string, boolean>;
    }>;
}
export interface RenderingCheckResult {
    UnifiedMessageRenderer: boolean;
    createUnifiedMessageElement: boolean;
    addMessageActionListeners: boolean;
    AvatarUtils: boolean;
    createUnifiedAvatar: boolean;
}
export interface MessageDisplayDiagnosticResult {
    timestamp: string;
    avatars: AvatarCheckResult;
    icons: IconCheckResult;
    actions: ActionCheckResult;
    order: OrderCheckResult;
    replies: ReplyCheckResult;
    info: InfoCheckResult;
    rendering: RenderingCheckResult;
}
export interface FormattingRootCause {
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    issue: string;
    rootCause: string;
    fix?: string;
    evidence?: Record<string, unknown>;
}
export interface ComprehensiveFormattingDiagnosticResult {
    timestamp: string;
    issues: FormattingRootCause[];
    rootCauses: FormattingRootCause[];
    recommendations: FormattingRootCause[];
}
export interface RootCauseSummary extends FormattingRootCause {
    location?: string;
}
export interface RootCauseDiagnosticResult {
    timestamp: string;
    issues: RootCauseSummary[];
    rootCauses: RootCauseSummary[];
    recommendations: RootCauseSummary[];
    context: Record<string, unknown>;
}
//# sourceMappingURL=types.d.ts.map