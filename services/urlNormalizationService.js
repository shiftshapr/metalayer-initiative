const { PrismaClient } = require('../generated/prisma');

class UrlNormalizationService {
  constructor() {
    this.prisma = new PrismaClient();
    this.rulesCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.lastCacheUpdate = 0;
  }

  /**
   * Normalize a URL based on configured rules
   * @param {string} url - The URL to normalize
   * @returns {Promise<{normalizedUrl: string, pageId: string}>}
   */
  async normalizeUrl(url) {
    console.log(`🔍 URL_NORMALIZE_BACKEND: Starting normalization for: ${url}`);
    try {
      // Get fresh rules if cache is expired
      const rules = await this.getNormalizationRules();
      console.log(`🔍 URL_NORMALIZE_BACKEND: Found ${rules.length} normalization rules`);
      
      let normalizedUrl = url;
      let ruleApplied = false;
      
      // Apply specific rules first (on original URL) - same as frontend
      for (const rule of rules) {
        if (this.matchesRule(url, rule)) {
          console.log(`🔍 URL_NORMALIZE_BACKEND: Applying rule ${rule.type} for domain ${rule.domain}`);
          normalizedUrl = this.applyRule(url, rule);
          ruleApplied = true;
          console.log(`🔍 URL_NORMALIZE_BACKEND: Rule applied, result: ${normalizedUrl}`);
          break; // Apply first matching rule
        }
      }
      
      // If no specific rule matched, apply default normalization
      if (!ruleApplied) {
        console.log(`🔍 URL_NORMALIZE_BACKEND: No specific rule matched, applying default normalization`);
        normalizedUrl = this.applyDefaultNormalization(url);
        console.log(`🔍 URL_NORMALIZE_BACKEND: Default normalization result: ${normalizedUrl}`);
      }
      
      // Generate pageId from normalized URL
      const pageId = this.generatePageId(normalizedUrl);
      console.log(`🔍 URL_NORMALIZE_BACKEND: Generated pageId: ${pageId}`);
      
      const result = {
        normalizedUrl,
        pageId
      };
      console.log(`✅ URL_NORMALIZE_BACKEND: Final result:`, result);
      return result;
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
      // Handle chrome:// URLs specially - preserve protocol and path (same as frontend)
      if (url.startsWith('chrome://')) {
        const pathMatch = url.match(/chrome:\/\/([^?#]+)/);
        if (pathMatch) {
          return `chrome://${pathMatch[1]}`;
        }
      }

      // Handle chrome-extension:// URLs
      if (url.startsWith('chrome-extension://')) {
        const pathMatch = url.match(/chrome-extension:\/\/([^\/]+)(.*)/);
        if (pathMatch) {
          return `chrome-extension://${pathMatch[1]}${pathMatch[2]}`;
        }
      }

      const urlObj = new URL(url);
      
      // Remove www prefix
      let hostname = urlObj.hostname;
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }
      
      // Remove protocol
      const normalizedUrl = `${hostname}${urlObj.pathname}`;
      
      return normalizedUrl;
    } catch (error) {
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
      const regex = new RegExp(rule.pattern, 'i');
      return regex.test(url);
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
      // Handle chrome:// URLs separately
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
   * @returns {string} - Normalized URL with preserved query keys
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

  /**
   * Get normalization rules from database with caching
   * @returns {Promise<Array>} - Array of normalization rules
   */
  async getNormalizationRules() {
    const now = Date.now();
    console.log(`🔍 URL_NORMALIZE_BACKEND: Getting normalization rules, cache size: ${this.rulesCache.size}`);
    
    // Return cached rules if still valid
    if (this.rulesCache.size > 0 && (now - this.lastCacheUpdate) < this.cacheExpiry) {
      console.log(`🔍 URL_NORMALIZE_BACKEND: Using cached rules (${this.rulesCache.size} rules)`);
      return Array.from(this.rulesCache.values());
    }
    
    console.log(`🔍 URL_NORMALIZE_BACKEND: Fetching fresh rules from database...`);
    try {
      const rules = await this.prisma.urlNormalizationRule.findMany({
        where: { isActive: true },
        orderBy: { priority: 'desc' }
      });
      
      console.log(`🔍 URL_NORMALIZE_BACKEND: Fetched ${rules.length} rules from database`);
      
      // Update cache
      this.rulesCache.clear();
      rules.forEach(rule => {
        this.rulesCache.set(rule.id, rule);
      });
      this.lastCacheUpdate = now;
      
      console.log(`✅ URL_NORMALIZE_BACKEND: Rules cached successfully`);
      return rules;
    } catch (error) {
      console.error('❌ URL_NORMALIZE_BACKEND: Error fetching normalization rules:', error);
      return [];
    }
  }

  /**
   * Add a new normalization rule
   * @param {Object} ruleData - The rule data
   * @returns {Promise<Object>} - Created rule
   */
  async addRule(ruleData) {
    try {
      const rule = await this.prisma.urlNormalizationRule.create({
        data: ruleData
      });
      
      // Clear cache to force refresh
      this.rulesCache.clear();
      this.lastCacheUpdate = 0;
      
      return rule;
    } catch (error) {
      console.error('Error adding normalization rule:', error);
      throw error;
    }
  }

  /**
   * Update an existing normalization rule
   * @param {string} ruleId - The rule ID
   * @param {Object} ruleData - The updated rule data
   * @returns {Promise<Object>} - Updated rule
   */
  async updateRule(ruleId, ruleData) {
    try {
      const rule = await this.prisma.urlNormalizationRule.update({
        where: { id: ruleId },
        data: ruleData
      });
      
      // Clear cache to force refresh
      this.rulesCache.clear();
      this.lastCacheUpdate = 0;
      
      return rule;
    } catch (error) {
      console.error('Error updating normalization rule:', error);
      throw error;
    }
  }

  /**
   * Delete a normalization rule
   * @param {string} ruleId - The rule ID
   * @returns {Promise<Object>} - Deleted rule
   */
  async deleteRule(ruleId) {
    try {
      const rule = await this.prisma.urlNormalizationRule.delete({
        where: { id: ruleId }
      });
      
      // Clear cache to force refresh
      this.rulesCache.clear();
      this.lastCacheUpdate = 0;
      
      return rule;
    } catch (error) {
      console.error('Error deleting normalization rule:', error);
      throw error;
    }
  }
}

module.exports = UrlNormalizationService;
