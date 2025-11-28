# TypeScript Migration - Agent Prompts

## Overview
Convert remaining 28 JavaScript files to TypeScript with proper types, removing all RED-LINE violations (snake_case field names), and ensuring compilation success.

## Common Requirements (ALL AGENTS)
1. **Remove RED-LINE violations**: No `aura_color`, `user_id`, `created_at`, etc. Use camelCase only
2. **Add proper TypeScript types**: Interfaces, types, proper method signatures
3. **Remove window globals**: Export as ES modules, avoid `window.*` assignments
4. **Compile successfully**: Run `npx tsc --noEmit --skipLibCheck` and fix all errors
5. **Update sidepanel.html**: Change script tags from `*.js` to `dist/*.js` after conversion
6. **Preserve functionality**: All logic must remain identical, only add types

## Agent 1: Feature Modules (6 files)
**Files to convert:**
- `presence/features/AgentModule.js`
- `presence/features/ARCHIVED_MESSAGE_DISPLAY_BOTTOM_FIRST.js`
- `presence/features/AuthModule.js`
- `presence/features/DisplayNameManager.js`
- `presence/features/RealtimeManager.js`
- `presence/features/SettingsHeadlineManager.js`

**Output location:** `presence/src/features/*.ts`

**Special notes:**
- These are feature modules, likely more complex
- Check for dependencies on other modules
- Ensure proper imports from `../types/index.js`
- Update `sidepanel.html` to load from `dist/features/*.js`

