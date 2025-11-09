#!/bin/bash
# Setup SSL for share.canopi.live

echo "🔒 Setting up SSL for share.canopi.live"
echo ""

# First, ensure HTTP config is correct
echo "1. Updating nginx HTTP config..."
sudo cp /home/ubuntu/metalayer-initiative/share.canopi.live.conf /etc/nginx/sites-available/share.canopi.live
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Nginx config test failed!"
    exit 1
fi

sudo systemctl reload nginx

# Check if cert already exists for share.canopi.live
if sudo certbot certificates 2>/dev/null | grep -q "share.canopi.live"; then
    echo "✅ SSL certificate already exists for share.canopi.live"
    echo "   Run: sudo certbot renew"
else
    echo "2. Creating SSL certificate..."
    echo "   This will use certbot to create SSL certificate for share.canopi.live"
    echo ""
    echo "   Run this command:"
    echo "   sudo certbot --nginx -d share.canopi.live"
    echo ""
    echo "   Or if you want to do it manually:"
    echo "   1. sudo certbot certonly --nginx -d share.canopi.live"
    echo "   2. Then add SSL server block to share.canopi.live.conf"
fi






