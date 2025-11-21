#!/bin/bash
# Build script for extension distribution
# Compiles TypeScript from src/ to dist/ and ensures only necessary files remain

set -e

PRESENCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PRESENCE_DIR"

echo "🔨 Building extension distribution..."

# Step 1: Compile TypeScript from src/ to dist/
echo "📦 Compiling TypeScript..."
if [ -f "tsconfig.json" ]; then
  npx tsc --project tsconfig.json
else
  echo "❌ tsconfig.json not found in presence directory!"
  exit 1
fi

if [ $? -ne 0 ]; then
  echo "❌ TypeScript compilation failed!"
  exit 1
fi

echo "✅ TypeScript compilation complete"

# Step 2: Run cleanup to remove non-distribution files
echo ""
echo "🧹 Cleaning up non-distribution files..."
bash scripts/cleanup-distribution.sh

# Step 3: Verify essential files exist
echo ""
echo "🔍 Verifying essential distribution files..."

ESSENTIAL_FILES=(
  "manifest.json"
  "sidepanel.html"
  "sidepanel.css"
  "background.js"
  "content.js"
  "content.css"
)

MISSING_FILES=()

for file in "${ESSENTIAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    MISSING_FILES+=("$file")
  fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
  echo "⚠️  Warning: Missing essential files:"
  printf '   - %s\n' "${MISSING_FILES[@]}"
else
  echo "✅ All essential files present"
fi

# Step 4: Check compiled files exist in dist/
COMPILED_COUNT=$(find dist -maxdepth 3 \( -path "dist/core/*.js" -o -path "dist/features/*.js" -o -path "dist/utils/*.js" -o -path "dist/services/*.js" \) 2>/dev/null | wc -l)
if [ "$COMPILED_COUNT" -eq 0 ]; then
  echo "⚠️  Warning: No compiled TypeScript files found in dist/ directory!"
else
  echo "✅ Found $COMPILED_COUNT compiled JavaScript files in dist/"
fi

echo ""
echo "✅ Build complete! Distribution is ready."
echo ""
echo "📋 Distribution contents:"
echo "   - Runtime files: $(ls -1 *.js *.html *.css 2>/dev/null | wc -l) files"
echo "   - Compiled code: dist/ directory (core/, features/, utils/, services/)"
echo "   - Assets: images/, lib/, auth/ directories"

