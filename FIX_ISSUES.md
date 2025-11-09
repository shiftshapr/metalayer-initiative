# Issues Found and Fixes Needed

## Current Issues

1. ❌ **share.canopi.live/share-message returns 404**
   - Server on port 3002 is running but `/share-message` route returns "Cannot GET"
   - The route exists in `canopi2-server.js` but might not be active

2. ❌ **app.canopi.live/health returns 404**
   - `app.canopi.live` nginx config is not enabled
   - Need to enable it

3. ✅ **share.canopi.live/health works** - This is good!

## Root Cause

The `canopi2-server.js` defaults to port 3003, but something is running on port 3002. We need to:
1. Check what's actually running on port 3002
2. Either update it to use canopi2-server.js or fix the routing
3. Enable app.canopi.live nginx config

## Fixes Needed

### 1. Enable app.canopi.live (requires sudo)
```bash
cd /home/ubuntu/metalayer-initiative
sudo cp app.canopi.live.conf /etc/nginx/sites-available/app.canopi.live
sudo ln -sf /etc/nginx/sites-available/app.canopi.live /etc/nginx/sites-enabled/app.canopi.live
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Fix share-message route

The server on port 3002 needs to be running `canopi2-server.js` with the `/share-message` route. Check:
- Is canopi2-server.js running with `PORT=3002`?
- Or is `app.js` running on port 3002?

### 3. After fixes, set up SSL
```bash
sudo certbot --nginx -d app.canopi.live -d share.canopi.live
```

## Testing

After fixes:
- `http://app.canopi.live/health` - Should return health status
- `http://share.canopi.live/share-message?message=TEST&page=TEST` - Should show resolver page






