/**
 * Messages Module - Modern TypeScript Implementation
 * 
 * Exports all message-related components and services.
 */

export { MessageFeed } from './MessageFeed.js';
export type { MessageFeedOptions, FocusMode, FocusState } from './MessageFeed.js';

export { MessageRenderer } from './MessageRenderer.js';
export type { MessageRendererOptions, RenderOptions, AddMessageOptions } from './MessageRenderer.js';

export { MessageRealtimeManager } from './MessageRealtimeManager.js';
export type { MessageRealtimeManagerOptions } from './MessageRealtimeManager.js';

export { MessagePaginationService } from './MessagePaginationService.js';
export type { MessagePaginationServiceOptions, LoadPageOptions } from './MessagePaginationService.js';

export { LoadingIndicator } from './LoadingIndicator.js';

export { 
  initializeMessageFeed, 
  getActiveMessageFeed, 
  destroyMessageFeed, 
  loadMessagesViaFeed 
} from './MessageFeedIntegration.js';

