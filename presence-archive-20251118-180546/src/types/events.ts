/**
 * Event Type Definitions
 * Type-safe event system for CustomEvent usage
 */

/**
 * Avatar clicked event
 */
export interface AvatarClickedEventDetail {
  userId: string;
  avatar: HTMLElement;
}

/**
 * Message event detail
 */
export interface MessageEventDetail {
  message: {
    id: string;
    body: string;
    authorId: string;
    [key: string]: unknown;
  };
}

/**
 * User updated event detail
 */
export interface UserUpdatedEventDetail {
  user: {
    id: string;
    email?: string;
    name?: string;
    auraColor?: string;
    [key: string]: unknown;
  };
}

/**
 * Visibility changed event detail
 */
export interface VisibilityChangedEventDetail {
  userId: string;
  isVisible: boolean;
  availability?: string;
}

/**
 * Status changed event detail
 */
export interface StatusChangedEventDetail {
  userId: string;
  status: string;
  availability: string;
}

/**
 * Typed CustomEvent classes
 */
export class TypedCustomEvent<T> extends CustomEvent<T> {
  constructor(type: string, detail: T, eventInitDict?: CustomEventInit<T>) {
    super(type, { detail, ...eventInitDict });
  }
}

/**
 * Event type map for type-safe event dispatching
 */
export type EventTypeMap = {
  'avatarClicked': AvatarClickedEventDetail;
  'messageAdded': MessageEventDetail;
  'messageUpdated': MessageEventDetail;
  'userUpdated': UserUpdatedEventDetail;
  'visibilityChanged': VisibilityChangedEventDetail;
  'statusChanged': StatusChangedEventDetail;
};

/**
 * Helper function to create typed events
 */
export function createTypedEvent<T extends keyof EventTypeMap>(
  type: T,
  detail: EventTypeMap[T]
): TypedCustomEvent<EventTypeMap[T]> {
  return new TypedCustomEvent(type, detail);
}
