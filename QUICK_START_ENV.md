# Quick Start - Environment Setup

## ✅ You've Generated Your SESSION_SECRET!

Your secret: `zvzdIWuGdR2Sx66gXPE7lhu6FURUMR5YSzoHzjnSoso=`

## Next Steps

### 1. Verify Your .env File

Make sure your `.env` file in `/home/ubuntu/canopi/` contains:

```env
# CRITICAL - Required
SESSION_SECRET=zvzdIWuGdR2Sx66gXPE7lhu6FURUMR5YSzoHzjnSoso=

# CORS - Update with your VPS domains
ALLOWED_ORIGINS=https://app.canopi.live,https://share.canopi.live,https://api.canopi.live

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://api.canopi.live/auth/google/callback

# Server Config
PORT=3002
HOST=0.0.0.0
NODE_ENV=production
```

### 2. Test the Configuration

```bash
cd /home/ubuntu/canopi
node -e "require('dotenv').config(); console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ Set (' + process.env.SESSION_SECRET.length + ' chars)' : '❌ Missing');"
```

### 3. Start Your Server

```bash
# Development
npm run dev

# Production (if using PM2)
pm2 start app.js --name canopi

# Or with ecosystem.config.js
pm2 start ecosystem.config.js
```

### 4. Verify It Works

The server should start without the "Missing required environment variables" error.

---

## Security Checklist

- [x] ✅ Generated secure SESSION_SECRET
- [ ] ⬜ Added SESSION_SECRET to .env file
- [ ] ⬜ Verified .env is in .gitignore
- [ ] ⬜ Set ALLOWED_ORIGINS for your VPS
- [ ] ⬜ Tested server starts successfully
- [ ] ⬜ Verified no secrets in git (run `git status` to check)

---

## Troubleshooting

### Server won't start - "Missing required environment variables"
- Check that `.env` file exists in `/home/ubuntu/canopi/`
- Verify `SESSION_SECRET=` line is present (no spaces around `=`)
- Make sure you're running from the correct directory

### "SESSION_SECRET must be changed from default value"
- You're still using the placeholder. Replace it with your generated secret.

### Sessions not working
- Make sure you're using the same SESSION_SECRET across server restarts
- If you changed it, users will need to re-authenticate

---

## For Other Developers

Each developer should:
1. Generate their own secret: `openssl rand -base64 32`
2. Add it to their local `.env` file
3. Never commit `.env` to git

---

## Production Deployment

On your VPS:
1. Generate a production secret (different from development)
2. Store it securely (environment variables, PM2 config, etc.)
3. Set `ALLOWED_ORIGINS` to your actual domains
4. Set `NODE_ENV=production`

