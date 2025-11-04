# How to run it
Note fetch won't work on web since on web Crypto.digestStringAsync doesn't support MD5
## For web
`npm start` or `npm expo start -c` if wanna clear cache

## For android
`npx expo login` to login your expo account then `npm run tunnel`, QR code will be generated there. Open expo app then scan it.

# How to release
## For web:
`./deploy.sh` then check github pages
## For android:
First add env var:
```
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value [value]
```
Check it: `npm run list`
Then release
```
npm install -g eas-cli
npm run release
```

this will use build.production in `eas.json` as config to build

# How to maintain it
To add env, just add it to `.env` then release, deploy.sh will auto inject it
`npx expo install --fix` to upgrade all packages
`npx expo-doctor` to check
To add routes, modify `_layout.tsx`
