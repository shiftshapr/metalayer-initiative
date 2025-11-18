# Orchestration Task: Database Migration - Preferences to Columns

## Task Metadata
- **Task ID**: `ORCH-2025-01-DB-MIGRATION`
- **Project**: `canopi`
- **Date**: `2025-01-27`
- **Objective**: Migrate user preferences from JSON column to individual columns
- **Priority**: `HIGH`
- **Status**: `IN_PROGRESS`

## Objective
Migrate user preferences from the `preferences` JSON column to individual columns in the `AppUser` table:
- Add `theme` column (VARCHAR with CHECK constraint)
- Add `headline` column (TEXT with CHECK constraint)
- Add `displayName` column (VARCHAR with CHECK constraint)
- Add `auraIntensity` column (DECIMAL with CHECK constraint)
- Migrate existing data from JSON to columns
- Keep `preferences` column for backward compatibility (temporary)

## Requirements
1. Add new columns with proper constraints
2. Migrate existing data from JSON to columns
3. Ensure no data loss
4. Maintain backward compatibility during transition
5. Update Prisma schema

## Success Criteria
- [ ] Theme column added to AppUser table
- [ ] Headline column added to AppUser table
- [ ] DisplayName column added to AppUser table
- [ ] AuraIntensity column added to AppUser table
- [ ] Existing data migrated from JSON to columns
- [ ] Prisma schema updated
- [ ] Migration tested and verified

## Agent Workflow
Execute using Default Collaboration Workflow Manifest:
1. **PM** - Problem analysis and requirements validation
2. **SD** - Solution design and migration strategy
3. **TEST** - Test plan and verification
4. **RED** - Red-line audit (critical constraints)
5. **WHITE** - White-hat security review
6. **PURPLE** - Purple-team adversarial testing
7. **BLINDSPOT** - Blind-spot analysis
8. **BLUE** - Blue-hat final review
9. **DEVOPS** - Deployment and operations
10. **ETHICS** - Ethical considerations




