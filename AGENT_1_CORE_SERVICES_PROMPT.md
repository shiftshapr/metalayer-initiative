# Agent 1: Core Services & State Management

**Priority:** HIGH  
**Objective:** Replace `any` types in core services (48 `any` types → target: ~10)

---

## 📁 Assigned Files

1. `presence/src/core/StateManager.ts` (24 `any`)
2. `presence/src/core/EventBus.ts` (9 `any`)
3. `presence/src/services/MessageStore.ts` (11 `any`)

---

## 🎯 Tasks

### 1. StateManager.ts

**Current Issues:**
- `Map<string, any>` for state storage
- `(value: any) => void` for event callbacks
- `getState`, `setState` methods use `any`

**Actions:**
1. Create `StateValue` type union:
   ```typescript
   type StateValue = string | number | boolean | object | null | undefined;
   ```
2. Replace `Map<string, any>` → `Map<string, StateValue>`
3. Type callbacks: `(value: any) => void` → `(value: StateValue) => void`
4. Add generics to `getState<T>()` where type can be inferred
5. Type `setState` with proper value constraints

**Success:** All `any` replaced, no compilation errors

---

### 2. EventBus.ts

**Current Issues:**
- `(data: any) => void` for event handlers
- Event system not using typed events

**Actions:**
1. Import typed event system from `types/events.ts`
2. Create internal event type map:
   ```typescript
   interface InternalEventMap {
     'stateChanged': { key: string; value: StateValue };
     'messageReceived': { message: Message };
     // ... other internal events
   }
   ```
3. Type `emit`, `on`, `off` with event type constraints
4. Replace `(data: any) => void` → use typed event details

**Success:** Event system uses typed events, no `any` in handlers

---

### 3. MessageStore.ts

**Current Issues:**
- `(messages: any[]) => void` for callbacks
- `(msg: any) => boolean` for filters

**Actions:**
1. Import `Message` type from `types/index.ts`
2. Replace `(messages: any[]) => void` → `(messages: Message[]) => void`
3. Replace `(msg: any) => boolean` → `(msg: Message) => boolean`
4. Type all message-related methods with `Message` type

**Success:** All message operations use `Message` type

---

## ✅ RED-LINE Compliance

- ❌ NO snake_case in type names
- ❌ NO direct `window.property = value`
- ❌ NO `(window as any)`
- ✅ USE camelCase for all properties
- ✅ USE proper TypeScript types

---

## 🧪 Verification

After completion, run:
```bash
cd /home/ubuntu/metalayer-initiative
npx tsc --noEmit
grep -r ": any" presence/src/core/StateManager.ts presence/src/core/EventBus.ts presence/src/services/MessageStore.ts
```

**Target:** <10 `any` types remaining in these 3 files

---

## 📝 Notes

- Check existing type definitions in `presence/src/types/`
- Use `Message` from `types/index.ts`
- Use typed events from `types/events.ts`
- Test compilation after each file


