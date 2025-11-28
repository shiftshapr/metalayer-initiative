/**
 * XIconLibrary - Collection of X (Twitter) SVG icons
 *
 * These are the actual SVG icons used by X/Twitter in their compose modal
 * and throughout their interface. Extracted from X's public interface.
 */

interface IconProps {
  width?: number;
  height?: number;
  fill?: string;
  className?: string;
}

/**
 * Close/X icon (used in modal close button)
 */
export function CloseIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
      </g>
    </svg>
  `;
}

/**
 * Media/Image icon (for attaching images)
 */
export function MediaIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M19.75 2H4.25C3.01 2 2 3.01 2 4.25v15.5C2 20.99 3.01 22 4.25 22h15.5c1.24 0 2.25-1.01 2.25-2.25V4.25C22 3.01 20.99 2 19.75 2zM4.25 3.5h15.5c.413 0 .75.337.75.75v9.676l-3.858-3.858c-.14-.14-.33-.22-.53-.22h-.003c-.2 0-.39.08-.53.22l-4.317 4.316-1.813-1.813c-.14-.14-.33-.22-.53-.22s-.39.08-.53.22L3.5 17.25V4.25c0-.413.337-.75.75-.75zm-.744 16.28l5.418-5.534 6.282 6.282H4.25c-.402 0-.727-.322-.744-.724zm16.244.724h-2.42l-5.007-5.007 3.792-3.792 4.385 4.386v3.413c0 .413-.337.75-.75.75z"></path>
      </g>
    </svg>
  `;
}

/**
 * GIF icon
 */
export function GifIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M19 10.5V8.8h-4.4v6.4h1.7v-2h2v-1.7h-2v-1h1.7zm-7.3-1.7h1.7v6.4h-1.7V8.8zm-3.6 1.6c.4 0 .9.2 1.2.5l1.2-1C9.9 9.2 9 8.8 8.1 8.8c-1.8 0-3.2 1.4-3.2 3.2s1.4 3.2 3.2 3.2c1 0 1.8-.4 2.4-1.1l-1.2-1c-.3.3-.8.5-1.2.5-.9 0-1.6-.7-1.6-1.6 0-.8.7-1.6 1.6-1.6z"></path>
        <path d="M20.5 2.02h-17c-1.24 0-2.25 1.007-2.25 2.247v15.507c0 1.24 1.01 2.246 2.25 2.246h17c1.24 0 2.25-1.006 2.25-2.246V4.267c0-1.24-1.01-2.247-2.25-2.247zm.75 17.754c0 .41-.336.746-.75.746h-17c-.414 0-.75-.336-.75-.746V4.267c0-.412.336-.747.75-.747h17c.414 0 .75.335.75.747v15.507z"></path>
      </g>
    </svg>
  `;
}

/**
 * Poll icon
 */
export function PollIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"></path>
      </g>
    </svg>
  `;
}

/**
 * Emoji icon
 */
export function EmojiIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path>
      </g>
    </svg>
  `;
}

/**
 * Schedule icon (calendar/clock)
 */
export function ScheduleIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"></path>
      </g>
    </svg>
  `;
}

/**
 * Location icon
 */
export function LocationIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path>
      </g>
    </svg>
  `;
}

/**
 * Globe icon (for audience selection)
 */
export function GlobeIcon({ width = 16, height = 16, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path>
      </g>
    </svg>
  `;
}

/**
 * Chevron down icon (for dropdowns)
 */
