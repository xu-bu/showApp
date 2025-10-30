# How to run it
Note fetch won't work on web since on web Crypto.digestStringAsync doesn't support MD5
## For web
`npx expo start` or `npm expo start -c` if wanna clear cache

## For android
`npx expo login` to login your expo account then `npm run tunnel`, QR code will be generated there. Open expo app then scan it.

# How to release
First add env var
```
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value [value]
eas env:list production
```
To delete: `eas env:delete`

'''
npm install -g eas-cli
eas build --platform android --profile production
'''

this will use build.production in `eas.json` as config to build

# How to maintain it
`npx expo install --fix` to upgrade all packages
`npx expo-doctor` to check
To add routes, modify `_layout.tsx`
