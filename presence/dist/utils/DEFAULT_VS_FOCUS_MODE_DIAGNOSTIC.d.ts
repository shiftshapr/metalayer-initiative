/**
 * DEFAULT VS FOCUS MODE DIAGNOSTIC
 *
 * Compares default mode (where replies are detected) vs focus mode (where replies don't display)
 * to identify why replies show in default but not in focus mode.
 */
interface ChatMessage {
    id: string;
    hasReplies?: boolean;
    replyCount?: number;
    parentId?: string | null;
    isReply?: boolean;
}
interface MessageElement {
    id: string;
    isReply: boolean;
    hasRepliesIndicator?: boolean;
    replyCountText?: string | null;
    visible: boolean;
    display: string;
    parentId?: string | null;
}
interface ReplyInfo {
    messageId: string;
    replyCount?: string | null;
    hasReplies?: boolean;
    replyCountText?: string | null;
    id?: string;
    parentId?: string | null;
    visible?: boolean;
}
interface ChatMessagesState {
    exists: boolean;
    focusMode: string;
    isLoading: boolean;
    childrenCount: number;
}
interface DefaultModeState {
    timestamp: string;
    mode: 'default';
    chatMessages: ChatMessagesState | null;
    messages: MessageElement[];
    replies: ReplyInfo[];
    currentChatData: ChatMessage[] | null;
    replyCounts: Record<string, {
        hasReplies: boolean;
        replyCount: number;
    }>;
    hasReplies: Record<string, boolean>;
}
interface FocusModeState {
    timestamp: string;
    mode: 'focus';
    chatMessages: ChatMessagesState | null;
    focusedMessage: {
        id: string;
        hasRepliesIndicator: boolean;
        replyCountText: string | null;
    } | null;
    messages: MessageElement[];
    replies: ReplyInfo[];
    replyLoader: {
        available: boolean;
        loadAllReplies: boolean;
    } | null;
    currentChatData: ChatMessage[] | null;
}
interface Comparison {
    type: string;
    default?: string;
    focus?: string;
    issue: string;
    messageId?: string;
}
interface DiagnosticState {
    defaultMode: DefaultModeState | null;
    focusMode: FocusModeState | null;
    comparisons: Comparison[];
}
export declare function runDiagnostic(): DefaultModeState | {
    defaultState: DefaultModeState;
    focusState: FocusModeState;
    comparisons: Comparison[];
};
export declare function compareWithFocusMode(): {
    defaultState: DefaultModeState;
    focusState: FocusModeState;
    comparisons: Comparison[];
} | void;
export declare function getDiagnosticState(): DiagnosticState;
export {};
//# sourceMappingURL=DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.d.ts.map