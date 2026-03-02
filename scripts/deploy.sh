#!/bin/bash
# Deploy Crewly portal to production
set -euo pipefail

DEPLOY_DIR="/home/jons-openclaw/crewly-landing"
APP_NAME="crewly-portal"

echo "=== Crewly Portal Deploy ==="
echo "Time: $(date)"

cd "$DEPLOY_DIR"

# Pull latest
echo "Pulling latest from main..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build
echo "Building production bundle..."
npm run build

# Restart with PM2 (or start if not running)
echo "Restarting $APP_NAME..."
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    pm2 restart "$APP_NAME"
else
    pm2 start npm --name "$APP_NAME" -- start
fi

echo "=== Deployed at $(date) ==="
pm2 status "$APP_NAME"
