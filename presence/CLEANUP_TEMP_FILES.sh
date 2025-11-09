#!/bin/bash
# Cleanup temporary orchestration reports (keep only latest)

# Keep these important files
KEEP_FILES=(
  "TASK_INVOCATION_TEMPLATE.md"
  "COLLABORATION_WORKFLOW_MANIFEST.md"
  "ORCHESTRATION_REPORT_FOCUS_MODE_REPLY_UNIFIED.md"
  "FOCUS_MODE_REPLY_UNIFIED_ORCHESTRATION.js"
)

# Remove old orchestration reports
find . -maxdepth 1 -type f -name "ORCHESTRATION_REPORT_*.md" ! -name "ORCHESTRATION_REPORT_FOCUS_MODE_REPLY_UNIFIED.md" -delete
find . -maxdepth 1 -type f -name "*ORCHESTRATION*.js" ! -name "FOCUS_MODE_REPLY_UNIFIED_ORCHESTRATION.js" -delete

# Remove other temporary markdown files (keep important ones)
find . -maxdepth 1 -type f -name "*.md" ! -name "README.md" ! -name "TASK_INVOCATION_TEMPLATE.md" ! -name "COLLABORATION_WORKFLOW_MANIFEST.md" ! -name "ORCHESTRATION_REPORT_FOCUS_MODE_REPLY_UNIFIED.md" -delete

echo "✅ Cleanup complete"
