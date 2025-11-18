/**
 * MESSAGE RENDERER - TypeScript Version
 *
 * Abstracts message rendering to ensure consistency between default view and focus mode.
 * This eliminates duplication and ensures padding, styling, and event handlers are identical.
 */
import type { Message } from '../types/index.js';
export interface MessageRenderOptions {
    isReply?: boolean;
    isFocusMode?: boolean;
    container?: HTMLElement | null;
}
export declare class MessageRenderer {
    /**
     * Render a message element with consistent styling and structure
     */
    static renderMessage(message: Message, options?: MessageRenderOptions): Promise<HTMLElement | null>;
    /**
     * Ensure consistent padding for focus mode messages
     */
    static applyFocusModePadding(messageElement: HTMLElement, options?: {
        paddingTop?: string;
        paddingLeft?: string;
        paddingBottom?: string;
        marginTop?: string;
        marginLeft?: string;
    }): void;
    /**
     * Ensure event listeners are attached to message buttons
     */
    static ensureEventListeners(messageElement: HTMLElement, message: Message): void;
}
export default MessageRenderer;
//# sourceMappingURL=MessageRenderer.d.ts.map