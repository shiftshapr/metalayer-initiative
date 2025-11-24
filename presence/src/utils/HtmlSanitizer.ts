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
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize HTML string by escaping all special characters
 * This is a simple sanitizer - for more complex needs, consider DOMPurify
 * 
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string | null | undefined): string {
  return escapeHtml(html);
}

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
export function convertUrlsToLinksSafely(text: string | null | undefined): string {
  if (!text) return '';
  
  // Extract URLs first (before escaping) to preserve them for href
  const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
  const urls: string[] = [];
  const urlPlaceholder = '___URL_PLACEHOLDER___';
  
  // Replace URLs with placeholders and store original URLs
  let textWithPlaceholders = text.replace(urlRegex, (url) => {
    urls.push(url);
    return `${urlPlaceholder}${urls.length - 1}${urlPlaceholder}`;
  });
  
  // Escape the entire text (including placeholders)
  const escaped = escapeHtml(textWithPlaceholders);
  
  // Replace placeholders with actual link HTML (URLs are safe in href attribute)
  return escaped.replace(new RegExp(`${escapeHtml(urlPlaceholder)}(\\d+)${escapeHtml(urlPlaceholder)}`, 'g'), (_match, index) => {
    const originalUrl = urls[parseInt(index, 10)];
    const escapedUrl = escapeHtml(originalUrl);
    return `<a href="${originalUrl}" target="_blank" rel="noopener noreferrer">${escapedUrl}</a>`;
  });
}

/**
 * Sanitize user content before displaying
 * Escapes HTML and optionally converts URLs to links
 * 
 * @param content - User-generated content
 * @param convertUrls - Whether to convert URLs to links (default: true)
 * @returns Sanitized HTML string
 */
export function sanitizeUserContent(
  content: string | null | undefined,
  convertUrls: boolean = true
): string {
  if (!content) return '';
  
  if (convertUrls) {
    return convertUrlsToLinksSafely(content);
  }
  
  return escapeHtml(content);
}

