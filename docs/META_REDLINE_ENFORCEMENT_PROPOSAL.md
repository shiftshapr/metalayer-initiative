# META: Red-Line Enforcement Proposal

## Problem Statement

**Issue**: Agents are violating red-line policies (e.g., using `pm2 restart` instead of `start_backend.sh`) because:
1. RED agent runs **AFTER** code changes (workflow: `pm → sd → test → red`)
2. By the time RED audits, violations have already occurred
3. No pre-flight checks before tool execution
4. Agents don't check red-lines before executing tool calls

## Current Workflow Analysis

**Current Order**: `pm → sd → test → red → white → purple → blindspot → blue`

**RED Agent Role** (from `10_AGENT_DESCRIPTIONS.md`):
- Red-Line Auditor
- Enforce non-negotiable policies
- Block releases on violations
- **Problem**: Runs AFTER code changes, not before

## Root Cause

1. **Timing Issue**: RED runs after TEST, meaning code changes have already been made
2. **No Pre-Flight Checks**: No agent validates tool calls before execution
3. **Reactive vs Proactive**: RED is reactive (finds violations after) instead of proactive (prevents violations)

## Proposed Solution

### Option 1: Pre-Flight RED Phase (Recommended)

**New Workflow**: `pm → red (pre-flight) → sd → test → red (post-audit) → white → purple → blindspot → blue`

**RED Pre-Flight Responsibilities**:
1. **Before any tool execution**: Review planned tool calls against red-line policies
2. **Access to**:
   - `.cursorrules` file (all red-line policies)
   - JAUmemory red-line memories (historical violations)
   - Tool call parameters before execution
3. **Block violations**: Immediately reject tool calls that violate red-lines
4. **Provide alternatives**: Suggest compliant alternatives when violations detected

**RED Post-Audit Responsibilities** (existing):
- Verify all changes comply with red-lines
- Check for any violations that slipped through
- Final compliance report

### Option 2: Every Agent Self-Checks (Alternative)

**Approach**: Every agent checks red-lines before executing tool calls

**Implementation**:
1. Before each tool call, agent checks:
   - Does this violate any red-line in `.cursorrules`?
   - Does this match any violation pattern in JAUmemory?
2. If violation detected:
   - Block execution
   - Escalate to RED agent
   - Request compliant alternative

**Pros**: Distributed enforcement, faster feedback
**Cons**: Duplicated logic, potential inconsistencies

### Option 3: Hybrid Approach (Best)

**Combination**:
1. **Pre-Flight RED**: Validates tool calls before execution (catches violations early)
2. **Agent Self-Checks**: Each agent checks red-lines before critical operations
3. **Post-Audit RED**: Final verification after all changes

**Workflow**: `pm → red (pre-flight) → sd → test → red (post-audit) → white → purple → blindspot → blue`

## Implementation Details

### RED Pre-Flight Checklist

Before ANY tool execution, RED must verify:

1. **Source-Only Editing Policy**:
   - [ ] No tool calls targeting `extension/`, `dist/`, or `build/` directories
   - [ ] All edits target `src/` TypeScript files only
   - [ ] Build process will be used (not manual file copies)

2. **Backend Server Startup Policy**:
   - [ ] No `pm2 restart`, `pm2 start`, or direct `node` commands
   - [ ] Only `start_backend.sh` script used for backend operations
   - [ ] No manual server management

3. **Field Naming Standardization**:
   - [ ] No duplicate fields (camelCase + snake_case)
   - [ ] All fields converted to camelCase at interface boundary

4. **Extension Distribution Cleanliness**:
   - [ ] No markdown/non-runtime files in distribution
   - [ ] No diagnostic scripts in distribution
   - [ ] Only runtime files (.js, .html, .css, manifest.json)

5. **Architecture Guardrails**:
   - [ ] ES6 modules only (no CommonJS)
   - [ ] No backward-compatibility shims
   - [ ] No duplicate code paths

