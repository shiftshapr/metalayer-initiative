/**
 * HTML SANITIZER UTILITY
 *
 * Provides HTML escaping and sanitization functions to prevent XSS attacks.
 * Used before assigning user-generated content to innerHTML.
 *
 * Security: Prevents Cross-Site Scripting (XSS) vulnerabilities
 */
/**
 * Escape HTML special characters to prevent XSS attacks
 * Converts <, >, &, ", ' to their HTML entity equivalents
 *
 * @param text - The text to escape
 * @returns Escaped HTML-safe string
 *
 * @example
 * escapeHtml('<script>alert("XSS")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 */
export declare function escapeHtml(text: string | null | undefined): string;
/**
 * Sanitize HTML string by escaping all special characters
 * This is a simple sanitizer - for more complex needs, consider DOMPurify
 *
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export declare function sanitizeHtml(html: string | null | undefined): string;
/**
 * Convert URLs in text to clickable links while escaping HTML
 * This is a safer version that escapes HTML before converting URLs
 *
 * @param text - Text that may contain URLs
 * @returns HTML string with escaped text and clickable URLs
 *
 * @example
 * convertUrlsToLinksSafely('Check https://example.com')
 * // Returns: 'Check <a href="https://example.com" target="_blank" rel="noopener noreferrer">https://example.com</a>'
 */
export declare function convertUrlsToLinksSafely(text: string | null | undefined): string;
/**
 * Sanitize user content before displaying
 * Escapes HTML and optionally converts URLs to links
 *
 * @param content - User-generated content
 * @param convertUrls - Whether to convert URLs to links (default: true)
 * @returns Sanitized HTML string
 */
export declare function sanitizeUserContent(content: string | null | undefined, convertUrls?: boolean): string;
//# sourceMappingURL=HtmlSanitizer.d.ts.map