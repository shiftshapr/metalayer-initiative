#!/bin/bash

# Sync compiled TypeScript output from dist/ into the extension/ directory
# so the unpacked Chrome extension always reflects the latest build artifacts.

set -euo pipefail

PRESENCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PRESENCE_DIR"

# Increment build number before syncing
echo "🔢 Incrementing build number..."
# Run increment script and capture JSON output (last line is JSON)
BUILD_INFO_JSON=$(bash scripts/increment-build.sh 2>&1 | grep -E '^\{' | tail -1)

# If JSON parsing failed, read directly from .build-info.json
if [ -z "$BUILD_INFO_JSON" ] || ! echo "$BUILD_INFO_JSON" | jq . >/dev/null 2>&1; then
  if [ -f ".build-info.json" ]; then
    BUILD_INFO_JSON=$(cat .build-info.json)
  else
    BUILD_INFO_JSON='{"buildNumber": 0, "lastBuild": "", "gitCommit": "unknown", "gitBranch": "unknown"}'
  fi
fi

BUILD_NUMBER=$(echo "$BUILD_INFO_JSON" | jq -r '.buildNumber // 0' 2>/dev/null || echo "0")
BUILD_TIMESTAMP=$(echo "$BUILD_INFO_JSON" | jq -r '.lastBuild // ""' 2>/dev/null || echo "")
GIT_COMMIT=$(echo "$BUILD_INFO_JSON" | jq -r '.gitCommit // "unknown"' 2>/dev/null || echo "unknown")
GIT_BRANCH=$(echo "$BUILD_INFO_JSON" | jq -r '.gitBranch // "unknown"' 2>/dev/null || echo "unknown")

echo "🏗️ BUILD: #$BUILD_NUMBER | Commit: $GIT_COMMIT | Branch: $GIT_BRANCH"

DIST_DIR="dist"
EXT_DIR="extension"

if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Cannot sync extension: dist/ directory not found. Run TypeScript build first."
  exit 1
fi

mkdir -p "$EXT_DIR"

echo "🔄 Syncing compiled files from $DIST_DIR/ to $EXT_DIR/ ..."

# Copy JS files while preserving relative structure (no dist/ prefix in extension)
find "$DIST_DIR" -type f -name "*.js" | while read -r file; do
  rel_path="${file#${DIST_DIR}/}"
  target_path="$EXT_DIR/$rel_path"
  target_dir="$(dirname "$target_path")"
  mkdir -p "$target_dir"
  cp "$file" "$target_path"
  echo "   • $rel_path"
done

# ROOT CAUSE FIX: Copy CSS and HTML files from source to extension/
echo "🔄 Copying asset files (CSS, HTML) to $EXT_DIR/ ..."
ASSET_FILES=(
  "sidepanel.css"
  "sidepanel.html"
)

for file in "${ASSET_FILES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$EXT_DIR/$file"
    echo "   • $file"
  else
    echo "   ⚠️  Warning: $file not found in source directory"
  fi
done

# Copy hand-authored JavaScript files that aren't compiled from TypeScript
HAND_AUTHED_FILES=(
  "real-google-auth.js"
  # Diagnostic scripts removed - not loaded in sidepanel.html
  # "scripts/diagnose-auth.js"
  # "scripts/diagnose-remaining-errors.js"
)

for file in "${HAND_AUTHED_FILES[@]}"; do
  if [ -f "$file" ]; then
    target_path="$EXT_DIR/$file"
    target_dir="$(dirname "$target_path")"
    mkdir -p "$target_dir"
    cp "$file" "$target_path"
    echo "   • $file (hand-authored)"
  fi
done

# Inject build info into a build info file that can be loaded by the extension
BUILD_INFO_JS="extension/.build-info.js"
cat > "$BUILD_INFO_JS" << EOF
// Auto-generated build info - DO NOT EDIT
// Generated at build time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
window.__BUILD_INFO__ = {
  buildNumber: $BUILD_NUMBER,
  timestamp: "$BUILD_TIMESTAMP",
  gitCommit: "$GIT_COMMIT",
  gitBranch: "$GIT_BRANCH",
  buildTime: "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
};
EOF

# Also emit JSON version for runtime fetching
BUILD_INFO_JSON_FILE="extension/.build-info.json"
cat > "$BUILD_INFO_JSON_FILE" << EOF
{
  "buildNumber": $BUILD_NUMBER,
  "timestamp": "$BUILD_TIMESTAMP",
  "gitCommit": "$GIT_COMMIT",
  "gitBranch": "$GIT_BRANCH",
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "✅ Extension synced with latest compiled files."
echo "📋 Build info injected: Build #$BUILD_NUMBER"
