/**
 * Timeline Reaction Fix
 * RED-LINE: Timeline scripts cannot use window references
 * This file provides timeline-specific reaction loading (no extension API needed)
 *
 * NOTE: This file may not be needed if CanopiModule functions are imported as modules.
 * If CanopiModule.loadMessageReactions is imported, we can use it directly.
 * This file is kept as a fallback for backward compatibility.
 */
declare let updateReactionDisplayFn: ((messageId: string, reactions: any[], reactionBtn?: HTMLElement | null) => Promise<void>) | null;
declare let loadMessageReactionsFn: ((messageId: string, reactionBtn?: HTMLElement | null) => Promise<void>) | null;
//# sourceMappingURL=timeline-reaction-fix.d.ts.map