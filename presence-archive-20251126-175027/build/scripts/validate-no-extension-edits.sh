#!/bin/bash

# Validation script to detect if files in extension/ were edited directly
# This should be run before commits or as a pre-commit hook

set -euo pipefail

PRESENCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PRESENCE_DIR"

VIOLATIONS=0
EXTENSION_DIR="extension"

# Check if extension/ directory exists
if [ ! -d "$EXTENSION_DIR" ]; then
  echo "✅ No extension/ directory found - nothing to validate"
  exit 0
fi

# Get list of recently modified files in extension/ (last 24 hours)
# This catches files that might have been edited directly
echo "🔍 Checking for direct edits to extension/ files..."

# Check git status for extension/ files
if command -v git >/dev/null 2>&1; then
  # Check for staged changes in extension/
  STAGED_EXTENSION_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep "^extension/" || true)
  
  if [ -n "$STAGED_EXTENSION_FILES" ]; then
    echo "❌ VIOLATION DETECTED: Files in extension/ are staged for commit!"
    echo ""
    echo "The following files in extension/ were modified:"
    echo "$STAGED_EXTENSION_FILES" | while read -r file; do
      echo "  - $file"
      
      # Try to find corresponding source file
      REL_PATH="${file#extension/}"
      SRC_FILE="src/${REL_PATH%.js}.ts"
      
      if [ -f "$SRC_FILE" ]; then
        echo "    → Source file exists: $SRC_FILE"
        echo "    → Edit the TypeScript source instead!"
      else
        echo "    → No TypeScript source found - create it in src/ first"
      fi
    done
    echo ""
    echo "🚫 COMMIT BLOCKED: Do not commit changes to extension/ files"
    echo "📝 Action required:"
    echo "   1. Unstage these files: git reset HEAD extension/"
    echo "   2. Find/edit the source files in src/ instead"
    echo "   3. Rebuild: npx tsc && bash scripts/sync-extension-from-dist.sh"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
  
  # Check for unstaged changes in extension/
  UNSTAGED_EXTENSION_FILES=$(git diff --name-only --diff-filter=ACM | grep "^extension/" || true)
  
  if [ -n "$UNSTAGED_EXTENSION_FILES" ]; then
    echo "⚠️  WARNING: Unstaged changes detected in extension/ files:"
    echo "$UNSTAGED_EXTENSION_FILES" | while read -r file; do
      echo "  - $file"
    done
    echo ""
    echo "💡 These files should not be edited directly."
    echo "   Edit the source files in src/ instead and rebuild."
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
fi

# Check file modification times (files modified in last hour)
if [ "$VIOLATIONS" -eq 0 ]; then
  RECENT_FILES=$(find "$EXTENSION_DIR" -type f -name "*.js" -mmin -60 2>/dev/null | head -10 || true)
  
  if [ -n "$RECENT_FILES" ]; then
    echo "⚠️  WARNING: Recent modifications detected in extension/ files (last hour):"
    echo "$RECENT_FILES" | while read -r file; do
      echo "  - $file (modified: $(stat -c %y "$file" 2>/dev/null || stat -f %Sm "$file" 2>/dev/null || echo 'unknown'))"
    done
    echo ""
    echo "💡 If you edited these directly, please:"
    echo "   1. Revert the changes"
    echo "   2. Edit the source files in src/ instead"
    echo "   3. Rebuild: npx tsc && bash scripts/sync-extension-from-dist.sh"
  fi
fi

if [ "$VIOLATIONS" -eq 0 ]; then
  echo "✅ No violations detected - extension/ files appear untouched"
  exit 0
else
  echo ""
  echo "❌ Validation failed: $VIOLATIONS violation(s) detected"
  exit 1
fi




