#!/bin/bash
set -euo pipefail

# Run on EC2 after api.gingerpop.in DNS has propagated.
# ssh -i ~/Downloads/gingerpop-backend.pem ubuntu@<EC2_PUBLIC_IP> 'bash -s' < scripts/ec2-install-ssl.sh

DOMAIN="api.gingerpop.in"
EMAIL="${CERTBOT_EMAIL:-tech@smartbrew.in}"

echo "Checking DNS for ${DOMAIN}..."
IP=$(dig +short A "${DOMAIN}" @8.8.8.8 | tail -1)
if [[ -z "$IP" ]]; then
  echo "DNS not ready yet. Point Hostinger nameservers to Route 53 first."
  exit 1
fi
echo "DNS resolves to: $IP"

sudo certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "${EMAIL}" --redirect
curl -s "https://${DOMAIN}/health"
echo
echo "SSL installed for https://${DOMAIN}"
