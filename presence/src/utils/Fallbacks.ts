/**
 * Fallback utilities for formatting user data and message content
 */

export function formatUserDisplayName(user?: any): string {
  if (!user) return 'Unknown User';
  return user.name || user.email?.split('@')[0] || 'Unknown User';
}

export function formatUserHandle(user?: any): string {
  if (!user) return 'unknown';
  return user.handle || user.email?.split('@')[0] || 'unknown';
}

export function ensureMessageContent(content: string | { content: string }): string {
  if (typeof content === 'string') {
    if (!content || typeof content !== 'string') {
      return '';
    }
    return content.trim();
  }

  if (content && typeof content === 'object' && content.content) {
    return content.content.trim();
  }

  return '';
}

export function formatAuthorName(author: any): string {
  if (!author) return 'Unknown';
  return author.name || author.handle || author.email?.split('@')[0] || 'Unknown';
}