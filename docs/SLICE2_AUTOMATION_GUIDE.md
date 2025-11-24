# Slice 2 Type Safety Automation Guide

## Overview

This document explains the automated monitoring and enforcement system for Slice 2 type safety. The system ensures that `: any` type annotations never return to the Slice 2 target files.

---

## Automation Layers

### 1. **Strict Diagnostic Script** (Enforcement)

**File:** `presence/src/scripts/diagnose-slice2-any-types-strict.ts`

**Purpose:** Fails the build if any `: any` annotations are found.

**Usage:**
```bash
cd presence
npx tsx src/scripts/diagnose-slice2-any-types-strict.ts
```

**Behavior:**
- ✅ Exit code 0: No `: any` annotations found
- ❌ Exit code 1: `: any` annotations found (with detailed report)

**When it runs:**
- On every PR/push (via CI/CD)
- Blocks merge if regressions found

---

### 2. **CI/CD Integration** (PR Enforcement)

**File:** `.github/workflows/typescript-checks.yml`

**What it does:**
1. Runs strict diagnostic on every PR/push
2. **Fails the build** if regressions found (blocks merge)
3. Automatically comments on PR with:
   - List of files with issues
   - Instructions for fixing
   - Links to helper resources

**Trigger:** 
- Push to `main` or `develop`
- Pull requests
- When `presence/src/**` files change

**Example PR comment:**
```
## ❌ Slice 2 Type Safety Check Failed

This PR introduces `: any` type annotations in Slice 2 files...

**Action Required:**
- Review CI/CD logs for details
- Replace all `: any` with proper types
- See `presence/src/types/window-utils.ts` for helper types
```

---

### 3. **Scheduled Monitoring** (Proactive Detection)

**File:** `.github/workflows/slice2-monitor.yml`

**What it does:**
1. Runs **daily at 2 AM UTC**
2. Creates GitHub issue if regressions found
3. Auto-closes issue when fixed
4. Can be manually triggered via "Run workflow"

**Features:**
- **Issue Creation:** Automatically creates GitHub issue with label `slice2-type-safety`
- **Issue Auto-Close:** Closes issue when diagnostic passes
- **Duplicate Prevention:** Won't create duplicate issues

**Manual Trigger:**
```bash
# Via GitHub UI:
Actions → Slice 2 Type Safety Monitor → Run workflow

# Via GitHub CLI:
gh workflow run slice2-monitor.yml
```

---

### 4. **Local Monitoring Script** (Developer Tool)

**File:** `presence/scripts/monitor-slice2-regressions.sh`

**Purpose:** Run locally or via cron for continuous monitoring.

**Usage:**
```bash
# Run manually
./presence/scripts/monitor-slice2-regressions.sh

# Add to crontab (daily at 9 AM)
0 9 * * * /path/to/presence/scripts/monitor-slice2-regressions.sh

# With custom log file
LOG_FILE=/var/log/slice2-monitor.log ./presence/scripts/monitor-slice2-regressions.sh
```

**Features:**
- Colored output (green=pass, red=fail)
- Detailed logging to file
- Exit codes for scripting
- Optional Slack/webhook notifications (commented out)

**Exit Codes:**
- `0` - No regressions
- `1` - Regressions found
- `2` - Script error

---

## How It Works Together

```
┌─────────────────────────────────────────────────────────┐
│                    Developer Makes PR                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  typescript-checks.yml (CI/CD)                          │
│  - Runs strict diagnostic                               │
│  - ❌ FAILS BUILD if :any found                         │
│  - Comments on PR with details                          │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Developer Fixes Issues                                 │
│  - Replaces :any with proper types                      │
│  - Pushes fix                                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  CI/CD Re-runs                                          │
│  - ✅ Build passes                                       │
│  - PR can be merged                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Daily at 2 AM UTC                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  slice2-monitor.yml (Scheduled)                         │
│  - Runs diagnostic                                      │
│  - Creates GitHub issue if regressions                  │
│  - Auto-closes when fixed                               │
└─────────────────────────────────────────────────────────┘
```

