# Agent 6: Diagnostic Utilities

**Priority:** LOW  
**Objective:** Replace `any` types in diagnostic utilities (60 `any` types → target: ~12)

---

## 📁 Assigned Files

1. `presence/src/utils/ROOT_CAUSE_DIAGNOSTIC_FRAMEWORK.ts` (14 `any`)
2. `presence/src/utils/ComprehensiveDiagnostic.ts` (14 `any`)
3. `presence/src/utils/DIAGNOSTIC_LOADING_AND_REPLIES.ts` (11 `any`)
4. `presence/src/utils/COMPREHENSIVE_LOADING_AND_REPLY_DIAGNOSTIC.ts` (8 `any`)
5. `presence/src/utils/provenance/ProvenanceService.ts` (10 `any`)
6. `presence/src/utils/provenance/ProvenanceDiagnostic.ts` (5 `any`)

---

## 🎯 Tasks

### 1. Diagnostic Framework Files

**Current Issues:**
- `results: any` - Diagnostic results not typed
- `options?: any` - Diagnostic options not typed
- `(result: any) => void` - Diagnostic callbacks not typed
- `data: any` - Test data not typed

**Actions:**
1. **Type diagnostic results:**
   - Check `utils/diagnostics/types.ts` for existing diagnostic result types
   - Use existing types: `MessageDisplayDiagnosticResult`, `ComprehensiveFormattingDiagnosticResult`, `RootCauseDiagnosticResult`
   - Replace `results: any` → use appropriate result type

2. **Type diagnostic options:**
   - Create `DiagnosticOptions` interface:
     ```typescript
     interface DiagnosticOptions {
       verbose?: boolean;
       includeDetails?: boolean;
       timeout?: number;
       onProgress?: (progress: number) => void;
     }
     ```
   - Replace `options?: any` → `options?: DiagnosticOptions`

3. **Type diagnostic callbacks:**
   - Use typed result interfaces from `utils/diagnostics/types.ts`
   - Replace `(result: any) => void` → `(result: DiagnosticResultType) => void`

4. **Type test data:**
   - Create specific test data interfaces for each diagnostic:
     ```typescript
     interface MessageTestData {
       messageId: string;
       content: string;
       authorId: string;
       // ... other test properties
     }
     ```
   - Replace `data: any` → use appropriate test data type

**Success:** All diagnostics use typed results, no `any` in test data

---

### 2. Provenance Files

**Current Issues:**
- `data: any` - Provenance data not typed
- `result: any` - Verification results not typed
- `link: any` - Provenance links not typed

**Actions:**
1. **Type provenance data:**
   - Check `types/provenance.ts` for existing `ProvenanceData` type
   - If exists, import and use it
   - If not, create `ProvenanceData` interface:
     ```typescript
     interface ProvenanceData {
       id: string;
       timestamp: Date;
       source: string;
       metadata?: Record<string, unknown>;
     }
     ```
   - Replace `data: any` → `data: ProvenanceData`

2. **Type verification results:**
   - Create `VerificationResult` interface:
     ```typescript
     interface VerificationResult {
       isValid: boolean;
       errors?: string[];
       warnings?: string[];
       metadata?: Record<string, unknown>;
     }
     ```
   - Replace `result: any` → `result: VerificationResult`

3. **Type provenance links:**
   - Check `types/provenance.ts` for existing `ProvenanceLink` type
   - If exists, import and use it
   - If not, create `ProvenanceLink` interface:
     ```typescript
     interface ProvenanceLink {
       id: string;
       url: string;
       type: 'message' | 'user' | 'community';
       metadata?: Record<string, unknown>;
     }
     ```
   - Replace `link: any` → `link: ProvenanceLink`

**Success:** All provenance operations typed, uses types from `types/provenance.ts`

---

## ✅ RED-LINE Compliance

- ❌ NO snake_case in type names
- ❌ NO direct `window.property = value`
- ❌ NO `(window as any)`
- ✅ USE camelCase for all properties
- ✅ USE existing diagnostic type definitions
- ✅ USE existing provenance type definitions

---

## 🧪 Verification

After completion, run:
```bash
cd /home/ubuntu/metalayer-initiative
npx tsc --noEmit
grep -r ": any" presence/src/utils/ROOT_CAUSE_DIAGNOSTIC_FRAMEWORK.ts presence/src/utils/ComprehensiveDiagnostic.ts presence/src/utils/DIAGNOSTIC_LOADING_AND_REPLIES.ts presence/src/utils/COMPREHENSIVE_LOADING_AND_REPLY_DIAGNOSTIC.ts presence/src/utils/provenance/
```

**Target:** <12 `any` types remaining in these 6 files

---

## 📝 Notes

- **IMPORTANT:** Check `utils/diagnostics/types.ts` for existing diagnostic result types
- **IMPORTANT:** Check `types/provenance.ts` for existing provenance types
- Leverage existing type definitions - don't recreate them
- Test compilation after each file


