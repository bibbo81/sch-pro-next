#!/bin/bash
##
## Test API Tracking Endpoint
## Usage: ./scripts/test-api-tracking.sh [tracking_number]
##

# Configuration
API_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
TRACKING_NUMBER="${1:-MSCU1234567}"

echo "=================================================="
echo "Testing Tracking API Endpoint"
echo "=================================================="
echo "API URL: $API_URL/api/tracking/track"
echo "Tracking Number: $TRACKING_NUMBER"
echo ""

# Test endpoint (requires authentication in production)
curl -X POST "$API_URL/api/tracking/track" \
  -H "Content-Type: application/json" \
  -d "{
    \"tracking_number\": \"$TRACKING_NUMBER\",
    \"force_refresh\": true
  }" \
  -w "\n\nStatus Code: %{http_code}\nResponse Time: %{time_total}s\n" \
  | jq . 2>/dev/null || cat

echo ""
echo "=================================================="
echo "Test completed"
echo "=================================================="
