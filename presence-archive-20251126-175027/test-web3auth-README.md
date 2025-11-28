# Web3Auth Test Page

This is a standalone test page for Web3Auth integration before integrating into the Canopi extension.

## Setup Instructions

1. **Get Web3Auth Client ID:**
   - Go to https://dashboard.web3auth.io
   - Sign up or log in
   - Create a new project or use an existing one
   - Copy your **Client ID** (you only need the Client ID, not the secret)
   - Note: Client Secret is only needed for server-side operations, not for this client-side test

2. **Update the Test Page:**
   - Open `test-web3auth.html`
   - Find the line: `const WEB3AUTH_CLIENT_ID = 'YOUR_WEB3AUTH_CLIENT_ID';`
   - Replace `YOUR_WEB3AUTH_CLIENT_ID` with your actual Client ID

3. **Open the Test Page:**
   - You can open it directly in a browser (file://) or serve it via a local server
   - For local server: `python3 -m http.server 8000` or `npx serve`
   - Navigate to `http://localhost:8000/test-web3auth.html`

4. **Test the Integration:**
   - Click "Connect with Web3Auth"
   - Choose a login method (Google, Facebook, Twitter, etc.)
   - Verify that user information is displayed correctly
   - Test disconnect functionality

## Features

- ✅ Production Web3Auth network (Sapphire Mainnet)
- ✅ Multiple login methods (Google, Facebook, Twitter, GitHub, Discord, Email)
- ✅ User information display
- ✅ Wallet address retrieval
- ✅ Connect/Disconnect functionality
- ✅ Error handling

## Next Steps

Once the test page works correctly:
1. Integrate Web3Auth adapter into the extension
2. Update AuthModule to use the new AuthProvider
3. Test within the extension context

