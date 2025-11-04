#!/bin/bash

echo "================================"
echo "📦 Loading Environment Variables"
echo "================================"

if [ -f .env ]; then
  echo ""
  
  # Load and display env vars
  while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ ! $key =~ ^[[:space:]]*# ]] && [[ -n $key ]]; then
      # Remove quotes and whitespace from value
      value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//" -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
      
      # Export the variable
      export "$key=$value"
      
      # Display variable name (hide sensitive values)
      if [[ $key == *"SECRET"* ]] || [[ $key == *"KEY"* ]] || [[ $key == *"PASSWORD"* ]]; then
        echo "  ✓ $key=***hidden***"
      else
        echo "  ✓ $key=$value"
      fi
    fi
  done < .env
  
  echo ""
  echo "✅ Loaded $(cat .env | grep -v '^#' | grep -v '^[[:space:]]*$' | wc -l | tr -d ' ') environment variables"
else
  echo ""
  echo "⚠️  Warning: .env file not found"
  echo "   Continuing with system environment variables only..."
fi

echo ""
echo "================================"
echo "🚀 Starting Deployment"
echo "================================"

# Get repo name from git remote
REPO_NAME=$(basename -s .git $(git config --get remote.origin.url))

echo ""
echo "📍 Target: /$REPO_NAME/"
echo ""

# Export the web build
echo "📱 Exporting Expo web build..."
npx expo export --platform web --public-url /$REPO_NAME

# Add .nojekyll to prevent Jekyll processing
echo "📝 Adding .nojekyll..."
touch dist/.nojekyll

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