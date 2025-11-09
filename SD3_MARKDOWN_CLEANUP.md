# SD3 Markdown Cleanup Plan

## Agent: Codebase Cleanup Agent:sd3
## Date: 2025-11-02

## Problem
61 markdown files in `/presence/` folder (extension distribution directory) - these should not be in distribution.

## Cleanup Strategy

### Files to KEEP and MOVE to ROOT:
1. **BIKE_PANEL_ITEM_13_PLAN.md** - Active planning document
2. **ORCHESTRATION_REPORT_TOP_ALIGN_MESSAGES.md** - Most recent orchestration
3. **ORCHESTRATION_REPORT_MESSAGE_FIX.md** - Recent important fix
4. **ORCHESTRATION_REPORT_PM_CHANGES_1-3.md** - Recent important changes

### Files to DELETE (Old/Redundant):
- All audit reports older than 30 days or superseded
- Duplicate/test orchestration reports
- Old fix summaries that are no longer relevant
- Individual audit files (RED, WHITE, PURPLE, etc.) - information captured in orchestration reports

### Categories for Cleanup:

#### KEEP & MOVE (4 files):
1. BIKE_PANEL_ITEM_13_PLAN.md
2. ORCHESTRATION_REPORT_TOP_ALIGN_MESSAGES.md (most recent)
3. ORCHESTRATION_REPORT_MESSAGE_FIX.md (recent critical fix)
4. ORCHESTRATION_REPORT_PM_CHANGES_1-3.md (recent major changes)

#### DELETE (57 files):
- All individual audit reports (RED, WHITE, PURPLE, BLINDSPOT, BLUE, DEVOPS, ETHICS)
- Old orchestration reports
- Old test results
- Old fix summaries

## Action Plan
1. Move 4 important files to root
2. Delete 57 old/redundant files
3. Clean up presence folder





