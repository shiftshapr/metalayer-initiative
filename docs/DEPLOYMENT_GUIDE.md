# Deployment Guide: Development + Production in Same Environment

**Date**: 2025-01-24  
**Status**: Temporary setup (production will move to separate environment)

---

## Overview

This guide explains how to safely run both **development** and **production** environments on the same server, with proper separation and security.

---

## Architecture

### Port Allocation
- **Development**: Port `3001` (or `3002`)
- **Production**: Port `3002` (or `3003`)
- **Presence Extension**: Uses production API

### Environment Files
- **Development**: `.env.development`
- **Production**: `.env.production`

### Process Management
- **Development**: `npm run dev` (nodemon) or PM2 with `NODE_ENV=development`
- **Production**: PM2 with `NODE_ENV=production`

---

## Setup Instructions

### 1. Create Environment Files

#### `.env.development`
```bash
# Development Environment
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Required (use development/test credentials)
SESSION_SECRET=<dev-secret-32-chars-min>
GOOGLE_CLIENT_ID=<dev-google-client-id>
GOOGLE_CLIENT_SECRET=<dev-google-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# CORS - Development (more permissive for local testing)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173,http://216.238.91.120:3000

# Optional
SUPABASE_URL=<dev-supabase-url>
SUPABASE_ANON_KEY=<dev-supabase-key>
DEEPSEEK_API_KEY=<dev-deepseek-key>
```

#### `.env.production`
```bash
# Production Environment
NODE_ENV=production
PORT=3002
HOST=0.0.0.0

# Required (use production credentials - STRONG SECRETS!)
SESSION_SECRET=<production-secret-64-chars-recommended>
GOOGLE_CLIENT_ID=<production-google-client-id>
GOOGLE_CLIENT_SECRET=<production-google-client-secret>
GOOGLE_CALLBACK_URL=https://app.themetalayer.org/auth/google/callback

# CORS - Production (restrictive)
ALLOWED_ORIGINS=https://app.themetalayer.org,https://themetalayer.org,chrome-extension://<extension-id>

# Optional
SUPABASE_URL=<production-supabase-url>
SUPABASE_ANON_KEY=<production-supabase-key>
DEEPSEEK_API_KEY=<production-deepseek-key>
```

### 2. Update app.js to Support Environment-Specific .env Files

The current setup uses `require('dotenv').config()` which loads `.env` by default. We need to support environment-specific files.

**Option A: Manual Selection (Recommended for now)**
```bash
# Development
NODE_ENV=development node -r dotenv/config app.js dotenv_config_path=.env.development

# Production
NODE_ENV=production node -r dotenv/config app.js dotenv_config_path=.env.production
```

**Option B: Auto-detect from NODE_ENV**
We can update the code to auto-load the right file.

### 3. Update PM2 Configuration

Update `ecosystem.config.js` to support both environments:

```javascript
module.exports = {
  apps: [
    {
      name: 'metalayer-api-dev',
      script: 'app.js',
      cwd: '/home/ubuntu/metalayer-initiative',
      env_file: '.env.development',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      error_file: '/tmp/pm2-metalayer-api-dev-error.log',
      out_file: '/tmp/pm2-metalayer-api-dev-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      instances: 1
    },
    {
      name: 'metalayer-api-prod',
      script: 'app.js',
      cwd: '/home/ubuntu/metalayer-initiative',
      env_file: '.env.production',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/tmp/pm2-metalayer-api-prod-error.log',
      out_file: '/tmp/pm2-metalayer-api-prod-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      instances: 1 // Can increase for production
    }
  ]
};
```

### 4. Update package.json Scripts

Add convenient scripts:

