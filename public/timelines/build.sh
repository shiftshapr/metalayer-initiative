#!/bin/bash
# Build script for Timeline TypeScript
# Fixes missing imports that TypeScript removes

set -e

echo "🔨 Building Timeline TypeScript..."

# Compile TypeScript (from project root)
cd "$(dirname "$0")/../.."
npx tsc -p tsconfig.timeline.json
cd public/timelines

# Add missing imports that TypeScript removes (can't resolve /presence/ paths)
echo "🔧 Adding missing runtime imports..."
python3 << 'PYTHON'
import re

with open('dist/timeline-app.js', 'r') as f:
    content = f.read()

# Check if imports already exist
if '/presence/utils/AvatarUtils.js' in content:
    print("✅ Imports already present")
else:
    # Add imports after the RED-LINE comment
    imports = """// @ts-ignore - Runtime paths, TypeScript can't resolve
import { AvatarUtils } from '/presence/utils/AvatarUtils.js';
// @ts-ignore - Runtime paths, TypeScript can't resolve
import { AuthManager } from '/presence/features/AuthManager.js';
// @ts-ignore - Runtime paths, TypeScript can't resolve
import { SupabaseService } from '/presence/services/SupabaseService.js';
"""
    
    # Find insertion point
    lines = content.split('\n')
    insert_idx = None
    for i, line in enumerate(lines):
        if 'RED-LINE: Timeline scripts MUST import modules directly' in line:
            insert_idx = i + 1
            break
    
    if insert_idx:
        lines.insert(insert_idx, imports)
        with open('dist/timeline-app.js', 'w') as f:
            f.write('\n'.join(lines))
        print("✅ Added runtime imports")
    else:
        print("❌ Could not find insertion point")

PYTHON

echo "✅ Build complete!"

