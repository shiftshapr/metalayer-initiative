export interface NormalizationResult {
    normalizedUrl: string;
    pageId: string;
    canonicalUrl?: string;
}
declare class UrlNormalization {
    private readonly defaultRules;
    constructor();
    normalizeUrl(url: string): NormalizationResult;
    private applyDefaultNormalization;
    private matchesRule;
    private applyRule;
    private preserveQueryKeysForChrome;
    private preserveQueryKeys;
    private applyAlternatePattern;
    private preserveHash;
    private generatePageId;
}
export declare function normalizeUrl(rawUrl: string): Promise<NormalizationResult>;
export { UrlNormalization };
//# sourceMappingURL=UrlNormalization.d.ts.map