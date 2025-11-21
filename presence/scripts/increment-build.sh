#!/bin/bash

# Build Number Incrementer
# Increments and logs the build number for tracking compiled versions

set -euo pipefail

PRESENCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PRESENCE_DIR"

BUILD_INFO_FILE=".build-info.json"
BUILD_LOG_FILE=".build-log.txt"

# Initialize build info if it doesn't exist
if [ ! -f "$BUILD_INFO_FILE" ]; then
  echo '{"buildNumber": 0, "firstBuild": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}' > "$BUILD_INFO_FILE"
fi

# Read current build number
BUILD_NUMBER=$(jq -r '.buildNumber // 0' "$BUILD_INFO_FILE" 2>/dev/null || echo "0")
BUILD_NUMBER=$((BUILD_NUMBER + 1))

# Get git commit if available
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# Update build info
BUILD_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BUILD_INFO=$(jq --arg bn "$BUILD_NUMBER" \
                 --arg ts "$BUILD_TIMESTAMP" \
                 --arg gc "$GIT_COMMIT" \
                 --arg gb "$GIT_BRANCH" \
                 '.buildNumber = ($bn | tonumber) | 
                  .lastBuild = $ts | 
                  .gitCommit = $gc | 
                  .gitBranch = $gb' \
                 "$BUILD_INFO_FILE" 2>/dev/null || \
  echo "{\"buildNumber\": $BUILD_NUMBER, \"lastBuild\": \"$BUILD_TIMESTAMP\", \"gitCommit\": \"$GIT_COMMIT\", \"gitBranch\": \"$GIT_BRANCH\"}")

echo "$BUILD_INFO" > "$BUILD_INFO_FILE"

# Log build
LOG_ENTRY="[$(date -u +"%Y-%m-%d %H:%M:%S UTC")] Build #$BUILD_NUMBER | Commit: $GIT_COMMIT | Branch: $GIT_BRANCH"
echo "$LOG_ENTRY" >> "$BUILD_LOG_FILE"

# Report build number to stderr (so it doesn't interfere with JSON output)
echo "🏗️ BUILD: #$BUILD_NUMBER | Commit: $GIT_COMMIT | Branch: $GIT_BRANCH | Time: $BUILD_TIMESTAMP" >&2

# Export for use in build scripts
export BUILD_NUMBER
export BUILD_TIMESTAMP
export GIT_COMMIT
export GIT_BRANCH

# Output JSON for programmatic access (to stdout only)
echo "$BUILD_INFO"

