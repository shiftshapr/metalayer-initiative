/**
 * MESSAGE VISIBILITY DIAGNOSTIC
 *
 * Comprehensive diagnostic to find why messages aren't visible
 * This will check DOM, styles, computed styles, and all possible blockers
 */
interface InlineStyles {
    display: string;
    visibility: string;
    opacity: string;
    position?: string;
}
interface ComputedStyles extends InlineStyles {
    width: string;
    height: string;
}
interface ChatMessagesContainer {
    exists: boolean;
    id: string;
    className: string;
    innerHTML: string;
    childrenCount: number;
    inlineStyles: InlineStyles;
    computedStyles: ComputedStyles;
}
interface MessageInfo {
    id: string;
    element: string;
    className: string;
    hasContent: boolean;
    inlineStyles: {
        display: string;
        visibility: string;
        opacity: string;
    };
    computedStyles: ComputedStyles;
    dimensions: {
        offsetWidth: number;
        offsetHeight: number;
        clientWidth: number;
        clientHeight: number;
    };
    isVisible: boolean;
}
interface CssIssue {
    selector: string;
    rule: string;
    sheetIndex: number;
    ruleIndex: number;
}
interface DiagnosticResults {
    timestamp: string;
    chatMessagesContainer: ChatMessagesContainer | null;
    messages: MessageInfo[];
    visibilityIssues: string[];
    styleIssues: string[];
    cssIssues: CssIssue[];
    recommendations: string[];
}
export declare function runMessageVisibilityDiagnostic(): DiagnosticResults;
export {};
//# sourceMappingURL=MESSAGE_VISIBILITY_DIAGNOSTIC.d.ts.map