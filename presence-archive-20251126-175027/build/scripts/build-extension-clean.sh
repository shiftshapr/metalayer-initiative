#!/bin/bash
# Build script that creates a CLEAN extension directory with ONLY essential files
# Output: extension/ directory - ready to load in Chrome

set -e

PRESENCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PRESENCE_DIR"

OUTPUT_DIR="extension"
echo "🔨 Building clean extension to $OUTPUT_DIR/..."

# Step 1: Clean previous build
if [ -d "$OUTPUT_DIR" ]; then
  echo "🧹 Removing old $OUTPUT_DIR/..."
  rm -rf "$OUTPUT_DIR"
fi
mkdir -p "$OUTPUT_DIR"

# Step 2: Compile TypeScript from src/ to dist/
echo "📦 Compiling TypeScript..."
if [ -f "tsconfig.json" ]; then
  npx tsc --project tsconfig.json 2>&1 | tee /tmp/tsc-errors.log
  TSC_EXIT_CODE=$?
  if [ $TSC_EXIT_CODE -ne 0 ]; then
    ERROR_COUNT=$(grep -c "error TS" /tmp/tsc-errors.log || echo "0")
    if [ "$ERROR_COUNT" -gt 0 ]; then
      echo "⚠️  TypeScript compilation completed with $ERROR_COUNT errors"
      echo "   (Extension will still be built, but may have runtime issues)"
    else
      echo "⚠️  TypeScript compilation had warnings"
    fi
  else
    echo "✅ TypeScript compilation complete (no errors)"
  fi
else
  echo "❌ tsconfig.json not found!"
  exit 1
fi

# Step 3: Copy compiled TypeScript from dist/ to extension structure (flatten - no dist/ folder)
if [ -d "dist" ]; then
  echo "📁 Copying compiled TypeScript (flattening dist/ structure)..."
  # Copy all files from dist/ maintaining directory structure but without dist/ prefix
  # EXCLUDE unused diagnostic files
  find dist -type f -name "*.js" | while read -r file; do
    # Skip unused standalone diagnostic files
    filename=$(basename "$file")
    if [[ "$filename" == *"DIAGNOSTIC"* ]] && [[ "$file" != *"diagnostics/registerDiagnostics"* ]] && [[ "$file" != *"diagnostics/MessageDisplayDiagnostic"* ]] && [[ "$file" != *"diagnostics/ComprehensiveFormattingDiagnostic"* ]] && [[ "$file" != *"diagnostics/RootCauseDiagnostic"* ]]; then
      continue
    fi
    
    # Remove 'dist/' prefix from path
    rel_path="${file#dist/}"
    target_path="$OUTPUT_DIR/$rel_path"
    target_dir=$(dirname "$target_path")
    mkdir -p "$target_dir"
    cp "$file" "$target_path"
  done
  echo "✅ Copied compiled TypeScript files to extension structure (excluded unused diagnostics)"
else
  echo "⚠️  Warning: dist/ directory not found!"
fi

# Step 4: Copy essential manifest and entry files
echo "📄 Copying manifest and entry files..."
ESSENTIAL_FILES=(
  "manifest.json"
  "sidepanel.html"
  "sidepanel.css"
  "background.js"
  "content.js"
  "content.css"
)

for file in "${ESSENTIAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$OUTPUT_DIR/"
    echo "   ✓ $file"
  else
    echo "   ⚠️  Missing: $file"
  fi
done

# Step 5: Copy asset directories
echo "🖼️  Copying asset directories..."
ASSET_DIRS=("images" "lib" "auth")
for dir in "${ASSET_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    cp -r "$dir" "$OUTPUT_DIR/"
    echo "   ✓ $dir/"
  else
    echo "   ⚠️  Missing: $dir/"
  fi
done

# Step 6: Extract and copy JS files referenced in sidepanel.html
echo "📜 Copying JS files referenced in sidepanel.html..."
JS_FILES=$(grep -oP 'src="[^"]*\.js"' sidepanel.html | sed 's/src="//g' | sed 's/"//g' | sort -u)

