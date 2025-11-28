/**
 * Event Type Definitions
 * Type-safe event system for CustomEvent usage
 */
export declare class TypedCustomEvent<T = unknown> extends CustomEvent<T> {
    constructor(type: string, detail: T, eventInitDict?: EventInit);
}
/**
 * Helper function to create typed events
 */
export declare function createTypedEvent<T = unknown>(type: string, detail: T): TypedCustomEvent<T>;
//# sourceMappingURL=events.d.ts.map