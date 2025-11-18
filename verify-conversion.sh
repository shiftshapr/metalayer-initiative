#!/bin/bash
cd /home/ubuntu/metalayer-initiative

echo "=== TypeScript Migration Verification ==="
echo ""

# 1. Compilation
echo "1. Checking compilation..."
if npx tsc --noEmit --skipLibCheck 2>&1 | grep -q "error"; then
  echo "❌ Compilation errors found!"
  npx tsc --noEmit --skipLibCheck 2>&1 | grep "error" | head -10
else
  echo "✅ No compilation errors"
fi

# 2. File count
echo ""
echo "2. Checking file counts..."
FEATURES_CONVERTED=$(ls -1 presence/src/features/*.ts 2>/dev/null | wc -l)
FEATURES_REMAINING=$(ls -1 presence/features/*.js 2>/dev/null | while read f; do base=$(basename "$f" .js); [ ! -f "presence/src/features/${base}.ts" ] && echo "1"; done | wc -l)
UTILS_CONVERTED=$(ls -1 presence/src/utils/*.ts 2>/dev/null | wc -l)
UTILS_REMAINING=$(ls -1 presence/utils/*.js 2>/dev/null | while read f; do base=$(basename "$f" .js); [ ! -f "presence/src/utils/${base}.ts" ] && echo "1"; done | wc -l)

echo "  Features: $FEATURES_CONVERTED converted, $FEATURES_REMAINING remaining"
echo "  Utils: $UTILS_CONVERTED converted, $UTILS_REMAINING remaining"

if [ "$FEATURES_REMAINING" -eq 0 ] && [ "$UTILS_REMAINING" -eq 0 ]; then
  echo "✅ All files converted!"
else
  echo "⚠️  Some files still need conversion"
fi

# 3. RED-LINE violations
echo ""
echo "3. Checking for RED-LINE violations..."
VIOLATIONS=$(grep -rE "\b(aura_color|user_id|created_at|updated_at)\b" presence/src/ --include="*.ts" | grep -v "dbColumn\|db_column\|//\|/\*" | wc -l)
if [ "$VIOLATIONS" -eq 0 ]; then
  echo "✅ No RED-LINE violations found"
else
  echo "❌ Found $VIOLATIONS potential RED-LINE violations"
  grep -rE "\b(aura_color|user_id|created_at|updated_at)\b" presence/src/ --include="*.ts" | grep -v "dbColumn\|db_column\|//\|/\*" | head -5
fi

# 4. Any types
echo ""
echo "4. Checking for 'any' types..."
ANY_COUNT=$(grep -r ":\s*any\b" presence/src/ --include="*.ts" | grep -v "//" | wc -l)
echo "  Found $ANY_COUNT uses of 'any' type"

# 5. Stubs
echo ""
echo "5. Checking for potential stubs..."
STUBS=$(grep -ri "TODO\|FIXME\|STUB\|PLACEHOLDER\|Not implemented" presence/src/ --include="*.ts" | wc -l)
if [ "$STUBS" -eq 0 ]; then
  echo "✅ No obvious stubs found"
else
  echo "⚠️  Found $STUBS potential stubs/TODOs"
  grep -ri "TODO\|FIXME\|STUB\|PLACEHOLDER\|Not implemented" presence/src/ --include="*.ts" | head -5
fi

echo ""
echo "=== Verification Complete ==="

