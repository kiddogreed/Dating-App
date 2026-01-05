#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================="
echo "Matchmaking App - API Health Check"
echo "=================================="
echo ""

BASE_URL="http://localhost:3000"

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=$4
    
    echo -n "Testing $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$endpoint")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $response)"
    fi
}

echo "Public Endpoints:"
echo "-----------------"
test_endpoint "GET" "/" "Landing page" "200"
test_endpoint "GET" "/login" "Login page" "200"
test_endpoint "GET" "/register" "Register page" "200"
test_endpoint "GET" "/pricing" "Pricing page" "200"

echo ""
echo "Testing Endpoints (should work):"
echo "---------------------------------"
test_endpoint "GET" "/api/testing/stats" "Database stats" "200"
test_endpoint "GET" "/api/stripe/test" "Stripe connection" "200"

echo ""
echo "Protected Endpoints (should be 401):"
echo "-------------------------------------"
test_endpoint "GET" "/api/discover" "Discover API" "401"
test_endpoint "GET" "/api/matches" "Matches API" "401"
test_endpoint "GET" "/api/messages" "Messages API" "401"
test_endpoint "GET" "/api/profile" "Profile API" "401"
test_endpoint "GET" "/api/subscription/status" "Subscription status" "401"

echo ""
echo "Database Seeding:"
echo "-----------------"
echo -n "Creating 5 test users... "
response=$(curl -s -X POST "$BASE_URL/api/testing/seed-users" \
    -H "Content-Type: application/json" \
    -d '{"count": 5}')

if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "$response" | grep -o '"users":[0-9]*'
else
    echo -e "${RED}✗ FAIL${NC}"
fi

echo ""
echo "Getting updated stats:"
echo "----------------------"
curl -s "$BASE_URL/api/testing/stats" | python3 -m json.tool 2>/dev/null || curl -s "$BASE_URL/api/testing/stats"

echo ""
echo "=================================="
echo "Health check complete!"
echo "=================================="
