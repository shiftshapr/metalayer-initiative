# Investigation: Backend Process Spawning

## Problem
User reported finding 5 processes on port 3002 when running `start_backend.sh`, even though they didn't run the script multiple times.

## Root Cause Identified

### PM2 Autorestart is Enabled
- PM2 dump file shows `"autorestart": true` and `"autostart": true`
- The `--no-autorestart` flag in `start_backend.sh` **does not work reliably** in PM2 6.0.5
- When the backend process crashes or exits, PM2 automatically restarts it
- If `start_backend.sh` runs while PM2 is restarting, it can spawn duplicate processes

### Two PM2 Daemons Detected
- Root PM2 daemon: `/root/.pm2` (no apps currently)
- Ubuntu PM2 daemon: `/home/ubuntu/.pm2` (managing metalayer-api)
- Both daemons running simultaneously could cause conflicts

## Current State
- ✅ Only 1 process currently listening on port 3002 (PID 899345)
- ✅ Only 1 PM2 instance for metalayer-api
- ⚠️ PM2 autorestart is still enabled in dump file
- ⚠️ `--no-autorestart` flag doesn't work

## Fix Applied

### Modified `start_backend.sh`:
1. **Explicitly disable autorestart** using `pm2 set metalayer-api autorestart false` after starting
2. **Verify autorestart is disabled** by checking PM2's JSON output
3. **Better error handling** if autorestart cannot be disabled

### Why This Happens:
- PM2's `--no-autorestart` flag is not reliable in all versions
- PM2 defaults to `autorestart: true` for all processes
- When autorestart is enabled and a process crashes, PM2 spawns a new instance
- Running `start_backend.sh` during a restart can create duplicates

## Prevention Strategy

1. **Always disable autorestart** explicitly after starting
2. **Always delete PM2 process** before starting (already implemented)
3. **Check for existing processes** on port 3002 before starting (already implemented)
4. **Monitor PM2 logs** for restart patterns

## Testing

After applying the fix:
1. Run `start_backend.sh`
2. Check `pm2 describe metalayer-api` - autorestart should be `false`
3. Kill the process manually: `pm2 delete metalayer-api`
4. Verify PM2 does NOT restart it automatically
5. Run `start_backend.sh` again - should only create 1 process

## Additional Notes

- The `ecosystem.config.js` file has `autorestart: true`, but `start_backend.sh` doesn't use it
- Consider updating `ecosystem.config.js` to `autorestart: false` for consistency
- The root PM2 daemon doesn't have any apps, so it's not causing the issue currently



