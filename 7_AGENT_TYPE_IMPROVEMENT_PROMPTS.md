# 7-Agent Type Improvement Plan

**Objective:** Systematically reduce `any` types across the codebase (443 remaining)  
**Strategy:** Parallel work on 7 balanced groups  
**Status:** Ready for agent assignment

---

## 📊 Current State

- ✅ **0** `(window as any)` usages (100% eliminated!)
- ⏳ **443** `: any` type annotations remaining
- **120** TypeScript files total

---

## 🎯 Agent Assignments

### **Agent 1: Core Services & State Management**
**Priority:** HIGH  
**Files (3 files, ~48 `any` types):**
- `presence/src/core/StateManager.ts` (24 `any`)
- `presence/src/core/EventBus.ts` (9 `any`)
- `presence/src/services/MessageStore.ts` (11 `any`)

**Tasks:**
1. Replace `any` in `StateManager.ts`:
   - Type the state storage map: `Map<string, any>` → `Map<string, StateValue>`
   - Create `StateValue` type union: `string | number | boolean | object | null | undefined`
   - Type event callbacks: `(value: any) => void` → `(value: StateValue) => void`
   - Type `getState`, `setState` methods with generics where appropriate

2. Replace `any` in `EventBus.ts`:
   - Type event handlers: `(data: any) => void` → use typed event system from `types/events.ts`
   - Create event type map for internal events
   - Type `emit`, `on`, `off` methods with event type constraints

3. Replace `any` in `MessageStore.ts`:
   - Type message callbacks: `(messages: any[]) => void` → `(messages: Message[]) => void`
   - Type filter functions: `(msg: any) => boolean` → `(msg: Message) => boolean`
   - Ensure `Message` type is imported from `types/index.ts`

**Success Criteria:**
- All `any` types replaced with specific types
- No compilation errors
- Type safety improved for state management operations
- Event system uses typed events

**RED-LINE Compliance:**
- ✅ No snake_case in type names
- ✅ Use camelCase for all properties
- ✅ No `window` global assignments

---

### **Agent 2: Realtime & Subscriptions**
**Priority:** HIGH  
**Files (2 files, ~72 `any` types):**
- `presence/src/features/RealtimeManager.ts` (61 `any`)
- `presence/src/services/RealtimeSubscriptionService.ts` (11 `any`)

**Tasks:**
1. Replace `any` in `RealtimeManager.ts`:
   - Type Supabase client: `supabase?: any` → import proper Supabase types
   - Type message handlers: `(message: any) => void` → `(message: Message) => void`
   - Type presence handlers: `(presence: any) => void` → create `PresenceData` interface
   - Type channel subscriptions: `channel: any` → use Supabase Realtime types
   - Type event callbacks with proper event detail types
   - Type integration objects: `aurasIntegration?: any` → create `AurasIntegration` interface

2. Replace `any` in `RealtimeSubscriptionService.ts`:
   - Type subscription callbacks: `(data: any) => void` → use typed message/presence types
   - Type channel filters: `(filter: any) => boolean` → create `ChannelFilter` type
   - Type subscription options: `options?: any` → create `SubscriptionOptions` interface

**Success Criteria:**
- All `any` types replaced with specific types
- Supabase types properly imported and used
- Message and presence data fully typed
- No compilation errors

**RED-LINE Compliance:**
- ✅ No snake_case in type names
- ✅ Use camelCase for all properties
- ✅ No direct `window` property assignments

---

### **Agent 3: Core Feature Modules**
**Priority:** HIGH  
**Files (3 files, ~50 `any` types):**
- `presence/src/features/CanopiModule.ts` (16 `any`)
- `presence/src/features/AuthModule.ts` (14 `any`)
- `presence/src/features/ProfileManager.ts` (20 `any`)

**Tasks:**
1. Replace `any` in `CanopiModule.ts`:
   - Type API client: `api?: any` → use `ApiClient` type from services
   - Type message handlers: `(message: any) => void` → `(message: Message) => void`
   - Type integration objects: `robustIntegration?: any` → create specific integration interfaces
   - Type UI callbacks: `(element: any) => void` → `(element: HTMLElement) => void`

2. Replace `any` in `AuthModule.ts`:
   - Type auth providers: `provider: any` → create `AuthProvider` type union
   - Type user data: `user: any` → use `User` type from `types/index.ts`
   - Type session data: `session: any` → create `Session` interface
   - Type OTP verification: `token: any` → `token: string`

3. Replace `any` in `ProfileManager.ts`:
   - Type profile data: `profile: any` → create `UserProfile` interface
   - Type update callbacks: `(profile: any) => void` → `(profile: UserProfile) => void`
   - Type avatar data: `avatar: any` → create `AvatarData` interface
   - Type preference updates: `(prefs: any) => void` → use `Preferences` type

**Success Criteria:**
- All `any` types replaced with specific types
- User, profile, and auth data fully typed
- No compilation errors
- Integration objects properly typed

