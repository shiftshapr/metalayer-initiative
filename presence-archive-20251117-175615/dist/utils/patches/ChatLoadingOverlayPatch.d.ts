/**
 * Chat Loading Overlay Patch (TypeScript)
 * Provides a persistent loading indicator with emergency cleanup paths.
 */
type LoadChatHistoryFn = (...args: any[]) => Promise<any>;
type AddMessageFn = (...args: any[]) => Promise<any>;
export interface ChatLoadingState {
    overlay: HTMLElement;
    startTime: number;
}
type ChatWindow = Window & {
    loadChatHistory?: LoadChatHistoryFn;
    addMessageToChat?: AddMessageFn;
    __isLoadingChatHistory?: () => boolean;
    __lastLoadStartTime?: number;
    forceHideChatLoadingOverlay?: () => void;
};
export declare const forceHideAllOverlays: (domWindow: ChatWindow, doc: Document) => void;
export declare const applyChatLoadingOverlayPatch: (domWindow?: ChatWindow) => void;
declare global {
    interface Window {
        forceHideChatLoadingOverlay?: () => void;
    }
}
export {};
//# sourceMappingURL=ChatLoadingOverlayPatch.d.ts.map