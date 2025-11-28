#!/bin/bash

# Pre-edit validation script
# Run this BEFORE editing any file to check if it's allowed

set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: $0 <file-path>"
  echo "Example: $0 extension/features/MessagesModule.js"
  exit 1
fi

FILE_PATH="$1"

# Check if file is in a restricted directory
RESTRICTED_DIRS=("extension/" "dist/" "build/")

for dir in "${RESTRICTED_DIRS[@]}"; do
  if [[ "$FILE_PATH" == "$dir"* ]]; then
    echo "❌ BLOCKED: Cannot edit file in $dir directory"
    echo ""
    echo "File: $FILE_PATH"
    echo ""
    echo "This is a COMPILED OUTPUT file. Do not edit directly."
    echo ""
    
    # Try to find source file
    REL_PATH="${FILE_PATH#$dir}"
    SRC_FILE="src/${REL_PATH%.js}.ts"
    
    if [ -f "$SRC_FILE" ]; then
      echo "✅ Source file found: $SRC_FILE"
      echo "   → Edit this TypeScript source file instead"
    else
      echo "⚠️  No TypeScript source found at: $SRC_FILE"
      echo "   → Create the source file in src/ first"
      echo "   → Then build: npx tsc && bash scripts/sync-extension-from-dist.sh"
    fi
    
    exit 1
  fi
done

# Check if it's a compiled JS file with TS source
if [[ "$FILE_PATH" == *.js ]]; then
  TS_SOURCE="${FILE_PATH%.js}.ts"
  if [ -f "$TS_SOURCE" ]; then
    echo "⚠️  WARNING: This is a JavaScript file, but TypeScript source exists:"
    echo "   → $TS_SOURCE"
    echo "   → Consider editing the TypeScript source instead"
    echo ""
    read -p "Continue editing JS file? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
fi

echo "✅ File is safe to edit: $FILE_PATH"
exit 0




