/**
 * REPLY LOADER MODULE - TypeScript Version
 *
 * Handles loading and managing replies for messages in focus mode.
 * Separates reply loading logic from message rendering.
 */
import type { Message, User } from '../types/index.js';
export interface ReplyCheckResult {
    hasReplies: boolean;
    replyCount: number;
}
export interface FormattedReply extends Message {
    isReply: boolean;
    hasReplies: boolean;
    replyCount: number;
}
export declare class ReplyLoader {
    /**
     * Check if a message has nested replies
     */
    static checkForNestedReplies(messageId: string, pageId: string, communityId: string): Promise<ReplyCheckResult>;
    /**
     * Load all replies for a message (recursively)
     */
    static loadAllReplies(messageId: string, pageId: string, communityId: string): Promise<Message[]>;
    /**
     * Fetch author data for a reply
     */
    static fetchReplyAuthor(userId: string): Promise<User>;
    /**
     * Convert Supabase reply data to API format
     */
    static formatReply(replyData: {
        id: string;
        user_id?: string;
        userId?: string;
        author?: User;
        body?: string;
        content?: string;
        created_at?: string;
        createdAt?: string;
        parent_id?: string;
        [key: string]: unknown;
    }, parentMessage: Message, pageId: string, communityId: string): Promise<FormattedReply>;
}
export default ReplyLoader;
//# sourceMappingURL=ReplyLoader.d.ts.map