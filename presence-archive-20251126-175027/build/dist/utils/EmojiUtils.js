/**
 * EmojiUtils - Utility functions for emoji detection and handling
 *
 * Provides consistent emoji detection across the codebase using manual code point checking
 * instead of Unicode regex flags for better TypeScript compatibility.
 */
/**
 * Detect emojis in a string using manual code point checking
 *
 * This approach avoids Unicode regex flag issues and works across all TypeScript targets.
 * It detects:
 * - Basic emoji ranges (0x1F300-0x1F9FF: Emoticons & Symbols)
 * - Miscellaneous symbols (0x2600-0x26FF)
 * - Dingbats (0x2700-0x27BF)
 * - Surrogate pairs (UTF-16 emoji encoding)
 *
 * @param content - The string to analyze for emojis
 * @returns Array of unique emoji characters found
 *
 * @example
 * ```typescript
 * const emojis = detectEmojis("Hello 😀 world 🌍");
 * // Returns: ["😀", "🌍"]
 * ```
 */
export function detectEmojis(content) {
    const emojis = [];
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (!char)
            continue;
        const code = char.charCodeAt(0);
        // Check for emoji ranges (simplified detection)
        // Basic emoji ranges: 0x1F300-0x1F9FF (Emoticons & Symbols)
        // 0x2600-0x26FF (Miscellaneous Symbols), 0x2700-0x27BF (Dingbats)
        if ((code >= 0x1F300 && code <= 0x1F9FF) || // Emoticons & Symbols
            (code >= 0x2600 && code <= 0x26FF) || // Miscellaneous Symbols
            (code >= 0x2700 && code <= 0x27BF) // Dingbats
        ) {
            emojis.push(char);
        }
        // Check for surrogate pairs (emoji in UTF-16)
        if (i < content.length - 1) {
            const nextChar = content[i + 1];
            if (nextChar) {
                const pair = char + nextChar;
                // Check if it's a valid surrogate pair
                const high = char.charCodeAt(0);
                const low = nextChar.charCodeAt(0);
                if (high >= 0xD800 && high <= 0xDBFF && low >= 0xDC00 && low <= 0xDFFF) {
                    emojis.push(pair);
                    i++; // Skip next char as it's part of the pair
                }
            }
        }
    }
    // Return unique emojis using Array.from for Set iteration compatibility
    return Array.from(new Set(emojis));
}
/**
 * Generate emoji metadata from content
 *
 * @param content - The string to analyze
 * @returns EmojiMetadata object with emoji list, count, and hasEmoji flag
 *
 * @example
 * ```typescript
 * const metadata = getEmojiMetadata("Hello 😀 world 🌍");
 * // Returns: { emojis: ["😀", "🌍"], emojiCount: 2, hasEmoji: true }
 * ```
 */
export function getEmojiMetadata(content) {
    const emojis = detectEmojis(content);
    return {
        emojis,
        emojiCount: emojis.length,
        hasEmoji: emojis.length > 0
    };
}
/**
 * Check if content contains emojis
 *
 * @param content - The string to check
 * @returns true if content contains at least one emoji
 *
 * @example
 * ```typescript
 * hasEmoji("Hello 😀"); // Returns: true
 * hasEmoji("Hello world"); // Returns: false
 * ```
 */
export function hasEmoji(content) {
    return detectEmojis(content).length > 0;
}
/**
 * Count emojis in content
 *
 * @param content - The string to analyze
 * @returns Number of unique emojis found
 *
 * @example
 * ```typescript
 * countEmojis("Hello 😀 world 🌍"); // Returns: 2
 * ```
 */
export function countEmojis(content) {
    return detectEmojis(content).length;
}
//# sourceMappingURL=EmojiUtils.js.map