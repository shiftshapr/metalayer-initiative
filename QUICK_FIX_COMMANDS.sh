#!/bin/bash
# Quick fix for domain routing issues

echo "🔧 Fixing nginx configuration..."

# Update share.canopi.live config (already done in file, just copy it)
sudo cp /home/ubuntu/metalayer-initiative/share.canopi.live.conf /etc/nginx/sites-available/share.canopi.live

# Enable app.canopi.live
sudo cp /home/ubuntu/metalayer-initiative/app.canopi.live.conf /etc/nginx/sites-available/app.canopi.live
sudo ln -sf /etc/nginx/sites-available/app.canopi.live /etc/nginx/sites-enabled/app.canopi.live

# Test and reload
echo "🧪 Testing nginx config..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Config valid, reloading nginx..."
    sudo systemctl reload nginx
    echo ""
    echo "✅ Fixed!"
    echo ""
    echo "📋 Port mapping:"
    echo "  - app.canopi.live → localhost:3002 (app.js)"
    echo "  - share.canopi.live → localhost:3002 (app.js)"
    echo ""
    echo "🧪 Test URLs:"
    echo "  - http://app.canopi.live/health"
    echo "  - http://share.canopi.live/health"
    echo "  - http://share.canopi.live/share-message?message=TEST&page=TEST"
else
    echo "❌ Config test failed!"
    exit 1
fi

