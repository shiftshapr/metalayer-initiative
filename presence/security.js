// Modern Security System
// Implements input sanitization, XSS protection, and security hardening

(function() {
  'use strict';

  class SecurityManager {
    constructor() {
      this.allowedDomains = [
        'app.themetalayer.org',
        'staging.themetalayer.org',
        'localhost',
        '127.0.0.1'
      ];
      
      this.allowedProtocols = ['https:', 'http:', 'ws:', 'wss:'];
      this.xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
      ];
      
      console.log('🔒 SECURITY: Security manager initialized');
    }

    // Sanitize user input
    sanitizeInput(input) {
      if (typeof input !== 'string') {
//         return input;
      }

      // Remove XSS patterns
      let sanitized = input;
      this.xssPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });

      // HTML entity encoding
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

      return sanitized;
    }

    // Validate URL
    validateUrl(url) {
      try {
        const urlObj = new URL(url);
        
        // Check protocol
        if (!this.allowedProtocols.includes(urlObj.protocol)) {
          throw new Error(`Invalid protocol: ${urlObj.protocol}`);
        }
        
        // Check domain
        if (!this.allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
          throw new Error(`Domain not allowed: ${urlObj.hostname}`);
        }
        
        return urlObj;
      } catch (error) {
        console.error('🔒 SECURITY: URL validation failed:', error);
        return null;
      }
    }

    // Sanitize HTML content
    sanitizeHtml(html) {
      if (typeof html !== 'string') {
        return html;
      }

      // Create a temporary div to parse HTML
      const temp = document.createElement('div');
      temp.innerHTML = html;

      // Remove script tags and event handlers
      const scripts = temp.querySelectorAll('script');
      scripts.forEach(script => script.remove());

      const elements = temp.querySelectorAll('*');
      elements.forEach(element => {
        // Remove event handlers
        const attributes = Array.from(element.attributes);
        attributes.forEach(attr => {
          if (attr.name.startsWith('on')) {
            element.removeAttribute(attr.name);
          }
        });
      });

      return temp.innerHTML;
    }

    // Validate email format
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    // Validate hex color
    validateHexColor(color) {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      return hexColorRegex.test(color);
    }

    // Sanitize JSON data
    sanitizeJsonData(data) {
      if (typeof data !== 'object' || data === null) {
        return data;
      }

      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        // Sanitize key
        const sanitizedKey = this.sanitizeInput(key);
        
        // Sanitize value based on type
        if (typeof value === 'string') {
          sanitized[sanitizedKey] = this.sanitizeInput(value);
        } else if (typeof value === 'object' && value !== null) {
          sanitized[sanitizedKey] = this.sanitizeJsonData(value);
        } else {
          sanitized[sanitizedKey] = value;
        }
      }

      return sanitized;
    }

    // Generate secure random token
    generateSecureToken(length = 32) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
      
      return result;
    }

    // Validate Chrome extension permissions
    validatePermissions(requiredPermissions) {
      return new Promise((resolve) => {
        chrome.permissions.contains({
          permissions: requiredPermissions
        }, (result) => {
          resolve(result);
        });
      });
    }

    // Content Security Policy helper
    getCSPDirectives() {
      return {
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline'",
        'style-src': "'self' 'unsafe-inline'",
        'img-src': "'self' data: https:",
        'connect-src': "'self' https: wss:",
        'font-src': "'self'",
        'object-src': "'none'",
        'base-uri': "'self'",
        'form-action': "'self'"
      };
    }

    // Rate limiting
    createRateLimiter(maxRequests, timeWindow) {
      const requests = new Map();
      
      return (identifier) => {
        const now = Date.now();
        const userRequests = requests.get(identifier) || [];
        
        // Remove old requests outside time window
        const validRequests = userRequests.filter(time => now - time < timeWindow);
        
        if (validRequests.length >= maxRequests) {
          return false; // Rate limited
        }
        
        validRequests.push(now);
        requests.set(identifier, validRequests);
        return true; // Request allowed
      };
    }

    // Secure storage wrapper
    async secureSet(key, value) {
      try {
        // Sanitize data before storage
        const sanitizedValue = this.sanitizeJsonData(value);
        
        await chrome.storage.local.set({
          [key]: sanitizedValue
        });
        
        console.log('🔒 SECURITY: Data securely stored for key:', key);
        return true;
      } catch (error) {
        console.error('🔒 SECURITY: Secure storage failed:', error);
        return false;
      }
    }

    async secureGet(key) {
      try {
        const result = await chrome.storage.local.get([key]);
        return result[key];
      } catch (error) {
        console.error('🔒 SECURITY: Secure retrieval failed:', error);
        return null;
      }
    }
  }

  // Create global security instance
  window.securityManager = new SecurityManager();
  
  // Expose security functions globally
  window.sanitizeInput = (input) => window.securityManager.sanitizeInput(input);
  window.validateUrl = (url) => window.securityManager.validateUrl(url);
  window.sanitizeHtml = (html) => window.securityManager.sanitizeHtml(html);
  window.validateEmail = (email) => window.securityManager.validateEmail(email);
  window.validateHexColor = (color) => window.securityManager.validateHexColor(color);

  console.log('✅ SECURITY: Modern security system initialized');
})();









