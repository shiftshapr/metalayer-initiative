/**
 * APIModule.ts - API Management Module
 * TypeScript + ES6 Module
 * Extracted from sidepanel.js for modular architecture
 *
 * Responsibilities:
 * - MetaLayerAPI class definition
 * - API client initialization
 * - API request handling
 * - Authentication integration
 */
import { Message, User } from '../types/index.js';
import type { APIRequestOptions, ApiResponse } from '../types/api.js';
interface ExtendedAPIRequestOptions extends APIRequestOptions {
    allow401?: boolean;
    allow500?: boolean;
    user?: User;
}
type APIResponseOrNull<T = unknown> = ApiResponse<T> | null;
declare class MetaLayerAPI {
    private baseURL;
    constructor(baseURL: string);
    request<T = unknown>(endpoint: string, options?: ExtendedAPIRequestOptions): Promise<APIResponseOrNull<T>>;
    getCommunities(): Promise<APIResponseOrNull<{
        communities?: Array<{
            id: string;
            name: string;
            [key: string]: unknown;
        }>;
    }>>;
    getAvatars(communityId: string): Promise<APIResponseOrNull>;
    getPresenceByUrl(url: string, communityIds?: string[] | null): Promise<APIResponseOrNull>;
    getPresenceByCommunities(communityIds: string[]): Promise<APIResponseOrNull>;
    login(): Promise<APIResponseOrNull>;
    getMe(): Promise<APIResponseOrNull>;
    sendMessage(userId: string, communityId: string, content: string, uri?: string | null, parentId?: string | null, threadId?: string | null, optionalContent?: Record<string, unknown> | null): Promise<APIResponseOrNull<Message>>;
    getChatHistory(communityId: string, threadId?: string | null, uri?: string | null): Promise<{
        conversations: Array<{
            id: string;
            [key: string]: unknown;
        }>;
        messages: Message[];
    }>;
    deleteMessage(messageId: string): Promise<APIResponseOrNull>;
    editMessage(messageId: string, newContent: string): Promise<APIResponseOrNull>;
    getReactions(messageId: string): Promise<APIResponseOrNull>;
    addReaction(messageId: string, reactionType: string): Promise<APIResponseOrNull>;
    removeReaction(messageId: string, reactionType: string): Promise<APIResponseOrNull>;
    getReactionsByMessage(messageId: string): Promise<APIResponseOrNull>;
}
declare const api: MetaLayerAPI;
export { api, MetaLayerAPI };
//# sourceMappingURL=APIModule.d.ts.map