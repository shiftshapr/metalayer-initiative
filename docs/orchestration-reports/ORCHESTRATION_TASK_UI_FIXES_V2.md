# Orchestration Task: UI Fixes V2 - Multiple Issues

## Task Metadata
- **Task ID**: `ORCH-2025-01-UI-FIXES-V2`
- **Project**: `canopi`
- **Date**: `2025-01-27`
- **Objective**: Fix 8 UI/UX issues
- **Priority**: `HIGH`
- **Status**: `IN_PROGRESS`

## Objective
Fix the following issues:
1. Make Go Visible modal have dark mode
2. Fix "Daveed Benjamin" display name source (when AppUser.displayName is NULL)
3. Fix display name and headline not saving to database
4. Go Visible modal should not appear when toggling Visible to Yes
5. Theme toggle needs Dark on the right side
6. Settings tab Theme toggle does not update UI, local storage, or database
7. Profile menu theme toggle is inactive
8. Put aura intensity on the same row as aura color

## Requirements
1. Fix all root causes, not create fallbacks
2. Ensure database saves work correctly
3. Fix theme toggle functionality
4. Improve modal styling
5. Fix layout issues

## Success Criteria
- [ ] Go Visible modal has dark mode
- [ ] Display name source fixed
- [ ] Display name and headline save to database
- [ ] Go Visible modal logic fixed
- [ ] Theme toggle Dark on right
- [ ] Settings tab theme toggle works
- [ ] Profile menu theme toggle works
- [ ] Aura intensity on same row

## Agent Workflow
Execute using Default Collaboration Workflow Manifest:
1. **PM** - Problem analysis and requirements validation
2. **SD** - Solution design and architecture
3. **TEST** - Test plan and verification
4. **RED** - Red-line audit (critical constraints)
5. **WHITE** - White-hat security review
6. **PURPLE** - Purple-team adversarial testing
7. **BLINDSPOT** - Blind-spot analysis
8. **BLUE** - Blue-hat final review
9. **DEVOPS** - Deployment and operations
10. **ETHICS** - Ethical considerations




