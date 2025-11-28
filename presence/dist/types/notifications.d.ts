/**
 * Notification System Type Definitions
 * Types for notification management, priority, and content anchoring
 */
export interface NotificationOptions {
    priority?: 'low' | 'medium' | 'high';
    duration?: number;
    [key: string]: unknown;
}
export interface NotificationAnchor {
    selector: string;
    element?: HTMLElement;
    [key: string]: unknown;
}
export type HighlightStyle = string | Record<string, string | number | boolean> | CSSStyleDeclaration;
export interface HighlightState {
    element: HTMLElement;
    style: HighlightStyle;
    startTime: number;
    duration: number;
    timeoutId?: ReturnType<typeof setTimeout>;
    animationId?: number;
    [key: string]: unknown;
}
export interface NotificationDataInput {
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    action?: {
        label: string;
        callback: () => void;
    };
    anchor?: {
        url: string;
        selector: string;
    };
    timeout?: number;
    priority?: 'low' | 'medium' | 'high';
    duration?: number;
    [key: string]: unknown;
}
//# sourceMappingURL=notifications.d.ts.map