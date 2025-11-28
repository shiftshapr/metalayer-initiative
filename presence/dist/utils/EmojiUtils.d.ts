/**
 * EmojiUtils - Utility functions for emoji detection and handling
 *
 * Provides consistent emoji detection across the codebase using manual code point checking
 * instead of Unicode regex flags for better TypeScript compatibility.
 */
export interface EmojiMetadata {
    emojis: string[];
    emojiCount: number;
    hasEmoji: boolean;
}
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
export declare function detectEmojis(content: string): string[];
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
export declare function getEmojiMetadata(content: string): EmojiMetadata;
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
export declare function hasEmoji(content: string): boolean;
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
export declare function countEmojis(content: string): number;
//# sourceMappingURL=EmojiUtils.d.ts.map