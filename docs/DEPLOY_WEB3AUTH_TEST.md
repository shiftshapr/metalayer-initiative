# Deploy Web3Auth Test Page to view.canopi.live

## What Was Done

1. ✅ Created `/public/web3auth-test/` directory
2. ✅ Copied test page to `public/web3auth-test/index.html`
3. ✅ Updated `view.canopi.live.conf` with new location block

## Next Steps to Deploy

### 1. Copy Updated Nginx Config

```bash
sudo cp /home/ubuntu/metalayer-initiative/view.canopi.live.conf /etc/nginx/sites-available/view.canopi.live
```

### 2. Test Nginx Configuration

```bash
sudo nginx -t
```

### 3. Reload Nginx

```bash
sudo systemctl reload nginx
```

### 4. Verify Test Page is Accessible

Visit: **https://view.canopi.live/web3auth-test/**

## Important: Update Client ID

Before testing, you need to:

1. Get your Web3Auth Client ID from https://dashboard.web3auth.io
2. Edit the test page:
   ```bash
   nano /home/ubuntu/metalayer-initiative/public/web3auth-test/index.html
   ```
3. Find line 207: `const WEB3AUTH_CLIENT_ID = 'YOUR_WEB3AUTH_CLIENT_ID';`
4. Replace with your actual Client ID

## Whitelist URL in Web3Auth Dashboard

Don't forget to whitelist the domain in Web3Auth dashboard:

1. Go to https://dashboard.web3auth.io
2. Project Settings → Domains tab
3. Add: `https://view.canopi.live`

## Access URLs

- **Test Page:** https://view.canopi.live/web3auth-test/
- **Main App:** https://view.canopi.live/ (unchanged)

## Files Modified

- `view.canopi.live.conf` - Added `/web3auth-test` location block
- `public/web3auth-test/index.html` - Test page (copied from `presence/test-web3auth.html`)

