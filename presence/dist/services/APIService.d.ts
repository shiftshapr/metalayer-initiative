interface APIRequestOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    allow404?: boolean;
}
interface APIResponse<T = unknown> {
    data?: T;
    error?: string;
    status: number;
    timeout?: boolean;
    connectionRefused?: boolean;
}
declare class MetaLayerAPI {
    private baseURL;
    private fallbackURL;
    constructor(baseURL?: string, fallbackURL?: string);
    private _buildUrl;
    private _classifyNetworkError;
    /**
     * Make API request with comprehensive endpoint redirection
     */
    request<T = unknown>(endpoint: string, options?: APIRequestOptions): Promise<APIResponse<T>>;
}
export declare const apiServiceInstance: MetaLayerAPI;
export { MetaLayerAPI };
export type { APIRequestOptions, APIResponse };
export default MetaLayerAPI;
//# sourceMappingURL=APIService.d.ts.map