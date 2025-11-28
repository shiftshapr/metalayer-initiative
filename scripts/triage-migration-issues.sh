#!/bin/bash
# Triage Migration Issues - Categorize and Prioritize
# Outputs categorized issues for parallel fixing

set -e

cd "$(dirname "$0")/.." || exit 1
SRC_DIR="presence/src"
OUTPUT_DIR="migration-issues"

mkdir -p "$OUTPUT_DIR"

echo "=== Triaging Migration Issues ==="
echo ""

# 1. CRITICAL: Type safety violations in auth/user identification
echo "1. CRITICAL: Type assertions in auth/user code"
grep -r "as any\|as unknown" "$SRC_DIR" --include="*.ts" 2>/dev/null | \
  grep -iE "auth|user|identif|match|filter|email|uuid" | \
  > "$OUTPUT_DIR/critical-auth-type-assertions.txt" 2>/dev/null || true
wc -l < "$OUTPUT_DIR/critical-auth-type-assertions.txt" 2>/dev/null | xargs echo "   Count:" || echo "   Count: 0"

# 2. CRITICAL: ROOT CAUSE FIX in auth/user code
echo "2. CRITICAL: ROOT CAUSE FIX in auth/user code"
grep -r "ROOT CAUSE FIX" "$SRC_DIR" --include="*.ts" 2>/dev/null | \
  grep -iE "auth|user|identif|match|filter|email|uuid" | \
  > "$OUTPUT_DIR/critical-auth-fixes.txt" 2>/dev/null || true
wc -l < "$OUTPUT_DIR/critical-auth-fixes.txt" 2>/dev/null | xargs echo "   Count:" || echo "   Count: 0"

# 3. HIGH: Type assertions in API/database code
echo "3. HIGH: Type assertions in API/database code"
grep -r "as any\|as unknown" "$SRC_DIR" --include="*.ts" 2>/dev/null | \
  grep -iE "api|database|query|fetch|prisma|supabase" | \
  > "$OUTPUT_DIR/high-api-type-assertions.txt" 2>/dev/null || true
wc -l < "$OUTPUT_DIR/high-api-type-assertions.txt" 2>/dev/null | xargs echo "   Count:" || echo "   Count: 0"

# 4. HIGH: ROOT CAUSE FIX in API/database code
echo "4. HIGH: ROOT CAUSE FIX in API/database code"
grep -r "ROOT CAUSE FIX" "$SRC_DIR" --include="*.ts" 2>/dev/null | \
  grep -iE "api|database|query|fetch|prisma|supabase" | \
  > "$OUTPUT_DIR/high-api-fixes.txt" 2>/dev/null || true
wc -l < "$OUTPUT_DIR/high-api-fixes.txt" 2>/dev/null | xargs echo "   Count:" || echo "   Count: 0"

# 5. MEDIUM: All other type assertions (grouped by file)
echo "5. MEDIUM: All other type assertions (by file)"
grep -r "as any\|as unknown" "$SRC_DIR" --include="*.ts" 2>/dev/null | \
  grep -v -iE "auth|user|identif|match|filter|email|uuid|api|database|query|fetch|prisma|supabase" | \
  cut -d: -f1 | sort | uniq -c | sort -rn | \
  > "$OUTPUT_DIR/medium-type-assertions-by-file.txt" 2>/dev/null || true
wc -l < "$OUTPUT_DIR/medium-type-assertions-by-file.txt" 2>/dev/null | xargs echo "   Files:" || echo "   Files: 0"

# 6. MEDIUM: All other ROOT CAUSE FIX (grouped by file)
echo "6. MEDIUM: All other ROOT CAUSE FIX (by file)"
grep -r "ROOT CAUSE FIX" "$SRC_DIR" --include="*.ts" 2>/dev/null | \
  grep -v -iE "auth|user|identif|match|filter|email|uuid|api|database|query|fetch|prisma|supabase" | \
  cut -d: -f1 | sort | uniq -c | sort -rn | \
  > "$OUTPUT_DIR/medium-fixes-by-file.txt" 2>/dev/null || true
wc -l < "$OUTPUT_DIR/medium-fixes-by-file.txt" 2>/dev/null | xargs echo "   Files:" || echo "   Files: 0"

# 7. LOW: TODO/FIXME (grouped by file)
echo "7. LOW: TODO/FIXME (by file)"
grep -r "TODO\|FIXME" "$SRC_DIR" --include="*.ts" 2>/dev/null | \
  cut -d: -f1 | sort | uniq -c | sort -rn | \
  > "$OUTPUT_DIR/low-todos-by-file.txt" 2>/dev/null || true
wc -l < "$OUTPUT_DIR/low-todos-by-file.txt" 2>/dev/null | xargs echo "   Files:" || echo "   Files: 0"

echo ""
echo "=== Summary ==="
echo "Files created in: $OUTPUT_DIR/"
echo ""
echo "Priority order:"
echo "1. Review: $OUTPUT_DIR/critical-auth-type-assertions.txt"
echo "2. Review: $OUTPUT_DIR/critical-auth-fixes.txt"
echo "3. Review: $OUTPUT_DIR/high-api-type-assertions.txt"
echo "4. Review: $OUTPUT_DIR/high-api-fixes.txt"
echo "5. Review: $OUTPUT_DIR/medium-*.txt (by file, fix in batches)"
echo "6. Review: $OUTPUT_DIR/low-todos-by-file.txt (as needed)"
echo ""

