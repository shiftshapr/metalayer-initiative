# Domain Setup Summary - Final Configuration

## ✅ Current Status

**DNS**: Configured ✅
- `app.canopi.live` → Points to server
- `share.canopi.live` → Points to server  
- `canopi.live` → Hostinger (landing page)

**Servers Running**:
- Port 3002: `app.js` (main API server - handles all routes including `/share-message`)

## 🔧 Port Mapping (Consolidated)

### app.canopi.live
- **Port**: 3002 (`app.js` - main API)
- **Purpose**: Main application server
- **Status**: ✅ Running

### share.canopi.live  
- **Port**: 3002 (`app.js` - share resolver)
- **Purpose**: Share message resolver with `/share-message` route
- **Status**: ✅ Running

## 🚀 Quick Fix Commands

Run this to fix everything:

```bash
cd /home/ubuntu/metalayer-initiative
./QUICK_FIX_COMMANDS.sh
```

Or manually:

```bash
# Update and enable nginx configs
sudo cp /home/ubuntu/metalayer-initiative/app.canopi.live.conf /etc/nginx/sites-available/app.canopi.live
sudo cp /home/ubuntu/metalayer-initiative/share.canopi.live.conf /etc/nginx/sites-available/share.canopi.live
sudo ln -sf /etc/nginx/sites-available/app.canopi.live /etc/nginx/sites-enabled/app.canopi.live
sudo ln -sf /etc/nginx/sites-available/share.canopi.live /etc/nginx/sites-enabled/share.canopi.live

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL Setup (After HTTP Works)

Once both domains are working over HTTP, set up SSL:

```bash
sudo certbot --nginx -d app.canopi.live -d share.canopi.live
```

This will:
1. Get SSL certificates from Let's Encrypt
2. Automatically configure nginx for HTTPS
3. Set up automatic HTTP→HTTPS redirects

## 🧪 Test URLs

After fixes:
- ✅ `http://share.canopi.live/health` - Should work (already working)
- ⚠️ `http://share.canopi.live/share-message?message=TEST&page=TEST` - Should work after port fix
- ⚠️ `http://app.canopi.live/health` - Should work after enabling config

## 📋 Summary

**Issues Fixed**:
1. ✅ Consolidated all routes to `app.js` on port 3002
2. ✅ Archived `canopi2-server.js` (no longer needed)
2. ✅ Updated `app.canopi.live.conf` to use port 3002 (app.js)
3. ✅ Created quick fix script

**Next Steps**:
1. Run `./QUICK_FIX_COMMANDS.sh` (or manual commands above)
2. Test all URLs
3. Set up SSL certificates with certbot

