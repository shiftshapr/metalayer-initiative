# CORS Setup for VPS

## Current Configuration

Based on your nginx configs, you're using:
- `app.canopi.live`
- `share.canopi.live`

## Recommended ALLOWED_ORIGINS for VPS

### For Production:
```env
ALLOWED_ORIGINS=https://app.canopi.live,https://share.canopi.live,https://api.canopi.live
```

### For Development (if testing on VPS):
```env
ALLOWED_ORIGINS=http://216.238.91.120:3000,http://216.238.91.120:3001,https://app.canopi.live,https://share.canopi.live
```

### For Local Development:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## Why These Values?

1. **`https://app.canopi.live`** - Your main application domain
2. **`https://share.canopi.live`** - Your share/message resolver domain
3. **`https://api.canopi.live`** - If you have a separate API domain (or use app.canopi.live)

**Note:** The IP addresses (`216.238.91.120`) are only needed if:
- You're accessing the VPS directly by IP during development
- You haven't set up DNS yet
- You're testing before SSL certificates are configured

---

## Setup Instructions

### 1. Add to your `.env` file on VPS:
```env
ALLOWED_ORIGINS=https://app.canopi.live,https://share.canopi.live,https://api.canopi.live
```

### 2. If using PM2, add to `ecosystem.config.js`:
```javascript
env: {
  ALLOWED_ORIGINS: 'https://app.canopi.live,https://share.canopi.live,https://api.canopi.live'
}
```

### 3. Restart your server:
```bash
pm2 restart all
# or
systemctl restart canopi
```

---

## Security Notes

✅ **DO include:**
- Your actual production domains (canopi.live)
- Localhost for local development only

❌ **DON'T include:**
- Wildcard origins (`*`) - security risk
- Unused domains - keep it minimal
- HTTP in production - use HTTPS only

---

## Testing CORS

After updating, test that CORS works:

```bash
# Test from browser console on app.canopi.live
fetch('https://api.canopi.live/v1/users', {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

If CORS is working, you'll get a response. If not, you'll see a CORS error.

---

## Troubleshooting

### CORS errors in browser
1. Check that your domain is in `ALLOWED_ORIGINS`
2. Verify the origin matches exactly (including http/https, port, trailing slash)
3. Check server logs for CORS errors

### Still having issues?
- Make sure nginx is forwarding the correct `Origin` header
- Verify your frontend is making requests from the correct domain
- Check that `credentials: true` is set in CORS config (it is)

