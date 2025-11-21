#!/usr/bin/env python3
"""
Script to replace legacyContext.currentUser with stateManagerInstance.getState('currentUser')
in ProfileManager.ts
"""

import re
import sys

def fix_legacy_references(content):
    """Replace legacyContext.currentUser patterns with stateManagerInstance equivalents"""
    
    # Pattern 1: Simple property access: legacyContext.currentUser
    # Replace with: await stateManagerInstance.getState('currentUser') as LegacyUser | null
    # But we need to handle async context - for now, create a helper variable
    
    # Pattern 2: legacyContext.currentUser?.property
    content = re.sub(
        r'legacyContext\.currentUser\?\.(\w+)',
        r'(await stateManagerInstance.getState(\'currentUser\') as LegacyUser | null)?.\\1',
        content
    )
    
    # Pattern 3: legacyContext.currentUser.property (non-optional)
    # This is trickier - need to get from stateManager first
    # For now, replace with a pattern that gets it first
    
    # Pattern 4: legacyContext.currentUser = value
    content = re.sub(
        r'legacyContext\.currentUser\s*=\s*',
        r'stateManagerInstance.setState(\'currentUser\', ',
        content
    )
    
    # Pattern 5: legacyContext.currentUser = undefined
    content = re.sub(
        r'legacyContext\.currentUser\s*=\s*undefined',
        r'stateManagerInstance.setState(\'currentUser\', null)',
        content
    )
    
    # Pattern 6: if (legacyContext.currentUser && legacyContext.currentUser.property)
    # This needs more context-aware replacement
    
    return content

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 fix-legacy-references.py <file>")
        sys.exit(1)
    
    filepath = sys.argv[1]
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Backup
    with open(filepath + '.bak', 'w') as f:
        f.write(content)
    
    # Apply fixes
    new_content = fix_legacy_references(content)
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    
    print(f"Fixed {filepath} (backup saved to {filepath}.bak)")

