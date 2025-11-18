#!/usr/bin/env bash
set -euo pipefail

# Setup script for timeline.canopi.live subdomain
# This script:
# 1. Copies nginx config for timeline.canopi.live
# 2. Enables the site
# 3. Tests nginx configuration
# 4. Provides instructions for SSL certificate setup

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_FILE="$ROOT_DIR/timeline.canopi.live.conf"
NGINX_AVAILABLE="/etc/nginx/sites-available/timeline.canopi.live"
NGINX_ENABLED="/etc/nginx/sites-enabled/timeline.canopi.live"

echo "🔧 Setting up timeline.canopi.live subdomain..."

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "❌ This script requires sudo privileges"
    echo "   Please run: sudo bash $0"
    exit 1
fi

# Step 1: Copy nginx config
echo "📋 Step 1: Copying nginx configuration..."
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Config file not found: $CONFIG_FILE"
    exit 1
fi

cp "$CONFIG_FILE" "$NGINX_AVAILABLE"
echo "✅ Config copied to $NGINX_AVAILABLE"

# Step 2: Enable site
echo "📋 Step 2: Enabling site..."
ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"
echo "✅ Site enabled: $NGINX_ENABLED"

# Step 3: Test nginx configuration
echo "📋 Step 3: Testing nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi

# Step 4: Reload nginx
echo "📋 Step 4: Reloading nginx..."
systemctl reload nginx
echo "✅ Nginx reloaded"

echo ""
echo "✅ Timeline subdomain setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. DNS Configuration:"
echo "   Add A record for timeline.canopi.live pointing to your server IP"
echo "   (Check current IP with: curl -4 ifconfig.me)"
echo ""
echo "2. SSL Certificate Setup:"
echo "   Once DNS is configured, run:"
echo "   sudo certbot --nginx -d timeline.canopi.live"
echo ""
echo "3. Verify setup:"
echo "   - HTTP:  curl -I http://timeline.canopi.live/timelines/test"
echo "   - HTTPS: curl -I https://timeline.canopi.live/timelines/test (after SSL)"
echo ""
echo "📝 Current status:"
echo "   - Nginx config: ✅ Enabled"
echo "   - SSL: ⏳ Pending (requires DNS + certbot)"
echo ""

