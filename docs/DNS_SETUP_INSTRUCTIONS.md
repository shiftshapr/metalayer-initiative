# DNS Setup Instructions for canopi.live domains

## Current Status

✅ **Nginx Configuration**: Configured and ready
- `app.canopi.live` → Proxies to `localhost:3002` (main application - app.js)
- `share.canopi.live` → Proxies to `localhost:3002` (share resolver)
- `canopi.live` → Handled by Hostinger (landing page)

✅ **DNS Configuration**: Configured by user
- `app.canopi.live` → Points to this server
- `share.canopi.live` → Points to this server
- `canopi.live` → Points to Hostinger

## DNS Configuration (Already Complete)

### DNS Records Configured

#### A Records (IPv4)
```
app.canopi.live      → 216.238.91.120  ✅
share.canopi.live    → 216.238.91.120  ✅
canopi.live          → Hostinger        ✅ (landing page)
```

#### AAAA Records (IPv6) - Optional
If you have IPv6 support:
```
canopi.live          → [YOUR_IPv6_ADDRESS]
www.canopi.live      → [YOUR_IPv6_ADDRESS]
share.canopi.live   → [YOUR_IPv6_ADDRESS]
```

### Step 2: Verify DNS Propagation

After adding DNS records, wait 5-60 minutes for propagation, then verify:

```bash
# Check DNS resolution
dig canopi.live
dig www.canopi.live
dig share.canopi.live

# Or using nslookup
nslookup canopi.live
nslookup share.canopi.live
```

Expected result: All should resolve to `216.238.91.120`

### Step 3: Test Nginx Configuration

```bash
# Test nginx config
sudo nginx -t

# Reload nginx if config is valid
sudo systemctl reload nginx
```

### Step 4: Test Access

Once DNS is propagated, test:
- `http://canopi.live/health` - Should return health check
- `http://share.canopi.live/share-message?message=TEST&page=TEST` - Should show resolver page

## SSL Certificate Setup (Recommended)

After DNS is working, set up SSL certificates:

```bash
# Install certbot if not already installed
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d canopi.live -d www.canopi.live -d share.canopi.live

# Certbot will automatically update nginx configs to use HTTPS
```

After SSL setup, update nginx configs to uncomment the HTTP→HTTPS redirect lines.

## Current Server Setup

### Port Mapping
- **Port 3002**: Main server (app.js) - Handles all routes including `/share-message` and API endpoints
- **Note**: canopi2-server.js has been archived. All functionality is now in app.js

### Nginx Configuration Files
- `/etc/nginx/sites-available/canopi.live` - Main site config
- `/etc/nginx/sites-available/share.canopi.live` - Share resolver config
- Both are symlinked to `/etc/nginx/sites-enabled/`

## Troubleshooting

### DNS Not Resolving
1. Check DNS records at registrar
2. Wait for propagation (can take up to 48 hours, usually 5-60 minutes)
3. Verify with: `dig canopi.live` or `nslookup canopi.live`

### Nginx Not Serving
1. Check nginx status: `sudo systemctl status nginx`
2. Check nginx config: `sudo nginx -t`
3. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`

### Server Not Responding
1. Check if servers are running:
   ```bash
   # Check port 3002 (app.js - handles all routes)
   curl http://localhost:3002/health
   ```

2. Check server logs:
   ```bash
   # Check main app logs (PM2)
   pm2 logs metalayer-api
   ```

## Next Steps After DNS Setup

1. ✅ DNS records added at registrar
2. ⚠️ Wait for DNS propagation (5-60 minutes)
3. ⚠️ Verify DNS resolution with `dig` or `nslookup`
4. ⚠️ Test HTTP access: `http://share.canopi.live/share-message?message=TEST`
5. ⚠️ Set up SSL certificates with certbot
6. ⚠️ Update nginx configs to enable HTTPS redirect
7. ⚠️ Test share links end-to-end

## Summary

**Current Status**:
- ✅ Nginx configs created and enabled
- ❌ DNS records need to be added at registrar
- ❌ SSL certificates need to be set up (after DNS)

**What You Need to Do**:
1. Go to your domain registrar (where you bought `canopi.live`)
2. Add A records pointing `canopi.live`, `www.canopi.live`, and `share.canopi.live` to `216.238.91.120`
3. Wait for DNS propagation
4. Set up SSL certificates
5. Test the share links

