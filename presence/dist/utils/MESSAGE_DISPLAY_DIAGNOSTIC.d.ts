/**
 * MESSAGE DISPLAY DIAGNOSTIC
 *
 * Diagnoses why messages are not displaying after loadChatHistory completes
 */
interface ChatMessagesState {
    exists: boolean;
    visible: string | null;
    opacity: string | null;
    display: string | null;
    isLoading: boolean | null;
    focusMode: string | null;
    childrenCount: number | null;
}
interface OverlayState {
    exists: boolean;
    hidden: boolean | null;
    visible: boolean | null;
}
interface MessageVisibility {
    id: string;
    visibility: string;
    opacity: string;
    display: string;
}
interface MessagesState {
    count: number;
    ids: string[];
    visible: MessageVisibility[];
}
interface LoadingState {
    flag: boolean | string;
    isLoadingChatHistory: boolean | string;
}
interface CurrentChatDataMessage {
    id: string;
    body: string;
    hasReplies: boolean;
    replyCount: number;
}
interface CurrentChatDataState {
    exists: boolean;
    count: number;
    messages: CurrentChatDataMessage[];
}
interface LastLoadedUriState {
    value: string | unknown;
    currentPageId: string | null;
}
interface DiagnosticResults {
    timestamp: string;
    chatMessages: ChatMessagesState | null;
    overlay: OverlayState | null;
    messages: MessagesState;
    isLoading: LoadingState | null;
    currentChatData: CurrentChatDataState | null;
    lastLoadedUri: LastLoadedUriState | null;
}
interface DiagnosticOutput {
    results: DiagnosticResults;
    analysis: string[];
}
declare global {
    interface Window {
        __isLoadingChatHistory?: () => boolean;
        isLoadingChatHistory?: boolean;
        lastLoadedUri?: string;
        currentUrlData?: any | {
            pageId?: string;
        };
        diagnoseMessageDisplay?: () => DiagnosticOutput;
    }
}
declare function diagnoseMessageDisplay(): DiagnosticOutput;
export { diagnoseMessageDisplay };
export type { DiagnosticOutput, DiagnosticResults };
//# sourceMappingURL=MESSAGE_DISPLAY_DIAGNOSTIC.d.ts.map