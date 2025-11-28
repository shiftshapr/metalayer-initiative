#!/bin/bash
# Start canopi2-server.js

cd /home/ubuntu/canopi

# Check if already running
if lsof -Pi :3003 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Server already running on port 3003"
    exit 1
fi

echo "🚀 Starting canopi2-server on port 3003..."
node canopi2-server.js
