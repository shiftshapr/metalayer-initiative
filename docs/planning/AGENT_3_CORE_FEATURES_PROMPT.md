# Agent 3: Core Feature Modules

**Priority:** HIGH  
**Objective:** Replace `any` types in core features (50 `any` types → target: ~10)

---

## 📁 Assigned Files

1. `presence/src/features/CanopiModule.ts` (16 `any`)
2. `presence/src/features/AuthModule.ts` (14 `any`)
3. `presence/src/features/ProfileManager.ts` (20 `any`)

---

## 🎯 Tasks

### 1. CanopiModule.ts

**Current Issues:**
- `api?: any` - API client not typed
- `(message: any) => void` - Message handlers not typed
- `robustIntegration?: any` - Integration objects not typed
- `(element: any) => void` - UI callbacks not typed

**Actions:**
1. **Type API client:**
   - Import `ApiClient` from `services/APIService.ts` or create interface
   - Replace `api?: any` → `api?: ApiClient`
   - Type all API method calls

2. **Type message handlers:**
   - Import `Message` from `types/index.ts`
   - Replace `(message: any) => void` → `(message: Message) => void`
   - Type all message-related callbacks

3. **Type integration objects:**
   - Create `RobustIntegration` interface:
     ```typescript
     interface RobustIntegration {
       sendMessage?: (message: Message) => Promise<void>;
       updateMessage?: (messageId: string, updates: Partial<Message>) => Promise<void>;
       // ... other methods
     }
     ```
   - Replace `robustIntegration?: any` → `robustIntegration?: RobustIntegration`
   - Do the same for other integration objects

4. **Type UI callbacks:**
   - Replace `(element: any) => void` → `(element: HTMLElement) => void`
   - Type DOM manipulation methods

**Success:** All `any` replaced, integrations typed, no compilation errors

---

### 2. AuthModule.ts

**Current Issues:**
- `provider: any` - Auth providers not typed
- `user: any` - User data not typed
- `session: any` - Session data not typed
- `token: any` - OTP tokens not typed

**Actions:**
1. **Type auth providers:**
   - Create `AuthProvider` type union:
     ```typescript
     type AuthProvider = 'google' | 'email' | 'github' | 'discord';
     ```
   - Replace `provider: any` → `provider: AuthProvider`

2. **Type user data:**
   - Import `User` from `types/index.ts`
   - Replace `user: any` → `user: User`
   - Type all user-related operations

3. **Type session data:**
   - Create `Session` interface:
     ```typescript
     interface Session {
       accessToken: string;
       refreshToken?: string;
       expiresAt?: Date;
       user: User;
     }
     ```
   - Replace `session: any` → `session: Session`

4. **Type OTP verification:**
   - Replace `token: any` → `token: string`
   - Type OTP-related methods

**Success:** All auth operations typed, no `any` in user/session handling

---

### 3. ProfileManager.ts

**Current Issues:**
- `profile: any` - Profile data not typed
- `(profile: any) => void` - Update callbacks not typed
- `avatar: any` - Avatar data not typed
- `(prefs: any) => void` - Preference updates not typed

**Actions:**
1. **Type profile data:**
   - Create `UserProfile` interface:
     ```typescript
     interface UserProfile {
       id: string;
       email?: string;
       name?: string;
       avatarUrl?: string;
       auraColor?: string;
       displayName?: string;
       // ... other profile fields
     }
     ```
   - Replace `profile: any` → `profile: UserProfile`
   - **CRITICAL:** Use camelCase (no `user_id`, `aura_color`)

2. **Type update callbacks:**
   - Replace `(profile: any) => void` → `(profile: UserProfile) => void`
   - Type all profile update handlers

3. **Type avatar data:**
   - Create `AvatarData` interface:
     ```typescript
     interface AvatarData {
       url?: string;
       color?: string;
       initials?: string;
     }
     ```
   - Replace `avatar: any` → `avatar: AvatarData`

4. **Type preference updates:**
   - Import `Preferences` from `types/index.ts` if available
   - Replace `(prefs: any) => void` → `(prefs: Preferences) => void`

**Success:** All profile operations typed, RED-LINE compliant (camelCase only)

---

## ✅ RED-LINE Compliance

- ❌ NO snake_case in type names (especially `user_id`, `aura_color`)
- ❌ NO direct `window.property = value`
- ❌ NO `(window as any)`
- ✅ USE camelCase for all properties (`userId`, `auraColor`)
- ✅ USE proper TypeScript types

---

## 🧪 Verification

After completion, run:
```bash
cd /home/ubuntu/metalayer-initiative
npx tsc --noEmit
grep -r ": any" presence/src/features/CanopiModule.ts presence/src/features/AuthModule.ts presence/src/features/ProfileManager.ts
grep -ri "user_id\|aura_color" presence/src/features/ProfileManager.ts  # Should return nothing
```

**Target:** <10 `any` types remaining, 0 snake_case violations

---

## 📝 Notes

- Check existing type definitions in `presence/src/types/`
- Use `User`, `Message` from `types/index.ts`
- **CRITICAL:** ProfileManager must use camelCase (RED-LINE violation risk)
- Test compilation after each file



