#!/bin/bash
# Batch migration helper script
# This generates commands to migrate all markdowns to JAUmemory

echo "📦 Markdown to JAUmemory Migration"
echo "==================================="
echo ""
echo "This script prepares all markdown files for migration."
echo "Review markdown_migration_data.json first."
echo ""
echo "⚠️  Note: Actual migration requires MCP JAUmemory access"
echo "   Run migration commands via AI assistant with MCP access"
echo ""
echo "✅ Migration data ready: markdown_migration_data.json"
echo "   Total files: $(python3 -c "import json; f=open('markdown_migration_data.json'); d=json.load(f); print(len(d))")"
echo ""
echo "📝 To migrate, use pattern:"
echo "   mcp_jaumemory_remember({"
echo "     content: '<file_content>',"
echo "     context: 'From: <relative_path>',"
echo "     tags: [<tags>],"
echo "     importance: 0.7"
echo "   })"
