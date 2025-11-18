/**
 * Content Anchor Type Definitions
 * Types for anchoring messages to specific content on web pages
 */
/**
 * Supported content anchor types
 */
export type AnchorContentType = 'text' | 'image' | 'video' | 'audio' | 'quote' | 'heading' | 'link';
/**
 * Text anchor context (phrases before/after selection)
 */
export interface TextAnchorContext {
    /** Phrase before the selection (null if at beginning of paragraph) */
    contextBefore: string | null;
    /** The selected/expanded text */
    selectedText: string;
    /** Phrase after the selection (null if at end of paragraph) */
    contextAfter: string | null;
}
/**
 * Media timestamp range (for audio/video)
 */
export interface MediaTimestampRange {
    /** Start timestamp in seconds (optional) */
    start?: number;
    /** End timestamp in seconds (optional, but only valid if start is provided) */
    end?: number;
}
/**
 * Image coordinate range (for image regions)
 */
export interface ImageCoordinateRange {
    /** Start coordinates (top-left corner) - optional */
    start?: {
        x: number;
        y: number;
    };
    /** End coordinates (bottom-right corner) - optional, but only valid if start is provided */
    end?: {
        x: number;
        y: number;
    };
    /** Coordinate system: 'percentage' (0-100) or 'pixels' */
    coordinateSystem?: 'percentage' | 'pixels';
}
/**
 * Future: AI-detected object/shape anchor (for evolution)
 */
export interface ObjectAnchor {
    /** Object detection confidence (0-1) */
    confidence: number;
    /** Object class/category (e.g., 'person', 'car', 'building') */
    objectClass?: string;
    /** Bounding box or polygon coordinates */
    shape: {
        type: 'rectangle' | 'polygon' | 'circle';
        coordinates: Array<{
            x: number;
            y: number;
        }>;
    };
    /** AI model used for detection */
    model?: string;
    /** Model version */
    modelVersion?: string;
}
/**
 * Content anchor metadata
 */
export interface ContentAnchor {
    /** Type of content being anchored */
    type: AnchorContentType;
    /** The actual content text/description */
    content: string;
    /** Source URL where the content was found */
    sourceUrl: string;
    /** CSS selector to locate the element (optional, for precise targeting) */
    selector?: string;
    /** XPath to locate the element (optional, alternative to selector) */
    xpath?: string;
    /** Content hash for verification (optional) */
    contentHash?: string;
    /** For text: context phrases before/after selection */
    textContext?: TextAnchorContext;
    /** For text: start and end character offsets within the source element */
    textRange?: {
        start: number;
        end: number;
    };
    /** For audio/video: timestamp range
     *   - start (optional): timestamp in seconds
     *   - end (optional, but only valid if start is provided): end timestamp (creates range)
     */
    timestampRange?: MediaTimestampRange;
    /** For image: coordinate range for region selection
     *   - start (optional): top-left corner
     *   - end (optional, but only valid if start is provided): bottom-right corner (creates rectangle)
     */
    coordinateRange?: ImageCoordinateRange;
    /** For media: source URL */
    mediaUrl?: string;
    /** For media: alt text or description */
    altText?: string;
    /** Future: AI-detected object anchor (for complex shapes/objects) */
    objectAnchor?: ObjectAnchor;
    /** Timestamp when anchor was created */
    timestamp: string;
}
/**
 * Message with content anchor
 */
export interface AnchoredMessage {
    /** Message ID */
    id: string;
    /** Message content */
    content: string;
    /** Content anchor (if message is anchored to content) */
    anchor?: ContentAnchor;
    /** User ID */
    userId: string;
    /** Community ID */
    communityId: string;
    /** Parent message ID (for replies) */
    parentId?: string | null;
    /** Thread ID (for threading) */
    threadId?: string | null;
    /** URI for the message */
    uri?: string | null;
    /** Created timestamp */
    createdAt: Date;
}
/**
 * Text selection validation result
 */
export interface TextSelectionValidation {
    /** Whether selection is valid (full sentence) */
    valid: boolean;
    /** The selected text */
    selectedText: string;
    /** The expanded text (full sentence) */
    expandedText?: string;
    /** Phrase before the selection (null if at beginning of paragraph) */
    contextBefore?: string | null;
    /** Phrase after the selection (null if at end of paragraph) */
    contextAfter?: string | null;
    /** Error message if validation failed */
    error?: string;
    /** Character range of the expanded sentence */
    range?: {
        start: number;
        end: number;
    };
}
/**
 * Selection widget action types
 */
export type SelectionAction = 'message' | 'visibility';
/**
 * Content selection event
 */
export interface ContentSelectionEvent {
    /** Type of content selected */
    type: AnchorContentType;
    /** Selected content */
    content: string;
    /** Source URL */
    sourceUrl: string;
    /** Element reference (for DOM manipulation) */
    element?: HTMLElement;
    /** Selection range (for text) */
    range?: Range;
    /** Action requested */
    action: SelectionAction;
}
//# sourceMappingURL=anchors.d.ts.map