**RED-LINE Compliance:**
- ✅ No snake_case in type names (especially `user_id`, `aura_color`)
- ✅ Use camelCase for all properties
- ✅ No direct `window` property assignments

---

### **Agent 4: UI & Visibility Features**
**Priority:** MEDIUM  
**Files (4 files, ~38 `any` types):**
- `presence/src/features/VisibilityManager.ts` (12 `any`)
- `presence/src/features/UIManager.ts` (9 `any`)
- `presence/src/features/NotificationManager.ts` (7 `any`)
- `presence/src/features/VisibilitySettingsManager.ts` (5 `any`)

**Tasks:**
1. Replace `any` in `VisibilityManager.ts`:
   - Type visibility data: `data: any` → create `VisibilityData` interface
   - Type avatar arrays: `avatars: any[]` → `avatars: AvatarData[]`
   - Type update callbacks: `(update: any) => void` → `(update: VisibilityUpdate) => void`

2. Replace `any` in `UIManager.ts`:
   - Type UI state: `state: any` → create `UIState` interface
   - Type tab data: `tab: any` → create `TabData` interface
   - Type render callbacks: `(element: any) => void` → `(element: HTMLElement) => void`

3. Replace `any` in `NotificationManager.ts`:
   - Type notification data: `notification: any` → use `Notification` type from `types/notifications.ts`
   - Type notification options: `options?: any` → create `NotificationOptions` interface

4. Replace `any` in `VisibilitySettingsManager.ts`:
   - Type settings data: `settings: any` → use `Preferences` type
   - Type update handlers: `(settings: any) => void` → `(settings: Preferences) => void`

**Success Criteria:**
- All `any` types replaced with specific types
- UI and visibility data fully typed
- Notification system uses typed notifications
- No compilation errors

**RED-LINE Compliance:**
- ✅ No snake_case in type names
- ✅ Use camelCase for all properties
- ✅ No direct `window` property assignments

---

### **Agent 5: Logging & Error Handling**
**Priority:** MEDIUM  
**Files (3 files, ~42 `any` types):**
- `presence/src/utils/Logger.ts` (19 `any`)
- `presence/src/utils/EnhancedLogger.ts` (15 `any`)
- `presence/src/utils/ErrorHandler.ts` (8 `any`)

**Tasks:**
1. Replace `any` in `Logger.ts`:
   - Type log data: `data: any` → create `LogData` type union
   - Type log metadata: `meta?: any` → create `LogMetadata` interface
   - Type log formatters: `(data: any) => string` → `(data: LogData) => string`

2. Replace `any` in `EnhancedLogger.ts`:
   - Type log entries: `entry: any` → create `LogEntry` interface
   - Type log filters: `(entry: any) => boolean` → `(entry: LogEntry) => boolean`
   - Type log transformers: `(entry: any) => any` → use generics

3. Replace `any` in `ErrorHandler.ts`:
   - Type error data: `error: any` → use `Error | unknown`
   - Type error context: `context?: any` → create `ErrorContext` interface
   - Type error handlers: `(error: any) => void` → `(error: Error | unknown) => void`

**Success Criteria:**
- All `any` types replaced with specific types
- Logging system fully typed
- Error handling uses proper error types
- No compilation errors

**RED-LINE Compliance:**
- ✅ No snake_case in type names
- ✅ Use camelCase for all properties
- ✅ Proper error type handling (not `any`)

---

### **Agent 6: Diagnostic Utilities**
**Priority:** LOW  
**Files (6 files, ~60 `any` types):**
- `presence/src/utils/ROOT_CAUSE_DIAGNOSTIC_FRAMEWORK.ts` (14 `any`)
- `presence/src/utils/ComprehensiveDiagnostic.ts` (14 `any`)
- `presence/src/utils/DIAGNOSTIC_LOADING_AND_REPLIES.ts` (11 `any`)
- `presence/src/utils/COMPREHENSIVE_LOADING_AND_REPLY_DIAGNOSTIC.ts` (8 `any`)
- `presence/src/utils/provenance/ProvenanceService.ts` (10 `any`)
- `presence/src/utils/provenance/ProvenanceDiagnostic.ts` (5 `any`)

**Tasks:**
1. Replace `any` in diagnostic files:
   - Type diagnostic results: `results: any` → use existing diagnostic result types from `utils/diagnostics/types.ts`
   - Type diagnostic options: `options?: any` → create `DiagnosticOptions` interface
   - Type diagnostic callbacks: `(result: any) => void` → use typed result interfaces
   - Type test data: `data: any` → create specific test data interfaces

2. Replace `any` in provenance files:
   - Type provenance data: `data: any` → use `ProvenanceData` from `types/provenance.ts`
   - Type verification results: `result: any` → create `VerificationResult` interface
   - Type provenance links: `link: any` → use `ProvenanceLink` type

