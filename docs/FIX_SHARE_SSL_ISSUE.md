# Fix: Pacha AR Appearing on share.canopi.live

## Problem
When accessing `https://share.canopi.live`, the Pacha AR overlay appears because:
1. HTTPS requests are falling back to default_server (port 3000 - Next.js app)
2. share.canopi.live nginx config only has HTTP (port 80), no SSL configured

## Solution
Add SSL configuration for share.canopi.live to proxy to port 3002 (app.js)

## Steps

1. **Check if SSL certificate exists:**
   ```bash
   ls -la /etc/letsencrypt/live/ | grep share.canopi
   ```

2. **If SSL exists, update nginx config:**
   ```bash
   sudo cp /home/ubuntu/metalayer-initiative/share.canopi.live.conf /etc/nginx/sites-available/share.canopi.live
   # Then add SSL server block (see app.canopi.live.conf for reference)
   ```

3. **If SSL doesn't exist, create it:**
   ```bash
   sudo certbot --nginx -d share.canopi.live
   ```

4. **Test and reload:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Alternative Quick Fix
If you need to test immediately, access via HTTP:
`http://share.canopi.live/share-message?message=...`






