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
declare class MetaLayerAPI {
    private baseURL;
    constructor(baseURL: string);
    request(endpoint: string, options?: APIRequestOptions): Promise<APIResponse>;
    getCommunities(): Promise<APIResponse<{
        communities?: any[];
    }>>;
    getAvatars(communityId: any): Promise<APIResponse<any>>;
    getPresenceByUrl(url: any, communityIds?: any): Promise<APIResponse<any>>;
    getPresenceByCommunities(communityIds: any): Promise<APIResponse<any>>;
    login(): Promise<APIResponse<any>>;
    getMe(): Promise<APIResponse<any>>;
    sendMessage(userId: any, communityId: any, content: any, uri?: any, parentId?: any, threadId?: any, optionalContent?: any): Promise<APIResponse<any>>;
    getChatHistory(communityId: any, threadId?: any, uri?: any): Promise<{
        conversations: {
            id: string;
            communityId: any;
            posts: any;
        }[];
        messages: any;
    }>;
    deleteMessage(messageId: any): Promise<APIResponse<any>>;
    editMessage(messageId: any, newContent: any): Promise<APIResponse<any>>;
    getReactions(messageId: string): Promise<APIResponse>;
    addReaction(messageId: any, reactionType: any): Promise<APIResponse<any>>;
    removeReaction(messageId: any, reactionType: any): Promise<APIResponse<any>>;
    getReactionsByMessage(messageId: any): Promise<APIResponse<any>>;
}
declare const api: MetaLayerAPI;
export { api, MetaLayerAPI };
//# sourceMappingURL=APIModule.d.ts.map