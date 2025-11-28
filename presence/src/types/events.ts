/**
 * Event Type Definitions
 * Type-safe event system for CustomEvent usage
 */
export class TypedCustomEvent<T = unknown> extends CustomEvent<T> {
  constructor(type: string, detail: T, eventInitDict?: EventInit) {
    super(type, { detail, ...eventInitDict } as CustomEventInit<T>);
  }
}

/**
 * Helper function to create typed events
 */
export function createTypedEvent<T = unknown>(type: string, detail: T): TypedCustomEvent<T> {
  return new TypedCustomEvent(type, detail);
}





