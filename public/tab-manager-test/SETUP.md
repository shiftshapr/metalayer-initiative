# Tab Manager Test Setup

## Quick Start

The test page is set up at: **https://share.canopi.live/tab-manager-test/**

### Steps to Make It Work:

1. **Compile TypeScript files:**
   ```bash
   cd /home/ubuntu/metalayer-initiative/public/tab-manager-test
   ./compile.sh
   ```
   
   Or manually:
   ```bash
   cd /home/ubuntu/metalayer-initiative/presence/extension/features/TabManager
   npx tsc --target ES2020 --module ES2020 --moduleResolution node *.ts
   cp *.js /home/ubuntu/metalayer-initiative/public/tab-manager-test/
   cp tab-manager.css /home/ubuntu/metalayer-initiative/public/tab-manager-test/
   ```

2. **Reload Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **Access the test page:**
   Open: **https://share.canopi.live/tab-manager-test/**

## What's Already Done

✅ Files copied to `/home/ubuntu/metalayer-initiative/public/tab-manager-test/`  
✅ Nginx config updated (`share.canopi.live.conf`)  
✅ Test HTML page created  
✅ Compilation script created  

## What Needs to Be Done

⚠️ Compile TypeScript to JavaScript (run `./compile.sh`)  
⚠️ Reload Nginx configuration  
⚠️ Test the page in browser  

## Troubleshooting

- **Module not found errors**: Make sure all `.js` files are in the directory
- **CORS errors**: Nginx config includes CORS headers
- **404 errors**: Check nginx config and reload nginx
- **TypeScript errors**: Check that all imports are correct





