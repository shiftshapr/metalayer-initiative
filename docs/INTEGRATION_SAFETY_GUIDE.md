# Integration Safety Guide

## Quick Reference

### Before Integration
1. ✅ Run `verify-service-integration.ts` - Verifies all services are ready
2. ✅ Review `prevent-integration-bugs.ts` - Check prevention patterns
3. ✅ Ensure services initialized: `initializeMessageServices(config)`
4. ✅ Set container: `messageLoading.setContainer(container)`

### Integration Pattern

```typescript
// 1. Initialize services (once, at startup)
import { initializeMessageServices } from './features/MessagesModuleServiceIntegration.js';

await initializeMessageServices({
  messageSystemIntegration: yourIntegration,
  container: chatContainer,
  // ... other dependencies
});

// 2. Use service-based functions
import { loadChatHistoryWithServices, addMessageToChatWithServices } from './features/MessagesModuleServiceIntegration.js';

// Replace loadChatHistory
await loadChatHistoryWithServices(pageId, activeCommunities, container);

// Replace addMessageToChat
await addMessageToChatWithServices(message, container);
```

### Critical Rules (RED-LINE)

1. **Never use window lookups** - Use dependency injection
2. **State-first always** - Update state before DOM
3. **Check state for duplicates** - Not DOM
4. **Always initialize services** - Before use
5. **Always set container** - Before loading

### Common Pitfalls

| Pitfall | Prevention |
|---------|------------|
| Window lookups | Use imported services |
| DOM-first detection | Check state first |
| Missing initialization | Call initializeMessageServices() |
| State after DOM | Update state first |
| Missing error handling | Wrap in try/catch |
| Container not set | Call setContainer() first |

### Verification

Run diagnostics before integration:
```bash
# Verify services
npm run build:presence
# Check verify-service-integration.ts output
```

---

**Status**: Services ready, integration layer complete, preventive measures in place.

