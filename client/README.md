# Metalayer Sidebar Extension

A Chrome extension that provides a sidebar overlay for the Metalayer decentralized social platform, featuring chat, community management, and visibility controls.

## Features

- **Live Chat**: AI-powered chat interface with real-time messaging
- **Community Management**: Join, create, and manage communities
- **Visibility Layer**: Control content visibility and filtering
- **Authentication**: Multiple auth methods (Wallet, Google, Fractal ID)
- **Modern UI**: Glassmorphism design with dark theme

## Building the Extension

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build the Extension**:
   ```bash
   npm run build
   ```

3. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `build` folder from this project

## Development

1. **Start Development Server**:
   ```bash
   npm start
   ```

2. **Build for Production**:
   ```bash
   npm run build
   ```

## Extension Structure

```
client/
├── public/
│   ├── manifest.json          # Extension manifest
│   ├── background.js          # Background script
│   ├── contentScript.js       # Content script for injection
│   ├── index.html            # Main HTML file
│   └── icon.svg              # Extension icon
├── src/
│   ├── components/           # React components
│   ├── App.jsx              # Main app component
│   └── main.jsx             # React entry point
└── build/                   # Built extension (after npm run build)
```

## Usage

1. After loading the extension, you'll see a floating shield icon (🛡️) on any webpage
2. Click the icon to open/close the Metalayer sidebar
3. Use the tabs to navigate between different features:
   - **Chat**: Interact with the AI assistant
   - **Communities**: Manage your communities
   - **Visibility**: Control content visibility settings
4. Click "Connect Wallet" to authenticate and access full features

## Components

- **ChatBox**: Real-time chat interface with AI responses
- **CommunitySelector**: Community management with join/create functionality
- **AuthModal**: Multi-method authentication (Wallet, Google, Fractal ID)
- **CanopiIcon**: Custom SVG icon component

## Styling

The extension uses a modern glassmorphism design with:
- Dark theme with blue accents
- Backdrop blur effects
- Smooth animations and transitions
- Responsive design for the sidebar

## Backend Integration

The extension is designed to work with the Metalayer backend API. In a full implementation, it would connect to:
- Authentication endpoints
- Chat/communication services
- Community management APIs
- Blockchain services for wallet integration

## Troubleshooting

- **Extension not loading**: Make sure you're selecting the `build` folder, not the root project folder
- **Sidebar not appearing**: Check that the content script is properly injected
- **Build errors**: Ensure all dependencies are installed with `npm install`

## Development Notes

- The extension uses React 18 with modern hooks
- Styling is done with CSS modules and custom CSS
- The content script injects the React app as an iframe
- Background script handles extension lifecycle and messaging 