#!/bin/bash
# Batch migration script helper
# This script helps migrate markdown files to JAUmemory

echo "📦 Markdown Migration to JAUmemory"
echo "===================================="
echo ""

# Count files
FILE_COUNT=$(python3 -c "import json; f=open('markdown_migration_data.json'); d=json.load(f); print(len(d))")

echo "Found $FILE_COUNT markdown files to migrate"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Review markdown_migration_data.json first"
echo "   - Use MCP JAUmemory functions to migrate"
echo "   - After migration, delete markdown files"
echo ""
echo "📝 To migrate, use this pattern:"
echo ""
echo "   mcp_jaumemory_remember({"
echo "     content: <file_content>,"
echo "     context: 'From file: <relative_path>',"
echo "     tags: [<tags_array>],"
echo "     importance: 0.7,"
echo "     metadata: {"
echo "       original_filepath: '<filepath>',"
echo "       filename: '<filename>',"
echo "       type: 'markdown-documentation'"
echo "     }"
echo "   })"
echo ""
echo "📋 Sample files to migrate:"
python3 << 'PYTHON'
import json
with open('markdown_migration_data.json', 'r') as f:
    data = json.load(f)
for i, item in enumerate(data[:10], 1):
    print(f"   {i}. {item['filename']} ({len(item['tags'])} tags)")
PYTHON

echo ""
echo "✅ After migration completes, run:"
echo "   ./scripts/delete_migrated_markdowns.sh"






