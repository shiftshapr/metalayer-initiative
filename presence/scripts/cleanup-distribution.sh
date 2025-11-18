#!/bin/bash
# Cleanup script to remove non-distribution files from presence directory
# This ensures only necessary files are included in the extension distribution

set -e

PRESENCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PRESENCE_DIR"

echo "🧹 Cleaning up presence directory (extension distribution)..."

# Create archive directory for files we're removing (for safety)
ARCHIVE_DIR="../presence-archive-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$ARCHIVE_DIR"

# Function to safely move files
move_to_archive() {
  local file="$1"
  if [ -e "$file" ]; then
    local dirname=$(dirname "$file")
    mkdir -p "$ARCHIVE_DIR/$dirname"
    mv "$file" "$ARCHIVE_DIR/$file" 2>/dev/null || true
    echo "  📦 Archived: $file"
  fi
}

# Remove all markdown files
echo "📝 Removing markdown documentation files..."
find . -maxdepth 1 -name "*.md" -type f | while read file; do
  move_to_archive "$file"
done

# Remove docs directory
if [ -d "docs" ]; then
  move_to_archive "docs"
fi

# Remove TypeScript source files and src/ directory (source should be outside presence/)
echo "📦 Removing TypeScript source files and src/ directory..."
if [ -d "src" ]; then
  move_to_archive "src"
fi
find . -maxdepth 1 -name "*.ts" -type f | while read file; do
  move_to_archive "$file"
done

# Remove dist/ directory (compiled files should be in presence/ root, not dist/)
if [ -d "dist" ]; then
  echo "📁 Archiving dist/ directory (compiled files should be in root)..."
  move_to_archive "dist"
fi

# Remove build scripts
echo "🔧 Removing build/cleanup scripts..."
find . -maxdepth 1 -name "*.sh" -type f | while read file; do
  move_to_archive "$file"
done

# Remove SQL files
echo "🗄️  Removing SQL migration files..."
find . -maxdepth 1 -name "*.sql" -type f | while read file; do
  move_to_archive "$file"
done

# Remove test files
echo "🧪 Removing test files..."
find . -maxdepth 1 \( -name "*test*.js" -o -name "*TEST*.js" -o -name "*test*.ts" -o -name "*TEST*.ts" \) -type f | while read file; do
  move_to_archive "$file"
done

# Remove diagnostic/temporary files
echo "🔍 Removing diagnostic/temporary files..."
find . -maxdepth 1 \( -name "DIAGNOSTIC_*.js" -o -name "*_DIAGNOSTIC.js" -o -name "COMPREHENSIVE_*.js" -o -name "console_*.js" -o -name "debug_*.js" -o -name "test_*.js" -o -name "*.tmp" -o -name "*.temp" -o -name "*.log" -o -name "CLEANUP_LOG.json" -o -name "false" \) -type f | while read file; do
  move_to_archive "$file"
done

# Remove build directory if it exists (should use dist/ instead)
if [ -d "build" ] && [ "$(basename $(pwd))" = "presence" ]; then
  echo "📁 Archiving build/ directory..."
  move_to_archive "build"
fi

# Remove scripts directory from root (should be in scripts/ subdirectory)
if [ -d "scripts" ] && [ ! -f "scripts/cleanup-distribution.sh" ]; then
  echo "📁 Archiving root scripts/ directory..."
  find scripts -type f ! -name "cleanup-distribution.sh" ! -name "build-distribution.sh" ! -name "enforce-fallback-policy.js" | while read file; do
    move_to_archive "$file"
  done
fi

# Remove source maps (optional - comment out if you want to keep them for debugging)
echo "🗺️  Removing source maps..."
find dist -name "*.map" -type f 2>/dev/null | while read file; do
  rm -f "$file"
  echo "  🗑️  Removed: $file"
done

# Remove TypeScript declaration maps
find dist -name "*.d.ts.map" -type f 2>/dev/null | while read file; do
  rm -f "$file"
  echo "  🗑️  Removed: $file"
done

echo ""
echo "✅ Cleanup complete!"
echo "📦 Archived files moved to: $ARCHIVE_DIR"
echo ""
echo "📋 Remaining files in distribution:"
echo "   - manifest.json"
echo "   - sidepanel.html, sidepanel.css, sidepanel.js"
echo "   - background.js, content.js, content.css"
echo "   - dist/ (compiled TypeScript)"
echo "   - images/, lib/, auth/ (assets)"
echo "   - Core JS files needed at runtime"
echo ""
echo "⚠️  Review the archive before deleting to ensure nothing important was removed!"

