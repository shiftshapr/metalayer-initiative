# Timeline Feature Setup Summary

## ✅ Current Status

### 1. App Subdomain (Working Now)
- **URL**: `https://app.canopi.live/timelines/[uuid]` or `https://app.canopi.live/timelines/[username]`
- **Status**: ✅ **WORKING** - SSL configured, routes active
- **Example**: `https://app.canopi.live/timelines/themetalayer`

### 2. Timeline Subdomain (Setup Ready)
- **URL**: `https://timeline.canopi.live/[uuid]` or `https://timeline.canopi.live/[username]`
- **Status**: ⏳ **Pending DNS + SSL**
- **Config**: Created and ready to deploy

## 📋 Setup Steps

### For App Subdomain (Already Working)
✅ Routes configured in `app.js`
✅ Nginx config updated with `/timelines` location
✅ SSL certificate active
✅ Backend running on port 3002

### For Timeline Subdomain (Next Steps)

1. **Copy and enable nginx config:**
   ```bash
   sudo cp /home/ubuntu/metalayer-initiative/timeline.canopi.live.conf /etc/nginx/sites-available/timeline.canopi.live
   sudo ln -sf /etc/nginx/sites-available/timeline.canopi.live /etc/nginx/sites-enabled/timeline.canopi.live
   sudo nginx -t
   sudo systemctl reload nginx
   ```

   Or use the setup script:
   ```bash
   sudo bash /home/ubuntu/metalayer-initiative/SETUP_TIMELINE_SUBDOMAIN.sh
   ```

2. **Configure DNS:**
   - Add A record: `timeline.canopi.live` → Your server IP
   - Wait for DNS propagation (usually 5-15 minutes)

3. **Get SSL Certificate:**
   ```bash
   sudo certbot --nginx -d timeline.canopi.live
   ```

4. **Verify:**
   ```bash
   curl -I https://timeline.canopi.live/themetalayer
   ```

## 🔧 Technical Details

### Routes Handled
- `app.canopi.live/timelines/:identifier` → Serves timeline HTML
- `timeline.canopi.live/:identifier` → Serves timeline HTML (after DNS/SSL setup)
- `app.canopi.live/api/timelines/:identifier` → Timeline API endpoint
- `timeline.canopi.live/api/timelines/:identifier` → Timeline API endpoint

### Backend Configuration
- **Port**: 3002
- **Process**: PM2 managed (`metalayer-api`)
- **Routes**: Defined in `app.js` and `routes/timelines.js`

### Frontend
- **Location**: `public/timelines/index.html`
- **Scripts**: `public/timelines/timeline-app.js`
- **Styles**: `public/timelines/styles/timeline.css`

## 📝 Files Created/Modified

1. ✅ `app.js` - Added timeline routes
2. ✅ `routes/timelines.js` - Timeline API routes
3. ✅ `controllers/timelineController.js` - Timeline controller
4. ✅ `services/timelineService.js` - Timeline service
5. ✅ `app.canopi.live.conf` - Updated with `/timelines` location
6. ✅ `timeline.canopi.live.conf` - New subdomain config
7. ✅ `SETUP_TIMELINE_SUBDOMAIN.sh` - Setup script

## 🚀 Quick Test

Test the current working setup:
```bash
curl -I https://app.canopi.live/timelines/themetalayer
```

Expected: HTTP 200 with HTML content