### RED Pre-Flight Process

1. **Receive Tool Call Plan**: Before SD executes, RED reviews planned tool calls
2. **Check Against Policies**: Compare each tool call against `.cursorrules` and JAUmemory
3. **Approve or Reject**: 
   - ✅ **Approve**: Tool call is compliant, proceed
   - ❌ **Reject**: Tool call violates red-line, provide alternative
4. **Log Decision**: Record approval/rejection in JAUmemory with reasoning

### Tool Call Validation Example

**Violation Detected**:
```javascript
// Agent tries to execute:
run_terminal_cmd("pm2 restart metalayer-api")

// RED Pre-Flight Check:
// ❌ VIOLATION: Backend Server Startup Policy RED-LINE
// Policy: "Backend server MUST ONLY be started using start_backend.sh"
// Alternative: run_terminal_cmd("bash start_backend.sh")
```

**Compliant Alternative**:
```javascript
// RED approves:
run_terminal_cmd("bash start_backend.sh")
```

## Updated Workflow

### New Default Workflow

```
pm → red (pre-flight) → sd → test → red (post-audit) → white → purple → blindspot → blue → [learn] → [meta] → devops → ethics
```

### Phase Descriptions

1. **PM**: Problem analysis, JAUmemory entry creation
2. **RED (Pre-Flight)**: Validate all planned tool calls against red-lines
3. **SD**: Implementation (with RED pre-approval)
4. **TEST**: Test execution
5. **RED (Post-Audit)**: Final compliance verification
6. **WHITE**: Security review
7. **PURPLE**: Adversarial testing
8. **BLINDSPOT**: Hidden issue identification
9. **BLUE**: Final review + learning phase
10. **LEARN**: Pattern identification and prevention
11. **META**: Learning effectiveness evaluation
12. **DEVOPS**: Deployment planning
13. **ETHICS**: Compliance checks

## JAUmemory Integration

### Red-Line Memory Structure

```javascript
{
  "type": "red-line-policy",
  "policy": "Backend Server Startup Policy",
  "rule": "MUST ONLY use start_backend.sh",
  "violations": [
    {
      "timestamp": "2025-01-20T00:00:00Z",
      "agent": "sd",
      "violation": "Used pm2 restart instead of start_backend.sh",
      "corrected": true
    }
  ],
  "enforcement": "pre-flight-red-check"
}
```

### Violation Tracking

- Record all violations in JAUmemory
- Link violations to agent memories
- Track violation patterns
- Update prevention strategies

## Agent Responsibilities Update

### RED Agent (Updated)

**Pre-Flight Phase**:
- Review all planned tool calls
- Check against `.cursorrules` and JAUmemory
- Approve or reject with alternatives
- Log decisions in JAUmemory

**Post-Audit Phase** (existing):
- Verify final compliance
- Check for any missed violations
- Generate compliance report

### All Agents (Updated)

**Before Tool Execution**:
- Check if tool call might violate red-lines
- If uncertain, request RED pre-flight review
- Never execute tool calls that clearly violate red-lines

## Success Metrics

1. **Violation Rate**: Should decrease to near-zero
2. **Catch Rate**: Pre-flight RED should catch 100% of violations
3. **Response Time**: Pre-flight check should add <5 seconds to workflow
4. **Agent Compliance**: All agents should self-check before critical operations

## Implementation Priority

1. **Immediate**: Update workflow to include RED pre-flight phase
2. **Short-term**: Implement RED pre-flight checklist
3. **Medium-term**: Build tool call validation system
4. **Long-term**: Automated red-line pattern detection

## Recommendation

**Adopt Option 3 (Hybrid Approach)**:
- RED pre-flight catches violations early
- Agent self-checks provide distributed enforcement
- RED post-audit ensures final compliance
- Most comprehensive protection

**Updated Workflow**: `pm → red (pre-flight) → sd → test → red (post-audit) → white → purple → blindspot → blue`


