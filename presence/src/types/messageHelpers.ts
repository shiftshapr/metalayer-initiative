/**
 * Type definitions for message helper functions
 * Replaces any types with proper type definitions
 */

import type { Message, User } from './index.js';

/**
 * Author information extracted from message payload
 */
export interface ResolvedAuthor {
  id: string;
  name: string;
  handle: string;
  email?: string;
  avatarUrl?: string;
  auraColor: string;
  [key: string]: unknown;
}

/**
 * Normalized message after processing raw payload
 */
export type NormalizedMessage = Message & {
  rawUrl?: string | null;
  normalizedUrl?: string | null;
  uri?: string | null;
  threadId?: string | undefined;
  deletedAt?: Date | string | null;
}

/**
 * Window function access helper type
 */
export type WindowFunction = (name: string) => unknown;

/**
 * Message system integration interface
 */
export interface MessageSystemIntegration {
  initialize?: () => Promise<void>;
  loadMessages?: (pageId: string, communityId?: string) => Promise<Message[]>;
  sendMessage?: (message: Partial<Message>) => Promise<Message | null>;
  [key: string]: unknown;
}

/**
 * Unified message display interface
 */
export interface UnifiedMessageDisplay {
  render?: (message: Message) => HTMLElement | Promise<HTMLElement>;
  update?: (message: Message) => void;
  [key: string]: unknown;
}

/**
 * Message loader interface
 */
export interface MessageLoader {
  load?: (pageId: string, communityId?: string) => Promise<Message[]>;
  [key: string]: unknown;
}

/**
 * User hover modal interface
 */
export interface UserHoverModal {
  show?: (user: User, element: HTMLElement) => void;
  hide?: () => void;
  [key: string]: unknown;
}

/**
 * Reactions data structure
 */
export interface ReactionsData {
  reactions?: Array<{
    id: string;
    userId: string;
    type: string;
    messageId: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

