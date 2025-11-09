#!/bin/bash
# Update nginx to use app.js (port 3002) instead of canopi2-server.js (port 3003)

echo "🔧 Updating nginx configuration to use app.js on port 3002..."

# Update share.canopi.live config
sudo cp /home/ubuntu/metalayer-initiative/share.canopi.live.conf /etc/nginx/sites-available/share.canopi.live

# Test nginx config
echo "🧪 Testing nginx config..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Config valid, reloading nginx..."
    sudo systemctl reload nginx
    echo ""
    echo "✅ Updated!"
    echo ""
    echo "📋 Port mapping:"
    echo "  - app.canopi.live → localhost:3002 (app.js)"
    echo "  - share.canopi.live → localhost:3002 (app.js)"
    echo ""
    echo "🧪 Test URLs:"
    echo "  - https://share.canopi.live/health"
    echo "  - https://share.canopi.live/share-message?message=TEST&page=TEST"
else
    echo "❌ Config test failed!"
    exit 1
fi






