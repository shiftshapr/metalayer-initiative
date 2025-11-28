# SESSION_SECRET Setup Guide

## How to Generate a Secure SESSION_SECRET

### Method 1: Using OpenSSL (Recommended)
```bash
openssl rand -base64 32
```

### Method 2: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Method 3: Using Python
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Method 4: Using the Provided Script
```bash
./generate-session-secret.sh
```

**Example output:**
```
SESSION_SECRET=alvyNKK9o0mJ+OcHvTJHZ5ch6BwIicFX4Gir95nQ2V4=
```

---

## Do Other Developers Need Their Own?

### ✅ YES - For Local Development
Each developer should generate their **own** `SESSION_SECRET` for local development:

**Why?**
- Prevents conflicts when multiple developers run the server locally
- Each developer's `.env` file stays private (not committed to git)
- No security risk if one developer's secret is compromised

**Setup:**
1. Each developer runs: `openssl rand -base64 32`
2. Each adds their own secret to their local `.env` file
3. `.env` is in `.gitignore` (never committed)

### ❌ NO - For Production/Staging
Production and staging environments should use a **shared** secret:

**Why?**
- All production servers need the same secret to share sessions
- Stored securely (environment variables, secrets manager, etc.)
- Never committed to git

**Setup:**
1. Generate one secret for production
2. Store in your VPS environment variables or secrets manager
3. Use the same secret across all production servers

---

## Quick Setup

### For Local Development:
```bash
# 1. Generate your secret
openssl rand -base64 32

# 2. Add to .env file
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env

# 3. Verify it's in .gitignore
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
```

### For Production (VPS):
```bash
# 1. Generate production secret
PROD_SECRET=$(openssl rand -base64 32)

# 2. Add to VPS environment (method depends on your setup)
# Option A: PM2 ecosystem file
# Option B: Systemd service file
# Option C: Docker environment
# Option D: Direct export in shell profile

# Example for PM2:
# In ecosystem.config.js:
# env: {
#   SESSION_SECRET: 'your-production-secret-here'
# }
```

---

## Security Best Practices

1. ✅ **Never commit secrets to git**
   - `.env` should be in `.gitignore`
   - Use `.env.example` as a template

2. ✅ **Use different secrets for different environments**
   - Development: Each developer has their own
   - Staging: Shared staging secret
   - Production: Shared production secret

3. ✅ **Rotate secrets periodically**
   - Change production secret every 6-12 months
   - When rotating, users will need to re-authenticate

4. ✅ **Store production secrets securely**
   - Use environment variables on VPS
   - Consider using a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)
   - Never hardcode in source code

---

## Troubleshooting

### Error: "SESSION_SECRET must be changed from default value"
**Solution:** You're using the placeholder value. Generate a new secret and update your `.env` file.

### Error: "Missing required environment variables: SESSION_SECRET"
**Solution:** Add `SESSION_SECRET` to your `.env` file or export it in your shell.

### Sessions not persisting across server restarts
**Solution:** Make sure you're using the same `SESSION_SECRET` across restarts. If you change it, all existing sessions become invalid.

---

## Example .env File

```env
# Development - Each developer generates their own
SESSION_SECRET=alvyNKK9o0mJ+OcHvTJHZ5ch6BwIicFX4Gir95nQ2V4=

# CORS - Update with your actual domains
ALLOWED_ORIGINS=https://app.canopi.live,https://share.canopi.live

# Other variables...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

