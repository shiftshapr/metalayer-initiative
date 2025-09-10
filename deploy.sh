#!/bin/bash

# Metalayer Initiative - Deployment Script
echo "🚀 Deploying Metalayer Initiative..."

# Kill any existing processes
echo "🔄 Stopping existing processes..."
pkill -f "node app.js" || true
sleep 2

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start the server
echo "🌟 Starting Metalayer Initiative API..."
nohup node app.js > metalayer.log 2>&1 &

# Wait for server to start
sleep 3

# Test the API
echo "🧪 Testing API..."
if curl -s http://localhost:3002 > /dev/null; then
    echo "✅ API is running successfully on port 3002"
    echo "📡 Health check: $(curl -s http://localhost:3002)"
    echo "🔗 Available endpoints:"
    echo "   - GET  / (health check)"
    echo "   - POST /auth/login (mock login)"
    echo "   - GET  /auth/me (session info)"
    echo "   - GET  /communities (list communities)"
    echo "   - GET  /avatars (list avatars)"
    echo "   - POST /chat (chat with agents)"
    echo "   - GET  /poh (proof of humanity)"
    echo ""
    echo "🌐 Server accessible at: http://$(curl -s ifconfig.me):3002"
    echo "📋 Logs: tail -f metalayer.log"
else
    echo "❌ API failed to start. Check metalayer.log for errors."
    exit 1
fi
