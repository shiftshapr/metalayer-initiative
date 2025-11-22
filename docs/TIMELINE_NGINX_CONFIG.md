# Timeline Nginx Configuration

## Issue
The timeline page is accessible via direct IP:port (`http://216.238.91.120:3002/timelines`) but returns 404 on `https://app.themetalayer.org/timelines` because nginx is routing to Next.js instead of the Express backend.

## Current Setup
- Express backend: `http://216.238.91.120:3002`
- Next.js frontend: `https://app.themetalayer.org` (via nginx)
- Timeline route: `/timelines` (configured in `app.js`)

## Solution: Nginx Proxy Configuration

Add the following to your nginx configuration for `app.themetalayer.org`:

```nginx
# Proxy /timelines to Express backend
location /timelines {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# Also proxy timeline static assets
location /timelines/ {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Alternative: Use Different Subdomain

If you prefer to keep Next.js and Express separate, you could:
- Use `https://api.themetalayer.org/timelines` for the timeline
- Or create `https://timeline.themetalayer.org` pointing to the Express backend

## Testing

After updating nginx:
1. Test locally: `curl -I http://localhost:3002/timelines` (should return 200)
2. Test via nginx: `curl -I https://app.themetalayer.org/timelines` (should return 200)
3. Reload nginx: `sudo nginx -t && sudo systemctl reload nginx`

## Current Working URLs

- Direct Express: `http://216.238.91.120:3002/timelines` ✅
- Via nginx (needs config): `https://app.themetalayer.org/timelines` ❌ (404)

