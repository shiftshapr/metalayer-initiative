/**
 * API SERVICE - TypeScript Version
 * MetaLayer API client service
 */
import { APIRequestOptions, APIResponse } from '../types/index.js';
declare class MetaLayerAPI {
    private baseURL;
    constructor(baseURL: string);
    /**
     * Make API request with comprehensive endpoint redirection
     */
    request<T = any>(endpoint: string, options?: APIRequestOptions): Promise<APIResponse<T>>;
}
export { MetaLayerAPI };
export default MetaLayerAPI;
//# sourceMappingURL=APIService.d.ts.map