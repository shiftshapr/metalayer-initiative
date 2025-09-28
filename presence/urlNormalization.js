/**
 * URL Normalization Utility - Shared between frontend and backend
 * This ensures consistent URL normalization across the entire system
 */

class UrlNormalization {
  constructor() {
    // Default normalization rules (can be overridden by database rules)
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

  /**
   * Normalize a URL based on configured rules
   * @param {string} url - The URL to normalize
   * @returns {{normalizedUrl: string, pageId: string}}
   */
  normalizeUrl(url) {
    try {
      let normalizedUrl = url;
      let ruleApplied = false;
      
      // Apply specific rules first (on original URL)
      for (const rule of this.defaultRules) {
        if (this.matchesRule(url, rule)) {
          normalizedUrl = this.applyRule(url, rule);
          ruleApplied = true;
          break; // Apply first matching rule
        }
      }
      
      // If no specific rule matched, apply default normalization
      if (!ruleApplied) {
        normalizedUrl = this.applyDefaultNormalization(url);
      }
      
      // Generate pageId from normalized URL
      const pageId = this.generatePageId(normalizedUrl);
      
      return {
        normalizedUrl,
        pageId
      };
    } catch (error) {
      console.error('Error normalizing URL:', error);
      // Fallback to default normalization
      const normalizedUrl = this.applyDefaultNormalization(url);
      return {
        normalizedUrl,
        pageId: this.generatePageId(normalizedUrl)
      };
    }
  }

  /**
   * Apply default URL normalization rules
   * @param {string} url - The URL to normalize
   * @returns {string} - Normalized URL
   */
  applyDefaultNormalization(url) {
    try {
      const urlObj = new URL(url);
      
      // Remove www prefix
      let hostname = urlObj.hostname;
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }
      
      // Remove protocol and query parameters by default
      const normalizedUrl = `${hostname}${urlObj.pathname}`;
      
      return normalizedUrl;
    } catch (error) {
      // Handle chrome:// URLs and other non-standard URLs
      if (url.startsWith('chrome://')) {
        // Keep the chrome:// format to match backend behavior
        const pathMatch = url.match(/chrome:\/\/([^?#]+)/);
        if (pathMatch) {
          return `chrome://${pathMatch[1]}`;
        }
      }
      
      // Fallback for other non-URL strings
      return url.replace(/[^a-zA-Z0-9]/g, '_');
    }
  }

  /**
   * Check if URL matches a normalization rule
   * @param {string} url - The URL to check
   * @param {Object} rule - The normalization rule
   * @returns {boolean}
   */
  matchesRule(url, rule) {
    try {
      // For youtu.be, we need to check the original URL, not the normalized one
      if (rule.domain === 'youtu.be') {
        return rule.pattern.test(url);
      }
      return rule.pattern.test(url);
    } catch (error) {
      console.error('Error matching rule pattern:', error);
      return false;
    }
  }

  /**
   * Apply a specific normalization rule
   * @param {string} url - The URL to normalize
   * @param {Object} rule - The normalization rule
   * @returns {string} - Normalized URL
   */
  applyRule(url, rule) {
    try {
      // Handle chrome:// URLs specially
      if (url.startsWith('chrome://')) {
        switch (rule.type) {
          case 'QUERY_KEY_PRESERVE':
            return this.preserveQueryKeysForChrome(url, rule.queryKeys);
          default:
            return url;
        }
      }
      
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      
      switch (rule.type) {
        case 'QUERY_KEY_PRESERVE':
          return this.preserveQueryKeys(urlObj, rule.queryKeys);
        
        case 'ALTERNATE_URL_PATTERN':
          return this.applyAlternatePattern(urlObj, rule);
        
        case 'HASH_PRESERVE':
          return this.preserveHash(urlObj, rule.hashPreserve);
        
        default:
          return url;
      }
    } catch (error) {
      console.error('Error applying rule:', error);
      return url;
    }
  }

  /**
   * Preserve specific query keys for chrome:// URLs
   * @param {string} url - The chrome:// URL
   * @param {string[]} queryKeys - Keys to preserve
   * @returns {string} - Normalized URL
   */
  preserveQueryKeysForChrome(url, queryKeys) {
    const [baseUrl, queryString] = url.split('?');
    
    if (!queryString) {
      return baseUrl;
    }
    
    const params = new URLSearchParams(queryString);
    const preservedParams = new URLSearchParams();
    
    for (const key of queryKeys) {
      if (params.has(key)) {
        preservedParams.set(key, params.get(key));
      }
    }
    
    const preservedQuery = preservedParams.toString();
    return preservedQuery ? `${baseUrl}?${preservedQuery}` : baseUrl;
  }

  /**
   * Preserve specific query keys while removing others
   * @param {URL} urlObj - The URL object
   * @param {string[]} queryKeys - Keys to preserve
   * @returns {string} - Normalized URL
   */
  preserveQueryKeys(urlObj, queryKeys) {
    const params = new URLSearchParams();
    
    for (const key of queryKeys) {
      const value = urlObj.searchParams.get(key);
      if (value) {
        params.set(key, value);
      }
    }
    
    // Remove www prefix
    let hostname = urlObj.hostname;
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    const queryString = params.toString();
    const normalizedUrl = `${hostname}${urlObj.pathname}${queryString ? '?' + queryString : ''}`;
    
    return normalizedUrl;
  }

  /**
   * Apply alternate URL pattern (e.g., youtu.be -> youtube.com)
   * @param {URL} urlObj - The URL object
   * @param {Object} rule - The normalization rule
   * @returns {string} - Normalized URL
   */
  applyAlternatePattern(urlObj, rule) {
    if (rule.alternateTo) {
      // For youtu.be, extract video ID and convert to youtube.com format
      if (urlObj.hostname === 'youtu.be') {
        const videoId = urlObj.pathname.substring(1); // Remove leading slash
        return `${rule.alternateTo}/watch?v=${videoId}`;
      }
      const normalizedUrl = `${rule.alternateTo}${urlObj.pathname}`;
      return normalizedUrl;
    }
    return urlObj.hostname + urlObj.pathname;
  }

  /**
   * Preserve or remove hash based on rule
   * @param {URL} urlObj - The URL object
   * @param {boolean} preserveHash - Whether to preserve hash
   * @returns {string} - Normalized URL
   */
  preserveHash(urlObj, preserveHash) {
    const normalizedUrl = `${urlObj.hostname}${urlObj.pathname}`;
    return preserveHash && urlObj.hash ? normalizedUrl + urlObj.hash : normalizedUrl;
  }

  /**
   * Generate pageId from normalized URL
   * @param {string} normalizedUrl - The normalized URL
   * @returns {string} - Page ID
   */
  generatePageId(normalizedUrl) {
    return normalizedUrl.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UrlNormalization;
} else {
  window.UrlNormalization = UrlNormalization;
}
