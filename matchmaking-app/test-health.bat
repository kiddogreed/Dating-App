@echo off
echo ==================================
echo Matchmaking App - API Health Check
echo ==================================
echo.

set BASE_URL=http://localhost:3000

echo Public Endpoints:
echo -----------------
echo Testing Landing page...
curl -s -o nul -w "HTTP %%{http_code}" %BASE_URL%/
echo.

echo Testing Login page...
curl -s -o nul -w "HTTP %%{http_code}" %BASE_URL%/login
echo.

echo Testing Register page...
curl -s -o nul -w "HTTP %%{http_code}" %BASE_URL%/register
echo.

echo Testing Pricing page...
curl -s -o nul -w "HTTP %%{http_code}" %BASE_URL%/pricing
echo.
echo.

echo Testing Endpoints:
echo ------------------
echo Testing Database stats...
curl -s %BASE_URL%/api/testing/stats | findstr "success"
echo.

echo Testing Stripe connection...
curl -s %BASE_URL%/api/stripe/test | findstr "success"
echo.
echo.

echo Protected Endpoints (should return Unauthorized):
echo --------------------------------------------------
echo Testing Discover API...
curl -s %BASE_URL%/api/discover
echo.

echo Testing Matches API...
curl -s %BASE_URL%/api/matches
echo.

echo Testing Messages API...
curl -s %BASE_URL%/api/messages
echo.
echo.

echo Database Statistics:
echo --------------------
curl -s %BASE_URL%/api/testing/stats
echo.
echo.

echo ==================================
echo Health check complete!
echo ==================================
echo.
echo Test user credentials:
echo Email: evelyn.hernandez0@test.com
echo Password: password123
echo.
pause
