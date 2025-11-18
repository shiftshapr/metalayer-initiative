"use strict";
/**
 * Timeline Reaction Fix
 * RED-LINE: Timeline scripts cannot use window references
 * This file provides timeline-specific reaction loading (no extension API needed)
 *
 * NOTE: This file may not be needed if CanopiModule functions are imported as modules.
 * If CanopiModule.loadMessageReactions is imported, we can use it directly.
 * This file is kept as a fallback for backward compatibility.
 */
// RED-LINE: Timeline scripts should import CanopiModule functions, not use window
// This file is a compatibility layer that may be removed once all imports are working
// For now, we still need to override window.loadMessageReactions for CanopiModule's internal calls
// RED-LINE: Import CanopiModule functions as ES6 modules (no window references)
// This is a top-level await, so this file must be loaded as a module
let updateReactionDisplayFn = null;
let loadMessageReactionsFn = null;
(async () => {
    try {
        // Import CanopiModule as ES6 module
        // @ts-ignore - Runtime path, TypeScript can't resolve
        const canopiModule = await import('/presence/features/CanopiModule.js');
        updateReactionDisplayFn = canopiModule.updateReactionDisplay || canopiModule.default?.updateReactionDisplay;
        loadMessageReactionsFn = canopiModule.loadMessageReactions || canopiModule.default?.loadMessageReactions;
        console.log('✅ Timeline reaction fix: Imported CanopiModule functions as ES6 modules');
    }
    catch (e) {
        console.warn('⚠️ Timeline reaction fix: Could not import CanopiModule, will use fallback:', e);
    }
})();
// Override for timeline page (RED-LINE: minimize window usage)
if (typeof window !== 'undefined') {
    const originalLoadMessageReactions = window.loadMessageReactions;
    window.loadMessageReactions = async function (messageId, reactionBtn = null, existingReactions = null) {
        // RED-LINE: Timeline page doesn't have window.api - use timeline data directly
        console.log('🔧 TIMELINE REACTIONS: Loading reactions for timeline page (no extension API)');
        // Use imported function if available, otherwise fall back to window (for backward compatibility)
        const updateFn = updateReactionDisplayFn || (typeof window !== 'undefined' ? window.updateReactionDisplay : null);
        // 1. If reactions are already provided (from timeline data), use them
        if (existingReactions && Array.isArray(existingReactions) && existingReactions.length > 0) {
            console.log('✅ TIMELINE REACTIONS: Using existing reactions from timeline data:', existingReactions);
            if (updateFn) {
                await updateFn(messageId, existingReactions, reactionBtn);
            }
            return;
        }
        // 2. Try to get reactions from message element data attribute
        const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageEl && messageEl.dataset.reactions) {
            try {
                const reactions = JSON.parse(messageEl.dataset.reactions);
                if (Array.isArray(reactions) && reactions.length > 0) {
                    console.log('✅ TIMELINE REACTIONS: Using reactions from message data:', reactions);
                    if (updateFn) {
                        await updateFn(messageId, reactions, reactionBtn);
                        return;
                    }
                }
            }
            catch (e) {
                console.warn('TIMELINE REACTIONS: Error parsing reactions from data attribute:', e);
            }
        }
        // 3. Fallback: use empty reactions (timeline page doesn't have API to fetch)
        console.log('⚠️ TIMELINE REACTIONS: No reactions found, using empty array');
        if (updateFn) {
            await updateFn(messageId, [], reactionBtn);
        }
    };
    console.log('✅ Timeline reaction fix loaded (minimized window dependencies)');
}
//# sourceMappingURL=timeline-reaction-fix.js.map