#!/bin/bash
# Setup script for Web3Auth test page on view.canopi.live

set -e

echo "🔧 Setting up Web3Auth test page on view.canopi.live..."

# 1. Copy nginx config
echo "📋 Copying nginx configuration..."
sudo cp /home/ubuntu/canopi/view.canopi.live.conf /etc/nginx/sites-available/view.canopi.live

# 2. Create symlink if it doesn't exist
if [ ! -L /etc/nginx/sites-enabled/view.canopi.live ]; then
    echo "🔗 Creating symlink..."
    sudo ln -s /etc/nginx/sites-available/view.canopi.live /etc/nginx/sites-enabled/view.canopi.live
fi

# 3. Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

# 4. Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

# 5. Check if SSL is already configured
if ! grep -q "ssl_certificate" /etc/nginx/sites-available/view.canopi.live; then
    echo "🔒 Setting up SSL certificate..."
    echo "   Run: sudo certbot --nginx -d view.canopi.live"
    echo "   This will automatically configure HTTPS"
else
    echo "✅ SSL certificate already configured"
fi

# 6. Verify file exists
if [ -f /home/ubuntu/canopi/public/web3auth-test/index.html ]; then
    echo "✅ Test page file exists"
else
    echo "❌ Test page file not found!"
    echo "   Expected: /home/ubuntu/canopi/public/web3auth-test/index.html"
    exit 1
fi

# 7. Check file permissions
echo "📝 Checking file permissions..."
ls -la /home/ubuntu/canopi/public/web3auth-test/

echo ""
echo "✅ Setup complete!"
echo ""
echo "📌 Next steps:"
echo "   1. If SSL is not set up, run: sudo certbot --nginx -d view.canopi.live"
echo "   2. Update Client ID in: /home/ubuntu/canopi/public/web3auth-test/index.html"
echo "   3. Whitelist domain in Web3Auth dashboard: https://view.canopi.live"
echo "   4. Test: https://view.canopi.live/web3auth-test/"
echo ""

