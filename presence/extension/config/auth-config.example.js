/**
 * AUTH CONFIG EXAMPLE
 *
 * Copy this file to auth-config.ts and add your actual Client ID
 * DO NOT commit auth-config.ts to git
 *
 * Usage:
 * 1. Copy: cp src/config/auth-config.example.ts src/config/auth-config.ts
 * 2. Add your Client ID
 * 3. Import and use in your boot sequence
 *
 * NOTE: Only Client ID is needed for client-side usage.
 * Client Secret is only required for server-side operations (JWT verification, etc.)
 */
export const AUTH_CONFIG = {
    // Get your Client ID from https://dashboard.web3auth.io
    // This is public and safe to use in frontend code
    web3AuthClientId: process.env.WEB3AUTH_CLIENT_ID || 'YOUR_WEB3AUTH_CLIENT_ID_HERE',
    // Client Secret is NOT needed for client-side authentication
    // Only use this if you're doing server-side JWT verification
    // web3AuthClientSecret: process.env.WEB3AUTH_CLIENT_SECRET || '',
};
// Set it on window for the extension to use
if (typeof window !== 'undefined') {
    window.CANOPI_WEB3AUTH_CLIENT_ID =
        AUTH_CONFIG.web3AuthClientId;
}
