/**
 * HTML Sanitizer
 * Sanitizes HTML content to prevent XSS attacks
 */
export class HtmlSanitizer {
    constructor() {
        this.allowedTags = new Set([
            'p', 'br', 'strong', 'em', 'u', 's', 'a', 'span', 'div',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'code', 'pre'
        ]);
        this.allowedAttributes = new Set([
            'href', 'target', 'rel', 'class', 'id', 'style', 'data-*'
        ]);
    }
    sanitize(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }
        // Create a temporary DOM element to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        // Sanitize the content
        this.sanitizeElement(tempDiv);
        return tempDiv.innerHTML;
    }
    sanitizeElement(element) {
        const children = Array.from(element.children);
        for (const child of children) {
            // Remove disallowed tags
            if (!this.allowedTags.has(child.tagName.toLowerCase())) {
                element.removeChild(child);
                continue;
            }
            // Sanitize attributes
            const attributes = Array.from(child.attributes);
            for (const attr of attributes) {
                if (!this.isAttributeAllowed(attr.name)) {
                    child.removeAttribute(attr.name);
                }
                // Sanitize href attributes
                if (attr.name === 'href' && attr.value) {
                    child.setAttribute('href', this.sanitizeUrl(attr.value));
                    child.setAttribute('target', '_blank');
                    child.setAttribute('rel', 'noopener noreferrer');
                }
            }
            // Recursively sanitize children
            this.sanitizeElement(child);
        }
    }
    isAttributeAllowed(attributeName) {
        // Allow data-* attributes
        if (attributeName.startsWith('data-')) {
            return true;
        }
        return this.allowedAttributes.has(attributeName);
    }
    sanitizeUrl(url) {
        // Only allow http/https URLs
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        // Convert relative URLs to absolute
        if (url.startsWith('/')) {
            return window.location.origin + url;
        }
        // Reject other protocols
        return '#';
    }
    sanitizeText(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        // Escape HTML entities
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    /**
     * Convert URLs in text to safe links
     */
    convertUrlsToLinksSafely(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        // Simple URL regex - in production this should be more robust
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, (url) => {
            const safeUrl = this.sanitizeUrl(url);
            if (safeUrl === '#')
                return url; // Don't link unsafe URLs
            return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });
    }
}
// Export singleton instance
let htmlSanitizerInstance = null;
export function getHtmlSanitizer() {
    if (!htmlSanitizerInstance) {
        htmlSanitizerInstance = new HtmlSanitizer();
    }
    return htmlSanitizerInstance;
}
// Export individual functions for convenience
export function convertUrlsToLinksSafely(text) {
    return getHtmlSanitizer().convertUrlsToLinksSafely(text);
}
export function escapeHtml(text) {
    return getHtmlSanitizer().sanitizeText(text);
}
//# sourceMappingURL=HtmlSanitizer.js.map