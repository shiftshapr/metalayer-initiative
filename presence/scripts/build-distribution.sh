#!/bin/bash
# Build script for extension distribution
# Compiles TypeScript from src/ to dist/ and ensures only necessary files remain

set -e

PRESENCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PRESENCE_DIR"

echo "🔨 Building extension distribution..."

# Step 1: Compile TypeScript from src/ to presence/ root
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

# Step 4: Check compiled files exist in root directories
COMPILED_COUNT=$(find . -maxdepth 3 \( -path "./core/*.js" -o -path "./features/*.js" -o -path "./utils/*.js" -o -path "./services/*.js" \) 2>/dev/null | wc -l)
if [ "$COMPILED_COUNT" -eq 0 ]; then
  echo "⚠️  Warning: No compiled TypeScript files found in presence/ root directories!"
else
  echo "✅ Found $COMPILED_COUNT compiled JavaScript files in root directories"
fi

echo ""
echo "✅ Build complete! Distribution is ready."
echo ""
echo "📋 Distribution contents:"
echo "   - Runtime files: $(ls -1 *.js *.html *.css 2>/dev/null | wc -l) files"
echo "   - Compiled code: core/, features/, utils/, services/ directories"
echo "   - Assets: images/, lib/, auth/ directories"

