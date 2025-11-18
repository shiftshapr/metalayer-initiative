#!/bin/bash
cd /home/ubuntu/metalayer-initiative/presence
echo "Compiling CanopiModule.ts..."
npx tsc src/features/CanopiModule.ts \
  --outDir features \
  --module es2020 \
  --target es2020 \
  --moduleResolution node \
  --skipLibCheck \
  --lib es2020,dom \
  --esModuleInterop \
  --allowSyntheticDefaultImports \
  --declaration false \
  --noEmit false \
  2>&1
echo "Exit code: $?"
if [ -f features/CanopiModule.js ]; then
  echo "✅ File created: features/CanopiModule.js"
  echo "Size: $(wc -l < features/CanopiModule.js) lines"
  echo "Checking for fixes..."
  grep -c "api.addReaction" features/CanopiModule.js && echo "✅ API call found" || echo "❌ API call missing"
  grep -c "data-listeners-attached" features/CanopiModule.js && echo "✅ Listener marking found" || echo "❌ Listener marking missing"
  grep -c "api.toggleBookmark" features/CanopiModule.js && echo "✅ Bookmark API found" || echo "❌ Bookmark API missing"
else
  echo "❌ File not created"
fi
