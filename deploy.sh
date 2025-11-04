#!/bin/bash

# Export the web build
npx expo export --platform web

# Add .nojekyll to prevent Jekyll processing
touch dist/.nojekyll

# Deploy to gh-pages branch
npm run deploy