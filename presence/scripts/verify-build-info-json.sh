#!/bin/bash

# Verification script for .build-info.json
# Ensures the file exists and is accessible in the extension directory

set -euo pipefail

PRESENCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PRESENCE_DIR"

BUILD_INFO_FILE="extension/.build-info.json"

echo "🔍 Verifying .build-info.json..."
echo "========================================="

# Check if file exists
if [ ! -f "$BUILD_INFO_FILE" ]; then
  echo "❌ ERROR: .build-info.json not found at $BUILD_INFO_FILE"
  echo ""
  echo "Solution: Run the build process:"
  echo "  npm run build:presence"
  echo "  OR"
  echo "  bash scripts/sync-extension-from-dist.sh"
  exit 1
fi

# Check file size
FILE_SIZE=$(stat -f%z "$BUILD_INFO_FILE" 2>/dev/null || stat -c%s "$BUILD_INFO_FILE" 2>/dev/null || echo "0")
if [ "$FILE_SIZE" -eq 0 ]; then
  echo "❌ ERROR: .build-info.json is empty"
  exit 1
fi

# Check if it's valid JSON
if ! jq . "$BUILD_INFO_FILE" >/dev/null 2>&1; then
  echo "❌ ERROR: .build-info.json is not valid JSON"
  exit 1
fi

# Display file contents
echo "✅ .build-info.json exists and is valid"
echo ""
echo "File location: $BUILD_INFO_FILE"
echo "File size: $FILE_SIZE bytes"
echo ""
echo "Contents:"
cat "$BUILD_INFO_FILE" | jq .
echo ""
echo "✅ Verification passed!"

