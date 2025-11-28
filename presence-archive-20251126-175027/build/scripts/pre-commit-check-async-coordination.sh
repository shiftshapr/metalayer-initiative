#!/bin/bash
# Pre-commit hook to detect setTimeout anti-patterns in async coordination
# 
# This script detects setTimeout delays used for async coordination,
# which is an anti-pattern. Use proper async coordination instead.

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|js)$' || true)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

VIOLATIONS=0
WARNINGS=0

echo "🔍 Checking for setTimeout anti-patterns in async coordination..."

for file in $STAGED_FILES; do
  # Skip if file doesn't exist (might be deleted)
  if [ ! -f "$file" ]; then
    continue
  fi
  
  # Check for setTimeout with delays >= 100ms in async functions
  # Pattern: setTimeout(async () => { ... }, NUMBER)
  # or setTimeout(() => { async code }, NUMBER)
  
  # Check for setTimeout in async functions with numeric delays
  if grep -n "setTimeout.*async\|setTimeout.*await" "$file" | grep -E "setTimeout.*[0-9]{3,}" > /dev/null; then
    echo -e "${RED}❌ VIOLATION:${NC} $file"
    echo -e "   ${RED}Found setTimeout with delay >= 100ms in async context${NC}"
    echo -e "   ${YELLOW}Use proper async coordination: await events, promises, or dependency injection${NC}"
    echo -e "   ${YELLOW}See .cursorrules 'Async Coordination Best Practices' section${NC}"
    grep -n "setTimeout.*async\|setTimeout.*await" "$file" | grep -E "setTimeout.*[0-9]{3,}" | head -5
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
  
  # Check for setTimeout with variable delays in async functions (suspicious)
  if grep -n "setTimeout.*async\|setTimeout.*await" "$file" | grep -v "setTimeout.*0\|setTimeout.*1\|setTimeout.*10" > /dev/null; then
    echo -e "${YELLOW}⚠️  WARNING:${NC} $file"
    echo -e "   ${YELLOW}Found setTimeout in async context - verify this is not for coordination${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
done

if [ $VIOLATIONS -gt 0 ]; then
  echo ""
  echo -e "${RED}❌ Pre-commit check FAILED${NC}"
  echo -e "${RED}Found $VIOLATIONS violation(s) of async coordination best practices${NC}"
  echo ""
  echo "BEST PRACTICE: Use proper async coordination instead of setTimeout delays:"
  echo "  - await waitForEvent('eventName')"
  echo "  - await waitForCondition(() => condition)"
  echo "  - await ensureDependencyReady()"
  echo "  - Sequential await: await dep1.init(); await dep2.init();"
  echo ""
  echo "See .cursorrules 'Async Coordination Best Practices' section for details."
  exit 1
fi

if [ $WARNINGS -gt 0 ]; then
  echo ""
  echo -e "${YELLOW}⚠️  Pre-commit check passed with $WARNINGS warning(s)${NC}"
  echo -e "${YELLOW}Please verify setTimeout usage is appropriate (animations, debouncing, etc.)${NC}"
fi

if [ $VIOLATIONS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ No setTimeout anti-patterns detected${NC}"
fi

exit 0

