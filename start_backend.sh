#!/usr/bin/env bash
set -euo pipefail

# Simple backend startup helper
# - Frees port 3002
# - Runs npm install if node_modules is missing
# - Runs Prisma generate if schema exists
# - Starts the server with node app.js

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=3002

cd "$ROOT_DIR"

echo "[start_backend] Working dir: $ROOT_DIR"

# Load environment from .env if present (simple parser: KEY=VALUE lines only)
if [ -f .env ]; then
  echo "[start_backend] Loading environment from .env"
  # Export lines of the form KEY=VALUE (no spaces), ignore comments
  while IFS='=' read -r key value; do
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    export "$key"="$value"
  done < <(grep -E '^[A-Za-z_][A-Za-z0-9_]*=.*' .env)
fi

echo "[start_backend] Freeing port $PORT if occupied..."
free_port() {
  local tries=0
  while [ $tries -lt 5 ]; do
    local pids=""
    if command -v lsof >/dev/null 2>&1; then
      pids=$(lsof -iTCP:$PORT -sTCP:LISTEN -t || true)
    elif command -v fuser >/dev/null 2>&1; then
      pids=$(fuser -n tcp $PORT 2>/dev/null || true)
    fi
    if [ -z "$pids" ]; then
      echo "[start_backend] Port $PORT is free."
      return 0
    fi
    echo "[start_backend] Killing PIDs on $PORT: $pids"
    kill -9 $pids || true
    sleep 0.5
    tries=$((tries+1))
  done
  echo "[start_backend] Port $PORT cleanup attempted $tries times."
}
free_port

if [ ! -d node_modules ]; then
  echo "[start_backend] Installing dependencies (npm install)"
  npm install --silent
else
  echo "[start_backend] node_modules present; skipping npm install"
fi

if [ -f prisma/schema.prisma ]; then
  echo "[start_backend] Running Prisma generate"
  npx prisma generate >/dev/null 2>&1 || npx prisma generate
else
  echo "[start_backend] No prisma/schema.prisma found; skipping prisma generate"
fi

echo "[start_backend] Preparing PM2 management for app.js on port $PORT"

# Stop legacy canopi2-server under PM2 if present
if command -v pm2 >/dev/null 2>&1; then
  echo "[start_backend] PM2 detected. Stopping legacy processes if any..."
  pm2 stop canopi2-server >/dev/null 2>&1 || true
  pm2 delete canopi2-server >/dev/null 2>&1 || true
  pm2 stop metalayer-api >/dev/null 2>&1 || true
  pm2 delete metalayer-api >/dev/null 2>&1 || true
else
  echo "[start_backend] PM2 not found. Installing globally (requires npm)"
  npm i -g pm2 >/dev/null 2>&1 || npm i -g pm2
fi

# Ensure port is free after PM2 stops
free_port

echo "[start_backend] Starting app.js under PM2 as metalayer-api on $PORT"
PORT=$PORT NODE_ENV=${NODE_ENV:-production} pm2 start app.js --name metalayer-api --update-env

echo "[start_backend] Saving PM2 process list"
pm2 save || true

echo "[start_backend] Verifying listener on $PORT"
sleep 1
if command -v lsof >/dev/null 2>&1; then
  lsof -iTCP:$PORT -sTCP:LISTEN -n -P || true
fi

echo "[start_backend] Health check: GET /"
set +e
curl -s -i "http://127.0.0.1:$PORT/" | sed -n '1,5p'
set -e

echo "[start_backend] Done. Use: pm2 status; pm2 logs metalayer-api --lines 50"


