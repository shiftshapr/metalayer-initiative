# Web3Auth Product & Platform Selection Guide

## Product Selection: Plug and Play ✅

### Answer: **Yes, select "Plug and Play"**

**Why Plug and Play is correct for Canopi:**

1. **We're using the Modal SDK** (`@web3auth/modal`)
   - This is part of the Plug and Play product
   - Provides ready-to-use authentication UI
   - Quick integration with minimal setup

2. **Perfect for Browser Extensions**
   - Easy to integrate
   - Pre-built UI that works well in extension contexts
   - Handles all authentication flows automatically

3. **What Plug and Play Includes:**
   - ✅ Pre-built authentication modal
   - ✅ Multiple login methods (Google, Twitter, etc.)
   - ✅ Wallet management
   - ✅ User session handling
   - ✅ Ready-to-use UI components

### When to Use Other Products:

**MPC Core Kit** (formerly Self-Host):
- Use if you need **full UI customization**
- Headless solution (no default UI)
- More control but requires building your own UI
- Not needed for Canopi unless you want custom branding

**Single Factor Auth:**
- For simpler authentication without wallet features
- Not what we need for Web3Auth integration

**Infra SDKs:**
- Lower-level infrastructure SDKs
- More complex, typically for advanced use cases

**SafeAuth:**
- For Safe wallet integration
- Not needed for general Web3Auth

---

## Platform Selection: Web Application ✅

### Answer: **Yes, select "Web Application"**

**Why Browser Extensions are Web Applications:**

1. **Technical Reality:**
   - Browser extensions run in a **web environment**
   - Use HTML, CSS, and JavaScript (web technologies)
   - Execute in browser context (same as web apps)
   - Can use Web3Auth's web SDKs

2. **Web3Auth Classification:**
   - Web3Auth treats extensions as web applications
   - Same SDKs work for both web apps and extensions
   - Same authentication flows
   - Same configuration options

3. **What "Web Application" Means:**
   - ✅ Runs in browser environment
   - ✅ Uses web technologies
   - ✅ Can load external scripts (like Web3Auth SDK)
   - ✅ Has access to browser APIs
   - ✅ Can make HTTP/HTTPS requests

### Platform Options in Web3Auth:

**Web Application** ✅ (Choose this)
- Traditional web apps
- Browser extensions (like Canopi)
- Single Page Applications (SPAs)
- Progressive Web Apps (PWAs)

**Mobile Application:**
- Native iOS/Android apps
- React Native apps
- Not applicable for browser extensions

**Backend/Server:**
- Node.js servers
- API backends
- For JWT verification, etc.
- Not needed for client-side auth

---

## Summary: What to Select

### In Web3Auth Dashboard:

1. **Product:** ✅ **Plug and Play**
   - This matches our `@web3auth/modal` SDK usage
   - Provides the authentication UI we need

2. **Platform:** ✅ **Web Application**
   - Browser extensions are web applications
   - Same SDK and configuration as web apps

### Configuration Steps:

1. Go to your Web3Auth dashboard
2. Select your project (Canopi)
3. Go to "Project Settings" → "General" tab
4. Under "Select Product":
   - ✅ Check **"Plug and Play"**
5. The platform is typically auto-detected or set to "Web Application"
   - If asked, select **"Web Application"**

---

## What This Means for Your Code

### Current Setup (Correct):

```typescript
// Using Plug and Play Modal SDK
import { Web3Auth } from "@web3auth/modal";

// Or via CDN (as in test page)
<script src="https://cdn.jsdelivr.net/npm/@web3auth/modal@latest/dist/web3auth.umd.min.js"></script>
```

This is the **Plug and Play** product, which is perfect for:
- ✅ Browser extensions
- ✅ Quick integration
- ✅ Pre-built UI
- ✅ Multiple login methods

### No Code Changes Needed

Your current implementation is already correct:
- Using `@web3auth/modal` = Plug and Play ✅
- Running in browser = Web Application ✅
- Configuration matches the product selection ✅

---

## Additional Notes

### If You Need Custom UI Later:

If you want to customize the authentication UI in the future:

1. You can still use Plug and Play with custom styling
2. Or switch to MPC Core Kit for full control
3. But for now, Plug and Play is the best choice

### Extension-Specific Considerations:

- **Content Security Policy:** Make sure to allow Web3Auth domains in `manifest.json`
- **Permissions:** Extensions may need additional permissions for Web3Auth
- **CSP Updates:** We'll need to update the CSP to allow Web3Auth scripts

---

## Quick Checklist

- [x] Product: **Plug and Play** ✅
- [x] Platform: **Web Application** ✅
- [x] SDK: `@web3auth/modal` ✅
- [x] Environment: Sapphire Mainnet (production) ✅
- [x] Chain Namespace: EIP155 (Ethereum/EVM) ✅

Everything is correctly configured! 🎉

