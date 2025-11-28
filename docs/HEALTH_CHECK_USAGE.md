# Health Check Script Usage

**Location:** `scripts/health-check.js`  
**Command:** `npm run health-check`

---

## What It Checks

1. **PM2 Status** - Verifies `metalayer-api` is online
2. **Backend Listening** - Checks if backend responds on port 3002
3. **API Endpoints** - Tests key endpoints:
   - `/api/messages?pageId=test` - Messages API
   - `/auth/debug` - Auth debug endpoint
4. **Environment Variables** - Verifies required vars are set:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

---

## Usage

### Run Health Check
```bash
npm run health-check
```

### Expected Output (Success)
```
🏥 Starting health check...

1️⃣  Checking PM2 status...
   ✅ PM2: metalayer-api is online

2️⃣  Checking if backend is listening on port 3002...
   ✅ Backend is responding on port 3002

3️⃣  Checking API endpoints...
   ✅ Messages API: OK (200)
   ✅ Auth Debug: OK (200)

4️⃣  Checking environment variables...
   ✅ SUPABASE_URL: Set
   ✅ SUPABASE_ANON_KEY: Set

==================================================
📊 Health Check Summary
==================================================
✅ Passed: 6
❌ Failed: 0

✅ All checks passed! System is healthy.
```

---

## Exit Codes

- **0** - All checks passed
- **1** - One or more checks failed

---

## Use Cases

### Pre-Deployment
Run before deploying to catch issues early:
```bash
npm run health-check && npm run build:presence
```

### CI/CD Integration
Add to your CI pipeline:
```yaml
- name: Health Check
  run: npm run health-check
```

### Monitoring
Set up cron job to run periodically:
```bash
# Run every 5 minutes
*/5 * * * * cd /path/to/metalayer-initiative && npm run health-check >> /var/log/health-check.log 2>&1
```

---

## Troubleshooting

### "Backend not responding"
- Check if PM2 process is running: `pm2 status`
- Check backend logs: `pm2 logs metalayer-api`
- Verify port 3002 is not blocked

### "Missing env vars"
- Ensure `.env` file exists in project root
- Check that variables are set (not empty)
- Verify `.env` file is readable

### "PM2: metalayer-api not online"
- Start the backend: `pm2 restart metalayer-api`
- Check PM2 logs for errors
- Verify ecosystem.config.js is correct

---

*Created: 2025-01-25*

