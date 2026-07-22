#!/bin/bash
set -euo pipefail

# One-time EC2 bootstrap for Ginger Pop backend.
# Run on the EC2 instance as ubuntu after first SSH login.

APP_DIR="/var/www/gingerpop-backend"
DOMAIN="api.gingerpop.in"
PORT=4000

echo "==> Updating system..."
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "==> Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx certbot python3-certbot-nginx

echo "==> Installing PM2..."
sudo npm install -g pm2

echo "==> Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "==> Creating app directory..."
sudo mkdir -p "$APP_DIR"
sudo chown -R ubuntu:ubuntu "$APP_DIR"

echo "==> Nginx config..."
sudo tee /etc/nginx/sites-available/gingerpop-backend > /dev/null <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    server_tokens off;

    server_tokens off;
    client_max_body_size 100m;

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_request_buffering off;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/gingerpop-backend /etc/nginx/sites-enabled/gingerpop-backend
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "==> Bootstrap complete."
echo "Next: copy .env to ${APP_DIR}/.env, deploy code, run npm ci && npm run build, pm2 start."
