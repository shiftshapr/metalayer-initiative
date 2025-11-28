# Server Status Summary

## ✅ All Servers Running

### PM2 Processes
- ✅ **metalayer-api** (port 3002) - Running (app.js handles all routes)

### Domain Status
- ✅ **app.canopi.live** → Port 3002 (app.js) - HTTPS working
- ✅ **share.canopi.live** → Port 3002 (app.js) - HTTPS working
- ✅ **canopi.live** → Hostinger (landing page)

### Health Checks
- ✅ `https://app.canopi.live/health` - Working
- ✅ `https://share.canopi.live/health` - Working
- ✅ `https://share.canopi.live/share-message` - Working

## Issues Fixed

1. ✅ **Consolidated servers** - All routes moved to app.js (port 3002)
2. ✅ **canopi2-server archived** - No longer needed, all functionality in app.js
3. ✅ **Nginx configuration** - Updated to use port 3002 for all domains
4. ✅ **SSL certificates** - Set up for both domains

## PM2 Management

### View Status
```bash
pm2 list
pm2 status metalayer-api
```

### View Logs
```bash
pm2 logs metalayer-api
```

### Restart Server
```bash
pm2 restart metalayer-api
```

### Auto-start on Boot
```bash
pm2 startup
pm2 save
```

## Next Steps

1. ✅ Test share links from the extension
2. ✅ Verify extension detection on share.canopi.live
3. ✅ Test redirect to page URLs with sidebar opening

All servers are now running and accessible via HTTPS!

