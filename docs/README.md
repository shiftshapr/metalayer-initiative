# Canopi Documentation

This directory contains all project documentation organized by category.

## Directory Structure

- **`audits/`** - Audit reports and analysis documents
- **`orchestration/`** - Orchestration reports and slice documentation
- **`migration/`** - Migration documentation and guides
- **`planning/`** - Planning documents and agent prompts
- **`current/`** - **NEW markdown files should be created here**
- **`migration-issues/`** - Migration issue tracking files

## Creating New Documentation

**IMPORTANT**: When creating new markdown files, place them in `docs/current/` rather than the project root.

### Examples:
- ✅ `docs/current/NEW_FEATURE_PLAN.md`
- ✅ `docs/current/BUG_FIX_REPORT.md`
- ✅ `docs/current/MEETING_NOTES.md`
- ❌ `NEW_FEATURE_PLAN.md` (in root - don't do this)

### Moving Files

After review, files in `docs/current/` can be moved to appropriate subdirectories:
- Audit reports → `docs/audits/`
- Planning documents → `docs/planning/`
- Migration docs → `docs/migration/`
- Orchestration reports → `docs/orchestration/`

## Organization Guidelines

- Keep root directory clean - no markdown files in root
- Use descriptive filenames with dates if needed (e.g., `FEATURE_2025-11-26.md`)
- Archive old documentation to appropriate subdirectories
- Update this README if adding new documentation categories






