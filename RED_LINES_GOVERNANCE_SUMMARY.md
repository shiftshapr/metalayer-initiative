# Red Lines & Critical Rules - Governance Summary

## Collection Information
- **Collection ID:** `6bf843fb-e292-479c-a5c5-7a5d1fff3504`
- **Collection Name:** Red Lines & Critical Rules
- **Description:** Absolute rules that must NEVER be violated. Zero exceptions. Critical constraints for code, architecture, and patterns. Must be followed by all agents.

## Severity Levels for Hybrid Compliance

Each rule includes a severity level that Blue Hat (Audit and Oversight Agent) uses for enforcement:

- **"critical"** → Any breach halts orchestration immediately
- **"moderate"** → Breach logs a warning but allows workflow continuation
- **"low"** → Breach logs silently for later review

## Rules Summary

### 1. UUID Usage
- **Memory ID:** `856f2f8c-5784-4a57-bb5b-c4505a3fdae6`
- **Severity:** critical
- **Rule:** MUST ALWAYS use UUID for user identification. NO EXCEPTIONS.
- **Reason:** User identification inconsistencies break authentication, data integrity, and cross-profile synchronization.

### 2. COMP Method Architecture
- **Memory ID:** `94788944-dc52-41fe-b809-835de79a214b`
- **Severity:** critical
- **Rule:** Must maintain modular architecture. Do NOT create new modules unless explicitly given permission.
- **Reason:** Architecture violations cause technical debt, coupling issues, and make system unmaintainable.

### 3. Sidepanel Minimalism
- **Memory ID:** `a9dca175-784e-45d3-a95c-a066fb530108`
- **Severity:** critical
- **Rule:** sidepanel.js must remain orchestration-only. It should NOT contain feature logic.
- **Reason:** Mixing orchestration and feature logic violates separation of concerns and makes system architecture impossible to maintain.

### 4. API Request Body Handling
- **Memory ID:** `1f4c1d50-1e8d-42bc-b46a-b389b49c24cd`
- **Severity:** critical
- **Rule:** When using fetch API with object bodies, MUST extract body/headers BEFORE spreading options.
- **Reason:** API failures break core functionality and cause user-facing errors that cannot be recovered from without code fixes.

### 5. Do Not Refresh From API After Local Updates
- **Memory ID:** `8bf1c58f-a0d9-4a65-81ae-9fdd3aad4ebb`
- **Severity:** moderate
- **Rule:** When updating local state, DO NOT immediately call API refresh functions.
- **Reason:** Causes race conditions and user-perceived bugs, but system continues to function. Should be fixed but not blocking.

### 6. Security Red-Line
- **Memory ID:** `0d2ad916-69b8-45ba-bfe1-d65a77055032`
- **Severity:** critical
- **Rule:** Never expose sensitive data in client-side code. API keys, tokens, secrets must remain server-side.
- **Reason:** Security vulnerabilities expose systems to attacks, data breaches, and compliance violations. Cannot be tolerated under any circumstances.

## Blue Hat Enforcement

**Agent ID:** `15bae3a2-19e8-4a55-ba92-43eeb2f64836`

**Enforcement Memory:** `04d6b83b-8855-4490-a52d-b8938966bded`

Blue Hat MUST:
1. Recall Red Lines collection before audit: `6bf843fb-e292-479c-a5c5-7a5d1fff3504`
2. Enforce based on severity:
   - **critical** breaches → Stop workflow immediately
   - **moderate** breaches → Log warning, allow continuation
   - **low** breaches → Log silently for later review
3. All rules tagged with `['red-lines','global','policy']`

## Tag Verification

All rules are tagged with:
- ✅ `red-line` (or `red-lines`)
- ✅ `global`
- ✅ ✅ `policy`
- ✅ `canopi` (project tag)

## Governance Status

✅ **All 6 red-lines updated with severity levels**
✅ **All red-lines linked to Blue Hat agent**
✅ **Blue Hat enforcement memory created**
✅ **Collection ready for governance enforcement**

---
*Last Updated: $(date)*
*Collection ready for Blue Hat audit enforcement*

