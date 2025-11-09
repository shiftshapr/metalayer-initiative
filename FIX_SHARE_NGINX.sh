#!/bin/bash
# Fix nginx config for share.canopi.live - update to port 3002

echo "🔧 Fixing nginx config for share.canopi.live..."

# Copy updated config
sudo cp /home/ubuntu/metalayer-initiative/share.canopi.live.conf /etc/nginx/sites-available/share.canopi.live

# Test nginx config
echo "🧪 Testing nginx config..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Config valid, reloading nginx..."
    sudo systemctl reload nginx
    echo ""
    echo "✅ Fixed! share.canopi.live now points to port 3002 (app.js)"
    echo ""
    echo "🧪 Test:"
    echo "  curl -I http://share.canopi.live/share-message?message=TEST&page=TEST"
else
    echo "❌ Config test failed!"
    exit 1
fi






