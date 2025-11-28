/**
 * Event Type Definitions
 * Type-safe event system for CustomEvent usage
 */
export class TypedCustomEvent extends CustomEvent {
    constructor(type, detail, eventInitDict) {
        super(type, { detail, ...eventInitDict });
    }
}
/**
 * Helper function to create typed events
 */
export function createTypedEvent(type, detail) {
    return new TypedCustomEvent(type, detail);
}
//# sourceMappingURL=events.js.map