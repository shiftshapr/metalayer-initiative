# Nginx Configuration Update for canopi.live

## File to Edit
```bash
sudo nano /etc/nginx/sites-available/canopi.live
```

## Add This Location Block

Add the `/timelines` location block **BEFORE** the main `location /` block (around line 8, before line 9).

**Insert after line 7** (after the comment `# Serve static files from public directory`):

```nginx
    # Timeline route - proxy to Express app on port 3002
    location /timelines {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Timeline route with trailing slash
    location /timelines/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
```

## Steps

1. **Edit the file:**
   ```bash
   sudo nano /etc/nginx/sites-available/canopi.live
   ```

2. **Go to line 8** (after the comment `# Serve static files from public directory`)

3. **Press Enter** to create a new line

4. **Paste the location blocks above**

5. **Save:** `Ctrl+O`, then `Enter`, then `Ctrl+X`

6. **Test configuration:**
   ```bash
   sudo nginx -t
   ```

7. **Reload nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

## Result

After this update, the timeline will be accessible at:
- `https://canopi.live/timelines`
- `https://canopi.live/timelines/`
- `https://canopi.live/timelines/index.html`

## Note

The `/timelines` location must be **before** the main `location /` block so nginx matches it first. The main `location /` proxies to port 3003, but `/timelines` needs to go to port 3002 (Express backend).

