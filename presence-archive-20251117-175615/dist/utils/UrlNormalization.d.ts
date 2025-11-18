export interface NormalizationResult {
    normalizedUrl: string;
    pageId: string;
}
export default class UrlNormalization {
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
//# sourceMappingURL=UrlNormalization.d.ts.map