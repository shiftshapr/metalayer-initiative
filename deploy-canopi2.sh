#!/bin/bash

# Metalayer Initiative - Canopi2 Deployment Script
echo "🚀 Deploying Canopi2 Server..."

# Kill any existing processes
echo "🔄 Stopping existing processes..."
pkill -f "canopi2-server.js" || true
pkill -f "node.*3003" || true
sleep 2

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/canopi"

# Start the server
echo "🌟 Starting Canopi2 Server on port 3003..."
nohup node canopi2-server.js > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test the API
echo "🧪 Testing API..."
if curl -s http://216.238.91.120:3003/health > /dev/null 2>&1; then
    echo "✅ Canopi2 API is running successfully on port 3003"
    echo "📡 Health check: $(curl -s http://216.238.91.120:3003/health)"
    echo "🔗 Available endpoints:"
    echo "   - GET  /health (health check)"
    echo "   - POST /v1/presence/event (presence tracking)"
    echo "   - GET  /v1/presence/url (presence by URL)"
    echo "   - GET  /v1/presence/normalize-url (URL normalization)"
    echo "   - GET  /chat/history (chat history)"
    echo "   - POST /chat/send (send message)"
    echo "   - GET  /communities (list communities)"
    echo "   - GET  /users (user management)"
    echo ""
    echo "🌐 Server accessible at: http://216.238.91.120:3003"
    echo "📋 Logs: tail -f server.log"
    echo "🆔 Server PID: $SERVER_PID"
    echo "🛑 To stop: kill $SERVER_PID"
else
    echo "❌ API failed to start. Check server.log for errors."
    echo "📋 Recent logs:"
    tail -20 server.log
    exit 1
fi

