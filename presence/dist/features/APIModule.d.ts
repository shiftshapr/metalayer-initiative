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
interface APIRequestOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    allow404?: boolean;
    allow401?: boolean;
    allow500?: boolean;
    user?: any;
}
interface APIResponse<T = any> {
    data?: T;
    error?: string;
    status?: number;
    [key: string]: any;
}
type APIResponseOrNull<T = any> = APIResponse<T> | null;
declare class MetaLayerAPI {
    private baseURL;
    constructor(baseURL: string);
    request(endpoint: string, options?: APIRequestOptions): Promise<APIResponseOrNull>;
    getCommunities(): Promise<APIResponseOrNull<{
        communities?: any[];
    }>>;
    getAvatars(communityId: string): Promise<APIResponseOrNull>;
    getPresenceByUrl(url: string, communityIds?: string[] | null): Promise<APIResponseOrNull>;
    getPresenceByCommunities(communityIds: string[]): Promise<APIResponseOrNull>;
    login(): Promise<APIResponseOrNull>;
    getMe(): Promise<APIResponseOrNull>;
    sendMessage(userId: string, communityId: string, content: string, uri?: string | null, parentId?: string | null, threadId?: string | null, optionalContent?: any): Promise<APIResponseOrNull>;
    getChatHistory(communityId: string, threadId?: string | null, uri?: string | null): Promise<{
        conversations: any[];
        messages: any[];
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