#!/bin/bash

# 🚀 Matchmaking App - Production Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "=================================="
echo "🚀 Matchmaking App Deployment"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Step 1: Check if we're in the right directory
echo "📂 Checking directory..."
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the matchmaking-app directory?"
    exit 1
fi
print_success "In correct directory"
echo ""

# Step 2: Check for uncommitted changes
echo "🔍 Checking for uncommitted changes..."
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    print_warning "You have uncommitted changes"
    read -p "Do you want to commit them now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        print_success "Changes committed"
    fi
else
    print_success "No uncommitted changes"
fi
echo ""

# Step 3: Run build test
echo "🏗️  Testing production build..."
if npm run build; then
    print_success "Build successful"
else
    print_error "Build failed! Fix errors before deploying."
    exit 1
fi
echo ""

# Step 4: Ask about environment variables
echo "🔐 Environment Variables Check"
print_warning "Make sure you have configured all environment variables in Vercel:"
echo "  - DATABASE_URL"
echo "  - NEXTAUTH_SECRET"
echo "  - NEXTAUTH_URL"
echo "  - CLOUDINARY credentials"
echo "  - STRIPE credentials"
echo ""
read -p "Have you configured all environment variables in Vercel? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Please configure environment variables first"
    echo "Visit: https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
    exit 0
fi
print_success "Environment variables confirmed"
echo ""

# Step 5: Check if Vercel CLI is installed
echo "🔧 Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found"
    read -p "Do you want to install it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g vercel
        print_success "Vercel CLI installed"
    else
        print_error "Vercel CLI required for deployment"
        exit 1
    fi
else
    print_success "Vercel CLI found"
fi
echo ""

# Step 6: Push to git
echo "⬆️  Pushing to GitHub..."
if git push; then
    print_success "Pushed to GitHub"
else
    print_warning "Git push failed or not configured"
fi
echo ""

# Step 7: Deploy to Vercel
echo "🌐 Deploying to Vercel..."
read -p "Deploy to production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if vercel --prod; then
        print_success "Deployment successful!"
        echo ""
        echo "=================================="
        echo "🎉 Deployment Complete!"
        echo "=================================="
        echo ""
        echo "Next steps:"
        echo "1. Visit your Vercel dashboard to get the URL"
        echo "2. Test your deployment"
        echo "3. Configure Stripe webhooks if not done"
        echo "4. Monitor logs for any issues"
        echo ""
    else
        print_error "Deployment failed"
        exit 1
    fi
else
    print_warning "Deployment cancelled"
fi

echo "🏁 Script finished"
