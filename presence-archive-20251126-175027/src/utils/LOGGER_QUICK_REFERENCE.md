# Logger Quick Reference Guide

## Quick Start

```typescript
import { Logger } from '../utils/Logger.js';

// Debug (development only)
Logger.debug('User profile loaded', { userId: user.id }, 'profile');

// Info (development only)
Logger.info('Theme changed', { theme: 'dark' }, 'ui');

// Warning (always logged)
Logger.warn('API request slow', { duration: 5000 }, 'api');

// Error (always logged)
Logger.error('Failed to load profile', error, 'profile');
```

## Common Contexts

| Context | Usage |
|---------|-------|
| `'profile'` | Profile management, avatar updates, user data |
| `'messages'` | Message loading, sending, displaying |
| `'api'` | API requests, responses, authentication headers |
| `'auth'` | Authentication, login, logout, session management |
| `'realtime'` | Realtime subscriptions, connection management |
| `'visibility'` | Visibility features, presence tracking |
| `'ui'` | UI updates, theme changes, modal interactions |
| `'storage'` | Storage operations, sync, caching |
| `'agent'` | AI agent functionality, agent interactions |
| `'community'` | Community loading, community operations |

## Migration Pattern

### Before (❌ Wrong)
```typescript
console.log('User loaded', user);
console.warn('API slow', { duration: 5000 });
console.error('Failed to load', error);
```

### After (✅ Correct)
```typescript
Logger.debug('User loaded', { userId: user.id }, 'profile');
Logger.warn('API slow', { duration: 5000 }, 'api');
Logger.error('Failed to load', error, 'profile');
```

## Data Parameter

- **With data**: Pass object as second parameter
  ```typescript
  Logger.debug('User loaded', { userId: user.id, name: user.name }, 'profile');
  ```
- **No data**: Pass `null` as second parameter
  ```typescript
  Logger.debug('Initialization complete', null, 'ui');
  ```
- **Error object**: Pass error as second parameter
  ```typescript
  Logger.error('Request failed', error, 'api');
  ```

## Production Behavior

| Level | Development | Production |
|-------|-------------|------------|
| DEBUG | ✅ Logged | ❌ Stripped |
| INFO | ✅ Logged | ❌ Stripped |
| WARN | ✅ Logged | ✅ Logged |
| ERROR | ✅ Logged | ✅ Logged |

## Best Practices

1. **Always include context**: Every Logger call needs a context string
2. **Use appropriate level**: DEBUG for dev details, WARN for warnings, ERROR for errors
3. **Don't log sensitive data**: Never log passwords, tokens, or full user objects
4. **Log user IDs, not full objects**: `{ userId: user.id }` not `user`
5. **Use structured data**: Pass objects, not strings, for better filtering

## Examples

### Profile Operations
```typescript
Logger.debug('Loading user profile', { userId }, 'profile');
Logger.debug('Profile updated', { userId, changes }, 'profile');
Logger.error('Failed to update profile', error, 'profile');
```

### API Operations
```typescript
Logger.debug('API request', { endpoint, method }, 'api');
Logger.warn('API request slow', { endpoint, duration }, 'api');
Logger.error('API request failed', error, 'api');
```

### Message Operations
```typescript
Logger.debug('Message loaded', { messageId, communityId }, 'messages');
Logger.debug('Sending message', { content: message.substring(0, 50) }, 'messages');
Logger.error('Failed to send message', error, 'messages');
```

### Realtime Operations
```typescript
Logger.debug('Subscribing to channel', { channelId }, 'realtime');
Logger.warn('Realtime connection unstable', { channelId }, 'realtime');
Logger.error('Realtime subscription failed', error, 'realtime');
```

## Environment Configuration

### Development
```typescript
// All logs enabled
Logger.setLevel('DEBUG');
```

### Production
```typescript
// Only WARN and ERROR
Logger.setLevel('WARN');
```

### Custom
```typescript
// Only ERROR
Logger.setLevel('ERROR');
```

## Troubleshooting

### Logs not appearing?
1. Check log level: `Logger.currentLevel`
2. Check if enabled: `Logger.isEnabled`
3. Verify context is correct
4. Check if in production mode (DEBUG/INFO are stripped)

### Too many logs?
1. Increase log level: `Logger.setLevel('WARN')`
2. Disable specific context filtering
3. Use Logger.getHistory() to review recent logs

## Related Documentation

- `LOGGING_POLICY.md` - Full logging policy
- `Logger.ts` - Logger implementation
- `diagnose-slice2-console-logging.ts` - Diagnostic tool

---

**Last Updated**: 2025-01-24





