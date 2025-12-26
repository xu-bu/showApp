#!/bin/bash
# Get repo name from git remote
REPO_NAME=$(basename -s .git $(git config --get remote.origin.url))

echo ""
echo "📍 Target: /$REPO_NAME/"
echo ""

# Export the web build
echo "📱 Exporting Expo web build..."
npx expo export --platform web

# Deploy to gh-pages branch
echo "🌐 Deploying to GitHub Pages..."
npm run deploy

echo ""
echo "================================"
echo "✅ Deployment Complete!"
echo "================================"
echo "🔗 Your site will be available at:"
echo "   https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/' | cut -d'/' -f1).github.io/$REPO_NAME/"
echo ""