---

## Monitoring & Alerts

### GitHub Actions Dashboard

**View runs:**
1. Go to repository → **Actions** tab
2. Find workflow: **"TypeScript Type Definition Checks"** or **"Slice 2 Type Safety Monitor"**
3. Click on a run to see details

**What to check:**
- ✅ Green checkmark = No regressions
- ❌ Red X = Regressions found (check logs)

### GitHub Issues

**Label:** `slice2-type-safety`

**View issues:**
```bash
# Via GitHub UI
Issues → Filter by label: slice2-type-safety

# Via GitHub CLI
gh issue list --label slice2-type-safety
```

**Auto-management:**
- Issue created when regression detected
- Issue auto-closed when fixed
- Prevents duplicate issues

---

## Responding to Regressions

### When CI/CD Fails

1. **Check the logs:**
   - Click on failed workflow run
   - Expand "Check for any type annotations (Slice 2)" step
   - Review detailed output

2. **Fix locally:**
   ```bash
   cd presence
   npx tsx src/scripts/diagnose-slice2-any-types-strict.ts
   ```

3. **Replace `: any` with proper types:**
   - Use `window-utils.ts` helpers
   - Follow patterns in `global.d.ts`
   - Reference Slice 2 fixes as examples

4. **Verify fix:**
   ```bash
   npx tsx src/scripts/diagnose-slice2-any-types-strict.ts
   # Should exit with code 0
   ```

5. **Push fix:**
   - CI/CD will re-run automatically
   - Build should pass
   - PR comment will update

### When Scheduled Check Finds Issues

1. **Check GitHub issue:**
   - Issue created automatically
   - Contains details and instructions

2. **Fix the code:**
   - Follow same steps as CI/CD failure

3. **Issue auto-closes:**
   - Next scheduled run will detect fix
   - Issue automatically closed with comment

---

## Customization

### Make Check Optional (Warning Only)

Edit `.github/workflows/typescript-checks.yml`:
```yaml
- name: Check for any type annotations (Slice 2)
  run: |
    cd presence
    npx tsx src/scripts/diagnose-slice2-any-types.ts || echo "Warning: Issues found"
  continue-on-error: true  # Add this to not fail build
```

### Add Slack Notifications

Edit `monitor-slice2-regressions.sh`:
```bash
# Uncomment and set webhook URL
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Notifications will be sent on success/failure
```

### Change Schedule

Edit `.github/workflows/slice2-monitor.yml`:
```yaml
schedule:
  - cron: '0 2 * * *'  # Change to your preferred time (UTC)
```

---

## Files Monitored

The automation monitors these 5 files:
1. `presence/src/features/CursorVisualSettingsManager.ts`
2. `presence/src/features/DisplayNameManager.ts`
3. `presence/src/features/SettingsHeadlineManager.ts`
4. `presence/src/sidepanel/Sidepanel.ts`
5. `presence/src/utils/DEFAULT_VS_FOCUS_MODE_DIAGNOSTIC.ts`

---

## Troubleshooting

### Diagnostic script not found
```bash
# Ensure you're in the right directory
cd presence
ls src/scripts/diagnose-slice2-any-types-strict.ts

# Install dependencies if needed
npm install
```

### CI/CD step fails unexpectedly
- Check Node.js version (should be 18+)
- Verify `tsx` is installed
- Check file paths are correct

### Scheduled workflow not running
- Verify workflow file is in `.github/workflows/`
- Check GitHub Actions is enabled for repository
- Verify cron syntax is correct

---

## Summary

✅ **Automated enforcement** - Build fails if regressions found  
✅ **PR comments** - Automatic feedback on PRs  
✅ **Daily monitoring** - Scheduled checks catch issues  
✅ **Issue management** - Auto-create/close GitHub issues  
✅ **Local tools** - Scripts for manual checks  

**Result:** Zero-touch monitoring that prevents `: any` annotations from returning to Slice 2 files.

