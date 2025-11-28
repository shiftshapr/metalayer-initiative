# Quick Start: Running Production + Development

## ✅ Yes, you can deploy production here!

I've configured your setup to safely run both **development** and **production** on the same server. Here's how:

---

## 🚀 Quick Setup (5 minutes)

### 1. Create Environment Files
```bash
cd /home/ubuntu/metalayer-initiative
./scripts/setup-env-files.sh
```

This creates:
- `.env.development` (port 3001)
- `.env.production` (port 3002)

### 2. Edit Environment Files
```bash
# Edit development
nano .env.development

# Edit production (use STRONG secrets!)
nano .env.production
```

**Important for Production:**
- Generate strong SESSION_SECRET: `openssl rand -base64 64`
- Use production Google OAuth credentials
- Set production CORS origins
- Use production database credentials

### 3. Start Both Environments
```bash
# Start development (port 3001)
npm run pm2:start:dev

# Start production (port 3002)
npm run pm2:start:prod

# Or start both at once
npm run pm2:start:all
```

### 4. Verify They're Running
```bash
# Check status
npm run pm2:status

# View logs
npm run pm2:logs:dev    # Development logs
npm run pm2:logs:prod   # Production logs

# Test endpoints
curl http://localhost:3001/  # Development
curl http://localhost:3002/   # Production
```

---

## 📋 What Changed

### ✅ Code Updates
1. **app.js** - Now auto-loads `.env.{NODE_ENV}` files
2. **ecosystem.config.js** - Separate PM2 apps for dev/prod
3. **package.json** - New scripts for managing both environments

### ✅ Separation
- **Different ports**: Dev (3001) vs Prod (3002)
- **Different .env files**: `.env.development` vs `.env.production`
- **Different PM2 apps**: `metalayer-api-dev` vs `metalayer-api-prod`
- **Different logs**: Separate log files for each
- **Different secrets**: Use different credentials for each

---

## 🔒 Security Checklist

Before starting production:

- [ ] `.env.production` has strong SESSION_SECRET (64+ chars)
- [ ] Production uses different Google OAuth credentials
- [ ] CORS is restricted in production (only production domains)
- [ ] Production uses production database credentials
- [ ] Different secrets for dev and prod
- [ ] Production logs are separate from dev logs

---

## 🎮 Common Commands

```bash
# Start
npm run pm2:start:dev      # Development only
npm run pm2:start:prod      # Production only
npm run pm2:start:all       # Both

# Stop
npm run pm2:stop:dev
npm run pm2:stop:prod

# Restart
npm run pm2:restart:dev
npm run pm2:restart:prod

# Logs
npm run pm2:logs:dev
npm run pm2:logs:prod
npm run pm2:status
```

---

## 🔄 When You Move Production Later

The setup is designed to make migration easy:

1. **Copy `.env.production`** to new server
2. **Update DNS/load balancer** to point to new server
3. **Stop production here**: `npm run pm2:stop:prod`
4. **Start on new server**
5. **Keep development running** here

No code changes needed - just move the `.env.production` file!

---

## 📖 Full Documentation

See `DEPLOYMENT_GUIDE.md` for:
- Detailed setup instructions
- Nginx configuration
- Monitoring setup
- Troubleshooting
- Migration guide

---

## ⚠️ Important Notes

1. **Use different secrets** for dev and prod
2. **Production should use HTTPS** (configure in Nginx)
3. **Monitor both environments** separately
4. **Keep production secrets secure** - never commit `.env.production`
5. **Test production locally** before exposing publicly

---

## 🆘 Troubleshooting

### Port already in use?
```bash
sudo lsof -i :3001  # Check what's using port
sudo lsof -i :3002
```

### Environment not loading?
```bash
# Check which .env file is used
pm2 env metalayer-api-prod | grep NODE_ENV

# Verify files exist
ls -la .env.*
```

### Wrong environment?
```bash
# Restart with correct environment
pm2 restart metalayer-api-prod --update-env
```

---

**Ready to deploy?** Run `./scripts/setup-env-files.sh` and follow the steps above!