export function ChevronDownIcon({ width = 16, height = 16, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M7 10l5 5 5-5z"></path>
      </g>
    </svg>
  `;
}

/**
 * Bold text icon
 */
export function BoldIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"></path>
      </g>
    </svg>
  `;
}

/**
 * Italic text icon
 */
export function ItalicIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"></path>
      </g>
    </svg>
  `;
}

/**
 * Camera icon
 */
export function CameraIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M12 12.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm5.5-2.5c0-3.03-2.47-5.5-5.5-5.5S6.5 6.97 6.5 10s2.47 5.5 5.5 5.5 5.5-2.47 5.5-5.5zm-1 0c0 2.48-2.02 4.5-4.5 4.5S7.5 12.48 7.5 10s2.02-4.5 4.5-4.5 4.5 2.02 4.5 4.5z"></path>
        <path d="M12 3.5c-3.58 0-6.5 2.92-6.5 6.5s2.92 6.5 6.5 6.5 6.5-2.92 6.5-6.5-2.92-6.5-6.5-6.5zm0 11c-2.48 0-4.5-2.02-4.5-4.5S9.52 5.5 12 5.5 16.5 7.52 16.5 10 14.48 14.5 12 14.5z"></path>
        <circle cx="12" cy="10" r="1.5"></circle>
      </g>
    </svg>
  `;
}

/**
 * Reply icon
 */
export function ReplyIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.15 6.138 6.23l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
      </g>
    </svg>
  `;
}

/**
 * Repost/Retweet icon
 * CRITICAL FIX: Updated with correct X/Twitter SVG path
 */
export function RepostIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
      </g>
    </svg>
  `;
}

/**
 * Like/Heart icon
 */
export function LikeIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
      </g>
    </svg>
  `;
}

/**
 * Like/Heart icon (filled - when liked)
 */
export function LikeFilledIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
      </g>
    </svg>
  `;
}

/**
 * Share icon
 */
export function ShareIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41L7.71 9.71 6.3 8.29 12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
      </g>
    </svg>
  `;
}

/**
 * Bookmark icon
 */
export function BookmarkIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v19.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path>
      </g>
    </svg>
  `;
}

/**
 * Bookmark icon (filled - when bookmarked)
 */
export function BookmarkFilledIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v19.44l-8-5.71-8 5.71V4.5z"></path>
      </g>
    </svg>
  `;
}

/**
 * View/Analytics icon
 */
export function ViewIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
      </g>
    </svg>
  `;
}

/**
 * Quote icon
 */
export function QuoteIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M14.23 2.854c.98-.977 2.56-.977 3.54 0l3.38 3.378c.97.977.97 2.56 0 3.537L9.91 21H2v-7.91l8.23-8.22c.98-.977 2.56-.977 3.54 0zm2.12 1.414c-.19-.196-.51-.196-.7 0l-3.38 3.378c-.2.196-.2.51 0 .707l5.09 5.09c.2.196.51.196.7 0l3.38-3.378c.2-.196.2-.51 0-.707l-5.09-5.09zM5 11.09v4.91h4.91l5.09-5.09-4.91-4.91H5v5.09z"></path>
      </g>
    </svg>
  `;
}

/**
 * More options icon (three dots)
 */
export function MoreIcon({ width = 20, height = 20, fill = 'currentColor', className = '' }: IconProps = {}): string {
  return `
    <svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="${fill}" class="${className}" aria-hidden="true">
      <g>
        <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
      </g>
    </svg>
  `;
}

/**
 * Export all icons as a map for easy access
 */
export const XIcons = {
  close: CloseIcon,
  media: MediaIcon,
  gif: GifIcon,
  poll: PollIcon,
  emoji: EmojiIcon,
  schedule: ScheduleIcon,
  location: LocationIcon,
  globe: GlobeIcon,
  chevronDown: ChevronDownIcon,
  bold: BoldIcon,
  italic: ItalicIcon,
  camera: CameraIcon,
  reply: ReplyIcon,
  repost: RepostIcon,
  like: LikeIcon,
  likeFilled: LikeFilledIcon,
  share: ShareIcon,
  bookmark: BookmarkIcon,
  bookmarkFilled: BookmarkFilledIcon,
  view: ViewIcon,
  quote: QuoteIcon,
  more: MoreIcon
};

/**
 * Get icon by name
 */
export function getIcon(name: keyof typeof XIcons, props?: IconProps): string {
  return XIcons[name](props || {});
}

// Export to window for global access
if (typeof window !== 'undefined') {
  const win = window as Window & { XIcons?: typeof XIcons };
  win.XIcons = XIcons;
}

export default XIcons;
