#!/bin/bash
# Cleanup script to remove unnecessary TypeScript files from extension distribution
# Only keeps .js files required for runtime

set -e

echo "🧹 Cleaning up TypeScript files from extension distribution..."
echo ""

# Count files before cleanup
TS_FILES=$(find . -name "*.ts" -not -path "./src/*" | wc -l)
DTS_FILES=$(find . -name "*.d.ts" -not -path "./src/*" | wc -l)
MAP_FILES=$(find . -name "*.map" -not -path "./src/*" | wc -l)

echo "Files found:"
echo "  - .ts files (outside src/): $TS_FILES"
echo "  - .d.ts files (outside src/): $DTS_FILES"
echo "  - .map files (outside src/): $MAP_FILES"
echo ""

# Ask for confirmation
read -p "Remove these files? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 1
fi

# Remove .d.ts files (TypeScript declaration files - not needed at runtime)
echo "🗑️  Removing .d.ts files..."
find . -name "*.d.ts" -not -path "./src/*" -type f -delete
echo "✅ Removed .d.ts files"

# Remove .d.ts.map files (source maps for declarations)
echo "🗑️  Removing .d.ts.map files..."
find . -name "*.d.ts.map" -not -path "./src/*" -type f -delete
echo "✅ Removed .d.ts.map files"

# Remove .js.map files (source maps - debugging only)
echo "🗑️  Removing .js.map files..."
find . -name "*.js.map" -not -path "./src/*" -type f -delete
echo "✅ Removed .js.map files"

# Remove .ts files outside src/ (source files shouldn't be in distribution)
echo "🗑️  Removing .ts files (outside src/)..."
find . -name "*.ts" -not -path "./src/*" -type f -delete
echo "✅ Removed .ts files"

# Optional: Remove dist/ directory if it exists and is duplicate
if [ -d "./dist" ]; then
    echo ""
    read -p "Remove dist/ directory? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing dist/ directory..."
        rm -rf ./dist
        echo "✅ Removed dist/ directory"
    else
        echo "⏭️  Keeping dist/ directory"
    fi
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Remaining files:"
echo "  - .js files: $(find . -name "*.js" -not -path "./src/*" | wc -l)"
echo "  - src/ directory: $(if [ -d "./src" ]; then echo "kept"; else echo "removed"; fi)"
echo ""
echo "⚠️  Note: Only .js files are needed for the extension to run."
echo "   Source files in src/ are kept for development."

