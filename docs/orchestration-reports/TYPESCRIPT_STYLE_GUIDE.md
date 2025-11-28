# TypeScript Style Guide - canopi

This guide documents TypeScript coding standards and best practices for the canopi project.

## Set Iteration Pattern

### Standard: Use `Array.from(new Set(array))`

**Always use `Array.from()` instead of spread operator for Set iteration.**

#### ✅ Correct
```typescript
const uniqueItems = Array.from(new Set(items));
const uniqueEmojis = Array.from(new Set(emojis));
```

#### ❌ Incorrect
```typescript
const uniqueItems = [...new Set(items)];  // May cause TS2802 error
const uniqueEmojis = [...new Set(emojis)];  // Requires downlevelIteration flag
```

### Why?

1. **TypeScript Compatibility**: The spread operator `[...new Set()]` requires the `--downlevelIteration` flag or ES2015+ target, which can cause TS2802 errors in strict mode.

2. **Explicit Intent**: `Array.from()` clearly indicates conversion from Set to Array.

3. **Consistent Pattern**: Works across all TypeScript targets without additional compiler flags.

### Examples

```typescript
// Remove duplicates from array
const uniqueIds = Array.from(new Set(messageIds));

// Get unique emojis
const uniqueEmojis = Array.from(new Set(emojiList));

// Convert Set to Array for iteration
const items = Array.from(new Set(collection));
items.forEach(item => processItem(item));
```

## Window Type Extensions

### Avoid Window Globals When Possible

**Prefer module exports and dependency injection over Window globals.**

#### ✅ Correct: Module Exports
```typescript
// services/MessageStore.ts
export const messageStore = new MessageStore();

// components/UnifiedMessageModal.ts
import { messageStore } from '../services/MessageStore.js';
messageStore.handleRealtimeMessage(data);
```

#### ⚠️ Acceptable: Chrome Extension APIs Only
```typescript
// Only for Chrome extension APIs or browser-specific features
if (typeof window !== 'undefined') {
  const win = window as Window & {
    chrome?: typeof chrome;
  };
}
```

#### ❌ Avoid: Custom Properties on Window
```typescript
// Don't add custom properties to Window
window.messageStore = messageStore;  // Avoid
window.myService = service;  // Avoid
```

### When Window is Necessary

If Window globals are required (e.g., for Chrome extension compatibility), extend the Window type properly:

```typescript
const win = window as Window & {
  unifiedMessageModal?: UnifiedMessageModal;
  openMessageModal?: (options: MessageModalOptions) => Promise<void>;
};
```

## Emoji Detection

### Use EmojiUtils

**Always use `EmojiUtils` for emoji detection instead of regex.**

#### ✅ Correct
```typescript
import { getEmojiMetadata, detectEmojis, hasEmoji } from '../utils/EmojiUtils.js';

const metadata = getEmojiMetadata(content);
const emojis = detectEmojis(content);
const containsEmoji = hasEmoji(content);
```

#### ❌ Incorrect
```typescript
// Don't use Unicode regex flags
const emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;  // May cause TS1501/TS1538 errors
const emojis = content.match(emojiRegex) || [];
```

### Why?

1. **TypeScript Compatibility**: Unicode regex flags require ES6+ target and can cause compilation errors.

2. **Consistent Detection**: Manual code point checking works across all targets.

3. **Reusable**: Centralized utility ensures consistent emoji detection across the codebase.

## Type Safety

### Always Use Explicit Types

```typescript
// ✅ Correct
function processMessage(message: Message): void {
  // ...
}

// ❌ Incorrect
function processMessage(message: any): void {
  // ...
}
```

### Handle Null/Undefined

```typescript
// ✅ Correct
if (element) {
  element.style.display = 'none';
}

// ❌ Incorrect
element.style.display = 'none';  // TS2532: Object possibly 'undefined'
```

### Type Guards

```typescript
// ✅ Correct
function isMessage(obj: unknown): obj is Message {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}

if (isMessage(data)) {
  // TypeScript knows data is Message here
  console.log(data.id);
}
```

## Unused Variables

### Prefix with Underscore

For intentionally unused variables (e.g., kept for future use), prefix with `_`:

```typescript
// ✅ Correct
private _renderTopReply(...): string {
  // Intentionally unused, kept for future use
}

// ❌ Incorrect (causes TS6133 warning)
private renderTopReply(...): string {
  // Unused function
}
```

## File Organization

### Import Order

1. External dependencies
2. Internal types
3. Internal utilities
4. Internal services
5. Internal components

```typescript
// External
import type { Message } from '../types/index.js';

// Internal utilities
import { getEmojiMetadata } from '../utils/EmojiUtils.js';

// Internal services
import { messageStore } from '../services/MessageStore.js';
```

## Best Practices Summary

1. ✅ Use `Array.from(new Set())` for Set iteration
2. ✅ Prefer module exports over Window globals
3. ✅ Use `EmojiUtils` for emoji detection
4. ✅ Use explicit types, avoid `any`
5. ✅ Handle null/undefined with type guards
6. ✅ Prefix unused variables with `_`
7. ✅ Organize imports logically

