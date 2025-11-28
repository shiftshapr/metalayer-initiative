# Fix 404 Error and Set Up SSL for Web3Auth Test

## Issue
- 404 error on https://view.canopi.live/web3auth-test/
- SSL certificate needs to be set up

## Steps to Fix

### 1. Copy Updated Nginx Config

```bash
sudo cp /home/ubuntu/metalayer-initiative/view.canopi.live.conf /etc/nginx/sites-available/view.canopi.live
```

### 2. Test Nginx Configuration

```bash
sudo nginx -t
```

If there are errors, fix them. The config should be valid.

### 3. Reload Nginx

```bash
sudo systemctl reload nginx
```

### 4. Set Up SSL Certificate

If SSL is not already set up for view.canopi.live:

```bash
sudo certbot --nginx -d view.canopi.live
```

This will:
- Obtain SSL certificate from Let's Encrypt
- Automatically configure nginx for HTTPS
- Set up automatic redirect from HTTP to HTTPS

### 5. Verify Files Exist

Check that the test page file exists:

```bash
ls -la /home/ubuntu/metalayer-initiative/public/web3auth-test/index.html
```

Should show the file exists.

### 6. Test Access

After applying config and SSL:
- HTTP: http://view.canopi.live/web3auth-test/ (should redirect to HTTPS)
- HTTPS: https://view.canopi.live/web3auth-test/

### 7. Check Nginx Error Logs (if still 404)

```bash
sudo tail -f /var/log/nginx/error.log
```

Then try accessing the page and see what errors appear.

## Alternative: Simpler Location Block

If the alias approach doesn't work, we can use root with a rewrite:

```nginx
location /web3auth-test/ {
    root /home/ubuntu/metalayer-initiative/public;
    try_files $uri $uri/ /web3auth-test/index.html;
    index index.html;
}
```

This requires the file to be at: `/home/ubuntu/metalayer-initiative/public/web3auth-test/index.html`

## Troubleshooting

### If still getting 404:

1. **Check file permissions:**
   ```bash
   ls -la /home/ubuntu/metalayer-initiative/public/web3auth-test/
   ```
   Files should be readable by nginx user (usually `www-data` or `nginx`)

2. **Check nginx is reading the right config:**
   ```bash
   sudo nginx -T | grep -A 10 "web3auth-test"
   ```

3. **Check if location block is being matched:**
   Add to location block temporarily:
   ```nginx
   add_header X-Debug "web3auth-test-matched" always;
   ```

4. **Verify nginx user can read the file:**
   ```bash
   sudo -u www-data cat /home/ubuntu/metalayer-initiative/public/web3auth-test/index.html | head -5
   ```

## Quick Fix Script

Run these commands in order:

```bash
# 1. Copy config
sudo cp /home/ubuntu/metalayer-initiative/view.canopi.live.conf /etc/nginx/sites-available/view.canopi.live

# 2. Test config
sudo nginx -t

# 3. Reload nginx
sudo systemctl reload nginx

# 4. Set up SSL (if not already done)
sudo certbot --nginx -d view.canopi.live

# 5. Test access
curl -I https://view.canopi.live/web3auth-test/
```

