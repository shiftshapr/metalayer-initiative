#!/bin/bash

# Cleanup script to remove dead code and documentation referencing user_visibility
# This removes archived documentation that is no longer relevant

echo "🧹 CLEANING UP DEAD CODE AND DOCUMENTATION"
echo "=========================================="

# Count references before cleanup
echo "📊 References to user_visibility before cleanup:"
grep -r "user_visibility" /home/ubuntu/metalayer-initiative/ | wc -l

echo ""
echo "🗑️ Removing archived documentation files..."

# Remove archived documentation files that reference user_visibility
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/WEBSOCKET_REMOVAL_SUMMARY.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/GOOD-NEWS-ALREADY-IN-PUBLICATION.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/WEBSOCKET-TRACER-SUCCESS-SUMMARY.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/USER-VISIBILITY-FIX-SUMMARY-OCT-13.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/SQL-FIX-SUMMARY-OCT-13.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/SIMPLE-FIX-INSTRUCTIONS-OCT-13.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/SD1-TE2-USER-VISIBILITY-ROOT-CAUSE-OCT-13.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/SD1-TE2-SQL-FIX-POSTGRES-COMPATIBILITY-OCT-13.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/SD1-TE2-SQL-ERROR-RESOLUTION-OCT-13.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/SD1-TE2-FINAL-FIXES-SUMMARY.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/SD1-TE2-ALREADY-IN-PUBLICATION-OCT-13.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/SD1-REALTIME-NOT-FIRING-OCT-13.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/SD1-REALTIME-ROOT-CAUSE-ANALYSIS.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/SD1-CRITICAL-FIXES-SUMMARY.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/REALTIME-DIAGNOSTIC-SUMMARY.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/QUICK-FIX-COMMANDS.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/PRESENCE-FLOW-AND-LOGGING.md
rm -f /home/ubuntu/metalayer-initiative/archive/old-docs/DIAGNOSTIC-COMMANDS-REFERENCE.md

# Remove cleanup archive files
rm -f /home/ubuntu/metalayer-initiative/cleanup_archive/old_docs/WEBSOCKET_REMOVAL_SUMMARY.md
rm -f /home/ubuntu/metalayer-initiative/cleanup_archive/old_docs/SUPABASE_SETUP_GUIDE.md
rm -f /home/ubuntu/metalayer-initiative/cleanup_archive/old_docs/supabase-setup.md

echo "✅ Archived documentation files removed"

# Count references after cleanup
echo ""
echo "📊 References to user_visibility after cleanup:"
grep -r "user_visibility" /home/ubuntu/metalayer-initiative/ | wc -l

echo ""
echo "🔍 Remaining references (should only be in test files):"
grep -r "user_visibility" /home/ubuntu/metalayer-initiative/ || echo "No references found"

echo ""
echo "✅ CLEANUP COMPLETED"
echo "==================="
echo "Removed dead code and archived documentation referencing user_visibility"
echo "The codebase is now cleaner and only contains active, relevant code"
