#!/usr/bin/env bash
set -euo pipefail

# Script to apply Nginx configuration for view.canopi.live
# This ensures the Web3Auth test page is properly proxied to Express

CONFIG_FILE="/home/ubuntu/canopi/view.canopi.live.conf"
NGINX_SITE="/etc/nginx/sites-available/view.canopi.live"
NGINX_ENABLED="/etc/nginx/sites-enabled/view.canopi.live"

echo "=== Applying Nginx Configuration ==="
echo ""

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "ERROR: Config file not found: $CONFIG_FILE"
    exit 1
fi

# Copy config to Nginx sites-available
echo "1. Copying config to /etc/nginx/sites-available/..."
sudo cp "$CONFIG_FILE" "$NGINX_SITE"
echo "   ✓ Config copied"

# Create symlink to sites-enabled
echo "2. Creating symlink in sites-enabled..."
sudo ln -sf "$NGINX_SITE" "$NGINX_ENABLED"
echo "   ✓ Symlink created"

# Test Nginx configuration
echo "3. Testing Nginx configuration..."
if sudo nginx -t; then
    echo "   ✓ Nginx configuration is valid"
else
    echo "   ✗ ERROR: Nginx configuration test failed"
    exit 1
fi

# Reload Nginx
echo "4. Reloading Nginx..."
if sudo systemctl reload nginx; then
    echo "   ✓ Nginx reloaded successfully"
else
    echo "   ✗ ERROR: Failed to reload Nginx"
    exit 1
fi

# Verify the location block exists
echo "5. Verifying configuration..."
if sudo grep -q "location /web3auth-test" "$NGINX_SITE"; then
    echo "   ✓ /web3auth-test location block found"
else
    echo "   ✗ WARNING: /web3auth-test location block not found"
fi

# Test if Express is responding
echo "6. Testing Express backend..."
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3002/web3auth-test" | grep -q "200"; then
    echo "   ✓ Express backend is responding"
else
    echo "   ⚠ WARNING: Express backend may not be responding"
fi

echo ""
echo "=== Configuration Applied ==="
echo ""
echo "Test the endpoint:"
echo "  curl -s 'https://view.canopi.live/web3auth-test' | grep 'WEB3AUTH_CLIENT_ID'"
echo ""
echo "Or visit in browser:"
echo "  https://view.canopi.live/web3auth-test"
echo ""

