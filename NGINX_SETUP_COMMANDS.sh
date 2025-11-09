#!/bin/bash
# Nginx Setup Script for app.canopi.live and share.canopi.live

echo "🔧 Setting up nginx configuration for Canopi domains..."

# Copy configs to sites-available
sudo cp /home/ubuntu/metalayer-initiative/app.canopi.live.conf /etc/nginx/sites-available/app.canopi.live
sudo cp /home/ubuntu/metalayer-initiative/share.canopi.live.conf /etc/nginx/sites-available/share.canopi.live

# Enable sites
sudo ln -sf /etc/nginx/sites-available/app.canopi.live /etc/nginx/sites-enabled/app.canopi.live
sudo ln -sf /etc/nginx/sites-available/share.canopi.live /etc/nginx/sites-enabled/share.canopi.live

# Remove old canopi.live config if it exists
if [ -L /etc/nginx/sites-enabled/canopi.live ]; then
    echo "⚠️  Removing old canopi.live config (handled by Hostinger now)..."
    sudo rm /etc/nginx/sites-enabled/canopi.live
fi

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid!"
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully!"
    echo ""
    echo "📋 Summary:"
    echo "  - app.canopi.live → localhost:3002 ✅"
    echo "  - share.canopi.live → localhost:3002 ✅"
    echo ""
    echo "🧪 Test URLs:"
    echo "  - http://app.canopi.live/health"
    echo "  - http://share.canopi.live/health"
else
    echo "❌ Nginx configuration test failed. Please check the errors above."
    exit 1
fi

