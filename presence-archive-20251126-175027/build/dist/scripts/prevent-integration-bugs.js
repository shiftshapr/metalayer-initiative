/**
 * PREVENTIVE PATTERNS: Integration Bug Prevention
 *
 * Documents patterns to prevent common integration bugs.
 * Use this as a checklist before integrating services.
 */
const patterns = [
    {
        pattern: 'Window lookup in service integration',
        risk: 'high',
        prevention: 'Always use dependency injection. Never call getWindowFunction() in service code.',
        example: `
// ❌ WRONG
const service = getWindowFunction('MessageRendererService');

// ✅ CORRECT
import { getMessageRendererService } from '../services/MessageRendererService.js';
const service = getMessageRendererService();
    `
    },
    {
        pattern: 'DOM-first duplicate detection',
        risk: 'high',
        prevention: 'Always check state first, then DOM. State is source of truth.',
        example: `
// ❌ WRONG
const exists = document.querySelector(\`[data-message-id="\${id}"]\`);

// ✅ CORRECT
const state = getCurrentChatData();
const exists = state.some(m => m.id === id);
    `
    },
    {
        pattern: 'Missing service initialization',
        risk: 'high',
        prevention: 'Always call initializeMessageServices() before using services.',
        example: `
// ❌ WRONG
const service = getMessageRendererService(); // Throws if not initialized

// ✅ CORRECT
initializeMessageServices(config);
const service = getMessageRendererService();
    `
    },
    {
        pattern: 'State update after DOM update',
        risk: 'medium',
        prevention: 'Always update state FIRST, then render to DOM (state-first approach).',
        example: `
// ❌ WRONG
container.appendChild(element);
setState('chat.data', messages);

// ✅ CORRECT
setState('chat.data', messages);
await renderer.renderMessages(messages, container);
    `
    },
    {
        pattern: 'Missing error handling in async operations',
        risk: 'medium',
        prevention: 'Always wrap async service calls in try/catch.',
        example: `
// ❌ WRONG
await messageLoading.loadChatHistory(pageId);

// ✅ CORRECT
try {
  await messageLoading.loadChatHistory(pageId);
} catch (error) {
  console.error('Failed to load chat history:', error);
  // Handle error appropriately
}
    `
    },
    {
        pattern: 'Container not set before rendering',
        risk: 'medium',
        prevention: 'Always set container on MessageLoadingService before calling loadChatHistory.',
        example: `
// ❌ WRONG
await messageLoading.loadChatHistory(pageId);

// ✅ CORRECT
messageLoading.setContainer(container);
await messageLoading.loadChatHistory(pageId);
    `
    },
    {
        pattern: 'Missing action listeners after rendering',
        risk: 'low',
        prevention: 'Always attach action listeners after rendering messages.',
        example: `
// ❌ WRONG
await renderer.renderMessage(message);
// Missing listeners

// ✅ CORRECT
const element = await renderer.renderMessage(message);
actionListeners.attachListeners(element, message);
    `
    },
    {
        pattern: 'Type mismatches in service calls',
        risk: 'medium',
        prevention: 'Use TypeScript types. Verify Message interface matches service expectations.',
        example: `
// ❌ WRONG
await service.renderMessage(anyData);

// ✅ CORRECT
import type { Message } from '../types/index.js';
const message: Message = normalizeMessage(rawMessage);
await service.renderMessage(message);
    `
    }
];
console.log('=== INTEGRATION BUG PREVENTION PATTERNS ===\n');
patterns.forEach((pattern, i) => {
    const riskIcon = pattern.risk === 'high' ? '🔴' : pattern.risk === 'medium' ? '🟡' : '🟢';
    console.log(`${i + 1}. ${riskIcon} ${pattern.pattern}`);
    console.log(`   Prevention: ${pattern.prevention}`);
    console.log(`   Example:${pattern.example}`);
    console.log('');
});
console.log('=== INTEGRATION CHECKLIST ===\n');
console.log('Before integrating services:');
console.log('□ Services initialized with initializeMessageServices()');
console.log('□ Container set on MessageLoadingService');
console.log('□ State updated before DOM rendering');
console.log('□ Duplicate detection uses state, not DOM');
console.log('□ Error handling for all async operations');
console.log('□ Action listeners attached after rendering');
console.log('□ TypeScript types used (no any types)');
console.log('□ No window lookups in service code');
console.log('□ StateManager methods verified');
console.log('□ MessageSystemIntegration initialized');
export { patterns };
