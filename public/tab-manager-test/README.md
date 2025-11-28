# Tab Manager Test Page

This test page is available at: **https://share.canopi.live/tab-manager-test/**

## Setup Instructions

### 1. Compile TypeScript Files

The Tab Manager module is written in TypeScript and needs to be compiled to JavaScript before it can run in the browser.

```bash
cd /home/ubuntu/metalayer-initiative/presence/extension/features/TabManager
tsc --target ES2020 --module ES2020 --moduleResolution node --outDir . *.ts
```

Or if you have a tsconfig.json:
```bash
tsc
```

### 2. Copy Compiled Files

After compilation, copy the `.js` files to the public directory:

```bash
cp *.js /home/ubuntu/metalayer-initiative/public/tab-manager-test/
cp tab-manager.css /home/ubuntu/metalayer-initiative/public/tab-manager-test/
```

### 3. Reload Nginx

After updating the nginx config, reload it:

```bash
sudo nginx -t  # Test configuration
sudo systemctl reload nginx  # Reload nginx
```

### 4. Access the Test Page

Open in browser: **https://share.canopi.live/tab-manager-test/**

## Current Status

- ✅ Files copied to `/home/ubuntu/metalayer-initiative/public/tab-manager-test/`
- ✅ Nginx config updated to serve static files
- ⚠️ TypeScript files need to be compiled to JavaScript
- ⚠️ Nginx needs to be reloaded

## Files Structure

```
public/tab-manager-test/
├── index.html              # Test page
├── tab-manager.css         # Styles
├── TabManager.js           # (needs compilation)
├── TabConfiguration.js     # (needs compilation)
├── TabDisplay.js           # (needs compilation)
├── TabManagerModal.js      # (needs compilation)
├── AppStoreIntegration.js  # (needs compilation)
├── TabManager.test.js      # (needs compilation)
└── types.js                # (needs compilation)
```

## Testing

Once compiled and accessible:

1. Open https://share.canopi.live/tab-manager-test/
2. Click "Initialize Tab Manager"
3. Click "Run All Tests" to run automated tests
4. Use other buttons to test manually
