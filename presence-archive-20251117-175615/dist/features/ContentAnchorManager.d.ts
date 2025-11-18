/**
 * Content Anchor Manager
 * Handles content selection, validation, and anchoring for messages
 */
import { ContentAnchor, TextSelectionValidation } from '../types/anchors';
/**
 * Manages content selection and anchoring
 */
export declare class ContentAnchorManager {
    /**
     * Validates text selection to ensure it's a full sentence
     * Expands selection to include complete sentences if needed
     */
    static validateTextSelection(selection: Selection): TextSelectionValidation;
    /**
     * Creates a content anchor from a text selection
     */
    static createTextAnchor(selection: Selection, sourceUrl: string): ContentAnchor | null;
    /**
     * Creates a content anchor from an image element
     * @param image - The image element
     * @param sourceUrl - Source URL of the page
     * @param coordinateRange - Optional coordinate range for region selection
     *   - start (optional): top-left corner
     *   - end (optional, but only valid if start is provided): bottom-right corner (creates rectangle)
     */
    static createImageAnchor(image: HTMLImageElement, sourceUrl: string, coordinateRange?: {
        start?: {
            x: number;
            y: number;
        };
        end?: {
            x: number;
            y: number;
        };
        coordinateSystem?: 'percentage' | 'pixels';
    }): ContentAnchor;
    /**
     * Creates a content anchor from a video element
     * @param video - The video element
     * @param sourceUrl - Source URL of the page
     * @param timestampRange - Optional timestamp range
     *   - start (optional): timestamp in seconds
     *   - end (optional, but only valid if start is provided): end timestamp (creates range)
     * @param coordinateRange - Optional coordinate range for region selection (for frame anchoring)
     *   - start (optional): top-left corner
     *   - end (optional, but only valid if start is provided): bottom-right corner (creates rectangle)
     */
    static createVideoAnchor(video: HTMLVideoElement, sourceUrl: string, timestampRange?: {
        start?: number;
        end?: number;
    }, coordinateRange?: {
        start?: {
            x: number;
            y: number;
        };
        end?: {
            x: number;
            y: number;
        };
        coordinateSystem?: 'percentage' | 'pixels';
    }): ContentAnchor;
    /**
     * Creates a content anchor from an audio element
     * @param audio - The audio element
     * @param sourceUrl - Source URL of the page
     * @param timestampRange - Optional timestamp range
     *   - start (optional): timestamp in seconds
     *   - end (optional, but only valid if start is provided): end timestamp (creates range)
     */
    static createAudioAnchor(audio: HTMLAudioElement, sourceUrl: string, timestampRange?: {
        start?: number;
        end?: number;
    }): ContentAnchor;
    /**
     * Generates a CSS selector for an element
     */
    private static generateSelector;
    /**
     * Generates an XPath for an element
     */
    private static generateXPath;
    /**
     * Serializes a content anchor to a string (for storage in optionalContent field)
     */
    static serializeAnchor(anchor: ContentAnchor): string;
    /**
     * Deserializes a content anchor from a string
     */
    static deserializeAnchor(serialized: string): ContentAnchor | null;
}
//# sourceMappingURL=ContentAnchorManager.d.ts.map