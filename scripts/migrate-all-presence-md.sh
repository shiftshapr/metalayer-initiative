#!/bin/bash
# Script to delete all migrated markdown files from presence/ folder
# Run after verifying all files are stored in JAUmemory

cd "$(dirname "$0")/.." || exit 1

echo "Deleting markdown files from presence/ folder..."
echo ""

# Count files before deletion
COUNT=$(find presence -maxdepth 1 -name "*.md" -type f | wc -l)
echo "Found $COUNT markdown files to delete"

# List files that will be deleted
echo ""
echo "Files to be deleted:"
find presence -maxdepth 1 -name "*.md" -type f | sort

echo ""
read -p "Continue with deletion? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    find presence -maxdepth 1 -name "*.md" -type f -delete
    echo "✅ Deleted $COUNT markdown files"
    
    # Verify deletion
    REMAINING=$(find presence -maxdepth 1 -name "*.md" -type f | wc -l)
    echo "Remaining markdown files: $REMAINING"
else
    echo "❌ Deletion cancelled"
fi






