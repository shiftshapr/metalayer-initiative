# Quick Guide: Loading Metalayer Extension

## Step-by-Step Instructions

1. **Build the Extension** (if not already done):
   ```bash
   npm run build
   ```

2. **Open Chrome Extensions Page**:
   - Open Chrome browser
   - Go to: `chrome://extensions/`

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**:
   - Click "Load unpacked" button
   - Navigate to: `client/build/` folder
   - Select the `build` folder and click "Select Folder"

5. **Verify Installation**:
   - You should see "Metalayer Sidebar" in your extensions list
   - The extension icon should appear in your Chrome toolbar

6. **Test the Extension**:
   - Go to any website (e.g., google.com)
   - Look for a floating shield icon (🛡️) in the top-left corner
   - Click the icon to open the Metalayer sidebar

## Troubleshooting

- **"Invalid manifest" error**: Make sure you're selecting the `build` folder, not the root project folder
- **Icon not appearing**: Refresh the page or try a different website
- **Sidebar not opening**: Check the browser console for any errors

## Extension Features

Once loaded, you can:
- 💬 **Chat**: Interact with the AI assistant
- 🌐 **Communities**: Join and manage communities  
- 👁️ **Visibility**: Control content visibility settings
- 🔐 **Auth**: Connect wallet or use other auth methods

## Development

To make changes:
1. Edit files in the `src/` directory
2. Run `npm run build` to rebuild
3. Go to `chrome://extensions/`
4. Click the refresh icon on the Metalayer extension
5. Test your changes 