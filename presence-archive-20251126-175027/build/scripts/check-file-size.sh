#!/bin/bash
# File Size Check Script for CI/CD
# Warns if files exceed recommended size limits
# Part of Slice 7: Architecture enforcement

set -e

WARN_THRESHOLD=1500
ERROR_THRESHOLD=3000
SRC_DIR="presence/src"

echo "🔍 Checking file sizes in $SRC_DIR..."

# Find all TypeScript files in src/ (excluding node_modules, dist, build, extension, diagnostics, scripts)
find "$SRC_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*" \
  ! -path "*/extension/*" \
  ! -path "*/diagnostics/*" \
  ! -path "*/scripts/*" \
  | while read -r file; do
    lines=$(wc -l < "$file" | tr -d ' ')
    if [ "$lines" -gt "$ERROR_THRESHOLD" ]; then
      echo "❌ ERROR: $file has $lines lines (exceeds $ERROR_THRESHOLD)"
      echo "   → Consider splitting this file (see ARCHITECTURE.md)"
      exit 1
    elif [ "$lines" -gt "$WARN_THRESHOLD" ]; then
      echo "⚠️  WARN: $file has $lines lines (exceeds $WARN_THRESHOLD)"
      echo "   → Consider splitting this file when refactoring (see ARCHITECTURE.md)"
    fi
  done

if [ $? -eq 0 ]; then
  echo "✅ File size check passed"
  exit 0
else
  echo "❌ File size check failed - see errors above"
  exit 1
fi






