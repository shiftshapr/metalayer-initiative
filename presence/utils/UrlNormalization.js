export default class UrlNormalization {
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
    normalizeUrl(url) {
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
                pageId: this.generatePageId(normalizedUrl)
            };
        }
        catch (error) {
            console.error('Error normalizing URL:', error);
            const normalizedUrl = this.applyDefaultNormalization(url);
            return {
                normalizedUrl,
                pageId: this.generatePageId(normalizedUrl)
            };
        }
    }
    applyDefaultNormalization(url) {
        try {
            const urlObj = new URL(url);
            let hostname = urlObj.hostname;
            if (hostname.startsWith('www.')) {
                hostname = hostname.substring(4);
            }
            return `${hostname}${urlObj.pathname}`;
        }
        catch {
            if (url.startsWith('chrome://')) {
                const pathMatch = url.match(/chrome:\/\/([^?#]+)/);
                if (pathMatch) {
                    return `chrome://${pathMatch[1]}`;
                }
            }
            return url.replace(/[^a-zA-Z0-9]/g, '_');
        }
    }
    matchesRule(url, rule) {
        try {
            return rule.pattern.test(url);
        }
        catch (error) {
            console.error('Error matching rule pattern:', error);
            return false;
        }
    }
    applyRule(url, rule) {
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
        }
        catch (error) {
            console.error('Error applying rule:', error);
            return url;
        }
    }
    preserveQueryKeysForChrome(url, queryKeys) {
        const [baseUrl, queryString] = url.split('?');
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
    preserveQueryKeys(urlObj, queryKeys) {
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
    applyAlternatePattern(urlObj, rule) {
        if (!rule.alternateTo) {
            return urlObj.href;
        }
        const videoId = urlObj.pathname.replace('/', '');
        return `${rule.alternateTo}/watch?v=${videoId}`;
    }
    preserveHash(urlObj, hashPreserve) {
        const hostname = urlObj.hostname.startsWith('www.')
            ? urlObj.hostname.substring(4)
            : urlObj.hostname;
        const baseUrl = `${hostname}${urlObj.pathname}`;
        return hashPreserve && urlObj.hash ? `${baseUrl}${urlObj.hash}` : baseUrl;
    }
    generatePageId(url) {
        return url.replace(/[^a-zA-Z0-9]/g, '_');
    }
}
