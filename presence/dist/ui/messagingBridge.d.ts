import { Message } from '../types/index.js';
export interface LegacyMessagingResult {
    success?: boolean;
    data?: Message | any;
}
export declare function sendLegacyMessage(content: string, options?: {
    parentId?: string | null;
    conversationId?: string | null;
}): Promise<LegacyMessagingResult | null>;
export declare function reloadLegacyChatHistory(): Promise<void>;
//# sourceMappingURL=messagingBridge.d.ts.map