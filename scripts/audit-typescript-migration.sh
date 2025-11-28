#!/bin/bash
# TypeScript Migration Audit Script
# Finds potential bugs introduced during migration

set -e

echo "=== TypeScript Migration Audit ==="
echo ""

cd "$(dirname "$0")/.." || exit 1

SRC_DIR="presence/src"

echo "1. TYPE SAFETY VIOLATIONS (High Risk)"
echo "   These hide type errors that might indicate logic bugs:"
grep -r "as any\|as unknown\|@ts-ignore\|@ts-expect-error" "$SRC_DIR" --include="*.ts" 2>/dev/null | wc -l | xargs echo "   Count:"
echo "   Files:"
grep -r "as any\|as unknown\|@ts-ignore\|@ts-expect-error" "$SRC_DIR" --include="*.ts" 2>/dev/null | cut -d: -f1 | sort -u | head -10
echo ""

echo "2. EMAIL-BASED MATCHING (Critical - Privacy Violation)"
echo "   Should be ZERO after UUID-only fix:"
grep -r "\.eq('email'\|findUnique.*email\|findFirst.*email\|user\.email\s*===" "$SRC_DIR" --include="*.ts" 2>/dev/null | wc -l | xargs echo "   Count:"
echo ""

echo "3. EMAIL HEADERS (Critical - Privacy Violation)"
echo "   Should be ZERO after UUID-only fix:"
grep -r "x-user-email\|user-email" "$SRC_DIR" --include="*.ts" 2>/dev/null | wc -l | xargs echo "   Count:"
echo ""

echo "4. GOOGLE ID PATTERNS (Policy Violation)"
echo "   Should be ZERO:"
grep -r "/^\d+\$/\|googleId\|google_id" "$SRC_DIR" --include="*.ts" 2>/dev/null | wc -l | xargs echo "   Count:"
echo ""

echo "5. 'ROOT CAUSE FIX' COMMENTS (Unrequested Fixes?)"
echo "   These might indicate fixes that weren't requested:"
grep -r "ROOT CAUSE FIX" "$SRC_DIR" --include="*.ts" 2>/dev/null | wc -l | xargs echo "   Count:"
echo "   Sample files:"
grep -r "ROOT CAUSE FIX" "$SRC_DIR" --include="*.ts" 2>/dev/null | cut -d: -f1 | sort -u | head -5
echo ""

echo "6. TODO/FIXME/HACK COMMENTS (Incomplete Work?)"
echo "   These might indicate incomplete fixes:"
grep -r "TODO\|FIXME\|HACK\|XXX" "$SRC_DIR" --include="*.ts" 2>/dev/null | wc -l | xargs echo "   Count:"
echo "   Sample:"
grep -r "TODO\|FIXME\|HACK" "$SRC_DIR" --include="*.ts" 2>/dev/null | head -5
echo ""

echo "7. CHANGED FUNCTION SIGNATURES (Breaking Changes?)"
echo "   Functions that might have changed during migration:"
echo "   (Manual review needed - check git history)"
echo ""

echo "8. REMOVED VALIDATION (Runtime Errors?)"
echo "   Look for removed null checks or validation:"
grep -r "if (!.*) {" "$SRC_DIR" --include="*.ts" 2>/dev/null | wc -l | xargs echo "   Null checks found:"
echo "   (Manual review needed - verify validation is present)"
echo ""

echo "=== RECOMMENDATIONS ==="
echo ""
echo "1. Review all 'as any' and 'as unknown' - why were they needed?"
echo "2. Review all 'ROOT CAUSE FIX' comments - were these fixes requested?"
echo "3. Check git history for functions that changed signatures during migration"
echo "4. Verify all user identification uses UUID only (already fixed)"
echo "5. Add ESLint rules to prevent future violations"
echo ""

