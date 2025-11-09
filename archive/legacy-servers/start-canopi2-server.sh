#!/bin/bash
# Start canopi2-server.js on port 3003

cd /home/ubuntu/metalayer-initiative

# Check if already running
if lsof -i :3003 > /dev/null 2>&1; then
    echo "⚠️  Port 3003 is already in use"
    echo "   Stopping existing process..."
    pkill -f "node.*canopi2-server" || true
    sleep 2
fi

echo "🚀 Starting canopi2-server.js on port 3003..."

# Start with PORT environment variable
PORT=3003 node canopi2-server.js > /tmp/canopi2-server.log 2>&1 &

# Wait a moment for it to start
sleep 2

# Check if it's running
if curl -s http://localhost:3003/health > /dev/null 2>&1; then
    echo "✅ canopi2-server.js is running on port 3003"
    echo "   Health check: http://localhost:3003/health"
    echo "   Logs: tail -f /tmp/canopi2-server.log"
else
    echo "❌ Failed to start canopi2-server.js"
    echo "   Check logs: cat /tmp/canopi2-server.log"
    exit 1
fi

