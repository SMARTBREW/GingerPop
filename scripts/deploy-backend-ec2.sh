#!/bin/bash
set -euo pipefail

# Deploy Ginger Pop backend to EC2 (run from repo root on your Mac).
# Requires: SSH key at ~/Downloads/gingerpop-backend.pem, AWS default profile.

EC2_HOST="${EC2_HOST:-43.204.116.1}"
EC2_USER="${EC2_USER:-ubuntu}"
KEY_FILE="${KEY_FILE:-$HOME/Downloads/gingerpop-backend.pem}"
APP_DIR="/var/www/gingerpop-backend"

if [[ -z "$EC2_HOST" ]]; then
  echo "Set EC2_HOST to the instance public IP or DNS name."
  echo "Example: EC2_HOST=1.2.3.4 ./scripts/deploy-backend-ec2.sh"
  exit 1
fi

if [[ ! -f "$KEY_FILE" ]]; then
  echo "SSH key not found: $KEY_FILE"
  exit 1
fi

SSH="ssh -i $KEY_FILE -o StrictHostKeyChecking=accept-new ${EC2_USER}@${EC2_HOST}"

echo "Building backend locally..."
npm run build -w backend

echo "Syncing code to EC2..."
rsync -avz --delete \
  -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=accept-new" \
  --exclude node_modules \
  --exclude .git \
  ./backend/ "${EC2_USER}@${EC2_HOST}:${APP_DIR}/backend/"

echo "Installing dependencies and restarting PM2..."
$SSH "cd ${APP_DIR}/backend && npm install --omit=dev && pm2 restart gingerpop-backend || pm2 start ${APP_DIR}/backend/ecosystem.config.cjs --env production"

echo "Done. Health: curl https://api.gingerpop.in/health"
