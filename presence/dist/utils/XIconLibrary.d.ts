/**
 * XIconLibrary - Collection of X (Twitter) SVG icons
 *
 * These are the actual SVG icons used by X/Twitter in their compose modal
 * and throughout their interface. Extracted from X's public interface.
 */
/**
 * Close/X icon (used in modal close button)
 */
export declare function CloseIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Media/Image icon (for attaching images)
 */
export declare function MediaIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * GIF icon
 */
export declare function GifIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Poll icon
 */
export declare function PollIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Emoji icon
 */
export declare function EmojiIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Schedule icon (calendar/clock)
 */
export declare function ScheduleIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Location icon
 */
export declare function LocationIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Globe icon (for audience selection)
 */
export declare function GlobeIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Chevron down icon (for dropdowns)
 */
export declare function ChevronDownIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Bold text icon
 */
export declare function BoldIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Italic text icon
 */
export declare function ItalicIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Camera icon
 */
export declare function CameraIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Reply icon
 */
export declare function ReplyIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Repost/Retweet icon
 * CRITICAL FIX: Updated with correct X/Twitter SVG path
 */
export declare function RepostIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Like/Heart icon
 */
export declare function LikeIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Like/Heart icon (filled - when liked)
 */
export declare function LikeFilledIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Share icon
 */
export declare function ShareIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Bookmark icon
 */
export declare function BookmarkIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Bookmark icon (filled - when bookmarked)
 */
export declare function BookmarkFilledIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * View/Analytics icon
 */
export declare function ViewIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Quote icon
 */
export declare function QuoteIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * More options icon (three dots)
 */
export declare function MoreIcon({ width, height, fill, className }?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
/**
 * Export all icons as a map for easy access
 */
export declare const XIcons: {
    close: typeof CloseIcon;
    media: typeof MediaIcon;
    gif: typeof GifIcon;
    poll: typeof PollIcon;
    emoji: typeof EmojiIcon;
    schedule: typeof ScheduleIcon;
    location: typeof LocationIcon;
    globe: typeof GlobeIcon;
    chevronDown: typeof ChevronDownIcon;
    bold: typeof BoldIcon;
    italic: typeof ItalicIcon;
    camera: typeof CameraIcon;
    reply: typeof ReplyIcon;
    repost: typeof RepostIcon;
    like: typeof LikeIcon;
    likeFilled: typeof LikeFilledIcon;
    share: typeof ShareIcon;
    bookmark: typeof BookmarkIcon;
    bookmarkFilled: typeof BookmarkFilledIcon;
    view: typeof ViewIcon;
    quote: typeof QuoteIcon;
    more: typeof MoreIcon;
};
/**
 * Get icon by name
 */
export declare function getIcon(name: keyof typeof XIcons, props?: {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
}): string;
export default XIcons;
//# sourceMappingURL=XIconLibrary.d.ts.map