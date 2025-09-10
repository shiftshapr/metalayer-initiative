#!/bin/bash

# Sync Chrome Extension Files from VPS to MacBook
# Usage: ./sync-extension.sh (runs on VPS)

# Configuration
VPS_PATH="/home/ubuntu/metalayer-initiative/presence"
MACBOOK_USER="daveed"
MACBOOK_IP="10.0.0.81"
MACBOOK_PATH="/Users/daveed/Public/meta/src/metaweb/BRC333/meta-layer"
PEM_KEY="/home/ubuntu/.ssh/ordweb2.pem"  # SSH key on VPS

echo "🚀 Syncing Chrome Extension files from VPS to MacBook..."

# Check if SSH key exists
if [ ! -f "$PEM_KEY" ]; then
    echo "❌ SSH key not found at $PEM_KEY"
    echo "📋 You need to copy your SSH key to the VPS first:"
    echo "   scp -i ../../../../../../.terminal/ordweb2.pem ../../../../../../.terminal/ordweb2.pem ubuntu@216.238.91.120:~/.ssh/"
    exit 1
fi

# Sync files from VPS to MacBook using SSH key
rsync -avz --delete \
  --exclude='*.log' \
  --exclude='node_modules' \
  --exclude='.git' \
  -e "ssh -i $PEM_KEY -o StrictHostKeyChecking=no" \
  "$VPS_PATH/" \
  "$MACBOOK_USER@$MACBOOK_IP:$MACBOOK_PATH/"

if [ $? -eq 0 ]; then
    echo "✅ Sync completed successfully!"
    echo "📁 Files synced to MacBook: $MACBOOK_PATH"
    echo "📱 You can now reload the extension in Chrome"
else
    echo "❌ Sync failed!"
    echo "🔍 Check if:"
    echo "   1. SSH key is on VPS: $PEM_KEY"
    echo "   2. MacBook accepts SSH connections"
    echo "   3. Firewall allows SSH (port 22)"
    exit 1
fi