for js_file in $JS_FILES; do
  # Skip dist/ files (already copied)
  if [[ "$js_file" == dist/* ]]; then
    continue
  fi
  
  # Handle relative paths
  if [ -f "$js_file" ]; then
    # Create directory structure if needed
    dir_path=$(dirname "$js_file")
    if [ "$dir_path" != "." ]; then
      mkdir -p "$OUTPUT_DIR/$dir_path"
      cp "$js_file" "$OUTPUT_DIR/$js_file"
    else
      cp "$js_file" "$OUTPUT_DIR/"
    fi
    echo "   ✓ $js_file"
  else
    echo "   ⚠️  Missing: $js_file"
  fi
done

# Step 7: Remove ALL non-essential files and directories
echo "🧹 Removing non-essential files from $OUTPUT_DIR/..."

# Remove source files
find "$OUTPUT_DIR" -type f \( \
  -name "*.ts" -o \
  -name "*.tsx" -o \
  -name "*.d.ts" -o \
  -name "*.d.ts.map" -o \
  -name "*.map" -o \
  -name "*.md" -o \
  -name "*.test.js" -o \
  -name "*.spec.js" -o \
  -name "*.test.ts" -o \
  -name "*.spec.ts" -o \
  -name ".gitignore" -o \
  -name "tsconfig.json" -o \
  -name "package.json" -o \
  -name "package-lock.json" \
\) -delete

# Remove entire directories that shouldn't be there
for dir in "src" "node_modules" ".git" "tests" "test" "__tests__"; do
  if [ -d "$OUTPUT_DIR/$dir" ]; then
    rm -rf "$OUTPUT_DIR/$dir"
    echo "   🗑️  Removed $dir/"
  fi
done

# Remove legacy module directories that aren't explicitly referenced
# CRITICAL: components/ and ui/ are TypeScript-compiled modules, NOT legacy - preserve them!
# Only check legacy status for directories that might be legacy
LEGACY_DIRS=("core" "features" "utils" "services" "sidepanel" "types")
for dir in "${LEGACY_DIRS[@]}"; do
  # Check if any files in this directory are actually referenced
  REFERENCED=false
  for js_file in $JS_FILES; do
    if [[ "$js_file" == "$dir"/* ]]; then
      REFERENCED=true
      break
    fi
  done
  
  # If directory exists but nothing in it is referenced, remove it
  if [ -d "$OUTPUT_DIR/$dir" ] && [ "$REFERENCED" = false ]; then
    # Check if it's empty or only has files not in dist/
    if [ ! -d "$OUTPUT_DIR/dist/$dir" ]; then
      # This directory doesn't exist in dist/, so it's legacy - remove it
      rm -rf "$OUTPUT_DIR/$dir"
      echo "   🗑️  Removed legacy $dir/ directory"
    fi
  fi
done

# CRITICAL: Preserve components/ and ui/ directories (TypeScript-compiled modules)
# These are imported by CanopiModule and other modules, so they MUST exist
if [ -d "$OUTPUT_DIR/components" ]; then
  echo "   ✅ Preserved components/ directory (TypeScript-compiled modules)"
fi
if [ -d "$OUTPUT_DIR/ui" ]; then
  echo "   ✅ Preserved ui/ directory (TypeScript-compiled modules)"
fi

# Remove empty directories
find "$OUTPUT_DIR" -type d -empty -delete

# Final cleanup: Explicitly remove src/ and any other non-essential directories
echo "🔍 Final cleanup check..."
FORBIDDEN_DIRS=("src" "node_modules" ".git" "tests" "test" "__tests__" ".vscode" ".idea")
for dir in "${FORBIDDEN_DIRS[@]}"; do
  if [ -d "$OUTPUT_DIR/$dir" ]; then
    rm -rf "$OUTPUT_DIR/$dir"
    echo "   🗑️  Removed forbidden $dir/ directory"
  fi
done

# Step 9: Verify build
echo ""
echo "🔍 Verifying build..."
ESSENTIAL_CHECK=(
  "$OUTPUT_DIR/manifest.json"
  "$OUTPUT_DIR/sidepanel.html"
  "$OUTPUT_DIR/core"
  "$OUTPUT_DIR/features"
)

MISSING=0
for file in "${ESSENTIAL_CHECK[@]}"; do
  if [ ! -e "$file" ]; then
    echo "   ❌ Missing: $file"
    MISSING=1
  else
    echo "   ✓ $(basename "$file")"
  fi
done

if [ $MISSING -eq 1 ]; then
  echo ""
  echo "❌ Build verification failed!"
  exit 1
fi

# Step 10: Count files
JS_COUNT=$(find "$OUTPUT_DIR" -name "*.js" -type f | wc -l)
HTML_COUNT=$(find "$OUTPUT_DIR" -name "*.html" -type f | wc -l)
CSS_COUNT=$(find "$OUTPUT_DIR" -name "*.css" -type f | wc -l)
TOTAL_FILES=$(find "$OUTPUT_DIR" -type f | wc -l)

echo ""
echo "✅ Build complete! Clean extension ready in $OUTPUT_DIR/"
echo ""
echo "📊 Build statistics:"
echo "   - Total files: $TOTAL_FILES"
echo "   - JavaScript: $JS_COUNT"
echo "   - HTML: $HTML_COUNT"
echo "   - CSS: $CSS_COUNT"
echo "   - Compiled TypeScript: $(find "$OUTPUT_DIR/dist" -name "*.js" -type f 2>/dev/null | wc -l)"
echo ""
echo "📦 To load extension in Chrome:"
echo "   1. Open chrome://extensions/"
echo "   2. Enable 'Developer mode'"
echo "   3. Click 'Load unpacked'"
echo "   4. Select: $(pwd)/$OUTPUT_DIR"
echo ""

