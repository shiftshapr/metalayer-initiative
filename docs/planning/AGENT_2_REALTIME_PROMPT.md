# Agent 2: Realtime & Subscriptions

**Priority:** HIGH  
**Objective:** Replace `any` types in realtime system (72 `any` types → target: ~15)

---

## 📁 Assigned Files

1. `presence/src/features/RealtimeManager.ts` (61 `any`)
2. `presence/src/services/RealtimeSubscriptionService.ts` (11 `any`)

---

## 🎯 Tasks

### 1. RealtimeManager.ts

**Current Issues:**
- `supabase?: any` - Supabase client not typed
- `(message: any) => void` - Message handlers not typed
- `(presence: any) => void` - Presence handlers not typed
- `channel: any` - Channel subscriptions not typed
- `aurasIntegration?: any` - Integration objects not typed

**Actions:**
1. **Type Supabase client:**
   - Import Supabase types: `import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'`
   - Replace `supabase?: any` → `supabase?: SupabaseClient`
   - Type channel: `channel: any` → `channel: RealtimeChannel`

2. **Type message handlers:**
   - Import `Message` from `types/index.ts`
   - Replace `(message: any) => void` → `(message: Message) => void`
   - Type all message-related callbacks

3. **Type presence handlers:**
   - Create `PresenceData` interface:
     ```typescript
     interface PresenceData {
       userId: string;
       status: 'online' | 'offline' | 'away' | 'busy';
       lastSeen?: Date;
       metadata?: Record<string, unknown>;
     }
     ```
   - Replace `(presence: any) => void` → `(presence: PresenceData) => void`

4. **Type integration objects:**
   - Create `AurasIntegration` interface:
     ```typescript
     interface AurasIntegration {
       updateAura?: (userId: string, auraColor: string) => void;
       getAura?: (userId: string) => Promise<string | null>;
     }
     ```
   - Replace `aurasIntegration?: any` → `aurasIntegration?: AurasIntegration`
   - Do the same for other integration objects

5. **Type event callbacks:**
   - Use typed event details from `types/events.ts`
   - Type all event handlers with proper event detail types

**Success:** All `any` replaced, Supabase types used, no compilation errors

---

### 2. RealtimeSubscriptionService.ts

**Current Issues:**
- `(data: any) => void` - Subscription callbacks not typed
- `(filter: any) => boolean` - Channel filters not typed
- `options?: any` - Subscription options not typed

**Actions:**
1. **Type subscription callbacks:**
   - Use `Message` type for message subscriptions
   - Use `PresenceData` for presence subscriptions
   - Replace `(data: any) => void` → `(data: Message | PresenceData) => void`

2. **Type channel filters:**
   - Create `ChannelFilter` type:
     ```typescript
     type ChannelFilter = (data: Message | PresenceData) => boolean;
     ```
   - Replace `(filter: any) => boolean` → `ChannelFilter`

3. **Type subscription options:**
   - Create `SubscriptionOptions` interface:
     ```typescript
     interface SubscriptionOptions {
       filter?: ChannelFilter;
       onError?: (error: Error) => void;
       onSubscribe?: () => void;
       onUnsubscribe?: () => void;
     }
     ```
   - Replace `options?: any` → `options?: SubscriptionOptions`

**Success:** All subscriptions typed, no `any` in callbacks

---

## ✅ RED-LINE Compliance

- ❌ NO snake_case in type names
- ❌ NO direct `window.property = value`
- ❌ NO `(window as any)`
- ✅ USE camelCase for all properties
- ✅ USE proper TypeScript types
- ✅ USE Supabase types from `@supabase/supabase-js`

---

## 🧪 Verification

After completion, run:
```bash
cd /home/ubuntu/metalayer-initiative
npx tsc --noEmit
grep -r ": any" presence/src/features/RealtimeManager.ts presence/src/services/RealtimeSubscriptionService.ts
```

**Target:** <15 `any` types remaining in these 2 files

---

## 📝 Notes

- Install Supabase types if needed: `npm install --save-dev @supabase/supabase-js`
- Check existing type definitions in `presence/src/types/`
- Use `Message` from `types/index.ts`
- Create new interfaces in appropriate type files
- Test compilation after each file



