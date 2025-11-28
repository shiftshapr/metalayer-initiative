#!/bin/bash
# Quick Fix Plan - Generate actionable lists for parallel fixing

set -e

cd "$(dirname "$0")/.." || exit 1
SRC_DIR="presence/src"
OUTPUT_DIR="migration-issues"

mkdir -p "$OUTPUT_DIR"

echo "=== Quick Fix Plan Generator ==="
echo ""

# 1. All type assertions (for review)
echo "1. All Type Assertions"
grep -rE "as any|as unknown" "$SRC_DIR" --include="*.ts" 2>/dev/null > "$OUTPUT_DIR/all-type-assertions.txt" || true
TOTAL=$(wc -l < "$OUTPUT_DIR/all-type-assertions.txt" 2>/dev/null | tr -d ' ' || echo "0")
echo "   Total: $TOTAL"
echo "   File: $OUTPUT_DIR/all-type-assertions.txt"
echo ""

# 2. All ROOT CAUSE FIX comments (for review)
echo "2. All ROOT CAUSE FIX Comments"
grep -rn "ROOT CAUSE FIX" "$SRC_DIR" --include="*.ts" 2>/dev/null > "$OUTPUT_DIR/all-root-cause-fixes.txt" || true
TOTAL=$(wc -l < "$OUTPUT_DIR/all-root-cause-fixes.txt" 2>/dev/null | tr -d ' ' || echo "0")
echo "   Total: $TOTAL"
echo "   File: $OUTPUT_DIR/all-root-cause-fixes.txt"
echo ""

# 3. Group by file for parallel fixing
echo "3. Type Assertions by File (for parallel fixing)"
grep -rE "as any|as unknown" "$SRC_DIR" --include="*.ts" 2>/dev/null | \
  cut -d: -f1 | sort | uniq -c | sort -rn > "$OUTPUT_DIR/type-assertions-by-file.txt" || true
echo "   Top 10 files:"
head -10 "$OUTPUT_DIR/type-assertions-by-file.txt" 2>/dev/null || echo "   (none found)"
echo ""

# 4. ROOT CAUSE FIX by file
echo "4. ROOT CAUSE FIX by File (for parallel fixing)"
grep -rn "ROOT CAUSE FIX" "$SRC_DIR" --include="*.ts" 2>/dev/null | \
  cut -d: -f1 | sort | uniq -c | sort -rn > "$OUTPUT_DIR/root-cause-fixes-by-file.txt" || true
echo "   Top 10 files:"
head -10 "$OUTPUT_DIR/root-cause-fixes-by-file.txt" 2>/dev/null || echo "   (none found)"
echo ""

# 5. TODO/FIXME by file
echo "5. TODO/FIXME by File"
grep -rE "TODO|FIXME" "$SRC_DIR" --include="*.ts" 2>/dev/null | \
  cut -d: -f1 | sort | uniq -c | sort -rn > "$OUTPUT_DIR/todos-by-file.txt" || true
echo "   Top 10 files:"
head -10 "$OUTPUT_DIR/todos-by-file.txt" 2>/dev/null || echo "   (none found)"
echo ""

echo "=== Parallel Fix Strategy ==="
echo ""
echo "Option 1: Fix by file (recommended)"
echo "  - Each session takes 1 file from type-assertions-by-file.txt"
echo "  - Review all issues in that file"
echo "  - Fix all issues"
echo "  - Move to next file"
echo ""
echo "Option 2: Fix by issue type"
echo "  - Session 1-8: Review type assertions (18 issues each)"
echo "  - Session 9-16: Review ROOT CAUSE FIX (17 issues each)"
echo ""
echo "Files ready in: $OUTPUT_DIR/"
echo ""

