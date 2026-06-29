#!/bin/bash
set -euo pipefail

BUCKET_NAME="gingerpop-website"
REGION="ap-south-1"
DISTRIBUTION_ID="E10IS5J65HID2H"
OUT_DIR="frontend/out"

echo "Building static frontend..."
npm run build:static -w frontend

if [ ! -d "$OUT_DIR" ]; then
  echo "Missing $OUT_DIR — run NEXT_STATIC_EXPORT=1 npm run build -w frontend"
  exit 1
fi

echo "Uploading HTML (no cache)..."
aws s3 sync "$OUT_DIR/" "s3://${BUCKET_NAME}/" \
  --exclude "*" \
  --include "*.html" \
  --cache-control "no-cache,no-store,must-revalidate" \
  --content-type "text/html" \
  --metadata-directive REPLACE \
  --delete \
  --region "$REGION"

echo "Uploading Next.js static assets (1 year)..."
aws s3 sync "$OUT_DIR/_next/" "s3://${BUCKET_NAME}/_next/" \
  --cache-control "max-age=31536000,public,immutable" \
  --metadata-directive REPLACE \
  --delete \
  --region "$REGION"

echo "Uploading remaining files..."
aws s3 sync "$OUT_DIR/" "s3://${BUCKET_NAME}/" \
  --exclude "*.html" \
  --exclude "_next/*" \
  --cache-control "max-age=86400,public" \
  --metadata-directive REPLACE \
  --delete \
  --region "$REGION"

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --query 'Invalidation.{Id:Id,Status:Status}' \
  --output json

echo ""
echo "Deployment complete!"
echo "Site: https://gingerpop.in"
echo "CloudFront: https://d2tztotlp2q6g7.cloudfront.net"
