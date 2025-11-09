# Legacy Servers Archive

This directory contains legacy server files that have been consolidated into `app.js`.

## Archived Files

- `canopi2-server.js` - Legacy server (port 3003). All routes moved to `app.js` (port 3002)
- `start-canopi2-server.sh` - Startup script for canopi2-server
- `deploy-canopi2.sh` - Deployment script for canopi2-server
- `run_canopi_server.sh` - Alternative startup script
- `start-server.sh` - Simple startup script

## Migration Date
2025-11-05

## Reason for Archive
All functionality from `canopi2-server.js` has been migrated to `app.js`:
- `/share-message` route
- `/v1/posts/:id/share` endpoint
- All other API endpoints

The main server is now `app.js` running on port 3002, managed by PM2 as `metalayer-api`.