**Success Criteria:**
- All `any` types replaced with specific types
- Diagnostic results use existing typed interfaces
- Provenance system fully typed
- No compilation errors

**RED-LINE Compliance:**
- ✅ No snake_case in type names
- ✅ Use camelCase for all properties
- ✅ Leverage existing diagnostic type definitions

---

### **Agent 7: Types, Global, & Remaining Files**
**Priority:** MEDIUM  
**Files (10+ files, ~133 `any` types):**
- `presence/src/types/index.ts` (17 `any`)
- `presence/src/types/global.d.ts` (39 `any` - strategic reduction)
- `presence/src/features/APIModule.ts` (10 `any`)
- `presence/src/utils/UserPreferencesManager.ts` (6 `any`)
- `presence/src/utils/ReplyLoader.ts` (4 `any`)
- `presence/src/features/CommunitiesModule.ts` (5 `any`)
- `presence/src/features/UserHoverModal.ts` (5 `any`)
- `presence/src/utils/patches/ChatLoadingOverlayPatch.ts` (5 `any`)
- `presence/src/utils/provenance/init.ts` (4 `any`)
- Plus remaining smaller files

**Tasks:**
1. Strategic `any` reduction in `global.d.ts`:
   - Replace `?: any` with more specific types where possible
   - Create interfaces for integration objects (e.g., `AurasIntegration`, `RobustIntegration`)
   - Type diagnostic functions with proper return types
   - Keep `any` only where truly dynamic (e.g., `[key: string]: any`)

2. Replace `any` in `types/index.ts`:
   - Type exports: ensure all exported types are specific
   - Remove `any` from type unions where possible

3. Replace `any` in remaining feature files:
   - `APIModule.ts`: Type API responses with `ApiResponse<T>` from `types/api.ts`
   - `CommunitiesModule.ts`: Type community data with `Community` interface
   - `UserHoverModal.ts`: Type user data with `User` type

4. Replace `any` in remaining utility files:
   - `UserPreferencesManager.ts`: Type preference values (already partially done)
   - `ReplyLoader.ts`: Type reply data with `Message` type
   - `ChatLoadingOverlayPatch.ts`: Type patch data

**Success Criteria:**
- Strategic reduction of `any` in `global.d.ts` (target: 20-25 remaining for truly dynamic cases)
- All other files have `any` replaced with specific types
- No compilation errors
- Global types are more specific where possible

**RED-LINE Compliance:**
- ✅ No snake_case in type names
- ✅ Use camelCase for all properties
- ✅ Strategic use of `any` only for truly dynamic cases

---

## 📋 General Instructions for All Agents

### Before Starting
1. Read the assigned files completely
2. Understand the context and dependencies
3. Check existing type definitions in `presence/src/types/`
4. Review `global.d.ts` for available global types

### During Work
1. **Replace `any` systematically:**
   - Start with function parameters and return types
   - Then handle object properties
   - Finally handle generic constraints

2. **Create new types when needed:**
   - Add interfaces to appropriate files in `presence/src/types/`
   - Export from `types/index.ts` if used across modules
   - Use descriptive, camelCase names

3. **Use existing types:**
   - Import `Message`, `User`, `Preferences` from `types/index.ts`
   - Use `ApiResponse<T>` from `types/api.ts`
   - Use typed events from `types/events.ts`

4. **Test as you go:**
   - Run `npx tsc --noEmit` after each file
   - Fix compilation errors immediately
   - Ensure no breaking changes

### After Completion
1. Run full TypeScript compilation: `npx tsc --noEmit`
2. Count remaining `any` types in your files: `grep -r ": any" presence/src/[your-files]`
3. Document what types were created/updated
4. Report any issues or questions

### RED-LINE Rules (STRICT)
- ❌ **NO** snake_case in type names (e.g., `user_id`, `aura_color`)
- ❌ **NO** direct `window.property = value` assignments
- ❌ **NO** `(window as any)` usage
- ✅ **USE** camelCase for all properties
- ✅ **USE** proper TypeScript types
- ✅ **USE** type assertions only when necessary: `(window as Window & { property?: Type })`

---

## 📊 Success Metrics

**Target:** Reduce `any` types from 443 to <200 (55% reduction)

**Per Agent:**
- Agent 1: 48 → ~10 (79% reduction)
- Agent 2: 72 → ~15 (79% reduction)
- Agent 3: 50 → ~10 (80% reduction)
- Agent 4: 38 → ~8 (79% reduction)
- Agent 5: 42 → ~8 (81% reduction)
- Agent 6: 60 → ~12 (80% reduction)
- Agent 7: 133 → ~30 (77% reduction, includes strategic `global.d.ts`)

**Total Target:** 443 → ~93 (79% reduction)

---

## 🚀 Ready for Agent Assignment

Each agent should:
1. Read their assigned section above
2. Start with the highest-priority files
3. Work systematically through the list
4. Report progress and any blockers
5. Ensure RED-LINE compliance throughout

**Good luck! 🎯**


