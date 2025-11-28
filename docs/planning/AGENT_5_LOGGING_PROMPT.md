# Agent 5: Logging & Error Handling

**Priority:** MEDIUM  
**Objective:** Replace `any` types in logging/error handling (42 `any` types → target: ~8)

---

## 📁 Assigned Files

1. `presence/src/utils/Logger.ts` (19 `any`)
2. `presence/src/utils/EnhancedLogger.ts` (15 `any`)
3. `presence/src/utils/ErrorHandler.ts` (8 `any`)

---

## 🎯 Tasks

### 1. Logger.ts

**Current Issues:**
- `data: any` - Log data not typed
- `meta?: any` - Log metadata not typed
- `(data: any) => string` - Log formatters not typed

**Actions:**
1. **Type log data:**
   - Create `LogData` type union:
     ```typescript
     type LogData = string | number | boolean | object | Error | null | undefined;
     ```
   - Replace `data: any` → `data: LogData`
   - Handle different data types in log methods

2. **Type log metadata:**
   - Create `LogMetadata` interface:
     ```typescript
     interface LogMetadata {
       timestamp?: Date;
       level?: 'debug' | 'info' | 'warn' | 'error';
       context?: string;
       userId?: string;
       [key: string]: unknown; // Allow additional metadata
     }
     ```
   - Replace `meta?: any` → `meta?: LogMetadata`

3. **Type log formatters:**
   - Replace `(data: any) => string` → `(data: LogData) => string`
   - Type all formatting functions

**Success:** All log operations typed, no `any` in data/metadata

---

### 2. EnhancedLogger.ts

**Current Issues:**
- `entry: any` - Log entries not typed
- `(entry: any) => boolean` - Log filters not typed
- `(entry: any) => any` - Log transformers not typed

**Actions:**
1. **Type log entries:**
   - Create `LogEntry` interface:
     ```typescript
     interface LogEntry {
       id: string;
       level: 'debug' | 'info' | 'warn' | 'error';
       message: string;
       data?: LogData;
       metadata?: LogMetadata;
       timestamp: Date;
     }
     ```
   - Replace `entry: any` → `entry: LogEntry`
   - Type all entry-related operations

2. **Type log filters:**
   - Replace `(entry: any) => boolean` → `(entry: LogEntry) => boolean`
   - Type all filter functions

3. **Type log transformers:**
   - Use generics for transformers:
     ```typescript
     type LogTransformer<T = LogEntry> = (entry: LogEntry) => T;
     ```
   - Replace `(entry: any) => any` → `LogTransformer<T>`

**Success:** All enhanced logging operations typed, generics used

---

### 3. ErrorHandler.ts

**Current Issues:**
- `error: any` - Error data not typed
- `context?: any` - Error context not typed
- `(error: any) => void` - Error handlers not typed

**Actions:**
1. **Type error data:**
   - Replace `error: any` → `error: Error | unknown`
   - Use proper error handling:
     ```typescript
     if (error instanceof Error) {
       // Handle Error instance
     } else {
       // Handle unknown error
     }
     ```

2. **Type error context:**
   - Create `ErrorContext` interface:
     ```typescript
     interface ErrorContext {
       userId?: string;
       action?: string;
       component?: string;
       metadata?: Record<string, unknown>;
     }
     ```
   - Replace `context?: any` → `context?: ErrorContext`

3. **Type error handlers:**
   - Replace `(error: any) => void` → `(error: Error | unknown) => void`
   - Type all error handling callbacks

**Success:** All error handling typed, proper error type handling

---

## ✅ RED-LINE Compliance

- ❌ NO snake_case in type names
- ❌ NO direct `window.property = value`
- ❌ NO `(window as any)`
- ✅ USE camelCase for all properties
- ✅ USE proper error types (not `any`)

---

## 🧪 Verification

After completion, run:
```bash
cd /home/ubuntu/metalayer-initiative
npx tsc --noEmit
grep -r ": any" presence/src/utils/Logger.ts presence/src/utils/EnhancedLogger.ts presence/src/utils/ErrorHandler.ts
```

**Target:** <8 `any` types remaining in these 3 files

---

## 📝 Notes

- Check existing type definitions in `presence/src/types/`
- Use `Error | unknown` for error handling (TypeScript best practice)
- Use generics where appropriate for transformers
- Test compilation after each file



