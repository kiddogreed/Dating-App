@echo off
REM 🚀 Matchmaking App - Production Deployment Script (Windows)
REM This script automates the deployment process

echo ==================================
echo 🚀 Matchmaking App Deployment
echo ==================================
echo.

REM Step 1: Check if we're in the right directory
echo 📂 Checking directory...
if not exist "package.json" (
    echo ✗ package.json not found. Are you in the matchmaking-app directory?
    exit /b 1
)
echo ✓ In correct directory
echo.

REM Step 2: Run build test
echo 🏗️  Testing production build...
call npm run build
if errorlevel 1 (
    echo ✗ Build failed! Fix errors before deploying.
    exit /b 1
)
echo ✓ Build successful
echo.

REM Step 3: Environment variables reminder
echo 🔐 Environment Variables Check
echo Make sure you have configured all environment variables in Vercel:
echo   - DATABASE_URL
echo   - NEXTAUTH_SECRET
echo   - NEXTAUTH_URL
echo   - CLOUDINARY credentials
echo   - STRIPE credentials
echo.
set /p env_configured="Have you configured all environment variables in Vercel? (y/n): "
if /i not "%env_configured%"=="y" (
    echo Please configure environment variables first
    echo Visit: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
    exit /b 0
)
echo ✓ Environment variables confirmed
echo.

REM Step 4: Check if Vercel CLI is installed
echo 🔧 Checking Vercel CLI...
where vercel >nul 2>nul
if errorlevel 1 (
    echo ⚠ Vercel CLI not found
    set /p install_vercel="Do you want to install it? (y/n): "
    if /i "%install_vercel%"=="y" (
        npm install -g vercel
        echo ✓ Vercel CLI installed
    ) else (
        echo ✗ Vercel CLI required for deployment
        exit /b 1
    )
) else (
    echo ✓ Vercel CLI found
)
echo.

REM Step 5: Git operations
echo 📝 Git status check...
git status
echo.
set /p git_commit="Do you want to commit and push changes? (y/n): "
if /i "%git_commit%"=="y" (
    git add .
    set /p commit_msg="Enter commit message: "
    git commit -m "%commit_msg%"
    git push
    echo ✓ Pushed to GitHub
)
echo.

REM Step 6: Deploy to Vercel
echo 🌐 Ready to deploy to Vercel...
set /p deploy_prod="Deploy to production? (y/n): "
if /i "%deploy_prod%"=="y" (
    vercel --prod
    if errorlevel 1 (
        echo ✗ Deployment failed
        exit /b 1
    )
    echo.
    echo ==================================
    echo 🎉 Deployment Complete!
    echo ==================================
    echo.
    echo Next steps:
    echo 1. Visit your Vercel dashboard to get the URL
    echo 2. Test your deployment
    echo 3. Configure Stripe webhooks if not done
    echo 4. Monitor logs for any issues
    echo.
) else (
    echo ⚠ Deployment cancelled
)

echo 🏁 Script finished
pause
