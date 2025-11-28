# Authentication Flow Documentation

**Last Updated:** 2025-01-25  
**Status:** Current Implementation

---

## Overview

The Metalayer Initiative uses **browser-based Google authentication** via the Chrome extension, not backend Google OAuth routes. This document explains the actual authentication flow.

---

## Current Authentication Method

### Browser-Based Google Auth (Active)

**Implementation:** `presence/real-google-auth.js`

**Flow:**
1. User clicks "Sign in with Google" in Chrome extension
2. Extension uses `chrome.identity.getRedirectURL()` for OAuth redirect
3. Supabase OAuth handles Google authentication
4. User profile (including real Google profile picture) is retrieved
5. Session managed via Supabase auth

**Key Files:**
- `presence/real-google-auth.js` - Main auth implementation
- `presence/src/features/AuthModule.ts` - Auth module wrapper
- `presence/src/features/AuthManager.ts` - Auth state management

**Why This Method:**
- Gets real Google profile pictures (not placeholder avatars)
- Works seamlessly with Chrome extension
- Uses Supabase for session management
- No backend OAuth routes needed

---

## Backend Google OAuth Routes (Legacy/Unused)

**Status:** ⚠️ **Not Currently Used**

The backend has Google OAuth routes (`/auth/google/*`) but they are:
- Not called by the extension
- Optional (wrapped in `if (runtimeConfig.google.enabled)`)
- Can be enabled by setting Google OAuth env vars, but not needed

**Routes (if enabled):**
- `GET /auth/google` - Initiate OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/google/success` - Success handler
- `POST /auth/google/token` - Token handler

**Why They Exist:**
- Legacy code from earlier implementation
- Could be used for web-based auth (not extension)
- Currently disabled by default

---

## Environment Variables

### Required for Browser Auth
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

### Optional (Not Used by Browser Auth)
- `GOOGLE_CLIENT_ID` - Only needed if enabling backend OAuth routes
- `GOOGLE_CLIENT_SECRET` - Only needed if enabling backend OAuth routes
- `GOOGLE_CALLBACK_URL` - Only needed if enabling backend OAuth routes

### Session Management
- `SESSION_SECRET` - Optional (auto-generated if missing)
  - Used by `express-session` for backend session storage
  - Not critical for browser auth (Supabase handles sessions)

---

## Authentication State Flow

```
User Action
    ↓
Chrome Extension (real-google-auth.js)
    ↓
Supabase OAuth (chrome.identity)
    ↓
Google OAuth Provider
    ↓
Supabase Auth Session
    ↓
Extension State (AuthManager)
    ↓
Backend API (optional, for user data)
```

---

## Code References

### Extension Side
- **Auth Init:** `presence/real-google-auth.js::signInWithGoogle()`
- **Auth Manager:** `presence/src/features/AuthManager.ts`
- **Auth Module:** `presence/src/features/AuthModule.ts`

### Backend Side
- **Session Config:** `app.js` (lines 108-112)
- **Google Routes:** `app.js` (lines 178-283, conditional)
- **Auth Routes:** `routes/auth.js` (if exists)

---

## Future Considerations

### If Adding Web-Based Auth
If you want to support web-based Google auth (not just extension):
1. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
2. Backend routes will automatically enable
3. Can use `/auth/google` endpoint from web pages

### If Removing Legacy Routes
If you're sure you'll never need backend Google OAuth:
1. Remove `/auth/google/*` routes from `app.js`
2. Remove Google OAuth validation from `config/validateEnv.js`
3. Remove `passport` and `passport-google-oauth20` dependencies

**Recommendation:** Keep them optional for now - they don't hurt and provide flexibility.

---

## Troubleshooting

### "Google OAuth not configured" Warning
- **Meaning:** Backend Google OAuth routes are disabled (expected)
- **Action:** None needed - browser auth works independently

### "SESSION_SECRET not set" Warning
- **Meaning:** Using auto-generated session secret
- **Action:** Set `SESSION_SECRET` in `.env` for persistent sessions (optional)

### Auth Not Working in Extension
- Check Supabase credentials are set
- Verify `real-google-auth.js` is loaded
- Check Chrome extension console for errors
- Verify `chrome.identity` permission in manifest

---

*Documentation created: 2025-01-25*  
*Auth method: Browser-based via Chrome extension*