```json
{
  "scripts": {
    "start": "node app.js",
    "start:dev": "NODE_ENV=development node -r dotenv/config app.js dotenv_config_path=.env.development",
    "start:prod": "NODE_ENV=production node -r dotenv/config app.js dotenv_config_path=.env.production",
    "dev": "nodemon --exec 'node -r dotenv/config app.js dotenv_config_path=.env.development'",
    "pm2:start:dev": "pm2 start ecosystem.config.js --only metalayer-api-dev",
    "pm2:start:prod": "pm2 start ecosystem.config.js --only metalayer-api-prod",
    "pm2:start:all": "pm2 start ecosystem.config.js",
    "pm2:stop:dev": "pm2 stop metalayer-api-dev",
    "pm2:stop:prod": "pm2 stop metalayer-api-prod",
    "pm2:restart:dev": "pm2 restart metalayer-api-dev",
    "pm2:restart:prod": "pm2 restart metalayer-api-prod"
  }
}
```

---

## Running Both Environments

### Start Development
```bash
npm run pm2:start:dev
# or
npm run dev  # for development with auto-reload
```

### Start Production
```bash
npm run pm2:start:prod
```

### Start Both
```bash
npm run pm2:start:all
```

### Check Status
```bash
pm2 status
pm2 logs metalayer-api-dev
pm2 logs metalayer-api-prod
```

---

## Security Considerations

### ✅ DO:
- Use **different secrets** for dev and production
- Use **different Google OAuth credentials** (separate OAuth apps)
- Use **different database credentials** if possible
- Restrict CORS in production
- Use strong SESSION_SECRET in production (64+ chars)
- Monitor both environments separately
- Use different log files

### ❌ DON'T:
- Share secrets between environments
- Use production credentials in development
- Allow development CORS in production
- Run production with debug logging enabled
- Expose development endpoints publicly

---

## Nginx Configuration (if using reverse proxy)

### Development
```nginx
server {
    listen 80;
    server_name dev.themetalayer.org;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Production
```nginx
server {
    listen 443 ssl;
    server_name app.themetalayer.org;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Monitoring & Logs

### Development Logs
```bash
pm2 logs metalayer-api-dev --lines 100
tail -f /tmp/pm2-metalayer-api-dev-out.log
```

### Production Logs
```bash
pm2 logs metalayer-api-prod --lines 100
tail -f /tmp/pm2-metalayer-api-prod-out.log
```

### Health Checks
```bash
# Development
curl http://localhost:3001/

# Production
curl http://localhost:3002/
```

---

## Migration Path (When Moving Production)

### Step 1: Prepare New Production Server
1. Set up new server with same configuration
2. Copy `.env.production` to new server
3. Update DNS/load balancer to point to new server
4. Test new production server

### Step 2: Migrate
1. Stop production on current server: `pm2 stop metalayer-api-prod`
2. Update DNS/load balancer
3. Start production on new server
4. Monitor for issues

### Step 3: Cleanup
1. Remove production from old server
2. Keep development running
3. Archive old production logs

---

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :3001
sudo lsof -i :3002

# Kill process if needed
kill -9 <PID>
```

### Environment Variables Not Loading
```bash
# Check which .env file is being used
pm2 env metalayer-api-dev
pm2 env metalayer-api-prod

# Verify .env files exist
ls -la .env.*
```

### Wrong Environment Running
```bash
# Check NODE_ENV
pm2 env metalayer-api-prod | grep NODE_ENV

# Restart with correct environment
pm2 restart metalayer-api-prod --update-env
```

---

## Checklist Before Production Deployment

- [ ] `.env.production` file created with all required variables
- [ ] Strong SESSION_SECRET (64+ characters)
- [ ] Production Google OAuth credentials configured
- [ ] CORS properly restricted for production
- [ ] Different ports for dev and prod
- [ ] PM2 configured for both environments
- [ ] Logs separated
- [ ] Monitoring set up
- [ ] Health checks working
- [ ] Security validation passed

---

## Quick Reference

```bash
# Start development
npm run pm2:start:dev

# Start production
npm run pm2:start:prod

# View logs
pm2 logs

# Restart production
npm run pm2:restart:prod

# Stop production
npm run pm2:stop:prod

# Check status
pm2 status
```

---

*Last Updated: 2025-01-24*






