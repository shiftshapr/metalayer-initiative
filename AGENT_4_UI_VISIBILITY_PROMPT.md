# Agent 4: UI & Visibility Features

**Priority:** MEDIUM  
**Objective:** Replace `any` types in UI/visibility features (38 `any` types → target: ~8)

---

## 📁 Assigned Files

1. `presence/src/features/VisibilityManager.ts` (12 `any`)
2. `presence/src/features/UIManager.ts` (9 `any`)
3. `presence/src/features/NotificationManager.ts` (7 `any`)
4. `presence/src/features/VisibilitySettingsManager.ts` (5 `any`)

---

## 🎯 Tasks

### 1. VisibilityManager.ts

**Current Issues:**
- `data: any` - Visibility data not typed
- `avatars: any[]` - Avatar arrays not typed
- `(update: any) => void` - Update callbacks not typed

**Actions:**
1. **Type visibility data:**
   - Create `VisibilityData` interface:
     ```typescript
     interface VisibilityData {
       userId: string;
       isVisible: boolean;
       lastSeen?: Date;
       status?: 'online' | 'offline' | 'away' | 'busy';
     }
     ```
   - Replace `data: any` → `data: VisibilityData`

2. **Type avatar arrays:**
   - Create `AvatarData` interface:
     ```typescript
     interface AvatarData {
       userId: string;
       url?: string;
       color?: string;
       initials?: string;
       status?: 'online' | 'offline' | 'away' | 'busy';
     }
     ```
   - Replace `avatars: any[]` → `avatars: AvatarData[]`

3. **Type update callbacks:**
   - Create `VisibilityUpdate` interface:
     ```typescript
     interface VisibilityUpdate {
       userId: string;
       isVisible: boolean;
       timestamp: Date;
     }
     ```
   - Replace `(update: any) => void` → `(update: VisibilityUpdate) => void`

**Success:** All visibility operations typed, no `any` in data handling

---

### 2. UIManager.ts

**Current Issues:**
- `state: any` - UI state not typed
- `tab: any` - Tab data not typed
- `(element: any) => void` - Render callbacks not typed

**Actions:**
1. **Type UI state:**
   - Create `UIState` interface:
     ```typescript
     interface UIState {
       currentTab?: string;
       isInitialized: boolean;
       theme?: 'light' | 'dark' | 'auto';
       // ... other UI state properties
     }
     ```
   - Replace `state: any` → `state: UIState`

2. **Type tab data:**
   - Create `TabData` interface:
     ```typescript
     interface TabData {
       id: string;
       name: string;
       element: HTMLElement;
       isActive: boolean;
     }
     ```
   - Replace `tab: any` → `tab: TabData`

3. **Type render callbacks:**
   - Replace `(element: any) => void` → `(element: HTMLElement) => void`
   - Type all DOM manipulation methods

**Success:** All UI operations typed, no `any` in state/tab handling

---

### 3. NotificationManager.ts

**Current Issues:**
- `notification: any` - Notification data not typed
- `options?: any` - Notification options not typed

**Actions:**
1. **Type notification data:**
   - Check `types/notifications.ts` for existing `Notification` type
   - If exists, import and use it
   - If not, create `Notification` interface:
     ```typescript
     interface Notification {
       id: string;
       message: string;
       type?: 'info' | 'success' | 'warning' | 'error';
       timestamp: Date;
       // ... other notification properties
     }
     ```
   - Replace `notification: any` → `notification: Notification`

2. **Type notification options:**
   - Create `NotificationOptions` interface:
     ```typescript
     interface NotificationOptions {
       duration?: number;
       position?: 'top' | 'bottom' | 'center';
       dismissible?: boolean;
       // ... other options
     }
     ```
   - Replace `options?: any` → `options?: NotificationOptions`

**Success:** Notification system uses typed notifications

---

### 4. VisibilitySettingsManager.ts

**Current Issues:**
- `settings: any` - Settings data not typed
- `(settings: any) => void` - Update handlers not typed

**Actions:**
1. **Type settings data:**
   - Import `Preferences` from `types/index.ts` if available
   - Or use `UserPreferencesManager` types
   - Replace `settings: any` → `settings: Preferences`

2. **Type update handlers:**
   - Replace `(settings: any) => void` → `(settings: Preferences) => void`
   - Type all settings update methods

**Success:** All settings operations typed, uses `Preferences` type

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
grep -r ": any" presence/src/features/VisibilityManager.ts presence/src/features/UIManager.ts presence/src/features/NotificationManager.ts presence/src/features/VisibilitySettingsManager.ts
```

**Target:** <8 `any` types remaining in these 4 files

---

## 📝 Notes

- Check existing type definitions in `presence/src/types/`
- Use `Preferences` from `types/index.ts` if available
- Check `types/notifications.ts` for notification types
- Test compilation after each file