**Prompt:**
```
Convert these 6 feature modules from JavaScript to TypeScript:
1. presence/features/AgentModule.js → presence/src/features/AgentModule.ts
2. presence/features/ARCHIVED_MESSAGE_DISPLAY_BOTTOM_FIRST.js → presence/src/features/ARCHIVED_MESSAGE_DISPLAY_BOTTOM_FIRST.ts
3. presence/features/AuthModule.js → presence/src/features/AuthModule.ts
4. presence/features/DisplayNameManager.js → presence/src/features/DisplayNameManager.ts
5. presence/features/RealtimeManager.js → presence/src/features/RealtimeManager.ts
6. presence/features/SettingsHeadlineManager.js → presence/src/features/SettingsHeadlineManager.ts

Requirements:
- Remove all RED-LINE violations (snake_case fields → camelCase)
- Add proper TypeScript types and interfaces
- Export as ES modules (no window globals)
- Ensure compilation: `npx tsc --noEmit --skipLibCheck presence/src/features/*.ts`
- Update sidepanel.html to load from dist/features/*.js
- Preserve all functionality

Start with the simplest file first, then work through the rest.
```

---

## Agent 2: Large Utility Modules (4 files)
**Files to convert:**
- `presence/utils/UnifiedStorageSync.js` (~632 lines)
- `presence/utils/ROOT_CAUSE_DIAGNOSTIC_FRAMEWORK.js` (~618 lines)
- `presence/utils/ComprehensiveDiagnostic.js` (~605 lines)
- `presence/utils/COMPREHENSIVE_LOADING_AND_REPLY_DIAGNOSTIC.js` (~512 lines)

**Output location:** `presence/src/utils/*.ts`

**Special notes:**
- These are large diagnostic/storage modules
- May have complex logic - preserve carefully
- Check for dependencies on other utilities

**Prompt:**
```
Convert these 4 large utility modules from JavaScript to TypeScript:
1. presence/utils/UnifiedStorageSync.js → presence/src/utils/UnifiedStorageSync.ts
2. presence/utils/ROOT_CAUSE_DIAGNOSTIC_FRAMEWORK.js → presence/src/utils/ROOT_CAUSE_DIAGNOSTIC_FRAMEWORK.ts
3. presence/utils/ComprehensiveDiagnostic.js → presence/src/utils/ComprehensiveDiagnostic.ts
4. presence/utils/COMPREHENSIVE_LOADING_AND_REPLY_DIAGNOSTIC.js → presence/src/utils/COMPREHENSIVE_LOADING_AND_REPLY_DIAGNOSTIC.ts

Requirements:
- Remove all RED-LINE violations (snake_case fields → camelCase)
- Add proper TypeScript types and interfaces
- Export as ES modules (no window globals)
- Ensure compilation: `npx tsc --noEmit --skipLibCheck presence/src/utils/*.ts`
- Update sidepanel.html if these are loaded there
- Preserve all functionality

These are large files - work carefully through each one.
```

---

## Agent 3: Medium Utility Modules - Diagnostics (4 files)
**Files to convert:**
- `presence/utils/THEME_AND_SETTINGS_DIAGNOSTIC.js` (~397 lines)
- `presence/utils/DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.js` (~371 lines)
- `presence/utils/MESSAGE_LOADING_DIAGNOSTIC.js` (~264 lines)
- `presence/utils/MESSAGE_VISIBILITY_DIAGNOSTIC.js` (~237 lines)

**Output location:** `presence/src/utils/*.ts`

**Prompt:**
```
Convert these 5 medium utility modules from JavaScript to TypeScript:
1. presence/utils/THEME_AND_SETTINGS_DIAGNOSTIC.js → presence/src/utils/THEME_AND_SETTINGS_DIAGNOSTIC.ts
2. presence/utils/DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.js → presence/src/utils/DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.ts
3. presence/utils/MESSAGE_LOADING_DIAGNOSTIC.js → presence/src/utils/MESSAGE_LOADING_DIAGNOSTIC.ts
4. presence/utils/MESSAGE_VISIBILITY_DIAGNOSTIC.js → presence/src/utils/MESSAGE_VISIBILITY_DIAGNOSTIC.ts
5. presence/utils/EnhancedLogger.js → presence/src/utils/EnhancedLogger.ts

Requirements:
- Remove all RED-LINE violations (snake_case fields → camelCase)
- Add proper TypeScript types and interfaces
- Export as ES modules (no window globals)
- Ensure compilation: `npx tsc --noEmit --skipLibCheck presence/src/utils/*.ts`
- Preserve all functionality
```

---

## Agent 4: Storage & Helper Utilities (4 files)
**Files to convert:**
- `presence/utils/UnifiedSettingsStorage.js` (~239 lines)
- `presence/utils/EnhancedLogger.js` (~244 lines)
- `presence/utils/AvatarConfig.js`
- `presence/utils/StatusDotHelper.js`

**Output location:** `presence/src/utils/*.ts`

**Prompt:**
```
Convert these 4 storage and helper utility modules from JavaScript to TypeScript:
1. presence/utils/UnifiedSettingsStorage.js → presence/src/utils/UnifiedSettingsStorage.ts
2. presence/utils/EnhancedLogger.js → presence/src/utils/EnhancedLogger.ts
3. presence/utils/AvatarConfig.js → presence/src/utils/AvatarConfig.ts
4. presence/utils/StatusDotHelper.js → presence/src/utils/StatusDotHelper.ts

Requirements:
- Remove all RED-LINE violations (snake_case fields → camelCase)
- Add proper TypeScript types and interfaces
- Export as ES modules (no window globals)
- Ensure compilation: `npx tsc --noEmit --skipLibCheck presence/src/utils/*.ts`
- Preserve all functionality
```

---

## Agent 5: Diagnostic Utilities - Batch 1 (5 files)
**Files to convert:**
- `presence/utils/DIAGNOSTIC_HEADLINE_DISPLAYNAME.js`
- `presence/utils/DIAGNOSTIC_LOADING_AND_REPLIES.js`
- `presence/utils/DIAGNOSTIC_THEME_SAVING.js`
- `presence/utils/DIAGNOSTIC_USER_ID_MESSAGES.js`
- `presence/utils/EMERGENCY_MESSAGE_FIX.js`

**Output location:** `presence/src/utils/*.ts`

**Prompt:**
```
Convert these 5 diagnostic utility modules from JavaScript to TypeScript:
1. presence/utils/DIAGNOSTIC_HEADLINE_DISPLAYNAME.js → presence/src/utils/DIAGNOSTIC_HEADLINE_DISPLAYNAME.ts
2. presence/utils/DIAGNOSTIC_LOADING_AND_REPLIES.js → presence/src/utils/DIAGNOSTIC_LOADING_AND_REPLIES.ts
3. presence/utils/DIAGNOSTIC_THEME_SAVING.js → presence/src/utils/DIAGNOSTIC_THEME_SAVING.ts
4. presence/utils/DIAGNOSTIC_USER_ID_MESSAGES.js → presence/src/utils/DIAGNOSTIC_USER_ID_MESSAGES.ts
5. presence/utils/EMERGENCY_MESSAGE_FIX.js → presence/src/utils/EMERGENCY_MESSAGE_FIX.ts

Requirements:
- Remove all RED-LINE violations (snake_case fields → camelCase)
- Add proper TypeScript types and interfaces
- Export as ES modules (no window globals)
- Ensure compilation: `npx tsc --noEmit --skipLibCheck presence/src/utils/*.ts`
- Preserve all functionality
```

---

## Agent 6: Diagnostic Utilities - Batch 2 (5 files)
**Files to convert:**
- `presence/utils/FOCUS_MODE_REPLY_DIAGNOSTIC.js`
- `presence/utils/FOCUS_MODE_REPLY_TRACE.js`
- `presence/utils/MESSAGE_DISPLAY_DIAGNOSTIC.js`
- `presence/utils/REPLY_DISPLAY_DIAGNOSTIC.js`
- `presence/utils/UserNameExtractor.js`

**Output location:** `presence/src/utils/*.ts`

**Prompt:**
```
Convert these final 5 utility modules from JavaScript to TypeScript:
1. presence/utils/FOCUS_MODE_REPLY_DIAGNOSTIC.js → presence/src/utils/FOCUS_MODE_REPLY_DIAGNOSTIC.ts
2. presence/utils/FOCUS_MODE_REPLY_TRACE.js → presence/src/utils/FOCUS_MODE_REPLY_TRACE.ts
3. presence/utils/MESSAGE_DISPLAY_DIAGNOSTIC.js → presence/src/utils/MESSAGE_DISPLAY_DIAGNOSTIC.ts
4. presence/utils/REPLY_DISPLAY_DIAGNOSTIC.js → presence/src/utils/REPLY_DISPLAY_DIAGNOSTIC.ts
5. presence/utils/UserNameExtractor.js → presence/src/utils/UserNameExtractor.ts

Requirements:
- Remove all RED-LINE violations (snake_case fields → camelCase)
- Add proper TypeScript types and interfaces
- Export as ES modules (no window globals)
- Ensure compilation: `npx tsc --noEmit --skipLibCheck presence/src/utils/*.ts`
- Preserve all functionality

Complete the migration!
```

---

## Verification (After All Agents Complete)
Run these commands to verify:
```bash
cd /home/ubuntu/metalayer-initiative
# Check compilation
npx tsc --noEmit --skipLibCheck

# Count remaining
echo "Remaining feature modules:"
ls -1 presence/features/*.js 2>/dev/null | while read f; do 
  base=$(basename "$f" .js)
  [ ! -f "presence/src/features/${base}.ts" ] && echo "  - $base"
done

echo "Remaining utility modules:"
ls -1 presence/utils/*.js 2>/dev/null | while read f; do 
  base=$(basename "$f" .js)
  [ ! -f "presence/src/utils/${base}.ts" ] && echo "  - $base"
done
```

