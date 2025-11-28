import { handleError } from './ErrorHandler.js';

export interface NormalizationResult {
  normalizedUrl: string;
  pageId: string;
  canonicalUrl?: string;
}

type RuleType = 'QUERY_KEY_PRESERVE' | 'ALTERNATE_URL_PATTERN' | 'HASH_PRESERVE';

interface NormalizationRule {
  type: RuleType;
  domain: string;
  pattern: RegExp;
  queryKeys?: string[];
  alternateTo?: string;
  hashPreserve?: boolean;
  priority: number;
}

class UrlNormalization {
  private readonly defaultRules: NormalizationRule[];

  constructor() {
    this.defaultRules = [
      {
        type: 'QUERY_KEY_PRESERVE',
        domain: 'youtube.com',
        pattern: /^https?:\/\/(www\.)?youtube\.com\/watch\?v=/,
        queryKeys: ['v'],
        hashPreserve: false,
        priority: 100
      },
      {
        type: 'ALTERNATE_URL_PATTERN',
        domain: 'youtu.be',
        pattern: /^https?:\/\/youtu\.be\//,
        alternateTo: 'youtube.com',
        hashPreserve: false,
        priority: 90
      },
      {
        type: 'QUERY_KEY_PRESERVE',
        domain: 'google.com',
        pattern: /^https?:\/\/(www\.)?google\.com\/search\?/,
        queryKeys: ['q'],
        hashPreserve: false,
        priority: 80
      },
      {
        type: 'HASH_PRESERVE',
        domain: 'github.com',
        pattern: /^https?:\/\/(www\.)?github\.com\//,
        hashPreserve: true,
        priority: 70
      },
      {
        type: 'QUERY_KEY_PRESERVE',
        domain: 'chrome-extension',
        pattern: /^chrome:\/\/extensions\//,
        queryKeys: ['errors'],
        hashPreserve: false,
        priority: 60
      }
    ];
  }

  normalizeUrl(url: string): NormalizationResult {
    try {
      let normalizedUrl = url;
      let ruleApplied = false;

      for (const rule of this.defaultRules) {
        if (this.matchesRule(url, rule)) {
          normalizedUrl = this.applyRule(url, rule);
          ruleApplied = true;
          break;
        }
      }

      if (!ruleApplied) {
        normalizedUrl = this.applyDefaultNormalization(url);
      }

      return {
        normalizedUrl,
        pageId: this.generatePageId(normalizedUrl),
        canonicalUrl: normalizedUrl
      };
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'UrlNormalization'
            }
        });;
      const normalizedUrl = this.applyDefaultNormalization(url);
      return {
        normalizedUrl,
        pageId: this.generatePageId(normalizedUrl),
        canonicalUrl: normalizedUrl
      };
    
    }
  }

  private applyDefaultNormalization(url: string): string {
    try {
      const urlObj = new URL(url);
      let hostname = urlObj.hostname;
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }
      return `${hostname}${urlObj.pathname}`;
    } catch {
      if (url.startsWith('chrome://')) {
        const pathMatch = url.match(/chrome:\/\/([^?#]+)/);
        if (pathMatch) {
          return `chrome://${pathMatch[1]}`;
        }
      }
      return url.replace(/[^a-zA-Z0-9]/g, '_');
    }
  }

  private matchesRule(url: string, rule: NormalizationRule): boolean {
    try {
      return rule.pattern.test(url);
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'UrlNormalization'
            }
        });;
      return false;
    
    }
  }

  private applyRule(url: string, rule: NormalizationRule): string {
    try {
      if (url.startsWith('chrome://')) {
        if (rule.type === 'QUERY_KEY_PRESERVE' && rule.queryKeys) {
          return this.preserveQueryKeysForChrome(url, rule.queryKeys);
        }
        return url;
      }

      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);

      switch (rule.type) {
        case 'QUERY_KEY_PRESERVE':
          return this.preserveQueryKeys(urlObj, rule.queryKeys ?? []);
        case 'ALTERNATE_URL_PATTERN':
          return this.applyAlternatePattern(urlObj, rule);
        case 'HASH_PRESERVE':
          return this.preserveHash(urlObj, rule.hashPreserve ?? false);
        default:
          return url;
      }
    } catch (error: unknown) {
      handleError(error, {
            log: true,
            logLevel: 'error',
            context: {
                operation: 'catch',
            component: 'UrlNormalization'
            }
        });;
      return url;
    
    }
  }

  private preserveQueryKeysForChrome(url: string, queryKeys: string[]): string {
    const parts = url.split('?');
    const baseUrl = parts[0] ?? url;
    const queryString = parts[1];
    if (!queryString) {
      return baseUrl;
    }

    const params = new URLSearchParams(queryString);
    const preservedParams = new URLSearchParams();
    queryKeys.forEach(key => {
      if (params.has(key)) {
        preservedParams.set(key, params.get(key) ?? '');
      }
    });

    const preservedQuery = preservedParams.toString();
    return preservedQuery ? `${baseUrl}?${preservedQuery}` : baseUrl;
  }

  private preserveQueryKeys(urlObj: URL, queryKeys: string[]): string {
    const preservedParams = new URLSearchParams();
    queryKeys.forEach(key => {
      const value = urlObj.searchParams.get(key);
      if (value) {
        preservedParams.set(key, value);
      }
    });

    const preservedQuery = preservedParams.toString();
    const hostname = urlObj.hostname.startsWith('www.')
      ? urlObj.hostname.substring(4)
      : urlObj.hostname;
    const baseUrl = `${hostname}${urlObj.pathname}`;
    return preservedQuery ? `${baseUrl}?${preservedQuery}` : baseUrl;
  }

  private applyAlternatePattern(urlObj: URL, rule: NormalizationRule): string {
    if (!rule.alternateTo) {
      return urlObj.href;
    }
    const videoId = urlObj.pathname.replace('/', '');
    return `${rule.alternateTo}/watch?v=${videoId}`;
  }

  private preserveHash(urlObj: URL, hashPreserve: boolean): string {
    const hostname = urlObj.hostname.startsWith('www.')
      ? urlObj.hostname.substring(4)
      : urlObj.hostname;
    const baseUrl = `${hostname}${urlObj.pathname}`;
    return hashPreserve && urlObj.hash ? `${baseUrl}${urlObj.hash}` : baseUrl;
  }

  private generatePageId(url: string): string {
    return url.replace(/[^a-zA-Z0-9]/g, '_');
  }
}

// Create singleton instance
const urlNormalizationInstance = new UrlNormalization();

// Export function that matches the expected signature
export async function normalizeUrl(rawUrl: string): Promise<NormalizationResult> {
  return urlNormalizationInstance.normalizeUrl(rawUrl);
}

// Also export the class for advanced usage
export { UrlNormalization };


